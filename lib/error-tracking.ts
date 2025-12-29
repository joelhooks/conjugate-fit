import { isDevelopment, isProduction } from "@/lib/utils/env-utils"

// Types of errors we want to track
export enum ErrorCategory {
  STORE = "store",
  COMPONENT = "component",
  CALCULATION = "calculation",
  INPUT = "input",
  PERSISTENCE = "persistence",
  UNKNOWN = "unknown",
}

// Log levels for different types of messages
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

// Error context to provide more information
export interface ErrorContext {
  component?: string
  action?: string
  inputs?: Record<string, any>
  state?: Record<string, any>
  message: string
}

// Log entry interface
export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: ErrorCategory
  error?: {
    name: string
    message: string
    stack?: string
  }
  context?: ErrorContext
  userAgent?: string
  url?: string
}

// Error tracking service
class ErrorTrackingService {
  private logs: LogEntry[] = []
  private maxLogs = 100
  private isEnabled = true

  // Initialize the service
  constructor() {
    try {
      // Try to load previous logs from localStorage
      if (typeof localStorage !== "undefined") {
        const savedLogs = localStorage.getItem("conjugate-fitness-logs")
        if (savedLogs) {
          try {
            const parsedLogs = JSON.parse(savedLogs)
            this.logs = Array.isArray(parsedLogs) ? parsedLogs : []

            // Keep only the most recent logs
            if (this.logs.length > this.maxLogs) {
              this.logs = this.logs.slice(-this.maxLogs)
            }
          } catch (e) {
            console.error("Failed to parse logs:", e)
            this.logs = []
          }
        }
      }

      // Set up global error handler
      if (typeof window !== "undefined") {
        window.addEventListener("error", this.handleGlobalError)
        window.addEventListener("unhandledrejection", this.handleUnhandledRejection)
      }
    } catch (e) {
      console.error("Failed to initialize error tracking:", e)
      this.isEnabled = false
      this.logs = []
    }
  }

  // Log a debug message
  debug(category: ErrorCategory, message: string, context?: Omit<ErrorContext, "message">): void {
    this.log(LogLevel.DEBUG, category, message, context)
  }

  // Log an info message
  info(category: ErrorCategory, message: string, context?: Omit<ErrorContext, "message">): void {
    this.log(LogLevel.INFO, category, message, context)
  }

  // Log a warning message
  warning(category: ErrorCategory, message: string, context?: Omit<ErrorContext, "message">): void {
    this.log(LogLevel.WARNING, category, message, context)
  }

  // Track a specific error with context
  trackError(category: ErrorCategory, error: Error | string, context?: ErrorContext): void {
    if (!this.isEnabled) return

    try {
      const errorObj = typeof error === "string" ? new Error(error) : error

      // Create error entry
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        category,
        error: {
          name: errorObj.name,
          message: errorObj.message,
          stack: errorObj.stack,
        },
        context,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      }

      // Add to logs array
      this.logs.unshift(entry)

      // Keep only the most recent logs
      if (this.logs.length > this.maxLogs) {
        this.logs.pop()
      }

      // Save to localStorage
      this.persistLogs()

      // Store the last error and time for service worker issue detection
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("conjugate-fitness-last-error", errorObj.message)
        localStorage.setItem("conjugate-fitness-last-error-time", Date.now().toString())
      }

