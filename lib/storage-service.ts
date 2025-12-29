// Keys for local storage
const STORAGE_PREFIX = "conjugate-fitness"
const TARGET_WEIGHTS_KEY = `${STORAGE_PREFIX}-target-weights`
const COMPLETED_SETS_KEY = `${STORAGE_PREFIX}-completed-sets`
const LOGGED_WEIGHTS_KEY = `${STORAGE_PREFIX}-logged-weights`
const PROGRESSION_SCHEMES_KEY = `${STORAGE_PREFIX}-progression-schemes`

// Type definitions
export interface TargetWeights {
  [exerciseId: string]: number
}

export interface CompletedSets {
  [exerciseId: string]: boolean[]
}

export interface LoggedWeights {
  [exerciseId: string]: number[]
}

export interface ProgressionSchemes {
  [exerciseId: string]: string
}

// Cache for in-memory storage to reduce localStorage operations
const memoryCache: {
  targetWeights?: TargetWeights
  completedSets?: CompletedSets
  loggedWeights?: LoggedWeights
  progressionSchemes?: ProgressionSchemes
} = {}

// Get target weights from local storage
export function getTargetWeights(): TargetWeights {
  if (typeof window === "undefined") return {}

  // Return from memory cache if available
  if (memoryCache.targetWeights) {
    return { ...memoryCache.targetWeights }
  }

  try {
    const item = localStorage.getItem(TARGET_WEIGHTS_KEY)
    if (!item) return {}

    const parsed = JSON.parse(item) as TargetWeights
    memoryCache.targetWeights = parsed
    return { ...parsed }
  } catch (error) {
    console.error(`Error reading from localStorage (${TARGET_WEIGHTS_KEY}):`, error)
    return {}
  }
}

// Save target weight for an exercise
export function saveTargetWeight(exerciseId: string, weight: number): void {
  if (typeof window === "undefined") return

  try {
    const targetWeights = getTargetWeights()
    targetWeights[exerciseId] = weight

    // Update memory cache
    memoryCache.targetWeights = targetWeights

    // Save to localStorage
    localStorage.setItem(TARGET_WEIGHTS_KEY, JSON.stringify(targetWeights))
  } catch (error) {
    console.error(`Error writing to localStorage (${TARGET_WEIGHTS_KEY}):`, error)
  }
}

// Get progression schemes from local storage
export function getProgressionSchemes(): ProgressionSchemes {
  if (typeof window === "undefined") return {}

  // Return from memory cache if available
  if (memoryCache.progressionSchemes) {
    return { ...memoryCache.progressionSchemes }
  }

  try {
    const item = localStorage.getItem(PROGRESSION_SCHEMES_KEY)
    if (!item) return {}

    const parsed = JSON.parse(item) as ProgressionSchemes
    memoryCache.progressionSchemes = parsed
    return { ...parsed }
  } catch (error) {
    console.error(`Error reading from localStorage (${PROGRESSION_SCHEMES_KEY}):`, error)
    return {}
  }
}

// Get progression scheme for an exercise
export function getProgressionScheme(exerciseId: string): string {
  const schemes = getProgressionSchemes()
  return schemes[exerciseId] || "standard"
}

// Save progression scheme for an exercise
export function saveProgressionScheme(exerciseId: string, scheme: string): void {
  if (typeof window === "undefined") return

  try {
    const progressionSchemes = getProgressionSchemes()
    progressionSchemes[exerciseId] = scheme

    // Update memory cache
    memoryCache.progressionSchemes = progressionSchemes

    // Save to localStorage
    localStorage.setItem(PROGRESSION_SCHEMES_KEY, JSON.stringify(progressionSchemes))
  } catch (error) {
    console.error(`Error writing to localStorage (${PROGRESSION_SCHEMES_KEY}):`, error)
  }
}

