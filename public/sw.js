const CACHE_NAME = 'book-app-v1';

// インストール時
self.addEventListener('install', () => {
  self.skipWaiting();
});

// アクティベート時
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// フェッチ時の処理
self.addEventListener('fetch', (event) => {
  // ナビゲーションリクエストとAPIはネットワークのみ
  if (event.request.mode === 'navigate' || event.request.url.includes('/api/')) {
    return;
  }

  // 静的アセットのみキャッシュ
  if (event.request.destination === 'image' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});
