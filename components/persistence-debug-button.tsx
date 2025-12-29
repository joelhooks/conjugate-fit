"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { logPersistedData, clearAllPersistedStores } from "@/lib/stores/persistence"

export default function PersistenceDebugButton() {
  const [showDebug, setShowDebug] = useState(false)
  const [persistedData, setPersistedData] = useState<Record<string, any>>({})

  const handleCheckPersistence = () => {
    try {
      // Log persisted data to console
      logPersistedData()

      // Get persisted data for display
      const data: Record<string, any> = {}

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("conjugate-fitness-")) {
          try {
            const value = localStorage.getItem(key)
            if (value) {
              data[key] = JSON.parse(value)
            }
          } catch (e) {
            data[key] = "Error parsing JSON"
          }
        }
      }

      setPersistedData(data)
      setShowDebug(true)
    } catch (e) {
      console.error("Failed to check persistence:", e)
    }
  }

  const handleClearPersistence = () => {
    if (confirm("Are you sure you want to clear all persisted data? This cannot be undone.")) {
      clearAllPersistedStores()
      setPersistedData({})
      window.location.reload()
    }
  }

  return (
    <>
      <Button
        onClick={handleCheckPersistence}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40 bg-gray-800 text-white opacity-70 hover:opacity-100"
      >
        Debug Storage
      </Button>

      {showDebug && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-4 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[hsl(var(--primary))]">Persisted Data</h2>
              <div className="flex space-x-2">
                <Button onClick={handleClearPersistence} variant="destructive" size="sm">
                  Clear All Data
                </Button>
                <Button onClick={() => setShowDebug(false)} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </div>

            {Object.keys(persistedData).length === 0 ? (
              <p className="text-gray-400">No persisted data found.</p>
            ) : (
              <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded overflow-auto">
                {JSON.stringify(persistedData, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </>
  )
}