// Get completed sets from local storage
export function getCompletedSets(): CompletedSets {
  if (typeof window === "undefined") return {}

  // Return from memory cache if available
  if (memoryCache.completedSets) {
    return { ...memoryCache.completedSets }
  }

  try {
    const item = localStorage.getItem(COMPLETED_SETS_KEY)
    if (!item) return {}

    const parsed = JSON.parse(item) as CompletedSets
    memoryCache.completedSets = parsed
    return { ...parsed }
  } catch (error) {
    console.error(`Error reading from localStorage (${COMPLETED_SETS_KEY}):`, error)
    return {}
  }
}

// Save completed set status
export function saveCompletedSet(exerciseId: string, setIndex: number, completed: boolean): void {
  if (typeof window === "undefined") return

  try {
    const completedSets = getCompletedSets()
    if (!completedSets[exerciseId]) {
      completedSets[exerciseId] = []
    }
    completedSets[exerciseId][setIndex] = completed

    // Update memory cache
    memoryCache.completedSets = completedSets

    // Save to localStorage
    localStorage.setItem(COMPLETED_SETS_KEY, JSON.stringify(completedSets))
  } catch (error) {
    console.error(`Error writing to localStorage (${COMPLETED_SETS_KEY}):`, error)
  }
}

// Get logged weights from local storage
export function getLoggedWeights(): LoggedWeights {
  if (typeof window === "undefined") return {}

  // Return from memory cache if available
  if (memoryCache.loggedWeights) {
    return { ...memoryCache.loggedWeights }
  }

  try {
    const item = localStorage.getItem(LOGGED_WEIGHTS_KEY)
    if (!item) return {}

    const parsed = JSON.parse(item) as LoggedWeights
    memoryCache.loggedWeights = parsed
    return { ...parsed }
  } catch (error) {
    console.error(`Error reading from localStorage (${LOGGED_WEIGHTS_KEY}):`, error)
    return {}
  }
}

// Save logged weight for a set
export function saveLoggedWeight(exerciseId: string, setIndex: number, weight: number): void {
  if (typeof window === "undefined") return

  try {
    const loggedWeights = getLoggedWeights()
    if (!loggedWeights[exerciseId]) {
      loggedWeights[exerciseId] = []
    }
    loggedWeights[exerciseId][setIndex] = weight

    // Update memory cache
    memoryCache.loggedWeights = loggedWeights

    // Save to localStorage
    localStorage.setItem(LOGGED_WEIGHTS_KEY, JSON.stringify(loggedWeights))
  } catch (error) {
    console.error(`Error writing to localStorage (${LOGGED_WEIGHTS_KEY}):`, error)
  }
}

// Generate a unique ID for an exercise
export function generateExerciseId(date: string, exerciseTitle: string): string {
  // Create a more specific ID that includes both date and the exact exercise title
  // This ensures each exercise has its own unique storage key
  return `${date}-${exerciseTitle.replace(/\s+/g, "-").toLowerCase()}`
}

// Clear all stored data (for testing/debugging)
export function clearAllStoredData(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(TARGET_WEIGHTS_KEY)
    localStorage.removeItem(COMPLETED_SETS_KEY)
    localStorage.removeItem(LOGGED_WEIGHTS_KEY)
    localStorage.removeItem(PROGRESSION_SCHEMES_KEY)

    // Clear memory cache
    memoryCache.targetWeights = undefined
    memoryCache.completedSets = undefined
    memoryCache.loggedWeights = undefined
    memoryCache.progressionSchemes = undefined
  } catch (error) {
    console.error("Error clearing localStorage:", error)
  }
}

import {
  percentageBasedProgression,
  wendler531Progression,
  texasMethodProgression,
  smolovJrProgression,
} from "@/lib/progression-utils"

// Collection of all available progression schemes
export const progressionSchemes = {
  standard: percentageBasedProgression,
  wendler531: wendler531Progression,
  texasMethod: texasMethodProgression,
  smolovJr: smolovJrProgression,
}

export const StorageService = {
  getTargetWeights,
  saveTargetWeight,
  getProgressionSchemes,
  getProgressionScheme,
  saveProgressionScheme,
  getCompletedSets,
  saveCompletedSet,
  getLoggedWeights,
  saveLoggedWeight,
  generateExerciseId,
  clearAllStoredData,
}
