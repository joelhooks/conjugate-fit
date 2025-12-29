"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useCalculatorState } from "@/lib/stores/calculator-store"
import CalculatorModeSelector from "./calculator/calculator-mode-selector"
import SetsRepsInputs from "./calculator/sets-reps-inputs"
import PercentageInputs from "./calculator/percentage-inputs"
import UniformInputs from "./calculator/uniform-inputs"
import CalculatorResultsWithTimer from "./calculator/calculator-results-with-timer"
import CalculatorHistory from "./calculator/calculator-history"
import { errorTracker, ErrorCategory } from "@/lib/error-tracking"
import { ensureArray, hasItems, safeLength } from "@/lib/utils/array-utils"
import BarWeightSelector from "./bar-weight-selector"
import PlatePicker from "./plate-picker"

export default function WeightCalculatorHome() {
  // Get state and actions from the store
  const calculator = useCalculatorState()

  // Local state to track if component is mounted and 1RM timing set
  const [mounted, setMounted] = useState(false)
  const [oneRmTimingSet, setOneRmTimingSet] = useState(false)
  const initialSetupDone = useRef(false)

  // Refs for debounce timers
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceCalcTimerRef = useRef<NodeJS.Timeout | null>(null)
  const debounceScrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const saveHistoryTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Set mounted state on client side
  useEffect(() => {
    setMounted(true)

    // Log component mount for debugging
    errorTracker.debug(ErrorCategory.COMPONENT, "WeightCalculatorHome mounted", {
      component: "WeightCalculatorHome",
      action: "mount",
    })

    return () => {
      // Clean up all timers on unmount
      if (debounceCalcTimerRef.current) clearTimeout(debounceCalcTimerRef.current)
      if (debounceScrollTimerRef.current) clearTimeout(debounceScrollTimerRef.current)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      if (saveHistoryTimerRef.current) clearTimeout(saveHistoryTimerRef.current)
    }
  }, [])

  // Set up 1RM configuration when mode changes - using useRef to prevent infinite loops
  useEffect(() => {
    if (!mounted || !calculator) return

    // Only run this once when the mode changes to 1RM
    if (calculator.mode === "1rm" && !initialSetupDone.current) {
      // Configure for 1RM - Sets, reps and scheme
      calculator.setNumSets("7")
      calculator.setRepsPerSet("1")
      calculator.setSelectedScheme("standard")
      setOneRmTimingSet(true)
      initialSetupDone.current = true
    } else if (calculator.mode !== "1rm") {
      // Reset the flag when mode changes away from 1RM
      initialSetupDone.current = false
      setOneRmTimingSet(false)
    }
  }, [calculator, calculator?.mode, mounted])

  // Function to scroll to results
  const scrollToResults = useCallback(() => {
    try {
      errorTracker.debug(ErrorCategory.COMPONENT, "Attempting to scroll to results", {
        component: "WeightCalculatorHome",
        action: "scrollToResults",
        state: {
          resultsRefExists: !!resultsRef.current,
          isTyping: calculator?.isTyping,
        },
      })

      if (resultsRef.current && calculator && !calculator.isTyping) {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    } catch (error) {
      errorTracker.trackError(ErrorCategory.COMPONENT, error as Error, {
        component: "WeightCalculatorHome",
        action: "scrollToResults",
        message: "Error scrolling to results",
      })
    }
  }, [calculator])

  // Function to calculate weights without saving to history
  const calculateWeightsOnly = useCallback(() => {
    try {
      errorTracker.debug(ErrorCategory.CALCULATION, "calculateWeightsOnly called", {
        component: "WeightCalculatorHome",
        action: "calculateWeightsOnly",
        state: {
          calculatorExists: !!calculator,
          mode: calculator?.mode,
        },
      })

      if (!calculator) {
        errorTracker.warning(ErrorCategory.CALCULATION, "Calculator is undefined", {
          component: "WeightCalculatorHome",
          action: "calculateWeightsOnly",
        })
        return
      }

      // Calculate based on mode
      if (calculator.mode === "1rm") {
        calculator.calculateWeightsOnly("1rm")
      } else if (calculator.mode === "uniform") {
        calculator.calculateWeightsOnly("uniform")
      }

      // Log the results after calculation
      errorTracker.debug(ErrorCategory.CALCULATION, "Calculation completed", {
        component: "WeightCalculatorHome",
        action: "calculateWeightsOnly",
        state: {
          calculatedWeightsLength: safeLength(calculator.calculatedWeights),
          percentagesKeys: Object.keys(calculator.percentages || {}).length,
        },
      })
    } catch (error) {
      errorTracker.trackError(ErrorCategory.CALCULATION, error as Error, {
        component: "WeightCalculatorHome",
        action: "calculateWeightsOnly",
        message: "Error calculating weights",
        inputs: { mode: calculator?.mode },
      })
    }
  }, [calculator])

  // Function to save current calculation to history
  const saveToHistory = useCallback(() => {
    try {
      errorTracker.debug(ErrorCategory.STORE, "saveToHistory called", {
        component: "WeightCalculatorHome",
        action: "saveToHistory",
        state: {
          calculatorExists: !!calculator,
          mode: calculator?.mode,
        },
      })

      if (!calculator) {
        errorTracker.warning(ErrorCategory.STORE, "Calculator is undefined", {
          component: "WeightCalculatorHome",
          action: "saveToHistory",
        })
        return
      }

      // Make sure calculatedWeights exists and has items before saving to history
      const calculatedWeights = ensureArray(calculator.calculatedWeights)

      errorTracker.debug(ErrorCategory.STORE, "Checking calculated weights", {
        component: "WeightCalculatorHome",
        action: "saveToHistory",
        state: {
          calculatedWeightsLength: calculatedWeights.length,
          hasItems: hasItems(calculatedWeights),
        },
      })

      if (!hasItems(calculatedWeights)) {
        return
      }

      if (calculator.mode === "1rm") {
        const weight = Number.parseFloat(calculator.targetWeight)
        if (isNaN(weight) || weight <= 0) return

        const sets = 7 // Fixed for 1RM
        const reps = 1 // Fixed for 1RM
        calculator.addToHistory("1rm", weight, sets, reps, calculatedWeights, calculator.selectedScheme)
      } else if (calculator.mode === "uniform") {
        const weight = Number.parseFloat(calculator.uniformWeight)
        if (isNaN(weight) || weight <= 0) return

        const sets = Number.parseInt(calculator.numSets) || 4
        calculator.addToHistory("uniform", weight, sets, Number.parseInt(calculator.repsPerSet) || 1, calculatedWeights)
      }

      errorTracker.debug(ErrorCategory.STORE, "History saved successfully", {
        component: "WeightCalculatorHome",
        action: "saveToHistory",
        state: {
          historyLength: safeLength(calculator.history),
        },
      })
    } catch (error) {
      errorTracker.trackError(ErrorCategory.STORE, error as Error, {
        component: "WeightCalculatorHome",
        action: "saveToHistory",
        message: "Error saving to history",
      })
    }
  }, [calculator])

  // Debounced calculation function
  const debouncedCalculate = useCallback(() => {
    try {
      errorTracker.debug(ErrorCategory.CALCULATION, "debouncedCalculate called", {
        component: "WeightCalculatorHome",
        action: "debouncedCalculate",
        state: {
          calculatorExists: !!calculator,
          debounceCalcTimerExists: !!debounceCalcTimerRef.current,
          saveHistoryTimerExists: !!saveHistoryTimerRef.current,
        },
      })

      if (!calculator) {
        errorTracker.warning(ErrorCategory.CALCULATION, "Calculator is undefined", {
          component: "WeightCalculatorHome",
          action: "debouncedCalculate",
        })
        return
      }

      // Clear any existing timer
      if (debounceCalcTimerRef.current) {
        clearTimeout(debounceCalcTimerRef.current)
      }

      // Clear any existing save history timer
      if (saveHistoryTimerRef.current) {
        clearTimeout(saveHistoryTimerRef.current)
      }

      // Set a new timer for calculation
      debounceCalcTimerRef.current = setTimeout(() => {
        errorTracker.debug(ErrorCategory.CALCULATION, "Debounce timer fired, calculating weights", {
          component: "WeightCalculatorHome",
          action: "debouncedCalculate",
        })

        calculateWeightsOnly()

        // Schedule scrolling with a longer delay, but only if not typing
        if (debounceScrollTimerRef.current) {
          clearTimeout(debounceScrollTimerRef.current)
        }

        debounceScrollTimerRef.current = setTimeout(() => {
          errorTracker.debug(ErrorCategory.COMPONENT, "Scroll timer fired", {
            component: "WeightCalculatorHome",
            action: "debouncedCalculate",
            state: {
              calculatorExists: !!calculator,
              isTyping: calculator?.isTyping,
            },
          })

          if (calculator && !calculator.isTyping) {
            scrollToResults()

            // Set a timer to save to history after a delay
            if (saveHistoryTimerRef.current) {
              clearTimeout(saveHistoryTimerRef.current)
            }

            saveHistoryTimerRef.current = setTimeout(() => {
              errorTracker.debug(ErrorCategory.STORE, "Save history timer fired", {
                component: "WeightCalculatorHome",
                action: "debouncedCalculate",
              })

              saveToHistory()
            }, 1500) // Wait 1.5 seconds after calculation before saving to history
          }
        }, 800) // Longer delay for scrolling
      }, 500) // 500ms debounce for calculation
    } catch (error) {
      errorTracker.trackError(ErrorCategory.CALCULATION, error as Error, {
        component: "WeightCalculatorHome",
        action: "debouncedCalculate",
        message: "Error in debouncedCalculate",
      })
    }
  }, [calculator, calculateWeightsOnly, saveToHistory, scrollToResults])

  // Handle input changes and track typing state
  const handleWeightInputChange = useCallback(
    (value: string, setter: (value: string) => void) => {
      try {
        errorTracker.debug(ErrorCategory.INPUT, "handleWeightInputChange called", {
          component: "WeightCalculatorHome",
          action: "handleWeightInputChange",
          inputs: {
            value,
            setterExists: !!setter,
            calculatorExists: !!calculator,
          },
        })

        if (!calculator || !setter) {
          errorTracker.warning(ErrorCategory.INPUT, "Calculator or setter is undefined", {
            component: "WeightCalculatorHome",
            action: "handleWeightInputChange",
            inputs: { value },
          })
          return
        }

        // Set typing state to true
        calculator.setIsTyping(true)

        // Clear any existing typing timer
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current)
        }

        // Set a timer to mark when typing has stopped
        typingTimerRef.current = setTimeout(() => {
          errorTracker.debug(ErrorCategory.INPUT, "Typing timer fired, setting isTyping to false", {
            component: "WeightCalculatorHome",
            action: "handleWeightInputChange",
          })

          if (calculator) {
            calculator.setIsTyping(false)
          }
        }, 1000) // Consider typing stopped after 1 second of inactivity

        // Update the value
        setter(value)
      } catch (error) {
        errorTracker.trackError(ErrorCategory.INPUT, error as Error, {
          component: "WeightCalculatorHome",
          action: "handleWeightInputChange",
          message: "Error handling input change",
          inputs: { value },
        })
      }
    },
    [calculator],
  )

  // Auto-calculate when inputs change
  useEffect(() => {
    try {
      if (!mounted || !calculator) return

      errorTracker.debug(ErrorCategory.CALCULATION, "Auto-calculate effect running", {
        component: "WeightCalculatorHome",
        action: "auto-calculate effect",
        state: {
          mode: calculator.mode,
          targetWeight: calculator.targetWeight,
          uniformWeight: calculator.uniformWeight,
        },
      })

      // Only calculate if we have valid inputs
      const hasValidWeight =
        (calculator.mode === "1rm" &&
          calculator.targetWeight &&
          !isNaN(Number(calculator.targetWeight)) &&
          Number(calculator.targetWeight) > 0) ||
        (calculator.mode === "uniform" &&
          calculator.uniformWeight &&
          !isNaN(Number(calculator.uniformWeight)) &&
          Number(calculator.uniformWeight) > 0)

      if (hasValidWeight) {
        errorTracker.debug(ErrorCategory.CALCULATION, "Valid weight detected, triggering calculation", {
          component: "WeightCalculatorHome",
          action: "auto-calculate effect",
          state: { hasValidWeight },
        })

        debouncedCalculate()
      }
    } catch (error) {
      errorTracker.trackError(ErrorCategory.CALCULATION, error as Error, {
        component: "WeightCalculatorHome",
        action: "auto-calculate effect",
        message: "Error in auto-calculate effect",
      })
    }

    // Cleanup
    return () => {
      if (debounceCalcTimerRef.current) {
        clearTimeout(debounceCalcTimerRef.current)
      }
      if (debounceScrollTimerRef.current) {
        clearTimeout(debounceScrollTimerRef.current)
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      if (saveHistoryTimerRef.current) {
        clearTimeout(saveHistoryTimerRef.current)
      }
    }
  }, [mounted, calculator, debouncedCalculate])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  // No need for a skeleton or loading state here since we're using the Memphis loader
  return (
    <div className="w-full max-w-md mx-auto">
      {calculator && (
        <>
          {/* Mode selector */}
          <CalculatorModeSelector
            mode={calculator.mode}
            onChange={(mode) => {
              try {
                errorTracker.debug(ErrorCategory.INPUT, "Mode changed", {
                  component: "WeightCalculatorHome",
                  action: "setMode",
                  inputs: { mode },
                })

                calculator.setMode(mode)
              } catch (error) {
                errorTracker.trackError(ErrorCategory.INPUT, error as Error, {
                  component: "WeightCalculatorHome",
                  action: "setMode",
                  message: "Error setting mode",
                  inputs: { mode },
                })
              }
            }}
          />

          {/* Sets, reps, and bar weight inputs - hide sets/reps for 1RM as those are preset */}
          {calculator.mode !== "1rm" ? (
            <SetsRepsInputs
              numSets={calculator.numSets}
              repsPerSet={calculator.repsPerSet}
              onNumSetsChange={calculator.setNumSets}
              onRepsPerSetChange={calculator.setRepsPerSet}
            />
          ) : (
            // Show only bar weight selector for 1RM mode
            <div className="mb-6 space-y-3">
              <BarWeightSelector />
              <PlatePicker />
            </div>
          )}

          {/* Mode-specific inputs */}
          {calculator.mode === "1rm" && (
            <PercentageInputs
              targetWeight={calculator.targetWeight}
              selectedScheme={calculator.selectedScheme}
              onTargetWeightChange={calculator.setTargetWeight}
              onSchemeChange={calculator.setSelectedScheme}
              handleWeightInputChange={handleWeightInputChange}
              mode={calculator.mode}
            />
          )}

          {calculator.mode === "uniform" && (
            <UniformInputs
              uniformWeight={calculator.uniformWeight}
              onUniformWeightChange={calculator.setUniformWeight}
              handleWeightInputChange={handleWeightInputChange}
            />
          )}

          {/* Results section */}
          <div ref={resultsRef}>
            <CalculatorResultsWithTimer
              onReset={calculator.resetResults}
              is1RM={calculator.mode === "1rm"}
              oneRmTimingSet={oneRmTimingSet}
            />
          </div>

          {/* History section */}
          <CalculatorHistory
            showHistory={calculator.showHistorySection}
            history={ensureArray(calculator.history)}
            calculatedWeights={ensureArray(calculator.calculatedWeights)}
            onToggleHistory={() => calculator.setShowHistorySection(!calculator.showHistorySection)}
            onClearHistory={calculator.clearHistory}
            onLoadHistoryEntry={calculator.loadHistoryEntry}
          />
        </>
      )}
    </div>
  )
}
