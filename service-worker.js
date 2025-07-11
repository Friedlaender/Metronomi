const CACHE_NAME = 'metronom-cache-v1';
const urlsToCache = [
  './', // Cacht index.html wenn es die Root-URL ist
  './index.html',
  './manifest.json',
  './service-worker.js',
  // Optional: Füge './style.css' hinzu, falls du CSS in eine separate Datei auslagerst.
  // Da die Styles derzeit in index.html eingebettet sind, ist dies nicht zwingend.
  
  // Firebase SDKs (falls sie von deiner App benötigt und nicht anders gecacht werden)
  'https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.4.0/firebase-database-compat.js', // Oder firestore, falls verwendet

  // Icons für die PWA
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache geöffnet und Dateien hinzugefügt.');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Fehler beim Caching während der Installation:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache Hit - gib die gecachte Antwort zurück
        if (response) {
          return response;
        }
        // Kein Cache - versuche, die Ressource vom Netzwerk abzurufen
        return fetch(event.request).catch(() => {
          // Fallback für Offline-Fälle (optional: eine Offline-Seite)
          // return caches.match('/offline.html');
          console.log('Service Worker: Offline und Ressource nicht im Cache:', event.request.url);
          return new Response(null, { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Alten Cache löschen:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});