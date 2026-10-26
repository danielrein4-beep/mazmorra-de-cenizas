// Escena viva detrás del menú, en capas que se mueven distinto al mover el ratón (o inclinar el teléfono):
// cielo con estrellas y luna, la Torre de cien pisos a lo lejos con su luz roja en la cima, montañas,
// los muros de la mazmorra a los lados, el piso, niebla y brasas cerca de la cámara. Tu héroe va en
// grande (escena-heroe.js) y del logo saltan chispas.
const fondoMenu = document.getElementById('fondoMenu'),
  fm = fondoMenu.getContext('2d');
let escena = {
  W: 320,
  H: 180,
  t: 0,
  cenizas: [],
  piso: [],
  estrellas: [],
  montes: [],
  px: 0,
  py: 0,
  ox: 0,
  oy: 0,
};

function medirEscena() {
  const wr = document.getElementById('wrap'),
    asp = (wr.clientWidth || 960) / (wr.clientHeight || 540),
    W = asp >= 1 ? Math.round(180 * asp) : 180,
    H = asp >= 1 ? 180 : Math.round(180 / asp);
  if (W == escena.W && H == escena.H && escena.piso.length) return;
  fondoMenu.width = W;
  fondoMenu.height = H;
  fm.imageSmoothingEnabled = false;
  Object.assign(escena, { W, H, piso: [], estrellas: [], montes: [] });
  for (let i = 0; i < 400; i++) escena.piso.push(Math.floor(Math.random() * R.floors.length));
  for (let i = 0; i < 90; i++)
    escena.estrellas.push({
      x: Math.random() * (W + 40) - 20,
      y: Math.random() * H * 0.5,
      f: rnd(0, 6),
      s: Math.random() < 0.15 ? 2 : 1,
    });
  // Dos cordilleras: la lejana más alta y clara, la cercana más baja y oscura.
  [0.42, 0.5].forEach((base, capa) => {
    const pts = [];
    for (let x = -30; x <= W + 30; x += 10)
      pts.push([
        x,
        H * base - Math.abs(Math.sin(x * 0.03 + capa * 2)) * H * (0.1 - capa * 0.03) - Math.random() * 6,
      ]);
    escena.montes.push(pts);
  });
  escena.cenizas = [...Array(80)].map(() => nuevaCeniza(true));
}
function nuevaCeniza(enCualquierLado) {
  const brasa = Math.random() < 0.35,
    cerca = Math.random() < 0.15;
  return {
    x: Math.random() * escena.W,
    y: enCualquierLado ? Math.random() * escena.H : brasa ? escena.H + 4 : -4,
    v: (brasa ? -rnd(0.15, 0.45) : rnd(0.1, 0.3)) * (cerca ? 1.8 : 1),
    d: rnd(0, 6),
    brasa,
    cerca,
  };
}

// Paralaje: el ratón (o la inclinación del teléfono) corre las capas; lo lejano se mueve poco.
addEventListener('pointermove', e => {
  escena.px = (e.clientX / innerWidth - 0.5) * 2;
  escena.py = (e.clientY / innerHeight - 0.5) * 2;
});
addEventListener('deviceorientation', e => {
  if (e.gamma == null) return;
  escena.px = Math.max(-1, Math.min(1, e.gamma / 25));
  escena.py = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
});
const capa = k => [Math.round(-escena.ox * k * 14), Math.round(-escena.oy * k * 6)];

