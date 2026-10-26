// Estilo de las pantallas: marcos de pixel con remaches para paneles y botones (se dibujan una vez y van
// a CSS como imágenes de borde), iconos de la botonera del inicio y un sonido corto al tocar.
function lienzoMarco(fondo, borde, luz, sombra, remache) {
  const [c, x] = mk(18, 18);
  x.fillStyle = borde;
  x.fillRect(0, 0, 18, 18);
  x.fillStyle = fondo;
  x.fillRect(2, 2, 14, 14);
  x.fillStyle = luz;
  x.fillRect(2, 2, 14, 1);
  x.fillRect(2, 2, 1, 14);
  x.fillStyle = sombra;
  x.fillRect(2, 15, 14, 1);
  x.fillRect(15, 2, 1, 14);
  if (remache) {
    x.fillStyle = remache;
    [
      [1, 1],
      [15, 1],
      [1, 15],
      [15, 15],
    ].forEach(([a, b]) => x.fillRect(a, b, 2, 2));
  }
  return c;
}
const marcoPixel = (...a) => 'url(' + lienzoMarco(...a).toDataURL() + ')';
const raizCss = document.documentElement.style;
raizCss.setProperty('--marco-panel', marcoPixel('#120c1c', '#2a1e3a', '#3a2a4e', '#08050e', '#a07010'));
raizCss.setProperty('--marco-sec', marcoPixel('#1d1528', '#4e4070', '#6a5a8a', '#120c1c', null));
raizCss.setProperty('--marco-sel', marcoPixel('#2a1e10', '#ffd24a', '#ffe9a0', '#a07010', '#ffffff'));
raizCss.setProperty('--marco-play', marcoPixel('#ff5a3c', '#7a1f10', '#ffb08a', '#b0301a', '#ffd24a'));
raizCss.setProperty('--marco-tile', marcoPixel('#160f22', '#3a2a4e', '#4e4070', '#0b0812', '#6a4cff'));

// Iconos de 12 x 12 para la botonera del inicio.
Object.assign(MAPAS, {
  uiFicha: [
    '....SSSS....',
    '...SWWWWS...',
    '...SWWWWS...',
    '...SWWWWS...',
    '....SSSS....',
    '..PPPPPPPP..',
    '.PPPYPPYPPP.',
    '.PPPPYYPPPP.',
    '.PPPPPPPPPP.',
    '.PPPPPPPPPP.',
    '.PP......PP.',
    '............',
  ],
  uiForja: [
    '...SSSSSS...',
    '..SWWWWWWS..',
    '..SSSSSSSS..',
    '.....NN.....',
    '.....NN.....',
    '.....NN.....',
    '..OOOOOOOO..',
    '.OOOOOOOOOO.',
    '.OYYOOOOOOO.',
    '..OOOOOOOO..',
    '....SSSS....',
    '...SSSSSS...',
  ],
  uiArmario: [
    '....SSSS....',
    '...S....S...',
    '..........S.',
    '.........S..',
    '..SSSSSSS...',
    '.SPPPPPPPS..',
    'SPPPPPPPPPS.',
    'SPPPYYPPPPS.',
    '.SPPPPPPPS..',
    '..SPPPPPS...',
    '...SSSSS....',
    '............',
  ],
  uiLogros: [
    '.YYYYYYYYYY.',
    'YY.YYYYYY.YY',
    'Y..YYWYYY..Y',
    'YY.YYYYYY.YY',
    '.Y.YYYYYY.Y.',
    '...YYYYYY...',
    '....YYYY....',
    '.....YY.....',
    '.....YY.....',
    '...GGGGGG...',
    '..GGGGGGGG..',
    '............',
  ],
  uiRecords: [
    '.....YY.....',
    '....YWWY....',
    '.....YY.....',
    '....SSSS....',
    '....SSSS....',
    'GGG.SSSS....',
    'GGG.SSSS.OOO',
    'GGG.SSSS.OOO',
    'GGG.SSSS.OOO',
    'GGGGSSSSOOOO',
    'GGGGSSSSOOOO',
    '............',
  ],
  uiAyuda: [
    '...CCCCCC...',
    '..CC....CC..',
    '.CC..WW..CC.',
    '.C..W..W..C.',
    '.C.....W..C.',
    '.C....W...C.',
    '.C...W....C.',
    '.C...W....C.',
    '.CC......CC.',
    '..CC.W..CC..',
    '...CCCCCC...',
    '............',
  ],
  uiOpciones: [
    '.....SS.....',
    '..S.SSSS.S..',
    '.SSSSSSSSSS.',
    '..SSS..SSS..',
    '.SSS....SSS.',
    'SSS......SSS',
    'SSS......SSS',
    '.SSS....SSS.',
    '..SSS..SSS..',
    '.SSSSSSSSSS.',
    '..S.SSSS.S..',
    '.....SS.....',
  ],
  uiGrimorio: [
    '.KKKKKKKKK..',
    'KPPPPPPPPPK.',
    'KPYPPPPPPYK.',
    'KPPPPVVPPPK.',
    'KPPPVVVVPPK.',
    'KPPPVVVVPPK.',
    'KPPPPVVPPPK.',
    'KPPPPPVPPPK.',
    'KPYPPPPPPYK.',
    'KPPPPPPPPPK.',
    '.KKKKKKKKK..',
    '............',
  ],
});
document.querySelectorAll('canvas[data-ico]').forEach(c => {
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  icono(x, c.dataset.ico, c.width / 2, c.height / 2, Math.floor(c.width / 12));
});

// Un «tic» corto al tocar cualquier botón fuera de la partida.
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('button');
  if (!b || (running && !pausado) || b.closest('#tbtns')) return;
  initAudio();
  sfx(b.classList.contains('play') ? 'arma' : 'pick');
});
