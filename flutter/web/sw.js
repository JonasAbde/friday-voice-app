// Friday Voice App - Service Worker
// Version: 2.0.0
// Purpose: Offline caching, background sync, push notifications

const CACHE_VERSION = 'friday-v2.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_AUDIO = `${CACHE_VERSION}-audio`;

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/main.dart.js',
  '/flutter.js',
  '/flutter_service_worker.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.png'
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE = 50;
const MAX_AUDIO_CACHE = 20;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('friday-') && 
                     cacheName !== CACHE_STATIC &&
                     cacheName !== CACHE_DYNAMIC &&
                     cacheName !== CACHE_AUDIO;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network-first with fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip WebSocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Skip API calls (handle separately)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Audio files - cache-first
  if (request.destination === 'audio' || url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav')) {
    event.respondWith(handleAudioRequest(request));
    return;
  }

  // Static assets - cache-first with network fallback
  if (STATIC_ASSETS.includes(url.pathname) || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Everything else - network-first with cache fallback
  event.respondWith(handleDynamicRequest(request));
});

// Cache-first strategy for static assets
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_STATIC);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached version and update in background
    fetchAndCache(request, CACHE_STATIC);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Static fetch failed:', error);
    return new Response('Offline - asset not cached', { status: 503 });
  }
}

// Network-first strategy for dynamic content
async function handleDynamicRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
      trimCache(CACHE_DYNAMIC, MAX_DYNAMIC_CACHE);
    }
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_DYNAMIC);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Fallback to offline page
    if (request.destination === 'document') {
      const offlinePage = await cache.match('/');
      return offlinePage || new Response('Offline', { status: 503 });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Cache-first for audio files
async function handleAudioRequest(request) {
  const cache = await caches.open(CACHE_AUDIO);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(CACHE_AUDIO, MAX_AUDIO_CACHE);
    }
    return response;
  } catch (error) {
    return new Response('Audio offline', { status: 503 });
  }
}

// Network-only for API calls with offline queuing
async function handleApiRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Queue for background sync if POST/PUT/DELETE
    if (request.method !== 'GET') {
      await queueRequest(request);
      return new Response(JSON.stringify({ queued: true, offline: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 202
      });
    }
    return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

// Background fetch and cache (non-blocking)
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Silent fail - we already have cached version
  }
}

// Trim cache to maximum size (FIFO)
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

// Background Sync - queue requests when offline
async function queueRequest(request) {
  const queue = await getQueue();
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now()
  };
  
  queue.push(requestData);
  await saveQueue(queue);
  
  // Register background sync
  if ('sync' in self.registration) {
    await self.registration.sync.register('sync-queue');
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueue());
  }
});

// Process queued requests
async function syncQueue() {
  const queue = await getQueue();
  const failed = [];
  
  for (const requestData of queue) {
    try {
      await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body
      });
      console.log('[SW] Synced queued request:', requestData.url);
    } catch (error) {
      console.error('[SW] Failed to sync request:', error);
      failed.push(requestData);
    }
  }
  
  await saveQueue(failed);
  
  // Notify clients of sync completion
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      queued: queue.length,
      failed: failed.length
    });
  });
}

// Queue persistence (IndexedDB would be better for production)
async function getQueue() {
  const cache = await caches.open(CACHE_DYNAMIC);
  const response = await cache.match('/__queue__');
  if (response) {
    return await response.json();
  }
  return [];
}

async function saveQueue(queue) {
  const cache = await caches.open(CACHE_DYNAMIC);
  await cache.put('/__queue__', new Response(JSON.stringify(queue), {
    headers: { 'Content-Type': 'application/json' }
  }));
}

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Friday Voice Assistant';
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_QUEUE_SIZE') {
    getQueue().then(queue => {
      event.ports[0].postMessage({ queueSize: queue.length });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ cleared: true });
    });
  }
});

console.log('[SW] Service worker loaded - Friday v2.0.0');
