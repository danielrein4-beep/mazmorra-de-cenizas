// Técnicas (teclas 1-3) y golpes finales (Q) de cada personaje.
// usar(P, ángulo, x, y) dispara la técnica desde la punta del arma; mej = [nombre de la mejora, qué hace].
const disparo = (k, x, y, a, v, o) =>
  G.shots.push(
    Object.assign(
      {
        own: G.P,
        k,
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        r: 3,
        l: 90,
        dmg: 10,
        forja: G.P.multTec || 1,
        pierce: 0,
        hits: [],
      },
      o,
    ),
  );
const TEC = {
  hielo: {
    n: 'Hielo',
    cd: 9,
    c: '#5ee7ff',
    mej: ['Hielo cortante', 'El hielo sale en abanico de tres y pega más.'],
    usar(P, a, x, y) {
      const n = lvl('hielo') ? 3 : 1;
      for (let i = 0; i < n; i++)
        disparo('hielo', x, y, a + (i - (n - 1) / 2) * 0.17, 5.2, {
          dmg: Math.round(13 * (lvl('hielo') > 1 ? 1.5 : lvl('hielo') ? 1.2 : 1)),
        });
      sfx('hielo');
    },
  },
  fuego: {
    n: 'Fuego',
    cd: 24,
    c: '#ff8a2a',
    mej: ['Fuego voraz', 'Explosiones más grandes y más fuertes.'],
    usar(P, a, x, y) {
      disparo('fuego', x, y, a, 3.3, { r: 6, l: 120, dmg: Math.round(34 * (1 + 0.3 * lvl('fuego'))) });
      G.shake = Math.max(G.shake, 2);
      ring(x, y, 10, '#ff8a2a', 9);
      sfx('fire');
    },
  },
  rayo: {
    n: 'Rayo',
    cd: 16,
    c: '#b9f3ff',
    mej: ['Rayo en cadena', 'El rayo salta a más enemigos y la seguidilla pega más.'],
    usar(P, a, x, y) {
      if (G.t - P.comboT > 50) P.combo = 0;
      P.combo++;
      P.comboT = G.t;
      const fin = P.combo >= 3;
      // Pega al instante y nunca falla, por eso hace algo menos de daño que el fuego.
      rayo(x, y, a, fin ? 48 : 26 + P.combo * 7, fin);
      if (fin) {
        P.combo = 0;
        P.cds[P.spell] = 55;
      }
    },
  },
  tajo: {
    n: 'Tajo',
    cd: 16,
    c: '#fff1b0',
    mej: ['Filo del alba', 'Tajo más amplio, más fuerte y que lanza una onda de luz.'],
    usar(P, a) {
      const lv = lvl('tajo'),
        r = 40 * (1 + 0.3 * lv);
      golpeArco(P.x, P.y - 12, a, r, 2.3, Math.round(30 * (1 + 0.25 * lv)), 3, true);
      P.swing = 10;
      sfx('tajo');
      if (lv > 1) disparo('onda', P.x, P.y - 12, a, 4.2, { r: 7, l: 40, dmg: 20, pierce: 9 });
    },
  },
  estocada: {
    n: 'Estocada',
    cd: 45,
    c: '#ffe94a',
    mej: ['Estocada relámpago', 'Recorre más distancia y pega más fuerte.'],
    usar(P, a) {
      P.est = { t: 12 + 4 * lvl('estocada'), dir: [Math.cos(a), Math.sin(a)], hits: [] };
      P.inv = Math.max(P.inv, 20);
      P.swing = 0;
      sfx('estocada');
      ring(P.x, P.y - 10, 14, '#ffe94a', 10);
    },
  },
  escudo: {
    n: 'Escudo',
    cd: 120,
    c: '#ffd24a',
    mej: ['Égida', 'El escudo dura más y devuelve las balas con más fuerza.'],
    usar(P) {
      P.escudo = 55 + 25 * lvl('escudo');
      ring(P.x, P.y - 12, 24, '#ffd24a', 14, 2);
      sfx('escudo');
    },
  },
  flecha: {
    n: 'Flecha',
    cd: 8,
    c: '#7cff4a',
    mej: ['Punta de acero', 'Las flechas atraviesan a tres enemigos y pegan más.'],
    usar(P, a, x, y) {
      disparo('flecha', x, y, a, 6.5, {
        dmg: Math.round(14 * (1 + 0.25 * lvl('flecha'))),
        pierce: lvl('flecha') ? 3 : 1,
      });
      sfx('flecha');
    },
  },
  abanico: {
    n: 'Abanico',
    cd: 30,
    c: '#b4ff8a',
    mej: ['Abanico de siete', 'Salen siete flechas en vez de cinco.'],
    usar(P, a, x, y) {
      const n = lvl('abanico') ? 7 : 5;
      for (let i = 0; i < n; i++) disparo('flecha', x, y, a + (i - (n - 1) / 2) * 0.14, 6, { dmg: 12 });
      sfx('abanico');
    },
  },
  espinas: {
    n: 'Espinas',
    cd: 50,
    c: '#3a8a1a',
    mej: ['Zarza', 'La flecha estalla en el doble de espinas.'],
    usar(P, a, x, y) {
      disparo('espinas', x, y, a, 4, { dmg: 30, l: 70, r: 4 });
      sfx('flecha');
    },
  },
  martillazo: {
    n: 'Martillazo',
    cd: 28,
    c: '#ffb04a',
    mej: ['Golpe de montaña', 'Más alcance y más daño.'],
    usar(P, a) {
      const lv = lvl('martillazo'),
        x = P.x + Math.cos(a) * 26,
        y = P.y - 8 + Math.sin(a) * 18,
        r = 32 * (1 + 0.3 * lv);
      P.swing = 12;
      objetivos().forEach(t => {
        if (Math.hypot(t.x - x, t.y - y) < r + t.r) dañar(t, Math.round(45 * (1 + 0.3 * lv)), 4, true);
      });
      cortarBalas(x, y, r);
      dañarCajas(x, y, r, 45);
      G.shake = Math.max(G.shake, 5);
      G.stop = Math.max(G.stop, 3);
      ring(x, y, r, '#ffb04a', 14, 3);
      decal(x, y + 4, r * 0.5, '#1a120a', 500);
      burst(x, y, 26, '#8a7a6a', 3, 26, 2, 0.12);
      sfx('martillazo');
    },
  },
  hacha: {
    n: 'Hacha',
    cd: 40,
    c: '#c3c8d8',
    mej: ['Hachas gemelas', 'Lanzas dos hachas que vuelven a tu mano.'],
    usar(P, a, x, y) {
      const n = lvl('hacha') ? 2 : 1;
      for (let i = 0; i < n; i++)
        disparo('hacha', x, y, a + (i - (n - 1) / 2) * 0.35, 4.2, {
          r: 6,
          l: 200,
          dmg: 25,
          pierce: 99,
          ida: 30,
        });
      sfx('hacha');
    },
  },
  pisoton: {
    n: 'Pisotón',
    cd: 90,
    c: '#ff8a2a',
    mej: ['Pisada de gigante', 'La onda llega más lejos y pega más.'],
    usar(P) {
      dañarCajas(P.x, P.y, 80 * (1 + 0.35 * lvl('pisoton')), 35);
      G.ondas.push({
        own: P,
        x: P.x,
        y: P.y,
        r: 6,
        max: 80 * (1 + 0.35 * lvl('pisoton')),
        dmg: Math.round(35 * (1 + 0.3 * lvl('pisoton'))),
        hits: [],
      });
      G.shake = 10;
      G.stop = 4;
      sfx('pisoton');
      burst(P.x, P.y, 30, '#8a7a6a', 3, 30, 2, 0.1);
      decal(P.x, P.y + 2, 20, '#1a120a', 500);
    },
  },
  dagas: {
    n: 'Dagas',
    cd: 6,
    c: '#c3c8d8',
    mej: ['Mil cortes', 'Lanzas dos dagas a la vez.'],
    usar(P, a, x, y) {
      const n = lvl('dagas') ? 2 : 1;
      for (let i = 0; i < n; i++)
        disparo('daga', x, y, a + rnd(-0.06, 0.06) + (i - (n - 1) / 2) * 0.12, 6.2, {
          dmg: Math.round(9 * (lvl('dagas') > 1 ? 1.3 : 1)),
        });
      sfx('dagas');
    },
  },
  veneno: {
    n: 'Veneno',
    cd: 70,
    c: '#7cff4a',
    mej: ['Peste', 'La nube es más grande y dura más.'],
    usar(P, a, x, y) {
      const d = Math.min(120, Math.hypot(P.ax - x, P.ay - y));
      G.frascos.push({
        own: P,
        x,
        y,
        x0: x,
        y0: y,
        tx: x + Math.cos(a) * d,
        ty: y + Math.sin(a) * d,
        t: 0,
        T: 30,
      });
      sfx('lanzar');
    },
  },
  sombra: {
    n: 'Sombra',
    cd: 60,
    c: '#9a3aff',
    mej: ['Paso de sombra', 'Pega más y se recarga antes.'],
    usar(P, a) {
      const tg = objetivoCercano();
      burst(P.x, P.y - 10, 24, '#2a1650', 2.5, 30, 2);
      ring(P.x, P.y - 10, 14, '#9a3aff', 12);
      let nx, ny;
      if (tg && Math.hypot(tg.x - P.x, tg.y - P.y) < 170) {
        const b = Math.atan2(tg.y - P.y, tg.x - P.x);
        nx = tg.ref.x + Math.cos(b) * 18;
        ny = tg.ref.y + Math.sin(b) * 10;
      } else {
        nx = P.x + Math.cos(a) * 60;
        ny = P.y + Math.sin(a) * 60;
      }
      for (let k = 10; k >= 0; k--) {
        const fx2 = P.x + ((nx - P.x) * k) / 10,
          fy2 = P.y + ((ny - P.y) * k) / 10;
        if (!solidAt(fx2, fy2, 4)) {
          P.x = fx2;
          P.y = fy2;
          break;
        }
      }
      golpeArco(
        P.x,
        P.y - 12,
        Math.atan2((tg ? tg.y : P.y) - P.y + 12, (tg ? tg.x : P.x + P.face) - P.x),
        30,
        6.3,
        Math.round(45 * (1 + 0.3 * lvl('sombra'))),
        5,
        false,
      );
      P.inv = Math.max(P.inv, 20);
      burst(P.x, P.y - 10, 24, '#9a3aff', 3);
      sfx('sombra');
      if (lvl('sombra')) P.cds[P.spell] = Math.round(P.cds[P.spell] * 0.7);
    },
  },
};
