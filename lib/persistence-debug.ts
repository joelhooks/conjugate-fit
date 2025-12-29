import { errorTracker, ErrorCategory } from "@/lib/error-tracking"

// Function to check all persisted data
export function checkPersistedData(): Record<string, any> {
  if (typeof window === "undefined") {
    return { error: "Not running in browser environment" }
  }

  try {
    const persistedData: Record<string, any> = {}
    const conjugateFitnessKeys: string[] = []

    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("conjugate-fitness-")) {
        conjugateFitnessKeys.push(key)
      }
    }

    // Get data for each key
    for (const key of conjugateFitnessKeys) {
      try {
        const item = localStorage.getItem(key)
        if (item) {
          persistedData[key] = JSON.parse(item)
        }
      } catch (e) {
        persistedData[key] = { error: "Failed to parse JSON" }
      }
    }

    errorTracker.debug(ErrorCategory.PERSISTENCE, "Checked persisted data", {
      component: "persistence-debug",
      action: "checkPersistedData",
      state: { keys: conjugateFitnessKeys.length },
    })

    return persistedData
  } catch (e) {
    errorTracker.trackError(ErrorCategory.PERSISTENCE, e as Error, {
      component: "persistence-debug",
      action: "checkPersistedData",
      message: "Error checking persisted data",
    })
    return { error: "Failed to check persisted data" }
  }
}

// Function to clear all persisted data
export function clearAllPersistedData(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const conjugateFitnessKeys: string[] = []

    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("conjugate-fitness-")) {
        conjugateFitnessKeys.push(key)
      }
    }

    // Remove each key
    for (const key of conjugateFitnessKeys) {
      localStorage.removeItem(key)
    }

    errorTracker.info(ErrorCategory.PERSISTENCE, "Cleared all persisted data", {
      component: "persistence-debug",
      action: "clearAllPersistedData",
      state: { keysRemoved: conjugateFitnessKeys.length },
    })

    return true
  } catch (e) {
    errorTracker.trackError(ErrorCategory.PERSISTENCE, e as Error, {
      component: "persistence-debug",
      action: "clearAllPersistedData",
      message: "Error clearing persisted data",
    })
    return false
  }
}

// Function to export all persisted data as JSON
export function exportPersistedData(): string {
  const data = checkPersistedData()
  return JSON.stringify(data, null, 2)
}

// Function to import persisted data from JSON
export function importPersistedData(jsonData: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const data = JSON.parse(jsonData)

    // Clear existing data first
    clearAllPersistedData()

    // Import each key
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith("conjugate-fitness-")) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    }

    errorTracker.info(ErrorCategory.PERSISTENCE, "Imported persisted data", {
      component: "persistence-debug",
      action: "importPersistedData",
      state: { keysImported: Object.keys(data).length },
    })

    return true
  } catch (e) {
    errorTracker.trackError(ErrorCategory.PERSISTENCE, e as Error, {
      component: "persistence-debug",
      action: "importPersistedData",
      message: "Error importing persisted data",
    })
    return false
  }
}
