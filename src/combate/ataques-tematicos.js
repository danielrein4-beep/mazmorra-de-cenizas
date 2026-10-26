// Ataques pensados para cada jefe según lo que es (y menos anillos de bolitas):
// el caballero pelea con su espada larga negra, Gruk con su garrote, el minotauro con el hacha, el espectro
// con su guadaña y cadenas, el hechicero con un rayo arcano y runas, la nigromante con almas y manos de
// muertos, el goblin con flechas y dagas, el Rey Podrido con el pantano y el Señor de las Cenizas con fuego.
const angA = B => Math.atan2(G.P.y - 10 - (B.y - (B.def.cy || 34) * 0.6), G.P.x - B.x);

Object.assign(ATAQUES, {
  // Espadazo: la espada larga se levanta y barre un arco enorme frente al caballero (dos veces si está furioso).
  espadazo: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) B.angE = angA(B);
    const giro = B.berserk ? 2.4 : 2,
      lado = Math.floor(B.t / 50) % 2 ? -1 : 1,
      t = B.t % 50;
    if (B.t > (B.berserk ? 100 : 50)) return (B.arma = B.areaArma = null), true;
    if (t == 0) B.angE = angA(B);
    golpeArma(B, t || 50, {
      arma: B.berserk ? 'espadaNegra' : 'espada',
      aviso: 24,
      barre: 8,
      a0: B.angE - (giro / 2) * lado,
      a1: B.angE + (giro / 2) * lado,
      c: '#9af0ff',
    });
    return false;
  },
  // Estocada larga: apunta y la espada sale disparada en línea recta, una franja larga de golpe.
  estocadaLarga: (B, cx, cy, f) => {
    B.moving = false;
    const y0 = B.y - (B.def.cy || 34) * 0.6;
    if (B.t == 1) {
      B.angE = angA(B);
      sfx('ultCarga');
    }
    if (B.t < 26) {
      B.arma = { tipo: 'espadaNegra', x: B.x, y: y0, a: B.angE };
      avisoLinea(B, B.x, y0, B.angE, 230, '#b06bff', 2);
    }
    if (B.t == 26) {
      B.laser = null;
      sfx('tajo');
      G.shake = 10;
    }
    if (B.t >= 26 && B.t < 40) {
      const k = Math.min(1, (B.t - 26) / 4);
      B.arma = {
        tipo: 'espadaNegra',
        x: B.x + Math.cos(B.angE) * 130 * k,
        y: y0 + Math.sin(B.angE) * 130 * k,
        a: B.angE,
      };
      B.laser = { x: B.x, y: y0, a: B.angE, largo: 230 * k, ancho: 8, c: '#b06bff' };
      const x2 = B.x + Math.cos(B.angE) * 230 * k,
        y2 = y0 + Math.sin(B.angE) * 230 * k;
      vivos().forEach(Q => distSegmento(Q.x, Q.y - 10, B.x, y0, x2, y2) < 10 && conJugador(Q, hurtPlayer));
    }
    if (B.t == 40) B.arma = B.laser = null;
    return B.t > 54;
  },
  // Lluvia de espadas negras: caen en dos líneas que se cruzan sobre la heroína.
  espadasCielo: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) {
      const P = G.P;
      sfx('sombra');
      for (let i = -4; i <= 4; i++) {
        caeDelCielo(P.x + i * 28, P.y + i * 8, 'espada', '#b06bff', 40 + Math.abs(i) * 5);
        if (i) caeDelCielo(P.x + i * 10, P.y - i * 24, 'espada', '#b06bff', 52 + Math.abs(i) * 5);
      }
    }
    return B.t > 90;
  },
  // Garrotazo de Gruk: un barrido enorme con el garrote; al final golpea el suelo y se agrieta.
  garrotazo: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) B.angE = angA(B);
    const fin = golpeArma(B, B.t, {
      arma: 'garrote',
      aviso: 28,
      barre: 10,
      a0: B.angE - 1.3,
      a1: B.angE + 1.3,
      alcance: 84,
      c: '#c8a070',
    });
    if (B.t == 40) {
      for (let k = -1; k <= 1; k++) pinchosDe(B, B.angE + k * 0.5, '#c8a070', 6);
      G.shake = 14;
      sfx('pisoton');
    }
    return fin;
  },
  // Grietas: golpea el suelo y la tierra revienta en cinco líneas alrededor.
  grietas: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t < 20) B.z = B.t * 1.2;
    if (B.t == 20) {
      B.z = 0;
      const a0 = angA(B);
      for (let k = 0; k < (B.berserk ? 7 : 5); k++)
        pinchosDe(B, a0 + (k * 6.283) / (B.berserk ? 7 : 5), '#c8a070', 8);
      efectoEn({ tipo: 'onda', x: B.x, y: B.y, r: 10, max: 80, v: 2.5, c: '#e0b890' });
      G.shake = 16;
      sfx('pisoton');
    }
    return B.t > 70;
  },
  // Hachazo del minotauro: el hacha cae de arriba y abre una grieta larga hacia adelante.
  hachazo: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) B.angE = angA(B);
    const fin = golpeArma(B, B.t, {
      arma: 'hacha',
      aviso: 26,
      barre: 7,
      a0: B.angE - 1.6,
      a1: B.angE + 0.3,
      alcance: 90,
      c: '#ff5a3c',
    });
    if (B.t == 33) {
      pinchosDe(B, B.angE, '#ff5a3c', 10);
      G.shake = 14;
      sfx('pisoton');
    }
    return fin;
  },
  // Guadaña del espectro: da una vuelta entera; el suelo marca el círculo que corta.
  guadana: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) B.angE = angA(B);
    return golpeArma(B, B.t, {
      arma: 'guadana',
      aviso: 30,
      barre: 16,
      a0: B.angE,
      a1: B.angE + 6.28,
      alcance: 104,
      c: '#c3b6d9',
    });
  },
  // Cadenas espectrales: cuatro rayos de cadena cruzan la sala desde las paredes hacia la heroína.
  cadenas: (B, cx, cy, f) => {
    B.moving = false;
    const P = G.P;
    if (B.t == 1)
      B.cad = [0, 1, 2, 3].map(i => {
        const lado = i % 2 ? 470 : 10,
          y0 = rnd(50, 260);
        return { x: i < 2 ? lado : rnd(40, 440), y: i < 2 ? y0 : i == 2 ? 30 : 300 };
      });
    if (B.t < 30)
      B.cad.forEach(c => avisoLinea(B, c.x, c.y, Math.atan2(P.y - 10 - c.y, P.x - c.x), 520, '#c3b6d9', 2));
    if (B.t == 30) {
      B.cad.forEach(c => {
        const a = Math.atan2(P.y - 10 - c.y, P.x - c.x),
          x2 = c.x + Math.cos(a) * 520,
          y2 = c.y + Math.sin(a) * 520;
        G.bolts.push(Object.assign(rayoPts(c.x, c.y, x2, y2), { l: 16, m: 16, gordo: 1, col: '#c3b6d9' }));
        efectoEn({ tipo: 'rayito', x: c.x, y: c.y, x2, y2 });
      });
      sfx('rayo');
      G.shake = 8;
    }
    return B.t > 60;
  },
  // Rayo arcano del hechicero: un láser que barre media sala.
  laserArcano: (B, cx, cy, f) => {
    B.moving = false;
    return laserJefe(B, B.t, cx, cy, {
      c: '#5ee7ff',
      aviso: 34,
      dura: 70,
      ancho: 12,
      sigue: B.berserk ? 0.03 : 0.02,
    });
  },
  // Runas: círculos mágicos se encienden en el suelo en espiral y estallan uno tras otro.
  runas: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) {
      const P = G.P;
      for (let i = 0; i < 10; i++) {
        const a = i * 0.9,
          d = 20 + i * 9;
        zonaEn(B, P.x + Math.cos(a) * d, P.y + Math.sin(a) * d * 0.7, 20, 30 + i * 6, '#5ee7ff', 'rayo', 1);
      }
      sfx('ultCarga');
    }
    return B.t > 100;
  },
  // Rayo de almas de la nigromante: un láser verde-morado que la sigue.
  rayoAlmas: (B, cx, cy, f) => {
    B.moving = false;
    return laserJefe(B, B.t, cx, cy, { c: '#7cff4a', aviso: 30, dura: 60, ancho: 10, sigue: 0.022 });
  },
  // Manos de muertos: salen del suelo en tres líneas hacia la heroína.
  manosMuertas: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) {
      const a0 = angA(B);
      [-0.35, 0, 0.35].forEach(d => pinchosDe(B, a0 + d, '#7cff4a', 9));
      sfx('sombra');
    }
    return B.t > 70;
  },
  // Lluvia de flechas del goblin: una nube de flechas cae sobre una franja marcada.
  lluviaFlechas: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t % 22 == 1 && B.t < 70) {
      const P = G.P;
      for (let i = 0; i < 9; i++)
        caeDelCielo(P.x + rnd(-60, 60), P.y + rnd(-40, 40), 'flecha', '#ffe94a', 30 + i * 2);
      sfx('lanzar');
    }
    return B.t > 110;
  },
  // Ráfaga de dagas: tres tandas de dagas en abanico corto.
  rafagaDagas: (B, cx, cy, f) => {
    B.moving = false;
    if ([10, 22, 34].includes(B.t)) {
      const a = angA(B);
      for (let i = -2; i <= 2; i++) balaForma(B, a + i * 0.15, 2.8 * f, '#c3c8d8', 'daga');
      G.bul.slice(-5).forEach(b => ((b.x = cx), (b.y = cy)));
      sfx('lanzar');
    }
    return B.t > 50;
  },
  // Ola del pantano: una pared de lodo cruza la sala con un hueco para pasar.
  olaPantano: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) {
      const hueco = rnd(70, 230);
      for (let y = 40; y < 300; y += 14) {
        if (Math.abs(y - hueco) < 30) continue;
        G.bul.push({ x: 20, y, vx: 1.4 * f, vy: 0, c: '#5a8a2a', r: 6, forma: 'luna' });
      }
      sfx('veneno');
    }
    return B.t > 40;
  },
  // Manos de la tumba: brotan alrededor de la heroína en círculo y luego en el centro.
  manosTumba: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) {
      const P = G.P;
      for (let i = 0; i < 8; i++) {
        const a = (i * 6.283) / 8;
        efectoEn({
          tipo: 'pincho',
          x: P.x + Math.cos(a) * 40,
          y: P.y + Math.sin(a) * 28,
          espera: 26,
          c: '#7cff4a',
          sonido: !i,
        });
      }
      efectoEn({ tipo: 'pincho', x: P.x, y: P.y, espera: 44, c: '#7cff4a', sonido: 1 });
    }
    return B.t > 70;
  },
  // Rayo infernal del Señor de las Cenizas: un láser de fuego que gira media vuelta.
  rayoInfernal: (B, cx, cy, f) => {
    B.moving = false;
    return laserJefe(B, B.t, cx, cy, {
      c: '#ff5a1a',
      aviso: 30,
      dura: 80,
      ancho: 12,
      gira: (B.berserk ? 0.04 : 0.03) * (B.lado || 1),
      desfase: -1.2,
    });
  },
  // Pilares de fuego: brotan en cruz desde el jefe, de adentro hacia afuera.
  pilaresFuego: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) {
      const a0 = rnd(0, 0.785);
      for (let k = 0; k < 4; k++)
        for (let i = 1; i <= 6; i++)
          zonaEn(
            B,
            B.x + Math.cos(a0 + k * 1.571) * i * 30,
            B.y + Math.sin(a0 + k * 1.571) * i * 22,
            18,
            20 + i * 7,
            '#ff8a2a',
            'fuegoSuelo',
            1,
          );
      sfx('fuego');
    }
    return B.t > 80;
  },
  // Látigo de fuego (el mismo del dragón, desde la mano del jefe).
  latigoFuego: (B, cx, cy, f) => latigoDragon(B, cx, cy, f),
});

