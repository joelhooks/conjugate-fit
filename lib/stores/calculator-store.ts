import { create } from "zustand"
import { type CalculatorHistoryEntry, progressionSchemes } from "@/lib/stores/types"
import { errorTracker, ErrorCategory, withErrorTracking } from "@/lib/error-tracking"
import { ensureArray, safeSlice, safeLength, safeSome } from "@/lib/utils/array-utils"
import { persist } from "@/lib/stores/persistence-middleware"

interface CalculatorState {
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

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      // Calculator mode - default to 1rm
      mode: "1rm",
      setMode: (mode) => set({ mode }),

      // Weight inputs - initialize with empty strings to prevent undefined
      uniformWeight: "",
      setUniformWeight: (uniformWeight) => set({ uniformWeight }),
      targetWeight: "",
      setTargetWeight: (targetWeight) => set({ targetWeight }),

      // Other inputs - initialize with sensible defaults
      numSets: "7", // Default to 7 sets for 1RM mode
      setNumSets: (numSets) => set({ numSets }),
      repsPerSet: "1", // Default to 1 rep for 1RM mode
      setRepsPerSet: (repsPerSet) => set({ repsPerSet }),
      selectedScheme: "standard",
      setSelectedScheme: (selectedScheme) => set({ selectedScheme }),

      // Results - ensure these are always initialized as empty arrays/objects
      calculatedWeights: [],
      setCalculatedWeights: (calculatedWeights) => {
        errorTracker.debug(ErrorCategory.STORE, "Setting calculatedWeights", {
          component: "calculator-store",
          action: "setCalculatedWeights",
          inputs: {
            calculatedWeights,
            isArray: Array.isArray(calculatedWeights),
            length: calculatedWeights ? calculatedWeights.length : "undefined",
          },
        })

        set({ calculatedWeights: Array.isArray(calculatedWeights) ? calculatedWeights : [] })
      },
      percentages: {},
      setPercentages: (percentages) => set({ percentages: percentages || {} }),

      // History - ensure it's always an array
      history: [],
      addToHistory: withErrorTracking(
        (type, baseWeight, sets, reps, results, scheme) => {
          try {
            // Log the inputs for debugging
            errorTracker.debug(ErrorCategory.STORE, "addToHistory called", {
              component: "calculator-store",
              action: "addToHistory",
              inputs: {
                type,
                baseWeight,
                sets,
                reps,
                resultsLength: results ? results.length : "undefined",
                resultsIsArray: Array.isArray(results),
                scheme,
              },
            })

            // Ensure results is an array
            const safeResults = ensureArray(results)

            const entry: CalculatorHistoryEntry = {
              id: Date.now().toString(),
              date: new Date().toLocaleString(),
              type,
              baseWeight,
              sets,
              reps,
              scheme,
              results: safeResults,
            }

            set((state) => {
              // Ensure history is an array
              const currentHistory = ensureArray(state.history)

              // Check if we already have an identical entry to prevent duplicates
              const isDuplicate = safeSome(
                currentHistory,
                (item) =>
                  item &&
                  item.type === entry.type &&
                  item.baseWeight === entry.baseWeight &&
                  item.sets === entry.sets &&
                  item.reps === entry.reps &&
                  JSON.stringify(item.results) === JSON.stringify(entry.results),
              )

              if (isDuplicate) {
                return state // Return unchanged state if duplicate
              }

              // Add new entry to history
              return {
                history: [entry, ...currentHistory].slice(0, 10),
              }
            })
          } catch (error) {
            errorTracker.trackError(ErrorCategory.STORE, error as Error, {
              component: "calculator-store",
              action: "addToHistory",
              message: "Error adding to history",
              inputs: { type, baseWeight, sets, reps, results, scheme },
            })

            // Ensure we don't break the state on error
            set((state) => ({ history: Array.isArray(state.history) ? state.history : [] }))
          }
        },
        ErrorCategory.STORE,
        { component: "calculator-store", action: "addToHistory" },
      ),

      clearHistory: () => set({ history: [] }),

      // UI state
      isTyping: false,
      setIsTyping: (isTyping) => set({ isTyping }),
      showHistorySection: false,
      setShowHistorySection: (showHistorySection) => set({ showHistorySection }),

