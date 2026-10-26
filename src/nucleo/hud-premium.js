// Pantalla de juego con el estilo del menú: marcos de pixel con remaches, panel del héroe con retrato,
// barra de técnicas con recarga en círculo, panel de zona y barra del jefe con el daño que se va borrando.
const MARCOS_HUD = {};
// Marcos dibujados una vez (los mismos colores que los paneles y botones del menú).
function marcoHud(tipo) {
  if (MARCOS_HUD[tipo]) return MARCOS_HUD[tipo];
  const C = {
    panel: ['#120c1c', '#2a1e3a', '#3a2a4e', '#08050e', '#a07010'],
    tile: ['#160f22', '#3a2a4e', '#4e4070', '#0b0812', '#6a4cff'],
    sel: ['#2a1e10', '#ffd24a', '#ffe9a0', '#a07010', '#ffffff'],
    jefe: ['#1a0810', '#5a1020', '#7a2a3a', '#0b0004', '#ffd24a'],
  }[tipo];
  return (MARCOS_HUD[tipo] = lienzoMarco(...C));
}
// Nueve partes: esquinas fijas, bordes estirados y centro relleno, todo a escala 2 para que se vea pixelado.
function marco(tipo, x, y, w, h, alfa) {
  const m = marcoHud(tipo),
    s = 6,
    d = 12;
  x = Math.round(x);
  y = Math.round(y);
  o.globalAlpha = alfa || 0.92;
  const pz = (sx, sy, sw, sh, dx, dy, dw, dh) =>
    dw > 0 && dh > 0 && o.drawImage(m, sx, sy, sw, sh, dx, dy, dw, dh);
  pz(0, 0, s, s, x, y, d, d);
  pz(18 - s, 0, s, s, x + w - d, y, d, d);
  pz(0, 18 - s, s, s, x, y + h - d, d, d);
  pz(18 - s, 18 - s, s, s, x + w - d, y + h - d, d, d);
  pz(s, 0, 18 - 2 * s, s, x + d, y, w - 2 * d, d);
  pz(s, 18 - s, 18 - 2 * s, s, x + d, y + h - d, w - 2 * d, d);
  pz(0, s, s, 18 - 2 * s, x, y + d, d, h - 2 * d);
  pz(18 - s, s, s, 18 - 2 * s, x + w - d, y + d, d, h - 2 * d);
  pz(s, s, 18 - 2 * s, 18 - 2 * s, x + d, y + d, w - 2 * d, h - 2 * d);
  o.globalAlpha = 1;
}

// Panel del héroe arriba a la izquierda: retrato, corazones, furia, arma y bolsa.
function drawPanelHeroe(P, t) {
  drawFilaReliquias(P, t);
  const corazones = Math.ceil(P.max / 2),
    w = Math.max(268, 92 + corazones * 30),
    h = 128,
    x0 = 10,
    y0 = 10;
  marco('panel', x0, y0, w, h);
  marco('tile', x0 + 10, y0 + 10, 64, 64, 1);
  const fr = P.spr.idle[Math.floor(t / 12) % 4];
  o.save();
  o.beginPath();
  o.rect(x0 + 16, y0 + 16, 52, 52);
  o.clip();
  o.drawImage(P.src, fr[0], fr[1] + 9, 16, 15, x0 + 18, y0 + 20, 48, 45);
  o.restore();
  for (let i = 0; i < corazones; i++) {
    const v = P.hp - i * 2,
      r = v >= 2 ? R.hFull : v == 1 ? R.hHalf : R.hEmpty,
      late = v >= 1 && P.hp <= 2 && t % 30 < 15 ? 2 : 0;
    o.drawImage(
      atlas,
      r[0],
      r[1],
      13,
      12,
      x0 + 84 + i * 30 - late / 2,
      y0 + 14 - late / 2,
      26 + late,
      24 + late,
    );
  }
  // Furia en diez segmentos; llena, late en dorado y dice el nombre del golpe final.
  const lleno = P.meter >= 100,
    fx = x0 + 84,
    fy = y0 + 46,
    fw = w - 98;
  o.fillStyle = '#0b0812';
  o.fillRect(fx, fy, fw, 12);
  for (let i = 0; i < 10; i++) {
    const k = Math.max(0, Math.min(1, P.meter / 10 - i));
    if (!k) continue;
    o.fillStyle = lleno ? (t % 20 < 10 ? '#ffe94a' : '#ff8a2a') : '#c8324a';
    o.fillRect(fx + 2 + (i * (fw - 4)) / 10, fy + 2, ((fw - 4) / 10 - 2) * k, 8);
  }
  txt(
    lleno ? ULT[P.ult].n + (coarse ? '' : ' · Q') : 'Furia',
    fx,
    fy + 28,
    13,
    lleno ? '#ffe94a' : '#c3b6d9',
  );
  // Arma en su casilla y la bolsa (monedas, cenizas ganadas, pócimas y llaves).
  const AI = armaInfo(P.arma);
  marco(AI.raro ? 'sel' : 'tile', x0 + 10, y0 + 80, 38, 38, 1);
  o.save();
  o.translate(x0 + 29, y0 + 99);
  o.rotate(0.785);
  const sk = Math.max(1, Math.floor(24 / Math.max(AI.spr[2], AI.spr[3])));
  o.drawImage(
    atlas,
    AI.spr[0],
    AI.spr[1],
    AI.spr[2],
    AI.spr[3],
    (-AI.spr[2] * sk) / 2,
    (-AI.spr[3] * sk) / 2,
    AI.spr[2] * sk,
    AI.spr[3] * sk,
  );
  o.restore();
  txt(AI.n, x0 + 56, y0 + 96, 13, AI.raro ? '#5ee7ff' : '#f1e9ff');
  let bx = x0 + 56;
  const by = y0 + 104;
  o.drawImage(atlas, 289 + 8 * (Math.floor(t / 8) % 4), 385, 6, 7, bx, by, 12, 14);
  txt('' + P.oro, bx + 16, by + 12, 13, '#ffe94a');
  bx += 58;
  dibujarGema(o, bx + 5, by + 7, 7);
  txt('+' + cenizasDePartida(), bx + 16, by + 12, 13, '#5ee7ff');
  bx += 54;
  o.drawImage(atlas, 288, 352, 16, 16, bx - 2, by - 3, 20, 20);
  txt('x' + P.poc + (!coarse && P.poc ? ' F' : ''), bx + 18, by + 12, 13, P.poc ? '#ff8a9a' : '#8f82a6');
  if (P.llaves) {
    bx += 52;
    o.fillStyle = '#ffe94a';
    o.fillRect(bx, by + 4, 10, 4);
    o.fillRect(bx + 8, by + 1, 6, 10);
    txt('x' + P.llaves, bx + 18, by + 12, 13, '#ffe94a');
  }
}

