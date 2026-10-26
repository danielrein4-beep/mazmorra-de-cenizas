// Ataques nuevos de los jefes, todos con aviso: líneas que marcan por dónde va a cruzar, círculos en el
// suelo y anillos que se cierran. Cada jefe suma dos (también en su segundo round).
const tonoJefe = B => B.def.color || B.def.tono || '#ff5a3c';

// Avisos de línea que el jefe dibuja en el suelo (los usan la carga triple y el barrido).
function avisoLinea(B, x, y, ang, len, c, t) {
  (B.lineas = B.lineas || []).push({ x, y, ang, len, c, t, m: t });
}
function drawAvisosJefe(B) {
  if (!B.lineas) return;
  B.lineas.forEach(l => {
    l.t--;
    w.globalAlpha = 0.25 + 0.5 * (1 - l.t / l.m);
    w.strokeStyle = G.t % 6 < 3 ? l.c : '#ffffff';
    w.lineWidth = 2;
    w.setLineDash([5, 4]);
    w.beginPath();
    w.moveTo(l.x, l.y);
    w.lineTo(l.x + Math.cos(l.ang) * l.len, l.y + Math.sin(l.ang) * l.len);
    w.stroke();
    w.setLineDash([]);
  });
  w.globalAlpha = 1;
  B.lineas = B.lineas.filter(l => l.t > 0);
}

Object.assign(ATAQUES, {
  // Tres embestidas seguidas; antes de cada una, la línea marca hacia dónde va.
  cargaTriple: (B, cx, cy, f) => {
    const P = G.P,
      fase = Math.floor(B.t / 40),
      t = B.t % 40;
    if (fase > 2) return true;
    if (t == 1) {
      B.dir = [P.x - B.x, P.y - B.y];
      const d = Math.hypot(...B.dir) || 1;
      B.dir = [B.dir[0] / d, B.dir[1] / d];
      avisoLinea(B, B.x, B.y - 10, Math.atan2(B.dir[1], B.dir[0]), 160, tonoJefe(B), 18);
      sfx('rugido');
    }
    if (t > 18 && t < 34) {
      const nx = B.x + B.dir[0] * 4.2 * f,
        ny = B.y + B.dir[1] * 4.2 * f;
      [B.x, B.y] = enSala(nx, ny);
      if (G.t % 2 == 0) burst(B.x, B.y, 4, '#8a7a6a', 1.5, 14);
    }
    if (t == 34) {
      bossFire(10, 1.4 * f, rnd(0, 1), tonoJefe(B), B.x, B.y - 10);
      G.shake = Math.max(G.shake, 8);
      sfx('pisoton');
    }
    return false;
  },
  // Barrido: un chorro de balas que gira media vuelta; la línea avisa de dónde empieza.
  barrido: (B, cx, cy, f) => {
    B.moving = false;
    const P = G.P;
    if (B.t == 1) {
      B.ang0 = Math.atan2(P.y - cy, P.x - cx) - 1.6;
      B.giro = Math.random() < 0.5 ? 1 : -1;
      if (B.giro < 0) B.ang0 += 3.2;
      avisoLinea(B, cx, cy, B.ang0, 220, tonoJefe(B), 26);
      sfx('ultCarga');
    }
    if (B.t > 26 && B.t < 96 && B.t % 2 == 0) {
      const a = B.ang0 + B.giro * (B.t - 26) * 0.046;
      for (let k = 1; k <= 2; k++)
        G.bul.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * (1.8 + k * 0.6) * f,
          vy: Math.sin(a) * (1.8 + k * 0.6) * f,
          c: tonoJefe(B),
          r: 3,
        });
    }
    return B.t > 104;
  },
  // Jaula: un anillo de balas aparece alrededor tuyo y se cierra; tiene un hueco para escapar.
  jaula: (B, cx, cy, f) => {
    const P = G.P;
    if (B.t == 1) {
      B.jx = P.x;
      B.jy = P.y - 10;
      B.tele = { x: P.x, y: P.y, r: 70, c: tonoJefe(B) };
      sfx('sombra');
    }
    if (B.t == 30) {
      B.tele = null;
      const hueco = rnd(0, 6.283);
      for (let i = 0; i < 28; i++) {
        const a = (i * 6.283) / 28;
        if (Math.abs(Math.atan2(Math.sin(a - hueco), Math.cos(a - hueco))) < 0.5) continue;
        G.bul.push({
          x: B.jx + Math.cos(a) * 110,
          y: B.jy + Math.sin(a) * 80,
          vx: -Math.cos(a) * 1.1 * f,
          vy: -Math.sin(a) * 0.8 * f,
          c: tonoJefe(B),
          r: 3,
          l: 150,
        });
      }
      ring(B.jx, B.jy, 100, tonoJefe(B), 14, 2);
    }
    return B.t > 60;
  },
  // Pulso: tres ondas de balas con un hueco que gira; hay que pasar por el hueco en cada una.
  pulso: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) B.tele = { x: B.x, y: B.y, r: 30, c: tonoJefe(B) };
    if ([20, 46, 72].includes(B.t)) {
      B.tele = null;
      const hueco = rnd(0, 6.283);
      for (let i = 0; i < 32; i++) {
        const a = (i * 6.283) / 32;
        if (Math.abs(Math.atan2(Math.sin(a - hueco), Math.cos(a - hueco))) < 0.35) continue;
        G.bul.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * 1.5 * f,
          vy: Math.sin(a) * 1.5 * f,
          c: tonoJefe(B),
          r: 3,
        });
      }
      ring(cx, cy, 40, tonoJefe(B), 12, 3);
      G.shake = Math.max(G.shake, 5);
      sfx('pisoton');
    }
    return B.t > 90;
  },
  // Emboscada: el suelo marca seis lugares cerca tuyo y de cada uno sale una columna de su color.
  emboscada: (B, cx, cy, f) => {
    const P = G.P;
    if (B.t == 1)
      for (let i = 0; i < (B.berserk ? 8 : 6); i++)
        zonaEn(
          { x: B.x, y: B.y },
          P.x + rnd(-80, 80),
          P.y + rnd(-55, 55),
          20,
          36 + i * 7,
          tonoJefe(B),
          'columna',
          1,
        );
    return B.t > 90;
  },
});
const NUEVOS_DE_JEFE = {
  zombi: ['cargaTriple', 'jaula'],
  ogro: ['cargaTriple', 'emboscada'],
  cenizas: ['barrido', 'jaula', 'emboscada'],
  nigromante: ['jaula', 'pulso'],
  minotauro: ['cargaTriple', 'pulso'],
  espectro: ['jaula', 'barrido'],
  hechicero: ['barrido', 'emboscada'],
  goblinRey: ['cargaTriple', 'emboscada'],
  caballeroHielo: ['barrido', 'jaula'],
};
// Se suman a todas las fases del jefe y de su forma de furia.
Object.entries(NUEVOS_DE_JEFE).forEach(([id, L]) =>
  [JEFES[id], JEFES[JEFES[id].segundo]].forEach(
    D => D && Object.values(D.ataques).forEach(lista => lista.push(...L)),
  ),
);
