// Dibujo de los poderes: nubes, balas, círculos mágicos, escudo, proyectiles, tajos, rayos, lanzas y ondas.
function drawPoderes() {
  const t = G.t,
    P = G.P;
  G.nubes.forEach(n => {
    w.globalAlpha = Math.min(1, n.l / 40) * 0.35;
    w.fillStyle = '#3a8a1a';
    w.beginPath();
    w.ellipse(n.x, n.y, n.r, n.r * 0.55, 0, 0, 7);
    w.fill();
    w.globalAlpha = Math.min(1, n.l / 40) * 0.25;
    w.fillStyle = '#7cff4a';
    w.beginPath();
    w.ellipse(n.x + Math.sin(t * 0.05) * 4, n.y - 3, n.r * 0.7, n.r * 0.35, 0, 0, 7);
    w.fill();
  });
  w.globalAlpha = 1;
  drawBalas();
  if (G.U && G.U.cr > 0) {
    const f = G.U.foco,
      r = G.U.cr,
      C = ULT[G.U.id].c;
    w.strokeStyle = C;
    w.lineWidth = 1;
    w.globalAlpha = 0.85;
    w.beginPath();
    w.ellipse(f.x, f.y, r, r * 0.4, 0, 0, 7);
    w.stroke();
    w.beginPath();
    w.ellipse(f.x, f.y, r * 0.7, r * 0.28, 0, 0, 7);
    w.stroke();
    for (let i = 0; i < 12; i++) {
      const a = t * 0.05 + i * 0.524;
      w.fillStyle = i % 3 ? C : '#ffffff';
      w.fillRect(
        Math.round(f.x + Math.cos(a) * r * 0.85) - 1,
        Math.round(f.y + Math.sin(a) * r * 0.34) - 1,
        2,
        2,
      );
    }
    w.globalAlpha = 1;
  }
  if (G.U && G.U.cuch)
    G.U.cuch.forEach(a => {
      w.save();
      w.translate(P.x + Math.cos(a) * G.U.rad, P.y - 12 + Math.sin(a) * G.U.rad * 0.7);
      w.rotate(a + Math.PI);
      w.drawImage(atlas, 293, 10, 6, 13, -3, -6, 6, 13);
      w.restore();
    });
  if (P.escudo > 0) {
    const k = Math.min(1, P.escudo / 15);
    w.globalAlpha = 0.8 * k;
    w.strokeStyle = '#ffd24a';
    w.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = t * 0.08 + i * 1.047,
        b = a + 1.047;
      w.beginPath();
      w.moveTo(P.x + Math.cos(a) * 20, P.y - 12 + Math.sin(a) * 16);
      w.lineTo(P.x + Math.cos(b) * 20, P.y - 12 + Math.sin(b) * 16);
      w.stroke();
    }
    w.globalAlpha = 0.12 * k;
    w.fillStyle = '#ffd24a';
    w.beginPath();
    w.ellipse(P.x, P.y - 12, 20, 16, 0, 0, 7);
    w.fill();
    w.globalAlpha = 1;
  }
  G.frascos.forEach(f => {
    w.save();
    w.translate(f.x, f.y);
    w.rotate(f.t * 0.3);
    w.drawImage(atlas, 320, 352, 16, 16, -8, -8, 16, 16);
    w.restore();
  });
  drawReliquiasMundo();
  // Los avisos de línea de los jefes van encima de la penumbra para que siempre se vean.
  if (G.B && !G.B.dead) drawAvisosJefe(G.B);
  if (G.B && G.B.dead) drawMuerteEpica(G.B);
  drawBrillos();
  G.shots.forEach(s => SHOT_T[s.k].draw(s));
  G.tajos.forEach(s => {
    const k = s.l / 9;
    w.globalAlpha = k;
    w.fillStyle = s.c;
    w.beginPath();
    w.arc(s.x, s.y, s.r, s.a - s.arc / 2, s.a + s.arc / 2);
    w.arc(s.x, s.y, s.r * (0.55 + 0.3 * (1 - k)), s.a + s.arc / 2, s.a - s.arc / 2, true);
    w.fill();
    w.strokeStyle = '#ffffff';
    w.lineWidth = 1;
    w.beginPath();
    w.arc(s.x, s.y, s.r, s.a - s.arc / 2, s.a + s.arc / 2);
    w.stroke();
  });
  w.globalAlpha = 1;
  G.cortes.forEach(c => {
    const k = c.l / 24;
    w.globalAlpha = k;
    w.strokeStyle = '#ffe94a';
    w.lineWidth = 10 * k + 2;
    w.beginPath();
    w.moveTo(c.x - Math.cos(c.a) * 260, c.y - Math.sin(c.a) * 260);
    w.lineTo(c.x + Math.cos(c.a) * 260, c.y + Math.sin(c.a) * 260);
    w.stroke();
    w.strokeStyle = '#ffffff';
    w.lineWidth = 3 * k + 1;
    w.stroke();
  });
  w.globalAlpha = 1;
  G.ondas.forEach(o2 => {
    // Las ondas del eclipse esperan su turno con radio negativo.
    if (o2.r <= 0) return;
    const k = 1 - o2.r / o2.max;
    w.globalAlpha = k;
    w.strokeStyle = o2.c || '#ffb04a';
    w.lineWidth = 3;
    w.beginPath();
    w.ellipse(o2.x, o2.y, o2.r, o2.r * 0.6, 0, 0, 7);
    w.stroke();
    w.strokeStyle = '#fff1b0';
    w.lineWidth = 1;
    w.stroke();
  });
  w.globalAlpha = 1;
  G.bolts.forEach(b => {
    const k = b.l / (b.m || (b.gordo ? 14 : 10)),
      g = b.gordo ? (b.negro || b.grueso ? 3.4 : 2.2) : b.fino ? 0.45 : 1;
    w.lineCap = 'round';
    w.lineJoin = 'round';
    const path = p => {
      w.beginPath();
      p.forEach((q, i) => (i ? w.lineTo(q[0], q[1]) : w.moveTo(q[0], q[1])));
      w.stroke();
    };
    w.globalAlpha = 0.35 * k;
    w.strokeStyle = b.negro ? '#8a2aff' : b.col || '#5ee7ff';
    w.lineWidth = 7 * k * g;
    path(b.pts);
    w.globalAlpha = 1;
    w.lineWidth = 3 * k * g;
    path(b.pts);
    w.strokeStyle = b.negro ? '#12051e' : '#ffffff';
    w.lineWidth = 1.4 * g;
    path(b.pts);
    w.strokeStyle = b.negro ? '#d9b0ff' : b.col || '#b9f3ff';
    w.lineWidth = 1;
    b.br.forEach(path);
  });
  G.spears.forEach(s => {
    const k = s.big ? 3 : 1;
    if (s.kind == 'lanza') {
      w.fillStyle = '#2a0010';
      w.fillRect(s.x - 2 * k, s.y - 110 * k, 4 * k, 90 * k);
      w.fillStyle = '#ff2a4a';
      w.beginPath();
      w.moveTo(s.x, s.y + 6 * k);
      w.lineTo(s.x - 5 * k, s.y - 24 * k);
      w.lineTo(s.x + 5 * k, s.y - 24 * k);
      w.fill();
      w.fillStyle = '#fff';
      w.beginPath();
      w.moveTo(s.x, s.y + 2 * k);
      w.lineTo(s.x - 1.5 * k, s.y - 18 * k);
      w.lineTo(s.x + 1.5 * k, s.y - 18 * k);
      w.fill();
    } else if (s.kind == 'flecha') {
      w.save();
      w.translate(s.x, s.y);
      w.rotate(Math.PI);
      w.drawImage(atlas, 324, 202, 7, 21, -3.5 * k, -10 * k, 7 * k, 21 * k);
      w.restore();
    } else {
      w.fillStyle = '#6a5a4a';
      w.beginPath();
      w.arc(s.x, s.y, 5 * k, 0, 7);
      w.fill();
      w.fillStyle = '#a08070';
      w.beginPath();
      w.arc(s.x - k, s.y - k, 3.5 * k, 0, 7);
      w.fill();
    }
    if (s.big) {
      w.globalAlpha = 0.25;
      w.fillStyle = s.kind == 'lanza' ? '#ff2a4a' : '#7cff4a';
      w.fillRect(s.x - 14, s.y - 400, 28, 400);
      w.globalAlpha = 1;
    }
  });
  G.rings.forEach(r => {
    const k = r.l / r.m,
      rr = r.r0 + (r.r - r.r0) * Math.sqrt(1 - k);
    w.globalAlpha = k;
    w.strokeStyle = r.c;
    w.lineWidth = r.lw;
    w.beginPath();
    w.ellipse(r.x, r.y, rr, rr * 0.7, 0, 0, 7);
    w.stroke();
  });
  w.globalAlpha = 1;
}
