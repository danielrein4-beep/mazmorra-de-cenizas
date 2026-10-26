// Más que bolitas: los enemigos comunes tiran rayitos, tajos, pinchos que salen del suelo, ondas que
// se abren (se saltan con el dash) y proyectiles con forma (hueso que gira y vuelve, dagas, lanzas,
// carámbanos, monedas, media luna de energía). Cada uno avisa antes, como el resto.

// Proyectil con forma: va girado según hacia dónde viaja (el hueso, además, da vueltas).
function balaForma(m, a, v, c, forma, o) {
  balaEn(m, a, v, c, Object.assign({ forma, r: 4 }, o));
}
function drawFormaBala(b, t) {
  const a = b.forma == 'hueso' ? t * 0.4 : Math.atan2(b.vy, b.vx);
  w.save();
  w.translate(b.x, b.y);
  w.rotate(a);
  w.globalAlpha = 0.3;
  w.fillStyle = b.c;
  w.beginPath();
  w.arc(0, 0, 8, 0, 7);
  w.fill();
  w.globalAlpha = 1;
  if (b.forma == 'hueso') {
    w.fillStyle = '#f0e8d8';
    w.fillRect(-6, -1.5, 12, 3);
    [-6, 6].forEach(x => [-2, 2].forEach(y => w.fillRect(x - 1.5, y - 1.5, 3, 3)));
  } else if (b.forma == 'daga' || b.forma == 'lanza') {
    const L = b.forma == 'lanza' ? 14 : 9;
    w.fillStyle = b.forma == 'lanza' ? '#6a4a2a' : '#3a2a4a';
    w.fillRect(-L, -1, L, 2);
    w.fillStyle = b.c;
    w.beginPath();
    w.moveTo(6, 0);
    w.lineTo(-1, -3);
    w.lineTo(-1, 3);
    w.fill();
    w.fillStyle = '#ffffff';
    w.fillRect(0, -0.5, 4, 1);
  } else if (b.forma == 'carambano') {
    w.fillStyle = '#e8fbff';
    w.beginPath();
    w.moveTo(8, 0);
    w.lineTo(-6, -3);
    w.lineTo(-4, 0);
    w.lineTo(-6, 3);
    w.fill();
    w.fillStyle = b.c;
    w.fillRect(-4, -1, 8, 2);
  } else if (b.forma == 'moneda') {
    w.rotate(-a);
    w.fillStyle = '#ffd24a';
    w.fillRect(-1.5 * Math.abs(Math.cos(t * 0.3)) - 0.5, -3, 3 * Math.abs(Math.cos(t * 0.3)) + 1, 6);
  } else if (b.forma == 'luna') {
    w.strokeStyle = b.c;
    w.lineWidth = 3;
    w.beginPath();
    w.arc(-4, 0, 9, -1.1, 1.1);
    w.stroke();
    w.strokeStyle = '#ffffff';
    w.lineWidth = 1;
    w.stroke();
  }
  w.restore();
}