      // Actions
      calculateWeightsOnly: withErrorTracking(
        (type) => {
          try {
            errorTracker.debug(ErrorCategory.CALCULATION, `Starting calculation for ${type}`, {
              component: "calculator-store",
              action: "calculateWeightsOnly",
              inputs: { type },
            })

            if (type === "1rm") {
              const { targetWeight, numSets, selectedScheme } = get()

              errorTracker.debug(ErrorCategory.CALCULATION, "1RM calculation inputs", {
                component: "calculator-store",
                action: "calculateWeightsOnly",
                inputs: { targetWeight, numSets, selectedScheme },
              })

              const weight = Number.parseFloat(targetWeight)
              if (isNaN(weight) || weight <= 0) {
                // Initialize with empty arrays if invalid input
                errorTracker.debug(ErrorCategory.CALCULATION, "Invalid weight, resetting results", {
                  component: "calculator-store",
                  action: "calculateWeightsOnly",
                })

                set({
                  calculatedWeights: [],
                  percentages: {},
                })
                return
              }

              // Use 7 sets for 1RM mode regardless of numSets value
              const sets = 7
              const scheme = progressionSchemes[selectedScheme] || progressionSchemes.standard

              errorTracker.debug(ErrorCategory.CALCULATION, "Using scheme", {
                component: "calculator-store",
                action: "calculateWeightsOnly",
                inputs: {
                  schemeName: scheme?.algorithmName || "undefined",
                  hasProgressionSteps: scheme?.progressionSteps ? true : false,
                  stepsLength: scheme?.progressionSteps ? scheme.progressionSteps.length : "undefined",
                },
              })

              // Use the selected progression scheme
              const weights: number[] = []
              const newPercentages: Record<number, number> = {}

              // Get the appropriate number of steps from the scheme
              // Ensure progressionSteps is an array
              const steps = safeSlice(scheme?.progressionSteps || [], 0, sets)

              errorTracker.debug(ErrorCategory.CALCULATION, "Steps after safeSlice", {
                component: "calculator-store",
                action: "calculateWeightsOnly",
                inputs: {
                  stepsLength: steps ? steps.length : "undefined",
                  stepsIsArray: Array.isArray(steps),
                },
              })

              for (let i = 0; i < sets; i++) {
                // If we have a step for this index, use its percentage
                if (steps && i < safeLength(steps)) {
                  const step = steps[i]
                  if (step) {
                    const percentage = step.percentage
                    newPercentages[i] = percentage
                    const exactWeight = (weight * percentage) / 100
                    weights.push(Math.round(exactWeight / 5) * 5)
                  } else {
                    // Fallback if step is undefined
                    newPercentages[i] = 100
                    weights.push(weight)
                  }
                } else {
                  // Otherwise, interpolate between first and last step
                  const firstStep = safeLength(steps) > 0 ? steps[0] : null
                  const lastStep = safeLength(steps) > 0 ? steps[safeLength(steps) - 1] : null

                  const firstPercentage = firstStep ? firstStep.percentage : 0
                  const lastPercentage = lastStep ? lastStep.percentage : 100

                  const percentage = firstPercentage + ((lastPercentage - firstPercentage) * i) / (sets - 1)
                  newPercentages[i] = Math.round(percentage)
                  const exactWeight = (weight * percentage) / 100
                  weights.push(Math.round(exactWeight / 5) * 5)
                }
              }

              errorTracker.debug(ErrorCategory.CALCULATION, "Calculation results", {
                component: "calculator-store",
                action: "calculateWeightsOnly",
                inputs: {
                  weightsLength: weights.length,
                  percentagesKeys: Object.keys(newPercentages).length,
                },
              })

              set({
                calculatedWeights: weights,
                percentages: newPercentages,
              })
            } else if (type === "uniform") {
              const { uniformWeight, numSets } = get()

              errorTracker.debug(ErrorCategory.CALCULATION, "Uniform calculation inputs", {
                component: "calculator-store",
                action: "calculateWeightsOnly",
                inputs: { uniformWeight, numSets },
              })

              const weight = Number.parseFloat(uniformWeight)
              if (isNaN(weight) || weight <= 0) {
                // Initialize with empty arrays if invalid input
                errorTracker.debug(ErrorCategory.CALCULATION, "Invalid weight, resetting results", {
                  component: "calculator-store",
                  action: "calculateWeightsOnly",
                })

                set({
                  calculatedWeights: [],
                  percentages: {},
                })
                return
              }

              const sets = Number.parseInt(numSets) || 4
              const weights = Array(sets).fill(weight)

              // All sets are 100% of the uniform weight
              const newPercentages: Record<number, number> = {}
              for (let i = 0; i < sets; i++) {
                newPercentages[i] = 100
              }

              errorTracker.debug(ErrorCategory.CALCULATION, "Calculation results", {
                component: "calculator-store",
                action: "calculateWeightsOnly",
                inputs: {
                  weightsLength: weights.length,
                  percentagesKeys: Object.keys(newPercentages).length,
                },
              })

              set({
                calculatedWeights: weights,
                percentages: newPercentages,
              })
            }
          } catch (error) {
            errorTracker.trackError(ErrorCategory.CALCULATION, error as Error, {
              component: "calculator-store",
              action: "calculateWeightsOnly",
              message: `Error calculating weights for type: ${type}`,
              inputs: { type },
            })

            // Set empty arrays on error
            set({
              calculatedWeights: [],
              percentages: {},
            })
          }
        },
        ErrorCategory.CALCULATION,
        { component: "calculator-store", action: "calculateWeightsOnly" },
      ),

