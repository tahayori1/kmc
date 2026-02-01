const CACHE_NAME = 'kmc-app-cache-v5';

// Static assets to cache immediately on install
// Removed '/cars.ts' as it is a source file and typically bundled, avoiding fetch errors.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force new service worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Control all clients immediately
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. API Calls: Network First, fall back to nothing (don't cache errors generally, or implement specific logic)
  // We generally want fresh data for prices and inventory.
  if (url.pathname.startsWith('/webhook') || url.hostname.includes('api.hoseinikhodro.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Optional: Return a cached version if you want offline browsing of old data
        // For now, we let it fail gracefully or return a custom offline JSON
        return new Response(JSON.stringify({ error: "Offline" }), { 
            headers: { 'Content-Type': 'application/json' } 
        });
      })
    );
    return;
  }

  // 2. Images & Fonts: Cache First, then Network
  if (event.request.destination === 'image' || event.request.destination === 'font') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
             // Cache valid responses
            if (networkResponse.ok) {
                 cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 3. HTML & JS (App Shell): Stale-While-Revalidate
  // Serve from cache immediately, but update cache in background for next time
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
           if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
           }
          return networkResponse;
        });
      });
      return cachedResponse || fetchPromise;
    })
  );
});