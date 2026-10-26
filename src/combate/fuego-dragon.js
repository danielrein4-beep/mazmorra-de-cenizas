// Fuego de verdad para el Dragón del piso 100: sus balas se dibujan como llamas que titilan, el aliento
// deja el suelo ardiendo, y tiene ataques nuevos (muro de fuego, garra, infierno). Al renacer como
// Dragón Ancestral su fuego se vuelve negro y morado, con meteoros oscuros y un aura de llamas.
const FUEGO_NORMAL = ['#ff8a2a', '#ffb04a', '#ffe94a'],
  FUEGO_NEGRO = ['#b06bff', '#8a2aff', '#ff3fd2'];
const fuegoDe = B => (B.berserk ? FUEGO_NEGRO : FUEGO_NORMAL);

// Lo que el dragón suelta durante un ataque se vuelve llama (y, al renacer, llama negra).
function conLlamas(id, fn) {
  return (B, cx, cy, f) => {
    if (B.id != 'dragon') return fn(B, cx, cy, f);
    const balas = G.bul.length,
      cielo = G.cielo.length,
      fin = fn(B, cx, cy, f),
      C = fuegoDe(B);
    G.bul.slice(balas).forEach(b => {
      b.llama = B.berserk ? 2 : 1;
      b.c = C[Math.floor(Math.random() * 3)];
      b.r = Math.max(b.r, 4);
    });
    if (B.berserk) G.cielo.slice(cielo).forEach(m => m.tipo == 'meteoro' && (m.tipo = 'meteoroNegro'));
    // El aliento deja el suelo en llamas por donde pasa.
    if (id == 'aliento' && B.t > 40 && B.t < 110 && B.t % 9 == 0) {
      const [mx, my] = bocaDragon(B, cy),
        d = rnd(60, 170);
      sueloEnLlamas(...enSala(mx + Math.cos(B.ang0) * d, my + 30 + Math.sin(B.ang0) * d), B);
    }
    return fin;
  };
}
function sueloEnLlamas(x, y, B) {
  const C = fuegoDe(B);
  G.gases.push({
    x,
    y,
    r: 4,
    max: B.berserk ? 22 : 16,
    l: B.berserk ? 220 : 160,
    c: C[0],
    c2: C[2],
    fuego: 1,
  });
}

// Llama: núcleo claro (u oscuro en la llama negra), cuerpo de su color y un halo que titila.
function drawLlama(b, t) {
  const r = b.r + Math.sin(t * 0.6 + b.x) * 1.2,
    negra = b.llama == 2;
  w.globalAlpha = 0.3;
  w.fillStyle = b.c;
  w.beginPath();
  w.arc(b.x, b.y, r * 2, 0, 7);
  w.fill();
  w.globalAlpha = 1;
  w.fillStyle = b.c;
  w.beginPath();
  w.moveTo(b.x - b.vx * 3, b.y - b.vy * 3 - r);
  w.arc(b.x, b.y, r, 0, 7);
  w.fill();
  w.fillStyle = negra ? '#12051e' : '#fff3c0';
  w.beginPath();
  w.arc(b.x, b.y, r * 0.5, 0, 7);
  w.fill();
  if (t % 3 == 0)
    G.pt.push({
      x: b.x + rnd(-2, 2),
      y: b.y,
      vx: -b.vx * 0.2,
      vy: -0.6,
      l: 12,
      m: 12,
      c: negra ? '#2a0a4a' : '#ff6a2a',
      s: 2,
      g: 0,
    });
}

// Meteoro oscuro del Dragón Ancestral.
COLOR_MARCA.meteoroNegro = '#b06bff';
CAIDA.meteoroNegro = ['#2a0a4a', '#b06bff', 6];
CAE.meteoroNegro = m => {
  ring(m.x, m.y, 30, '#b06bff', 14, 3);
  burst(m.x, m.y, 30, '#8a2aff', 3.5, 26, 2, 0.05);
  burst(m.x, m.y, 12, '#12051e', 2.5, 30, 3);
  bossFire(9, 1.3, rnd(0, 1), '#b06bff', m.x, m.y - 4);
  G.bul.slice(-9).forEach(b => (b.llama = 2));
  decal(m.x, m.y + 2, 14, '#0b0010', 600);
  sueloEnLlamas(m.x, m.y, { berserk: 1 });
  sfx('explosion');
  return 24;
};