// Efectos del suelo y del aire que no son balas: ondas, tajos, rayitos y pinchos. Otros archivos suman
// tipos propios en EFECTOS_EXTRA (con su paso y su dibujo).
const EFECTOS_EXTRA = {};
function efectoEn(e) {
  G.efectosEn.push(Object.assign({ t: 0, hits: [] }, e));
}
function pegarUnaVez(e, Q) {
  if (e.hits.includes(Q)) return;
  e.hits.push(Q);
  conJugador(Q, hurtPlayer);
}
function pasoEfectosEn() {
  G.efectosEn.forEach(e => {
    e.t++;
    if (e.tipo == 'onda') {
      e.r += e.v;
      vivos().forEach(Q => Math.abs(Math.hypot(Q.x - e.x, (Q.y - e.y) * 1.4) - e.r) < 5 && pegarUnaVez(e, Q));
      if (e.r >= e.max) e.d = 1;
    } else if (e.tipo == 'tajo') {
      if (e.t == 3)
        vivos().forEach(Q => {
          const d = Math.hypot(Q.x - e.x, Q.y - 8 - e.y),
            a = Math.atan2(Q.y - 8 - e.y, Q.x - e.x);
          if (d < e.r + 6 && Math.abs(Math.atan2(Math.sin(a - e.a), Math.cos(a - e.a))) < 1.1)
            pegarUnaVez(e, Q);
        });
      if (e.t > 12) e.d = 1;
    } else if (e.tipo == 'rayito') {
      if (e.t < 6)
        vivos().forEach(Q => distSegmento(Q.x, Q.y - 10, e.x, e.y, e.x2, e.y2) < 7 && pegarUnaVez(e, Q));
      if (e.t > 10) e.d = 1;
    } else if (e.tipo == 'pincho') {
      if (e.t == e.espera) {
        burst(e.x, e.y, 8, e.c, 2.5, 16, 2, 0.1);
        decal(e.x, e.y + 2, 5, '#140c0a', 300);
        vivos().forEach(Q => Math.hypot(Q.x - e.x, Q.y - e.y) < 13 && pegarUnaVez(e, Q));
        if (e.sonido) sfx('pisoton');
      }
      if (e.t > e.espera + 26) e.d = 1;
    } else if (EFECTOS_EXTRA[e.tipo]) EFECTOS_EXTRA[e.tipo].paso(e);
  });
  G.efectosEn = G.efectosEn.filter(e => !e.d);
}
function drawEfectosEn() {
  G.efectosEn.forEach(e => {
    if (EFECTOS_EXTRA[e.tipo]) return EFECTOS_EXTRA[e.tipo].draw(e);
    if (e.tipo == 'onda') {
      if (e.r <= 0) return;
      const k = 1 - e.r / e.max;
      w.globalAlpha = 0.25 * k + 0.1;
      w.strokeStyle = e.c;
      w.lineWidth = 7;
      w.beginPath();
      w.ellipse(e.x, e.y, e.r, e.r / 1.4, 0, 0, 7);
      w.stroke();
      w.globalAlpha = 0.9 * k + 0.1;
      w.strokeStyle = '#ffffff';
      w.lineWidth = 1.5;
      w.stroke();
    } else if (e.tipo == 'tajo') {
      const k = 1 - e.t / 12;
      w.globalAlpha = k;
      w.strokeStyle = e.c;
      w.lineWidth = 6 * k + 1;
      w.beginPath();
      w.arc(e.x, e.y, e.r, e.a - 1.1 + e.t * 0.05, e.a + 1.1);
      w.stroke();
      w.strokeStyle = '#ffffff';
      w.lineWidth = 1.5;
      w.stroke();
    } else if (e.tipo == 'pincho') {
      if (e.t < e.espera) {
        w.globalAlpha = 0.25 + 0.4 * (e.t / e.espera);
        w.fillStyle = e.c;
        w.beginPath();
        w.ellipse(e.x, e.y, 9, 4, 0, 0, 7);
        w.fill();
      } else {
        const k = Math.min(1, (e.t - e.espera) / 4) * (1 - Math.max(0, e.t - e.espera - 18) / 8);
        w.globalAlpha = 1;
        [-5, 0, 5].forEach((dx, i) => {
          const h = (i == 1 ? 16 : 10) * k;
          w.fillStyle = '#2a1e2a';
          w.beginPath();
          w.moveTo(e.x + dx - 3, e.y + 2);
          w.lineTo(e.x + dx, e.y + 2 - h);
          w.lineTo(e.x + dx + 3, e.y + 2);
          w.fill();
          w.fillStyle = e.c;
          w.fillRect(e.x + dx - 0.5, e.y + 2 - h, 1, h * 0.6);
        });
      }
    }
  });
  w.globalAlpha = 1;
}

// Rayito: una línea fina de rayo desde el enemigo, del largo que marcó el aviso.
function rayitoDe(m, ang, largo, c) {
  const x = m.x,
    y = m.y - 10,
    x2 = x + Math.cos(ang) * largo,
    y2 = y + Math.sin(ang) * largo;
  G.bolts.push(Object.assign(rayoPts(x, y, x2, y2), { l: 10, col: c }));
  efectoEn({ tipo: 'rayito', x, y, x2, y2 });
  burst(x2, y2, 6, c, 2, 12);
  sfx('rayo');
}
// Pinchos: brotan del suelo uno tras otro en línea hacia la heroína.
function pinchosDe(m, ang, c, n) {
  for (let i = 1; i <= n; i++)
    efectoEn({
      tipo: 'pincho',
      x: m.x + Math.cos(ang) * 20 * i,
      y: m.y + Math.sin(ang) * 20 * i,
      espera: 14 + i * 5,
      c,
      sonido: i == 1,
    });
}

