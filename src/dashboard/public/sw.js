// ═══════════════════════════════════════════════════
//   FREENZY.IO — Service Worker (PWA)
//   Cache-first for static, network-first for API
// ═══════════════════════════════════════════════════

const CACHE_NAME = 'fz-cache-v1';

// App shell resources to pre-cache on install
const APP_SHELL = [
  '/',
  '/client/dashboard',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0',
];

// ─── Install: cache app shell ──────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        // Some resources may fail (e.g. Google Fonts cross-origin)
        // Continue install even if some fail
        console.warn('[SW] Some app shell resources failed to cache:', err);
        return Promise.resolve();
      });
    })
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

// ─── Activate: clean old caches ────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function isStaticAsset(url) {
  const pathname = new URL(url).pathname;
  return (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.ttf') ||
    pathname.endsWith('.otf') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.ico')
  );
}

function isApiCall(url) {
  const pathname = new URL(url).pathname;
  return pathname.startsWith('/api/') || pathname.startsWith('/admin/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// ─── Cache-first strategy (for static assets) ─────────────────────────────

async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const networkResponse = await fetch(request);

    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // If nothing in cache, return a basic offline response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// ─── Network-first strategy (for API calls) ───────────────────────────────

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful GET responses for offline fallback
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed — try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return JSON error for API calls
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'Vous êtes hors ligne. Réessayez plus tard.',
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ─── Stale-while-revalidate (for navigation / HTML pages) ─────────────────

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached immediately if available, otherwise wait for network
  if (cached) {
    // Trigger revalidation in background
    networkFetch;
    return cached;
  }

  const networkResponse = await networkFetch;
  if (networkResponse) {
    return networkResponse;
  }

  // Offline fallback for navigation — return the cached app shell
  const shellCached = await cache.match('/client/dashboard');
  if (shellCached) {
    return shellCached;
  }

  return new Response(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Freenzy.io — Hors ligne</title></head>' +
      '<body style="background:#0a0a0f;color:#fff;font-family:sans-serif;display:flex;align-items:center;' +
      'justify-content:center;height:100vh;margin:0;text-align:center">' +
      '<div><h1>Hors ligne</h1><p>Vérifiez votre connexion internet et réessayez.</p></div>' +
      '</body></html>',
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

// ─── Fetch handler ─────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests except for caching purposes
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.startsWith('http')) {
    return;
  }

  // API calls → network first
  if (isApiCall(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets → cache first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests → stale while revalidate
  if (isNavigationRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Everything else → network first
  event.respondWith(networkFirst(request));
});

// ─── Push notifications ────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = {
    title: 'Freenzy.io',
    body: 'Vous avez une nouvelle notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/client/dashboard',
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (e) {
    // If payload is plain text
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || `fz-push-${Date.now()}`,
    data: { url: data.url || '/client/dashboard' },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'dismiss', title: 'Fermer' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ─── Notification click handler ────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/client/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
