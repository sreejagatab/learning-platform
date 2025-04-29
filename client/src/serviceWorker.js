/**
 * Service Worker for LearnSphere
 * Provides offline capabilities and caching of static assets
 */

// Cache names
const STATIC_CACHE_NAME = 'learnsphere-static-v1';
const DYNAMIC_CACHE_NAME = 'learnsphere-dynamic-v1';
const CONTENT_CACHE_NAME = 'learnsphere-content-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (
            key !== STATIC_CACHE_NAME && 
            key !== DYNAMIC_CACHE_NAME &&
            key !== CONTENT_CACHE_NAME
          ) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
  
  return self.clients.claim();
});

// Helper function to determine if a request is for an API
const isApiRequest = url => {
  return url.pathname.startsWith('/api/');
};

// Helper function to determine if a request is for a static asset
const isStaticAsset = url => {
  return STATIC_ASSETS.some(asset => url.pathname === asset);
};

// Helper function to determine if a request is for content
const isContentRequest = url => {
  return url.pathname.includes('/content/');
};

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle API requests - Network first, then cache
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const clonedResponse = response.clone();
          
          // Only cache successful responses
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, clonedResponse);
              });
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Handle content requests - Cache first, then network
  if (isContentRequest(url)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            // If found in cache, return it
            return response;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then(networkResponse => {
              // Clone the response to store in cache
              const clonedResponse = networkResponse.clone();
              
              // Only cache successful responses
              if (networkResponse.status === 200) {
                caches.open(CONTENT_CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, clonedResponse);
                  });
              }
              
              return networkResponse;
            });
        })
    );
    return;
  }
  
  // Handle static assets - Cache first, then network
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then(networkResponse => {
              // Clone the response to store in cache
              const clonedResponse = networkResponse.clone();
              
              // Only cache successful responses
              if (networkResponse.status === 200) {
                caches.open(STATIC_CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, clonedResponse);
                  });
              }
              
              return networkResponse;
            });
        })
    );
    return;
  }
  
  // Default strategy - Network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response to store in cache
        const clonedResponse = response.clone();
        
        // Only cache successful responses
        if (response.status === 200) {
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, clonedResponse);
            });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request);
      })
  );
});

// Background sync for offline content creation
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background Syncing', event);
  
  if (event.tag === 'sync-new-content') {
    console.log('[Service Worker] Syncing new content');
    
    event.waitUntil(
      // Get all pending content from IndexedDB
      // This is a placeholder - actual implementation would use IndexedDB
      // to store offline content creations
      Promise.resolve()
        .then(() => {
          // Placeholder for IndexedDB access
          // In a real implementation, we would:
          // 1. Get all pending content from IndexedDB
          // 2. Send each one to the server
          // 3. Remove from IndexedDB if successful
          console.log('[Service Worker] Syncing complete');
        })
    );
  }
});

// Push notification event
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Notification received', event);
  
  let data = { title: 'New Notification', content: 'Something new happened!' };
  
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  
  const options = {
    body: data.content,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: {
      url: data.openUrl || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;
  const url = notification.data.url;
  
  console.log('[Service Worker] Notification click', action);
  
  notification.close();
  
  event.waitUntil(
    clients.matchAll()
      .then(clis => {
        const client = clis.find(c => c.visibilityState === 'visible');
        
        if (client) {
          client.navigate(url);
          client.focus();
        } else {
          clients.openWindow(url);
        }
      })
  );
});