Object.assign(AT_EN, {
  hueso: {
    aviso: 24,
    c: '#e8e0d0',
    linea: 1,
    hacer: (m, a) => balaForma(m, a.ang, 2.4, '#e8e0d0', 'hueso', { vuelve: 55, l: 130 }),
  },
  pinchos: { aviso: 22, c: '#e8e0d0', linea: 1, hacer: (m, a) => pinchosDe(m, a.ang, '#e8e0d0', 6) },
  pinchosOscuros: { aviso: 26, c: '#b06bff', linea: 1, hacer: (m, a) => pinchosDe(m, a.ang, '#b06bff', 8) },
  rayito: { aviso: 26, c: '#5ee7ff', linea: 1, hacer: (m, a) => rayitoDe(m, a.ang, 170, '#5ee7ff') },
  rayitoFuego: { aviso: 24, c: '#ff8a2a', linea: 1, hacer: (m, a) => rayitoDe(m, a.ang, 130, '#ff8a2a') },
  rayitoRojo: { aviso: 24, c: '#ff3a2a', linea: 1, hacer: (m, a) => rayitoDe(m, a.ang, 150, '#ff3a2a') },
  rayoOscuro: { aviso: 28, c: '#b06bff', linea: 1, hacer: (m, a) => rayitoDe(m, a.ang, 190, '#b06bff') },
  // Cruz de rayitos: cuatro rayos cortos en cruz desde el enmascarado.
  cruz: {
    aviso: 26,
    c: '#ffe94a',
    circulo: 18,
    enSi: 1,
    hacer: m => {
      const a0 = rnd(0, 1.57);
      for (let d = 0; d < 4; d++) rayitoDe(m, a0 + d * 1.571, 90, '#ffe94a');
    },
  },
  tajo: {
    aviso: 18,
    c: '#ffffff',
    linea: 1,
    hacer: (m, a) => {
      // Da un paso adelante y corta en media luna.
      [m.x, m.y] = enSala(m.x + Math.cos(a.ang) * 10, m.y + Math.sin(a.ang) * 10);
      efectoEn({ tipo: 'tajo', x: m.x, y: m.y - 8, r: 26, a: a.ang, c: '#ff5a3c' });
      sfx('tajo');
    },
  },
  daga: {
    aviso: 20,
    c: '#c3c8d8',
    linea: 1,
    hacer: (m, a) => [-0.12, 0.12].forEach(d => balaForma(m, a.ang + d, 2.8, '#c3c8d8', 'daga')),
  },
  tridente: {
    aviso: 24,
    c: '#ffe94a',
    linea: 1,
    hacer: (m, a) => [-0.16, 0, 0.16].forEach(d => balaForma(m, a.ang + d, 2.4, '#ffe94a', 'lanza')),
  },
  carambano: {
    aviso: 22,
    c: '#9af0ff',
    linea: 1,
    hacer: (m, a) => [-0.1, 0.1].forEach(d => balaForma(m, a.ang + d, 2.8, '#9af0ff', 'carambano')),
  },
  monedas: {
    aviso: 20,
    c: '#ffd24a',
    linea: 1,
    hacer: (m, a) => [-2, -1, 0, 1, 2].forEach(d => balaForma(m, a.ang + d * 0.14, 2.1, '#ffd24a', 'moneda')),
  },
  palma: {
    aviso: 22,
    c: '#d0b0ff',
    linea: 1,
    hacer: (m, a) => balaForma(m, a.ang, 2, '#d0b0ff', 'luna', { r: 7 }),
  },
  // Golpe, nova, chillido y lamento: una onda que se abre por el suelo (se pasa por encima con el dash).
  golpe: {
    aviso: 30,
    c: '#c8a070',
    circulo: 40,
    enSi: 1,
    hacer: m => {
      efectoEn({ tipo: 'onda', x: m.x, y: m.y, r: 8, max: 90, v: 2.2, c: '#e0b890' });
      dañoZona(m.x, m.y, 24);
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
      efectoEn({ tipo: 'onda', x: m.x, y: m.y, r: 6, max: 80, v: 1.8, c: '#9af0ff' });
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
      efectoEn({ tipo: 'onda', x: m.x, y: m.y, r: 6, max: 70, v: 3, c: '#c3b6d9' });
      efectoEn({ tipo: 'onda', x: m.x, y: m.y, r: -14, max: 70, v: 3, c: '#c3b6d9' });
    },
  },
  lamento: {
    aviso: 30,
    c: '#9af0ff',
    circulo: 30,
    enSi: 1,
    hacer: m => {
      efectoEn({ tipo: 'onda', x: m.x, y: m.y, r: 6, max: 100, v: 1.2, c: '#9af0ff' });
      sfx('sombra');
    },
  },
});
Object.assign(ATAQUES_ENEMIGO, {
  skelet: ['hueso', 'pinchos', 'embestida'],
  imp: ['rayitoFuego', 'fuego', 'blink'],
  goblin: ['embestida', 'bomba', 'daga'],
  chort: ['tridente', 'rayitoRojo'],
  orcW: ['embestida', 'golpe', 'tajo'],
  masked: ['tajo', 'cruz', 'daga'],
  shaman: ['rayito', 'tormentaChaman', 'curar'],
  necro: ['invocar', 'rayoOscuro', 'pinchosOscuros'],
});