Object.assign(ATAQUES, {
  // Tres muros de fuego bajan por la sala, cada uno con un hueco para pasar.
  muroFuego: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t % 34 == 1 && B.t < 100) {
      const hueco = Math.floor(rnd(1, 11));
      for (let i = 0; i < 14; i++) {
        if (Math.abs(i - hueco) < 2) continue;
        G.bul.push({ x: 24 + i * 33, y: 44, vx: 0, vy: 1.35 * f, c: '#ff8a2a', r: 5 });
      }
      G.shake = Math.max(G.shake, 5);
      sfx('fuego');
    }
    return B.t > 120;
  },
  // Garra: se lanza corto hacia ti y suelta dos zarpazos de llamas en arco.
  garra: (B, cx, cy, f) => {
    const P = G.P;
    if (B.t == 1) {
      B.dir = [P.x - B.x, P.y - B.y];
      const d = Math.hypot(...B.dir) || 1;
      B.dir = [B.dir[0] / d, B.dir[1] / d];
      sfx('rugido');
    }
    if (B.t < 16) B.tele = { x: B.x + B.dir[0] * 50, y: B.y + B.dir[1] * 50, r: 30, c: '#ff3a2a' };
    if (B.t >= 16 && B.t < 30) {
      B.tele = null;
      B.x += B.dir[0] * 3.5;
      B.y += B.dir[1] * 3.5;
      [B.x, B.y] = enSala(B.x, B.y);
    }
    if (B.t == 30 || B.t == 44) {
      const a0 = Math.atan2(P.y - 10 - cy, P.x - B.x);
      for (let i = 0; i < 9; i++) {
        const a = a0 + (i - 4) * 0.15;
        G.bul.push({
          x: B.x + Math.cos(a) * 20,
          y: cy + Math.sin(a) * 20,
          vx: Math.cos(a) * 2.3 * f,
          vy: Math.sin(a) * 2.3 * f,
          c: '#ff8a2a',
          r: 4,
        });
      }
      ring(B.x, cy, 36, '#ff8a2a', 12, 3);
      G.shake = Math.max(G.shake, 8);
      sfx('tajo');
    }
    return B.t > 60;
  },
  // Infierno: el suelo marca cinco lugares a tu alrededor y de ahí brotan columnas de fuego.
  infierno: (B, cx, cy, f) => {
    const P = G.P;
    if (B.t == 1)
      for (let i = 0; i < (B.berserk ? 7 : 5); i++)
        zonaEn(
          { x: B.x, y: B.y + 10 },
          P.x + rnd(-70, 70),
          P.y + rnd(-50, 50),
          22,
          40 + i * 6,
          B.berserk ? '#b06bff' : '#ff8a2a',
          'fuegoSuelo',
          1,
        );
    return B.t > 90;
  },
  // Llama negra (solo al renacer): tres brazos de fuego negro que giran y dejan el suelo ardiendo.
  llamaNegra: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t % 3 == 0 && B.t < 100)
      for (let k = 0; k < 3; k++) {
        const a = B.t * 0.09 + (k * 6.283) / 3;
        G.bul.push({
          x: B.x,
          y: cy,
          vx: Math.cos(a) * 1.7 * f,
          vy: Math.sin(a) * 1.7 * f,
          c: '#b06bff',
          r: 4,
        });
      }
    if (B.t % 25 == 0) sueloEnLlamas(...enSala(B.x + rnd(-90, 90), B.y + rnd(-60, 60)), B);
    if (B.t % 15 == 0) sfx('fuego');
    return B.t > 110;
  },
});
[
  'aliento',
  'vuelo',
  'lluviaFuego',
  'aletazo',
  'muroFuego',
  'garra',
  'infierno',
  'llamaNegra',
  'espiralInfernal',
  'lanzallamas',
  'meteoros',
].forEach(id => ATAQUES[id] && (ATAQUES[id] = conLlamas(id, ATAQUES[id])));
JEFES.dragon.ataques[1].push('garra', 'muroFuego');
JEFES.dragon.ataques[2].push('garra', 'infierno', 'muroFuego');
JEFES.dragon.ataques[3].push('garra', 'infierno', 'muroFuego');
Object.assign(JEFES.dragonF, {
  color: '#8a2aff',
  grito: '¡ARDE EN FUEGO NEGRO!',
  ataques: {
    1: ['aliento', 'vuelo', 'llamaNegra', 'garra', 'infierno', 'meteoros'],
    2: ['aliento', 'llamaNegra', 'vuelo', 'infierno', 'muroFuego', 'espiralInfernal', 'garra'],
  },
  // Al renacer: columnas de llamas negras y moradas suben alrededor del dragón.
  alTransformar: (B, t) => {
    for (let i = 0; i < 3; i++)
      G.pt.push({
        x: B.x + rnd(-40, 40),
        y: B.y - rnd(0, 20),
        vx: rnd(-0.3, 0.3),
        vy: -rnd(1, 2.5),
        l: 30,
        m: 30,
        c: i % 3 ? '#8a2aff' : '#12051e',
        s: 3,
        g: 0,
      });
    if (t % 10 == 0) sueloEnLlamas(...enSala(B.x + rnd(-60, 60), B.y + rnd(-30, 30)), { berserk: 1 });
  },
});
// Aura del dragón: brasas a su alrededor, negras y moradas cuando renace.
function auraDragon(B) {
  if (B.id != 'dragon' || B.dead || G.t % 3) return;
  const C = fuegoDe(B);
  G.pt.push({
    x: B.x + rnd(-36, 36),
    y: B.y - B.z - rnd(10, 90),
    vx: 0,
    vy: -rnd(0.4, 1.2),
    l: 24,
    m: 24,
    c: C[Math.floor(Math.random() * 3)],
    s: 2,
    g: 0,
  });
}
