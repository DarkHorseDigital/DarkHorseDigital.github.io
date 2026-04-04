const CACHE_NAME = 'meat-calculator-v3'; // Увеличьте версию при обновлении

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/style.css',
          '/script.js',
          '/manifest.json'
        ]);
      })
      .then(() => self.skipWaiting()) // Активируем новый SW сразу
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Удаляем старые кэши, которые не соответствуют текущей версии
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Берём под контроль все вкладки
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Если есть в кэше — отдаём из кэша
        if (response) {
          return response;
        }

        // Иначе — запрашиваем с сервера и кэшируем
        return fetch(event.request)
          .then(function(networkResponse) {
            // Кэш только для GET-запросов и успешных ответов
            if (event.request.method === 'GET' &&
                networkResponse &&
                networkResponse.status === 200) {

              // Клонируем ответ, т. к. он может быть использован только один раз
              const responseClone = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseClone);
                });
            }

            return networkResponse;
          })
          .catch(function() {
            // В офлайн-режиме показываем заглушку, если нет в кэше
            return caches.match('/offline.html');
          });
      })
  );
});
