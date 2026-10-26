// Señor de las Cenizas: ataques nuevos del primer round y su segundo round, Furia Eterna (tornados y tormenta).

// Ataques nuevos que se suman a los del primer round.
JEFES.cenizas.ataques[1].push('meteoros');
JEFES.cenizas.ataques[2].push('teleporte', 'meteoros');
JEFES.cenizas.ataques[3].push('lanzallamas', 'teleporte', 'meteoros');

JEFES.cenizas.segundo = 'furia';
JEFES.furia = {
  color: '#ff2a4a',
  bpm: 180,
  grito: '¡AHORA CONOZCAN MI FURIA!',
  n: 'Furia Eterna',
  sub: 'Sobrevive si puedes',
  idle: JEFES.cenizas.idle,
  run: JEFES.cenizas.run,
  hp: 3400,
  sp: 1.05,
  fases: [[0.45, '¡NO ME VOY SOLO!']],
  ataques: {
    1: ['tornados', 'tormenta', 'furia', 'espiralInfernal', 'meteoros', 'teleporte'],
    2: ['tornados', 'tormenta', 'furia', 'espiralInfernal', 'lanzallamas', 'teleporte', 'tormenta'],
  },
};

Object.assign(ATAQUES, {
  // Meteoros que caen cerca de la heroína; la sombra en el suelo avisa dónde.
  meteoros: B => {
    if (B.t % 6 == 0 && B.t < 48) {
      const P = G.P,
        [x, y] = enSala(P.x + rnd(-60, 60), P.y + rnd(-40, 40));
      G.cielo.push({ x, y, t: 50, m: 50, tipo: 'meteoro' });
    }
    return B.t > 70;
  },
  // Se deshace en ceniza y reaparece detrás de la heroína con un anillo de balas.
  teleporte: (B, cx, cy, f) => {
    if (B.t == 1) {
      burst(cx, cy, 50, '#3a2e3e', 3, 34, 2);
      burst(cx, cy, 20, B.def.tono || '#ff5a3c', 2.5);
      B.oculto = 1;
      sfx('sombra');
    }
    if (B.t == 30) {
      const P = G.P,
        a = Math.atan2(P.y - B.y, P.x - B.x);
      [B.x, B.y] = enSala(P.x + Math.cos(a) * 90, P.y + Math.sin(a) * 60);
      B.oculto = 0;
      ring(B.x, B.y - 30, 40, B.def.tono || '#ff5a3c', 16, 3);
      burst(B.x, B.y - 30, 40, '#3a2e3e', 3, 30, 2);
      bossFire(14 + B.phase * 2, 1.5 * f, rnd(0, 1), B.def.tono || '#ff5a3c', B.x, B.y - 34);
      sfx('rugido');
    }
    return B.t > 50;
  },
  // Chorro de fuego que barre de un lado a otro.
  lanzallamas: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) B.ang0 = Math.atan2(G.P.y - cy, G.P.x - cx);
    if (B.t % 2 == 0 && B.t < 80) {
      const a = B.ang0 + Math.sin(B.t * 0.06) * 0.7;
      G.bul.push({
        x: cx,
        y: cy + 6,
        vx: Math.cos(a) * 2.8 * f,
        vy: Math.sin(a) * 2.8 * f,
        c: B.t % 4 ? '#ff8a2a' : '#ffe94a',
        r: 3,
        l: 55,
      });
      G.pt.push({
        x: cx,
        y: cy + 6,
        vx: Math.cos(a) * 2,
        vy: Math.sin(a) * 2,
        l: 16,
        m: 16,
        c: '#ffe94a',
        s: 2,
        g: 0,
      });
    }
    if (B.t % 10 == 0 && B.t < 80) sfx('fuego');
    return B.t > 95;
  },
  tornados: B => {
    if (B.t == 12) {
      const n = G.dif.id == 'pesadilla' ? 3 : 2;
      for (let i = 0; i < n; i++)
        G.tornados.push({ x: B.x + Math.cos(i * 2.1) * 30, y: B.y + Math.sin(i * 2.1) * 20, l: 480, t: 0 });
      ring(B.x, B.y, 50, '#c3b6d9', 16, 3);
      sfx('dash');
    }
    return B.t > 40;
  },
  // Rayos marcados en el suelo por todo el mapa; algunos apuntan a la heroína.
  tormenta: B => {
    if (B.t % 5 == 0 && B.t < 100) {
      const P = G.P,
        [x, y] =
          Math.random() < 0.35
            ? enSala(P.x + rnd(-20, 20), P.y + rnd(-20, 20))
            : enSala(rnd(40, 440), rnd(60, 300));
      G.cielo.push({ x, y, t: 42, m: 42, tipo: 'rayo' });
    }
    G.dark = Math.max(G.dark, 0.35);
    return B.t > 120;
  },
  // Tres embestidas seguidas, cada una con un anillo de balas al chocar.
  furia: (B, cx, cy, f) => {
    const P = G.P;
    if (B.t == 1) {
      B.n = 0;
      B.ft = 0;
    }
    B.ft++;
    if (B.ft == 1) {
      const a = Math.atan2(P.y - B.y, P.x - B.x);
      B.dir = [Math.cos(a), Math.sin(a)];
      B.face = B.dir[0] < 0 ? -1 : 1;
    }
    if (B.ft < 18) {
      B.moving = false;
      G.shake = Math.max(G.shake, 1.5);
      return false;
    }
    B.moving = true;
    const v = 6.5 * f,
      nx = B.x + B.dir[0] * v,
      ny = B.y + B.dir[1] * v;
    if (nx < 40 || nx > WW - 40 || ny < 60 || ny > WH - 24 || B.ft > 70) {
      G.shake = 12;
      G.stop = 4;
      sfx('caida');
      ring(B.x, B.y, 40, '#ff2a4a', 14, 3);
      bossFire(12, 1.7, rnd(0, 1), '#ff2a4a', B.x, B.y - 20);
      B.n++;
      B.ft = 0;
      return B.n >= 3;
    }
    B.x = nx;
    B.y = ny;
    if (B.ft % 2 == 0) G.ghosts.push({ boss: 1, x: B.x, y: B.y, face: B.face, l: 12, fr: B.def.run[0] });
    return false;
  },
  espiralInfernal: (B, cx, cy, f) => {
    if (B.t % 3 == 0) {
      B.ang += 0.21;
      for (let k = 0; k < 6; k++) {
        const a = B.ang + k * 1.047;
        G.bul.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * 2 * f,
          vy: Math.sin(a) * 2 * f,
          c: k % 2 ? '#ff2a4a' : '#ff8a2a',
          r: 3,
        });
      }
    }
    return B.t > 130;
  },
});
