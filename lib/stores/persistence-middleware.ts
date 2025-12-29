import type { StateCreator, StoreMutatorIdentifier } from "zustand"
import { errorTracker, ErrorCategory } from "@/lib/error-tracking"

// Type for the persistence configuration
export interface PersistOptions<T> {
  name: string
  partialize?: (state: T) => Partial<T>
  version?: number
}

// Type for the persistence middleware
type PersistImpl = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<T, [...Mps], [...Mcs]>,
  options: PersistOptions<T>,
) => StateCreator<T, [...Mps], [...Mcs]>

// Create the persistence middleware
export const persist = (<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<T, [...Mps], [...Mcs]>,
  options: PersistOptions<T>,
): StateCreator<T, [...Mps], [...Mcs]> => {
  const { name, partialize = (state: T) => state as any, version = 1 } = options
  const storageKey = `conjugate-fitness-${name}`

  return (set, get, api) => {
    // Load persisted state on initialization
    if (typeof window !== "undefined") {
      try {
        const persistedString = localStorage.getItem(storageKey)
        if (persistedString) {
          try {
            const { state, version: storedVersion } = JSON.parse(persistedString)

            // Only use the persisted state if versions match
            if (storedVersion === version) {
              // Merge the persisted state with the initial state
              const initialState = initializer(set, get, api)
              const mergedState = { ...initialState, ...state }

              errorTracker.debug(ErrorCategory.PERSISTENCE, `Loaded persisted state for ${name}`, {
                component: "persistence-middleware",
                action: "init",
                state: { key: storageKey },
              })

              // Return the merged state
              return mergedState
            }
          } catch (e) {
            // If parsing fails, just continue with initial state
            errorTracker.warning(ErrorCategory.PERSISTENCE, `Failed to parse persisted state for ${name}`, {
              component: "persistence-middleware",
              action: "init",
              message: `Error parsing persisted state: ${e instanceof Error ? e.message : String(e)}`,
            })
          }
        }
      } catch (error) {
        errorTracker.trackError(ErrorCategory.PERSISTENCE, error as Error, {
          component: "persistence-middleware",
          action: "init",
          message: `Error loading persisted state for ${name}`,
          state: { key: storageKey },
        })
      }
    }

    // Initialize the store with the original config
    const initialState = initializer(
      // Wrap the set function to persist state on every update
      (state, replace) => {
        set(state, replace)

        if (typeof window !== "undefined") {
          try {
            const persistedState = partialize(get())
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                state: persistedState,
                version,
              }),
            )

            errorTracker.debug(ErrorCategory.PERSISTENCE, `Persisted state for ${name}`, {
              component: "persistence-middleware",
              action: "set",
              state: { key: storageKey },
            })
          } catch (error) {
            errorTracker.trackError(ErrorCategory.PERSISTENCE, error as Error, {
              component: "persistence-middleware",
              action: "set",
              message: `Error persisting state for ${name}`,
              state: { key: storageKey },
            })
          }
        }
      },
      get,
      api,
    )

    return initialState
  }
}) as PersistImpl
