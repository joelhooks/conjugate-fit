import { progressionSchemes } from "@/lib/progression-utils"
import { DEFAULT_BAR_WEIGHT } from "@/lib/plate-constants"

// Re-export constants from other files
export { progressionSchemes, DEFAULT_BAR_WEIGHT }

// Calculator history entry type
export interface CalculatorHistoryEntry {
  id: string
  date: string
  type: "1rm" | "uniform"
  baseWeight: number
  sets: number
  reps: number
  scheme?: string
  results: number[]
}

// App state type
export interface AppState {
  // UI state
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void

  // Shared settings
  barWeight: number
  setBarWeight: (barWeight: number) => void

  // Weight Calculator state
  calculator: {
    // Calculator mode
    mode: "1rm" | "uniform"
    setMode: (mode: "1rm" | "uniform") => void

    // Weight inputs
    uniformWeight: string
    setUniformWeight: (uniformWeight: string) => void
    targetWeight: string
    setTargetWeight: (targetWeight: string) => void

    // Other inputs
    numSets: string
    setNumSets: (numSets: string) => void
    repsPerSet: string
    setRepsPerSet: (repsPerSet: string) => void
    selectedScheme: string
    setSelectedScheme: (selectedScheme: string) => void

    // Results
    calculatedWeights: number[]
    setCalculatedWeights: (calculatedWeights: number[]) => void
    percentages: Record<number, number>
    setPercentages: (percentages: Record<number, number>) => void

    // History
    history: CalculatorHistoryEntry[]
    addToHistory: (
      type: "1rm" | "uniform",
      baseWeight: number,
      sets: number,
      reps: number,
      results: number[],
      scheme?: string,
    ) => void
    clearHistory: () => void

    // UI state
    isTyping: boolean
    setIsTyping: (isTyping: boolean) => void
    showHistorySection: boolean
    setShowHistorySection: (showHistorySection: boolean) => void

    // Actions
    calculateWeightsOnly: (type: "1rm" | "uniform") => void
    applyUniformWeight: () => void
    resetResults: () => void
    loadHistoryEntry: (entry: CalculatorHistoryEntry) => void
  }

  // Plate Calculator state
  plateCalculator: {
    weight: string
    setWeight: (weight: string) => void
    useSmallPlates: boolean
    setUseSmallPlates: (useSmallPlates: boolean) => void

    // Computed properties
    parsedWeight: number
    weightPerSide: number
  }
}
