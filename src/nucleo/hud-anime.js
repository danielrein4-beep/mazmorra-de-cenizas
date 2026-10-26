// Toques de anime en la pelea: el retrato del héroe reacciona (golpe, poca vida, furia llena, racha de
// enemigos), la entrada de cada jefe es un «VS» con los dos en grande, y el golpe final abre con un corte
// en el que tu héroe cruza la pantalla.

// --- Retrato que reacciona -------------------------------------------------------------------------
// Racha: cuántos enemigos cayeron en los últimos segundos (para la cara de alegría).
let rachaKills = { n: 0, t: 0, alegre: 0 };
function seguirRacha(t) {
  const k = G.kills || 0;
  if (k > rachaKills.n) {
    if (t - rachaKills.t < 90) rachaKills.cuenta = (rachaKills.cuenta || 0) + (k - rachaKills.n);
    else rachaKills.cuenta = k - rachaKills.n;
    rachaKills.t = t;
    if (rachaKills.cuenta >= 3) rachaKills.alegre = 70;
  }
  rachaKills.n = k;
  if (rachaKills.alegre > 0) rachaKills.alegre--;
}
// Cuánto tiembla el retrato: mucho al recibir un golpe, poquito con poca vida.
function temblorRetrato(P, t) {
  if (P.hurt > 0) return [rnd(-3, 3), rnd(-2, 2)];
  if (P.hp <= 2 && P.hp > 0) return [Math.sin(t * 0.9) * 1, 0];
  return [0, 0];
}
// Lo que se dibuja encima del retrato (x, y, lado: la caja de 52 px).
function drawCaraRetrato(P, x, y, lado, t) {
  if (P === G.P) seguirRacha(t);
  o.save();
  if (P.hurt > 0) {
    // Golpe: destello rojo y líneas de impacto.
    o.globalAlpha = (P.hurt / 20) * 0.55;
    o.fillStyle = '#ff2a4a';
    o.fillRect(x, y, lado, lado);
    o.globalAlpha = 1;
    o.strokeStyle = '#ffffff';
    o.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3 + t * 0.2;
      o.beginPath();
      o.moveTo(x + lado / 2 + Math.cos(a) * 22, y + lado / 2 + Math.sin(a) * 22);
      o.lineTo(x + lado / 2 + Math.cos(a) * 32, y + lado / 2 + Math.sin(a) * 32);
      o.stroke();
    }
  } else if (P.meter >= 100) {
    // Furia llena: borde dorado que late y una vena de rabia.
    o.globalAlpha = 0.5 + Math.sin(t * 0.3) * 0.3;
    o.strokeStyle = '#ffd24a';
    o.lineWidth = 3;
    o.strokeRect(x - 2, y - 2, lado + 4, lado + 4);
    o.globalAlpha = 1;
    venaRabia(x + lado - 12, y + 10, 1 + Math.sin(t * 0.4) * 0.15);
  } else if (rachaKills.alegre > 0 && P === G.P) {
    // Racha de enemigos: estrellitas.
    for (let i = 0; i < 3; i++) {
      const a = t * 0.1 + i * 2.1;
      estrellita(x + lado / 2 + Math.cos(a) * 26, y + lado / 2 + Math.sin(a) * 22, 4 + (i % 2) * 2);
    }
  }
  if (P.hp <= 2 && P.hp > 0 && !(P.hurt > 0)) {
    // Poca vida: gota de sudor y el retrato pálido.
    o.globalAlpha = 0.25;
    o.fillStyle = '#5ee7ff';
    o.fillRect(x, y, lado, lado);
    o.globalAlpha = 1;
    gotaSudor(x + lado - 10, y + 8 + ((t * 0.3) % 10));
  }
  o.restore();
}
function venaRabia(x, y, k) {
  o.strokeStyle = '#ff2a4a';
  o.lineWidth = 3;
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].forEach(([a, b]) => {
    o.beginPath();
    o.moveTo(x + a * 2 * k, y + b * 2 * k);
    o.quadraticCurveTo(x + a * 7 * k, y + b * 2 * k, x + a * 6 * k, y + b * 7 * k);
    o.stroke();
  });
}
function estrellita(x, y, r) {
  o.fillStyle = '#ffe94a';
  o.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4,
      d = i % 2 ? r * 0.4 : r;
    o.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  o.fill();
}
function gotaSudor(x, y) {
  o.fillStyle = '#9af0ff';
  o.beginPath();
  o.moveTo(x, y - 6);
  o.quadraticCurveTo(x + 5, y + 2, x, y + 4);
  o.quadraticCurveTo(x - 5, y + 2, x, y - 6);
  o.fill();
  o.fillStyle = '#ffffff';
  o.fillRect(x - 1, y - 1, 2, 2);
}

