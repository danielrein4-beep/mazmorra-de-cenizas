// Los demonios del Abismo (modo Pacto de Demonios): llegan después del Dragón y son lo más duro del juego.
// Cuerpo negro con contorno morado y un aura oscura; pelean con rayos negros, sombras y fuego negro.
// Silfred, el Susurro Negro: espectro que corta con su guadaña y llama tormentas negras.
// Zagred, el Carnicero del Abismo: bestia que parte el suelo con su hacha.
// Kiplot, Rey de los Demonios: un dragón negro con todo el poder del abismo.
const CUERPO_DEMONIO = '#0b0612';

Object.assign(ATAQUES, {
  // Rayo del abismo: un láser negro y morado que la persigue.
  abismoNegro: (B, cx, cy, f) => {
    B.moving = false;
    return laserJefe(B, B.t, cx, cy, {
      c: '#8a2aff',
      aviso: 28,
      dura: 70,
      ancho: 14,
      sigue: B.berserk ? 0.032 : 0.024,
    });
  },
  // Garras de sombra: tres zarpazos enormes donde está la heroína; el suelo avisa antes de cada uno.
  garrasSombra: (B, cx, cy, f) => {
    B.moving = false;
    const P = G.P,
      t = B.t % 24;
    if (B.t > 72) return (B.tele = null), true;
    if (t == 1) B.garra = { x: P.x, y: P.y - 8 };
    if (t < 16) B.tele = { x: B.garra.x, y: B.garra.y + 8, r: 40, c: '#8a2aff' };
    if (t == 16) {
      B.tele = null;
      const a = rnd(0, 6.283);
      for (let k = -1; k <= 1; k++)
        efectoEn({
          tipo: 'tajo',
          x: B.garra.x - Math.cos(a) * 20,
          y: B.garra.y - Math.sin(a) * 20 + k * 8,
          r: 40,
          a,
          c: '#8a2aff',
        });
      burst(B.garra.x, B.garra.y, 16, '#12051e', 3, 18);
      sfx('tajo');
      G.shake = Math.max(G.shake, 8);
    }
    return false;
  },
  // Lluvia negra: truenos negros por toda la sala y algunos justo sobre la heroína.
  lluviaNegra: (B, cx, cy, f) => {
    B.moving = false;
    const P = G.P;
    if (B.t == 1) {
      sfx('rugido');
      G.banner = { txt: 'LLUVIA NEGRA', t: 0, c: RAYO_NEGRO, dura: 50 };
      for (let i = 0; i < (B.berserk ? 18 : 13); i++) {
        const cerca = i % 4 == 0;
        zonaEn(
          B,
          cerca ? P.x + rnd(-24, 24) : rnd(30, 450),
          cerca ? P.y + rnd(-18, 18) : rnd(50, 280),
          22,
          30 + i * 5,
          RAYO_NEGRO,
          'rayoNegro',
          1,
        );
      }
    }
    return B.t > 120;
  },
  // Pozos: el suelo se abre en charcos de fuego negro alrededor de la heroína.
  pozos: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) {
      const P = G.P;
      for (let i = 0; i < 6; i++) {
        const a = (i * 6.283) / 6 + rnd(-0.3, 0.3);
        zonaEn(B, P.x + Math.cos(a) * 50, P.y + Math.sin(a) * 36, 24, 34 + i * 4, '#8a2aff', 'fuegoSuelo', 1);
      }
      zonaEn(B, P.x, P.y, 24, 60, '#8a2aff', 'fuegoSuelo', 1);
    }
    return B.t > 90;
  },
});

