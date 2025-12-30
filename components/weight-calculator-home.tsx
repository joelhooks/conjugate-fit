"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCalculatorState } from "@/lib/stores/calculator-store";
import PercentageInputs from "./calculator/percentage-inputs";
import CalculatorResultsWithTimer from "./calculator/calculator-results-with-timer";
import CalculatorHistory from "./calculator/calculator-history";
import BarWeightSelector from "./bar-weight-selector";
import PlatePicker from "./plate-picker";

/**
 * Weight calculator home component - 1RM-only mode
 * Calculates warm-up sets based on percentage schemes for a target 1RM weight
 */
export default function WeightCalculatorHome() {
  const calculator = useCalculatorState();

  const [mounted, setMounted] = useState(false);
  const initialSetupDone = useRef(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceCalcTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveHistoryTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    return () => {
      if (debounceCalcTimerRef.current)
        clearTimeout(debounceCalcTimerRef.current);
      if (debounceScrollTimerRef.current)
        clearTimeout(debounceScrollTimerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (saveHistoryTimerRef.current)
        clearTimeout(saveHistoryTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !calculator) return;

    if (!initialSetupDone.current) {
      calculator.setNumSets("7");
      calculator.setRepsPerSet("1");
      calculator.setSelectedScheme("standard");
      initialSetupDone.current = true;
    }
  }, [calculator, mounted]);

  const scrollToResults = useCallback(() => {
    try {
      if (resultsRef.current && calculator && !calculator.isTyping) {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch (error) {
      console.error("Error scrolling to results:", error);
    }
  }, [calculator]);

  const calculateWeightsOnly = useCallback(() => {
    try {
      if (!calculator) return;
      calculator.calculateWeights();
    } catch (error) {
      console.error("Error calculating weights:", error);
    }
  }, [calculator]);

  const saveToHistory = useCallback(() => {
    try {
      if (!calculator) return;

      const calculatedWeights = Array.isArray(calculator.calculatedWeights)
        ? calculator.calculatedWeights
        : [];

      if (calculatedWeights.length === 0) return;

      const weight = Number.parseFloat(calculator.targetWeight);
      if (isNaN(weight) || weight <= 0) return;

      const sets = 7;
      const reps = 1;
      calculator.addToHistory(
        weight,
        sets,
        reps,
        calculatedWeights,
        calculator.selectedScheme,
      );
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  }, [calculator]);

  const debouncedCalculate = useCallback(() => {
    try {
      if (!calculator) return;

      if (debounceCalcTimerRef.current) {
        clearTimeout(debounceCalcTimerRef.current);
      }

      if (saveHistoryTimerRef.current) {
        clearTimeout(saveHistoryTimerRef.current);
      }

      debounceCalcTimerRef.current = setTimeout(() => {
        calculateWeightsOnly();

        if (debounceScrollTimerRef.current) {
          clearTimeout(debounceScrollTimerRef.current);
        }

        debounceScrollTimerRef.current = setTimeout(() => {
          if (calculator && !calculator.isTyping) {
            scrollToResults();

            if (saveHistoryTimerRef.current) {
              clearTimeout(saveHistoryTimerRef.current);
            }

            saveHistoryTimerRef.current = setTimeout(() => {
              saveToHistory();
            }, 1500);
          }
        }, 800);
      }, 500);
    } catch (error) {
      console.error("Error in debouncedCalculate:", error);
    }
  }, [calculator, calculateWeightsOnly, saveToHistory, scrollToResults]);

  const handleWeightInputChange = useCallback(
    (value: string, setter: (value: string) => void) => {
      try {
        if (!calculator || !setter) return;

        calculator.setIsTyping(true);

        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }

        typingTimerRef.current = setTimeout(() => {
          if (calculator) {
            calculator.setIsTyping(false);
          }
        }, 1000);

        setter(value);
      } catch (error) {
        console.error("Error handling input change:", error);
      }
    },
    [calculator],
  );

  useEffect(() => {
    try {
      if (!mounted || !calculator) return;

      const hasValidWeight =
        calculator.targetWeight &&
        !isNaN(Number(calculator.targetWeight)) &&
        Number(calculator.targetWeight) > 0;

      if (hasValidWeight) {
        debouncedCalculate();
      }
    } catch (error) {
      console.error("Error in auto-calculate effect:", error);
    }

    return () => {
      if (debounceCalcTimerRef.current) {
        clearTimeout(debounceCalcTimerRef.current);
      }
      if (debounceScrollTimerRef.current) {
        clearTimeout(debounceScrollTimerRef.current);
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (saveHistoryTimerRef.current) {
        clearTimeout(saveHistoryTimerRef.current);
      }
    };
  }, [mounted, calculator, debouncedCalculate]);

  if (!mounted) {
    return null;
  }

  const safeHistory = Array.isArray(calculator?.history)
    ? calculator.history
    : [];
  const safeCalculatedWeights = Array.isArray(calculator?.calculatedWeights)
    ? calculator.calculatedWeights
    : [];

  return (
    <div className="w-full max-w-md mx-auto">
      {calculator && (
        <>
          <div className="mb-6 space-y-3">
            <BarWeightSelector />
            <PlatePicker />
          </div>

          <PercentageInputs
            targetWeight={calculator.targetWeight}
            onTargetWeightChange={calculator.setTargetWeight}
            handleWeightInputChange={handleWeightInputChange}
          />

          <div ref={resultsRef}>
            <CalculatorResultsWithTimer
              onReset={calculator.resetResults}
              is1RM={true}
              oneRmTimingSet={true}
            />
          </div>

          <CalculatorHistory
            showHistory={calculator.showHistorySection}
            history={safeHistory}
            calculatedWeights={safeCalculatedWeights}
            onToggleHistory={() =>
              calculator.setShowHistorySection(!calculator.showHistorySection)
            }
            onClearHistory={calculator.clearHistory}
            onLoadHistoryEntry={calculator.loadHistoryEntry}
          />
        </>
      )}
    </div>
  );
}
