// Interfaz sobre el juego: paneles (nucleo/hud-premium.js), avisos, números de daño, presentación del jefe y carteles.
function drawHud() {
  const P = G.P,
    B = G.B,
    t = G.t;
  drawPanelHeroe(P, t);
  drawPanelZona();
  if (B && (!B.dead || B.dt < 100) && !G.intro) {
    drawBarraJefe(B);
  } else if (G.oleadas && G.cerrado) {
    const n = G.enem.length + G.spawns.length;
    const tx = 'Oleada ' + (G.ola + 1) + ' de ' + G.oleadas.length + (n ? ' · quedan ' + n : ''),
      oy = vertical() ? 150 : 52;
    marco('panel', OW / 2 - 130, oy, 260, 40);
    txt(tx, OW / 2, oy + 26, 15, '#f1e9ff', 'center');
  }
  drawBarraTecnicas(P, t);
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
    marco(raro ? 'sel' : 'panel', cx - tw / 2, cy - 54, tw, 58);
    txt(t1, cx, cy - 28, 17, raro ? '#5ee7ff' : '#ffffff', 'center');
    txt(t2, cx, cy - 10, 13, '#c3b6d9', 'center');
  });
  drawHudJ2();
  drawNuevoTitulo();
  drawGuia();
  drawArena();
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
