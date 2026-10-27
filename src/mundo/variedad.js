// Variedad en cada partida: enemigos élite con un modificador, y minijefes que a veces encabezan la
// última oleada de un cuarto. Los dos se ven distintos (contorno de color, tamaño) y dan más premio.
const ELITES = {
  blindado: { n: 'Blindado', c: '#ffd24a', hp: 2.5, sp: 0.85 },
  veloz: { n: 'Veloz', c: '#5ee7ff', sp: 1.6, cd: 0.55 },
  divisor: { n: 'Divisor', c: '#7cff4a', hp: 1.4 },
  explosivo: { n: 'Explosivo', c: '#ff3a2a', hp: 1.3 },
  escudado: { n: 'Escudado', c: '#c3c8d8', hp: 1.2 },
  gigante: { n: 'Gigante', c: '#b06bff', hp: 3, esc: 1.5, sp: 0.8 },
};
const NOMBRE_MINI = {
  skelet: 'Rey Esqueleto',
  imp: 'Imp de Fuego',
  goblin: 'Jefe Goblin',
  tiny: 'Zombi Glotón',
  chort: 'Diablillo Mayor',
  orcW: 'Capitán Orco',
  masked: 'Verdugo Enmascarado',
  shaman: 'Gran Chamán',
  zhielo: 'Zombi Glacial',
  necro: 'Archinigromante',
  mimico: 'Mímico Dorado',
  murcielago: 'Murciélago Vampiro',
  baba: 'Baba Reina',
  fantasma: 'Alma en Pena',
  monje: 'Maestro Lagarto',
};
// En los pisos del Pacto de Demonios casi la mitad de los enemigos son élite.
const probElite = () =>
  G.pacto
    ? 0.45
    : Math.min(
        0.28,
        (0.06 + 0.025 * G.zona + (G.torre ? G.piso / 250 : 0)) * (G.dif.id == 'pesadilla' ? 1.5 : 1),
      );

// Al entrar a un cuarto de pelea: a veces la última oleada trae un minijefe.
function marcarSpawnOleada(j) {
  const s = G.spawns[G.spawns.length - 1];
  if (!s) return;
  s.ola = 1;
  if (G.miniSala && G.ola == G.oleadas.length - 1 && j == 0) {
    s.mini = 1;
    G.miniSala = 0;
  }
}
function alNacerEnemigo(m, s) {
  if (s.mini) return hacerMini(m);
  if (s.forzarElite || (s.ola && !G.B && Math.random() < probElite()))
    hacerElite(m, Object.keys(ELITES)[Math.floor(Math.random() * 6)]);
}
function hacerElite(m, tipo) {
  const E = ELITES[tipo];
  m.elite = tipo;
  m.hp = m.hpMax = m.max = Math.round(m.max * (E.hp || 1));
  m.spMul = E.sp || 1;
  m.cdMul = E.cd || 1;
  m.esc = E.esc || 1;
  m.colorE = E.c;
}
function hacerMini(m) {
  m.mini = NOMBRE_MINI[m.k] || 'Campeón';
  m.hp = m.hpMax = m.max = Math.round(m.max * 7);
  m.esc = 1.8;
  m.spMul = 1.1;
  m.cdMul = 0.6;
  m.colorE = '#ffd24a';
  G.banner = { txt: m.mini.toUpperCase(), t: 0, c: '#ffd24a' };
  sfx('rugido');
}
// Al caer: premios, y lo que hace cada élite al morir.
function alMorirElite(m) {
  if (!m.elite && !m.mini) return;
  soltarMonedas(m.x, m.y - 4, m.mini ? 12 : 4);
  if (m.mini) {
    G.minisVencidos = (G.minisVencidos || 0) + 1;
    ponerCofre(m.x, m.y, true);
    G.aviso = { txt: m.mini + ' cayó', l: 90 };
    return;
  }
  G.elitesVencidos = (G.elitesVencidos || 0) + 1;
  if (Math.random() < 0.2) G.pick.push({ x: m.x, y: m.y, t: 0 });
  if (m.elite == 'explosivo') {
    for (let i = 0; i < 12; i++) {
      const a = (i * 6.283) / 12;
      G.bul.push({ x: m.x, y: m.y - 6, vx: Math.cos(a) * 1.6, vy: Math.sin(a) * 1.6, c: '#ff3a2a', r: 3 });
    }
    ring(m.x, m.y - 6, 30, '#ff3a2a', 12, 3);
    sfx('explosion');
  }
  if (m.elite == 'divisor')
    for (let i = 0; i < 2; i++) {
      const d = m.def;
      G.enem.push({
        k: m.k,
        def: d,
        x: m.x + (i ? 8 : -8),
        y: m.y,
        h: d.run[0][3],
        hp: Math.round(m.max * 0.25),
        hpMax: Math.round(m.max * 0.25),
        max: Math.round(m.max * 0.25),
        hit: 0,
        face: 1,
        t: 0,
        cd: rnd(40, 80),
        kx: (i ? 1 : -1) * 2,
        ky: 0,
        st: '',
        stT: 0,
        esc: 0.75,
      });
    }
}
// El escudado recibe la mitad de daño.
const dañoContraElite = (r, d) => (r.elite == 'escudado' ? Math.max(1, Math.round(d * 0.5)) : d);

// Contorno del color de la élite y, encima, su marca (o el nombre y la vida del minijefe).
function drawEliteFondo(m, fr, jx) {
  if (!m.colorE) return;
  const tc = atlasTono(m.colorE),
    e = m.esc || 1;
  w.globalAlpha = 0.7;
  [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ].forEach(([a, b]) => spr(w, tc, fr, m.x + jx + a, m.y + b, m.face < 0, e));
  w.globalAlpha = 1;
}
function drawEliteEncima(m) {
  if (!m.colorE) return;
  const e = m.esc || 1,
    y = m.y - m.h * e - 8;
  if (m.mini) {
    w.fillStyle = '#1a0a14';
    w.fillRect(Math.round(m.x - 16), Math.round(y), 32, 3);
    w.fillStyle = '#ffd24a';
    w.fillRect(Math.round(m.x - 16), Math.round(y), Math.round((32 * m.hp) / m.max), 3);
    w.font = '7px ' + FUENTE;
    w.textAlign = 'center';
    w.fillStyle = '#0b0812';
    w.fillText(m.mini, m.x + 1, y - 2);
    w.fillStyle = '#ffd24a';
    w.fillText(m.mini, m.x, y - 3);
    return;
  }
  w.fillStyle = m.colorE;
  w.beginPath();
  w.moveTo(m.x, y - 3);
  w.lineTo(m.x + 3, y);
  w.lineTo(m.x, y + 3);
  w.lineTo(m.x - 3, y);
  w.fill();
}
