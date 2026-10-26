// Ataques de los enemigos comunes: cada tipo tiene dos o tres, y todos avisan antes de pegar
// (el enemigo brilla y tiembla, una línea marca hacia dónde tira o un círculo dónde va a caer).
const ATAQUES_ENEMIGO = {
  skelet: ['hueso', 'embestida'],
  imp: ['fuego', 'blink'],
  goblin: ['embestida', 'bomba'],
  tiny: ['mordisco'],
  chort: ['rafaga', 'tridente'],
  orcW: ['embestida', 'golpe'],
  masked: ['tridente', 'cruz'],
  shaman: ['anillo', 'tormentaChaman', 'curar'],
  zhielo: ['carambano', 'nova'],
  necro: ['invocar', 'espiral', 'anillo'],
  mimico: ['mordisco', 'monedas'],
  murcielago: ['picada', 'chillido'],
  baba: ['escupir', 'charco'],
  fantasma: ['desvanecer', 'lamento'],
  monje: ['palma', 'meditar'],
};
const balaEn = (m, a, v, c, o) =>
  G.bul.push(Object.assign({ x: m.x, y: m.y - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c, r: 3 }, o));
const anilloEn = (x, y, n, v, c, a0) => {
  for (let i = 0; i < n; i++) {
    const a = (a0 || 0) + (i * 6.283) / n;
    G.bul.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c, r: 3 });
  }
};
const dañoZona = (x, y, r) =>
  vivos().forEach(Q => Math.hypot(Q.x - x, Q.y - y) < r && conJugador(Q, hurtPlayer));

