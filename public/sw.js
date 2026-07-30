var CACHE = 'hopscotch-v36'
var SHELL = ['./', './index.html']

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(SHELL) }))
  self.skipWaiting()
})

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(ks) {
      return Promise.all(ks.filter(function(k) { return k !== CACHE }).map(function(k) { return caches.delete(k) }))
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', function(e) {
  var url = e.request.url
  /* tiles: cache-first */
  if (url.includes('basemaps.cartocdn.com')) {
    e.respondWith(caches.open(CACHE).then(function(c) {
      return c.match(e.request).then(function(r) {
        if (r) return r
        return fetch(e.request).then(function(resp) { c.put(e.request, resp.clone()); return resp })
      })
    }))
    return
  }
  /* app shell: stale-while-revalidate */
  if (url.includes('/hopscotch/') && (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.html') || url.endsWith('/'))) {
    e.respondWith(caches.open(CACHE).then(function(c) {
      return c.match(e.request).then(function(r) {
        var net = fetch(e.request).then(function(resp) { c.put(e.request, resp.clone()); return resp }).catch(function() { return r })
        return r || net
      })
    }))
  }
})
