// Rayos más vivos en todos los niveles y la tormenta del rayo en nivel V.
// · Todos los rayos chisporrotean (sus puntos tiemblan mientras duran) y sueltan chispas al pegar.
// · Nivel III: dos rayos finos de más salen de la mano hacia los enemigos cercanos.
// · Nivel IV: lo que toca queda electrizado y el rayo salta solo entre los electrizados.
// · Nivel V: cada rayo suelta una ráfaga de rayos finos, y el tercero de la seguidilla hace llover
//   rayos del cielo sobre toda la sala.

// Un rayo fino: más delgado, más quebrado y con más ramitas.
function rayoFino(x1, y1, x2, y2, l) {
  const b = rayoPts(x1, y1, x2, y2);
  b.pts.forEach((q, i) => i && i < b.pts.length - 1 && ((q[0] += rnd(-4, 4)), (q[1] += rnd(-4, 4))));
  b.fino = 1;
  b.l = l || 9;
  b.m = b.l;
  return b;
}
// Las puntas de los rayos tiemblan cada dos pasos: así chisporrotean en vez de quedarse quietos.
function temblarRayos() {
  if (G.t % 2) return;
  G.bolts.forEach(b =>
    b.pts.forEach((q, i) => {
      if (!i || i == b.pts.length - 1) return;
      q[0] += rnd(-1.6, 1.6);
      q[1] += rnd(-1.6, 1.6);
    }),
  );
}
function chispasRayo(x, y, n, c) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, 6.283),
      v = rnd(1.5, 4);
    G.pt.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      l: rnd(6, 14),
      m: 14,
      c: c || (i % 3 ? '#b9f3ff' : '#ffffff'),
      s: 1,
      g: 0.05,
    });
  }
}

// Después de cada rayo de la técnica: lo extra según el nivel.
function rayoSegunNivel(P, x, y, a, fin) {
  const nv = nivelTec(P, 'rayo'),
    cerca = r =>
      objetivos()
        .filter(t => Math.hypot(t.x - x, t.y - y) < r)
        .sort((p, q) => Math.hypot(p.x - x, p.y - y) - Math.hypot(q.x - x, q.y - y));
  if (nv >= 3)
    cerca(160)
      .slice(0, nv >= 5 ? 8 : 2)
      .forEach(t => {
        G.bolts.push(
          nv >= 5 ? rayoGordo(x, y, t.x, t.y, 16) : rayoFino(x, y, t.x + rnd(-4, 4), t.y + rnd(-4, 4)),
        );
        dañar(t, nv >= 5 ? 12 : 8, 0, true);
        chispasRayo(t.x, t.y, 6);
        if (nv >= 4) electrizar(P, t);
      });
  if (nv < 5) return;
  // Ráfaga: rayos gruesos en abanico hacia donde apuntas, aunque no haya nadie.
  for (let i = 0; i < 4; i++) {
    const b = a + (i - 1.5) * 0.3 + rnd(-0.1, 0.1),
      L = rnd(120, 190);
    G.bolts.push(rayoGordo(x, y, x + Math.cos(b) * L, y + Math.sin(b) * L, 14));
  }
  G.shake = Math.max(G.shake, 6);
  G.flash = Math.max(G.flash, 4);
  G.fcol = '#b9f3ff';
  if (fin) lluviaDeRayos(P);
}
// El remate del nivel V: catorce truenos caen del cielo por toda la sala, primero sobre los enemigos.
// Van a una fila de la sala y caen de a uno cada tres pasos (se frenan con la pausa como todo lo demás).
// Rayo grueso con ramas largas: el de los niveles altos (nada de destellitos).
function rayoGordo(x1, y1, x2, y2, l) {
  const r = rayoPts(x1, y1, x2, y2);
  r.br.forEach(b => {
    const [p, , q] = b;
    b[2] = [p[0] + (q[0] - p[0]) * 2.2, p[1] + (q[1] - p[1]) * 2.2];
  });
  return Object.assign(r, { gordo: 1, grueso: 1, l, m: l });
}
function lluviaDeRayos(P) {
  const blancos = objetivos().slice(0, 10);
  for (let i = 0; i < 14; i++) {
    const t = blancos[i],
      [tx, ty] = t ? [t.x, t.y] : enSala(rnd(40, 440), rnd(60, 290));
    G.rayosPend.push({ t: i * 3, tx, ty, ref: t && t.ref, P, i });
  }
  G.shake = Math.max(G.shake, 14);
  sfx('trueno');
}
function pasoRayos() {
  temblarRayos();
  G.rayosPend.forEach(z => {
    if (z.t-- > 0) return;
    z.d = 1;
    // Cada uno es un trueno: rayo grueso desde arriba, destello, temblor y estruendo.
    G.bolts.push(rayoGordo(z.tx + rnd(-30, 30), z.ty - 300, z.tx, z.ty, 18));
    chispasRayo(z.tx, z.ty, 16);
    ring(z.tx, z.ty, 30, '#5ee7ff', 12, 4);
    burst(z.tx, z.ty, 10, '#ffffff', 3, 14);
    decal(z.tx, z.ty + 4, 12, '#0a2030', 400);
    G.shake = Math.max(G.shake, 8);
    // Un solo destello suave al empezar (antes destellaba cada tres rayos y tapaba la pelea).
    if (z.i == 0) {
      G.flash = Math.max(G.flash, 3);
      G.fcol = '#b9f3ff';
    }
    const t = z.ref && objetivos(z.P).find(o2 => o2.ref === z.ref);
    if (t)
      conJugador(z.P, () => {
        dañar(t, 18, 2, true);
        electrizar(z.P, t);
      });
    if (z.i % 2 == 0) sfx('rayo');
    if (z.i % 5 == 0) sfx('trueno');
  });
  G.rayosPend = G.rayosPend.filter(z => !z.d);
}

// Electrizado: el enemigo chisporrotea y, cada tanto, un rayo fino salta a otro enemigo cercano.
function electrizar(P, t) {
  t.ref.electro = Math.max(t.ref.electro || 0, 150);
  t.ref.electroDe = P;
}
function pasoElectro(r, x, y) {
  r.electro--;
  if (G.t % 4 == 0) chispasRayo(x + rnd(-6, 6), y + rnd(-8, 4), 1);
  if (r.electro % 18 || !r.electroDe) return;
  const otro = objetivos().find(o2 => o2.ref !== r && Math.hypot(o2.x - x, o2.y - y) < 80);
  if (!otro) return;
  G.bolts.push(rayoFino(x, y, otro.x, otro.y, 7));
  conJugador(r.electroDe, () => dañar(otro, 6, 0, true));
}
