// Dibujo del mundo: heroínas, entidades ordenadas por profundidad, luz, partículas y el cuadro final.
function drawPlayer() {
  const P = G.P,
    t = G.t;
  if (P.caido) {
    drawCaido(P);
    return;
  }
  if (P.inv > 0 && t % 6 < 3 && !G.over) return;
  if (G.coop) {
    w.fillStyle = P.num == 1 ? '#5ee7ff' : '#ff8a2a';
    w.beginPath();
    w.moveTo(P.x - 3, P.y - 36);
    w.lineTo(P.x + 3, P.y - 36);
    w.lineTo(P.x, P.y - 32);
    w.fill();
  }
  if (P.circ > 0) {
    const c = TEC[P.tecs[P.spell]].c,
      k = P.circ / 12;
    w.strokeStyle = c;
    w.globalAlpha = k;
    w.lineWidth = 1;
    w.beginPath();
    w.ellipse(P.x, P.y, 12 + (1 - k) * 6, 4 + (1 - k) * 2, 0, 0, 7);
    w.stroke();
    for (let i = 0; i < 8; i++) {
      const a = t * 0.15 + i * 0.785;
      w.fillStyle = c;
      w.fillRect(
        Math.round(P.x + Math.cos(a) * (13 + (1 - k) * 6)),
        Math.round(P.y + Math.sin(a) * (4.5 + (1 - k) * 2)),
        1,
        1,
      );
    }
    w.globalAlpha = 1;
  }
  w.fillStyle = 'rgba(0,0,0,.35)';
  w.beginPath();
  w.ellipse(P.x, P.y, 6, 2, 0, 0, 7);
  w.fill();
  const fr =
      P.hurt > 0 || G.over
        ? P.spr.hit
        : (P.moving ? P.spr.run : P.spr.idle)[Math.floor(t / (P.moving ? 5 : 9)) % 4],
    A = armaInfo(P.arma),
    [sx, sy, sw, sh] = A.spr,
    tipo = ARMAS[P.arma.id].tipo,
    a = Math.atan2(P.ay - (P.y - 14), P.ax - P.x),
    back = Math.sin(Math.atan2(P.ay - P.y, P.ax - P.x)) < -0.3;
  const staff = () => {
    const kk = P.kick > 0 ? -P.kick * 0.8 : 0;
    let ang = a + Math.PI / 2;
    if (P.swing > 0) ang += (P.swing / 12 - 0.5) * 2.6 * P.face;
    w.save();
    w.translate(Math.round(P.x + Math.cos(a) * (5 + kk)), Math.round(P.y - 12 + Math.sin(a) * (3 + kk)));
    w.rotate(tipo == 'arco' ? a : ang);
    w.drawImage(atlas, sx, sy, sw, sh, -sw / 2, tipo == 'arco' ? -sh / 2 : -sh + 8, sw, sh);
    if (tipo == 'baston' && (P.cds[P.spell] > 0 || G.U)) {
      const c = G.U ? ULT[P.ult].c : TEC[P.tecs[P.spell]].c;
      w.fillStyle = c;
      w.globalAlpha = 0.5 + Math.sin(t * 0.6) * 0.3;
      w.fillRect(-2, -sh + 6, 4, 4);
      w.globalAlpha = 1;
    }
    w.restore();
  };
  if (back) staff();
  spr(w, P.dash || P.est ? white : P.src, fr, P.x, P.y, P.face < 0);
  if (P.hurt > 0) spr(w, white, fr, P.x, P.y, P.face < 0);
  if (!back) staff();
}
function drawWorld() {
  const t = G.t;
  w.drawImage(fc, 0, 0);
  G.decals.forEach(d => {
    w.globalAlpha = Math.min(1, d.l / 60) * 0.7;
    w.fillStyle = d.c;
    w.beginPath();
    w.ellipse(d.x, d.y, d.r, d.r * 0.55, 0, 0, 7);
    w.fill();
  });
  w.globalAlpha = 1;
  drawSala();
  G.marcas.forEach(m => {
    w.strokeStyle = m.t % 8 < 4 ? '#ff3a2a' : '#ffe94a';
    w.lineWidth = 1;
    w.beginPath();
    w.ellipse(m.x, m.y, 10, 4, 0, 0, 7);
    w.stroke();
    w.fillStyle = 'rgba(0,0,0,.4)';
    w.beginPath();
    w.ellipse(m.x, m.y, 10 * (1 - m.t / 45), 4 * (1 - m.t / 45), 0, 0, 7);
    w.fill();
  });
  const ents = [];
  drawTerreno(ents);
  drawObjetos(ents);
  G.ghosts.forEach(g =>
    ents.push({
      y: g.y - 1,
      d: () => {
        w.globalAlpha = g.l / 30;
        if (g.boss) spr(w, red, g.fr, g.x, g.y, g.face < 0, 2);
        else spr(w, white, (g.spr || G.P.spr).run[0], g.x, g.y, g.face < 0);
        w.globalAlpha = 1;
      },
    }),
  );
  if (G.B) ents.push({ y: G.B.y, d: drawJefe });
  drawEnemigos(ents);
  G.jug.forEach(Q => ents.push({ y: Q.y, d: () => conJugador(Q, drawPlayer) }));
  ents.sort((a, b) => a.y - b.y).forEach(e => e.d());
  drawLuz();
  drawPoderes();
  G.pt.forEach(p => {
    w.globalAlpha = Math.min(1, (p.l / p.m) * 1.6);
    w.fillStyle = p.c;
    w.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
  });
  w.globalAlpha = 1;
  if (G.dark > 0) {
    w.fillStyle = 'rgba(5,0,10,' + G.dark + ')';
    w.fillRect(0, 0, WW, WH);
  }
}
const FUENTE = '"Pixelify Sans",monospace',
  CIFRAS = '"Press Start 2P",monospace';
function txt(s, x, y, size, col, al, sh) {
  if (coarse) size = Math.round(size * 1.15);
  o.font = /\d/.test(s)
    ? Math.round(size * 0.62) + 'px ' + CIFRAS
    : (size >= 20 ? '700 ' : '400 ') + size + 'px ' + FUENTE;
  o.letterSpacing = '0.5px';
  o.textAlign = al || 'left';
  if (sh) {
    o.fillStyle = '#000';
    o.fillText(s, x + 2, y + 2);
  }
  o.fillStyle = col;
  o.fillText(s, x, y);
}
function render() {
  const vw = VW / G.zoom,
    vh = VH / G.zoom,
    sx = (Math.random() - 0.5) * G.shake,
    sy = (Math.random() - 0.5) * G.shake;
  drawWorld();
  o.fillStyle = '#000';
  o.fillRect(0, 0, OW, OH);
  o.drawImage(wc, G.cam.x - vw / 2 + sx, G.cam.y - vh / 2 + sy, vw, vh, 0, 0, OW, OH);
  if (!calidadBaja) o.drawImage(VINETA, 0, 0);
  ocultar('tTomar', !(coarse && G.cerca));
  ocultar('tPocion', !(coarse && G.P.poc));
  drawHud();
  if (G.flash > 0) {
    o.globalAlpha = G.flash / 14;
    o.fillStyle = G.fcol;
    o.fillRect(0, 0, OW, OH);
    o.globalAlpha = 1;
  }
  if (G.fade > 0) {
    o.fillStyle = 'rgba(0,0,0,' + Math.min(1, G.fade) + ')';
    o.fillRect(0, 0, OW, OH);
  }
  ponerFiltro(G.inv > 0 ? 'invert(1) grayscale(1) contrast(4)' : '');
  if (G.inv > 0) G.inv--;
}