// aviso: pasos de preparación; linea: marca la dirección; circulo: radio del aviso en el suelo
// (enSi: alrededor del enemigo; si no, donde apunta); dura: pasos que dura después de lanzar.
const AT_EN = {
  hueso: { aviso: 26, c: '#e8e0d0', linea: 1, hacer: (m, a) => balaEn(m, a.ang, 2.3, '#e8e0d0', { big: 1 }) },
  embestida: {
    aviso: 24,
    c: '#ff5a3c',
    linea: 1,
    dura: 18,
    mover: (m, a) => [Math.cos(a.ang) * 3.4, Math.sin(a.ang) * 3.4],
  },
  mordisco: {
    aviso: 14,
    c: '#ff2a4a',
    linea: 1,
    dura: 10,
    mover: (m, a) => [Math.cos(a.ang) * 4.2, Math.sin(a.ang) * 4.2],
  },
  picada: {
    aviso: 16,
    c: '#c3b6d9',
    linea: 1,
    dura: 14,
    mover: (m, a) => [Math.cos(a.ang) * 4, Math.sin(a.ang) * 4],
  },
  fuego: { aviso: 22, c: '#ff8a2a', linea: 1, hacer: (m, a) => balaEn(m, a.ang, 2, '#ff8a2a', { r: 4 }) },
  carambano: {
    aviso: 22,
    c: '#9af0ff',
    linea: 1,
    hacer: (m, a) => balaEn(m, a.ang, 2.6, '#9af0ff', { r: 4 }),
  },
  tridente: {
    aviso: 24,
    c: '#ffe94a',
    linea: 1,
    hacer: (m, a) => [-0.16, 0, 0.16].forEach(d => balaEn(m, a.ang + d, 2.3, '#ffe94a')),
  },
  palma: {
    aviso: 22,
    c: '#d0b0ff',
    linea: 1,
    hacer: (m, a) => [-2, -1, 0, 1, 2].forEach(d => balaEn(m, a.ang + d * 0.18, 1.9, '#d0b0ff')),
  },
  escupir: {
    aviso: 20,
    c: '#7cff4a',
    linea: 1,
    hacer: (m, a) => [-0.25, 0, 0.25].forEach(d => balaEn(m, a.ang + d, 1.8, '#7cff4a', { charco: 40 })),
  },
  monedas: {
    aviso: 20,
    c: '#ffd24a',
    linea: 1,
    hacer: (m, a) => [...Array(8)].forEach((_, i) => balaEn(m, a.ang + (i - 3.5) * 0.12, 2, '#ffd24a')),
  },
  rafaga: {
    aviso: 20,
    c: '#ff5a3c',
    linea: 1,
    dura: 30,
    paso: (m, a, P) => a.t % 6 == 0 && balaEn(m, Math.atan2(P.y - 10 - m.y + 10, P.x - m.x), 2.4, '#ff5a3c'),
  },
  espiral: {
    aviso: 20,
    c: '#b06bff',
    dura: 40,
    paso: (m, a) => a.t % 4 == 0 && balaEn(m, a.t * 0.35, 1.5, '#b06bff'),
  },
  anillo: {
    aviso: 26,
    c: '#ff3fd2',
    circulo: 16,
    enSi: 1,
    hacer: m => anilloEn(m.x, m.y - 10, 10, 1.2, '#ff3fd2', rnd(0, 1)),
  },
  cruz: {
    aviso: 24,
    c: '#ffe94a',
    circulo: 18,
    enSi: 1,
    hacer: m => {
      const a0 = rnd(0, 1.57);
      for (let d = 0; d < 4; d++)
        for (let k = 0; k < 3; k++) balaEn(m, a0 + d * 1.571, 1.3 + k * 0.5, '#ffe94a');
    },
  },
  golpe: {
    aviso: 30,
    c: '#c8a070',
    circulo: 40,
    enSi: 1,
    hacer: m => {
      anilloEn(m.x, m.y - 4, 12, 1.6, '#e0b890', rnd(0, 1));
      dañoZona(m.x, m.y, 40);
      burst(m.x, m.y, 24, '#8a7a6a', 3, 26, 2, 0.12);
      decal(m.x, m.y + 2, 14, '#1a120a', 400);
      G.shake = Math.max(G.shake, 6);
      sfx('pisoton');
    },
  },
  nova: {
    aviso: 28,
    c: '#9af0ff',
    circulo: 34,
    enSi: 1,
    hacer: m => {
      anilloEn(m.x, m.y - 8, 14, 1, '#9af0ff', rnd(0, 1));
      dañoZona(m.x, m.y, 34);
      burst(m.x, m.y - 8, 22, '#e8fbff', 2.5);
      sfx('hielo');
    },
  },
  chillido: {
    aviso: 24,
    c: '#c3b6d9',
    circulo: 46,
    enSi: 1,
    hacer: m => {
      for (let i = 0; i < 16; i++) balaEn(m, (i * 6.283) / 16, 2.8, '#c3b6d9', { l: 30 });
      ring(m.x, m.y - 10, 46, '#c3b6d9', 12, 2);
    },
  },
  lamento: {
    aviso: 30,
    c: '#9af0ff',
    circulo: 30,
    enSi: 1,
    hacer: m => {
      anilloEn(m.x, m.y - 10, 12, 0.9, '#9af0ff', rnd(0, 1));
      sfx('sombra');
    },
  },
  bomba: {
    aviso: 20,
    c: '#ffe94a',
    circulo: 26,
    hacer: (m, a) => zonaEn(m, a.tx, a.ty, 26, 40, '#ffe94a', 'bomba'),
  },
  charco: {
    aviso: 20,
    c: '#7cff4a',
    circulo: 22,
    hacer: (m, a) => zonaEn(m, a.tx, a.ty, 22, 34, '#7cff4a', 'charco'),
  },
  tormentaChaman: {
    aviso: 18,
    c: '#5ee7ff',
    hacer: (m, a, P) => {
      for (let i = 0; i < 3; i++)
        zonaEn(m, P.x + rnd(-40, 40), P.y + rnd(-30, 30), 18, 45 + i * 8, '#5ee7ff', 'rayo', 1);
    },
  },
  blink: {
    aviso: 18,
    c: '#9a3aff',
    hacer: (m, a, P) => {
      burst(m.x, m.y - 6, 18, '#9a3aff', 2.5);
      for (let k = 0; k < 10; k++) {
        const b = rnd(0, 6.283),
          nx = P.x + Math.cos(b) * rnd(60, 90),
          ny = P.y + Math.sin(b) * rnd(40, 70);
        if (!solidoEnemigo(nx, ny, 4)) {
          [m.x, m.y] = [nx, ny];
          break;
        }
      }
      burst(m.x, m.y - 6, 18, '#c08aff', 2.5);
      sfx('sombra');
    },
  },
  desvanecer: {
    aviso: 24,
    c: '#c3b6d9',
    hacer: (m, a, P) => {
      m.oculto = 70;
      const b = rnd(0, 6.283),
        nx = P.x + Math.cos(b) * 50,
        ny = P.y + Math.sin(b) * 36;
      if (!solidoEnemigo(nx, ny, 4)) [m.x, m.y] = [nx, ny];
      sfx('sombra');
    },
  },
  invocar: {
    aviso: 34,
    c: '#9a3aff',
    circulo: 24,
    enSi: 1,
    hacer: m => {
      if (G.enem.length + G.spawns.length > 12) return;
      for (let i = 0; i < 2; i++) spawnEnemigo('skelet', ...enSala(m.x + rnd(-30, 30), m.y + rnd(-20, 20)));
    },
  },
  curar: {
    aviso: 30,
    c: '#7cff4a',
    circulo: 70,
    enSi: 1,
    hacer: m => {
      G.enem.forEach(n2 => {
        if (Math.hypot(n2.x - m.x, n2.y - m.y) > 70) return;
        n2.hp = Math.min(n2.max, n2.hp + Math.round(n2.max * 0.25));
        ring(n2.x, n2.y - 8, 10, '#7cff4a', 10);
        burst(n2.x, n2.y - 8, 6, '#7cff4a', 1.5);
      });
    },
  },
  meditar: {
    aviso: 20,
    c: '#ffd24a',
    hacer: m => ((m.escudoEn = 120), ring(m.x, m.y - 8, 16, '#ffd24a', 12, 2)),
  },
};

