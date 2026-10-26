// Arma publicar/index.html: la misma página del juego más lo necesario para instalarla como app.
const fs = require('fs');
const app = [
  '<link rel="manifest" href="manifest.webmanifest">',
  '<link rel="apple-touch-icon" href="icono-192.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  "<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))</script>"
].join('\n');
fs.writeFileSync('publicar/index.html', fs.readFileSync('mazmorra.html', 'utf8').replace('<!--__APP__-->', () => app));
