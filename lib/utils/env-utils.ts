/**
 * Checks if the current environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}

/**
 * Checks if the current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Checks if the code is running on the client side
 */
export function isClient(): boolean {
  return typeof window !== "undefined"
}

/**
 * Checks if the code is running on the server side
 */
export function isServer(): boolean {
  return typeof window === "undefined"
}
