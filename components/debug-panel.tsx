"use client"

import { useState, useEffect } from "react"
import { errorTracker, ErrorCategory, LogLevel } from "@/lib/error-tracking"
import { hasItems, safeLength, safeFilter, ensureArray } from "@/lib/utils/array-utils"
import { checkServiceWorkerStatus, clearServiceWorkerCaches, resetServiceWorker } from "@/lib/sw-debug"

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"logs" | "state" | "info" | "sw" | "persistence">("logs")
  const [activeLogLevel, setActiveLogLevel] = useState<LogLevel | "all">("all")
  const [swStatus, setSwStatus] = useState<Record<string, any> | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [persistenceData, setPersistenceData] = useState<Record<string, any>>({})

  useEffect(() => {
    // Update logs when panel is opened
    if (isVisible) {
      try {
        const allLogs = errorTracker.getLogs() || []
        setLogs(ensureArray(allLogs))

        // Check service worker status
        checkServiceWorkerStatus().then((status) => {
          setSwStatus(status)
        })
      } catch (error) {
        console.error("Failed to get logs:", error)
        setLogs([])
      }
    }
  }, [isVisible])

  // Filter logs by level
  const filteredLogs =
    activeLogLevel === "all" ? ensureArray(logs) : safeFilter(logs, (log) => log && log.level === activeLogLevel)

  // Handle service worker reset
  const handleSwReset = async () => {
    if (
      confirm(
        "Are you sure you want to reset the service worker? This will clear all caches and unregister all service workers.",
      )
    ) {
      setIsResetting(true)

      try {
        await resetServiceWorker()
        alert("Service worker reset complete. The page will now reload.")
        window.location.reload()
      } catch (error) {
        console.error("Failed to reset service worker:", error)
        alert("Failed to reset service worker. Please try again or reload the page manually.")
      } finally {
        setIsResetting(false)
      }
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-red-600 text-white p-2 rounded-full opacity-70 hover:opacity-100 z-50 flex items-center justify-center w-12 h-12 shadow-lg"
        aria-label="Show debug panel"
      >
        <span className="text-lg">🐞</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2 rounded-md ${activeTab === "logs" ? "bg-[hsl(var(--primary))] text-white" : "bg-gray-800 text-gray-300"}`}
            >
              Logs ({safeLength(logs)})
            </button>
            <button
              onClick={() => setActiveTab("state")}
              className={`px-4 py-2 rounded-md ${activeTab === "state" ? "bg-[hsl(var(--primary))] text-white" : "bg-gray-800 text-gray-300"}`}
            >
              App State
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-md ${activeTab === "info" ? "bg-[hsl(var(--primary))] text-white" : "bg-gray-800 text-gray-300"}`}
            >
              System Info
            </button>
            <button
              onClick={() => {
                setActiveTab("sw")
                checkServiceWorkerStatus().then((status) => {
                  setSwStatus(status)
                })
              }}
              className={`px-4 py-2 rounded-md ${activeTab === "sw" ? "bg-[hsl(var(--primary))] text-white" : "bg-gray-800 text-gray-300"}`}
            >
              Service Worker
            </button>
            <button
              onClick={() => {
                setActiveTab("persistence")
                setPersistenceData(checkPersistedData())
              }}
              className={`px-4 py-2 rounded-md ${activeTab === "persistence" ? "bg-[hsl(var(--primary))] text-white" : "bg-gray-800 text-gray-300"}`}
            >
              Persistence
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                try {
                  errorTracker.clearLogs()
                  setLogs([])
                } catch (error) {
                  console.error("Failed to clear logs:", error)
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Clear Logs
            </button>
            <button onClick={() => setIsVisible(false)} className="bg-gray-800 text-white px-3 py-1 rounded-md">
              Close
            </button>
          </div>
        </div>

        {activeTab === "logs" && (
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setActiveLogLevel("all")}
              className={`px-3 py-1 rounded-md text-sm ${activeLogLevel === "all" ? "bg-gray-700" : "bg-gray-800"}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveLogLevel(LogLevel.DEBUG)}
              className={`px-3 py-1 rounded-md text-sm ${activeLogLevel === LogLevel.DEBUG ? "bg-gray-700" : "bg-gray-800"}`}
            >
              Debug
            </button>
            <button
              onClick={() => setActiveLogLevel(LogLevel.INFO)}
              className={`px-3 py-1 rounded-md text-sm ${activeLogLevel === LogLevel.INFO ? "bg-gray-700" : "bg-gray-800"}`}
            >
              Info
            </button>
            <button
              onClick={() => setActiveLogLevel(LogLevel.WARNING)}
              className={`px-3 py-1 rounded-md text-sm ${activeLogLevel === LogLevel.WARNING ? "bg-gray-700" : "bg-gray-800"}`}
            >
              Warning
            </button>
            <button
              onClick={() => setActiveLogLevel(LogLevel.ERROR)}
              className={`px-3 py-1 rounded-md text-sm ${activeLogLevel === LogLevel.ERROR ? "bg-gray-700" : "bg-gray-800"}`}
            >
              Error
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {activeTab === "logs" && (
            <div className="space-y-4">
              {!hasItems(filteredLogs) ? (
                <div className="text-center py-8 text-gray-400">No logs recorded</div>
              ) : (
                filteredLogs.map((log, index) => {
                  if (!log) return null

                  return (
                    <div key={index} className="bg-gray-800 p-3 rounded-md">
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${getLevelColor(log.level)}`}>
                            {log.level || "unknown"}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(log.category)}`}>
                            {log.category || "unknown"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="font-bold mt-1">{log.error?.message || log.context?.message || "No message"}</div>
                      {log.context && (
                        <div className="mt-2 text-sm">
                          {log.context.component && (
                            <div>
                              <span className="text-gray-400">Component:</span> {log.context.component}
                            </div>
                          )}
                          {log.context.action && (
                            <div>
                              <span className="text-gray-400">Action:</span> {log.context.action}
                            </div>
                          )}
                        </div>
                      )}
                      {log.error?.stack && (
                        <div className="mt-2">
                          <details>
                            <summary className="cursor-pointer text-sm text-gray-400">Stack trace</summary>
                            <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                              {log.error.stack}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === "state" && (
            <div className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold mb-2">Local Storage</h3>
              <pre className="text-xs overflow-auto max-h-[400px] bg-gray-900 p-2 rounded">{formatLocalStorage()}</pre>
            </div>
          )}

          {activeTab === "info" && (
            <div className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold mb-2">System Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">User Agent:</span> {navigator.userAgent}
                </div>
                <div>
                  <span className="text-gray-400">Viewport:</span> {window.innerWidth}x{window.innerHeight}
                </div>
                <div>
                  <span className="text-gray-400">URL:</span> {window.location.href}
                </div>
                <div>
                  <span className="text-gray-400">localStorage Available:</span>{" "}
                  {isLocalStorageAvailable() ? "Yes" : "No"}
                </div>
                <div>
                  <span className="text-gray-400">Timestamp:</span> {new Date().toISOString()}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sw" && (
            <div className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold mb-4">Service Worker Information</h3>

              <div className="mb-4">
                <button
                  onClick={() => {
                    checkServiceWorkerStatus().then((status) => {
                      setSwStatus(status)
                    })
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm mr-2"
                >
                  Refresh Status
                </button>

                <button
                  onClick={handleSwReset}
                  disabled={isResetting}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  {isResetting ? "Resetting..." : "Reset Service Worker"}
                </button>
              </div>

              {swStatus ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">Service Workers Supported:</span>{" "}
                    {swStatus.supported ? "Yes" : "No"}
                  </div>

                  {swStatus.supported && (
                    <>
                      <div>
                        <span className="text-gray-400">Controller Active:</span> {swStatus.controller ? "Yes" : "No"}
                      </div>

                      <div>
                        <span className="text-gray-400">Registrations:</span> {swStatus.registrationCount || 0}
                      </div>

                      {swStatus.registrations && swStatus.registrations.length > 0 && (
                        <div>
                          <h4 className="text-md font-bold mb-2">Registration Details</h4>
                          {swStatus.registrations.map((reg: any, index: number) => (
                            <div key={index} className="bg-gray-900 p-2 rounded-md mb-2">
                              <div>
                                <span className="text-gray-400">Scope:</span> {reg.scope}
                              </div>
                              <div>
                                <span className="text-gray-400">Active:</span> {reg.active ? "Yes" : "No"}
                              </div>
                              <div>
                                <span className="text-gray-400">Installing:</span> {reg.installing ? "Yes" : "No"}
                              </div>
                              <div>
                                <span className="text-gray-400">Waiting:</span> {reg.waiting ? "Yes" : "No"}
                              </div>
                              <div>
                                <span className="text-gray-400">Update Via Cache:</span> {reg.updateViaCache}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <h4 className="text-md font-bold mb-2">Cache Information</h4>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to clear all service worker caches?")) {
                              clearServiceWorkerCaches().then((success) => {
                                if (success) {
                                  alert("Caches cleared successfully")
                                  checkServiceWorkerStatus().then((status) => {
                                    setSwStatus(status)
                                  })
                                } else {
                                  alert("Failed to clear caches")
                                }
                              })
                            }
                          }}
                          className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Clear Caches
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">Loading service worker information...</div>
              )}
              {/* Add a Force Update button */}
              <div className="mt-4">
                <button
                  onClick={async () => {
                    try {
                      const { forceUpdateCheck, hardReloadApp } = await import("@/lib/sw-debug")

                      // Show loading state
                      const buttonEl = document.activeElement as HTMLButtonElement
                      if (buttonEl) {
                        buttonEl.textContent = "Checking for updates..."
                        buttonEl.disabled = true
                      }

                      // Force update check
                      const updateFound = await forceUpdateCheck()

                      if (updateFound) {
                        alert("Update found! The app will reload to apply the update.")
                        hardReloadApp()
                      } else {
                        alert("No updates found or app is already up to date.")
                        // Reset button state
                        if (buttonEl) {
                          buttonEl.textContent = "Force Update Check"
                          buttonEl.disabled = false
                        }
                      }
                    } catch (error) {
                      console.error("Error forcing update:", error)
                      alert("Error checking for updates. Try clearing the cache instead.")
                    }
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded-md text-sm mr-2"
                >
                  Force Update Check
                </button>

                <button
                  onClick={() => {
                    if (confirm("This will perform a hard reload of the app. Continue?")) {
                      import("@/lib/sw-debug").then(({ hardReloadApp }) => {
                        hardReloadApp()
                      })
                    }
                  }}
                  className="bg-orange-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Hard Reload App
                </button>
              </div>
            </div>
          )}

          {activeTab === "persistence" && (
            <div className="bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-bold mb-4">Persisted Data</h3>

              <div className="mb-4 flex space-x-2">
                <button
                  onClick={() => {
                    setPersistenceData(checkPersistedData())
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Refresh Data
                </button>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all persisted data? This cannot be undone.")) {
                      clearAllPersistedData()
                      setPersistenceData({})
                    }
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Clear All Data
                </button>

                <button
                  onClick={() => {
                    const dataStr = exportPersistedData()
                    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

                    const exportFileDefaultName = `conjugate-fitness-data-${new Date().toISOString().slice(0, 10)}.json`

                    const linkElement = document.createElement("a")
                    linkElement.setAttribute("href", dataUri)
                    linkElement.setAttribute("download", exportFileDefaultName)
                    linkElement.click()
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Export Data
                </button>

                <label className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer">
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const content = event.target?.result as string
                          if (content) {
                            if (
                              confirm("Are you sure you want to import this data? This will overwrite existing data.")
                            ) {
                              importPersistedData(content)
                              setPersistenceData(checkPersistedData())
                            }
                          }
                        }
                        reader.readAsText(file)
                      }
                    }}
                  />
                </label>
              </div>

              <pre className="text-xs overflow-auto max-h-[400px] bg-gray-900 p-2 rounded">
                {JSON.stringify(persistenceData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Debug Panel v1.1 - All logs are stored locally on your device
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getCategoryColor(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.STORE:
      return "bg-blue-600 text-white"
    case ErrorCategory.COMPONENT:
      return "bg-purple-600 text-white"
    case ErrorCategory.CALCULATION:
      return "bg-yellow-600 text-black"
    case ErrorCategory.INPUT:
      return "bg-green-600 text-white"
    case ErrorCategory.PERSISTENCE:
      return "bg-orange-600 text-white"
    default:
      return "bg-red-600 text-white"
  }
}

function getLevelColor(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG:
      return "bg-gray-500 text-white"
    case LogLevel.INFO:
      return "bg-blue-500 text-white"
    case LogLevel.WARNING:
      return "bg-yellow-500 text-black"
    case LogLevel.ERROR:
      return "bg-red-500 text-white"
    default:
      return "bg-gray-600 text-white"
  }
}

function formatDate(dateString: string): string {
  try {
    if (!dateString) return "Unknown date"
    const date = new Date(dateString)
    return date.toLocaleString()
  } catch (e) {
    return dateString || "Unknown date"
  }
}

function formatLocalStorage(): string {
  try {
    const items: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          const value = localStorage.getItem(key)
          if (value && key.includes("conjugate-fitness")) {
            items[key] = JSON.parse(value)
          }
        } catch (e) {
          items[key] = "Error parsing value"
        }
      }
    }
    return JSON.stringify(items, null, 2)
  } catch (e) {
    return "Error accessing localStorage"
  }
}

function isLocalStorageAvailable(): boolean {
  try {
    const test = "__test__"
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

// Persistence helper functions
function checkPersistedData(): Record<string, any> {
  // Implement logic to check persisted data
  return {}
}

function clearAllPersistedData(): void {
  // Implement logic to clear all persisted data
}

function exportPersistedData(): string {
  // Implement logic to export persisted data
  return "{}"
}

function importPersistedData(data: string): void {
  // Implement logic to import persisted data
}
