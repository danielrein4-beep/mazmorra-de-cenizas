// Objetos para agarrar: monedas, pócimas (se guardan y se toman con F), cofres, armas en pedestal y la tienda de Zaro.
const tipoArmaAzar = () => G.jug[Math.floor(Math.random() * G.jug.length)].tipoArma;
function soltarMonedas(x, y, n) {
  n = Math.round(n * (G.dif ? G.dif.oro : 1));
  if (n >= 5 && (G.jug || []).some(P => tiene(P, 'trebol'))) n *= 2;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283,
      v = rnd(0.8, 2.4);
    G.monedas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0 });
  }
}
function ponerCofre(x, y, mimico, cont) {
  G.inter.push({ tipo: 'cofre', x, y, t: 0, abre: 0, mimico, cont });
}
function ponerArma(x, y, arma) {
  G.inter.push({ tipo: 'arma', x, y, t: 0, arma });
}
const TIENDA = [
  { id: 'arma', n: 'Arma rara', precio: 40, d: 'Un arma con un efecto especial.' },
  { id: 'pocima', n: 'Pócima', precio: 15, d: 'Se guarda; tómala con F cuando la necesites.' },
  { id: 'corazon', n: 'Corazón extra', precio: 60, d: 'Un corazón más de vida.' },
  { id: 'furia', n: 'Furia llena', precio: 30, d: 'Tu golpe final queda listo.' },
  { id: 'reliquia', n: 'Reliquia', precio: 70, d: '' },
];
function ponerTienda() {
  G.vendedor = { x: 240, y: 186, frase: fraseZaro() };
  [120, 180, 240, 300, 360].forEach((x, i) => {
    const it = TIENDA[i];
    G.inter.push({
      tipo: 'venta',
      x,
      y: 236,
      t: 0,
      it,
      arma: it.id == 'arma' ? armaAlAzar(tipoArmaAzar(), 1) : null,
      rel: it.id == 'reliquia' ? reliquiaAlAzar(G.jug[0], true) : null,
    });
  });
}
function textoInter(c, tecla) {
  const I = c.arma ? armaInfo(c.arma) : null,
    E = tecla == null ? (coarse ? '' : 'E · ') : tecla;
  if (c.tipo == 'arma') return [(coarse ? 'Tomar: ' : E + 'Tomar ') + I.n, I.d, I.raro];
  if (c.tipo == 'cofre') return [E + 'Abrir cofre', '¿Qué habrá dentro?', false];
  if (c.tipo == 'evento') return textoEvento(c, E);
  if (c.tipo == 'reliquia') return [E + 'Tomar ' + reliquia(c.rel).n, reliquia(c.rel).d, true];
  const n = c.it.id == 'arma' ? I.n : c.rel ? reliquia(c.rel).n : c.it.n,
    falta = c.it.precio - G.P.oro;
  return [
    E + 'Comprar ' + n + ' · ' + c.it.precio + ' monedas',
    falta > 0
      ? 'Te faltan ' + falta + ' monedas'
      : c.it.id == 'arma'
        ? I.d
        : c.rel
          ? reliquia(c.rel).d
          : c.it.d,
    c.it.id == 'arma',
  ];
}
function interactuar() {
  const P = G.P,
    c = G.coop && P === G.jug[1] ? G.cerca2 : G.cerca;
  if (!c || G.over || P.caido) return;
  if (c.tipo == 'arma') {
    if (ARMAS[c.arma.id].tipo != P.tipoArma) {
      G.aviso = { txt: 'Esa arma es para tu compañero', l: 60 };
      return;
    }
    const viejo = P.arma;
    P.arma = c.arma;
    c.arma = viejo;
    c.t = 0;
    const I = armaInfo(P.arma);
    G.aviso = { txt: I.n, l: 70 };
    burst(c.x, c.y - 8, 20, I.raro ? '#5ee7ff' : '#ffe94a', 2.5);
    ring(c.x, c.y - 8, 14, '#ffffff', 12);
    sfx('arma');
  }
  if (c.tipo == 'evento') return usarEvento(P, c);
  if (c.tipo == 'reliquia') {
    darReliquia(P, c.rel);
    c.d = 1;
  }
  if (c.tipo == 'cofre' && !c.abre) {
    c.abre = 1;
    sfx('lanzar');
  }
  if (c.tipo == 'venta') {
    const it = c.it;
    if (P.oro < it.precio) {
      G.aviso = { txt: 'Te faltan ' + (it.precio - P.oro) + ' monedas', l: 60 };
      sfx('hurt');
      return;
    }
    if (it.id == 'pocima' && P.poc >= 3) {
      G.aviso = { txt: 'Ya llevas tres pócimas', l: 60 };
      return;
    }
    P.oro -= it.precio;
    sfx('pick');
    burst(c.x, c.y - 8, 24, '#ffe94a', 2.5);
    ring(c.x, c.y - 8, 16, '#ffe94a', 12);
    if (it.id == 'arma') {
      c.tipo = 'arma';
      interactuar();
      return;
    }
    if (it.id == 'pocima') P.poc++;
    if (it.id == 'reliquia') darReliquia(P, c.rel);
    if (it.id == 'corazon') {
      P.max += 2;
      P.hp += 2;
    }
    if (it.id == 'furia') P.meter = 100;
    if (it.id != 'reliquia') G.aviso = { txt: it.n, l: 60 };
    c.d = 1;
  }
}
function beber() {
  const P = G.P;
  if (P.caido || !P.poc || P.hp >= P.max || G.over) return;
  P.poc--;
  P.hp = Math.min(P.max, P.hp + 2);
  burst(P.x, P.y - 14, 18, '#ff4a5a', 2);
  ring(P.x, P.y - 12, 14, '#ff8a9a', 12);
  sfx('pick');
}
function updateObjetos() {
  const P = G.P;
  G.monedas.forEach(m => {
    m.t++;
    const P = masCercano(m),
      d = Math.hypot(P.x - m.x, P.y - 6 - m.y);
    if (m.t > 25 && d < 46) {
      m.vx += ((P.x - m.x) / d) * 0.5;
      m.vy += ((P.y - 6 - m.y) / d) * 0.5;
    }
    m.vx *= 0.9;
    m.vy *= 0.9;
    if (!solidAt(m.x + m.vx, m.y, 1)) m.x += m.vx;
    if (!solidAt(m.x, m.y + m.vy, 1)) m.y += m.vy;
    if (m.t > 15 && d < 8) {
      m.d = 1;
      P.oro++;
      sfx('coin');
      G.pt.push({ x: m.x, y: m.y, vx: 0, vy: -1, l: 12, m: 12, c: '#ffe94a', s: 1, g: 0 });
    }
  });
  G.monedas = G.monedas.filter(m => !m.d);
  G.pick.forEach(p => {
    p.t++;
    const P = masCercano(p);
    if (Math.hypot(P.x - p.x, P.y - p.y) < 10) {
      if (P.poc < 3) {
        P.poc++;
        G.aviso = { txt: 'Pócima guardada' + (coarse ? '' : ' · F para tomarla'), l: 60 };
      } else if (P.hp < P.max) P.hp = Math.min(P.max, P.hp + 2);
      else return;
      p.d = 1;
      burst(p.x, p.y - 6, 16, '#ff4a5a', 2);
      ring(p.x, p.y - 6, 12, '#ff8a9a', 12);
      sfx('pick');
    }
  });
  G.pick = G.pick.filter(p => !p.d);
  G.inter.forEach(c => {
    c.t++;
    if (c.tipo == 'cofre' && c.abre && ++c.abre == 20) {
      if (c.mimico) {
        c.d = 1;
        G.enem.push({
          k: 'mimico',
          def: ENEMIGOS.mimico,
          x: c.x,
          y: c.y,
          h: 16,
          hp: 120,
          max: 120,
          hit: 0,
          face: 1,
          t: 0,
          cd: 30,
          kx: 0,
          ky: 0,
          st: '',
          stT: 0,
        });
        G.aviso = { txt: '¡Era un mímico!', l: 70 };
        G.cerrado = 1;
        G.mimicoSala = 1;
        sfx('roar');
        G.shake = 8;
      } else {
        c.tipo = 'abierto';
        soltarMonedas(c.x, c.y - 6, 6 + Math.floor(Math.random() * 7));
        ponerArma(c.x, c.y + 22, armaAlAzar(tipoArmaAzar(), c.cont == 'raro'));
        if (c.cont == 'llave') {
          G.P.llaves = (G.P.llaves || 0) + 1;
          G.aviso = { txt: '¡Llave del jefe!', l: 100 };
          ring(c.x, c.y - 8, 30, '#ffe94a', 20, 3);
        }
        if (Math.random() < 0.4) G.pick.push({ x: c.x + 22, y: c.y + 10, t: 0 });
        burst(c.x, c.y - 8, 30, '#ffe94a', 3);
        ring(c.x, c.y - 8, 20, '#ffe94a', 14);
        sfx('cofre');
      }
    }
  });
  G.inter = G.inter.filter(c => !c.d);
  const cercaDe = Q =>
    Q.caido
      ? null
      : G.inter
          .filter(
            c =>
              c.tipo != 'abierto' && !(c.tipo == 'cofre' && c.abre) && Math.hypot(Q.x - c.x, Q.y - c.y) < 18,
          )
          .sort((a, b) => Math.hypot(Q.x - a.x, Q.y - a.y) - Math.hypot(Q.x - b.x, Q.y - b.y))[0] || null;
  G.cerca = cercaDe(G.jug[0]);
  G.cerca2 = G.coop && G.jug[1] ? cercaDe(G.jug[1]) : null;
  if (G.mimicoSala && !G.enem.length) {
    G.mimicoSala = 0;
    G.cerrado = 0;
    G.aviso = { txt: 'Mímico vencido', l: 70 };
    soltarMonedas(G.P.x, G.P.y - 30, 15);
    sfx('door');
  }
}
function drawObjetos(ents) {
  const t = G.t;
  G.monedas.forEach(m => {
    const f = Math.floor((t + m.x) / 6) % 4;
    w.drawImage(
      atlas,
      289 + 8 * f,
      385,
      6,
      7,
      Math.round(m.x - 3),
      Math.round(m.y - 4 - Math.abs(Math.sin((t + m.x) * 0.15)) * (m.t < 30 ? 0 : 1.5)),
      6,
      7,
    );
  });
  if (G.vendedor) {
    const V = G.vendedor;
    ents.push({
      y: V.y,
      d: () => {
        w.fillStyle = 'rgba(0,0,0,.3)';
        w.beginPath();
        w.ellipse(V.x, V.y, 6, 2, 0, 0, 7);
        w.fill();
        spr(w, atlas, [368 + 16 * (Math.floor(t / 10) % 4), 345, 16, 23], V.x, V.y, G.P.x < V.x);
      },
    });
  }
  G.inter.forEach(c =>
    ents.push({
      y: c.y,
      d: () => {
        if (c.tipo == 'evento') return drawEvento(c, t);
        if (c.tipo == 'cofre' || c.tipo == 'abierto') {
          const f = c.tipo == 'abierto' ? 2 : c.abre ? Math.min(2, Math.floor(c.abre / 7)) : 0,
            y0 = c.mimico && c.abre ? 432 : c.tipo == 'abierto' ? 400 : 416;
          if (c.tipo == 'cofre' && !c.abre) {
            w.globalAlpha = 0.3 + Math.sin(t * 0.1) * 0.15;
            w.fillStyle = '#ffe94a';
            w.beginPath();
            w.ellipse(c.x, c.y, 11, 4, 0, 0, 7);
            w.fill();
            w.globalAlpha = 1;
          }
          w.drawImage(
            atlas,
            304 + 16 * f,
            y0,
            16,
            16,
            c.x - 8,
            c.y - 14 + (c.abre && c.abre < 20 ? rnd(-1, 1) : 0),
            16,
            16,
          );
          return;
        }
        const I = armaInfo(c.arma || nuevaArma('regular_sword')),
          b = Math.sin(t * 0.07 + c.x) * 2,
          raro = c.arma && I.raro;
        w.globalAlpha = 0.35 + Math.sin(t * 0.1) * 0.15;
        w.fillStyle = raro ? '#5ee7ff' : '#ffe94a';
        w.beginPath();
        w.ellipse(c.x, c.y, 10, 3.5, 0, 0, 7);
        w.fill();
        w.globalAlpha = 1;
        w.fillStyle = '#3a2e4a';
        w.fillRect(c.x - 7, c.y - 3, 14, 4);
        w.fillStyle = '#5a4a6a';
        w.fillRect(c.x - 7, c.y - 3, 14, 1);
        w.save();
        w.translate(c.x, c.y - 12 + b);
        if (c.arma) {
          const [sx, sy, sw, sh] = I.spr;
          w.rotate(0.785);
          w.drawImage(atlas, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
        } else if (c.rel) dibujarReliquia(w, c.rel, 0, 0, 1);
        else if (c.it.id == 'pocima') w.drawImage(atlas, 288, 336, 16, 16, -8, -8, 16, 16);
        else if (c.it.id == 'corazon') w.drawImage(atlas, 289, 370, 13, 12, -6, -6, 13, 12);
        else {
          w.fillStyle = '#ff2a4a';
          w.fillRect(-1, -8, 3, 12);
          w.beginPath();
          w.moveTo(0, 8);
          w.lineTo(-4, 0);
          w.lineTo(4, 0);
          w.fill();
        }
        w.restore();
        if (c.tipo == 'venta') {
          w.fillStyle = G.P.oro >= c.it.precio ? '#ffe94a' : '#8f82a6';
          w.fillRect(c.x - 6, c.y + 3, 12, 1);
        }
        if (t % 20 < 2)
          G.pt.push({
            x: c.x + rnd(-6, 6),
            y: c.y - 10 + rnd(-8, 8),
            vx: 0,
            vy: -0.3,
            l: 16,
            m: 16,
            c: raro ? '#5ee7ff' : '#ffe94a',
            s: 1,
            g: 0,
          });
      },
    }),
  );
  G.pick.forEach(p =>
    ents.push({
      y: p.y,
      d: () => spr(w, atlas, R.flask, p.x, p.y - 2 - Math.abs(Math.sin(t * 0.08)) * 3, false),
    }),
  );
}
