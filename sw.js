const CACHE_NAME = 'dww-core-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon.svg'
];

// Installiert den Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Lädt Daten aus dem Cache, wenn offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Gibt Cache zurück oder fetcht neu aus dem Netz
        return response || fetch(event.request);
      })
  );
});
