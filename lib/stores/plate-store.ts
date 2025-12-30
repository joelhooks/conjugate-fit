import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingsStore } from "@/lib/stores/settings-store";

interface PlateCalculatorState {
  weight: string;
  setWeight: (weight: string) => void;
  useSmallPlates: boolean;
  setUseSmallPlates: (useSmallPlates: boolean) => void;

  // Computed properties
  parsedWeight: number;
  weightPerSide: number;
}

export const usePlateCalculatorStore = create<PlateCalculatorState>()(
  persist(
    (set, get) => ({
      weight: "135",
      setWeight: (weight) => set({ weight }),
      useSmallPlates: true,
      setUseSmallPlates: (useSmallPlates) => set({ useSmallPlates }),

      // Computed properties
      get parsedWeight() {
        try {
          return Number.parseFloat(get().weight) || 0;
        } catch (error) {
          console.error("Error parsing weight:", error);
          return 0;
        }
      },
      get weightPerSide() {
        try {
          const { parsedWeight } = get();
          const barWeight = useSettingsStore.getState().barWeight;
          return Math.max(0, (parsedWeight - barWeight) / 2);
        } catch (error) {
          console.error("Error calculating weight per side:", error);
          return 0;
        }
      },
    }),
    {
      name: "conjugate-fitness-plate-calculator-state",
      partialize: (state) => ({
        weight: state.weight,
        useSmallPlates: state.useSmallPlates,
      }),
    },
  ),
);

// Helper hook for backward compatibility
export const usePlateCalculatorState = () => usePlateCalculatorStore();
