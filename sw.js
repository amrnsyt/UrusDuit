const CACHE_NAME = 'urusduit-v4-modular';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/core.js',
  '/js/dashboard.js',
  '/js/gaji.js',
  '/js/komitmen.js',
  '/js/hutang.js',
  '/js/tetapan.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

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

// Network-first for EVERYTHING (HTML, JS, CSS): always try to fetch the
// latest deployed file first, only falling back to the cached copy when
// offline. This prevents devices from getting stuck on stale app code
// after a new deploy (previously JS/CSS used cache-first, which could
// serve outdated/buggy files indefinitely).
self.addEventListener('fetch', (e) => {
  const isNavigation = e.request.mode === 'navigate' ||
    (e.request.method === 'GET' && e.request.headers.get('accept')?.includes('text/html'));

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return networkResponse;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || (isNavigation ? caches.match('/index.html') : undefined)))
  );
});
