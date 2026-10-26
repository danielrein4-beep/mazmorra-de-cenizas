// Guardianes de la Torre, pisos 40 a 90: monstruos de la mazmorra crecidos y criaturas de Debts in the Depths.
// Cada uno tiene su segundo round; el dragón del piso 100 está en combate/dragon.js.

// Arma un guardián y su forma de furia, que hereda el dibujo, el tamaño y el cuerpo.
function guardian(id, base, furia) {
  JEFES[id] = Object.assign({ fases: [[0.5, base.grito1]] }, base, { segundo: id + 'F' });
  JEFES[id + 'F'] = Object.assign(
    { idle: base.idle, run: base.run, esc: base.esc, r: base.r, cy: base.cy, boca: base.boca },
    { horda: base.horda, tono: base.tono, musica: base.musica, sub: 'Sobrevive si puedes' },
    furia,
  );
}

guardian(
  'nigromante',
  {
    n: 'Reina Nigromante',
    sub: 'Guardiana del piso 40',
    idle: f4(368, 225, 16, 23),
    run: f4(368, 225, 16, 23),
    esc: 3.4,
    r: 30,
    cy: 34,
    boca: 50,
    horda: 'skelet',
    tono: '#b06bff',
    musica: 'persecucion',
    hp: 3400,
    sp: 0.5,
    grito1: '¡Levántense, mis muertos!',
    ataques: {
      1: ['spiral', 'horda', 'tumbas', 'ring'],
      2: ['spiral2', 'horda', 'tumbas', 'teleporte', 'diluvio'],
    },
  },
  {
    color: '#b06bff',
    bpm: 170,
    grito: '¡La muerte no me detiene!',
    n: 'Reina de los Muertos',
    hp: 3000,
    sp: 0.75,
    fases: [[0.45, '¡Toda la cripta conmigo!']],
    ataques: {
      1: ['tumbas', 'spiral2', 'teleporte', 'horda', 'diluvio'],
      2: ['tumbas', 'espiralInfernal', 'teleporte', 'horda', 'diluvio', 'nube'],
    },
  },
);

guardian(
  'minotauro',
  {
    n: 'Minotauro del Laberinto',
    sub: 'Guardián del piso 50',
    idle: f4(0, 590, 31, 24),
    run: f4(0, 590, 31, 24),
    esc: 3,
    r: 34,
    cy: 36,
    boca: 44,
    tono: '#ff6a2a',
    musica: 'batalla',
    hp: 3800,
    sp: 0.7,
    grito1: '¡MUUUUGH!',
    ataques: {
      1: ['charge', 'salto', 'terremoto', 'giro'],
      2: ['charge', 'salto2', 'aplastar', 'terremoto', 'charge'],
    },
  },
  {
    color: '#ff6a2a',
    bpm: 190,
    grito: '¡EL LABERINTO ES MÍO!',
    n: 'Minotauro Furioso',
    hp: 3200,
    sp: 1,
    fases: [[0.45, '¡NO HAY SALIDA!']],
    ataques: {
      1: ['charge', 'avalancha', 'aplastar', 'rocasCielo', 'charge'],
      2: ['charge', 'avalancha', 'aplastar', 'terremoto', 'rocasCielo', 'giro'],
    },
  },
);

guardian(
  'espectro',
  {
    n: 'Espectro de la Torre',
    sub: 'Guardián del piso 60',
    idle: f4(400, 590, 19, 28),
    run: f4(400, 590, 19, 28),
    esc: 3,
    r: 30,
    cy: 42,
    boca: 56,
    tono: '#9af0ff',
    musica: 'persecucion',
    hp: 3600,
    sp: 0.8,
    grito1: '¡Uuuuuuh... no me ves!',
    ataques: {
      1: ['teleporte', 'fan', 'ring', 'spiral'],
      2: ['teleporte', 'spiral2', 'tormenta', 'fan', 'teleporte'],
    },
  },
  {
    color: '#9af0ff',
    bpm: 175,
    grito: '¡Te llevo conmigo al más allá!',
    n: 'Espectro Eterno',
    hp: 3200,
    sp: 1.1,
    fases: [[0.45, '¡Gritos del más allá!']],
    ataques: {
      1: ['teleporte', 'tornados', 'tormenta', 'spiral2', 'teleporte'],
      2: ['teleporte', 'tornados', 'tormenta', 'espiralInfernal', 'teleporte', 'rayosCruz'],
    },
  },
);

guardian(
  'hechicero',
  {
    n: 'Gran Hechicero',
    sub: 'Guardián del piso 70',
    idle: f4(90, 620, 26, 18),
    run: f4(90, 620, 26, 18),
    esc: 3.6,
    r: 30,
    cy: 32,
    boca: 44,
    tono: '#5ee7ff',
    musica: 'persecucion',
    hp: 4000,
    sp: 0.6,
    grito1: '¡Grimorio, ábrete!',
    ataques: {
      1: ['rayosCruz', 'fan', 'ring2', 'teleporte'],
      2: ['rayosCruz', 'tormenta', 'meteoros', 'spiral2', 'teleporte'],
    },
  },
  {
    color: '#5ee7ff',
    bpm: 185,
    grito: '¡Magia prohibida!',
    n: 'Hechicero Prohibido',
    hp: 3400,
    sp: 0.9,
    fases: [[0.45, '¡Todas las páginas a la vez!']],
    ataques: {
      1: ['rayosCruz', 'tormenta', 'meteoros', 'espiralInfernal', 'teleporte'],
      2: ['rayosCruz', 'tormenta', 'meteoros', 'espiralInfernal', 'tornados', 'teleporte'],
    },
  },
);

