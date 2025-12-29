// خدمة بسيطة لتخزين موارد الواجهة (cache-first for app shell)
const CACHE_NAME = 'mouse-ai-cache-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/sw.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (ASSETS.includes(url.pathname) || url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      return caches.open(CACHE_NAME).then(cache => { try { cache.put(e.request, res.clone()); } catch(e){} return res; });
    }).catch(()=> caches.match('/index.html'))));
  } else {
    e.respondWith(fetch(e.request).catch(()=> caches.match(e.request)));
  }
});
