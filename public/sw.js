/* Network-first: update PWA otomatis saat buka icon — tidak perlu Add to Home Screen ulang */
const CACHE = 'innerly-shell-v3';
const PRECACHE = ['/manifest.webmanifest', '/favicon.png', '/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML + JS + CSS: selalu coba network dulu biar deploy baru kebaca
  const isAppShell =
    request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.startsWith('/_expo/') ||
    url.pathname.match(/\.(js|css)$/);

  if (isAppShell) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok && url.pathname.match(/\.(png|jpg|webp|svg|woff2?|webmanifest)$/)) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
