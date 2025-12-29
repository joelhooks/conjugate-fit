/**
 * Safely gets the length of an array, returning 0 if the array is undefined or null.
 */
export function safeLength(arr: any[] | null | undefined): number {
  if (!arr) return 0
  if (!Array.isArray(arr)) return 0
  return arr.length
}

/**
 * Safely checks if an array is empty, returning true if the array is undefined, null, or empty.
 */
export function isEmpty(arr: any[] | null | undefined): boolean {
  return safeLength(arr) === 0
}

/**
 * Safely checks if an array has items, returning false if the array is undefined, null, or empty.
 */
export function hasItems(arr: any[] | null | undefined): boolean {
  return safeLength(arr) > 0
}

/**
 * Ensures that the provided value is an array.
 * If it's already an array, returns it unchanged.
 * If it's undefined or null, returns an empty array.
 * Otherwise, wraps the value in an array.
 */
export function ensureArray<T>(value: T[] | T | undefined | null): T[] {
  if (value === undefined || value === null) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  return [value]
}

/**
 * Safely gets an item from an array at the specified index.
 * Returns undefined if the array is undefined/null or the index is out of bounds.
 */
export function safeGet<T>(array: T[] | undefined | null, index: number): T | undefined {
  if (!array || !Array.isArray(array) || index < 0 || index >= array.length) {
    return undefined
  }

  return array[index]
}

/**
 * Safely maps over an array, handling undefined/null arrays.
 * If the array is undefined/null, returns an empty array.
 */
export function safeMap<T, U>(array: T[] | undefined | null, mapFn: (item: T, index: number) => U): U[] {
  if (!array || !Array.isArray(array)) {
    return []
  }

  return array.map(mapFn)
}

/**
 * Safely iterates over an array, handling undefined/null arrays.
 * If the array is undefined/null, does nothing.
 */
export function safeForEach<T>(array: T[] | undefined | null, forEachFn: (item: T, index: number) => void): void {
  if (!array || !Array.isArray(array)) {
    return
  }

  array.forEach(forEachFn)
}

/**
 * Safely slices an array, handling undefined/null arrays.
 * If the array is undefined/null, returns an empty array.
 */
export function safeSlice<T>(array: T[] | undefined | null, start?: number, end?: number): T[] {
  if (!array || !Array.isArray(array)) {
    return []
  }

  return array.slice(start, end)
}

/**
 * Safely filters an array, handling undefined/null arrays.
 * If the array is undefined/null, returns an empty array.
 */
export function safeFilter<T>(array: T[] | undefined | null, filterFn: (item: T, index: number) => boolean): T[] {
  if (!array || !Array.isArray(array)) {
    return []
  }

  return array.filter(filterFn)
}

/**
 * Safely finds an item in an array, handling undefined/null arrays.
 * If the array is undefined/null, returns undefined.
 */
export function safeFind<T>(array: T[] | undefined | null, findFn: (item: T, index: number) => boolean): T | undefined {
  if (!array || !Array.isArray(array)) {
    return undefined
  }

  return array.find(findFn)
}

/**
 * Safely checks if some items in an array match a condition, handling undefined/null arrays.
 * If the array is undefined/null, returns false.
 */
export function safeSome<T>(array: T[] | undefined | null, someFn: (item: T, index: number) => boolean): boolean {
  if (!array || !Array.isArray(array)) {
    return false
  }

  return array.some(someFn)
}

/**
 * Safely checks if every item in an array matches a condition, handling undefined/null arrays.
 * If the array is undefined/null, returns false.
 */
export function safeEvery<T>(array: T[] | undefined | null, everyFn: (item: T, index: number) => boolean): boolean {
  if (!array || !Array.isArray(array)) {
    return false
  }

  return array.every(everyFn)
}
