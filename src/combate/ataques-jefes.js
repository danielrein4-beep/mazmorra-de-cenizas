// Ataques de los jefes: cada uno corre un paso por cuadro y devuelve true al terminar.
const enSala = (x, y) => [Math.max(50, Math.min(430, x)), Math.max(60, Math.min(290, y))];
// Cada ataque recibe el jefe, el centro del cuerpo y el multiplicador de furia; devuelve true al terminar.
const ATAQUES = {
  ring: (B, cx, cy, f) => {
    if (B.t == 1) {
      bossFire(18 + B.phase * 4, 1.3 * f, rnd(0, 1), '#ff3fd2', cx, cy);
      ring(cx, cy, 30, '#ff3fd2', 12);
    }
    return B.t > 30;
  },
  ring2: (B, cx, cy, f) => {
    if (B.t % 16 == 1 && B.t < 40)
      bossFire(20, 1.5 * f, B.t * 0.1, B.t % 32 == 1 ? '#ff3fd2' : '#ff5a3c', cx, cy);
    return B.t > 50;
  },
  fan: (B, cx, cy, f) => {
    if (B.t % 12 == 1 && B.t < 36) aimFan(B.phase == 3 ? 7 : 5, 2.3 * f, 0.16, '#ffe94a', cx, cy);
    return B.t > 45;
  },
  spiral: (B, cx, cy, f) => {
    if (B.t % 4 == 0) {
      B.ang += 0.27;
      for (let k = 0; k < 2; k++) {
        const a = B.ang + k * 3.1416;
        G.bul.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * 1.6 * f,
          vy: Math.sin(a) * 1.6 * f,
          c: k ? '#ff5a3c' : '#ff3fd2',
          r: 3,
        });
      }
    }
    return B.t > 110;
  },
  spiral2: (B, cx, cy, f) => {
    if (B.t % 4 == 0) {
      B.ang += 0.27;
      for (let k = 0; k < 4; k++) {
        const a = B.ang + k * 1.5708;
        G.bul.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * 1.6 * f,
          vy: Math.sin(a) * 1.6 * f,
          c: k % 2 ? '#ff5a3c' : '#ff3fd2',
          r: 3,
        });
      }
    }
    return B.t > 110;
  },
  charge: (B, cx, cy, f) => {
    const P = G.P;
    if (B.t == 1) {
      const a = Math.atan2(P.y - B.y, P.x - B.x);
      B.dir = [Math.cos(a), Math.sin(a)];
      B.face = B.dir[0] < 0 ? -1 : 1;
    }
    if (B.t < 42) {
      G.shake = Math.max(G.shake, 1);
      return false;
    }
    B.moving = true;
    const nx = B.x + B.dir[0] * 6.5,
      ny = B.y + B.dir[1] * 6.5;
    if (nx < 40 || nx > WW - 40 || ny < 60 || ny > WH - 24 || B.t > 90) {
      G.shake = 12;
      G.stop = 5;
      sfx('land');
      burst(B.x, B.y - 10, 40, '#ff8a2a', 4);
      ring(B.x, B.y, 40, '#ff8a2a', 14, 3);
      decal(B.x, B.y + 2, 18, '#140806', 400);
      bossFire(16, 1.6, 0, '#ff5a3c', B.x, B.y - 20);
      return true;
    }
    B.x = nx;
    B.y = ny;
    if (B.t % 2 == 0) G.ghosts.push({ boss: 1, x: B.x, y: B.y, face: B.face, l: 12, fr: B.def.run[0] });
    return false;
  },
  imps: B => {
    if (B.t == 20)
      for (let i = 0; i < 3; i++) {
        const a = i * 2.09;
        spawnEnemigo(B.def.horda || 'imp', ...enSala(B.x + Math.cos(a) * 40, B.y + Math.sin(a) * 24));
      }
    return B.t > 40;
  },
  vomito: (B, cx, cy, f) => {
    const P = G.P;
    B.moving = false;
    if (B.t % 3 == 0 && B.t < 70) {
      const a = Math.atan2(P.y - 10 - cy, P.x - cx) + rnd(-0.3, 0.3);
      G.bul.push({
        x: cx,
        y: cy + 6,
        vx: Math.cos(a) * 2.1 * f,
        vy: Math.sin(a) * 2.1 * f,
        c: '#7cff4a',
        r: 3,
        charco: Math.round(rnd(40, 70)),
      });
    }
    if (B.t % 4 == 0) burst(cx, cy + 6, 4, '#7cff4a', 1.5, 16);
    return B.t > 85;
  },
  golpe: (B, cx, cy, f) => {
    if (B.t < 40) {
      B.tele = { x: B.x, y: B.y, r: 8 + B.t * 1.4, c: '#7cff4a' };
      G.shake = Math.max(G.shake, 0.8);
    }
    if (B.t == 40) {
      B.tele = null;
      G.shake = 12;
      G.stop = 4;
      sfx('land');
      bossFire(24, 1.4 * f, 0, '#7cff4a', B.x, B.y - 10);
      ring(B.x, B.y, 60, '#7cff4a', 18, 3);
      decal(B.x, B.y + 2, 26, '#14240a', 500);
      burst(B.x, B.y, 30, '#6a5a3a', 3, 30, 2, 0.1);
    }
    if (B.t == 56) bossFire(24, 1.1 * f, 0.13, '#b4ff8a', B.x, B.y - 10);
    return B.t > 75;
  },
  horda: B => {
    if (B.t == 15) {
      for (let i = 0; i < 4; i++) {
        const a = i * 1.571 + 0.4;
        spawnEnemigo(B.def.horda || 'tiny', ...enSala(B.x + Math.cos(a) * 44, B.y + Math.sin(a) * 28));
      }
      ring(B.x, B.y, 40, '#9a3aff', 16);
    }
    return B.t > 40;
  },
  lluvia: B => {
    const P = G.P;
    if (B.t % 8 == 0 && B.t < 90) {
      const [x, y] = enSala(P.x + rnd(-50, 50), P.y + rnd(-40, 40));
      G.marcas.push({ x, y, t: 45 });
    }
    return B.t > 100;
  },
  salto: (B, cx, cy, f) => {
    const P = G.P,
      T = 50;
    if (B.t == 1) {
      B.j0 = [B.x, B.y];
      B.j1 = enSala(P.x, P.y);
      sfx('throw');
      burst(B.x, B.y, 20, '#8a7a6a', 2.5, 24, 2, 0.1);
    }
    if (B.t <= T) {
      const k = B.t / T;
      B.x = B.j0[0] + (B.j1[0] - B.j0[0]) * k;
      B.y = B.j0[1] + (B.j1[1] - B.j0[1]) * k;
      B.z = Math.sin(Math.PI * k) * 90;
      B.tele = { x: B.j1[0], y: B.j1[1], r: 30, c: '#ff3a2a' };
    }
    if (B.t == T) {
      B.z = 0;
      B.tele = null;
      G.shake = 16;
      G.stop = 6;
      sfx('land');
      bossFire(f > 1 ? 28 : 22, 1.6 * f, rnd(0, 1), '#ffb04a', B.x, B.y - 8);
      ring(B.x, B.y, 70, '#ffb04a', 20, 4);
      decal(B.x, B.y + 2, 30, '#1a120a', 600);
      burst(B.x, B.y, 40, '#8a7a6a', 3.5, 34, 2, 0.12);
      if (Math.hypot(P.x - B.x, P.y - B.y) < 34) hurtPlayer();
    }
    if (B.t > T + 20) {
      if (B.st == 'salto2' && !B.n) {
        B.n = 1;
        B.t = 0;
        return false;
      }
      return true;
    }
    return false;
  },
  roca: (B, cx, cy, f) => {
    const P = G.P,
      tira = t2 => {
        const a = Math.atan2(P.y - 10 - cy, P.x - cx);
        G.bul.push({
          x: cx,
          y: cy - 10,
          vx: Math.cos(a) * 1.9,
          vy: Math.sin(a) * 1.9,
          c: '#a08070',
          r: 7,
          split: 60,
          n: f > 1 ? 12 : 8,
        });
        sfx('throw');
        burst(cx, cy - 10, 10, '#8a7a6a', 2);
      };
    if (B.t == 18) tira();
    if (f > 1 && B.t == 40) tira();
    return B.t > (f > 1 ? 60 : 36);
  },
  giro: (B, cx, cy, f) => {
    const P = G.P,
      d = Math.max(1, Math.hypot(P.x - B.x, P.y - B.y));
    B.moving = true;
    const nx = B.x + ((P.x - B.x) / d) * 1.25 * f,
      ny = B.y + ((P.y - B.y) / d) * 1.25 * f;
    [B.x, B.y] = enSala(nx, ny);
    B.face = Math.floor(B.t / 4) % 2 ? 1 : -1;
    if (B.t % 5 == 0) {
      B.ang += 0.5;
      for (let k = 0; k < 3; k++) {
        const a = B.ang + k * 2.094;
        G.bul.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * 1.5 * f,
          vy: Math.sin(a) * 1.5 * f,
          c: '#ffb04a',
          r: 3,
        });
      }
    }
    if (B.t % 3 == 0) burst(B.x, B.y, 2, '#8a7a6a', 1.2, 14);
    return B.t > 90;
  },
};
ATAQUES.salto2 = ATAQUES.salto;
