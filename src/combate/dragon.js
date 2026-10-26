// El Dragón del piso 100, último guardián de la Torre: aliento de fuego, vuelo con lluvia de meteoros,
// fuego que cae del techo y aletazos. En su segundo round se vuelve el Dragón Ancestral.
const ALAS_DRAGON = [0, 1, 2, 3, 4, 5].map(i => [i * 70, 512, 70, 73]);
JEFES.dragon = {
  n: 'Dragón de la Cima',
  sub: 'Guardián del piso 100',
  idle: ALAS_DRAGON,
  run: ALAS_DRAGON,
  vel: 8,
  esc: 1.7,
  r: 44,
  cy: 58,
  boca: 74,
  tono: '#ff8a2a',
  musica: 'final',
  hp: 5200,
  sp: 0.55,
  fases: [
    [0.66, '¡Siente el fuego antiguo!'],
    [0.33, '¡ARDERÁS EN MI CIELO!'],
  ],
  ataques: {
    1: ['aliento', 'vuelo', 'fan', 'ring', 'aliento'],
    2: ['aliento', 'vuelo', 'lluviaFuego', 'aletazo', 'spiral'],
    3: ['aliento', 'vuelo', 'lluviaFuego', 'aletazo', 'meteoros', 'spiral2'],
  },
  segundo: 'dragonF',
};
JEFES.dragonF = Object.assign({}, JEFES.dragon, {
  color: '#ff5a1a',
  bpm: 200,
  grito: '¡SOY EL FUEGO DEL PRINCIPIO!',
  n: 'Dragón Ancestral',
  sub: 'Sobrevive si puedes',
  hp: 4600,
  sp: 0.85,
  fases: [[0.45, '¡QUE ARDA LA TORRE ENTERA!']],
  ataques: {
    1: ['aliento', 'vuelo', 'lluviaFuego', 'aletazo', 'meteoros', 'tornados'],
    2: ['aliento', 'vuelo', 'lluviaFuego', 'espiralInfernal', 'aletazo', 'lanzallamas', 'meteoros'],
  },
  segundo: null,
});

// Boca del dragón: adelante de la cabeza, hacia donde mira.
const bocaDragon = (B, cy) => [B.x + B.face * 26 * (B.esc / 1.7), cy];

