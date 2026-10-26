// Guarda el juego y la música en el teléfono para que abra sin internet.
const CACHE = 'mazmorra-v10',
  ARCHIVOS = [
    './',
    'index.html',
    'manifest.webmanifest',
    'icono-192.png',
    'icono-512.png',
    'musica/salas.mp3',
    'musica/rey.mp3',
    'musica/gruk.mp3',
    'musica/cenizas-intro.mp3',
    'musica/cenizas.mp3',
  ];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const c = r.clone();
        if (r.ok && new URL(e.request.url).origin === location.origin)
          caches.open(CACHE).then(k => k.put(e.request, c));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
