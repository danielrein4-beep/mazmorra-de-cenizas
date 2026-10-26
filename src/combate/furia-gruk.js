// Gruk el Machacador: ataques nuevos (terremoto triple, rocas del cielo, aplastar) y su segundo round,
// Gruk Desatado, que además suelta avalanchas de rocas de lado a lado.

JEFES.ogro.ataques[1].push('rocasCielo', 'terremoto');
JEFES.ogro.ataques[2].push('aplastar', 'rocasCielo', 'terremoto');
JEFES.ogro.segundo = 'desatado';
JEFES.desatado = {
  color: '#ffb04a',
  bpm: 190,
  grito: '¡GRUK ROMPE TODO!',
  n: 'Gruk Desatado',
  sub: 'Sobrevive si puedes',
  idle: JEFES.ogro.idle,
  run: JEFES.ogro.run,
  hp: 3000,
  sp: 0.95,
  fases: [[0.45, '¡GRUK NO SE CANSA!']],
  ataques: {
    1: ['salto2', 'avalancha', 'terremoto', 'rocasCielo', 'giro', 'aplastar'],
    2: ['salto2', 'avalancha', 'terremoto', 'rocasCielo', 'aplastar', 'giro', 'avalancha'],
  },
};

Object.assign(ATAQUES, {
  // Tres pisotones seguidos, cada uno con un anillo de balas que se expande.
  terremoto: (B, cx, cy, f) => {
    const golpes = [24, 50, 76];
    if (B.t < 90) B.tele = { x: B.x, y: B.y, r: 10 + (B.t % 26) * 1.5, c: '#ffb04a' };
    if (golpes.includes(B.t)) {
      G.shake = 12;
      G.stop = 3;
      sfx('pisoton');
      bossFire(B.berserk ? 26 : 20, 1.4 * f, B.t * 0.07, '#ffb04a', B.x, B.y - 8);
      ring(B.x, B.y, 60, '#ffb04a', 16, 3);
      decal(B.x, B.y + 2, 20, '#1a120a', 500);
      burst(B.x, B.y, 30, '#8a7a6a', 3, 30, 2, 0.12);
    }
    if (B.t > 95) B.tele = null;
    return B.t > 100;
  },
  // Rocas que caen cerca de la heroína y por la sala.
  rocasCielo: B => {
    if (B.t % 6 == 0 && B.t < (B.berserk ? 84 : 60)) {
      const P = G.P,
        [x, y] =
          Math.random() < 0.5
            ? enSala(P.x + rnd(-50, 50), P.y + rnd(-40, 40))
            : enSala(rnd(40, 440), rnd(60, 300));
      G.cielo.push({ x, y, t: 50, m: 50, tipo: 'roca' });
    }
    return B.t > 90;
  },
  // Salta al centro y, al caer, lanza ocho líneas de balas como una estrella.
  aplastar: (B, cx, cy, f) => {
    const T = 40;
    if (B.t == 1) {
      B.j0 = [B.x, B.y];
      B.j1 = [240, 175];
      sfx('lanzar');
    }
    if (B.t <= T) {
      const k = B.t / T;
      B.x = B.j0[0] + (B.j1[0] - B.j0[0]) * k;
      B.y = B.j0[1] + (B.j1[1] - B.j0[1]) * k;
      B.z = Math.sin(Math.PI * k) * 110;
      B.tele = { x: B.j1[0], y: B.j1[1], r: 36, c: '#ff3a2a' };
    }
    if (B.t == T) {
      B.z = 0;
      B.tele = null;
      G.shake = 18;
      G.stop = 6;
      sfx('caida');
      for (let d = 0; d < 8; d++)
        for (let k = 0; k < 6; k++) {
          const a = (d * Math.PI) / 4 + (B.berserk ? 0.39 : 0),
            v = (1.1 + k * 0.35) * f;
          G.bul.push({ x: B.x, y: B.y - 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: '#ffb04a', r: 3 });
        }
      ring(B.x, B.y, 80, '#ffb04a', 22, 4);
      decal(B.x, B.y + 2, 34, '#1a120a', 700);
      vivos().forEach(Q => Math.hypot(Q.x - B.x, Q.y - B.y) < 38 && conJugador(Q, hurtPlayer));
    }
    return B.t > T + 30;
  },
  // Filas de rocas enormes que cruzan la sala de un lado a otro, con un hueco para pasar.
  avalancha: B => {
    if (B.t % 40 == 1 && B.t < 120) {
      const desde = Math.random() < 0.5 ? 1 : -1,
        hueco = Math.floor(rnd(1, 7));
      for (let i = 0; i < 8; i++) {
        if (i == hueco || i == hueco + 1) continue;
        G.bul.push({
          x: desde > 0 ? 24 : WW - 24,
          y: 56 + i * 32,
          vx: 2.1 * desde,
          vy: 0,
          c: '#a08070',
          r: 7,
          split: 9999,
          n: 6,
        });
      }
      G.shake = Math.max(G.shake, 6);
      sfx('caida');
    }
    return B.t > 140;
  },
});
