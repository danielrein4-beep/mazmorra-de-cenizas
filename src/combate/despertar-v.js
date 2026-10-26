// Despertar V de cada técnica: además del brillo y el estallido de despertar.js, cada una tiene su
// firma propia. Las de proyectil la hacen al pegar; las de golpe o escudo, al lanzarse. El rayo tiene
// la suya en rayos.js.
function ondaV(P, x, y, max, dmg, c) {
  G.ondas.push({ own: P, x, y, r: 4, max, dmg: Math.round(dmg), hits: [], c });
}
const cercaDeV = (x, y, r) => objetivos().filter(o => Math.hypot(o.x - x, o.y - y) < r + o.r);

// Proyectiles que se parten en varios al pegar (flechas, dagas).
function partirV(s, n, c) {
  for (let i = 0; i < n; i++) {
    const a = Math.atan2(s.vy, s.vx) + (i - (n - 1) / 2) * 0.5,
      v = Math.hypot(s.vx, s.vy);
    G.shots.push(
      Object.assign({}, s, {
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        dmg: Math.round(s.dmg * 0.5),
        hits: [...s.hits],
        estalla: null,
        tecV: null,
        l: 30,
      }),
    );
  }
  burst(s.x, s.y, 10, c, 2.5, 14);
}

const AL_PEGAR_V = {
  // Nova de escarcha: congela a todos alrededor.
  hielo: (s, tg) => {
    cercaDeV(s.x, s.y, 48).forEach(o => (o.ref.frio = Math.max(o.ref.frio || 0, o.boss ? 50 : 160)));
    ring(s.x, s.y, 48, '#bff4ff', 16, 3);
    for (let i = 0; i < 10; i++) {
      const a = (i * 6.283) / 10;
      G.pt.push({
        x: s.x,
        y: s.y,
        vx: Math.cos(a) * 2.4,
        vy: Math.sin(a) * 2.4,
        l: 18,
        m: 18,
        c: '#ffffff',
        s: 2,
        g: 0,
      });
    }
    sfx('hielo');
  },
  // Pilar de fuego: el golpe sube en llamas y quema alrededor.
  fuego: (s, tg) => {
    ondaV(s.own || G.P, s.x, s.y, 40, s.dmg * 0.6, '#ff8a2a');
    for (let i = 0; i < 14; i++)
      G.pt.push({
        x: s.x + rnd(-6, 6),
        y: s.y,
        vx: rnd(-0.4, 0.4),
        vy: -rnd(1.5, 3.5),
        l: 26,
        m: 26,
        c: i % 3 ? '#ff8a2a' : '#ffe94a',
        s: 3,
        g: 0,
      });
  },
  // Luz: un rayo de luz cae del cielo sobre el golpeado.
  luz: (s, tg) => {
    G.flash = Math.max(G.flash || 0, 3);
    ondaV(s.own || G.P, s.x, s.y, 34, s.dmg * 0.7, '#fff6b0');
    for (let k = 0; k < 16; k++)
      G.pt.push({
        x: s.x + rnd(-3, 3),
        y: s.y - k * 8,
        vx: 0,
        vy: 1,
        l: 14,
        m: 14,
        c: '#fffbe0',
        s: 3,
        g: 0,
      });
  },
  // Vacío: arrastra a los enemigos cercanos hacia el golpe.
  vacio: (s, tg) => {
    cercaDeV(s.x, s.y, 70).forEach(o => {
      if (o.boss) return;
      o.ref.x += (s.x - o.x) * 0.45;
      o.ref.y += (s.y - o.y) * 0.45;
    });
    ring(s.x, s.y, 70, '#6a2aff', 14, 3);
    burst(s.x, s.y, 16, '#12051e', 2, 20);
  },
  flecha: s => partirV(s, 3, '#ffe9a0'),
  dagas: s => partirV(s, 3, '#c3c8d8'),
  abanico: s => partirV(s, 2, '#7cff4a'),
};
// Si la técnica no tiene firma propia, el golpe suelta una onda de su color.
function pegarV(s, tg) {
  const f = AL_PEGAR_V[s.tecV];
  if (f) f(s, tg);
  else ondaV(s.own || G.P, s.x, s.y, 36, s.dmg * 0.5, s.estalla);
}

const AL_LANZAR_V = {
  // Tajo y hacha: una media luna de energía sale volando hacia adelante.
  tajo: (P, a, ox, oy, c, nv) => lineaDeOndas(P, a, ox, oy, c, 4, 26, 12 * nv),
  hacha: (P, a, ox, oy, c, nv) => lineaDeOndas(P, a, ox, oy, c, 3, 30, 14 * nv),
  estocada: (P, a, ox, oy, c, nv) => lineaDeOndas(P, a, ox, oy, c, 5, 22, 10 * nv),
  // Martillazo y pisotón: la tierra se agrieta en tres ondas seguidas.
  martillazo: (P, a, ox, oy, c, nv) => ondasSeguidas(P, c, 3, 60, 12 * nv),
  pisoton: (P, a, ox, oy, c, nv) => ondasSeguidas(P, c, 3, 70, 10 * nv),
  // Escudo: borra las balas enemigas cercanas y las devuelve como chispas.
  escudo: (P, a, ox, oy, c) => {
    G.bul.forEach(b => {
      if (Math.hypot(b.x - P.x, b.y - P.y + 12) < 90) {
        b.d = 1;
        burst(b.x, b.y, 3, c, 1.5, 10);
      }
    });
    G.bul = G.bul.filter(b => !b.d);
    ring(P.x, P.y - 12, 90, c, 16, 3);
  },
  // Espinas y veneno: brotan en círculo alrededor del héroe.
  espinas: (P, a, ox, oy, c, nv) => ondasSeguidas(P, c, 2, 56, 9 * nv),
  veneno: (P, a, ox, oy, c, nv) => ondasSeguidas(P, c, 2, 64, 8 * nv),
  sombra: (P, a, ox, oy, c, nv) => lineaDeOndas(P, a, ox, oy, c, 4, 24, 12 * nv),
};
function lineaDeOndas(P, a, ox, oy, c, n, paso, dmg) {
  for (let i = 1; i <= n; i++)
    G.diferidos = (G.diferidos || []).concat({
      t: i * 4,
      f: () => ondaV(P, ...enSala(ox + Math.cos(a) * paso * i, oy + Math.sin(a) * paso * i), 22, dmg, c),
    });
}
function ondasSeguidas(P, c, n, max, dmg) {
  for (let i = 0; i < n; i++)
    G.diferidos = (G.diferidos || []).concat({
      t: i * 10,
      f: () => {
        ondaV(P, P.x, P.y - 4, max + i * 18, dmg, c);
        G.shake = Math.max(G.shake, 4);
      },
    });
}
// Efectos con demora (cada uno se dispara cuando su cuenta llega a cero).
function pasoDiferidos() {
  if (!G.diferidos || !G.diferidos.length) return;
  G.diferidos.forEach(d => --d.t <= 0 && d.f());
  G.diferidos = G.diferidos.filter(d => d.t > 0);
}
function despertarV(P, id, antes, a, ox, oy) {
  if (nivelTec(P, id) < 5 || id == 'rayo') return;
  const c = TEC[id].c;
  G.shots.slice(antes).forEach(s => (s.tecV = id));
  if (AL_LANZAR_V[id]) conJugador(P, () => AL_LANZAR_V[id](P, a, ox, oy, c, 5));
}
