import { create } from "zustand"
import { DEFAULT_BAR_WEIGHT } from "@/lib/stores/types"
import { DEFAULT_SELECTED_PLATES } from "@/lib/plate-constants"
import { persist } from "@/lib/stores/persistence-middleware"

export type PlateQuantities = Record<number, number | null>

interface SettingsState {
  barWeight: number
  setBarWeight: (barWeight: number) => void
  selectedPlates: number[]
  setSelectedPlates: (plates: number[]) => void
  togglePlate: (plate: number) => void
  plateQuantities: PlateQuantities
  setPlateQuantity: (plate: number, quantity: number | null) => void
}

const DEFAULT_PLATE_QUANTITIES: PlateQuantities = {}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      barWeight: DEFAULT_BAR_WEIGHT,
      setBarWeight: (barWeight) => set({ barWeight }),
      selectedPlates: DEFAULT_SELECTED_PLATES,
      setSelectedPlates: (plates) => set({ selectedPlates: plates }),
      togglePlate: (plate) => {
        const current = get().selectedPlates
        if (current.includes(plate)) {
          set({ selectedPlates: current.filter((p) => p !== plate) })
        } else {
          set({ selectedPlates: [...current, plate].sort((a, b) => b - a) })
        }
      },
      plateQuantities: DEFAULT_PLATE_QUANTITIES,
      setPlateQuantity: (plate, quantity) => {
        const current = get().plateQuantities
        if (quantity === null) {
          // Remove from quantities (means unlimited)
          const { [plate]: _, ...rest } = current
          set({ plateQuantities: rest })
        } else {
          set({ plateQuantities: { ...current, [plate]: quantity } })
        }
      },
    }),
    {
      name: "settings-state",
      partialize: (state) => ({
        barWeight: state.barWeight,
        selectedPlates: state.selectedPlates,
        plateQuantities: state.plateQuantities,
      }),
    },
  ),
)

// Helper hooks
export const useBarWeight = () => useSettingsStore((state) => state.barWeight)
export const useSetBarWeight = () => useSettingsStore((state) => state.setBarWeight)
export const useSelectedPlates = () => useSettingsStore((state) => state.selectedPlates)
export const useTogglePlate = () => useSettingsStore((state) => state.togglePlate)
export const usePlateQuantities = () => useSettingsStore((state) => state.plateQuantities)
export const useSetPlateQuantity = () => useSettingsStore((state) => state.setPlateQuantity)