function pintarCielo(W, H, t) {
  const g = fm.createLinearGradient(0, 0, 0, H * 0.55);
  g.addColorStop(0, '#07051a');
  g.addColorStop(0.55, '#24102e');
  g.addColorStop(1, '#5a1a22');
  fm.fillStyle = g;
  fm.fillRect(0, 0, W, H);
  const [sx, sy] = capa(0.15);
  escena.estrellas.forEach(e => {
    fm.globalAlpha = 0.4 + Math.sin(t * 0.05 + e.f) * 0.35;
    fm.fillStyle = e.s > 1 ? '#fff3c0' : '#c3b6d9';
    fm.fillRect(Math.round(e.x + sx), Math.round(e.y + sy), e.s, e.s);
  });
  // Luna grande con su halo.
  const [lx, ly] = capa(0.1),
    mx = Math.round(W * 0.78 + lx),
    my = Math.round(H * 0.16 + ly);
  fm.globalAlpha = 1;
  luzEscena(mx, my, 60, 'rgba(255,233,200,.18)');
  fm.fillStyle = '#f2e6d0';
  fm.beginPath();
  fm.arc(mx, my, 15, 0, 7);
  fm.fill();
  fm.fillStyle = '#d9c9b0';
  [
    [-5, -3, 3],
    [4, 4, 4],
    [5, -6, 2],
  ].forEach(([a, b, r]) => {
    fm.beginPath();
    fm.arc(mx + a, my + b, r, 0, 7);
    fm.fill();
  });
}
function pintarMontes(W, H) {
  escena.montes.forEach((pts, i) => {
    const [sx, sy] = capa(0.2 + i * 0.15);
    fm.fillStyle = i ? '#140a1c' : '#21102a';
    fm.beginPath();
    fm.moveTo(-40, H);
    pts.forEach(([x, y]) => fm.lineTo(x + sx, y + sy));
    fm.lineTo(W + 40, H);
    fm.fill();
    // La Torre se alza entre las dos cordilleras.
    if (!i) pintarTorre(W, H);
  });
}
// La Torre de cien pisos: silueta escalonada, ventanas que titilan y la luz roja del Dragón en la cima.
function pintarTorre(W, H) {
  const t = escena.t,
    [sx, sy] = capa(0.25),
    cx = Math.round(W * 0.6 + sx),
    base = Math.round(H * 0.5 + sy),
    alto = Math.round(H * 0.42);
  fm.fillStyle = '#0e0616';
  for (let i = 0; i < 6; i++) {
    const y0 = base - (alto * i) / 6,
      ancho = 26 - i * 3;
    fm.fillRect(cx - ancho / 2, y0 - alto / 6 - 1, ancho, alto / 6 + 1);
    fm.fillRect(cx - ancho / 2 - 2, y0 - 3, ancho + 4, 3);
  }
  fm.beginPath();
  fm.moveTo(cx - 6, base - alto);
  fm.lineTo(cx, base - alto - 14);
  fm.lineTo(cx + 6, base - alto);
  fm.fill();
  for (let i = 0; i < 14; i++) {
    const piso = i % 6,
      lado = i % 3,
      y = base - (alto * piso) / 6 - 8,
      x = cx - 8 + lado * 6 + piso;
    fm.globalAlpha = 0.55 + Math.sin(t * 0.07 + i * 1.7) * 0.4;
    fm.fillStyle = i % 4 ? '#ffb04a' : '#ff5a1a';
    fm.fillRect(Math.round(x), Math.round(y), 1, 2);
  }
  fm.globalAlpha = 1;
  const pulso = 0.5 + Math.sin(t * 0.06) * 0.5;
  luzEscena(cx, base - alto - 12, 22 + pulso * 10, 'rgba(255,40,60,' + (0.25 + pulso * 0.2) + ')');
  fm.fillStyle = '#ff2a4a';
  fm.fillRect(cx - 1, base - alto - 13, 2, 2);
}
// Los muros de la mazmorra a los lados (enmarcan la vista al cielo) y el piso de baldosas.
function pintarMazmorra(W, H, t) {
  const suelo = Math.round(H * 0.58),
    [sx] = capa(0.6),
    lado = Math.round(Math.min(W * (W > H ? 0.2 : 0.1), 70));
  let k = 0;
  for (let y = suelo; y < H; y += 16)
    for (let x = -32; x < W + 32; x += 16) {
      const f = R.floors[escena.piso[k++ % escena.piso.length]];
      fm.drawImage(atlas, f[0], f[1], 16, 16, Math.round(x + sx), y, 16, 16);
    }
  const piso = fm.createLinearGradient(0, suelo, 0, H);
  piso.addColorStop(0, 'rgba(20,6,24,.75)');
  piso.addColorStop(1, 'rgba(6,2,12,.35)');
  fm.fillStyle = piso;
  fm.fillRect(0, suelo, W, H - suelo);
  [
    [-40, lado],
    [W - lado, W + 40],
  ].forEach(([x0, x1], i) => {
    for (let y = suelo - 16; y > -16; y -= 16)
      for (let x = x0; x < x1; x += 16)
        fm.drawImage(atlas, R.wallMid[0], R.wallMid[1], 16, 16, Math.round(x + sx), y, 16, 16);
    fm.fillStyle = 'rgba(6,2,12,.55)';
    fm.fillRect(Math.round(x0 + sx), 0, x1 - x0, suelo);
    // Antorcha en cada muro.
    const tx = Math.round((i ? x0 + 14 : x1 - 14) + sx),
      ty = Math.round(suelo * 0.55),
      fl = Math.sin(t * 0.3 + i) * 1.2;
    fm.fillStyle = '#5a4030';
    fm.fillRect(tx - 1, ty + 6, 3, 7);
    fm.fillStyle = '#ff8a2a';
    fm.fillRect(tx - 3, ty - 2 + fl, 7, 8);
    fm.fillStyle = '#ffe94a';
    fm.fillRect(tx - 1, ty + 1 + fl, 3, 4);
    luzEscena(tx, ty, 50 + fl * 3, 'rgba(255,138,42,.38)');
  });
}
// Niebla que se arrastra por el piso.
function pintarNiebla(W, H, t) {
  const [sx] = capa(0.9);
  for (let i = 0; i < 4; i++) {
    const x = ((t * (0.08 + i * 0.03) + i * 120) % (W + 160)) - 80 + sx,
      y = H * (0.62 + i * 0.08);
    fm.globalAlpha = 0.08;
    fm.fillStyle = '#c3b6d9';
    fm.beginPath();
    fm.ellipse(x, y, 90, 10, 0, 0, 7);
    fm.fill();
  }
  fm.globalAlpha = 1;
}
// Chispas doradas que saltan del logo (su lugar en la pantalla se pasa a la escena).
function chispasLogo(W, H) {
  const L = document.querySelector('#menu .logo-a'),
    wr = document.getElementById('wrap');
  if (!L || escena.t % 3) return;
  const a = L.getBoundingClientRect(),
    b = wr.getBoundingClientRect();
  if (!a.width) return;
  escena.cenizas.push({
    x: ((a.left - b.left + Math.random() * a.width) / b.width) * W,
    y: ((a.bottom - b.top - Math.random() * a.height * 0.5) / b.height) * H,
    v: -rnd(0.2, 0.6),
    d: rnd(0, 6),
    chispa: 1,
    vida: 40,
  });
}

