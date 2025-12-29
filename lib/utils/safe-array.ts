/**
 * Ensures that the provided value is an array.
 * If it's already an array, returns it unchanged.
 * If it's undefined or null, returns an empty array.
 * Otherwise, wraps the value in an array.
 */
export function ensureArray<T>(value: T[] | T | undefined | null): T[] {
  if (Array.isArray(value)) {
    return value
  }

  if (value === undefined || value === null) {
    return []
  }

  return [value]
}

/**
 * Safely gets an item from an array at the specified index.
 * Returns undefined if the array is undefined/null or the index is out of bounds.
 */
export function safeArrayGet<T>(array: T[] | undefined | null, index: number): T | undefined {
  if (!array || !Array.isArray(array) || index < 0 || index >= array.length) {
    return undefined
  }

  return array[index]
}

/**
 * Safely maps over an array, handling undefined/null arrays.
 * If the array is undefined/null, returns an empty array.
 */
export function safeArrayMap<T, U>(array: T[] | undefined | null, mapFn: (item: T, index: number) => U): U[] {
  if (!array || !Array.isArray(array)) {
    return []
  }

  return array.map(mapFn)
}
