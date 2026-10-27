// Guarda el juego y la música en el teléfono para que abra sin internet.
const CACHE = 'mazmorra-v47',
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
    'musica/coloso.mp3',
    'musica/victoria.mp3',
    'musica/revive.mp3',
    'musica/revive-dragon.mp3',
    'musica/revive-dragon-intro.mp3',
    'musica/demonios.mp3',
    'musica/demonios-furia.mp3',
    'musica/rey-demonio.mp3',
    'musica/persecucion.mp3',
    'musica/batalla.mp3',
  ];
self.addEventListener('install', e => {
  // 'reload': baja cada archivo del servidor, no la copia vieja que el navegador guarda unos minutos.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    // 'no-cache': siempre pregunta al servidor si hay versión nueva (si no la hay, responde sin volver a bajarlo).
    fetch(
      e.request,
      e.request.mode == 'navigate' || e.request.url.endsWith('.html') ? { cache: 'no-cache' } : {},
    )
      .then(r => {
        const c = r.clone();
        if (r.ok && new URL(e.request.url).origin === location.origin)
          caches.open(CACHE).then(k => k.put(e.request, c));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
