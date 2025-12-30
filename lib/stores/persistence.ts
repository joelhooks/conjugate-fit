/**
 * Clear all persisted stores from localStorage.
 * Used for recovery/reset functionality.
 */
export function clearAllPersistedStores(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("conjugate-fitness-")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    return true;
  } catch (e) {
    console.error("Failed to clear persisted stores:", e);
    return false;
  }
}
