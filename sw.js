const CACHE_NAME = 'urusduit-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install: pre-cache core assets, then activate immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: delete old caches and take control of open pages right away
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first for navigation/HTML so new deploys show up immediately.
// Falls back to cache only when offline. Other assets use cache-first.
self.addEventListener('fetch', (e) => {
  const isNavigation = e.request.mode === 'navigate' ||
    (e.request.method === 'GET' && e.request.headers.get('accept')?.includes('text/html'));

  if (isNavigation) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return networkResponse;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return networkResponse;
      });
    })
  );
});
