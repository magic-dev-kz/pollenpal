var CACHE_NAME = 'pollenpal-v21.0';
var STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // API requests: network-first
  if (url.hostname.indexOf('open-meteo.com') > -1 ||
      url.hostname.indexOf('nominatim.openstreetmap.org') > -1) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Static assets: cache-first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
