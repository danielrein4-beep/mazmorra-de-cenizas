// Arma el juego: junta los archivos de src/ en una sola página con el atlas incrustado.
//   mazmorra.html      -> la página que se publica como artifact
//   publicar/          -> la misma página lista para servir en localhost o instalar como app
// Uso: node construir.cjs
const fs = require('fs');
const path = require('path');

const raiz = __dirname;
const src = (...p) => path.join(raiz, 'src', ...p);

// El orden importa: cada archivo usa lo que definen los anteriores al cargar.
const ORDEN = [
  'datos/datos.js',
  'nucleo/motor.js',
  'nucleo/rendimiento.js',
  'nucleo/dibujo.js',
  'nucleo/hud.js',
  'nucleo/sonido.js',
  'nucleo/musica.js',
  'datos/personajes.js',
  'jugadores/coop.js',
  'datos/iconos.js',
  'combate/tecnicas.js',
  'combate/proyectiles.js',
  'combate/golpes-finales.js',
  'combate/poderes.js',
  'combate/dibujo-poderes.js',
  'mundo/planos.js',
  'mundo/mapas.js',
  'mundo/objetos.js',
  'combate/enemigos.js',
  'combate/ataques-jefes.js',
  'combate/jefes.js',
  'mundo/mundo.js',
  'mundo/salas.js',
  'jugadores/en-linea.js',
  'nucleo/controles.js',
];

const js = ORDEN.map(f => `// ===== ${f} =====\n` + fs.readFileSync(src(f), 'utf8')).join('\n');
new Function(js); // falla aquí si algún archivo tiene un error de sintaxis

const atlas = 'data:image/png;base64,' + fs.readFileSync(src('recursos', 'atlas.png')).toString('base64');
const pagina = fs
  .readFileSync(src('pagina', 'juego.html'), 'utf8')
  .replace('/*__JS__*/', () => js)
  .replace('__ATLAS__', atlas);
fs.writeFileSync(path.join(raiz, 'mazmorra.html'), pagina);

// Versión instalable: manifiesto, iconos, guardado sin conexión y la música aparte.
const pub = (...p) => path.join(raiz, 'publicar', ...p);
fs.mkdirSync(pub('musica'), { recursive: true });
for (const f of fs.readdirSync(pub('musica'))) fs.unlinkSync(pub('musica', f));
for (const f of fs.readdirSync(src('recursos', 'musica')))
  fs.copyFileSync(src('recursos', 'musica', f), pub('musica', f));
for (const f of ['icono-192.png', 'icono-512.png']) fs.copyFileSync(src('recursos', f), pub(f));
for (const f of ['manifest.webmanifest', 'sw.js']) fs.copyFileSync(src('pagina', f), pub(f));
const app = [
  '<link rel="manifest" href="manifest.webmanifest">',
  '<link rel="apple-touch-icon" href="icono-192.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="mobile-web-app-capable" content="yes">',
  "<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))</script>",
].join('\n');
fs.writeFileSync(
  pub('index.html'),
  pagina.replace('<!--__APP__-->', () => app),
);

console.log('listo:', fs.statSync(path.join(raiz, 'mazmorra.html')).size, 'bytes,', ORDEN.length, 'archivos');
