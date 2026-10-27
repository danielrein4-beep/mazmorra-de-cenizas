// Luz de colores y clima de cada zona. La luz suma un resplandor del color de cada disparo, rayo,
// llama y jefe sobre la oscuridad; el clima le da a cada zona su aire: niebla en la cripta, nieve en
// el hielo, brasas en el volcán, bruma en el abismo, motas doradas en el cielo, lluvia con relámpagos
// en la tormenta y ceniza roja en el trono.
const RESPLANDOR = {};
// Un círculo difuso por color, hecho una vez y reusado (dibujar degradados cada cuadro sale caro).
function resplandor(c) {
  if (RESPLANDOR[c]) return RESPLANDOR[c];
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const x = cv.getContext('2d'),
    g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, c);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return (RESPLANDOR[c] = cv);
}
function brillar(x, y, r, c, k) {
  w.globalAlpha = k;
  w.drawImage(resplandor(c), x - r, y - r, r * 2, r * 2);
}
function drawLuzColor() {
  if (calidadBaja) return;
  w.save();
  w.globalCompositeOperation = 'lighter';
  G.shots.forEach(s =>
    brillar(s.x, s.y, s.brillo ? 26 : 18, s.brillo || (TEC[s.k] && TEC[s.k].c) || '#9adfff', 0.35),
  );
  G.bolts.forEach(b => {
    const e = b.pts[b.pts.length - 1];
    brillar(e[0], e[1], 40, '#9adfff', 0.4);
  });
  G.bul.forEach((b, i) => (b.llama || i % 3 == 0) && brillar(b.x, b.y, b.llama ? 16 : 10, b.c, 0.3));
  G.gases.forEach(g => g.fuego && brillar(g.x, g.y, g.r * 1.6, g.c, 0.25));
  if (G.B && !G.B.dead) {
    const B = G.B;
    brillar(
      B.x,
      B.y - B.z - (B.def.cy || 30),
      (B.def.r || 32) * 2,
      B.def.color || B.def.tono || '#ff5a3c',
      0.18,
    );
  }
  G.jug.forEach(Q => Q.aura && brillar(Q.x, Q.y - 12, 40, Q.auraC, 0.3));
  w.restore();
}

// Tinte de cada zona (por orden de ZONAS): una luz de color suave sobre todo el cuarto, héroes, enemigos y
// jefes incluidos, para que el arte de distintos artistas se vea bajo la misma luz.
const TINTE_ZONA = ['#2e8a62', '#4a86d0', '#d0602a', '#6a2ad0', '#c8a050', '#3a5aa8', '#b01a2e'];
function drawTinteZona() {
  if (calidadBaja) return;
  w.save();
  w.globalCompositeOperation = 'soft-light';
  w.globalAlpha = 0.35;
  w.fillStyle = TINTE_ZONA[G.zona] || TINTE_ZONA[0];
  w.fillRect(0, 0, WW, WH);
  w.restore();
}

// Cómo es el clima de cada zona (por orden de ZONAS).
const CLIMAS = [
  { tipo: 'niebla', c: '#9affc0', n: 7 },
  { tipo: 'nieve', c: '#ffffff', n: 70 },
  { tipo: 'brasas', c: '#ff8a2a', n: 45 },
  { tipo: 'niebla', c: '#8a2aff', n: 8 },
  { tipo: 'motas', c: '#ffe9a0', n: 40 },
  { tipo: 'lluvia', c: '#9ab8ff', n: 90 },
  { tipo: 'brasas', c: '#ff2a3a', n: 40 },
];
let climaPt = [],
  climaZona = -1,
  relampago = 0;
function nuevaGota(C, arriba) {
  const y = arriba ? rnd(-20, 0) : rnd(0, WH);
  if (C.tipo == 'niebla') return { x: rnd(-60, WW), y: rnd(20, WH), r: rnd(40, 80), v: rnd(0.1, 0.3) };
  if (C.tipo == 'nieve') return { x: rnd(0, WW), y, v: rnd(0.3, 0.8), f: rnd(0, 6) };
  if (C.tipo == 'lluvia') return { x: rnd(0, WW + 60), y, v: rnd(5, 7) };
  // Brasas y motas suben desde abajo.
  return { x: rnd(0, WW), y: arriba ? WH + rnd(0, 20) : rnd(0, WH), v: rnd(0.3, 0.9), f: rnd(0, 6) };
}
function drawClima() {
  const C = CLIMAS[G.zona];
  if (!C) return;
  if (climaZona != G.zona) {
    climaZona = G.zona;
    climaPt = [];
    for (let i = 0; i < C.n; i++) climaPt.push(nuevaGota(C));
  }
  const n = calidadBaja ? Math.ceil(C.n / 3) : C.n;
  w.save();
  climaPt.slice(0, n).forEach((p, i) => {
    if (C.tipo == 'niebla') {
      p.x += p.v;
      if (p.x - p.r > WW) Object.assign(p, nuevaGota(C), { x: -p.r });
      w.globalAlpha = 0.07;
      w.fillStyle = C.c;
      w.beginPath();
      w.ellipse(p.x, p.y, p.r, p.r * 0.35, 0, 0, 7);
      w.fill();
      return;
    }
    if (C.tipo == 'lluvia') {
      p.x -= p.v * 0.35;
      p.y += p.v;
      if (p.y > WH) Object.assign(p, nuevaGota(C, true));
      w.globalAlpha = 0.35;
      w.strokeStyle = C.c;
      w.lineWidth = 1;
      w.beginPath();
      w.moveTo(p.x, p.y);
      w.lineTo(p.x + 2.5, p.y - 7);
      w.stroke();
      return;
    }
    p.f += 0.05;
    if (C.tipo == 'nieve') {
      p.y += p.v;
      p.x += Math.sin(p.f) * 0.4;
      if (p.y > WH) Object.assign(p, nuevaGota(C, true));
    } else {
      p.y -= p.v;
      p.x += Math.sin(p.f) * 0.3;
      if (p.y < -4) Object.assign(p, nuevaGota(C, true));
    }
    w.globalAlpha = C.tipo == 'nieve' ? 0.7 : 0.45 + Math.sin(p.f * 3) * 0.3;
    w.fillStyle = C.c;
    w.fillRect(Math.round(p.x), Math.round(p.y), i % 4 ? 1 : 2, i % 4 ? 1 : 2);
  });
  // Tormenta: de vez en cuando un relámpago ilumina toda la sala.
  if (C.tipo == 'lluvia') {
    if (relampago <= 0 && Math.random() < 0.004) relampago = 14;
    if (relampago > 0) {
      relampago--;
      w.globalAlpha = relampago > 10 || (relampago > 4 && relampago < 7) ? 0.22 : 0;
      w.fillStyle = '#e8f0ff';
      w.fillRect(0, 0, WW, WH);
    }
  }
  w.restore();
}
