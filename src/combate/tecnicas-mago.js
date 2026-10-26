// Técnicas de la Biblioteca del mago: se compran con cenizas y se equipan en el Armario (nucleo/armario.js).
// Luz, vacío, meteoros, cadenas sagradas y eclipse: más caras y más rotas que las de base.
const distSegmento = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1,
    dy = y2 - y1,
    k = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (x1 + dx * k), py - (y1 + dy * k));
};

Object.assign(TEC, {
  // Un rayo de luz recto que atraviesa a todos hasta la pared.
  luz: {
    n: 'Luz',
    cd: 24,
    c: '#fff1b0',
    desc: 'Lanza de luz: un haz recto que atraviesa a todos los enemigos.',
    mej: ['Juicio de luz', 'El haz es más ancho y pega más.'],
    usar(P, a, x, y) {
      const lv = lvl('luz'),
        ancho = 10 + 5 * lv;
      let ex = x,
        ey = y;
      for (let k = 0; k < 60 && !solidAt(ex + Math.cos(a) * 4, ey + Math.sin(a) * 4, 0); k++) {
        ex += Math.cos(a) * 4;
        ey += Math.sin(a) * 4;
      }
      objetivos().forEach(t => {
        if (distSegmento(t.x, t.y, x, y, ex, ey) < ancho + t.r) dañar(t, Math.round(30 * (1 + 0.35 * lv)), 2);
      });
      for (let d = 0; d < Math.hypot(ex - x, ey - y); d += 5)
        G.pt.push({
          x: x + Math.cos(a) * d + rnd(-2, 2),
          y: y + Math.sin(a) * d + rnd(-2, 2),
          vx: rnd(-0.3, 0.3),
          vy: rnd(-0.3, 0.3),
          l: 14,
          m: 14,
          c: d % 10 < 5 ? '#ffffff' : '#fff1b0',
          s: 2 + lv,
          g: 0,
        });
      ring(ex, ey, 16, '#fff1b0', 10, 2);
      G.flash = Math.max(G.flash, 2);
      G.fcol = '#fff1b0';
      sfx('reflejo');
    },
  },
  // Un orbe negro lento que atrae a los enemigos, los muerde y al final implota.
  vacio: {
    n: 'Vacío',
    cd: 50,
    c: '#b06bff',
    desc: 'Orbe del vacío: atrae a los enemigos y al final implota.',
    mej: ['Vacío hambriento', 'Atrae desde más lejos y la implosión pega más.'],
    usar(P, a, x, y) {
      disparo('vacio', x, y, a, 1.7, { r: 8, l: 110, dmg: 7, pierce: 99, fuerza: 1 + 0.4 * lvl('vacio') });
      sfx('sombra');
    },
  },
  // Cinco meteoros caen alrededor de donde apuntas.
  meteoro: {
    n: 'Meteoro',
    cd: 64,
    c: '#ff8a2a',
    desc: 'Lluvia de meteoros: cinco rocas de fuego caen donde apuntas.',
    mej: ['Cielo en llamas', 'Caen más meteoros y queman más.'],
    usar(P) {
      const n = 5 + 2 * lvl('meteoro'),
        [cx, cy] = enSala(P.ax, P.ay);
      for (let i = 0; i < n; i++) {
        const b = rnd(0, 6.283),
          d = i ? rnd(10, 42) : 0;
        disparo('meteoro', -900, -900, 0, 0, {
          tx: cx + Math.cos(b) * d,
          ty: cy + Math.sin(b) * d * 0.7,
          l: 26 + i * 6,
          m: 26 + i * 6,
          dmg: Math.round(30 * (1 + 0.3 * lvl('meteoro'))),
        });
      }
      sfx('lanzar');
    },
  },
  // Cadenas de luz atan a los enemigos más cercanos: quedan casi quietos.
  cadenas: {
    n: 'Cadenas',
    cd: 52,
    c: '#ffe94a',
    desc: 'Cadenas sagradas: atan a los enemigos cercanos y casi no se mueven.',
    mej: ['Cadenas eternas', 'Atan a más enemigos y duran más.'],
    usar(P, a, x, y) {
      const lv = lvl('cadenas');
      objetivos()
        .filter(t => Math.hypot(t.x - P.x, t.y - P.y) < 170)
        .sort((p, q) => Math.hypot(p.x - P.x, p.y - P.y) - Math.hypot(q.x - P.x, q.y - P.y))
        .slice(0, 4 + 2 * lv)
        .forEach(t => {
          t.ref.frio = t.boss ? 70 : 160 + 60 * lv;
          dañar(t, Math.round(18 * (1 + 0.3 * lv)), 1);
          G.bolts.push(Object.assign(rayoPts(x, y, t.x, t.y), { l: 14 }));
          ring(t.x, t.y, 14, '#ffe94a', 12, 2);
        });
      sfx('escudo');
    },
  },
  // Eclipse: tres anillos de oscuridad salen de ti, y la oscuridad te devuelve medio corazón.
  eclipse: {
    n: 'Eclipse',
    cd: 100,
    c: '#6a4cff',
    desc: 'Eclipse: tres anillos de oscuridad y recuperas medio corazón.',
    mej: ['Eclipse total', 'Los anillos llegan más lejos y pegan más.'],
    usar(P) {
      const lv = lvl('eclipse');
      [6, -40, -86].forEach(r =>
        G.ondas.push({
          own: P,
          x: P.x,
          y: P.y,
          r,
          max: 95 + 25 * lv,
          dmg: Math.round(22 * (1 + 0.3 * lv)),
          hits: [],
          c: '#6a4cff',
        }),
      );
      G.dark = Math.max(G.dark, 0.45);
      if (P.hp < P.max) P.hp++;
      P.inv = Math.max(P.inv, 30);
      G.shake = Math.max(G.shake, 8);
      sfx('ultCarga');
    },
  },
});