function pintarEscena() {
  const { W, H } = escena,
    t = ++escena.t;
  // La cámara sigue al ratón con suavidad.
  escena.ox += (escena.px - escena.ox) * 0.05;
  escena.oy += (escena.py - escena.oy) * 0.05;
  pintarCielo(W, H, t);
  pintarMontes(W, H);
  pintarMazmorra(W, H, t);
  pintarNiebla(W, H, t);
  pintarHeroeMenu(W, H, t);
  chispasLogo(W, H);
  // Ceniza que cae, brasas que suben, chispas del logo y el aura del grimorio.
  escena.cenizas.forEach(c => {
    c.y += c.v;
    c.d += 0.03;
    c.x += Math.sin(c.d) * 0.2;
    if (c.vida) c.vida--;
    const [sx, sy] = capa(c.cerca ? 1.4 : 0.8),
      s = c.cerca || c.chispa ? 2 : 1;
    fm.fillStyle = c.chispa
      ? c.vida % 6 < 3
        ? '#ffe94a'
        : '#ffffff'
      : c.aura || (c.brasa ? '#ff8a2a' : '#8a7a9a');
    fm.globalAlpha = c.chispa ? c.vida / 40 : c.aura ? 0.85 : c.brasa ? 0.9 : 0.55;
    fm.fillRect(
      Math.round(c.x + (c.chispa || c.aura ? 0 : sx)),
      Math.round(c.y + (c.chispa || c.aura ? 0 : sy)),
      s,
      s,
    );
  });
  fm.globalAlpha = 1;
  escena.cenizas = escena.cenizas.filter(c =>
    c.chispa ? c.vida > 0 : c.aura ? c.y > c.tope : c.y > -6 && c.y < H + 6,
  );
  while (escena.cenizas.filter(c => !c.aura && !c.chispa).length < 80)
    escena.cenizas.push(nuevaCeniza(false));
  // Viñeta: los bordes se pierden en la oscuridad.
  const v = fm.createRadialGradient(W / 2, H * 0.5, H * 0.25, W / 2, H * 0.5, Math.max(W, H) * 0.8);
  v.addColorStop(0, 'rgba(5,0,10,0)');
  v.addColorStop(1, 'rgba(5,0,10,.8)');
  fm.fillStyle = v;
  fm.fillRect(0, 0, W, H);
}
function luzEscena(x, y, r, c) {
  const g = fm.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  fm.globalCompositeOperation = 'lighter';
  fm.fillStyle = g;
  fm.fillRect(x - r, y - r, r * 2, r * 2);
  fm.globalCompositeOperation = 'source-over';
}

// Se dibuja a unos 30 cuadros por segundo solo mientras no estás jugando.
let ultimoCuadroEscena = 0;
function bucleEscena(ahora) {
  requestAnimationFrame(bucleEscena);
  // Solo fuera de la partida: en la pausa y al elegir poder se sigue viendo el juego detrás.
  const ver = !running && document.getElementById('mejoras').hidden;
  fondoMenu.hidden = !ver;
  if (!ver || !atlas.complete || ahora - ultimoCuadroEscena < 33) return;
  ultimoCuadroEscena = ahora;
  medirEscena();
  pintarEscena();
  if (escena.t % 60 == 1) pintarNoticiasMenu();
}
requestAnimationFrame(bucleEscena);
addEventListener('resize', () => (escena.piso = []));
