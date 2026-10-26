// Escena viva detrás del menú: el salón de la mazmorra con columnas, estandartes, antorchas que titilan,
// ceniza que cae y tu héroe con su traje sobre un círculo de runas del color de su grimorio.
const fondoMenu = document.getElementById('fondoMenu'),
  fm = fondoMenu.getContext('2d');
let escena = { W: 320, H: 180, t: 0, cenizas: [], piso: [] };

function medirEscena() {
  const wr = document.getElementById('wrap'),
    asp = (wr.clientWidth || 960) / (wr.clientHeight || 540),
    W = asp >= 1 ? Math.round(180 * asp) : 180,
    H = asp >= 1 ? 180 : Math.round(180 / asp);
  if (W == escena.W && H == escena.H && escena.piso.length) return;
  fondoMenu.width = W;
  fondoMenu.height = H;
  fm.imageSmoothingEnabled = false;
  escena.W = W;
  escena.H = H;
  escena.piso = [];
  for (let i = 0; i < 400; i++) escena.piso.push(Math.floor(Math.random() * R.floors.length));
  escena.cenizas = [...Array(70)].map(() => nuevaCeniza(true));
}
function nuevaCeniza(enCualquierLado) {
  const brasa = Math.random() < 0.3;
  return {
    x: Math.random() * escena.W,
    y: enCualquierLado ? Math.random() * escena.H : brasa ? escena.H + 4 : -4,
    v: brasa ? -rnd(0.15, 0.4) : rnd(0.1, 0.3),
    d: rnd(0, 6),
    brasa,
  };
}

function pintarEscena() {
  const { W, H } = escena,
    t = ++escena.t,
    muro = Math.round(H * (W >= H ? 0.44 : 0.42)),
    pies = Math.round(H * (W >= H ? 0.6 : 0.56)),
    deriva = Math.sin(t * 0.004) * 6;
  fm.fillStyle = '#0b0812';
  fm.fillRect(0, 0, W, H);
  // Piso de baldosas y muro de piedra, con un leve vaivén de cámara.
  let k = 0;
  for (let y = muro; y < H; y += 16)
    for (let x = -16; x < W + 16; x += 16) {
      const f = R.floors[escena.piso[k++ % escena.piso.length]];
      fm.drawImage(atlas, f[0], f[1], 16, 16, Math.round(x + deriva * 0.6), y, 16, 16);
    }
  for (let y = muro - 16; y > -16; y -= 16)
    for (let x = -16; x < W + 16; x += 16) {
      fm.drawImage(atlas, R.wallMid[0], R.wallMid[1], 16, 16, Math.round(x + deriva * 0.3), y, 16, 16);
    }
  fm.fillStyle = 'rgba(0,0,0,.35)';
  fm.fillRect(0, muro - 4, W, 6);
  // Columnas con antorchas, y estandartes entre ellas.
  const paso = 96,
    inicio = ((W / 2) % paso) - paso / 2;
  for (let x = inicio; x < W + paso; x += paso) {
    const cx = Math.round(x + deriva * 0.3);
    if (Math.abs(cx + 8 - W / 2) < 40) continue;
    fm.drawImage(atlas, 80, 80, 16, 48, cx, muro - 44, 16, 48);
    const b = Math.floor(x / paso) % 2 ? R.bannerRed : R.bannerBlue;
    fm.drawImage(atlas, b[0], b[1], 16, 16, cx + 40, muro - 40, 16, 16);
  }
  // Penumbra: todo se oscurece y solo las antorchas y el círculo dan luz.
  fm.fillStyle = 'rgba(6,2,12,.62)';
  fm.fillRect(0, 0, W, H);
  for (let x = inicio; x < W + paso; x += paso) {
    const cx = Math.round(x + deriva * 0.3);
    if (Math.abs(cx + 8 - W / 2) < 40) continue;
    const fl = Math.sin(t * 0.3 + x) * 1.2,
      tx = cx + 8,
      ty = muro - 30;
    fm.fillStyle = '#5a4030';
    fm.fillRect(tx - 1, ty + 6, 3, 6);
    fm.fillStyle = '#ff8a2a';
    fm.fillRect(tx - 3, ty - 2 + fl, 7, 8);
    fm.fillStyle = '#ffe94a';
    fm.fillRect(tx - 1, ty + 1 + fl, 3, 4);
    luzEscena(tx, ty, 54 + fl * 3, 'rgba(255,138,42,.34)');
  }
  // Tu héroe sobre el círculo de runas.
  const P = PERSONAJES[ELEGIDO.p] || PERSONAJES[0],
    g = grimorio(grimorioDe({ pid: ELEGIDO.p })) || { c: '#5ee7ff' },
    cx = Math.round(W / 2),
    s = P[ELEGIDO.sexo] || P.f;
  luzEscena(cx, pies - 20, 70, 'rgba(255,255,255,.08)');
  fm.save();
  fm.translate(cx, pies);
  fm.scale(1, 0.32);
  fm.strokeStyle = g.c;
  fm.globalAlpha = 0.75;
  fm.lineWidth = 2;
  fm.setLineDash([6, 4]);
  fm.lineDashOffset = -t * 0.3;
  fm.beginPath();
  fm.arc(0, 0, 34, 0, 7);
  fm.stroke();
  fm.setLineDash([]);
  fm.globalAlpha = 0.35;
  fm.beginPath();
  fm.arc(0, 0, 26, 0, 7);
  fm.stroke();
  fm.restore();
  fm.globalAlpha = 1;
  luzEscena(cx, pies, 40, g.c + '55');
  const fr = s.spr.idle[Math.floor(t / 10) % 4],
    src = atlasVestuario(ELEGIDO.vest);
  dibujarTraje(fm, ELEGIDO.vest, cx, pies, 1, 2, t, 0);
  fm.drawImage(src, fr[0], fr[1], fr[2], fr[3], cx - fr[2], pies - fr[3] * 2, fr[2] * 2, fr[3] * 2);
  dibujarTraje(fm, ELEGIDO.vest, cx, pies, 1, 2, t, 1);
  if (t % 6 == 0)
    escena.cenizas.push({ x: cx + rnd(-14, 14), y: pies - rnd(0, 10), v: -rnd(0.3, 0.6), d: 0, aura: g.c });
  // Ceniza que cae, brasas que suben y el aura del grimorio.
  escena.cenizas.forEach(c => {
    c.y += c.v;
    c.d += 0.03;
    c.x += Math.sin(c.d) * 0.2;
    fm.fillStyle = c.aura || (c.brasa ? '#ff8a2a' : '#8a7a9a');
    fm.globalAlpha = c.aura ? 0.8 : c.brasa ? 0.9 : 0.6;
    fm.fillRect(Math.round(c.x), Math.round(c.y), 1, 1);
  });
  fm.globalAlpha = 1;
  escena.cenizas = escena.cenizas.filter(c => (c.aura ? c.y > pies - 70 : c.y > -6 && c.y < H + 6));
  while (escena.cenizas.filter(c => !c.aura).length < 70) escena.cenizas.push(nuevaCeniza(false));
  // Viñeta: los bordes se pierden en la oscuridad.
  const v = fm.createRadialGradient(W / 2, H * 0.55, H * 0.2, W / 2, H * 0.55, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(5,0,10,0)');
  v.addColorStop(1, 'rgba(5,0,10,.85)');
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
}
requestAnimationFrame(bucleEscena);
addEventListener('resize', () => (escena.piso = []));
