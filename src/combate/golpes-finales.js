// Golpes finales: paso(U) corre desde U.t=55, cuando termina la carga; el remate llega cerca de U.t=114.
const ULT = {
  abismo: {
    n: 'Lanzas del Abismo',
    c: '#ff2a4a',
    paso(U) {
      if (U.t >= 60 && U.t <= 104 && U.t % 5 == 0) caerSobre('lanza', 32, 16);
      if (U.t == 114)
        G.spears.push({
          own: G.P,
          kind: 'lanza',
          x: U.foco.x,
          y: U.foco.y - 340,
          ty: U.foco.y - 6,
          big: 1,
          dmg: 260,
          rad: 60,
        });
    },
  },
  celestial: {
    n: 'Corte Celestial',
    c: '#ffe94a',
    paso(U) {
      if (U.t >= 60 && U.t <= 104 && U.t % 6 == 0) {
        const T = objetivos(),
          tg = T[Math.floor(Math.random() * T.length)];
        if (tg) {
          golpeArco(tg.x, tg.y, rnd(0, 6.3), 38, 6.3, 30, 4, true, '#ffe94a');
          sfx('tajo');
        }
      }
      if (U.t == 114) {
        [0.7, -0.7].forEach(a => G.cortes.push({ x: U.foco.x, y: U.foco.y - 20, a, l: 24 }));
        objetivos().forEach(t => dañar(t, t.boss ? 240 : 130, 22));
        golpeFinal(U.foco.x, U.foco.y - 20, '#ffe94a');
      }
    },
  },
  lluvia: {
    n: 'Lluvia de Flechas',
    c: '#7cff4a',
    paso(U) {
      if (U.t >= 60 && U.t <= 110 && U.t % 2 == 0) caerSobre('flecha', 13, 10);
      if (U.t == 114)
        G.spears.push({
          own: G.P,
          kind: 'flecha',
          x: U.foco.x,
          y: U.foco.y - 340,
          ty: U.foco.y - 6,
          big: 1,
          dmg: 220,
          rad: 55,
        });
    },
  },
  terremoto: {
    n: 'Terremoto',
    c: '#ffb04a',
    paso(U) {
      G.shake = Math.max(G.shake, U.t < 114 ? 5 : 0);
      if (U.t >= 60 && U.t <= 110 && U.t % 7 == 0) {
        caerSobre('roca', 30, 16);
        const P = G.P,
          T = objetivos(),
          tg = T[Math.floor(Math.random() * T.length)];
        if (tg)
          for (let k = 0; k < 6; k++)
            decal(
              P.x + ((tg.x - P.x) * k) / 6 + rnd(-4, 4),
              P.y + ((tg.y + 10 - P.y) * k) / 6 + rnd(-3, 3),
              3,
              '#1a120a',
              400,
            );
      }
      if (U.t == 114) {
        objetivos().forEach(t => dañar(t, t.boss ? 200 : 120, 24));
        ring(G.P.x, G.P.y, 160, '#ffb04a', 30, 4);
        sfx('pisoton');
        for (let k = 0; k < 14; k++) decal(rnd(40, 440), rnd(60, 300), rnd(4, 10), '#1a120a', 600);
        golpeFinal(U.foco.x, U.foco.y - 10, '#ffb04a');
      }
    },
  },
  torbellino: {
    n: 'Torbellino de Dagas',
    c: '#c3c8d8',
    paso(U) {
      if (U.t < 56 || U.t > 114) return;
      const P = G.P;
      if (U.t == 56) U.cuch = [...Array(12)].map((_, i) => i * 0.5236);
      U.rad = U.t < 112 ? 20 + (U.t - 56) * 2.6 : U.rad;
      U.cuch = U.cuch.map(a => a + 0.18);
      U.cuch.forEach(a => {
        const x = P.x + Math.cos(a) * U.rad,
          y = P.y - 12 + Math.sin(a) * U.rad * 0.7;
        objetivos().forEach(t => {
          if (Math.hypot(t.x - x, t.y - y) < t.r + 6 && G.t - (t.ref._tb || 0) > 8) {
            t.ref._tb = G.t;
            dañar(t, 10, 1);
          }
        });
        if (G.t % 2 == 0) G.pt.push({ x, y, vx: 0, vy: 0, l: 10, m: 10, c: '#c3c8d8', s: 1, g: 0 });
      });
      if (U.t == 114) {
        objetivos().forEach(t => dañar(t, t.boss ? 200 : 110, 20));
        golpeFinal(U.foco.x, U.foco.y - 20, '#c3c8d8');
        U.cuch = null;
      }
    },
  },
};
function caerSobre(kind, dmg, rad) {
  const U = G.U,
    B = G.B,
    T = objetivos(),
    tg = B && !B.dead ? null : T[Math.floor(Math.random() * T.length)],
    x = tg ? tg.ref.x + rnd(-8, 8) : U.foco.x + rnd(-34, 34),
    y = tg ? tg.ref.y : U.foco.y - rnd(10, 40);
  G.spears.push({ own: G.P, kind, x, y: y - 230, ty: y, big: 0, dmg, rad });
}

// Lanzar el golpe final, su remate común y el paso de cada cuadro mientras dura.
function ult() {
  const P = G.P,
    B = G.B;
  if (P.caido || P.meter < 100 || G.U || G.over || G.intro || (B && B.dead)) return;
  const T = objetivos();
  if (!T.length) return;
  P.meter = 0;
  const f = B && !B.dead ? { x: B.x, y: B.y } : { x: T[0].ref.x, y: T[0].ref.y };
  G.U = { t: 0, id: P.ult, foco: f, cr: 0, own: P };
  G.banner = { txt: ULT[P.ult].n.toUpperCase(), t: 0, c: ULT[P.ult].c };
  G.bul.forEach(b => burst(b.x, b.y, 4, '#ffffff', 1.5));
  G.bul = [];
  G.stop = 8;
  sfx('ult');
  vibrar(160);
}
function golpeFinal(x, y, c) {
  G.inv = 7;
  G.slow = 0.3;
  G.slowT = 22;
  G.zt = 1.5;
  G.flash = 8;
  G.fcol = '#ffffff';
  burst(x, y, 160, c, 7, 50, 2);
  burst(x, y, 60, '#ffffff', 5, 50, 2);
  ring(x, y, 70, c, 24, 4);
  ring(x, y, 40, '#ffffff', 14, 2);
  decal(x, y + 14, 30, '#1a0a14', 600);
  sfx('ultFinal');
}
function ultStep() {
  const U = G.U,
    B = G.B,
    C = ULT[U.id].c;
  U.t++;
  if (B && !B.dead) {
    U.foco.x = B.x;
    U.foco.y = B.y;
  }
  if (U.t < 55) {
    G.zt = 1.4;
    G.dark = Math.min(0.65, G.dark + 0.04);
    U.cr = Math.min(44, U.cr + 1.2);
    if (U.t % 2 == 0)
      G.pt.push({
        x: G.P.x + rnd(-20, 20),
        y: G.P.y,
        vx: 0,
        vy: -rnd(1, 2.5),
        l: 30,
        m: 30,
        c: Math.random() < 0.5 ? C : '#ffffff',
        s: 2,
        g: 0,
      });
  }
  if (U.t == 55) {
    G.banner = null;
    G.zt = 1.15;
  }
  if (U.t >= 55) ULT[U.id].paso(U);
  if (U.t > 178) {
    G.U = null;
    G.zt = zb();
    G.dark = 0;
  }
}
