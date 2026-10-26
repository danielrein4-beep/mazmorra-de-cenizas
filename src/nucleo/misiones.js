// Misiones del día: tres por día, las mismas para todos (salen de la fecha). El avance se suma partida
// a partida y cada una paga cenizas al cumplirse. Se ven en Logros y al terminar cada partida.
const MISIONES = [
  { id: 'matar', n: 'Derrota a 150 enemigos', meta: 150, p: 40, v: () => G.kills || 0 },
  { id: 'elites', n: 'Vence a 6 enemigos élite', meta: 6, p: 50, v: () => G.elitesVencidos || 0 },
  { id: 'minis', n: 'Vence a 2 minijefes', meta: 2, p: 60, v: () => G.minisVencidos || 0 },
  { id: 'pisos', n: 'Sube 15 pisos de la Torre', meta: 15, p: 60, v: () => (G.torre ? pisosSubidos() : 0) },
  { id: 'eventos', n: 'Usa 3 altares, fuentes o dados', meta: 3, p: 40, v: () => G.eventosUsados || 0 },
  {
    id: 'zona',
    n: 'Llega a las Cuevas de Hielo',
    meta: 1,
    p: 40,
    v: () => (!G.torre && G.zona >= 1 ? 1 : 0),
  },
  { id: 'ganar', n: 'Gana la Aventura', meta: 1, p: 80, v: win => (win && !G.torre && !G.arena ? 1 : 0) },
  { id: 'reto', n: 'Juega el reto de hoy', meta: 1, p: 30, v: () => (G.reto ? 1 : 0) },
];
// Tres misiones distintas según el día.
function misionesDeHoy() {
  let h = 0;
  for (const ch of fechaHoy()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const lista = MISIONES.slice(),
    hoy = [];
  for (let i = 0; i < 3; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    hoy.push(lista.splice(h % lista.length, 1)[0]);
  }
  return hoy;
}
function avanceMisiones() {
  const M = LOGROS.misiones;
  return M && M.fecha == fechaHoy() ? M : { fecha: fechaHoy(), prog: {}, cobradas: [] };
}
// Al terminar una partida: suma el avance y paga las que se cumplieron. Devuelve el texto para la pantalla final.
function avanzarMisiones(win) {
  const M = avanceMisiones(),
    hechas = [];
  misionesDeHoy().forEach(m => {
    if (M.cobradas.includes(m.id)) return;
    M.prog[m.id] = Math.min(m.meta, (M.prog[m.id] || 0) + m.v(win));
    if (M.prog[m.id] >= m.meta) {
      M.cobradas.push(m.id);
      hechas.push(m);
    }
  });
  guardarLogro('misiones', M);
  if (!hechas.length) return '';
  guardarLogro('polvo', cenizasTengo() + hechas.reduce((s, m) => s + m.p, 0));
  return ' Misión cumplida: ' + hechas.map(m => m.n + ' (+' + m.p + ')').join(', ') + '.';
}
function pintarMisiones() {
  const L = document.getElementById('misionesHoy'),
    M = avanceMisiones();
  L.innerHTML = '';
  misionesDeHoy().forEach(m => {
    const f = document.createElement('div'),
      lista = M.cobradas.includes(m.id),
      prog = lista ? m.meta : M.prog[m.id] || 0;
    f.className = 'logro mision' + (lista ? ' hecho' : '');
    f.innerHTML = '<b></b><small></small><i><em></em></i><span></span>';
    f.querySelector('b').textContent = m.n;
    f.querySelector('small').textContent = prog + ' de ' + m.meta;
    f.querySelector('em').style.width = Math.round((100 * prog) / m.meta) + '%';
    f.querySelector('span').textContent = lista ? 'Cobrada' : '+' + m.p;
    L.appendChild(f);
  });
}
