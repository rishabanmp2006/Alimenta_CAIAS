const CACHE_NAME = 'alimenta-v2';

// Only cache the bare minimum — let Vite handle everything else
const urlsToCache = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept: non-GET, API calls, Vite internals
  if (
    request.method !== 'GET' ||
    request.url.includes('api.anthropic.com') ||
    request.url.includes('openfoodfacts.org') ||
    request.url.includes('/src/') ||
    request.url.includes('@vite') ||
    request.url.includes('@react-refresh') ||
    request.url.startsWith('chrome-extension')
  ) {
    return; // Let browser handle it normally
  }

  // Navigation requests: network first, fallback to cached index
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Everything else: network only, no caching
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
