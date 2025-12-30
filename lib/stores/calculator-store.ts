import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type CalculatorHistoryEntry,
  progressionSchemes,
} from "@/lib/stores/types";

interface CalculatorState {
  // Weight inputs
  targetWeight: string;
  setTargetWeight: (targetWeight: string) => void;

  // Other inputs
  numSets: string;
  setNumSets: (numSets: string) => void;
  repsPerSet: string;
  setRepsPerSet: (repsPerSet: string) => void;
  selectedScheme: string;
  setSelectedScheme: (selectedScheme: string) => void;

  // Results
  calculatedWeights: number[];
  setCalculatedWeights: (calculatedWeights: number[]) => void;
  percentages: Record<number, number>;
  setPercentages: (percentages: Record<number, number>) => void;

  // History
  history: CalculatorHistoryEntry[];
  addToHistory: (
    baseWeight: number,
    sets: number,
    reps: number,
    results: number[],
    scheme?: string,
  ) => void;
  clearHistory: () => void;

  // UI state
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  showHistorySection: boolean;
  setShowHistorySection: (showHistorySection: boolean) => void;

  // Actions
  calculateWeights: () => void;
  resetResults: () => void;
  loadHistoryEntry: (entry: CalculatorHistoryEntry) => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      // Weight inputs
      targetWeight: "",
      setTargetWeight: (targetWeight) => set({ targetWeight }),

      // Other inputs
      numSets: "7",
      setNumSets: (numSets) => set({ numSets }),
      repsPerSet: "1",
      setRepsPerSet: (repsPerSet) => set({ repsPerSet }),
      selectedScheme: "standard",
      setSelectedScheme: (selectedScheme) => set({ selectedScheme }),

      // Results
      calculatedWeights: [],
      setCalculatedWeights: (calculatedWeights) => {
        set({
          calculatedWeights: Array.isArray(calculatedWeights)
            ? calculatedWeights
            : [],
        });
      },
      percentages: {},
      setPercentages: (percentages) => set({ percentages: percentages || {} }),

      // History
      history: [],
      addToHistory: (baseWeight, sets, reps, results, scheme) => {
        try {
          const safeResults = Array.isArray(results) ? results : [];

          const entry: CalculatorHistoryEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleString(),
            baseWeight,
            sets,
            reps,
            scheme,
            results: safeResults,
          };

          set((state) => {
            const currentHistory = Array.isArray(state.history)
              ? state.history
              : [];

            // Check for duplicates
            const isDuplicate = currentHistory.some(
              (item) =>
                item &&
                item.baseWeight === entry.baseWeight &&
                item.sets === entry.sets &&
                item.reps === entry.reps &&
                JSON.stringify(item.results) === JSON.stringify(entry.results),
            );

            if (isDuplicate) {
              return state;
            }

            return {
              history: [entry, ...currentHistory].slice(0, 10),
            };
          });
        } catch (error) {
          console.error("Error adding to history:", error);
          set((state) => ({
            history: Array.isArray(state.history) ? state.history : [],
          }));
        }
      },

      clearHistory: () => set({ history: [] }),

      // UI state
      isTyping: false,
      setIsTyping: (isTyping) => set({ isTyping }),
      showHistorySection: false,
      setShowHistorySection: (showHistorySection) =>
        set({ showHistorySection }),

      // Actions
      calculateWeights: () => {
        try {
          const { targetWeight, selectedScheme } = get();

          const weight = Number.parseFloat(targetWeight);
          if (isNaN(weight) || weight <= 0) {
            set({
              calculatedWeights: [],
              percentages: {},
            });
            return;
          }

          const sets = 7;
          const scheme =
            progressionSchemes[selectedScheme] || progressionSchemes.standard;

          const weights: number[] = [];
          const newPercentages: Record<number, number> = {};

          const steps = (scheme?.progressionSteps || []).slice(0, sets);

          for (let i = 0; i < sets; i++) {
            if (steps && i < steps.length) {
              const step = steps[i];
              if (step) {
                const percentage = step.percentage;
                newPercentages[i] = percentage;
                const exactWeight = (weight * percentage) / 100;
                weights.push(Math.round(exactWeight / 5) * 5);
              } else {
                newPercentages[i] = 100;
                weights.push(weight);
              }
            } else {
              const firstStep = steps.length > 0 ? steps[0] : null;
              const lastStep =
                steps.length > 0 ? steps[steps.length - 1] : null;

              const firstPercentage = firstStep ? firstStep.percentage : 0;
              const lastPercentage = lastStep ? lastStep.percentage : 100;

              const percentage =
                firstPercentage +
                ((lastPercentage - firstPercentage) * i) / (sets - 1);
              newPercentages[i] = Math.round(percentage);
              const exactWeight = (weight * percentage) / 100;
              weights.push(Math.round(exactWeight / 5) * 5);
            }
          }

          set({
            calculatedWeights: weights,
            percentages: newPercentages,
          });
        } catch (error) {
          console.error("Error calculating weights:", error);
          set({
            calculatedWeights: [],
            percentages: {},
          });
        }
      },

      resetResults: () => set({ calculatedWeights: [], percentages: {} }),

      loadHistoryEntry: (entry) => {
        try {
          if (!entry) return;

          const newState: Partial<CalculatorState> = {};

          newState.targetWeight = entry.baseWeight.toString();
          if (entry.scheme && progressionSchemes[entry.scheme]) {
            newState.selectedScheme = entry.scheme;
          }

          newState.numSets = entry.sets.toString();
          newState.repsPerSet = entry.reps.toString();
          newState.calculatedWeights = Array.isArray(entry.results)
            ? entry.results
            : [];

          set(newState);
        } catch (error) {
          console.error("Error loading history entry:", error);
        }
      },
    }),
    {
      name: "conjugate-fitness-calculator-state",
      partialize: (state) => ({
        targetWeight: state.targetWeight,
        numSets: state.numSets,
        repsPerSet: state.repsPerSet,
        selectedScheme: state.selectedScheme,
        history: state.history,
        showHistorySection: state.showHistorySection,
      }),
    },
  ),
);

export const useCalculatorState = () => useCalculatorStore();
