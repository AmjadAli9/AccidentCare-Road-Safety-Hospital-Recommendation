const CACHE_NAME = "accidentcare-cache-v1";
const urlsToCache = ["/", "/index.html", "/styles.css", "/manifest.json"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(name => {
      if (!cacheWhitelist.includes(name)) return caches.delete(name);
    }));
  }));
});
