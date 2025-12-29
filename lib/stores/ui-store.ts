import { create } from "zustand"

interface UIState {
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}))

// Helper hooks
export const useIsLoading = () => useUIStore((state) => state.isLoading)
export const useSetIsLoading = () => useUIStore((state) => state.setIsLoading)