// --- Líneas de velocidad y paneles inclinados ------------------------------------------------------------
function lineasVelocidad(cx, cy, r0, r1, n, c, al) {
  o.strokeStyle = c;
  o.globalAlpha = al;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283,
      g = Math.random() < 0.3 ? 3 : 1;
    o.lineWidth = g;
    o.beginPath();
    o.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    o.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    o.stroke();
  }
  o.globalAlpha = 1;
}
// Panel inclinado (paralelogramo) con un sprite en grande adentro.
function panelConSprite(img, fr, x, y, an, al, incl, fondo, borde, escala, voltear) {
  o.save();
  o.beginPath();
  o.moveTo(x + incl, y);
  o.lineTo(x + an + incl, y);
  o.lineTo(x + an - incl, y + al);
  o.lineTo(x - incl, y + al);
  o.closePath();
  o.fillStyle = fondo;
  o.fill();
  o.clip();
  const w2 = fr[2] * escala,
    h2 = fr[3] * escala;
  o.imageSmoothingEnabled = false;
  o.translate(x + an / 2, y + al - h2 * 0.15);
  if (voltear) o.scale(-1, 1);
  o.drawImage(img, fr[0], fr[1], fr[2], fr[3], -w2 / 2, -h2, w2, h2);
  o.restore();
  o.strokeStyle = borde;
  o.lineWidth = 4;
  o.beginPath();
  o.moveTo(x + incl, y);
  o.lineTo(x + an + incl, y);
  o.lineTo(x + an - incl, y + al);
  o.lineTo(x - incl, y + al);
  o.closePath();
  o.stroke();
}

// --- Entrada del jefe: «VS» -----------------------------------------------------------------------------
function drawEntradaJefe(B, t) {
  const P = G.P,
    c = B.def.color || B.def.tono || '#ff2a4a',
    k = Math.min(1, t / 14),
    sale = t > 100 ? (t - 100) / 20 : 0,
    temblor = t > 40 && t < 56 ? rnd(-6, 6) : 0;
  o.save();
  o.globalAlpha = 1 - sale;
  o.fillStyle = 'rgba(8,2,12,.82)';
  o.fillRect(0, 0, OW, OH);
  lineasVelocidad(OW / 2, OH / 2, 160, Math.max(OW, OH), 40, '#ffffff', 0.18 * (1 - sale));
  // Franja diagonal del color del jefe de lado a lado.
  o.fillStyle = c;
  o.globalAlpha = 0.85 * (1 - sale);
  o.beginPath();
  o.moveTo(0, OH * 0.62);
  o.lineTo(OW * k, OH * 0.5);
  o.lineTo(OW * k, OH * 0.58);
  o.lineTo(0, OH * 0.7);
  o.fill();
  o.globalAlpha = 1 - sale;
  const al = Math.min(OH * 0.62, 380),
    an = Math.min(OW * 0.3, 360),
    y = OH * 0.14,
    entraL = (1 - k) * -OW * 0.5,
    entraR = (1 - k) * OW * 0.5;
  // Tu héroe a la izquierda, el jefe a la derecha (los dos en grande).
  const frP = P.spr.idle[Math.floor(G.t / 12) % 4];
  panelConSprite(
    P.src,
    frP,
    OW * 0.08 + entraL,
    y,
    an,
    al,
    30,
    '#1a1030',
    '#5ee7ff',
    (al * 0.9) / frP[3],
    false,
  );
  const frB = B.def.idle[Math.floor(G.t / 10) % B.def.idle.length],
    imgB = B.def.cuerpo ? atlasTono(B.def.cuerpo) : atlas;
  panelConSprite(
    imgB,
    frB,
    OW * 0.92 - an + entraR + temblor,
    y,
    an,
    al,
    30,
    '#1a0608',
    c,
    (al * 0.95) / frB[3],
    true,
  );
  // VS en el medio, con un golpe de tamaño cuando el jefe ruge.
  const vs = t < 40 ? Math.min(1, t / 20) : t < 50 ? 1.4 - (t - 40) * 0.04 : 1;
  o.save();
  o.translate(OW / 2 + temblor, y + al * 0.45);
  o.scale(vs, vs);
  txt('VS', 0, 30, 96, '#ffe94a', 'center', 1);
  o.restore();
  // Nombre, título y frase del jefe.
  const nx = OW / 2,
    ny = y + al + 52;
  txt(B.def.n.toUpperCase(), nx + entraR * 0.2, ny, 50, '#ffffff', 'center', 1);
  txt(B.def.sub, nx, ny + 32, 20, c, 'center');
  if (FRASES_JEFE[B.id]) txt('«' + FRASES_JEFE[B.id] + '»', nx, ny + 60, 16, '#f1e9ff', 'center');
  o.restore();
}