SHOT_T.vacio = {
  fantasma: 1,
  mover: s => {
    s.x += s.vx;
    s.y += s.vy;
    s.vx *= 0.985;
    s.vy *= 0.985;
    G.enem.forEach(m => {
      const d = Math.hypot(s.x - m.x, s.y - m.y);
      if (d > 4 && d < 70 * s.fuerza) {
        const nx = m.x + ((s.x - m.x) / d) * 0.9,
          ny = m.y + ((s.y - m.y) / d) * 0.9;
        if (!solidAt(nx, ny, 4)) [m.x, m.y] = [nx, ny];
      }
    });
    if (s.l % 12 == 0)
      objetivos().forEach(
        t => Math.hypot(t.x - s.x, t.y - s.y) < 26 + t.r && dañar(t, s.dmg * (s.forja || 1), 0, true),
      );
  },
  trail: s =>
    G.pt.push({
      x: s.x + rnd(-10, 10),
      y: s.y + rnd(-10, 10),
      vx: 0,
      vy: 0,
      l: 12,
      m: 12,
      c: '#b06bff',
      s: 1,
      g: 0,
    }),
  fin: s => {
    ring(s.x, s.y, 56, '#b06bff', 16, 4);
    burst(s.x, s.y, 50, '#2a0a4a', 3, 30, 2);
    objetivos().forEach(
      t =>
        Math.hypot(t.x - s.x, t.y - s.y) < 56 + t.r &&
        dañar(t, Math.round(36 * s.fuerza * (s.forja || 1)), 4, true),
    );
    G.shake = Math.max(G.shake, 8);
    sfx('explosion');
  },
  draw: s => {
    w.fillStyle = '#0b0812';
    w.beginPath();
    w.arc(s.x, s.y, s.r, 0, 7);
    w.fill();
    w.strokeStyle = '#b06bff';
    w.lineWidth = 2;
    w.beginPath();
    w.arc(s.x, s.y, s.r + 3 + Math.sin(G.t * 0.3) * 2, G.t * 0.2, G.t * 0.2 + 4.5);
    w.stroke();
  },
};
SHOT_T.meteoro = {
  fantasma: 1,
  mover: () => {},
  fin: s => {
    ring(s.tx, s.ty, 28, '#ff8a2a', 14, 3);
    burst(s.tx, s.ty, 30, '#ff8a2a', 3.5, 26, 2, 0.05);
    decal(s.tx, s.ty + 2, 12, '#140806', 500);
    objetivos().forEach(
      t =>
        Math.hypot(t.x - s.tx, t.y - s.ty) < 28 + t.r &&
        dañar(t, Math.round(s.dmg * (s.forja || 1)), 3, true),
    );
    G.shake = Math.max(G.shake, 5);
    sfx('explosion');
  },
  draw: s => {
    const k = s.l / s.m;
    w.globalAlpha = 0.35 * (1 - k) + 0.1;
    w.fillStyle = '#ff3a2a';
    w.beginPath();
    w.ellipse(s.tx, s.ty, 14 * (1 - k) + 4, 5 * (1 - k) + 2, 0, 0, 7);
    w.fill();
    w.globalAlpha = 1;
    const mx = s.tx + k * 50,
      my = s.ty - k * 160;
    w.fillStyle = '#ffe94a';
    w.beginPath();
    w.arc(mx, my, 5, 0, 7);
    w.fill();
    w.fillStyle = '#ff8a2a';
    for (let i = 1; i < 5; i++) w.fillRect(mx + i * 4 - 2, my - i * 12 - 2, 5 - i, 5 - i);
  },
};

// Iconos de 12 x 12 para las técnicas nuevas.
Object.assign(MAPAS, {
  luz: [
    '.....W......',
    '.....W......',
    '....WYW.....',
    '....WYW.....',
    '...WYYYW....',
    'WWWYYWYYWWW.',
    '...WYYYW....',
    '....WYW.....',
    '....WYW.....',
    '.....W......',
    '.....W......',
    '............',
  ],
  vacio: [
    '............',
    '....PPPP....',
    '...PKKKKP...',
    '..PKKDDKKP..',
    '.PKKDDDDKKP.',
    '.PKDDDDDDKP.',
    '.PKDDDDDDKP.',
    '.PKKDDDDKKP.',
    '..PKKDDKKP..',
    '...PKKKKP...',
    '....PPPP....',
    '............',
  ],
  meteoro: [
    '..........Y.',
    '.........YO.',
    '........YO..',
    '.......YO...',
    '...OOOYO....',
    '..OYYYOO....',
    '.OYYWYYO....',
    '.OYWWYYO....',
    '.OYYYYRO....',
    '..ORRRO.....',
    '...OOO......',
    '............',
  ],
  cadenas: [
    'YY..........',
    'Y.Y.........',
    '.YY.YY......',
    '....Y.Y.....',
    '....YY.YY...',
    '.......Y.Y..',
    '.......YY.YY',
    '..........Y.',
    '.....W....YY',
    '....WWW.....',
    '.....W......',
    '............',
  ],
  eclipse: [
    '....KKKK....',
    '..KKPPPPKK..',
    '.KPP....PPK.',
    '.KP.YYYY.PK.',
    'KP.YDDDDY.PK',
    'KP.YDDDDY.PK',
    'KP.YDDDDY.PK',
    'KP.YDDDDY.PK',
    '.KP.YYYY.PK.',
    '.KPP....PPK.',
    '..KKPPPPKK..',
    '....KKKK....',
  ],
});
