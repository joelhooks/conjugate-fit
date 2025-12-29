import { errorTracker, ErrorCategory } from "@/lib/error-tracking"

// Function to check service worker status
export function checkServiceWorkerStatus(): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    if (!("serviceWorker" in navigator)) {
      resolve({
        supported: false,
        message: "Service Workers are not supported in this browser",
      })
      return
    }

    const status: Record<string, any> = {
      supported: true,
      controller: !!navigator.serviceWorker.controller,
      registrations: [],
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        status.registrationCount = registrations.length

        const regDetails = registrations.map((reg) => ({
          scope: reg.scope,
          active: !!reg.active,
          installing: !!reg.installing,
          waiting: !!reg.waiting,
          updateViaCache: reg.updateViaCache,
        }))

        status.registrations = regDetails

        // Log to error tracker
        errorTracker.debug(ErrorCategory.PERSISTENCE, "Service Worker status check", {
          component: "sw-debug",
          action: "checkStatus",
          message: "Service Worker status information",
          state: status,
        })

        resolve(status)
      })
      .catch((error) => {
        status.error = error.message

        errorTracker.trackError(ErrorCategory.PERSISTENCE, error, {
          component: "sw-debug",
          action: "checkStatus",
          message: "Error checking Service Worker status",
        })

        resolve(status)
      })
  })
}

// Function to clear service worker caches
export function clearServiceWorkerCaches(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!("caches" in window)) {
      resolve(false)
      return
    }

    caches
      .keys()
      .then((cacheNames) => {
        const deletionPromises = cacheNames
          .filter((name) => name.startsWith("conjugate-fitness-"))
          .map((name) => {
            console.log(`[App] Deleting cache: ${name}`)
            return caches.delete(name)
          })

        return Promise.all(deletionPromises)
      })
      .then(() => {
        errorTracker.info(ErrorCategory.PERSISTENCE, "Service Worker caches cleared", {
          component: "sw-debug",
          action: "clearCaches",
          message: "All Service Worker caches have been cleared",
        })

        resolve(true)
      })
      .catch((error) => {
        errorTracker.trackError(ErrorCategory.PERSISTENCE, error, {
          component: "sw-debug",
          action: "clearCaches",
          message: "Error clearing Service Worker caches",
        })

        resolve(false)
      })
  })
}

// Function to unregister all service workers
export function unregisterServiceWorkers(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!("serviceWorker" in navigator)) {
      resolve(false)
      return
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        const unregisterPromises = registrations.map((registration) => {
          console.log(`[App] Unregistering service worker: ${registration.scope}`)
          return registration.unregister()
        })

        return Promise.all(unregisterPromises)
      })
      .then((results) => {
        const allUnregistered = results.every((result) => result === true)

        errorTracker.info(ErrorCategory.PERSISTENCE, "Service Workers unregistered", {
          component: "sw-debug",
          action: "unregister",
          message: `${results.filter((r) => r).length} Service Workers have been unregistered`,
          state: { allUnregistered, results },
        })

        resolve(allUnregistered)
      })
      .catch((error) => {
        errorTracker.trackError(ErrorCategory.PERSISTENCE, error, {
          component: "sw-debug",
          action: "unregister",
          message: "Error unregistering Service Workers",
        })

        resolve(false)
      })
  })
}

// Function to perform a full reset of service workers and caches
export async function resetServiceWorker(): Promise<boolean> {
  try {
    // First clear all caches
    await clearServiceWorkerCaches()

    // Then unregister all service workers
    await unregisterServiceWorkers()

    // Log success
    errorTracker.info(ErrorCategory.PERSISTENCE, "Service Worker reset complete", {
      component: "sw-debug",
      action: "reset",
      message: "Service Worker caches cleared and registrations removed",
    })

    return true
  } catch (error) {
    errorTracker.trackError(ErrorCategory.PERSISTENCE, error as Error, {
      component: "sw-debug",
      action: "reset",
      message: "Error during Service Worker reset",
    })

    return false
  }
}

// Force immediate update check
export async function forceUpdateCheck(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator)) {
      return false
    }

    const registrations = await navigator.serviceWorker.getRegistrations()

    // No registrations, nothing to update
    if (registrations.length === 0) {
      return false
    }

    let updateFound = false

    for (const registration of registrations) {
      try {
        // Force update check
        await registration.update()

        // Wait to see if an update is found
        if (registration.installing || registration.waiting) {
          updateFound = true
        }
      } catch (error) {
        console.error("Error checking for updates:", error)
      }
    }

    return updateFound
  } catch (error) {
    console.error("Force update check failed:", error)
    return false
  }
}

// Add a button to debug panel that forces a hard reload
export function hardReloadApp() {
  if (typeof window !== "undefined") {
    // Clear application cache if supported
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }

    // Reload skipping cache
    window.location.reload(true)
  }
}
