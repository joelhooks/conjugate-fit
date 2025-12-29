// Flag to indicate if we're in recovery mode
let isRecoveryMode = false

// Function to clear all localStorage data related to our app
export function clearAllAppData(): void {
  try {
    // Get all keys from localStorage
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes("conjugate-fitness")) {
        keysToRemove.push(key)
      }
    }

    // Remove all keys related to our app
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })

    console.log("Recovery: Cleared all app data from localStorage")
  } catch (error) {
    console.error("Recovery: Failed to clear app data", error)
  }
}

// Function to set recovery mode
export function enableRecoveryMode(): void {
  isRecoveryMode = true
  console.log("Recovery mode enabled")
}

// Function to check if we're in recovery mode
export function isInRecoveryMode(): boolean {
  return isRecoveryMode
}

// Function to add a recovery script to the page
export function injectRecoveryScript(): void {
  try {
    // Create a script element
    const script = document.createElement("script")

    // Set the script content
    script.textContent = `
      try {
        // Function to clear all app data
        function clearAllAppData() {
          try {
            // Get all keys from localStorage
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.includes("conjugate-fitness")) {
                keysToRemove.push(key);
              }
            }
            
            // Remove all keys related to our app
            keysToRemove.forEach(key => {
              localStorage.removeItem(key);
            });
            
            console.log("Recovery: Cleared all app data from localStorage");
            return true;
          } catch (error) {
            console.error("Recovery: Failed to clear app data", error);
            return false;
          }
        }
        
        // Function to reset service worker
        function resetServiceWorker() {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
              for (let registration of registrations) {
                registration.unregister();
                console.log("Recovery: Unregistered service worker");
              }
            });
            
            // Clear caches
            if ('caches' in window) {
              caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                  if (cacheName.includes('conjugate-fitness')) {
                    caches.delete(cacheName);
                    console.log("Recovery: Deleted cache", cacheName);
                  }
                });
              });
            }
            
            return true;
          }
          return false;
        }

        // Add a global error handler
        window.addEventListener('error', function(event) {
          console.error("Global error caught:", event.error);
          
          // Clear all app data
          const clearedData = clearAllAppData();
          const clearedSW = resetServiceWorker();
          
          // Show a message to the user
          if (clearedData || clearedSW) {
            alert("An error occurred. App data and service worker have been reset. Please refresh the page.");
          } else {
            alert("An error occurred. Please try clearing your browser data and refreshing the page.");
          }
        });

        console.log("Recovery script injected");
      } catch (e) {
        console.error("Error in recovery script:", e);
      }
    `

    // Append the script to the document head
    document.head.appendChild(script)

    console.log("Recovery script injected")
  } catch (error) {
    console.error("Failed to inject recovery script", error)
  }
}

// Function to handle service worker issues
export async function handleServiceWorkerIssues(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false
  }

  try {
    // Unregister all service workers
    const registrations = await navigator.serviceWorker.getRegistrations()

    for (const registration of registrations) {
      await registration.unregister()
      console.log("Recovery: Unregistered service worker", registration.scope)
    }

    // Clear all caches
    if ("caches" in window) {
      const cacheNames = await caches.keys()

      for (const cacheName of cacheNames) {
        if (cacheName.includes("conjugate-fitness")) {
          await caches.delete(cacheName)
          console.log("Recovery: Deleted cache", cacheName)
        }
      }
    }

    return true
  } catch (error) {
    console.error("Recovery: Failed to handle service worker issues", error)
    return false
  }
}
