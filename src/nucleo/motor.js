// Motor: lienzos, atlas, estado de la partida, paso de cada jugador, bucle, cámara y fin de partida.
const cv = document.getElementById('cv'),
  o = cv.getContext('2d');
o.imageSmoothingEnabled = false;
const mk = (a, b) => {
  const c = document.createElement('canvas');
  c.width = a;
  c.height = b;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return [c, x];
};
const [wc, w] = mk(WW, WH),
  [fc, fx] = mk(WW, WH);
const atlas = new Image();
atlas.src = ATLAS_SRC;
let white, red, cyan;
let G,
  keys = {},
  mouse = { x: OW / 2, y: OH / 2, down: false },
  touch = { move: null, aim: null },
  running = false;
const coarse = matchMedia('(pointer: coarse)').matches;
let AC, noise, sfxBus;
function initAudio() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const n = AC.sampleRate;
      noise = AC.createBuffer(1, n, n);
      const d = noise.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      sfxBus = AC.createGain();
      sfxBus.gain.value = 1;
      sfxBus.connect(AC.destination);
    }
    AC.resume?.();
  } catch (e) {
    AC = null;
  }
}
const rnd = (a, b) => a + Math.random() * (b - a);
function spr(x, src, r, dx, dy, flip, sc) {
  sc = sc || 1;
  x.save();
  x.translate(Math.round(dx), Math.round(dy));
  if (flip) x.scale(-1, 1);
  x.drawImage(src, r[0], r[1], r[2], r[3], (-r[2] * sc) / 2, -r[3] * sc, r[2] * sc, r[3] * sc);
  x.restore();
}
function tile(x, r, tx, ty) {
  x.drawImage(atlas, r[0], r[1], 16, 16, tx * 16, ty * 16, 16, 16);
}
function tint(col) {
  const [c, x] = mk(512, 512);
  x.drawImage(atlas, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = col;
  x.fillRect(0, 0, 512, 512);
  return c;
}
const lvl = id => G.P.mej[id] || 0;
// En teléfono la cámara se acerca un poco para que los personajes se vean más grandes.
const zb = () => (G.B && !G.B.dead ? 0.8 : 1) * (coarse ? 1.12 : 1);
function newRun() {
  G = { zona: 0, dif: DIFS[ELEGIDO.modo] || DIFS.normal, start: performance.now(), kills: 0 };
  const js = [crearJugador(ELEGIDO.p, ELEGIDO.sexo, ELEGIDO.vest, 1)];
  if (ELEGIDO.jug == 2 && (!coarse || enRed))
    js.push(crearJugador(ELEGIDO.p2 || 0, ELEGIDO.sexo2 || 'm', 'normal', 2));
  compartirBolsa(js);
  G.jug = js;
  G.coop = js.length > 1;
  G.P = js[0];
}
function resetSala() {
  Object.assign(G, {
    t: 0,
    stop: 0,
    slow: 1,
    slowT: 0,
    shake: 0,
    zoom: 1,
    zt: 1,
    dark: 0,
    flash: 0,
    fcol: '#fff',
    inv: 0,
    acc: 0,
    over: 0,
    cam: { x: 240, y: 250 },
    B: null,
    enem: [],
    spawns: [],
    shots: [],
    bul: [],
    pt: [],
    nums: [],
    bolts: [],
    spears: [],
    ghosts: [],
    rings: [],
    decals: [],
    marcas: [],
    pick: [],
    tajos: [],
    cortes: [],
    ondas: [],
    frascos: [],
    nubes: [],
    monedas: [],
    inter: [],
    vendedor: null,
    mimicoSala: 0,
    cerca: null,
    U: null,
    banner: null,
    intro: null,
    aviso: null,
    cerrado: 0,
    oleadas: null,
    escalera: null,
    fade: 1,
    salir: 0,
    ola: 0,
    olaT: 0,
  });
}
function burst(x, y, n, c, sp, l, s, g) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283,
      v = Math.random() * sp;
    G.pt.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      l: l || 24,
      m: l || 24,
      c,
      s: s || (Math.random() < 0.4 ? 2 : 1),
      g: g || 0,
    });
  }
}
function num(x, y, v, big) {
  G.nums.push({ x: x + rnd(-8, 8), y, v: Math.round(v), l: big ? 70 : 40, big });
}
function ring(x, y, r, c, l, lw) {
  G.rings.push({ x, y, r0: 2, r, c, l, m: l, lw: lw || 2 });
}
function decal(x, y, r, c, l) {
  G.decals.push({ x, y, r, c, l, m: l });
  if (G.decals.length > 60) G.decals.shift();
}
function hurtPlayer() {
  const P = G.P;
  if (P.caido || P.inv > 0 || P.dash > 0 || P.est || G.U || G.over || G.intro) return;
  P.hp -= G.dif.golpe;
  P.inv = 70;
  P.hurt = 20;
  G.shake = 10;
  G.stop = 6;
  G.flash = 6;
  G.fcol = '#ff2a2a';
  burst(P.x, P.y - 12, 18, '#ff4a5a', 2.5);
  ring(P.x, P.y - 10, 18, '#ff4a5a', 14);
  sfx('hurt');
  if (P.hp <= 0) {
    if (caer(P)) return;
    G.over = 1;
    G.slow = 0.3;
    G.slowT = 9999;
    musica(null);
    setTimeout(() => end(false), 1400);
  }
}
function pasoJugador(P, i) {
  P.cds = P.cds.map(c => (c > 0 ? c - 1 : 0));
  ['dcd', 'inv', 'hurt', 'kick', 'circ', 'swing'].forEach(k => {
    if (P[k] > 0) P[k]--;
  });
  if (P.caido) {
    P.moving = false;
    return;
  }
  const c = leerControles(P, i),
    mx = c.mx,
    my = c.my,
    ml = Math.hypot(mx, my);
  P.dx = mx;
  P.dy = my;
  P.ax = c.ax;
  P.ay = c.ay;
  P.face = P.ax < P.x ? -1 : 1;
  const libre = !G.over && !G.U && !G.intro && !G.salir;
  if (libre && !P.est) {
    let vx, vy;
    const sp = P.sp * (1 + 0.15 * lvl('pies'));
    if (P.dash > 0) {
      P.dash--;
      [vx, vy] = P.dashV;
      if (G.t % 2 == 0) G.ghosts.push({ x: P.x, y: P.y, face: P.face, l: 14, spr: P.spr });
      if (P.dash == 0) burst(P.x, P.y, 6, '#8a7a9a', 1, 16);
    } else {
      vx = mx * sp;
      vy = my * sp;
    }
    if (!solidAt(P.x + vx, P.y, 4)) P.x += vx;
    if (!solidAt(P.x, P.y + vy, 4)) P.y += vy;
    P.moving = ml > 0.1 || P.dash > 0;
    if (P.moving && !P.dash && G.t % 14 == 0)
      G.pt.push({ x: P.x + rnd(-3, 3), y: P.y, vx: 0, vy: -0.2, l: 14, m: 14, c: '#5a4a6a', s: 1, g: 0 });
    if (c.fuego) cast();
  } else P.moving = !!P.est;
}
function step() {
  G.t++;
  if (G.slowT > 0 && --G.slowT == 0) G.slow = 1;
  G.jug.forEach((Q, i) => conJugador(Q, () => pasoJugador(Q, i)));
  const P = G.P,
    vw = VW / G.zoom,
    vh = VH / G.zoom;
  if (G.B) conJugador(masCercano(G.B), updateJefe);
  updateEnemigos();
  updatePoderes();
  G.jug.forEach(Q => {
    if (!Q.caido) conJugador(Q, updateTerreno);
  });
  updateObjetos();
  updateRevivir();
  updateSala();
  G.pt.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.93;
    p.vy = p.vy * 0.93 + p.g;
    p.l--;
  });
  G.pt = G.pt.filter(p => p.l > 0);
  if (G.pt.length > tope()) G.pt.splice(0, G.pt.length - tope());
  G.ghosts.forEach(g => g.l--);
  G.ghosts = G.ghosts.filter(g => g.l > 0);
  G.rings.forEach(r => r.l--);
  G.rings = G.rings.filter(r => r.l > 0);
  G.decals.forEach(d => d.l--);
  G.decals = G.decals.filter(d => d.l > 0);
  G.nums.forEach(n => {
    n.y -= 0.45;
    n.l--;
  });
  G.nums = G.nums.filter(n => n.l > 0);
  if (G.banner) G.banner.t++;
  if (G.aviso && --G.aviso.l <= 0) G.aviso = null;
  if (!G.U && !(G.B && G.B.dead)) G.dark = Math.max(0, G.dark - 0.04);
  const B = G.B;
  let focus;
  if (G.intro || (B && B.dead && B.dt < 170)) focus = { x: B.x, y: B.y - 30 };
  else if (G.U) focus = G.U.t < 55 ? G.U.own || P : G.U.foco;
  else if (G.coop) {
    const cc = camaraCoop();
    focus = cc.focus;
    if (!(B && B.dead)) G.zt = cc.zoom;
  } else {
    focus = { x: P.x + (P.ax - P.x) * 0.22, y: P.y - 14 + (P.ay - P.y) * 0.22 };
    if (B && !B.dead) {
      focus.x = focus.x * 0.7 + B.x * 0.3;
      focus.y = focus.y * 0.7 + (B.y - B.z - 30) * 0.3;
    }
  }
  G.cam.x += (focus.x - G.cam.x) * 0.1;
  G.cam.y += (focus.y - G.cam.y) * 0.1;
  G.zoom += (G.zt - G.zoom) * 0.1;
  if (!G.U && !(B && B.dead) && !G.intro && !G.coop) G.zt += (zb() - G.zt) * 0.05;
  G.cam.x = Math.max(vw / 2, Math.min(WW - vw / 2, G.cam.x));
  G.cam.y = Math.max(vh / 2, Math.min(WH - vh / 2, G.cam.y));
  G.shake *= 0.86;
  if (G.flash > 0) G.flash--;
}
let last = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (!running || !G) return;
  medirCuadro(now - (last || now));
  const el = Math.min(50, now - (last || now));
  last = now;
  if (G.stop > 0) {
    G.stop--;
    render();
    return;
  }
  G.acc += (G.slow * el) / 16.67;
  let n = 0;
  while (G.acc >= 1 && n < 4) {
    step();
    G.acc--;
    n++;
  }
  render();
}
function end(win) {
  if (!running) return;
  running = false;
  cv.style.filter = '';
  musica(win ? 'victoria' : null);
  const s = Math.round((performance.now() - G.start) / 1000),
    antes = VESTUARIOS.filter(desbloqueado).length;
  if (win) {
    guardarLogro('cenizas');
    const g = LOGROS.ganadores || [];
    if (!g.includes(PERS().id)) guardarLogro('ganadores', g.concat([PERS().id]));
  }
  const nuevos = VESTUARIOS.filter(desbloqueado).length - antes;
  document.getElementById('endTitle').textContent = win ? '¡La mazmorra es tuya!' : 'Caíste';
  document.getElementById('endText').textContent = win
    ? (G.dif.id == 'pesadilla' ? '¡En Pesadilla! ' : '') +
      'Venciste a los tres jefes en ' +
      Math.floor(s / 60) +
      ' min ' +
      (s % 60) +
      ' s y derrotaste a ' +
      G.kills +
      ' enemigos.' +
      (nuevos ? ' Desbloqueaste un vestuario nuevo.' : '')
    : 'Llegaste a ' +
      ZONAS[G.zona].n +
      ' (' +
      (G.zona + 1) +
      ' de ' +
      ZONAS.length +
      '). Rueda a través de las balas: mientras ruedas no te tocan.';
  finAlInvitado(
    document.getElementById('endTitle').textContent,
    document.getElementById('endText').textContent,
  );
  document.getElementById('endScr').hidden = false;
  document.getElementById('againBtn').focus();
}
function pantallaCompleta() {
  if (!coarse) return;
  try {
    const e = document.documentElement,
      p = e.requestFullscreen ? e.requestFullscreen() : null;
    if (p && p.then) p.then(() => screen.orientation?.lock?.('landscape').catch(() => {})).catch(() => {});
  } catch (e) {}
}
function start() {
  pantallaCompleta();
  initAudio();
  precargarMusica();
  newRun();
  entrarZona(0);
  ['menu', 'endScr', 'mejoras', 'elegir'].forEach(id => (document.getElementById(id).hidden = true));
  document.getElementById('tbtns').hidden = !coarse;
  running = true;
  last = 0;
}