// Un demonio y su forma de furia (cuerpo negro, contorno morado, música intensa).
function demonio(id, base, furia) {
  guardian(
    id,
    Object.assign({ demonio: 1, cuerpo: CUERPO_DEMONIO, tono: '#8a2aff', musica: 'demonios' }, base),
    furia,
  );
  Object.assign(JEFES[id + 'F'], { demonio: 1, cuerpo: CUERPO_DEMONIO, musica2: 'demoniosFuria' });
}
demonio(
  'silfred',
  {
    n: 'Silfred',
    sub: 'El Susurro Negro',
    idle: f4(400, 590, 19, 28),
    run: f4(400, 590, 19, 28),
    esc: 3.6,
    r: 34,
    cy: 50,
    boca: 64,
    horda: 'fantasma',
    hp: 5200,
    sp: 0.8,
    grito1: 'Escucha… es tu último aliento.',
    ataques: {
      1: ['teleporte', 'rayosNegros', 'cadenas', 'guadana', 'garrasSombra'],
      2: ['teleporte', 'rayosNegros', 'guadana', 'garrasSombra', 'lluviaNegra', 'abismoNegro'],
    },
  },
  {
    color: '#8a2aff',
    bpm: 190,
    grito: '¡EL SILENCIO TE TRAGA!',
    n: 'Silfred Desatado',
    hp: 4400,
    sp: 1,
    fases: [[0.45, '¡Nadie sale del abismo!']],
    ataques: {
      1: ['teleporte', 'rayosNegros', 'garrasSombra', 'lluviaNegra', 'guadana'],
      2: ['teleporte', 'lluviaNegra', 'abismoNegro', 'cadenas', 'garrasSombra', 'rayosNegros'],
    },
  },
);
demonio(
  'zagred',
  {
    n: 'Zagred',
    sub: 'El Carnicero del Abismo',
    idle: f4(0, 590, 31, 24),
    run: f4(0, 590, 31, 24),
    esc: 3.6,
    r: 40,
    cy: 44,
    boca: 52,
    horda: 'chort',
    hp: 6000,
    sp: 0.75,
    grito1: '¡CARNE PARA EL ABISMO!',
    ataques: {
      1: ['charge', 'hachazo', 'grietas', 'rugido', 'pozos'],
      2: ['charge', 'hachazo', 'grietas', 'rugido', 'pozos', 'rayosNegros', 'cargaTriple'],
    },
  },
  {
    color: '#8a2aff',
    bpm: 196,
    grito: '¡TE VOY A PARTIR EN DOS!',
    n: 'Zagred Sin Cadenas',
    hp: 5000,
    sp: 1,
    fases: [[0.45, '¡MÁS SANGRE!']],
    ataques: {
      1: ['charge', 'hachazo', 'grietas', 'pozos', 'lluviaNegra', 'cargaTriple'],
      2: ['charge', 'hachazo', 'grietas', 'rugido', 'lluviaNegra', 'garrasSombra', 'cargaTriple'],
    },
  },
);
demonio(
  'kiplot',
  {
    n: 'Kiplot',
    sub: 'Rey de los Demonios',
    musica: 'reyDemonio',
    // Se dibuja con la hoja del Dragón Demonio de Sombras (combate/jefes-hoja.js); idle/run quedan de respaldo.
    hoja: 1,
    idle: ALAS_DRAGON,
    run: ALAS_DRAGON,
    vel: 7,
    esc: 3.5,
    r: 40,
    cy: 46,
    boca: 74,
    horda: 'imp',
    hp: 7200,
    sp: 0.65,
    grito1: '¿Venciste a un dragón? Yo me comí a cien.',
    ataques: {
      1: ['aliento', 'rayosNegros', 'latigo', 'rugido', 'abismoNegro', 'aletazo'],
      2: [
        'aliento',
        'rayosNegros',
        'latigo',
        'rugido',
        'abismoNegro',
        'aletazo',
        'lluviaNegra',
        'garrasSombra',
      ],
    },
  },
  {
    color: '#ff2a4a',
    bpm: 204,
    grito: '¡ARRODÍLLATE ANTE EL REY DEL ABISMO!',
    n: 'Kiplot, el Devorador',
    hp: 6400,
    sp: 0.9,
    fases: [[0.4, '¡TODO VUELVE A LA OSCURIDAD!']],
    ataques: {
      1: ['aliento', 'lluviaNegra', 'latigo', 'abismoNegro', 'garrasSombra', 'rugido', 'pozos'],
      2: [
        'aliento',
        'lluviaNegra',
        'latigo',
        'abismoNegro',
        'garrasSombra',
        'rayosNegros',
        'aletazo',
        'vuelo',
      ],
    },
  },
);

// Aura de los demonios: humo negro y chispas moradas que suben, y truenos que caen cuando están furiosos.
function auraDemonio(B) {
  if (!B.def.demonio || B.dead) return;
  if (G.t % 2 == 0)
    G.pt.push({
      x: B.x + rnd(-30, 30),
      y: B.y - B.z - rnd(0, (B.def.cy || 40) * 1.6),
      vx: rnd(-0.3, 0.3),
      vy: -rnd(0.5, 1.4),
      l: 30,
      m: 30,
      c: Math.random() < 0.6 ? '#12051e' : Math.random() < 0.5 ? '#8a2aff' : '#ff2a4a',
      s: Math.random() < 0.4 ? 3 : 2,
      g: 0,
    });
  if (B.berserk && !B.trans && G.t % 130 == 0)
    zonaEn(B, G.P.x + rnd(-50, 50), G.P.y + rnd(-36, 36), 22, 40, RAYO_NEGRO, 'rayoNegro', 1);
}
// Kiplot ya es negro en su dibujo: no hace falta teñirlo.
['kiplot', 'kiplotF'].forEach(id => Object.assign(JEFES[id], { cuerpo: null, hoja: 1 }));
