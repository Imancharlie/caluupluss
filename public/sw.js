// No-op Service Worker: disables caching and clears existing caches
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      await self.clients.claim();
    })()
  );
});

// Do not intercept fetch; let all requests go directly to the network