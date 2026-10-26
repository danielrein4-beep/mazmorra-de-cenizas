// Reto del día: cada día, cinco pisos de la Torre que terminan en un guardián, con dos reglas raras.
// Es igual para todos los que jueguen ese día; superarlo paga cenizas una vez por día.
const PREMIO_RETO = 80;
const REGLAS_RETO = [
  { id: 'balas', n: 'Balas veloces', d: 'las balas enemigas van más rápido', f: D => (D.bala *= 1.5) },
  { id: 'horda', n: 'Horda', d: 'salen muchos más enemigos', f: D => (D.cant *= 1.6) },
  { id: 'gigantes', n: 'Gigantes', d: 'los enemigos aguantan mucho más', f: D => (D.enem *= 1.7) },
  { id: 'fragil', n: 'Corazón frágil', d: 'cada golpe quita un corazón entero', f: D => (D.golpe = 2) },
  { id: 'sinPocimas', n: 'Sin pócimas', d: 'no caen pócimas', f: D => (D.poc = 0) },
  {
    id: 'furioso',
    n: 'Guardián furioso',
    d: 'el guardián ataca más seguido',
    f: D => {
      D.jefe *= 1.3;
      D.cdJ *= 0.7;
    },
  },
  { id: 'oleadas', n: 'Más oleadas', d: 'cada cuarto trae una oleada más', f: D => (D.olas += 1) },
];

const fechaHoy = () => new Date().toISOString().slice(0, 10);
// Número fijo para cada fecha: así el reto es el mismo para todos ese día.
function semillaDe(txt) {
  let h = 2166136261;
  for (const ch of txt) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}
function retoDeHoy() {
  const s = semillaDe(fechaHoy()),
    bloque = 1 + (s % 6),
    a = (s >>> 3) % REGLAS_RETO.length;
  let b = (s >>> 7) % REGLAS_RETO.length;
  if (b == a) b = (b + 1) % REGLAS_RETO.length;
  return { desde: bloque * 10 + 6, hasta: bloque * 10 + 10, reglas: [REGLAS_RETO[a], REGLAS_RETO[b]] };
}
const retoHechoHoy = () => LOGROS.retoDia == fechaHoy();
function textoReto() {
  const R = retoDeHoy();
  return (
    'Reto de hoy: pisos ' +
    R.desde +
    ' a ' +
    R.hasta +
    ' con ' +
    R.reglas.map(r => r.n + ' (' + r.d + ')').join(' y ') +
    '. ' +
    (retoHechoHoy() ? 'Ya lo superaste hoy; mañana hay otro.' : 'Premio: ' + PREMIO_RETO + ' cenizas.')
  );
}

function iniciarReto() {
  G.reto = retoDeHoy();
  iniciarTorre(G.reto.desde);
}
// La dificultad del piso con las dos reglas del día encima.
function conReglasDelReto(D) {
  if (G.reto) G.reto.reglas.forEach(r => r.f(D));
  return D;
}
// Al vencer al guardián del final, el reto está cumplido.
function retoCumplido() {
  return G.reto && G.piso >= G.reto.hasta;
}
function finReto(win) {
  const ok = win && retoCumplido();
  document.getElementById('endTitle').textContent = ok ? '¡Reto cumplido!' : 'El reto te ganó hoy';
  let t = ok
    ? 'Superaste los pisos ' + G.reto.desde + ' a ' + G.reto.hasta + '.'
    : 'Llegaste al piso ' + G.piso + '.';
  if (ok && !retoHechoHoy()) {
    guardarLogro('retoDia', fechaHoy());
    guardarLogro('retosHechos', (LOGROS.retosHechos || 0) + 1);
    guardarLogro('polvo', (LOGROS.polvo || 0) + PREMIO_RETO);
    t += ' Ganaste ' + PREMIO_RETO + ' cenizas.';
  } else if (!ok) t += ' Puedes intentarlo otra vez.';
  t += subirReto(ok)
    ? ' Tu intento entró al ranking de hoy.'
    : ' Pon tu apodo en Récords para entrar al ranking del reto.';
  document.getElementById('endText').textContent = t;
}