// Cuando le toca atacar: elige uno de sus ataques y empieza a avisar.
function empezarAtaqueEnemigo(m, P) {
  const L = ATAQUES_ENEMIGO[m.k];
  if (!L) return false;
  const id = L[Math.floor(Math.random() * L.length)];
  m.at = { id, t: 0, tx: P.x, ty: P.y - 6, ang: Math.atan2(P.y - m.y, P.x - m.x) };
  return true;
}
// Un paso del ataque: mira al blanco mientras avisa, lanza y, si es una carrera, se mueve. Devuelve [vx, vy].
function pasoAtaqueEnemigo(m, P) {
  const a = m.at,
    A = AT_EN[a.id];
  a.t++;
  if (a.t < A.aviso * 0.7) {
    a.tx = P.x;
    a.ty = P.y - 6;
    a.ang = Math.atan2(P.y - m.y, P.x - m.x);
  }
  if (a.t == A.aviso) {
    if (A.hacer) A.hacer(m, a, P);
    m.squash = 8;
  }
  let v = [0, 0];
  if (a.t > A.aviso) {
    if (A.paso) A.paso(m, a, P);
    if (A.mover) {
      v = A.mover(m, a);
      if (G.t % 2 == 0) burst(m.x, m.y, 2, '#8a7a6a', 1, 12);
    }
  }
  if (a.t >= A.aviso + (A.dura || 0)) {
    m.at = null;
    m.cd = rnd(70, 120) * (m.cdMul || 1);
  }
  return v;
}

