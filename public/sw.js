var CACHE = 'hopscotch-v1'
self.addEventListener('install', function(e) { self.skipWaiting() })
self.addEventListener('activate', function(e) { e.waitUntil(self.clients.claim()) })
self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('basemaps.cartocdn.com')) {
    e.respondWith(caches.open(CACHE).then(function(c) {
      return c.match(e.request).then(function(r) {
        if (r) return r
        return fetch(e.request).then(function(resp) { c.put(e.request, resp.clone()); return resp })
      })
    }))
  }
})
