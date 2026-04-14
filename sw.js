const APP_BUILD_ID = '2026-04-15-ai-search-section-guide-v11';
const CORE_CACHE_NAME = `dcl-guide-${APP_BUILD_ID}`;
const RUNTIME_CACHE_NAME = `${CORE_CACHE_NAME}-runtime`;
const VERSIONED_CORE_ASSETS = [
  'style.css',
  'script.js',
  'ai-entity-registry.js',
  'ai-query-taxonomy.js',
  'data.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
].map((asset) => `${asset}?v=${APP_BUILD_ID}`);
const CORE_ASSETS_TO_CACHE = [
  'index.html',
  ...VERSIONED_CORE_ASSETS,
  '1772539078755.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

const EXCLUDED_PATHS = new Set(['/api/ai-answer']);
const EXCLUDED_HOSTS = new Set(['api.open-meteo.com']);
const RUNTIME_CACHEABLE_DESTINATIONS = new Set(['document', 'style', 'script', 'image', 'font']);
const CORE_ASSET_PATHS = new Set(
  CORE_ASSETS_TO_CACHE
    .map((asset) => new URL(asset, self.location.origin).pathname)
    .concat(['/', '/index.html'])
);

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

function isCoreAssetRequest(request) {
  const url = new URL(request.url);
  return url.origin === self.location.origin && (
    request.mode === 'navigate'
    || CORE_ASSET_PATHS.has(url.pathname)
  );
}

async function networkFirstFromCache(request, cacheName, fallbackKey = null) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (isCacheableResponse(networkResponse)) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    if (fallbackKey) {
      const fallbackResponse = await cache.match(fallbackKey);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    throw error;
  }
}

async function staleWhileRevalidateFromCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchAndCache = async () => {
    const networkResponse = await fetch(request);
    if (isCacheableResponse(networkResponse)) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  };

  if (cachedResponse) {
    fetchAndCache().catch(() => null);
    return cachedResponse;
  }

  return fetchAndCache();
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
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CORE_CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );

      await self.clients.claim();

      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(
        clients.map((client) => client.navigate(client.url).catch(() => null))
      );
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (!shouldHandleRuntimeCache(event.request)) {
    return;
  }

  event.respondWith((async () => {
    try {
      if (isCoreAssetRequest(event.request)) {
        return await networkFirstFromCache(
          event.request,
          CORE_CACHE_NAME,
          event.request.mode === 'navigate' ? 'index.html' : null
        );
      }

      return await staleWhileRevalidateFromCache(event.request, RUNTIME_CACHE_NAME);
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const coreCache = await caches.open(CORE_CACHE_NAME);
        const fallbackResponse = await coreCache.match('index.html');
        if (fallbackResponse) {
          return fallbackResponse;
        }
      }
      throw error;
    }
  })());
});
