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
// Lo que suma cada acción durante la partida, para el héroe que la hace (el de esta compu o el amigo en línea).
function hazaña(k, v) {
  if (G && G.P && G.P.hazañas) G.P.hazañas[k] += v;
}

// Al empezar: el estado le da su bono al héroe de esta compu y al del amigo en línea (con su propio estado).
function aplicarEstado(js) {
  bonoDeEstado(js[0], estado());
  js.slice(1).forEach(P => {
    const amigo = P.invitado && P.invitado.perfil;
    if (amigo) bonoDeEstado(P, Object.assign(estado0(), amigo.estado));
  });
}
const estado0 = () => ({ nivel: 1, exp: 0, fue: 0, res: 0, des: 0, agi: 0, mag: 0 });
function bonoDeEstado(P, E) {
  P.hazañas = { fue: 0, res: 0, des: 0, agi: 0, mag: 0 };
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

const expDePartida = () =>
  Math.round((G.kills || 0) * 3 + (G.jefesVencidos || 0) * 60 + (G.torre ? pisosSubidos() * 8 : 0));
// Al terminar: el héroe de esta compu guarda lo suyo; el del amigo se le manda (jugadores/en-linea.js).
function ganarEstado() {
  const P = (G.jugTodos || G.jug)[0];
  if (!P.hazañas) return;
  document.getElementById('endText').textContent += sumarEstado(P.hazañas, expDePartida());
  P.hazañas = null;
}
// Suma a tu estado guardado lo ganado, con rendimiento decreciente cerca de S. Devuelve el texto del resumen.
function sumarEstado(H, exp) {
  const E = estado(),
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
  if (subio) sfx('nivel');
  return (
    (subio ? ' ¡Subiste a nivel ' + E.nivel + '!' : '') +
    (subidas.length ? ' Estado: ' + subidas.join(', ') + '.' : '')
  );
}
