const CORE_CACHE_NAME = 'dcl-guide-v10';
const RUNTIME_CACHE_NAME = `${CORE_CACHE_NAME}-runtime`;
const CORE_ASSETS_TO_CACHE = [
  'index.html',
  'style.css',
  'script.js',
  'ai-query-taxonomy.js',
  'data.js',
  'manifest.json',
  '1772539078755.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

const EXCLUDED_PATHS = new Set(['/api/ai-answer']);
const EXCLUDED_HOSTS = new Set(['api.open-meteo.com']);
const RUNTIME_CACHEABLE_DESTINATIONS = new Set(['document', 'style', 'script', 'image', 'font']);

function isCacheableResponse(response) {
  return Boolean(response) && (response.ok || response.type === 'opaque');
}

function shouldBypassRequest(request) {
  if (request.method !== 'GET') {
    return true;
  }

  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) {
    return true;
  }

  return EXCLUDED_PATHS.has(url.pathname) || EXCLUDED_HOSTS.has(url.hostname);
}

function shouldHandleRuntimeCache(request) {
  if (shouldBypassRequest(request)) {
    return false;
  }

  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    return true;
  }

  return RUNTIME_CACHEABLE_DESTINATIONS.has(request.destination);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS_TO_CACHE.map((asset) => new Request(asset, { cache: 'reload' })));
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== CORE_CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME) {
          return caches.delete(cacheName);
        }
        return null;
      })
    ))
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!shouldHandleRuntimeCache(event.request)) {
    return;
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(event.request);

    const fetchAndCache = async () => {
      const networkResponse = await fetch(event.request);
      if (isCacheableResponse(networkResponse)) {
        const cache = await caches.open(RUNTIME_CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
      }
      return networkResponse;
    };

    if (cachedResponse) {
      event.waitUntil(fetchAndCache().catch(() => null));
      return cachedResponse;
    }

    try {
      return await fetchAndCache();
    } catch (error) {
      if (event.request.mode === 'navigate') {
        return caches.match('index.html');
      }
      throw error;
    }
  })());
});