Object.assign(ATAQUES, {
  // Toma aire (la boca brilla) y escupe un cono de fuego que va siguiendo a la heroína.
  aliento: (B, cx, cy, f) => {
    B.moving = false;
    const [mx, my] = bocaDragon(B, cy);
    if (B.t == 1) {
      B.ang0 = Math.atan2(G.P.y - 10 - my, G.P.x - mx);
      sfx('ultCarga');
    }
    if (B.t < 34) {
      B.tele = { x: mx, y: my + 20, r: 6 + B.t * 0.6, c: '#ff8a2a' };
      if (B.t % 2 == 0) burst(mx, my, 3, '#ffe94a', 1.5, 12);
    }
    if (B.t == 34) {
      B.tele = null;
      G.shake = 10;
      sfx('fuego');
    }
    if (B.t > 34 && B.t < 110) {
      const objetivo = Math.atan2(G.P.y - 10 - my, G.P.x - mx),
        dif = Math.atan2(Math.sin(objetivo - B.ang0), Math.cos(objetivo - B.ang0));
      B.ang0 += dif * (B.berserk ? 0.045 : 0.03);
      if (B.t % 2 == 0)
        for (let k = 0; k < (B.berserk ? 3 : 2); k++) {
          const a = B.ang0 + rnd(-0.28, 0.28),
            v = rnd(2.2, 3.2) * f;
          G.bul.push({
            x: mx,
            y: my,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v,
            c: Math.random() < 0.6 ? '#ff8a2a' : '#ffe94a',
            r: 4,
          });
        }
      if (B.t % 12 == 0) sfx('fuego');
      G.shake = Math.max(G.shake, 3);
    }
    return B.t > 120;
  },
  // Levanta vuelo, persigue tu sombra lanzando meteoros y cae en picada donde estás.
  vuelo: (B, cx, cy, f) => {
    const P = G.P,
      fin = B.berserk ? 150 : 120;
    if (B.t == 1) {
      sfx('lanzar');
      burst(B.x, B.y, 40, '#8a7a6a', 3, 30, 2, 0.1);
    }
    if (B.t <= 30) B.z = (B.t / 30) * 150;
    if (B.t > 30 && B.t < fin) {
      B.x += (P.x - B.x) * 0.02;
      B.y += (P.y - B.y) * 0.02;
      if (B.t % (B.berserk ? 6 : 9) == 0) {
        const [x, y] = enSala(P.x + rnd(-60, 60), P.y + rnd(-44, 44));
        G.cielo.push({ x, y, t: 44, m: 44, tipo: 'meteoro' });
      }
    }
    if (B.t == fin) {
      B.j0 = [B.x, B.y];
      B.j1 = enSala(P.x, P.y);
      sfx('rugido');
    }
    if (B.t >= fin && B.t <= fin + 24) {
      const k = (B.t - fin) / 24;
      B.x = B.j0[0] + (B.j1[0] - B.j0[0]) * k;
      B.y = B.j0[1] + (B.j1[1] - B.j0[1]) * k;
      B.z = 150 * (1 - k * k);
      B.tele = { x: B.j1[0], y: B.j1[1], r: 44, c: '#ff3a2a' };
    }
    if (B.t == fin + 24) {
      B.z = 0;
      B.tele = null;
      G.shake = 22;
      G.stop = 6;
      sfx('caida');
      sfx('explosion');
      bossFire(B.berserk ? 32 : 24, 1.5 * f, 0, '#ff8a2a', B.x, B.y - 10);
      bossFire(B.berserk ? 32 : 24, 1.1 * f, 0.13, '#ffe94a', B.x, B.y - 10);
      ring(B.x, B.y, 90, '#ff8a2a', 24, 4);
      decal(B.x, B.y + 2, 40, '#140806', 900);
      vivos().forEach(Q => Math.hypot(Q.x - B.x, Q.y - B.y) < 44 && conJugador(Q, hurtPlayer));
    }
    return B.t > fin + 50;
  },
  // Fuego que cae del techo en columnas, con huecos para esquivar.
  lluviaFuego: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t < 20) B.z = B.t * 1.5;
    if (B.t % 16 == 1 && B.t < 110) {
      const hueco = Math.floor(rnd(1, 12));
      for (let i = 0; i < 14; i++) {
        if (Math.abs(i - hueco) < 2) continue;
        G.bul.push({ x: 24 + i * 33, y: 40, vx: 0, vy: 1.6 * f, c: '#ff8a2a', r: 4 });
      }
      sfx('fuego');
    }
    if (B.t > 110) B.z = Math.max(0, B.z - 2);
    return B.t > 130;
  },
  // Un aletazo empuja a todos hacia atrás y suelta tres oleadas de fuego.
  aletazo: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 18) {
      G.shake = 14;
      sfx('rugido');
      ring(B.x, B.y - 30, 120, '#ffffff', 30, 3);
      burst(B.x, B.y - 20, 60, '#c3b6d9', 4, 30, 2);
      vivos().forEach(Q => {
        const d = Math.max(1, Math.hypot(Q.x - B.x, Q.y - B.y));
        for (let k = 0; k < 50; k += 2) {
          const nx = Q.x + ((Q.x - B.x) / d) * 2,
            ny = Q.y + ((Q.y - B.y) / d) * 2;
          if (solidAt(nx, ny, 4)) break;
          Q.x = nx;
          Q.y = ny;
        }
      });
    }
    if ([24, 40, 56].includes(B.t)) aimFan(B.berserk ? 11 : 9, 1.8 * f, 0.17, '#ff8a2a', cx, cy);
    return B.t > 70;
  },
});