      applyUniformWeight: withErrorTracking(
        () => {
          try {
            const { uniformWeight, numSets, repsPerSet } = get()
            const weight = Number.parseFloat(uniformWeight)
            if (isNaN(weight) || weight <= 0) return

            const sets = Number.parseInt(numSets) || 4

            // Calculate weights
            get().calculateWeightsOnly("uniform")

            // Get the calculated weights after calculation
            const calculatedWeights = ensureArray(get().calculatedWeights)

            // Add to history
            get().addToHistory("uniform", weight, sets, Number.parseInt(repsPerSet) || 1, calculatedWeights)
          } catch (error) {
            errorTracker.trackError(ErrorCategory.CALCULATION, error as Error, {
              component: "calculator-store",
              action: "applyUniformWeight",
              message: "Error in applyUniformWeight",
            })
          }
        },
        ErrorCategory.CALCULATION,
        { component: "calculator-store", action: "applyUniformWeight" },
      ),

      resetResults: () => set({ calculatedWeights: [], percentages: {} }),

      loadHistoryEntry: withErrorTracking(
        (entry) => {
          try {
            if (!entry) {
              errorTracker.warning(ErrorCategory.STORE, "Attempted to load undefined history entry", {
                component: "calculator-store",
                action: "loadHistoryEntry",
              })
              return
            }

            const newState: Partial<CalculatorState> = { mode: entry.type }

            if (entry.type === "1rm") {
              newState.targetWeight = entry.baseWeight.toString()
              if (entry.scheme && progressionSchemes[entry.scheme]) {
                newState.selectedScheme = entry.scheme
              }
            } else if (entry.type === "uniform") {
              newState.uniformWeight = entry.baseWeight.toString()
            }

            newState.numSets = entry.sets.toString()
            newState.repsPerSet = entry.reps.toString()

            // Safely handle results array
            newState.calculatedWeights = ensureArray(entry.results)

            set(newState)
          } catch (error) {
            errorTracker.trackError(ErrorCategory.STORE, error as Error, {
              component: "calculator-store",
              action: "loadHistoryEntry",
              message: "Error loading history entry",
              inputs: { entry },
            })
            // Don't modify state on error
          }
        },
        ErrorCategory.STORE,
        { component: "calculator-store", action: "loadHistoryEntry" },
      ),
    }),
    {
      name: "calculator-state",
      partialize: (state) => ({
        // Only persist these fields
        mode: state.mode,
        uniformWeight: state.uniformWeight,
        targetWeight: state.targetWeight,
        numSets: state.numSets,
        repsPerSet: state.repsPerSet,
        selectedScheme: state.selectedScheme,
        history: state.history,
        showHistorySection: state.showHistorySection,
      }),
    },
  ),
)

// Helper hook for backward compatibility
export const useCalculatorState = () => useCalculatorStore()
