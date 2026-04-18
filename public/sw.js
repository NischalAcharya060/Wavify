// Wavify Service Worker
const VERSION = 'wavify-v1'
const STATIC_CACHE = `${VERSION}-static`
const RUNTIME_CACHE = `${VERSION}-runtime`
const IMAGE_CACHE = `${VERSION}-images`

// Pre-cache the app shell. Keep this short — Next.js asset URLs are hashed
// and will be picked up by the runtime caching strategy on first visit.
const APP_SHELL = [
    '/',
    '/home',
    '/offline',
    '/manifest.json',
    '/icons/icon.svg',
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) =>
            cache.addAll(APP_SHELL).catch(() => {
                // Ignore individual failures so install can still complete
            })
        ).then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => !key.startsWith(VERSION))
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    )
})

// Network-first for HTML documents so users always get fresh UI,
// falling back to cache when offline.
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName)
    try {
        const response = await fetch(request)
        if (response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone())
        }
        return response
    } catch (err) {
        const cached = await cache.match(request)
        if (cached) return cached
        // Fallback chain: cached root shell → dedicated offline page → error
        const shell = await cache.match('/home') || await cache.match('/')
        if (shell) return shell
        const offline = await caches.match('/offline')
        if (offline) return offline
        throw err
    }
}

// Cache-first for hashed static assets (_next/static) and images.
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response && response.status === 200) {
        cache.put(request, response.clone())
    }
    return response
}

// Stale-while-revalidate for everything else we want cached.
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)
    const network = fetch(request).then((response) => {
        if (response && response.status === 200) {
            cache.put(request, response.clone())
        }
        return response
    }).catch(() => cached)
    return cached || network
}

self.addEventListener('fetch', (event) => {
    const { request } = event
    if (request.method !== 'GET') return

    const url = new URL(request.url)

    // Never intercept cross-origin requests except images we want to cache
    const sameOrigin = url.origin === self.location.origin
    const isYouTubeThumb = /img\.youtube\.com|i\.ytimg\.com/.test(url.hostname)

    // Skip anything related to YouTube iframe playback / googlevideo streams —
    // we never want to cache those and intercepting can break playback.
    if (/youtube\.com\/(embed|iframe_api|youtubei)|googlevideo\.com|youtube-nocookie\.com/.test(url.hostname + url.pathname)) {
        return
    }

    // Skip Supabase / auth network calls so offline state is handled by the app.
    if (/supabase\.co|supabase\.in/.test(url.hostname)) {
        return
    }

    // HTML navigations — network-first
    if (request.mode === 'navigate' || (request.destination === 'document' && sameOrigin)) {
        event.respondWith(networkFirst(request, RUNTIME_CACHE))
        return
    }

    // Hashed Next.js static assets — cache-first
    if (sameOrigin && url.pathname.startsWith('/_next/static/')) {
        event.respondWith(cacheFirst(request, STATIC_CACHE))
        return
    }

    // Images (local + YouTube thumbnails) — cache-first with image cache
    if (request.destination === 'image' || isYouTubeThumb) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE))
        return
    }

    // Other same-origin GETs — stale-while-revalidate
    if (sameOrigin) {
        event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
    }
})

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting()
})
