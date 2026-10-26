// Rey Podrido: ataques nuevos (nube tóxica, bomba de veneno, mordisco) y su segundo round, Plaga Viva,
// que levanta tumbas por toda la sala y hace llover veneno.

JEFES.zombi.ataques[1].push('nube', 'bomba');
JEFES.zombi.ataques[2].push('mordisco', 'nube', 'bomba');
JEFES.zombi.segundo = 'plaga';
JEFES.plaga = {
  color: '#7cff4a',
  bpm: 160,
  grito: '¡TODOS SE PUDREN CONMIGO!',
  n: 'Plaga Viva',
  sub: 'Sobrevive si puedes',
  idle: JEFES.zombi.idle,
  run: JEFES.zombi.run,
  hp: 2600,
  sp: 0.8,
  fases: [[0.45, '¡LA TIERRA ME OBEDECE!']],
  ataques: {
    1: ['tumbas', 'diluvio', 'nube', 'vomito', 'mordisco', 'horda'],
    2: ['tumbas', 'diluvio', 'nube', 'mordisco', 'vomito', 'bomba', 'tumbas'],
  },
};

Object.assign(ATAQUES, {
  // Nube de gas que crece y daña a quien se quede dentro.
  nube: B => {
    if (B.t == 10) {
      G.gases.push({ x: B.x, y: B.y, r: 10, max: B.berserk ? 85 : 70, l: 360 });
      burst(B.x, B.y - 20, 30, '#7cff4a', 2.5, 30, 2);
      sfx('veneno');
    }
    return B.t > 30;
  },
  // Lanza una bomba de veneno a donde estás: al caer salpica charcos alrededor.
  bomba: B => {
    if (B.t == 15) {
      const P = G.P,
        n = B.berserk ? 3 : 1;
      for (let i = 0; i < n; i++) {
        const [x, y] = enSala(P.x + (i ? rnd(-60, 60) : 0), P.y + (i ? rnd(-40, 40) : 0));
        G.cielo.push({ x, y, t: 50, m: 50, tipo: 'veneno' });
      }
      sfx('lanzar');
    }
    return B.t > 40;
  },
  // Dos mordiscos rápidos hacia la heroína.
  mordisco: (B, cx, cy, f) => {
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
    if (B.ft < 14) {
      B.moving = false;
      return false;
    }
    B.moving = true;
    [B.x, B.y] = enSala(B.x + B.dir[0] * 5 * f, B.y + B.dir[1] * 5 * f);
    if (B.ft % 2 == 0) G.ghosts.push({ boss: 1, x: B.x, y: B.y, face: B.face, l: 10, fr: B.def.run[0] });
    if (B.ft > 30) {
      burst(B.x, B.y - 20, 16, '#7cff4a', 2.5);
      bossFire(8, 1.4, rnd(0, 1), '#7cff4a', B.x, B.y - 24);
      sfx('golpeJefe');
      B.n++;
      B.ft = 0;
      return B.n >= 2;
    }
    return false;
  },
  // Tumbas que revientan por toda la sala y dejan salir zombis.
  tumbas: B => {
    if (B.t % 8 == 0 && B.t < 64) {
      const [x, y] = lugarLibre(rnd(50, 430), rnd(70, 290));
      G.cielo.push({ x, y, t: 45, m: 45, tipo: 'tumba' });
    }
    if (B.t % 16 == 0) G.shake = Math.max(G.shake, 3);
    return B.t > 80;
  },
  // Lluvia de veneno: muchas gotas pequeñas por todo el mapa.
  diluvio: B => {
    if (B.t % 4 == 0 && B.t < 80) {
      const P = G.P,
        [x, y] =
          Math.random() < 0.3
            ? enSala(P.x + rnd(-30, 30), P.y + rnd(-30, 30))
            : enSala(rnd(40, 440), rnd(60, 300));
      G.cielo.push({ x, y, t: 40, m: 40, tipo: 'veneno' });
    }
    G.dark = Math.max(G.dark, 0.3);
    return B.t > 100;
  },
});
