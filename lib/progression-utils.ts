import { PerformanceMonitor } from "@/lib/performance-monitor"
import { ensureArray, safeLength } from "@/lib/utils/array-utils"
import { errorTracker, ErrorCategory } from "@/lib/error-tracking"

export interface ProgressionStep {
  step: number
  setNumber: number
  percentage: number
  notes: string
}

export interface ProgressionScheme {
  algorithmName: string
  description: string
  targetMetric: string
  progressionSteps: ProgressionStep[]
}

// The standard percentage-based progression (renamed to Standard Load Progression)
export const percentageBasedProgression: ProgressionScheme = {
  algorithmName: "Standard Load Progression",
  description: "Standard Westside Barbell progression for max effort lifts, based on percentage of target weight.",
  targetMetric: "Percentage of Target Weight (e.g., 1RM or Daily Max)",
  progressionSteps: [
    { step: 1, setNumber: 1, percentage: 60, notes: "Warm-up set" },
    { step: 2, setNumber: 2, percentage: 70, notes: "Warm-up set" },
    { step: 3, setNumber: 3, percentage: 78, notes: "Work-up set" },
    { step: 4, setNumber: 4, percentage: 85, notes: "Work-up set" },
    { step: 5, setNumber: 5, percentage: 92, notes: "Near-maximal set" },
    { step: 6, setNumber: 6, percentage: 97, notes: "Near-maximal set" },
    { step: 7, setNumber: 7, percentage: 100, notes: "Target weight attempt" },
  ],
}

// 5/3/1 Basic Template (Jim Wendler)
export const wendler531Progression: ProgressionScheme = {
  algorithmName: "5/3/1 Basic Template",
  description: "Jim Wendler's 5/3/1 progression for main lifts, based on training max (90% of 1RM).",
  targetMetric: "Percentage of Training Max (90% of 1RM)",
  progressionSteps: [
    { step: 1, setNumber: 1, percentage: 65, notes: "Week 1: 5 reps" },
    { step: 2, setNumber: 2, percentage: 75, notes: "Week 1: 5 reps" },
    { step: 3, setNumber: 3, percentage: 85, notes: "Week 1: 5+ reps (AMRAP)" },
    { step: 4, setNumber: 4, percentage: 70, notes: "Week 2: 3 reps" },
    { step: 5, setNumber: 5, percentage: 80, notes: "Week 2: 3 reps" },
    { step: 6, setNumber: 6, percentage: 90, notes: "Week 2: 3+ reps (AMRAP)" },
    { step: 7, setNumber: 7, percentage: 75, notes: "Week 3: 5 reps" },
    { step: 8, setNumber: 8, percentage: 85, notes: "Week 3: 3 reps" },
    { step: 9, setNumber: 9, percentage: 95, notes: "Week 3: 1+ reps (AMRAP)" },
  ],
}

// Texas Method
export const texasMethodProgression: ProgressionScheme = {
  algorithmName: "Texas Method",
  description: "Weekly progression with volume day (Monday), recovery day (Wednesday), and intensity day (Friday).",
  targetMetric: "Percentage of 5RM",
  progressionSteps: [
    { step: 1, setNumber: 1, percentage: 90, notes: "Monday: Volume Day - Set 1 of 5x5" },
    { step: 2, setNumber: 2, percentage: 90, notes: "Monday: Volume Day - Set 2 of 5x5" },
    { step: 3, setNumber: 3, percentage: 90, notes: "Monday: Volume Day - Set 3 of 5x5" },
    { step: 4, setNumber: 4, percentage: 90, notes: "Monday: Volume Day - Set 4 of 5x5" },
    { step: 5, setNumber: 5, percentage: 90, notes: "Monday: Volume Day - Set 5 of 5x5" },
    { step: 6, setNumber: 6, percentage: 80, notes: "Wednesday: Recovery Day - 2x5" },
    { step: 7, setNumber: 7, percentage: 80, notes: "Wednesday: Recovery Day - 2x5" },
    { step: 8, setNumber: 8, percentage: 100, notes: "Friday: Intensity Day - New 5RM" },
  ],
}

