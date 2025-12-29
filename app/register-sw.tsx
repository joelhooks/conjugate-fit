"use client"

import { useEffect, useState } from "react"
import { errorTracker, ErrorCategory } from "@/lib/error-tracking"

export default function RegisterServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [updateAttempted, setUpdateAttempted] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register the service worker
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { updateViaCache: "none" }) // Prevent browser cache from interfering
          .then((registration) => {
            console.log("[App] Service Worker registered:", registration)

            // Check for updates every 15 minutes (was 60 mins)
            const updateCheckInterval = setInterval(() => checkForUpdates(registration), 15 * 60 * 1000)

            // Check for updates immediately
            checkForUpdates(registration)

            // Handle updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing

              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("[App] New service worker installed but waiting")
                    // New service worker is installed but waiting to activate
                    setUpdateAvailable(true)

                    errorTracker.info(ErrorCategory.PERSISTENCE, "New service worker version available", {
                      component: "RegisterServiceWorker",
                      action: "updatefound",
                      message: "New service worker version is available but waiting to activate",
                    })
                  }
                })
              }
            })

            // Clean up interval on unmount
            return () => clearInterval(updateCheckInterval)
          })
          .catch((error) => {
            console.error("[App] Service Worker registration failed:", error)

            errorTracker.trackError(ErrorCategory.PERSISTENCE, error, {
              component: "RegisterServiceWorker",
              action: "register",
              message: "Service Worker registration failed",
            })
          })

        // Handle controller change (when a new service worker takes over)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          errorTracker.info(ErrorCategory.PERSISTENCE, "Service worker controller changed", {
            component: "RegisterServiceWorker",
            action: "controllerchange",
            message: "New service worker has taken control",
          })

          // Only reload if we haven't already reloaded
          if (!document.hidden && !updateAttempted) {
            console.log("[App] New service worker activated, reloading for fresh content")
            setUpdateAttempted(true)
            window.location.reload()
          }
        })
      })
    }
  }, [updateAttempted])

  // Function to check for service worker updates
  const checkForUpdates = (registration: ServiceWorkerRegistration) => {
    // Force update check from server, bypassing the browser cache
    registration.update().catch((error) => {
      console.error("[App] Error checking for service worker updates:", error)
    })

    // Check if there's a waiting service worker
    if (registration.waiting) {
      console.log("[App] Waiting service worker detected")
      setUpdateAvailable(true)
      return
    }

    // Check the current version
    if (navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.version) {
          setCurrentVersion(event.data.version)

          errorTracker.debug(ErrorCategory.PERSISTENCE, "Current service worker version", {
            component: "RegisterServiceWorker",
            action: "checkVersion",
            message: `Current service worker version: ${event.data.version}`,
          })
        }
      }

      navigator.serviceWorker.controller.postMessage({ type: "CHECK_VERSION" }, [messageChannel.port2])
    }
  }

  // Function to apply the update immediately
  const applyUpdate = () => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          // Send message to waiting service worker to skip waiting and activate
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
          setUpdateAvailable(false)
          setUpdateAttempted(true)
        }
      })
    }
  }

  // Render update notification if an update is available
  if (updateAvailable) {
    return (
      <div className="fixed bottom-16 right-4 bg-[hsl(var(--primary))] text-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
        <p className="font-bold mb-2">App Update Available</p>
        <p className="text-sm mb-3">A new version of the app is available.</p>
        <button onClick={applyUpdate} className="bg-white text-[hsl(var(--primary))] px-4 py-2 rounded-md font-bold">
          Update Now
        </button>
      </div>
    )
  }

  return null
}
