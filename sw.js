const CACHE_NAME = 'jadwal-jac-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Pas install, simpan file utama
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Pas ada versi baru, hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Atur cara ambil data
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Jangan cache Firebase, biar jadwal selalu terbaru
  if (url.includes('firebase') || url.includes('firebasedatabase') || url.includes('googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        // Simpan ke cache buat offline
        if (event.request.method === 'GET' && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
