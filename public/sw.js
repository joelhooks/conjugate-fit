// Service Worker for Conjugate Fitness

const CACHE_VERSION = "v4" // Incremented to force cache refresh
const CACHE_NAME = `conjugate-fitness-${CACHE_VERSION}`
const APP_SHELL_ASSETS = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"]

// Install event - cache core assets
self.addEventListener("install", (event) => {
  console.log(`[Service Worker] Installing new version ${CACHE_VERSION}`)

  // Force the waiting service worker to become the active service worker
  self.skipWaiting()

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log(`[Service Worker] Opened cache ${CACHE_NAME}`)
        return cache.addAll(APP_SHELL_ASSETS)
      })
      .catch((err) => {
        console.error("[Service Worker] Error caching assets:", err)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log(`[Service Worker] Activating new version ${CACHE_VERSION}`)

  // Take control of all clients as soon as the service worker activates
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Remove old caches
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME && cacheName.startsWith("conjugate-fitness-")) {
                console.log(`[Service Worker] Deleting old cache: ${cacheName}`)
                return caches.delete(cacheName)
              }
            }),
          )
        }),
    ]),
  )
})

// Fetch event - network-first strategy for most resources
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // For HTML, JS, CSS, and API requests, always try network first
  if (
    event.request.headers.get("accept")?.includes("text/html") ||
    event.request.url.endsWith(".js") ||
    event.request.url.endsWith(".css") ||
    event.request.url.includes("/api/")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Cache the latest version for future use
          const clonedResponse = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            // Don't cache API responses
            if (!event.request.url.includes("/api/")) {
              cache.put(event.request, clonedResponse)
            }
          })
          return networkResponse
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || Promise.reject(new Error("No network and no cache"))
          })
        }),
    )
    return
  }

  // For other assets (images, fonts, etc.), try cache first, then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Refresh the cache in the background
        fetch(event.request)
          .then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone())
            })
          })
          .catch(() => {})

        return cachedResponse
      }

      // Not in cache, get from network
      return fetch(event.request)
        .then((networkResponse) => {
          const clonedResponse = networkResponse.clone()
          // Add to cache for future use
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse)
          })
          return networkResponse
        })
        .catch((error) => {
          console.error("[Service Worker] Fetch failed:", error)
          // Return a custom offline response if needed
          return new Response("Offline content", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          })
        })
    }),
  )
})

// Listen for update messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[Service Worker] Skip waiting message received")
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CHECK_VERSION") {
    event.ports[0].postMessage({
      version: CACHE_VERSION,
    })
  }
})

// Listen for push notifications
self.addEventListener("push", (event) => {
  // Handle push notifications if needed
})