// Smolov Jr. Bench Program
export const smolovJrProgression: ProgressionScheme = {
  algorithmName: "Smolov Jr. Bench",
  description: "High volume, high frequency bench press program over 3 weeks.",
  targetMetric: "Percentage of 1RM",
  progressionSteps: [
    { step: 1, setNumber: 1, percentage: 70, notes: "Week 1, Day 1: Set 1 of 6x6" },
    { step: 2, setNumber: 2, percentage: 70, notes: "Week 1, Day 1: Set 2 of 6x6" },
    { step: 3, setNumber: 3, percentage: 70, notes: "Week 1, Day 1: Set 3 of 6x6" },
    { step: 4, setNumber: 4, percentage: 70, notes: "Week 1, Day 1: Set 4 of 6x6" },
    { step: 5, setNumber: 5, percentage: 70, notes: "Week 1, Day 1: Set 5 of 6x6" },
    { step: 6, setNumber: 6, percentage: 70, notes: "Week 1, Day 1: Set 6 of 6x6" },
    { step: 7, setNumber: 7, percentage: 75, notes: "Week 1, Day 2: Set 1 of 7x5" },
    { step: 8, setNumber: 8, percentage: 75, notes: "Week 1, Day 2: Set 2 of 7x5" },
    { step: 9, setNumber: 9, percentage: 75, notes: "Week 1, Day 2: Set 3 of 7x5" },
    { step: 10, setNumber: 10, percentage: 75, notes: "Week 1, Day 2: Set 4 of 7x5" },
    { step: 11, setNumber: 11, percentage: 75, notes: "Week 1, Day 2: Set 5 of 7x5" },
    { step: 12, setNumber: 12, percentage: 75, notes: "Week 1, Day 2: Set 6 of 7x5" },
    { step: 13, setNumber: 13, percentage: 75, notes: "Week 1, Day 2: Set 7 of 7x5" },
  ],
}

// Collection of all available progression schemes
export const progressionSchemes: Record<string, ProgressionScheme> = {
  standard: percentageBasedProgression,
  wendler531: wendler531Progression,
  texasMethod: texasMethodProgression,
  smolovJr: smolovJrProgression,
}

// Cache for calculated weights to prevent recalculation
const weightCache: Record<string, number[]> = {}

// Calculate weights for each set based on target weight
export function calculateProgressionWeights(
  targetWeight: number,
  scheme: ProgressionScheme = percentageBasedProgression,
): number[] {
  try {
    errorTracker.debug(ErrorCategory.CALCULATION, "calculateProgressionWeights called", {
      component: "progression-utils",
      action: "calculateProgressionWeights",
      inputs: {
        targetWeight,
        schemeAlgorithmName: scheme?.algorithmName || "undefined",
      },
    })

    // Check cache first
    const cacheKey = `${targetWeight}-${scheme?.algorithmName || "unknown"}`
    if (weightCache[cacheKey]) {
      PerformanceMonitor.end("calculateProgressionWeights")
      return [...(weightCache[cacheKey] || [])] // Return a copy to prevent mutation
    }

    // Ensure scheme and progressionSteps are valid
    if (!scheme || !scheme.progressionSteps) {
      errorTracker.warning(ErrorCategory.CALCULATION, "Invalid scheme or missing progressionSteps", {
        component: "progression-utils",
        action: "calculateProgressionWeights",
      })
      return []
    }

    // Ensure progressionSteps is an array
    const steps = ensureArray(scheme.progressionSteps)

    errorTracker.debug(ErrorCategory.CALCULATION, "Processing steps", {
      component: "progression-utils",
      action: "calculateProgressionWeights",
      state: {
        stepsLength: safeLength(steps),
      },
    })

    const weights = steps.map((step) => {
      if (!step) return 0
      // Calculate the weight and round to nearest 5
      const exactWeight = (targetWeight * step.percentage) / 100
      return Math.round(exactWeight / 5) * 5
    })

    // Cache the result
    weightCache[cacheKey] = [...weights]

    PerformanceMonitor.end("calculateProgressionWeights")
    return weights
  } catch (error) {
    errorTracker.trackError(ErrorCategory.CALCULATION, error as Error, {
      component: "progression-utils",
      action: "calculateProgressionWeights",
      message: "Error calculating weights",
      inputs: { targetWeight, scheme },
    })
    return []
  }
}

// Cache for max effort checks to prevent recalculation
const maxEffortCache: Record<string, boolean> = {}

// Determine if an exercise is a max effort exercise based on its title and sets
export function isMaxEffortExercise(title: string, setsCount: number): boolean {
  try {
    // Check cache first
    const cacheKey = `${title || ""}-${setsCount}`
    if (maxEffortCache[cacheKey] !== undefined) {
      return maxEffortCache[cacheKey]
    }

    // Check if it's a squat, bench, deadlift, or other main lift with 7 sets
    const maxEffortKeywords = ["squat", "bench", "deadlift", "press", "good morning"]
    const safeTitle = title || ""
    const isMainLift = maxEffortKeywords.some((keyword) => safeTitle.toLowerCase().includes(keyword))
    const result = isMainLift && setsCount === 7

    // Cache the result
    maxEffortCache[cacheKey] = result

    return result
  } catch (error) {
    errorTracker.trackError(ErrorCategory.CALCULATION, error as Error, {
      component: "progression-utils",
      action: "isMaxEffortExercise",
      message: "Error determining if exercise is max effort",
      inputs: { title, setsCount },
    })
    return false
  }
}
