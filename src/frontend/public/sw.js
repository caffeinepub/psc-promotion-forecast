// PSC Promotion Forecast - Service Worker
// Strategy: Cache-first for static assets, network-first for API/dynamic requests

const CACHE_VERSION = 'v3';
const STATIC_CACHE = 'psc-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'psc-dynamic-' + CACHE_VERSION;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/assets/generated/psc-icon-192.dim_192x192.png',
  '/assets/generated/psc-icon-384.dim_384x384.png',
  '/assets/generated/psc-icon-512.dim_512x512.png',
  '/assets/uploads/banner-2-1-1.jpg',
  '/assets/uploads/WhatsApp-Image-2026-03-05-at-11.42.52-PM-1.png'
];

// ── Install: pre-cache all static assets ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(
        STATIC_ASSETS.map((url) => new Request(url, { cache: 'reload' }))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const CURRENT_CACHES = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !CURRENT_CACHES.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: smart routing ───────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, chrome-extension, and ICP API calls
  if (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.hostname.endsWith('.ic0.app') ||
    url.hostname.endsWith('.icp0.io') ||
    url.hostname.endsWith('ic-api.internetcomputer.org')
  ) {
    return;
  }

  // Cache-first for static assets (JS, CSS, images, fonts, icons)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for navigation and HTML (ensures fresh app shell)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(staleWhileRevalidate(request));
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function isStaticAsset(url) {
  return (
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/.test(url.pathname)
  );
}

// Cache-first: return cached version immediately, fall back to network
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline – asset not cached.', { status: 503 });
  }
}

// Network-first: try network, fall back to cache, then offline page
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request) || await caches.match('/');
    if (cached) return cached;
    return new Response(offlinePage(), {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Stale-while-revalidate: return cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || await networkFetch || new Response('Offline', { status: 503 });
}

// Simple offline fallback page
function offlinePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PSC Promotion Forecast – Offline</title>
  <style>
    body { margin: 0; font-family: sans-serif; background: #0f1a2e; color: #e2e8f0;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p  { color: #94a3b8; }
    button { margin-top: 1rem; padding: 0.75rem 1.5rem; background: #1e3a5f;
             color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; }
  </style>
</head>
<body>
  <div>
    <h1>You are offline</h1>
    <p>Please check your internet connection and try again.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body>
</html>`;
}
