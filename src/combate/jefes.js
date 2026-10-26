// Los tres jefes: datos, ataques, daño, cambio de fase y dibujo.
const JEFES = {
  zombi: {
    n: 'Rey Podrido',
    sub: 'Señor del pantano',
    idle: f4(16, 332, 32, 36),
    run: f4(144, 332, 32, 36),
    hp: 1200,
    sp: 0.45,
    fases: [[0.5, '¡Grrraaah!']],
    ataques: {
      1: ['vomito', 'golpe', 'horda', 'vomito'],
      2: ['vomito', 'golpe', 'horda', 'lluvia', 'golpe', 'lluvia'],
    },
  },
  ogro: {
    n: 'Gruk el Machacador',
    sub: 'Guardián del foso',
    idle: f4(16, 380, 32, 36),
    run: f4(144, 380, 32, 36),
    hp: 1400,
    sp: 0.6,
    fases: [[0.5, '¡GRUK APLASTA!']],
    ataques: { 1: ['salto', 'roca', 'giro', 'salto'], 2: ['salto2', 'roca', 'giro', 'salto2', 'roca'] },
  },
  cenizas: {
    n: 'Señor de las Cenizas',
    sub: 'Dueño de la mazmorra',
    idle: f4(16, 428, 32, 36),
    run: f4(144, 428, 32, 36),
    hp: 1600,
    sp: 0.6,
    fases: [
      [0.66, '¡Insolente!'],
      [0.33, '¡ARDE CONMIGO!'],
    ],
    ataques: {
      1: ['ring', 'fan', 'ring', 'spiral'],
      2: ['spiral', 'charge', 'fan', 'ring2', 'charge'],
      3: ['charge', 'spiral2', 'imps', 'ring2', 'fan', 'charge'],
    },
  },
};
function crearJefe(id) {
  const d = JEFES[id];
  const hp = Math.round(d.hp * G.dif.jefe);
  return {
    id,
    def: d,
    x: 240,
    y: 150,
    z: 0,
    hp,
    max: hp,
    phase: 1,
    st: 'move',
    t: 0,
    cd: 90,
    tx: 240,
    ty: 120,
    face: 1,
    hit: 0,
    moving: false,
    ang: 0,
    dir: [0, 0],
    dead: 0,
    dt: 0,
    say: '',
    sayT: 0,
    tele: null,
    n: 0,
  };
}
function limpiarBalas() {
  G.bul.forEach(b => burst(b.x, b.y, 3, b.c, 1.5));
  G.bul = [];
  G.marcas = [];
}
function hurtBoss(d, heavy, quieto) {
  const B = G.B;
  if (!B || B.dead) return;
  B.hp -= d;
  if (!quieto) {
    B.hit = 4;
    sfx('golpeJefe');
  }
  num(B.x, B.y - B.z - 70, d, d >= 100);
  if (heavy) {
    G.shake = Math.max(G.shake, heavy);
    G.stop = Math.max(G.stop, Math.round(heavy / 2));
  }
  const f = B.def.fases[B.phase - 1];
  if (f && B.hp > 0 && B.hp < B.max * f[0]) fase(f[1]);
  if (B.hp <= 0) {
    B.hp = 0;
    B.dead = 1;
    B.dt = 0;
    B.z = 0;
    B.tele = null;
    limpiarBalas();
    G.enem.forEach(m => {
      m.hp = 0;
    });
    G.spawns = [];
    G.slow = 0.35;
    G.slowT = 9999;
    G.zt = 1.3;
    sfx('roar');
    musica(null);
  }
}
function fase(txt) {
  const B = G.B;
  B.phase++;
  B.st = 'move';
  B.t = 0;
  B.cd = 70;
  B.z = 0;
  B.tele = null;
  B.say = txt;
  B.sayT = 110;
  G.stop = 20;
  G.shake = 14;
  G.flash = 6;
  G.fcol = '#ff3a2a';
  limpiarBalas();
  ring(B.x, B.y - 30, 60, '#ff3a2a', 20, 3);
  sfx('roar');
}
function bossFire(n, spd, off, col, cx, cy) {
  for (let i = 0; i < n; i++) {
    const a = off + (i * 6.283) / n;
    G.bul.push({ x: cx, y: cy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, c: col, r: 3 });
  }
}
function aimFan(n, spd, spread, col, cx, cy) {
  const P = G.P,
    a0 = Math.atan2(P.y - 10 - cy, P.x - cx);
  for (let i = 0; i < n; i++) {
    const a = a0 + (i - (n - 1) / 2) * spread;
    G.bul.push({ x: cx, y: cy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, c: col, r: 3, big: 1 });
  }
}
function toMove() {
  const B = G.B,
    ul = B.phase > B.def.fases.length;
  B.st = 'move';
  B.t = 0;
  B.z = 0;
  B.tele = null;
  B.cd = (ul ? rnd(35, 60) : rnd(55, 90)) * G.dif.cdJ;
}
function updateJefe() {
  const B = G.B,
    P = G.P;
  if (B.hit > 0) B.hit--;
  if (B.sayT > 0) B.sayT--;
  if (G.intro) {
    G.intro.t++;
    G.zt = 1.35;
    if (G.intro.t == 40) {
      G.shake = 12;
      sfx('roar');
      ring(B.x, B.y - 30, 70, '#ff3a2a', 24, 3);
    }
    if (G.intro.t >= 120) {
      G.intro = null;
      G.zt = zb();
    }
    return;
  }
  if (B.dead) {
    B.dt++;
    if (B.dt % 6 == 0 && B.dt < 100) {
      burst(B.x + rnd(-24, 24), B.y - rnd(10, 60), 26, Math.random() < 0.5 ? '#ff8a2a' : '#ffe94a', 3.5);
      ring(B.x + rnd(-20, 20), B.y - rnd(10, 50), 18, '#ffe94a', 10);
      G.shake = 8;
      sfx('boom');
    }
    if (B.dt == 100) {
      soltarMonedas(B.x, B.y - 20, 25);
      burst(B.x, B.y - 34, 220, '#ff5a3c', 7, 60, 2);
      burst(B.x, B.y - 34, 90, '#ffffff', 5, 60);
      ring(B.x, B.y - 30, 90, '#ffffff', 26, 4);
      decal(B.x, B.y + 2, 34, '#140806', 2000);
      G.flash = 10;
      G.fcol = '#ffffff';
      G.inv = 6;
      G.shake = 24;
      sfx('boom');
    }
    if (B.dt == 170) jefeDerrotado();
    return;
  }
  G.marcas.forEach(m => {
    if (--m.t <= 0) {
      m.d = 1;
      bossFire(8, 1.3, rnd(0, 1), '#7cff4a', m.x, m.y - 4);
      burst(m.x, m.y, 16, '#7cff4a', 2.5);
      ring(m.x, m.y, 16, '#7cff4a', 10);
      decal(m.x, m.y + 2, 8, '#14240a', 300);
      sfx('hit');
    }
  });
  G.marcas = G.marcas.filter(m => !m.d);
  const vel = estados(B, B.x, B.y - B.z - 34);
  if (G.U || G.over) return;
  B.t++;
  const ul = B.phase > B.def.fases.length,
    f = ul ? 1.3 : 1,
    cx = B.x,
    cy = B.y - B.z - 34;
  if (B.st == 'move') {
    if (Math.hypot(B.tx - B.x, B.ty - B.y) < 6) {
      B.tx = rnd(80, 400);
      B.ty = rnd(70, 200);
    }
    const d = Math.max(1, Math.hypot(B.tx - B.x, B.ty - B.y)),
      sp = B.def.sp * (ul ? 1.5 : 1) * vel;
    B.moving = true;
    B.x += ((B.tx - B.x) / d) * sp;
    B.y += ((B.ty - B.y) / d) * sp;
    if (--B.cd <= 0) {
      const L = B.def.ataques[B.phase];
      B.st = L[Math.floor(Math.random() * L.length)];
      B.t = 0;
      B.moving = false;
      B.n = 0;
    }
  } else if (ATAQUES[B.st](B, cx, cy, f)) toMove();
  if (B.st != 'charge' && B.st != 'giro') B.face = P.x < B.x ? -1 : 1;
  if (B.z < 10 && Math.hypot(P.x - B.x, P.y - B.y + 14) < 22) hurtPlayer();
}
function drawJefe() {
  const B = G.B,
    t = G.t;
  if (B.dead && B.dt >= 100) return;
  if (B.tele) {
    const tl = B.tele;
    w.globalAlpha = 0.25;
    w.fillStyle = tl.c;
    w.beginPath();
    w.ellipse(tl.x, tl.y, tl.r, tl.r * 0.4, 0, 0, 7);
    w.fill();
    w.globalAlpha = 1;
    w.strokeStyle = t % 6 < 3 ? tl.c : '#ffffff';
    w.lineWidth = 1;
    w.beginPath();
    w.ellipse(tl.x, tl.y, tl.r, tl.r * 0.4, 0, 0, 7);
    w.stroke();
  }
  const sh = Math.max(0.3, 1 - B.z / 120);
  w.fillStyle = 'rgba(0,0,0,.35)';
  w.beginPath();
  w.ellipse(B.x, B.y, 20 * sh, 5 * sh, 0, 0, 7);
  w.fill();
  const fr = (B.moving ? B.def.run : B.def.idle)[Math.floor(t / (B.moving ? 6 : 10)) % 4],
    jx =
      (B.st == 'charge' && B.t < 42) ||
      (B.st == 'roca' && B.t < 18) ||
      (G.intro && G.intro.t > 40 && G.intro.t < 70)
        ? rnd(-1.5, 1.5)
        : 0,
    y = B.y - B.z;
  spr(w, B.dead && t % 4 < 2 ? white : atlas, fr, B.x + jx, y, B.face < 0, 2);
  if (B.hit > 2) spr(w, white, fr, B.x + jx, y, B.face < 0, 2);
  if (B.frio > 0) {
    w.globalAlpha = 0.45;
    spr(w, cyan, fr, B.x + jx, y, B.face < 0, 2);
    w.globalAlpha = 1;
  }
  if (B.phase > B.def.fases.length && !B.dead) {
    w.globalAlpha = 0.22 + Math.sin(t * 0.2) * 0.1;
    spr(w, red, fr, B.x + jx, y, B.face < 0, 2);
    w.globalAlpha = 1;
  }
  if (B.st == 'charge' && B.t < 42 && !B.dead) {
    w.strokeStyle = B.t % 6 < 3 ? 'rgba(255,58,42,.8)' : 'rgba(255,233,74,.5)';
    w.lineWidth = 2;
    w.setLineDash([4, 3]);
    w.beginPath();
    w.moveTo(B.x, B.y - 10);
    w.lineTo(B.x + B.dir[0] * 400, B.y - 10 + B.dir[1] * 400);
    w.stroke();
    w.setLineDash([]);
  }
}
