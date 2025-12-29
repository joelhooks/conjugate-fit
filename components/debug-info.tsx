"use client"

import { useState, useEffect } from "react"

export default function DebugInfo() {
  const [isVisible, setIsVisible] = useState(false)
  const [info, setInfo] = useState<Record<string, any>>({})

  useEffect(() => {
    // Collect debug information
    const debugInfo = {
      userAgent: window.navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      localStorage: {
        available: (() => {
          try {
            const testKey = "__test__"
            localStorage.setItem(testKey, testKey)
            localStorage.removeItem(testKey)
            return true
          } catch (e) {
            return false
          }
        })(),
        size: (() => {
          try {
            let size = 0
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key) {
                size += key.length + (localStorage.getItem(key)?.length || 0)
              }
            }
            return `~${Math.round(size / 1024)} KB`
          } catch (e) {
            return "Error calculating size"
          }
        })(),
      },
      storageKeys: (() => {
        try {
          return Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(Boolean)
        } catch (e) {
          return ["Error accessing localStorage"]
        }
      })(),
      timestamp: new Date().toISOString(),
    }

    setInfo(debugInfo)
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100 z-50"
        aria-label="Show debug info"
      >
        🐞
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-4 w-full max-w-2xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[hsl(var(--primary))]">Debug Information</h2>
          <button onClick={() => setIsVisible(false)} className="bg-gray-800 text-white p-2 rounded-md">
            Close
          </button>
        </div>
        <pre className="text-xs text-gray-300 whitespace-pre-wrap">{JSON.stringify(info, null, 2)}</pre>
      </div>
    </div>
  )
}
