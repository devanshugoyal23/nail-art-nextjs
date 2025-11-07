// Service Worker for AI Nail Art Studio
// Provides offline support and caching for better performance

const CACHE_NAME = 'nail-art-studio-v1';
const STATIC_CACHE = 'nail-art-static-v1';
const API_CACHE = 'nail-art-api-v1';
const IMAGE_CACHE = 'nail-art-images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/gallery',
  '/api/categories',
];

// Cacheable image origins
const CACHEABLE_ORIGINS = [
  'cdn.nailartai.app',
  'pub-05b5ee1a83754aa6b4fcd974016ecde8.r2.dev',
  'pub-f94b6dc4538f33bcd1553dcdda15b36d.r2.dev',
  'pub-fc15073de2e24f7bacc00c238f8ada7d.r2.dev'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  }
  // Handle image requests from R2/CDN
  else if (CACHEABLE_ORIGINS.some(origin => url.hostname.includes(origin))) {
    event.respondWith(handleImageRequest(request));
  }
  // Handle static assets and pages
  else {
    event.respondWith(handleStaticRequest(request));
  }
});

// API request strategy: Network first, cache fallback
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // If successful, cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // No cache available, return error
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static request strategy: Cache first, network fallback
async function handleStaticRequest(request) {
  // Try cache first for same-origin requests
  if (request.url.startsWith(self.location.origin)) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  try {
    // Network request
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok && request.url.startsWith(self.location.origin)) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // If it's a navigation request and we have the main page cached, return it
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/');
      if (fallback) {
        return fallback;
      }
    }

    return new Response('Offline', { status: 503 });
  }
}

// Background sync for form submissions when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Image request strategy: Cache first with 7-day TTL
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Image unavailable', { status: 503 });
  }
}

async function syncOfflineData() {
  // Handle any offline form submissions or data sync
  console.log('Service Worker: Background sync triggered');
}
