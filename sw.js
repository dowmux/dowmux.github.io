const CACHE_NAME = 'cue-player-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json'
];

// Установка Service Worker и кэширование базовых файлов интерфейса
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Активация и очистка старого кэша
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Перехват сетевых запросов для работы в офлайне
self.addEventListener('fetch', (e) => {
  // Для аудиопотоков и внешних .cue используем стандартную сетевую загрузку
  if (e.request.url.includes('soundhelix.com') || e.request.url.includes('spotyfm.ru')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
