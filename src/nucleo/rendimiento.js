// Ayudas de rendimiento, sobre todo para teléfonos: lo que no cambia se pinta una sola vez
// y, si el aparato no da abasto, la calidad de los efectos baja sola.
const MAX_PARTICULAS = coarse ? 700 : 1500;
let calidadBaja = false,
  mediaCuadro = 16.7;

// Promedio móvil del tiempo entre cuadros; por encima de ~24 ms (menos de 40 por segundo) se aligera.
function medirCuadro(ms) {
  if (!G || !running || G.stop > 0) return;
  mediaCuadro = mediaCuadro * 0.97 + Math.min(ms, 60) * 0.03;
  if (!calidadBaja && G.t > 240 && mediaCuadro > 24) calidadBaja = true;
}
const tope = () => (calidadBaja ? 350 : MAX_PARTICULAS);

// Lava: ocho cuadros de animación de una casilla, preparados al cargar.
const LAVA = [...Array(8)].map((_, f) => {
  const [c, x] = mk(16, 16);
  x.globalAlpha = 0.6;
  x.fillStyle = '#ff5a1a';
  x.fillRect(1, 1, 14, 14);
  x.globalAlpha = 1;
  for (let k = 0; k < 6; k++) {
    x.fillStyle = k % 3 ? '#ff5a1a' : '#ffb04a';
    x.fillRect((k * 5 + f * 2) % 16, (k * 7 + f) % 16, 2, 1);
  }
  return c;
});
function dibujarLava(x, y, tx, ty) {
  w.drawImage(LAVA[(Math.floor(G.t / 8) + tx * 3 + ty) % 8], x, y);
}

// Bordes oscuros de la pantalla, pintados una vez.
function hacerVineta() {
  const [c, x] = mk(OW, OH);
  const g = x.createRadialGradient(OW / 2, OH / 2, OH * 0.35, OW / 2, OH / 2, OH * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,.55)');
  x.fillStyle = g;
  x.fillRect(0, 0, OW, OH);
  return c;
}
let VINETA = hacerVineta();

// Hueco de luz suave en una capa de oscuridad.
function hueco(x2, x, y, r, k) {
  const g = x2.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, 'rgba(0,0,0,' + k + ')');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x2.fillStyle = g;
  x2.fillRect(x - r, y - r, r * 2, r * 2);
}

// Oscuridad del cuarto con las luces que no se mueven (antorchas, fuentes y lava). Se rehace al entrar.
function prepararLuzFija() {
  const osc = ZONAS[G.zona].oscuro || 0.42,
    [c, x] = mk(WW, WH);
  x.fillStyle = 'rgba(6,3,14,' + osc + ')';
  x.fillRect(0, 0, WW, WH);
  x.globalCompositeOperation = 'destination-out';
  ANTORCHAS.forEach(tx => hueco(x, tx * 16 + 8, 26, 62, 0.95));
  [7, 22].forEach(tx => hueco(x, tx * 16 + 8, 30, 40, 0.7));
  (G.lavas || []).forEach(([tx, ty], i) => {
    if (i % 3 == 0) hueco(x, tx * 16 + 8, ty * 16 + 8, 40, 0.6);
  });
  G.luzFija = c;
}

// Cambiar estilos o atributos de la página solo cuando de verdad cambian.
const ultimoDom = {};
function ponerFiltro(v) {
  if (ultimoDom.filtro !== v) cv.style.filter = ultimoDom.filtro = v;
}
function ocultar(id, v) {
  if (ultimoDom[id] !== v) document.getElementById(id).hidden = ultimoDom[id] = v;
}
