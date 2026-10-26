// Interfaz sobre el juego: vidas, furia, arma, monedas, barra del jefe, minimapa, técnicas y carteles.
function drawHud() {
  const P = G.P,
    B = G.B,
    t = G.t;
  for (let i = 0; i < P.max / 2; i++) {
    const v = P.hp - i * 2,
      r = v >= 2 ? R.hFull : v == 1 ? R.hHalf : R.hEmpty;
    o.drawImage(atlas, r[0], r[1], 13, 12, 18 + i * 44, 16, 39, 36);
  }
  const full = P.meter >= 100;
  o.fillStyle = 'rgba(10,6,16,.8)';
  o.fillRect(18, 60, 140, 14);
  o.fillStyle = full ? (t % 20 < 10 ? '#ff2a4a' : '#ffffff') : '#a0204a';
  o.fillRect(20, 62, (136 * P.meter) / 100, 10);
  txt(full ? ULT[P.ult].n + (coarse ? '' : ' · Q') : 'Furia', 20, 94, 15, full ? '#ffe94a' : '#c3b6d9');
  const AI = armaInfo(P.arma);
  o.fillStyle = 'rgba(10,6,16,.8)';
  o.fillRect(18, 104, 40, 40);
  o.strokeStyle = AI.raro ? '#5ee7ff' : '#4e4070';
  o.lineWidth = 2;
  o.strokeRect(19, 105, 38, 38);
  o.save();
  o.translate(38, 124);
  o.rotate(0.785);
  const sk = Math.max(1, Math.floor(30 / Math.max(AI.spr[2], AI.spr[3])));
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
  txt(AI.n, 66, 120, 15, AI.raro ? '#5ee7ff' : '#f1e9ff');
  txt(AI.d, 66, 138, 12, '#c3b6d9');
  o.drawImage(atlas, 289 + 8 * (Math.floor(t / 8) % 4), 385, 6, 7, 22, 154, 18, 21);
  txt('' + P.oro, 48, 170, 15, '#ffe94a');
  o.drawImage(atlas, 288, 352, 16, 16, 96, 150, 30, 30);
  txt('x' + P.poc, 128, 170, 15, P.poc ? '#ff8a9a' : '#8f82a6');
  if (!coarse && P.poc) txt('F', 150, 170, 13, '#8f82a6');
  if (P.llaves) {
    o.fillStyle = '#ffe94a';
    o.fillRect(176, 160, 14, 6);
    o.fillRect(186, 156, 8, 14);
    o.fillStyle = '#0b0812';
    o.fillRect(188, 160, 4, 6);
    o.fillStyle = '#ffe94a';
    o.fillRect(176, 166, 3, 5);
    o.fillRect(181, 166, 3, 4);
    txt('x' + P.llaves, 200, 170, 15, '#ffe94a');
  }
  const mmx = OW - 18 - (G.mundo ? G.mundo.W : 5) * 26 + 4;
  o.fillStyle = 'rgba(10,6,16,.6)';
  o.fillRect(mmx - 6, 10, OW - mmx - 6, 90);
  drawMinimapa(mmx, 16);
  txt(
    ZONAS[G.zona].n + (G.dif.id == 'pesadilla' ? ' · Pesadilla' : ''),
    OW - 18,
    118,
    15,
    G.dif.id == 'pesadilla' ? '#ff8a9a' : '#f1e9ff',
    'right',
  );
  txt(musicaOn ? 'M · música sí' : 'M · música no', OW - 18, 136, 12, '#8f82a6', 'right');
  if (B && (!B.dead || B.dt < 100) && !G.intro) {
    o.fillStyle = 'rgba(10,6,16,.85)';
    const bw = Math.min(460, OW - 40),
      bx = OW / 2 - bw / 2,
      by = vertical() ? 186 : 16;
    o.fillRect(bx, by, bw, 22);
    o.fillStyle = '#3a1020';
    o.fillRect(bx + 4, by + 4, bw - 8, 14);
    o.fillStyle = B.phase > B.def.fases.length ? '#ff3a2a' : '#c8324a';
    o.fillRect(bx + 4, by + 4, ((bw - 8) * B.hp) / B.max, 14);
    o.fillStyle = '#ff8a9a';
    o.fillRect(bx + 4, by + 4, ((bw - 8) * B.hp) / B.max, 3);
    o.fillStyle = '#0b0812';
    B.def.fases.forEach(f => o.fillRect(bx + 4 + (bw - 8) * f[0], by + 4, 2, 14));
    txt(B.def.n, OW / 2, by + 42, 16, '#f1e9ff', 'center');
  } else if (G.oleadas && G.cerrado) {
    const n = G.enem.length + G.spawns.length;
    txt(
      'Oleada ' + (G.ola + 1) + ' de ' + G.oleadas.length + (n ? ' · quedan ' + n : ''),
      OW / 2,
      vertical() ? 214 : 34,
      18,
      '#f1e9ff',
      'center',
      1,
    );
  }
  P.tecs.forEach((id, i) => {
    const s = TEC[id],
      x = 18 + i * 66,
      y = OH - 74,
      sel = P.spell == i;
    o.fillStyle = 'rgba(10,6,16,.8)';
    o.fillRect(x, y, 58, 58);
    o.strokeStyle = sel ? s.c : '#4e4070';
    o.lineWidth = sel ? 3 : 2;
    o.strokeRect(x + 1, y + 1, 56, 56);
    icono(o, id, x + 29, y + 23, 3);
    if (lvl(id)) {
      o.fillStyle = '#ffe94a';
      for (let k = 0; k < lvl(id); k++) o.fillRect(x + 6 + k * 6, y + 6, 4, 4);
    }
    const cdT = Math.round(s.cd * armaInfo(P.arma).cdm);
    if (P.cds[i] > 0) {
      o.fillStyle = 'rgba(0,0,0,.55)';
      o.fillRect(x + 3, y + 3, 52, Math.min(52, (52 * P.cds[i]) / cdT));
    }
    txt(s.n, x + 29, y + 52, coarse ? 10 : 13, sel ? '#f1e9ff' : '#c3b6d9', 'center');
    if (!coarse) {
      o.font = '9px ' + CIFRAS;
      o.fillStyle = '#8f82a6';
      o.textAlign = 'left';
      o.fillText(i + 1, x + 45, y + 14);
    }
  });
  const vw = VW / G.zoom,
    vh = VH / G.zoom,
    toS = (x, y) => [((x - G.cam.x) / vw) * OW + OW / 2, ((y - G.cam.y) / vh) * OH + OH / 2];
  if (P.combo > 0 && G.t - P.comboT < 50 && P.tecs[P.spell] == 'rayo') {
    const [cx, cy] = toS(P.x, P.y - 34);
    txt('x' + (P.combo + 1), cx, cy, 22, P.combo == 2 ? '#ffe94a' : '#b9f3ff', 'center', 1);
  }
  [
    [G.cerca, coarse ? '' : 'E · '],
    [G.coop && G.cerca2 !== G.cerca ? G.cerca2 : null, 'U · '],
  ].forEach(([c, k]) => {
    if (!c) return;
    const [t1, t2, raro] = textoInter(c, k),
      [cx, cy] = toS(c.x, c.y - 26);
    o.font = '700 17px ' + FUENTE;
    const tw = Math.max(o.measureText(t1).width, o.measureText(t2).width * 0.8) + 28;
    o.fillStyle = 'rgba(10,6,16,.9)';
    o.fillRect(cx - tw / 2, cy - 50, tw, 50);
    o.strokeStyle = raro ? '#5ee7ff' : '#c3b6d9';
    o.lineWidth = 2;
    o.strokeRect(cx - tw / 2, cy - 50, tw, 50);
    txt(t1, cx, cy - 28, 17, raro ? '#5ee7ff' : '#ffffff', 'center');
    txt(t2, cx, cy - 10, 13, '#c3b6d9', 'center');
  });
  drawHudJ2();
  if (G.vendedor) {
    const [vx, vy] = toS(G.vendedor.x, G.vendedor.y - 30);
    txt('Zaro, el mercader', vx, vy - 24, 15, '#ffe94a', 'center', 1);
    txt('Pasa y mira, que todo brilla.', vx, vy - 6, 13, '#c3b6d9', 'center', 1);
  }
  o.textAlign = 'center';
  G.nums.forEach(n => {
    const [sx, sy] = toS(n.x, n.y);
    o.globalAlpha = Math.min(1, n.l / 15);
    o.font = (n.big ? 28 : 14) + 'px ' + CIFRAS;
    o.fillStyle = '#000';
    o.fillText(n.v, sx + 3, sy + 3);
    o.fillStyle = n.big ? '#ffe94a' : '#ffffff';
    o.fillText(n.v, sx, sy);
  });
  o.globalAlpha = 1;
  if (B && B.sayT > 0 && !B.dead) {
    const [sx, sy] = toS(B.x, B.y - B.z - 84);
    o.font = '700 22px ' + FUENTE;
    const tw = o.measureText(B.say).width + 28;
    o.fillStyle = '#f1e9ff';
    o.fillRect(sx - tw / 2, sy - 30, tw, 40);
    o.fillStyle = '#7a1f3d';
    o.textAlign = 'center';
    o.fillText(B.say, sx, sy - 2);
  }
  if (G.intro && B) {
    const k = Math.min(1, G.intro.t / 14),
      out = G.intro.t > 100 ? (G.intro.t - 100) / 20 : 0;
    o.globalAlpha = 1 - out;
    o.fillStyle = '#0b0004';
    o.beginPath();
    o.moveTo(0, OH - 150);
    o.lineTo(OW * k, OH - 190);
    o.lineTo(OW * k, OH - 90);
    o.lineTo(0, OH - 60);
    o.fill();
    o.fillStyle = '#ff2a4a';
    o.fillRect(0, OH - 196, OW * k, 6);
    txt(B.def.n.toUpperCase(), 60 + (1 - k) * -400, OH - 130, 46, '#ffffff', 'left', 1);
    txt(B.def.sub, 64 + (1 - k) * -400, OH - 96, 20, '#ff8a9a', 'left');
    o.globalAlpha = 1;
  }
  if (G.banner) {
    const k = Math.min(1, G.banner.t / 8);
    o.strokeStyle = 'rgba(255,255,255,.35)';
    o.lineWidth = 2;
    for (let i = 0; i < 36; i++) {
      const a = Math.random() * 6.283;
      o.beginPath();
      o.moveTo(OW / 2 + Math.cos(a) * 300, OH / 2 + Math.sin(a) * 200);
      o.lineTo(OW / 2 + Math.cos(a) * 700, OH / 2 + Math.sin(a) * 500);
      o.stroke();
    }
    o.fillStyle = G.banner.c || '#ff2a4a';
    o.fillRect(0, OH / 2 - 48, OW * k, 96);
    o.fillStyle = '#0b0004';
    o.fillRect(0, OH / 2 - 40, OW * k, 80);
    o.globalAlpha = k;
    txt(G.banner.txt, OW / 2 + (1 - k) * 300, OH / 2 + 18, 54, '#ffffff', 'center');
    o.globalAlpha = 1;
  }
  if (G.aviso) {
    o.globalAlpha = Math.min(1, G.aviso.l / 20);
    txt(G.aviso.txt, OW / 2, OH / 2 - 150, 32, '#ffe94a', 'center', 1);
    o.globalAlpha = 1;
  }
  if (G.slow < 1 || G.intro) {
    o.fillStyle = '#000';
    o.fillRect(0, 0, OW, 34);
    o.fillRect(0, OH - 34, OW, 34);
  }
  [
    [touch.move, '241,233,255'],
    [touch.aim, '94,231,255'],
  ].forEach(([m, c]) => {
    if (!m) return;
    o.strokeStyle = 'rgba(' + c + ',.5)';
    o.lineWidth = 3;
    o.beginPath();
    o.arc(m.ox, m.oy, RADIO_PALANCA, 0, 7);
    o.stroke();
    o.fillStyle = 'rgba(' + c + ',.5)';
    o.beginPath();
    o.arc(m.ox + m.dx * RADIO_PALANCA, m.oy + m.dy * RADIO_PALANCA, 22, 0, 7);
    o.fill();
  });
}
