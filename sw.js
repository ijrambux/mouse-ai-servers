const CACHE_NAME = 'mouse-ai-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Fetch - simple cache-first for app shell, network for others
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // don't cache remote large files (M3U remote fetch will go to network)
  if (ASSETS.includes(url.pathname) || url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(resp => resp || fetch(event.request).then(r => {
        return caches.open(CACHE_NAME).then(cache => { cache.put(event.request, r.clone()); return r; });
      }).catch(()=> caches.match('/index.html')))
    );
  } else {
    // for cross-origin, just try network and fallback to cache
    event.respondWith(fetch(event.request).catch(()=> caches.match(event.request)));
  }
});