// SARAH OS — Service Worker
// Cache-first for static assets, network-first for API calls

const CACHE_NAME = 'sarah-os-v1';

const PRECACHE_URLS = [
  '/client/dashboard',
  '/images/logo.jpg',
];

const STATIC_EXTENSIONS = [
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SARAH OS — Hors ligne</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8f9fa;
      color: #111827;
      padding: 24px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    p {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    button {
      padding: 10px 28px;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      background: #6366f1;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>Vous etes hors ligne</h1>
    <p>
      SARAH OS necessite une connexion Internet pour fonctionner.
      Verifiez votre connexion et reessayez.
    </p>
    <button onclick="window.location.reload()">Reessayer</button>
  </div>
</body>
</html>`;

// ─── Install: Precache essential resources ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS).catch(() => {
          // Precaching is best-effort; don't fail installation
          console.warn('[SW] Some precache URLs could not be fetched');
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: Clean old caches ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: Routing strategy ───
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // API calls: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: cache-first
  const isStatic = STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
  if (isStatic) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});

// ─── Strategy: Cache-first ───
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

// ─── Strategy: Network-first ───
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── Strategy: Network-first with offline fallback page ───
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return offline fallback page
    return new Response(OFFLINE_HTML, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