guardian(
  'goblinRey',
  {
    n: 'Señor Goblin',
    sub: 'Guardián del piso 80',
    idle: f4(432, 40),
    run: f4(432, 40),
    esc: 4.2,
    r: 30,
    cy: 30,
    boca: 40,
    horda: 'goblin',
    tono: '#7cff4a',
    musica: 'batalla',
    hp: 4200,
    sp: 0.9,
    grito1: '¡Muchachos, a él!',
    ataques: {
      1: ['charge', 'horda', 'fan', 'imps'],
      2: ['charge', 'horda', 'bomba', 'fan', 'mordisco'],
    },
  },
  {
    color: '#7cff4a',
    bpm: 195,
    grito: '¡TODA LA BANDA!',
    n: 'Rey de la Banda',
    hp: 3600,
    sp: 1.2,
    fases: [[0.45, '¡Bombas para todos!']],
    ataques: {
      1: ['charge', 'horda', 'bomba', 'mordisco', 'charge'],
      2: ['charge', 'horda', 'bomba', 'diluvio', 'mordisco', 'avalancha'],
    },
  },
);

guardian(
  'caballeroHielo',
  {
    n: 'Caballero de Hielo',
    sub: 'Guardián del piso 90',
    idle: f4(432, 136),
    run: f4(432, 136),
    esc: 4.2,
    r: 30,
    cy: 30,
    boca: 40,
    horda: 'zhielo',
    tono: '#4ab8ff',
    musica: 'batalla',
    hp: 4400,
    sp: 0.75,
    grito1: '¡Que se congele tu alma!',
    ataques: {
      1: ['ventisca', 'carambanos', 'charge', 'fan'],
      2: ['ventisca', 'carambanos', 'charge', 'horda', 'spiral2'],
    },
  },
  {
    color: '#4ab8ff',
    bpm: 190,
    grito: '¡INVIERNO ETERNO!',
    n: 'Señor del Invierno Eterno',
    hp: 3800,
    sp: 1.05,
    fases: [[0.45, '¡Hielo en todo el cielo!']],
    ataques: {
      1: ['ventisca', 'carambanos', 'charge', 'tornados', 'avalancha'],
      2: ['ventisca', 'carambanos', 'charge', 'tornados', 'rayosCruz', 'ventisca'],
    },
  },
);

// Carámbanos: caen del techo y estallan en esquirlas de hielo.
COLOR_MARCA.hielo = '#4ab8ff';
CAIDA.hielo = ['#4ab8ff', '#e8fbff', 6];
CAE.hielo = m => {
  ring(m.x, m.y, 24, '#9af0ff', 12, 3);
  burst(m.x, m.y, 26, '#e8fbff', 3.2, 26, 2, 0.08);
  bossFire(8, 1.3, rnd(0, 1), '#9af0ff', m.x, m.y - 4);
  decal(m.x, m.y + 2, 10, '#0a1a2a', 500);
  sfx('hit');
  return 20;
};

Object.assign(ATAQUES, {
  // Espiral doble de hielo que gira mientras el caballero se queda quieto.
  ventisca: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t % 5 == 0 && B.t < 90) {
      const a = B.t * 0.13;
      for (let k = 0; k < (B.berserk ? 4 : 3); k++) {
        const b = a + (k * 6.283) / (B.berserk ? 4 : 3),
          v = 1.5 * f;
        G.bul.push({ x: cx, y: cy, vx: Math.cos(b) * v, vy: Math.sin(b) * v, c: '#9af0ff', r: 3 });
      }
      if (B.t % 15 == 0) sfx('hielo');
    }
    return B.t > 100;
  },
  // Carámbanos que caen encima de la heroína y por toda la sala.
  carambanos: B => {
    if (B.t % 7 == 0 && B.t < (B.berserk ? 98 : 70)) {
      const P = G.P,
        [x, y] =
          Math.random() < 0.6
            ? enSala(P.x + rnd(-44, 44), P.y + rnd(-34, 34))
            : enSala(rnd(40, 440), rnd(60, 300));
      G.cielo.push({ x, y, t: 46, m: 46, tipo: 'hielo' });
    }
    return B.t > 100;
  },
  // Una cruz de rayos sobre la fila y la columna donde estás parado: hay que salir de la línea.
  rayosCruz: B => {
    if (B.t == 1 || (B.berserk && B.t == 45)) {
      const P = G.P,
        dia = B.berserk && B.t == 45;
      for (let i = -6; i <= 6; i++) {
        const [x1, y1] = dia ? enSala(P.x + i * 30, P.y + i * 22) : enSala(P.x + i * 34, P.y),
          [x2, y2] = dia ? enSala(P.x + i * 30, P.y - i * 22) : enSala(P.x, P.y + i * 26);
        G.cielo.push({ x: x1, y: y1, t: 44, m: 44, tipo: 'rayo' });
        if (i) G.cielo.push({ x: x2, y: y2, t: 44, m: 44, tipo: 'rayo' });
      }
      sfx('ultCarga');
    }
    return B.t > (B.berserk ? 100 : 60);
  },
});
