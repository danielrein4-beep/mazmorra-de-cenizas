// Estado del aventurero, como el Falna de DanMachi: un nivel que sube con la experiencia y cinco habilidades
// que crecen con lo que haces en cada partida. Va del rango I (0) al S (900 o más) y se guarda entre partidas.
const HABILIDADES = [
  { id: 'fue', n: 'Fuerza', d: 'Más daño en cada golpe.' },
  { id: 'res', n: 'Resistencia', d: 'Un corazón más a los 400 y otro a los 800.' },
  { id: 'des', n: 'Destreza', d: 'Más golpes críticos.' },
  { id: 'agi', n: 'Agilidad', d: 'Corres más rápido.' },
  { id: 'mag', n: 'Magia', d: 'Tus técnicas se recargan antes.' },
];
const RANGOS = ['I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
const rangoDe = v => RANGOS[Math.min(9, Math.floor(v / 100))];
const expParaNivel = n => 300 * n;

function estado() {
  return Object.assign({ nivel: 1, exp: 0, fue: 0, res: 0, des: 0, agi: 0, mag: 0 }, LOGROS.estado);
}
// Lo que suma cada acción durante la partida (solo el jugador de este aparato).
function hazaña(k, v) {
  if (!G || !G.hazañas || G.P !== (G.jugTodos || G.jug)[0]) return;
  G.hazañas[k] += v;
}

// Al empezar: el estado le da a cada héroe de este aparato su bono.
function aplicarEstado(js) {
  const E = estado(),
    P = js[0];
  G.hazañas = { fue: 0, res: 0, des: 0, agi: 0, mag: 0 };
  P.bono = (1 + 0.03 * (E.nivel - 1)) * (1 + E.fue / 2000);
  P.critico = E.des / 10000;
  P.sp *= 1 + E.agi / 10000;
  P.cdm = 1 - E.mag / 5000;
  const extra = (E.res >= 400 ? 2 : 0) + (E.res >= 800 ? 2 : 0);
  P.max += extra;
  P.hp += extra;
}
// Daño con el estado: el bono de nivel y Fuerza, y el crítico de Destreza.
function dañoConEstado(P, tg, d) {
  if (!P.bono) return d;
  d *= P.bono;
  if (P.critico && Math.random() < P.critico) {
    d *= 1.8;
    burst(tg.x, tg.y, 8, '#ffe94a', 2);
  }
  hazaña('fue', d / 60);
  return d;
}

// Al terminar: la experiencia y lo ganado en cada habilidad, con rendimiento decreciente cerca de S.
function ganarEstado() {
  if (!G.hazañas) return;
  const E = estado(),
    H = G.hazañas,
    exp = Math.round((G.kills || 0) * 3 + (G.jefesVencidos || 0) * 60 + (G.torre ? G.piso * 8 : 0)),
    subidas = [];
  HABILIDADES.forEach(h => {
    const g = Math.round(H[h.id] / (1 + E[h.id] / 300));
    if (g > 0) {
      E[h.id] = Math.min(999, E[h.id] + g);
      subidas.push(h.n + ' +' + g);
    }
  });
  E.exp += exp;
  let subio = 0;
  while (E.exp >= expParaNivel(E.nivel) && E.nivel < 99) {
    E.exp -= expParaNivel(E.nivel);
    E.nivel++;
    subio = 1;
  }
  guardarLogro('estado', E);
  G.hazañas = null;
  document.getElementById('endText').textContent +=
    (subio ? ' ¡Subiste a nivel ' + E.nivel + '!' : '') +
    (subidas.length ? ' Estado: ' + subidas.join(', ') + '.' : '');
}

// Pantalla «Tu estado» del menú, como la hoja de estado que lee la diosa.
function mostrarEstado() {
  const E = estado(),
    L = document.getElementById('estadoLista');
  document.getElementById('estadoNivel').textContent = 'Nivel ' + E.nivel;
  document.getElementById('estadoExp').style.width = (100 * E.exp) / expParaNivel(E.nivel) + '%';
  document.getElementById('estadoExpTxt').textContent =
    'Experiencia ' + E.exp + ' de ' + expParaNivel(E.nivel);
  L.innerHTML = '';
  HABILIDADES.forEach(h => {
    const fila = document.createElement('div');
    fila.className = 'hab';
    fila.innerHTML = '<b></b><span class="rango"></span><span class="val"></span><small></small>';
    fila.querySelector('b').textContent = h.n;
    fila.querySelector('.rango').textContent = rangoDe(E[h.id]);
    fila.querySelector('.val').textContent = E[h.id];
    fila.querySelector('small').textContent = h.d;
    L.appendChild(fila);
  });
  document.getElementById('menu').hidden = true;
  document.getElementById('estado').hidden = false;
  document.getElementById('estadoVolver').focus();
}
document.getElementById('estadoBtn').onclick = mostrarEstado;
document.getElementById('estadoVolver').onclick = () => {
  document.getElementById('estado').hidden = true;
  document.getElementById('menu').hidden = false;
};
