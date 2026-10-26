// La pantalla del juego toma la forma del aparato: vertical u horizontal, sin franjas ni bordes cortados.
// El lado corto del lienzo siempre mide 540 píxeles internos; el largo se estira según la pantalla.
const LADO_CORTO = 540;
const vertical = () => OH > OW;

function ajustarPantalla() {
  const wr = document.getElementById('wrap'),
    ancho = wr.clientWidth || 960,
    alto = wr.clientHeight || 540,
    asp = Math.max(0.42, Math.min(2.4, ancho / alto));
  const nw = asp >= 1 ? Math.round(LADO_CORTO * asp) : LADO_CORTO,
    nh = asp >= 1 ? LADO_CORTO : Math.round(LADO_CORTO / asp);
  if (nw === OW && nh === OH) return;
  OW = nw;
  OH = nh;
  VW = OW / 3;
  VH = OH / 3;
  cv.width = OW;
  cv.height = OH;
  o.imageSmoothingEnabled = false;
  VINETA = hacerVineta();
  if (G && G.cam && !running && typeof render == 'function') render();
}

let esperaPantalla = 0;
function alCambiarPantalla() {
  clearTimeout(esperaPantalla);
  esperaPantalla = setTimeout(ajustarPantalla, 120);
}
addEventListener('resize', alCambiarPantalla);
addEventListener('orientationchange', alCambiarPantalla);
if (window.visualViewport) visualViewport.addEventListener('resize', alCambiarPantalla);

ajustarPantalla();