// Reliquias de la partida debajo del panel del héroe; las que forman sinergia llevan un borde dorado.
function drawFilaReliquias(P, t) {
  const ids = Object.keys(P.rel || {});
  if (!ids.length) return;
  const enSinergia = new Set(SINERGIAS.filter(s => sinergia(P, s.id)).flatMap(s => [s.a, s.b])),
    por = 10;
  ids.forEach((id, i) => {
    const x = 14 + (i % por) * 26,
      y = 146 + Math.floor(i / por) * 26;
    o.fillStyle = 'rgba(10,6,16,.75)';
    o.fillRect(x, y, 24, 24);
    o.strokeStyle = enSinergia.has(id) ? (t % 30 < 15 ? '#ffd24a' : '#ffe9a0') : RAREZA[reliquia(id).r].c;
    o.lineWidth = enSinergia.has(id) ? 2 : 1;
    o.strokeRect(x + 0.5, y + 0.5, 23, 23);
    dibujarReliquia(o, id, x + 12, y + 12, 2);
  });
}

// Panel de la zona arriba a la derecha: minimapa (o la insignia en la Torre) y el nombre del lugar.
function drawPanelZona() {
  const nombre =
      (G.torre ? 'Piso ' + G.piso + ' · ' : '') +
      (G.arena ? 'Arena' : ZONAS[G.zona].n) +
      (G.dif.id == 'pesadilla' ? ' · Pesadilla' : ''),
    mw = G.torre ? 96 : (G.mundo ? G.mundo.W : 5) * 26 + 16,
    w = Math.max(mw + 20, 150),
    x0 = OW - w - 10;
  marco('panel', x0, 10, w, 128);
  if (G.torre) dibujarInsignia(o, G.rangoPartida, x0 + w / 2, 62, 78, G.t);
  else drawMinimapa(x0 + (w - mw) / 2 + 8, 22);
  o.fillStyle = 'rgba(0,0,0,.35)';
  o.fillRect(x0 + 8, 112, w - 16, 20);
  txt(nombre, x0 + w / 2, 127, 12, G.dif.id == 'pesadilla' ? '#ff8a9a' : '#f1e9ff', 'center');
}

