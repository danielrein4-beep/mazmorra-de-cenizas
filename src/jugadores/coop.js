// Dos jugadores: cada uno con su héroe; monedas, llaves y pócimas se comparten.
// G.P es siempre "el jugador que está actuando": conJugador lo cambia mientras corre una acción.
function crearJugador(pi, sexo, vest, num) {
  const p = PERSONAJES[pi] || PERSONAJES[0],
    s = p[sexo];
  return {
    num,
    pid: pi,
    x: 240,
    y: 285,
    hp: p.hp,
    max: p.hp,
    sp: p.sp,
    spr: s.spr,
    nombre: s.n,
    src: atlasVestuario(vest),
    tecs: tecsEquipadas(pi in PERSONAJES ? pi : 0),
    ult: p.ult,
    tipoArma: p.arma,
    arma: nuevaArma(p.ini),
    safe: null,
    cds: [0, 0, 0],
    combo: 0,
    comboT: -99,
    swing: 0,
    escudo: 0,
    est: null,
    inv: 0,
    dash: 0,
    dcd: 0,
    dx: 0,
    dy: 0,
    face: 1,
    spell: 0,
    meter: 0,
    hurt: 0,
    moving: false,
    ax: 240,
    ay: 100,
    kick: 0,
    circ: 0,
    mej: {},
    caido: false,
    rev: 0,
  };
}
// La bolsa compartida: oro, llaves y pócimas son las mismas para los dos.
function compartirBolsa(js) {
  const bolsa = { oro: 0, poc: 1, llaves: 0 };
  js.forEach(P =>
    ['oro', 'poc', 'llaves'].forEach(k =>
      Object.defineProperty(P, k, {
        get: () => bolsa[k],
        set: v => {
          bolsa[k] = v;
        },
        enumerable: true,
      }),
    ),
  );
}
function conJugador(P, fn) {
  const prev = G.P;
  G.P = P;
  try {
    return fn();
  } finally {
    G.P = prev;
  }
}
const vivos = () => G.jug.filter(P => !P.caido);
function masCercano(o) {
  let best = G.jug[0],
    bd = 1e9;
  vivos().forEach(P => {
    const d = Math.hypot(P.x - o.x, P.y - o.y);
    if (d < bd) {
      bd = d;
      best = P;
    }
  });
  return best;
}
// Controles: jugador 1 con teclado (WASD) y ratón o táctil; jugador 2 con flechas + J K L O U Y o con un mando.
let mandoPrev = [];
function leerMando() {
  const g = navigator.getGamepads ? [...navigator.getGamepads()].find(x => x && x.connected) : null;
  return g || null;
}
function leerControles(P, i) {
  const c = { mx: 0, my: 0, ax: P.ax, ay: P.ay, fuego: false };
  const tg = objetivoCercano(),
    auto = () => {
      c.ax = tg ? tg.x : P.x + P.face * 50;
      c.ay = tg ? tg.y : P.y - 14;
    };
  if (i == 0) {
    if (keys.KeyA || (!G.coop && keys.ArrowLeft)) c.mx--;
    if (keys.KeyD || (!G.coop && keys.ArrowRight)) c.mx++;
    if (keys.KeyW || (!G.coop && keys.ArrowUp)) c.my--;
    if (keys.KeyS || (!G.coop && keys.ArrowDown)) c.my++;
    if (touch.move) {
      c.mx = touch.move.dx;
      c.my = touch.move.dy;
    }
    const vw = VW / G.zoom,
      vh = VH / G.zoom;
    if (touch.aim && Math.abs(touch.aim.dx) + Math.abs(touch.aim.dy) > 0.2) {
      c.ax = P.x + touch.aim.dx * 100;
      c.ay = P.y - 14 + touch.aim.dy * 100;
    } else if (touch.aim || coarse) auto();
    else {
      c.ax = G.cam.x + (mouse.x / OW - 0.5) * vw;
      c.ay = G.cam.y + (mouse.y / OH - 0.5) * vh;
    }
    c.fuego = mouse.down || !!touch.aim;
  } else if (enRed && enRed.rol == 'anfitrion') {
    controlesRemotos(P, c);
  } else {
    const g = leerMando();
    if (g) {
      const ax = g.axes,
        dz = v => (Math.abs(v) > 0.22 ? v : 0);
      c.mx = dz(ax[0]);
      c.my = dz(ax[1]);
      const rx = dz(ax[2] || 0),
        ry = dz(ax[3] || 0);
      if (Math.hypot(rx, ry) > 0.3) {
        c.ax = P.x + rx * 100;
        c.ay = P.y - 14 + ry * 100;
        c.fuego = true;
      } else auto();
      const b = g.buttons.map(x => x.pressed),
        nuevo = k => b[k] && !mandoPrev[k];
      if (b[7] || b[6]) c.fuego = true;
      if (nuevo(0)) dash();
      if (nuevo(1)) P.spell = (P.spell + 1) % 3;
      if (nuevo(5) || nuevo(4)) ult();
      if (nuevo(2)) interactuar();
      if (nuevo(3)) beber();
      mandoPrev = b;
    } else {
      if (keys.ArrowLeft) c.mx--;
      if (keys.ArrowRight) c.mx++;
      if (keys.ArrowUp) c.my--;
      if (keys.ArrowDown) c.my++;
      auto();
      c.fuego = !!keys.KeyL;
    }
  }
  const m = Math.hypot(c.mx, c.my);
  if (m > 1) {
    c.mx /= m;
    c.my /= m;
  }
  return c;
}
// Teclas de un toque del jugador 2 en el teclado.
const TECLAS_J2 = {
  KeyK: () => dash(),
  KeyJ: () => {
    G.P.spell = (G.P.spell + 1) % 3;
  },
  KeyO: () => ult(),
  KeyU: () => interactuar(),
  KeyY: () => beber(),
  KeyI: () => hechizoGrimorio(),
};
function teclaJ2(code) {
  if (!G || !G.coop || !TECLAS_J2[code] || G.jug[1].caido) return false;
  conJugador(G.jug[1], TECLAS_J2[code]);
  return true;
}
// Caer y revivir: si cae uno y el otro sigue en pie, se le revive quedándose a su lado.
function caer(P) {
  if (G.coop && (G.jugTodos || G.jug).filter(Q => !Q.caido).length > 1) {
    if (separadas() && !G.jug.some(Q => Q !== P && !Q.caido)) pendientesSala.push(() => rescatarCaido(P));
    P.caido = true;
    P.hp = 0;
    P.rev = 0;
    P.est = null;
    P.dash = 0;
    G.aviso = { txt: 'Jugador ' + P.num + ' cayó: quédate a su lado para revivirlo', l: 120 };
    return true;
  }
  return false;
}
function revivir(P, hp) {
  P.caido = false;
  P.hp = Math.min(P.max, hp);
  P.inv = 90;
  ring(P.x, P.y - 12, 24, '#7cff4a', 18, 2);
  burst(P.x, P.y - 12, 24, '#7cff4a', 2.5);
  sfx('cofre');
}
function revivirTodos() {
  G.jug.forEach(P => {
    if (P.caido) revivir(P, 2);
  });
}
function updateRevivir() {
  G.jug.forEach(P => {
    if (!P.caido) return;
    const ayuda = vivos().find(Q => Math.hypot(Q.x - P.x, Q.y - P.y) < 24);
    P.rev = ayuda ? P.rev + 1 : Math.max(0, P.rev - 2);
    if (ayuda && G.t % 4 == 0)
      G.pt.push({ x: P.x + rnd(-8, 8), y: P.y, vx: 0, vy: -0.8, l: 20, m: 20, c: '#7cff4a', s: 1, g: 0 });
    if (P.rev >= 110) revivir(P, 2);
  });
}
// Cámara de a dos: mira al punto medio y se aleja lo necesario para que los dos quepan.
function camaraCoop() {
  const V = vivos().length ? vivos() : G.jug,
    mx = V.reduce((s, P) => s + P.x, 0) / V.length,
    my = V.reduce((s, P) => s + P.y, 0) / V.length;
  const xs = V.map(P => P.x),
    ys = V.map(P => P.y),
    dx = Math.max(...xs) - Math.min(...xs),
    dy = Math.max(...ys) - Math.min(...ys);
  return {
    focus: { x: mx, y: my - 14 },
    zoom: Math.max(0.62, Math.min(zb(), VW / (dx + 150), VH / (dy + 110))),
  };
}
function drawCaido(P) {
  const t = G.t;
  w.fillStyle = 'rgba(0,0,0,.35)';
  w.beginPath();
  w.ellipse(P.x, P.y, 7, 2.5, 0, 0, 7);
  w.fill();
  w.drawImage(atlas, 288, 432, 16, 16, P.x - 8, P.y - 16, 16, 16);
  if (P.rev > 0) {
    w.strokeStyle = '#7cff4a';
    w.lineWidth = 2;
    w.beginPath();
    w.arc(P.x, P.y - 24, 7, -Math.PI / 2, -Math.PI / 2 + (6.283 * P.rev) / 110);
    w.stroke();
  } else if (t % 60 < 30) {
    w.fillStyle = '#ffe94a';
    w.fillRect(P.x - 1, P.y - 30, 2, 5);
  }
}
// Panel del jugador 2, a la derecha bajo el minimapa.
function drawHudJ2() {
  if (!G.coop) return;
  // En la vista del invitado, el recuadro pequeño muestra al anfitrión.
  const T = G.jugTodos || G.jug,
    P = T[G.P === T[1] ? 0 : 1],
    t = G.t,
    x0 = OW - 18;
  for (let i = 0; i < P.max / 2; i++) {
    const v = P.hp - i * 2,
      r = v >= 2 ? R.hFull : v == 1 ? R.hHalf : R.hEmpty;
    o.drawImage(atlas, r[0], r[1], 13, 12, x0 - (i + 1) * 30, 150, 26, 24);
  }
  const full = P.meter >= 100;
  o.fillStyle = 'rgba(10,6,16,.8)';
  o.fillRect(x0 - 120, 180, 120, 10);
  o.fillStyle = full ? (t % 20 < 10 ? '#ff8a2a' : '#ffffff') : '#c05a1a';
  o.fillRect(x0 - 118, 182, (116 * P.meter) / 100, 6);
  txt(
    (vistaPropia() ? 'Tu amigo · ' : 'Jugador 2 · ') + P.nombre + (P.caido ? ' (caído)' : ''),
    x0,
    206,
    14,
    '#ff8a2a',
    'right',
  );
  const AI = armaInfo(P.arma);
  txt(AI.n, x0, 222, 12, AI.raro ? '#5ee7ff' : '#c3b6d9', 'right');
  // En línea cada uno ve sus técnicas en su pantalla: no hace falta repetir las del otro.
  if (vistaPropia()) return;
  P.tecs.forEach((id, i) => {
    const x = OW - 18 - (3 - i) * 50,
      y = OH - 58,
      sel = P.spell == i;
    o.fillStyle = 'rgba(10,6,16,.8)';
    o.fillRect(x, y, 44, 44);
    o.strokeStyle = sel ? '#ff8a2a' : '#4e4070';
    o.lineWidth = sel ? 3 : 2;
    o.strokeRect(x + 1, y + 1, 42, 42);
    icono(o, id, x + 22, y + 20, 2);
    if (P.cds[i] > 0) {
      o.fillStyle = 'rgba(0,0,0,.55)';
      o.fillRect(
        x + 3,
        y + 3,
        38,
        Math.min(38, (38 * P.cds[i]) / Math.round(TEC[id].cd * armaInfo(P.arma).cdm)),
      );
    }
  });
}