// --- Corte de anime al lanzar el golpe final ----------------------------------------------------------
function drawCorteAnime(U) {
  const P = U.own || G.P,
    c = ULT[U.id].c,
    t = U.t,
    entra = Math.min(1, t / 8),
    sale = t > 44 ? (t - 44) / 11 : 0,
    al = Math.min(220, OH * 0.34),
    y = OH / 2 - al / 2;
  o.save();
  o.globalAlpha = 1 - sale;
  // Franja que cruza la pantalla, con líneas de velocidad horizontales.
  o.fillStyle = '#0b0004';
  o.fillRect(0, y - 8, OW * entra, al + 16);
  o.fillStyle = c;
  o.fillRect(0, y - 8, OW * entra, 5);
  o.fillRect(0, y + al + 3, OW * entra, 5);
  o.beginPath();
  o.rect(0, y, OW * entra, al);
  o.clip();
  o.strokeStyle = '#ffffff';
  for (let i = 0; i < 26; i++) {
    const ly = y + Math.random() * al,
      lx = Math.random() * OW;
    o.globalAlpha = (0.15 + Math.random() * 0.25) * (1 - sale);
    o.lineWidth = Math.random() < 0.3 ? 3 : 1;
    o.beginPath();
    o.moveTo(lx, ly);
    o.lineTo(lx + 120 + Math.random() * 200, ly);
    o.stroke();
  }
  o.globalAlpha = 1 - sale;
  // El héroe en grande, de cerca (la cara llena la franja) y deslizándose.
  // Recorte de la cabeza y el pecho (como en el retrato), para que la cara quede al centro de la franja.
  const fr = P.spr.idle[0],
    esc = (al * 1.15) / 13,
    hx = OW * 0.3 + (1 - entra) * -OW * 0.4 + t * 1.2;
  o.imageSmoothingEnabled = false;
  o.drawImage(P.src, fr[0], fr[1] + 8, 16, 13, hx - 8 * esc, y - al * 0.05, 16 * esc, 13 * esc);
  // Destello en los ojos.
  if (t > 10 && t < 30) {
    o.globalAlpha = (1 - Math.abs(t - 20) / 10) * (1 - sale);
    estrellita(hx + 2 * esc, y + al * 0.45, 18);
  }
  o.restore();
  o.globalAlpha = 1 - sale;
  txt(ULT[U.id].n.toUpperCase(), OW * 0.7 + (1 - entra) * 300, OH / 2 + 20, 56, '#ffffff', 'center', 1);
  o.globalAlpha = 1;
}
