// Incrementar esta versión en cada actualización de archivos compartidos.
// Evita que la primera visita reciba una cabecera/footer antiguos desde el SW.
const CACHE_NAME = 'cochecierto-shell-v10';
const SHELL = ['./', './como-funciona/', './que-analizamos/', './demo/', './casos-reales/', './recursos/', './recursos/checklist-inspeccion.html', './theme.css', './theme.js', './site-header.js', './favicon.svg', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.all(SHELL.map(url => fetch(url).then(response => {
    if (response.ok) return cache.put(url, response);
  }).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith((async () => {
    // Las páginas deben consultar la red primero para no ocultar un despliegue nuevo.
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
      try {
        const fresh = await fetch(event.request, { cache: 'no-store' });
        if (fresh.ok) {
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, fresh.clone())));
          return fresh;
        }
      } catch (_) {}
      return caches.match(event.request) || caches.match('./') || Response.error();
    }
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