// Listas nuevas: cada jefe con sus ataques propios y sin anillos ni espirales de bolitas.
const TEMATICOS = {
  zombi: {
    1: ['vomito', 'golpe', 'horda', 'olaPantano', 'manosTumba'],
    2: ['vomito', 'golpe', 'horda', 'lluvia', 'olaPantano', 'manosTumba', 'cargaTriple'],
  },
  plaga: {
    1: ['tumbas', 'diluvio', 'nube', 'olaPantano', 'manosTumba', 'horda'],
    2: ['tumbas', 'diluvio', 'nube', 'olaPantano', 'manosTumba', 'bomba'],
  },
  ogro: {
    1: ['salto', 'roca', 'garrotazo', 'grietas'],
    2: ['salto2', 'roca', 'garrotazo', 'grietas', 'giro', 'cargaTriple'],
  },
  desatado: {
    1: ['salto2', 'avalancha', 'garrotazo', 'grietas', 'rocasCielo', 'aplastar'],
    2: ['salto2', 'garrotazo', 'grietas', 'terremoto', 'rocasCielo', 'aplastar'],
  },
  cenizas: {
    1: ['latigoFuego', 'pilaresFuego', 'charge', 'rayoInfernal'],
    2: ['latigoFuego', 'pilaresFuego', 'charge', 'rayoInfernal', 'imps'],
    3: ['latigoFuego', 'pilaresFuego', 'charge', 'rayoInfernal', 'imps', 'meteoros'],
  },
  furia: {
    1: ['tornados', 'tormenta', 'rayoInfernal', 'latigoFuego', 'pilaresFuego', 'teleporte'],
    2: ['tormenta', 'rayoInfernal', 'latigoFuego', 'pilaresFuego', 'lanzallamas', 'teleporte', 'meteoros'],
  },
  nigromante: {
    1: ['rayoAlmas', 'horda', 'tumbas', 'manosMuertas'],
    2: ['rayoAlmas', 'horda', 'tumbas', 'manosMuertas', 'teleporte', 'diluvio'],
  },
  nigromanteF: {
    1: ['rayoAlmas', 'tumbas', 'manosMuertas', 'teleporte', 'horda'],
    2: ['rayoAlmas', 'tumbas', 'manosMuertas', 'teleporte', 'diluvio', 'nube'],
  },
  minotauro: {
    1: ['charge', 'hachazo', 'terremoto', 'salto'],
    2: ['charge', 'hachazo', 'aplastar', 'grietas', 'salto2'],
  },
  minotauroF: {
    1: ['charge', 'hachazo', 'aplastar', 'grietas', 'avalancha'],
    2: ['charge', 'hachazo', 'grietas', 'rocasCielo', 'aplastar'],
  },
  espectro: {
    1: ['teleporte', 'guadana', 'cadenas', 'tormenta'],
    2: ['teleporte', 'guadana', 'cadenas', 'tormenta', 'rayosCruz'],
  },
  espectroF: {
    1: ['teleporte', 'guadana', 'cadenas', 'tornados', 'tormenta'],
    2: ['teleporte', 'guadana', 'cadenas', 'tornados', 'rayosCruz'],
  },
  hechicero: {
    1: ['laserArcano', 'rayosCruz', 'runas', 'teleporte'],
    2: ['laserArcano', 'rayosCruz', 'runas', 'tormenta', 'meteoros', 'teleporte'],
  },
  hechiceroF: {
    1: ['laserArcano', 'runas', 'tormenta', 'meteoros', 'teleporte'],
    2: ['laserArcano', 'runas', 'tormenta', 'meteoros', 'rayosCruz', 'teleporte'],
  },
  goblinRey: {
    1: ['charge', 'horda', 'rafagaDagas', 'lluviaFlechas'],
    2: ['charge', 'horda', 'bomba', 'rafagaDagas', 'lluviaFlechas', 'mordisco'],
  },
  goblinReyF: {
    1: ['charge', 'horda', 'bomba', 'lluviaFlechas', 'rafagaDagas'],
    2: ['charge', 'horda', 'bomba', 'lluviaFlechas', 'rafagaDagas', 'avalancha'],
  },
  caballeroHielo: {
    1: ['espadazo', 'estocadaLarga', 'carambanos', 'charge'],
    2: ['espadazo', 'estocadaLarga', 'espadasCielo', 'ventisca', 'carambanos'],
  },
  caballeroHieloF: {
    1: ['espadazo', 'estocadaLarga', 'espadasCielo', 'ventisca'],
    2: ['espadazo', 'estocadaLarga', 'espadasCielo', 'ventisca', 'tornados'],
  },
};
Object.entries(TEMATICOS).forEach(([id, L]) => JEFES[id] && (JEFES[id].ataques = L));