// Barra del jefe: marco carmesí con su nombre, la vida y una estela clara del daño reciente.
function drawBarraJefe(B) {
  const libre = OW - 2 * 300,
    arriba = libre >= 320 && !vertical(),
    bw = arriba ? Math.min(480, libre) : Math.min(480, OW - 30),
    bx = OW / 2 - bw / 2,
    by = arriba ? 52 : 150;
  B.vis = B.vis === undefined || B.vis < B.hp ? B.hp : B.vis + (B.hp - B.vis) * 0.04;
  marco('jefe', bx, by, bw, 54);
  txt(B.def.n, OW / 2, by + 24, 15, '#ffe9c0', 'center');
  const x = bx + 14,
    y = by + 32,
    w = bw - 28;
  o.fillStyle = '#2a0810';
  o.fillRect(x, y, w, 12);
  o.fillStyle = '#ffd0d8';
  o.fillRect(x, y, (w * B.vis) / B.max, 12);
  o.fillStyle = B.berserk ? B.def.color || '#ff3a2a' : B.phase > B.def.fases.length ? '#ff3a2a' : '#c8324a';
  o.fillRect(x, y, (w * B.hp) / B.max, 12);
  o.fillStyle = 'rgba(255,255,255,.35)';
  o.fillRect(x, y, (w * B.hp) / B.max, 3);
  B.def.fases.forEach(f => {
    const fx = x + w * f[0];
    o.fillStyle = '#ffd24a';
    o.beginPath();
    o.moveTo(fx, y - 3);
    o.lineTo(fx + 3, y + 6);
    o.lineTo(fx, y + 15);
    o.lineTo(fx - 3, y + 6);
    o.fill();
  });
}

// Barra de técnicas abajo: tres técnicas y el grimorio, con recarga en círculo y su nivel.
function drawBarraTecnicas(P, t) {
  const n = P.tecs.length + (P.grim ? 1 : 0),
    lado = 62,
    hueco = 6,
    w = n * lado + (n - 1) * hueco + 24,
    x0 = 10,
    y0 = OH - lado - 34;
  marco('panel', x0, y0, w, lado + 24);
  P.tecs.forEach((id, i) => {
    const s = TEC[id],
      cdT = Math.round(s.cd * armaInfo(P.arma).cdm * (P.cdm || 1)),
      nv = nivelTec(P, id);
    ranura(x0 + 12 + i * (lado + hueco), y0 + 12, lado, {
      sel: P.spell == i,
      color: s.c,
      dibujo: (cx, cy) => icono(o, id, cx, cy, 3),
      nombre: s.n,
      carga: P.cds[i] > 0 ? P.cds[i] / cdT : 0,
      nivel: nv,
      tecla: coarse ? '' : String(i + 1),
      t,
    });
  });
  if (P.grim) {
    const g = grimorio(P.grim),
      tot = Math.round(CD_HECHIZO / (0.8 + 0.2 * P.hojas));
    ranura(x0 + 12 + P.tecs.length * (lado + hueco), y0 + 12, lado, {
      sel: P.gcd <= 0,
      color: g.c,
      dibujo: (cx, cy) => dibujarGrimorio(o, g, P.hojas, cx, cy, 34, t),
      nombre: 'Grimorio',
      carga: P.gcd > 0 ? P.gcd / tot : 0,
      nivel: 0,
      tecla: coarse ? '' : 'G',
      t,
    });
  }
}
function ranura(x, y, l, r) {
  marco(r.sel ? 'sel' : 'tile', x, y, l, l, 1);
  if (r.sel) {
    o.globalAlpha = 0.18 + Math.sin(r.t * 0.15) * 0.08;
    o.fillStyle = r.color;
    o.fillRect(x + 6, y + 6, l - 12, l - 12);
    o.globalAlpha = 1;
  }
  r.dibujo(x + l / 2, y + l / 2 - 6);
  if (r.carga > 0) {
    const cx = x + l / 2,
      cy = y + l / 2;
    o.fillStyle = 'rgba(0,0,0,.6)';
    o.beginPath();
    o.moveTo(cx, cy);
    o.arc(cx, cy, l / 2 - 5, -Math.PI / 2, -Math.PI / 2 + 6.283 * Math.min(1, r.carga));
    o.closePath();
    o.fill();
  }
  if (r.nivel >= 5) {
    o.strokeStyle = r.t % 20 < 10 ? '#ffe94a' : '#ffffff';
    o.lineWidth = 2;
    o.strokeRect(x - 2, y - 2, l + 4, l + 4);
  }
  if (r.nivel > 1) {
    o.font = '8px ' + CIFRAS;
    o.fillStyle = '#ffe94a';
    o.textAlign = 'left';
    o.fillText(ROMANO[r.nivel - 1], x + 7, y + 15);
  }
  if (r.tecla) {
    o.font = '8px ' + CIFRAS;
    o.fillStyle = '#c3b6d9';
    o.textAlign = 'right';
    o.fillText(r.tecla, x + l - 7, y + 15);
  }
  txt(r.nombre, x + l / 2, y + l - 8, coarse ? 10 : 11, r.sel ? '#f1e9ff' : '#c3b6d9', 'center');
}
