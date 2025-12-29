"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Add global error handler
    const errorHandler = (event: ErrorEvent) => {
      console.error("Caught in ErrorBoundary:", event.error)
      setError(event.error)
      setHasError(true)
      // Prevent the error from bubbling up
      event.preventDefault()
    }

    // Add unhandled promise rejection handler
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled Promise Rejection:", event.reason)
      setError(new Error(String(event.reason)))
      setHasError(true)
      // Prevent the rejection from bubbling up
      event.preventDefault()
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 bg-gray-900 rounded-lg">
        <h2 className="text-2xl font-bold text-[hsl(var(--primary))] mb-4">Something went wrong</h2>
        <div className="bg-black/50 p-4 rounded-md w-full max-w-md overflow-auto">
          <p className="text-white mb-2">Error details:</p>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
            {error?.message || "Unknown error"}
            {error?.stack && `\n\n${error.stack}`}
          </pre>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  return <>{children}</>
}
