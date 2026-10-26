// Iconos en pixel art para técnicas, golpes finales y mejoras: mapas de 12x12 o dibujos del atlas.
const PAL = {
  W: '#ffffff',
  C: '#5ee7ff',
  B: '#2a8aff',
  Y: '#ffe94a',
  O: '#ff8a2a',
  R: '#ff2a4a',
  D: '#2a0010',
  G: '#c08a2a',
  V: '#7cff4a',
  P: '#6a4cff',
  K: '#2a1650',
  N: '#8a5a3a',
  S: '#c3c8d8',
};
const MAPAS = {
  hielo: [
    '.....W......',
    '....WCC.....',
    '...WCCCB....',
    '..WCCCCCB...',
    '.WCCCWCCCB..',
    'WCCCWWWCCCB.',
    '.BCCCWCCCB..',
    '..BCCCCCB...',
    '...BCCCB....',
    '....BCB.....',
    '.....B......',
    '............',
  ],
  fuego: [
    '.....Y......',
    '....YY......',
    '....YOY.....',
    '...YOOY..Y..',
    '..YOOOOY.YY.',
    '..OORROOYOY.',
    '.OORRYRROOO.',
    '.ORRYYYRROO.',
    '.ORYYWYYRRO.',
    '.ORYYWWYYRO.',
    '..ORYYYYRO..',
    '...OOOOOO...',
  ],
  rayo: [
    '......YYY...',
    '.....YWY....',
    '....YWY.....',
    '...YWWY.....',
    '..YWWWWWY...',
    '.....YWY....',
    '....YWY.....',
    '...YWY......',
    '..YWY.......',
    '..YY........',
    '.Y..........',
    '............',
  ],
  escudo: [
    '..GGGGGGGG..',
    '.GYYYYYYYYG.',
    '.GYWWYYYYYG.',
    '.GYWYYRRYYG.',
    '.GYYYRRRRYG.',
    '.GYYYYRRYYG.',
    '..GYYYYYYG..',
    '..GYYYYYYG..',
    '...GYYYYG...',
    '....GYYG....',
    '.....GG.....',
    '............',
  ],
  pisoton: [
    '............',
    '....NNNN....',
    '..NN....NN..',
    '.N..OOOO..N.',
    'N..O....O..N',
    'N.O..NN..O.N',
    'N.O..NN..O.N',
    'N..O....O..N',
    '.N..OOOO..N.',
    '..NN....NN..',
    '....NNNN....',
    '............',
  ],
  sombra: [
    '....PPPP....',
    '..PPPPPPPP..',
    '.PPKKKKKKPP.',
    '.PKKKKKKKKP.',
    'PPKYYKKYYKPP',
    'PKKYYKKYYKKP',
    'PKKKKKKKKKKP',
    '.PKKKKKKKKP.',
    '.PPKKPPKKPP.',
    '..PP.PP.PP..',
    '..P..P..P...',
    '............',
  ],
  pies: [
    '............',
    '.......WW...',
    '.....WWW....',
    '..NNWWW.....',
    '..NNNN......',
    '..NNNN......',
    '..NNNN......',
    '..NNNNN.....',
    '..NNNNNNNN..',
    '.NNNNNNNNNN.',
    '.KKKKKKKKKK.',
    '............',
  ],
  abismo: [
    '.....D......',
    '.....D......',
    '.....D......',
    '.....D......',
    '.....D......',
    '....RRR.....',
    '....RWR.....',
    '....RWR.....',
    '....RWR.....',
    '.....R......',
    '..R.....R...',
    '.RRR...RRR..',
  ],
  celestial: [
    'W..........W',
    '.Y........Y.',
    '..Y......Y..',
    '...Y....Y...',
    '....Y..Y....',
    '.....WW.....',
    '.....WW.....',
    '....Y..Y....',
    '...Y....Y...',
    '..Y......Y..',
    '.Y........Y.',
    'W..........W',
  ],
  lluvia: [
    '.V...V...V..',
    '.V...V...V..',
    '.V...V...V..',
    '.V...V...V..',
    '.V...V...V..',
    'VVV.VVV.VVV.',
    '.W...W...W..',
    '............',
    '..V...V...V.',
    '..V...V...V.',
    '.VVV.VVV.VVV',
    '..W...W...W.',
  ],
  terremoto: [
    '............',
    '.....D......',
    '....DD......',
    '....D.......',
    '...DDD......',
    '.....DD.....',
    '......D.....',
    '.....DDD....',
    '....D...D...',
    '...D.....D..',
    'NNNNNNNNNNNN',
    'NONNONNONNON',
  ],
  torbellino: [
    '....WSSW....',
    '..S......S..',
    '.S...SS...W.',
    'W...S..S...S',
    'S..S....S..S',
    'S..S..W.S..S',
    'S...S..S...S',
    'W....SS....W',
    '.S........S.',
    '..S......S..',
    '....WSSW....',
    '............',
  ],
};
// Dibujos del atlas: r = recorte; rot = giro; extra = adorno encima.
const ICO_SPR = {
  corazon: { r: [289, 370, 13, 12] },
  cura: { r: [288, 336, 16, 16] },
  veneno: { r: [320, 352, 16, 16] },
  flecha: { r: [324, 202, 7, 21], rot: 0.785 },
  tajo: { r: [323, 10, 10, 21], rot: 0.6, extra: 'arco' },
  estocada: { r: [339, 98, 10, 29], rot: 1.571, extra: 'lineas' },
  martillazo: { r: [307, 39, 10, 24], rot: -0.5, extra: 'golpe' },
  hacha: { r: [340, 161, 10, 14], rot: 0.3, extra: 'giro' },
  dagas: { r: [293, 10, 6, 13], rot: 0.785, extra: 'doble' },
  abanico: { r: [324, 202, 7, 21], extra: 'tres' },
  espinas: { r: [324, 202, 7, 21], rot: 0.785, extra: 'puas' },
};
function icono(x, id, cx, cy, s) {
  const M = MAPAS[id];
  if (M) {
    const o0 = 6 * s;
    M.forEach((row, j) =>
      [...row].forEach((ch, i) => {
        if (PAL[ch]) {
          x.fillStyle = PAL[ch];
          x.fillRect(Math.round(cx - o0 + i * s), Math.round(cy - o0 + j * s), s, s);
        }
      }),
    );
    return;
  }
  const I = ICO_SPR[id];
  if (!I) return;
  const [sx, sy, sw, sh] = I.r,
    k = Math.max(1, Math.floor(((12 * s) / Math.max(sw, sh)) * 0.95)),
    dib = (dx, dy, rot) => {
      x.save();
      x.translate(Math.round(cx + dx), Math.round(cy + dy));
      x.rotate(rot || 0);
      x.drawImage(atlas, sx, sy, sw, sh, (-sw * k) / 2, (-sh * k) / 2, sw * k, sh * k);
      x.restore();
    };
  if (I.extra == 'tres') {
    const k2 = Math.max(1, Math.floor(k * 0.8));
    [-0.5, 0, 0.5].forEach(r => {
      x.save();
      x.translate(cx, cy + 4 * s);
      x.rotate(r);
      x.drawImage(atlas, sx, sy, sw, sh, (-sw * k2) / 2, -sh * k2, sw * k2, sh * k2);
      x.restore();
    });
    return;
  }
  if (I.extra == 'doble') dib(-2 * s, 1 * s, I.rot);
  dib(0, 0, I.rot);
  if (I.extra == 'doble') dib(2 * s, -1 * s, I.rot);
  x.fillStyle = '#ffffff';
  if (I.extra == 'lineas')
    for (let i = 0; i < 3; i++)
      x.fillRect(Math.round(cx - 6 * s), Math.round(cy + (i - 1) * 3 * s), 3 * s, Math.max(1, s / 2));
  if (I.extra == 'arco') {
    x.strokeStyle = '#fff1b0';
    x.lineWidth = Math.max(1, s * 0.7);
    x.beginPath();
    x.arc(cx - 2 * s, cy + 2 * s, 5 * s, -1.6, 0.2);
    x.stroke();
  }
  if (I.extra == 'golpe') {
    x.fillStyle = '#ffb04a';
    [
      [-5, 4],
      [-3, 6],
      [5, 5],
    ].forEach(([a, b]) => x.fillRect(Math.round(cx + a * s), Math.round(cy + b * s), s, s));
  }
  if (I.extra == 'giro') {
    x.strokeStyle = '#c3c8d8';
    x.lineWidth = Math.max(1, s * 0.5);
    x.beginPath();
    x.arc(cx, cy, 6 * s, 0.4, 2.2);
    x.stroke();
  }
  if (I.extra == 'puas') {
    x.fillStyle = '#7cff4a';
    [
      [4, -4],
      [5, -1],
      [2, -5],
      [6, -6],
    ].forEach(([a, b]) => x.fillRect(Math.round(cx + a * s), Math.round(cy + b * s), s, s));
  }
}
