// Tu bolsa arriba a la derecha (nivel y cenizas) fuera de la partida, y la vuelta entre pantallas:
// Estado, Forja, Logros y Récords se abren desde el menú, la pausa, elegir o el final, y vuelven a donde estabas.
const PANTALLAS_BASE = ['menu', 'pausa', 'elegir', 'endScr'];
const origenDe = {};

function irAPanel(id) {
  const desde = PANTALLAS_BASE.find(p => !document.getElementById(p).hidden) || 'menu';
  origenDe[id] = desde;
  document.getElementById(desde).hidden = true;
  document.getElementById(id).hidden = false;
}
function volverDePanel(id) {
  document.getElementById(id).hidden = true;
  document.getElementById(origenDe[id] || 'menu').hidden = false;
  pintarBolsa();
}

// La gema de ceniza: un rombo turquesa con brillo, en el lienzo o en la página.
function dibujarGema(x, cx, cy, s) {
  x.fillStyle = '#177e89';
  x.beginPath();
  x.moveTo(cx, cy - s);
  x.lineTo(cx + s * 0.75, cy);
  x.lineTo(cx, cy + s);
  x.lineTo(cx - s * 0.75, cy);
  x.closePath();
  x.fill();
  x.fillStyle = '#5ee7ff';
  x.beginPath();
  x.moveTo(cx, cy - s);
  x.lineTo(cx + s * 0.75, cy);
  x.lineTo(cx, cy);
  x.closePath();
  x.fill();
  x.fillStyle = 'rgba(255,255,255,.7)';
  x.fillRect(cx - s * 0.25, cy - s * 0.5, s * 0.2, s * 0.2);
}

function pintarBolsa() {
  const B = document.getElementById('bolsa'),
    E = estado();
  B.hidden = running && !pausado;
  document.getElementById('bolsaNivel').textContent = 'Nivel ' + E.nivel;
  document.getElementById('bolsaCenizas').textContent = (LOGROS.polvo || 0) + ' cenizas';
}
(() => {
  const c = document.getElementById('bolsaGema').getContext('2d');
  dibujarGema(c, 10, 10, 9);
})();
setInterval(pintarBolsa, 400);
// Tocar la bolsa abre Tu estado, salvo en plena partida o con otro panel ya abierto.
document.getElementById('bolsa').onclick = () => {
  if (running && !pausado) return;
  if (['estado', 'forja', 'logros', 'records', 'opciones'].some(p => !document.getElementById(p).hidden))
    return;
  mostrarEstado();
};

// Botones para volver al menú principal desde elegir y desde el final.
function alMenu() {
  ['elegir', 'endScr', 'mejoras'].forEach(id => (document.getElementById(id).hidden = true));
  document.getElementById('menu').hidden = false;
  pintarBolsa();
}
document.querySelectorAll('.aMenu').forEach(b => (b.onclick = alMenu));
document.getElementById('pausaEstado').onclick = mostrarEstado;