      // Log to console in development or as minimal logs in production
      if (isDevelopment()) {
        console.error(`[${category}] Error:`, errorObj, context)
      } else if (isProduction()) {
        // Minimal logging in production
        console.error(`[${category}] Error: ${errorObj.message}`)
      }
    } catch (e) {
      console.error("Failed to track error:", e)
    }
  }

  // Generic log method
  private log(
    level: LogLevel,
    category: ErrorCategory,
    message: string,
    context?: Omit<ErrorContext, "message">,
  ): void {
    if (!this.isEnabled) return

    try {
      // Create log entry
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        category,
        context: context ? { ...context, message } : { message },
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      }

      // Add to logs array
      this.logs.unshift(entry)

      // Keep only the most recent logs
      if (this.logs.length > this.maxLogs) {
        this.logs.pop()
      }

      // Save to localStorage
      this.persistLogs()

      // Log to console in development or only errors/warnings in production
      if (isDevelopment()) {
        const logMethod =
          level === LogLevel.ERROR
            ? console.error
            : level === LogLevel.WARNING
              ? console.warn
              : level === LogLevel.INFO
                ? console.info
                : console.debug
        logMethod(`[${category}][${level}] ${message}`, context)
      } else if (isProduction() && (level === LogLevel.ERROR || level === LogLevel.WARNING)) {
        // Only log errors and warnings in production
        const logMethod = level === LogLevel.ERROR ? console.error : console.warn
        logMethod(`[${category}][${level}] ${message}`)
      }
    } catch (e) {
      console.error("Failed to log message:", e)
    }
  }

  // Handle global errors
  private handleGlobalError = (event: ErrorEvent): void => {
    this.trackError(ErrorCategory.UNKNOWN, event.error || new Error(event.message || "Unknown error"), {
      message: `Global error: ${event.message || "Unknown error"}`,
      component: "window",
      action: "global",
    })
  }

  // Handle unhandled promise rejections
  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason || "Unknown rejection"))
    this.trackError(ErrorCategory.UNKNOWN, error, {
      message: "Unhandled promise rejection",
      component: "promise",
      action: "rejection",
    })
  }

  // Save logs to localStorage
  private persistLogs(): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("conjugate-fitness-logs", JSON.stringify(this.logs || []))
      }
    } catch (e) {
      console.error("Failed to persist logs:", e)
    }
  }

  // Get all tracked logs
  getLogs(): LogEntry[] {
    return [...(this.logs || [])]
  }

  // Get logs of a specific level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return (this.logs || []).filter((log) => log && log.level === level)
  }

  // Get errors only
  getErrors(): LogEntry[] {
    return this.getLogsByLevel(LogLevel.ERROR)
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = []
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("conjugate-fitness-logs")
      }
    } catch (e) {
      console.error("Failed to clear logs:", e)
    }
  }

  // Disable error tracking
  disable(): void {
    this.isEnabled = false
    if (typeof window !== "undefined") {
      window.removeEventListener("error", this.handleGlobalError)
      window.removeEventListener("unhandledrejection", this.handleUnhandledRejection)
    }
  }

  // Enable error tracking
  enable(): void {
    this.isEnabled = true
    if (typeof window !== "undefined") {
      window.addEventListener("error", this.handleGlobalError)
      window.addEventListener("unhandledrejection", this.handleUnhandledRejection)
    }
  }
}

// Create a singleton instance
export const errorTracker = new ErrorTrackingService()

// Helper function to wrap functions with error tracking
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  category: ErrorCategory,
  context: Omit<ErrorContext, "message">,
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args)
    } catch (error) {
      errorTracker.trackError(category, error as Error, {
        ...context,
        message: `Error in ${context.action || "function"}: ${(error as Error).message || "Unknown error"}`,
        inputs: { args },
      })
      throw error
    }
  }
}

// Helper to track array operations safely
export function safeArrayOperation<T, R>(
  array: T[] | undefined | null,
  operation: (arr: T[]) => R,
  fallback: R,
  context: ErrorContext,
): R {
  try {
    if (!array) {
      errorTracker.warning(ErrorCategory.CALCULATION, "Array is undefined or null", {
        ...context,
        action: context.action || "safeArrayOperation",
        component: context.component || "unknown",
      })
      return fallback
    }

    if (!Array.isArray(array)) {
      errorTracker.warning(ErrorCategory.CALCULATION, "Value is not an array", {
        ...context,
        action: context.action || "safeArrayOperation",
        component: context.component || "unknown",
      })
      return fallback
    }

    return operation(array)
  } catch (error) {
    errorTracker.trackError(ErrorCategory.CALCULATION, error as Error, {
      ...context,
      message: `Error performing array operation in ${context.component || "unknown"}: ${(error as Error).message || "Unknown error"}`,
    })
    return fallback
  }
}
