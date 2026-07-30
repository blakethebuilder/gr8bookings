const CACHE_NAME = 'gr8escape-v5'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }

  // Navigation (HTML): network-first — busts stale index.html on deploy
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }

  // Static assets (chunked with hashes): cache-first
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)))
})
