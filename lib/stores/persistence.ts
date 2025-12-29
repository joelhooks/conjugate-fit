import { errorTracker, ErrorCategory } from "@/lib/error-tracking"

// Flag to control persistence
let persistenceEnabled = false

// Function to enable persistence
export function enablePersistence(): boolean {
  try {
    // Test if localStorage is available
    const testKey = "__test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)

    persistenceEnabled = true
    console.log("Persistence enabled")

    // Log all existing persisted data
    logPersistedData()

    return true
  } catch (e) {
    console.error("Failed to enable persistence:", e)
    return false
  }
}

// Check if persistence is enabled
export function isPersistenceEnabled(): boolean {
  return persistenceEnabled
}

// Function to check if a store has been persisted
export function checkStorePersistence(storeName: string): boolean {
  if (typeof window === "undefined") return false

  try {
    const key = `conjugate-fitness-${storeName}`
    return localStorage.getItem(key) !== null
  } catch (e) {
    console.error(`Failed to check persistence for ${storeName}:`, e)
    return false
  }
}

// Function to clear all persisted stores
export function clearAllPersistedStores(): boolean {
  if (typeof window === "undefined") return false

  try {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("conjugate-fitness-")) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })

    errorTracker.info(ErrorCategory.PERSISTENCE, "Cleared all persisted stores", {
      component: "persistence",
      action: "clearAllPersistedStores",
      state: { keysRemoved: keysToRemove.length },
    })

    return true
  } catch (e) {
    console.error("Failed to clear persisted stores:", e)
    return false
  }
}

// Function to log all persisted data
export function logPersistedData(): void {
  if (typeof window === "undefined") return

  try {
    const persistedData: Record<string, any> = {}

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("conjugate-fitness-")) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            persistedData[key] = JSON.parse(value)
          }
        } catch (e) {
          persistedData[key] = "Error parsing JSON"
        }
      }
    }

    errorTracker.debug(ErrorCategory.PERSISTENCE, "Current persisted data", {
      component: "persistence",
      action: "logPersistedData",
      state: persistedData,
    })

    console.log("Persisted data:", persistedData)
  } catch (e) {
    console.error("Failed to log persisted data:", e)
  }
}
