const CACHE_NAME = 'cochecierto-shell-v2';
const SHELL = ['./', './como-funciona/', './que-analizamos/', './demo/', './metodologia/', './recursos/', './recursos/checklist-inspeccion.html', './theme.css', './theme.js', './site-header.js', './favicon.svg', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.all(SHELL.map(url => fetch(url).then(response => {
    if (response.ok) return cache.put(url, response);
  }).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) {
      event.waitUntil(fetch(event.request).then(response => {
        if (response.ok) return caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      }).catch(() => {}));
      return cached;
    }
    try {
      const response = await Promise.race([
        fetch(event.request),
        new Promise((_, reject) => setTimeout(() => reject(new Error('network-timeout')), 3500))
      ]);
      if (response.ok) event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())));
      return response;
    } catch (_) {
      return caches.match('./') || Response.error();
    }
  })());
});