// Zonas marcadas en el suelo (bombas, charcos, rayos del chamán): avisan y luego estallan.
function zonaEn(m, x, y, r, t, c, tipo, sinArco) {
  [x, y] = enSala(x, y);
  G.zonasEn.push({ x, y, r, t, m: t, c, tipo, x0: m.x, y0: m.y - 10, arco: !sinArco });
  if (!sinArco) sfx('lanzar');
}
function pasoZonasEn() {
  G.zonasEn.forEach(z => {
    if (--z.t > 0) return;
    z.d = 1;
    if (z.tipo == 'bomba') {
      anilloEn(z.x, z.y - 4, 8, 1.5, '#ffe94a', rnd(0, 1));
      burst(z.x, z.y, 26, '#ff8a2a', 3.5, 24, 2, 0.05);
      ring(z.x, z.y, z.r, '#ffe94a', 12, 3);
      decal(z.x, z.y + 2, 10, '#140806', 400);
      dañoZona(z.x, z.y, z.r);
      sfx('explosion');
    } else if (z.tipo == 'charco') {
      G.gases.push({ x: z.x, y: z.y, r: 4, max: z.r, l: 200 });
      burst(z.x, z.y, 14, '#7cff4a', 2);
      sfx('veneno');
    } else if (z.tipo == 'columna') {
      anilloEn(z.x, z.y - 4, 8, 1.4, z.c, rnd(0, 1));
      for (let i = 0; i < 14; i++)
        G.pt.push({
          x: z.x + rnd(-5, 5),
          y: z.y,
          vx: 0,
          vy: -rnd(2, 4),
          l: 22,
          m: 22,
          c: i % 3 ? z.c : '#ffffff',
          s: 2,
          g: 0,
        });
      ring(z.x, z.y, z.r, z.c, 10, 2);
      dañoZona(z.x, z.y, z.r);
      sfx('hit');
    } else if (z.tipo == 'fuegoSuelo') {
      const negra = z.c == '#b06bff';
      anilloEn(z.x, z.y - 4, 8, 1.4, z.c, rnd(0, 1));
      G.bul.slice(-8).forEach(b => (b.llama = negra ? 2 : 1));
      for (let i = 0; i < 16; i++)
        G.pt.push({
          x: z.x + rnd(-6, 6),
          y: z.y,
          vx: rnd(-0.4, 0.4),
          vy: -rnd(1.5, 3.5),
          l: 26,
          m: 26,
          c: i % 3 ? z.c : negra ? '#12051e' : '#ffe94a',
          s: 3,
          g: 0,
        });
      sueloEnLlamas(z.x, z.y, { berserk: negra });
      dañoZona(z.x, z.y, z.r);
      G.shake = Math.max(G.shake, 4);
      sfx('fuego');
    } else {
      if (z.tipo == 'rayoNegro') truenoNegro(z.x, z.y);
      else {
        G.bolts.push(Object.assign(rayoPts(z.x + rnd(-8, 8), z.y - 200, z.x, z.y), { l: 10 }));
        anilloEn(z.x, z.y - 4, 6, 1.3, '#5ee7ff', rnd(0, 1));
        sfx('rayo');
      }
      dañoZona(z.x, z.y, z.r);
    }
  });
  G.zonasEn = G.zonasEn.filter(z => !z.d);
}
function drawZonasEn() {
  G.zonasEn.forEach(z => {
    const k = 1 - z.t / z.m;
    w.globalAlpha = 0.18 + 0.2 * k;
    w.fillStyle = z.c;
    w.beginPath();
    w.ellipse(z.x, z.y, z.r * k, z.r * 0.45 * k, 0, 0, 7);
    w.fill();
    w.globalAlpha = 0.9;
    w.strokeStyle = G.t % 8 < 4 ? z.c : '#ffffff';
    w.lineWidth = 1;
    w.beginPath();
    w.ellipse(z.x, z.y, z.r, z.r * 0.45, 0, 0, 7);
    w.stroke();
    if (z.arco && k < 1) {
      const px = z.x0 + (z.x - z.x0) * k,
        py = z.y0 + (z.y - z.y0) * k - Math.sin(Math.PI * k) * 40;
      w.fillStyle = z.c;
      w.beginPath();
      w.arc(px, py, 3, 0, 7);
      w.fill();
    }
  });
  w.globalAlpha = 1;
}
// Aviso del ataque en el dibujo del enemigo: brillo de su color, línea de mira o círculo en el suelo.
function drawAvisoEnemigo(m) {
  if (m.escudoEn > 0) {
    m.escudoEn--;
    w.strokeStyle = '#ffd24a';
    w.globalAlpha = 0.6;
    w.beginPath();
    w.ellipse(m.x, m.y - 8, 10, 13, 0, 0, 7);
    w.stroke();
    w.globalAlpha = 1;
  }
  const a = m.at;
  if (!a) return;
  const A = AT_EN[a.id],
    k = Math.min(1, a.t / A.aviso);
  if (k >= 1) return;
  w.globalAlpha = 0.25 + 0.3 * k;
  w.fillStyle = A.c;
  w.beginPath();
  w.ellipse(m.x, m.y, 8 + 6 * k, 3 + 2 * k, 0, 0, 7);
  w.fill();
  if (A.linea) {
    w.strokeStyle = A.c;
    w.globalAlpha = 0.5 * k + 0.2;
    w.setLineDash([3, 3]);
    w.beginPath();
    w.moveTo(m.x, m.y - 8);
    w.lineTo(m.x + Math.cos(a.ang) * 90, m.y - 8 + Math.sin(a.ang) * 90);
    w.stroke();
    w.setLineDash([]);
  }
  if (A.circulo) {
    const cx = A.enSi ? m.x : a.tx,
      cy = A.enSi ? m.y : a.ty;
    w.globalAlpha = 0.15 + 0.25 * k;
    w.beginPath();
    w.ellipse(cx, cy, A.circulo * k, A.circulo * 0.45 * k, 0, 0, 7);
    w.fill();
    w.globalAlpha = 0.8;
    w.strokeStyle = A.c;
    w.beginPath();
    w.ellipse(cx, cy, A.circulo, A.circulo * 0.45, 0, 0, 7);
    w.stroke();
  }
  w.globalAlpha = 1;
  w.fillStyle = G.t % 6 < 3 ? '#ffffff' : A.c;
  w.fillRect(Math.round(m.x - 1), Math.round(m.y - m.h - 9), 2, 4);
  w.fillRect(Math.round(m.x - 1), Math.round(m.y - m.h - 4), 2, 1);
}
