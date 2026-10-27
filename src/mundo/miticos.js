// Premios de los diablos del Pacto: Almas (puntos) siempre, y un objeto mítico muy, muy raro. Los míticos
// se guardan para siempre y se equipan en el Armario (uno a la vez): su poder va a cada partida.
const MITICOS = [
  {
    id: 'orbeSusurro',
    n: 'Orbe del Susurro',
    de: 'silfred',
    prob: 0.03,
    c: '#b06bff',
    d: 'Tus técnicas recargan un 25 % más rápido.',
  },
  {
    id: 'alaMentira',
    n: 'Ala de la Mentira',
    de: 'belial',
    prob: 0.03,
    c: '#ff3fd2',
    d: 'Empiezas cada partida con dos corazones más.',
  },
  {
    id: 'hachaCarnicera',
    n: 'Hacha de la Carnicera',
    de: 'zagred',
    prob: 0.04,
    c: '#ff2a4a',
    d: 'Todo tu daño sube un 35 %.',
  },
  {
    id: 'coronaDevorador',
    n: 'Corona del Devorador',
    de: 'kiplot',
    prob: 0.08,
    c: '#ffd24a',
    d: 'Tu furia se llena el doble de rápido.',
  },
];
// Almas que da cada diablo al caer.
const ALMAS_DIABLO = { silfred: 100, belial: 150, zagred: 200, kiplot: 400 };
const tengoMitico = id => (LOGROS.miticos || []).includes(id);
const almasTengo = () => LOGROS.almas || 0;

// Al vencer a un diablo: sus almas, y la tirada por su objeto mítico (si todavía no lo tienes).
function premioDiablo(B) {
  const almas = ALMAS_DIABLO[B.id];
  if (!almas) return;
  guardarLogro('almas', almasTengo() + almas);
  G.almasPartida = (G.almasPartida || 0) + almas;
  G.diablosVencidos = (G.diablosVencidos || 0) + 1;
  G.aviso = { txt: '+' + almas + ' almas', l: 140 };
  const M = MITICOS.find(m => m.de == B.id);
  if (M && !tengoMitico(M.id) && Math.random() < M.prob) {
    guardarLogro('miticos', (LOGROS.miticos || []).concat([M.id]));
    G.miticoNuevo = M.n;
    G.banner = { txt: '¡OBJETO MÍTICO! ' + M.n.toUpperCase(), t: 0, c: M.c, dura: 200 };
    G.flash = 10;
    G.fcol = M.c;
    sfx('ultFinal');
  }
}
// Al empezar: el mítico equipado le da su poder a tu héroe.
function aplicarMitico(js) {
  const id = LOGROS.miticoEquipado,
    P = js[0];
  if (!id || !tengoMitico(id)) return;
  if (id == 'orbeSusurro') P.cdm = (P.cdm || 1) * 0.75;
  if (id == 'alaMentira') P.hp = P.max += 4;
  if (id == 'hachaCarnicera') P.dañoMitico = 1.35;
  if (id == 'coronaDevorador') P.furiaMitica = 2;
}
// Texto para el final de la partida.
const textoPremioDiablo = () =>
  (G.almasPartida ? ' Ganaste ' + G.almasPartida + ' almas.' : '') +
  (G.miticoNuevo ? ' ¡Conseguiste un objeto mítico: ' + G.miticoNuevo + '!' : '');

// En el Armario: los míticos (los que tienes se equipan; los demás dicen de qué diablo salen).
function pintarMiticos() {
  const L = document.getElementById('miticosLista');
  L.innerHTML = '';
  document.getElementById('almasTexto').textContent = 'Tienes ' + almasTengo() + ' almas de diablo.';
  MITICOS.forEach(M => {
    const b = document.createElement('button'),
      tiene = tengoMitico(M.id),
      puesto = LOGROS.miticoEquipado == M.id;
    b.type = 'button';
    b.className = 'mitico' + (puesto ? ' puesto' : '') + (tiene ? '' : ' bloqueado');
    b.style.setProperty('--c', M.c);
    b.innerHTML = '<b></b><span></span><small></small>';
    b.querySelector('b').textContent = tiene ? M.n : '???';
    b.querySelector('span').textContent = M.d;
    b.querySelector('small').textContent = puesto
      ? 'Equipado'
      : tiene
        ? 'Tuyo · toca para equiparlo'
        : 'Lo suelta ' + JEFES[M.de].n + ' (' + Math.round(M.prob * 100) + ' % de las veces)';
    b.onclick = () => {
      if (!tiene) return;
      guardarLogro('miticoEquipado', puesto ? null : M.id);
      sfx('cofre');
      pintarMiticos();
    };
    L.appendChild(b);
  });
}
