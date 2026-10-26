// Motor de poderes: objetivos, daño con el arma, proyectiles, tajos, ondas, veneno, golpes finales y sus efectos.
function objetivos() {
  const L = [],
    B = G.B;
  if (B && !B.dead && B.z < 14 && !G.intro) L.push({ x: B.x, y: B.y - 32, r: 32, ref: B, boss: 1 }); // el cuerpo del jefe ocupa unos 64 px
  G.enem.forEach(m => L.push({ x: m.x, y: m.y - m.h / 2, r: 7, ref: m }));
  return L;
}
function objetivoCercano() {
  const P = G.P;
  let best = null,
    bd = 1e9;
  objetivos().forEach(o2 => {
    const d = Math.hypot(o2.x - P.x, o2.y - P.y);
    if (d < bd) {
      bd = d;
      best = o2;
    }
  });
  return best;
}
function dañar(tg, d, heavy, sinArma) {
  const P = G.P,
    A = armaInfo(P.arma);
  d = Math.round(d * (sinArma ? 1 : A.mult));
  P.meter = Math.min(100, P.meter + d * 0.11 * (1 + 0.5 * lvl('abismo')));
  const r = tg.ref;
  if (A.efecto == 'quema') r.quema = 150;
  if (A.efecto == 'frio') r.frio = 120;
  if (A.efecto == 'vampiro') {
    P.vamp = (P.vamp || 0) + d;
    if (P.vamp >= 220) {
      P.vamp = 0;
      if (P.hp < P.max) {
        P.hp++;
        burst(P.x, P.y - 14, 10, '#ff4a5a', 1.5);
        ring(P.x, P.y - 12, 10, '#ff8a9a', 10);
      }
    }
  }
  if (tg.boss) {
    hurtBoss(d, heavy);
    return;
  }
  r.hp -= d;
  r.hit = 5;
  num(r.x, r.y - r.h - 4, d);
  sfx('hit');
  const a = Math.atan2(r.y - P.y, r.x - P.x);
  r.kx = Math.cos(a) * 1.5;
  r.ky = Math.sin(a) * 1.5;
  if (heavy) {
    G.shake = Math.max(G.shake, heavy);
    G.stop = Math.max(G.stop, 2);
  }
}
// Quemado y congelado: se llama cada paso para enemigos y jefes; devuelve el multiplicador de velocidad.
function estados(r, x, y) {
  if (r.quema > 0) {
    r.quema--;
    if (r.quema % 12 == 0) {
      if (r === G.B) hurtBoss(4, 0, 1);
      else {
        r.hp -= 4;
        num(r.x, r.y - r.h - 4, 4);
      }
    }
    if (G.t % 3 == 0)
      G.pt.push({
        x: x + rnd(-5, 5),
        y: y + rnd(-5, 5),
        vx: 0,
        vy: -0.6,
        l: 16,
        m: 16,
        c: Math.random() < 0.5 ? '#ff8a2a' : '#ffe94a',
        s: 1,
        g: 0,
      });
  }
  if (r.frio > 0) {
    r.frio--;
    if (G.t % 5 == 0)
      G.pt.push({
        x: x + rnd(-6, 6),
        y: y + rnd(-6, 6),
        vx: 0,
        vy: 0.2,
        l: 14,
        m: 14,
        c: '#bff6ff',
        s: 1,
        g: 0,
      });
    return 0.5;
  }
  return 1;
}
function cortarBalas(x, y, r, a, arc) {
  G.bul = G.bul.filter(b => {
    const d = Math.hypot(b.x - x, b.y - y);
    if (d > r + 3) return true;
    if (arc) {
      let da = Math.abs(Math.atan2(b.y - y, b.x - x) - a) % 6.283;
      if (da > 3.1416) da = 6.283 - da;
      if (da > arc / 2) return true;
    }
    burst(b.x, b.y, 4, '#ffffff', 1.5);
    return false;
  });
}
function golpeArco(x, y, a, r, arc, dmg, heavy, corta, col) {
  objetivos().forEach(t => {
    const d = Math.hypot(t.x - x, t.y - y);
    if (d > r + t.r) return;
    let da = Math.abs(Math.atan2(t.y - y, t.x - x) - a) % 6.283;
    if (da > 3.1416) da = 6.283 - da;
    if (arc < 6 && da > arc / 2 + 0.3) return;
    dañar(t, dmg, heavy);
  });
  if (corta) cortarBalas(x, y, r, a, arc < 6 ? arc : 0);
  dañarCajas(x, y, r * 0.8, dmg);
  G.tajos.push({ x, y, a, r, arc: Math.min(arc, 5.8), l: 9, c: col || '#fff1b0' });
  for (let i = 0; i < 8; i++) {
    const b = a + rnd(-arc / 2, arc / 2);
    G.pt.push({
      x: x + Math.cos(b) * r,
      y: y + Math.sin(b) * r,
      vx: Math.cos(b),
      vy: Math.sin(b),
      l: 12,
      m: 12,
      c: col || '#fff1b0',
      s: 1,
      g: 0,
    });
  }
}
function cast() {
  const P = G.P;
  if (P.caido || P.cds[P.spell] > 0 || P.dash > 0 || P.est || G.U) return;
  const id = P.tecs[P.spell],
    T = TEC[id],
    A = armaInfo(P.arma),
    a = Math.atan2(P.ay - (P.y - 14), P.ax - P.x),
    ox = P.x + Math.cos(a) * 14,
    oy = P.y - 14 + Math.sin(a) * 14;
  P.cds[P.spell] = Math.round(T.cd * A.cdm);
  P.kick = 4;
  P.circ = 12;
  for (let i = 0; i < 6; i++) {
    const b = a + rnd(-0.7, 0.7),
      v = rnd(1, 2.6);
    G.pt.push({
      x: ox,
      y: oy,
      vx: Math.cos(b) * v,
      vy: Math.sin(b) * v,
      l: 10,
      m: 10,
      c: i % 2 ? T.c : '#ffffff',
      s: 1,
      g: 0,
    });
  }
  T.usar(P, a, ox, oy);
}
function rayoPts(x1, y1, x2, y2) {
  const d = Math.hypot(x2 - x1, y2 - y1),
    n = Math.max(2, Math.round(d / 10)),
    pts = [[x1, y1]],
    br = [],
    an = Math.atan2(y2 - y1, x2 - x1);
  for (let i = 1; i < n; i++) {
    const f = i / n,
      px = x1 + (x2 - x1) * f + rnd(-5, 5),
      py = y1 + (y2 - y1) * f + rnd(-5, 5);
    pts.push([px, py]);
    if (Math.random() < 0.3) {
      const ba = an + rnd(-1.3, 1.3),
        L = rnd(8, 20);
      br.push([
        [px, py],
        [px + (Math.cos(ba) * L) / 2 + rnd(-3, 3), py + (Math.sin(ba) * L) / 2 + rnd(-3, 3)],
        [px + Math.cos(ba) * L, py + Math.sin(ba) * L],
      ]);
    }
  }
  pts.push([x2, y2]);
  return { pts, br, l: 10 };
}
// El tercer rayo de la seguidilla cae del cielo sobre donde pegó y salta a más enemigos.
function rayo(ox, oy, a, dmg, fin) {
  let x = ox,
    y = oy,
    hit = null;
  const T = objetivos();
  for (let d = 0; d < 230; d += 6) {
    x = ox + Math.cos(a) * d;
    y = oy + Math.sin(a) * d;
    if (solidAt(x, y, 0)) break;
    hit = T.find(t2 => Math.hypot(t2.x - x, t2.y - y) < t2.r + 3);
    if (hit) break;
  }
  G.bolts.push(rayoPts(ox, oy, x, y));
  G.flash = fin ? 6 : 3;
  G.fcol = '#b9f3ff';
  sfx(fin ? 'trueno' : 'rayo');
  burst(x, y, fin ? 40 : 18, '#b9f3ff', fin ? 4.5 : 3.2, 18);
  ring(x, y, fin ? 34 : 16, '#5ee7ff', fin ? 16 : 10, 2);
  decal(x, y + 6, fin ? 12 : 5, '#1a3a4a', 300);
  if (fin) {
    const b = rayoPts(x + rnd(-10, 10), y - 220, x, y);
    b.l = 14;
    b.gordo = 1;
    G.bolts.push(b);
    G.shake = 12;
    G.stop = 5;
    objetivos().forEach(t => {
      if (Math.hypot(t.x - x, t.y - y) < 30 + t.r && t !== hit) dañar(t, 40, 4);
    });
  }
  if (!hit) return;
  dañar(hit, dmg, fin ? 8 : 5);
  let from = hit,
    n = (fin ? 3 : 0) + (lvl('rayo') ? 2 : 0) + (lvl('rayo') > 1 ? 2 : 0);
  const usados = [hit.ref];
  while (n-- > 0) {
    const nx = objetivos()
      .filter(t2 => !usados.includes(t2.ref))
      .sort((p, q) => Math.hypot(p.x - from.x, p.y - from.y) - Math.hypot(q.x - from.x, q.y - from.y))[0];
    if (!nx || Math.hypot(nx.x - from.x, nx.y - from.y) > 110) break;
    usados.push(nx.ref);
    G.bolts.push(rayoPts(from.x, from.y, nx.x, nx.y));
    dañar(nx, fin ? 35 : 25, 2);
    burst(nx.x, nx.y, 10, '#b9f3ff', 2.5);
    from = nx;
  }
}
function dash() {
  const P = G.P;
  if (P.caido || P.dash > 0 || P.dcd > 0 || P.est || G.U || G.intro || G.over) return;
  let dx = P.dx,
    dy = P.dy;
  if (!dx && !dy) {
    dx = P.face;
    dy = 0;
  }
  const m = Math.hypot(dx, dy);
  P.dashV = [(dx / m) * 3.6, (dy / m) * 3.6];
  P.dash = 13;
  P.dcd = Math.round(40 * (1 - 0.3 * lvl('pies')));
  burst(P.x, P.y, 10, '#8a7a9a', 1.5, 18);
  ring(P.x, P.y, 10, '#c3b6d9', 8, 1);
  sfx('dash');
}
function explotar(x, y) {
  const lf = lvl('fuego'),
    r = 26 * (1 + 0.5 * lf);
  dañarCajas(x, y, r, 30);
  objetivos().forEach(t2 => {
    if (Math.hypot(t2.x - x, t2.y - y) < r + t2.r) dañar(t2, Math.round(18 * (1 + 0.3 * lf)), 0);
  });
  ring(x, y, r, '#ff8a2a', 16, 3);
  ring(x, y, r * 0.6, '#ffe94a', 10, 2);
  decal(x, y + 6, r * 0.6, '#140806', 420);
  G.flash = 3;
  G.fcol = '#ff8a2a';
  G.shake = Math.max(G.shake, 4);
  G.stop = Math.max(G.stop, 3);
  burst(x, y, 30, '#ff8a2a', 3.5, 26, 2, 0.05);
  burst(x, y, 16, '#ffe94a', 2.5, 20, 1, 0.05);
  for (let i = 0; i < 10; i++)
    G.pt.push({
      x: x + rnd(-r / 2, r / 2),
      y: y + rnd(-r / 3, r / 3),
      vx: rnd(-0.3, 0.3),
      vy: -rnd(0.3, 0.8),
      l: 44,
      m: 44,
      c: '#3a2e3e',
      s: 2,
      g: -0.005,
    });
  sfx('boom');
}
function updatePoderes() {
  G.jug.forEach(P =>
    conJugador(P, () => {
      if (P.est) {
        P.est.t--;
        const [dx, dy] = P.est.dir;
        for (let k = 0; k < 2; k++) {
          if (!solidAt(P.x + dx * 2.3, P.y + dy * 2.3, 4)) {
            P.x += dx * 2.3;
            P.y += dy * 2.3;
          }
        }
        G.ghosts.push({ x: P.x, y: P.y, face: P.face, l: 12, spr: P.spr });
        objetivos().forEach(t => {
          if (!P.est.hits.includes(t.ref) && Math.hypot(t.x - P.x, t.y - P.y + 12) < t.r + 10) {
            P.est.hits.push(t.ref);
            dañar(t, Math.round(40 * (1 + 0.3 * lvl('estocada'))), 5);
            burst(t.x, t.y, 14, '#ffe94a', 3);
          }
        });
        cortarBalas(P.x, P.y - 12, 12);
        if (P.est.t <= 0) P.est = null;
      }
      if (P.escudo > 0) P.escudo--;
    }),
  );
  G.shots.forEach(s => {
    const T = SHOT_T[s.k];
    const dueño = s.own || G.jug[0];
    if (T.mover) conJugador(dueño, () => T.mover(s));
    else {
      s.x += s.vx;
      s.y += s.vy;
    }
    s.l--;
    T.trail && T.trail(s);
    let muere = s.l <= 0 || (!T.fantasma && solidAt(s.x, s.y, 0));
    if (!muere)
      objetivos().forEach(tg => {
        if (muere || s.hits.includes(tg.ref)) return;
        if (Math.hypot(s.x - tg.x, s.y - tg.y) < tg.r + s.r) {
          s.hits.push(tg.ref);
          conJugador(dueño, () => dañar(tg, s.dmg, s.k == 'fuego' ? 4 : 0));
          if (s.pierce > 0) s.pierce--;
          else muere = true;
        }
      });
    if (muere) {
      s.d = 1;
      if (s.l > 0) golpeEnMuro(s.x, s.y, s.dmg);
      T.fin && conJugador(dueño, () => T.fin(s));
    }
  });
  G.shots = G.shots.filter(s => !s.d);
  G.ondas.forEach(o2 => {
    o2.r += 3.2;
    objetivos().forEach(t => {
      if (!o2.hits.includes(t.ref) && Math.abs(Math.hypot(t.x - o2.x, t.y - o2.y + 6) - o2.r) < 10) {
        o2.hits.push(t.ref);
        conJugador(o2.own || G.jug[0], () => dañar(t, o2.dmg, 3));
      }
    });
    G.bul = G.bul.filter(b => {
      if (Math.abs(Math.hypot(b.x - o2.x, b.y - o2.y) - o2.r) < 6) {
        burst(b.x, b.y, 3, '#ffb04a', 1);
        return false;
      }
      return true;
    });
    if (G.t % 2 == 0)
      burst(o2.x + Math.cos(G.t) * o2.r, o2.y + Math.sin(G.t) * o2.r * 0.6, 3, '#8a7a6a', 1, 14);
  });
  G.ondas = G.ondas.filter(o2 => o2.r < o2.max);
  G.frascos.forEach(f => {
    f.t++;
    const k = f.t / f.T;
    f.x = f.x0 + (f.tx - f.x0) * k;
    f.y = f.y0 + (f.ty - f.y0) * k - Math.sin(Math.PI * k) * 30;
    if (f.t >= f.T) {
      f.d = 1;
      const lv = lvl('veneno');
      G.nubes.push({
        own: f.own,
        x: f.tx,
        y: f.ty + 8,
        r: 28 * (1 + 0.35 * lv),
        l: 180 + 90 * lv,
        m: 180 + 90 * lv,
      });
      burst(f.tx, f.ty, 20, '#7cff4a', 2.5);
      sfx('veneno');
    }
  });
  G.frascos = G.frascos.filter(f => !f.d);
  G.nubes.forEach(n => {
    n.l--;
    if (G.t % 10 == 0)
      objetivos().forEach(t => {
        if (Math.hypot(t.x - n.x, (t.y - n.y) * 1.4) < n.r)
          conJugador(n.own || G.jug[0], () => dañar(t, 4, 0));
      });
    if (G.t % 3 == 0)
      G.pt.push({
        x: n.x + rnd(-n.r, n.r) * 0.8,
        y: n.y + rnd(-n.r, n.r) * 0.4,
        vx: 0,
        vy: -0.3,
        l: 24,
        m: 24,
        c: Math.random() < 0.5 ? '#7cff4a' : '#3a8a1a',
        s: 2,
        g: 0,
      });
  });
  G.nubes = G.nubes.filter(n => n.l > 0);
  G.bolts.forEach(b => b.l--);
  G.bolts = G.bolts.filter(b => b.l > 0);
  G.tajos.forEach(t => t.l--);
  G.tajos = G.tajos.filter(t => t.l > 0);
  G.cortes.forEach(c => c.l--);
  G.cortes = G.cortes.filter(c => c.l > 0);
  G.spears.forEach(s => {
    s.y += s.big ? 16 : s.kind == 'flecha' ? 15 : 13;
    G.pt.push({
      x: s.x + rnd(-2, 2) * (s.big ? 3 : 1),
      y: s.y - rnd(0, 20),
      vx: 0,
      vy: -1,
      l: 14,
      m: 14,
      c:
        s.kind == 'lanza'
          ? Math.random() < 0.6
            ? '#ff2a4a'
            : '#2a0010'
          : s.kind == 'flecha'
            ? '#b4ff8a'
            : '#8a7a6a',
      s: s.big ? 3 : 1,
      g: 0,
    });
    if (s.y >= s.ty) {
      s.d = 1;
      dañarCajas(s.x, s.ty, s.rad, s.dmg);
      objetivos().forEach(t => {
        if (Math.hypot(t.x - s.x, t.y - (s.ty - 10)) < s.rad + t.r)
          conJugador(s.own || G.jug[0], () =>
            dañar(t, s.big && !t.boss ? Math.round(s.dmg * 0.55) : s.dmg, s.big ? 22 : 4),
          );
      });
      const c = s.kind == 'lanza' ? '#ff2a4a' : s.kind == 'flecha' ? '#7cff4a' : '#ffb04a';
      if (s.big) golpeFinal(s.x, s.ty, c);
      else {
        burst(s.x, s.ty, 20, c, 3.2);
        ring(s.x, s.ty, s.rad, c, 10, 2);
        decal(s.x, s.ty + 4, s.rad * 0.4, '#1a0a14', 400);
        sfx('hit');
      }
    }
  });
  G.spears = G.spears.filter(s => !s.d);
  if (G.U) conJugador(G.U.own || G.jug[0], ultStep);
}
