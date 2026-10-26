// Títulos de la Torre según el piso más alto al que llegues, y sus insignias dibujadas:
// el metal mejora y el trébol del grimorio gana hojas; Rey Mago tiene corona, cinco hojas y rayos de luz.
const TITULOS = [
  { desde: 0, n: 'Caballero Mágico Novato', forma: 'escudo', metal: ['#8a4a1a', '#d08a4a'], hojas: 1 },
  { desde: 10, n: 'Caballero Mágico Intermedio', forma: 'escudo', metal: ['#7a8090', '#e8eef8'], hojas: 2 },
  { desde: 20, n: 'Caballero Mágico Avanzado', forma: 'escudo', metal: ['#a07010', '#ffe27a'], hojas: 3 },
  {
    desde: 30,
    n: 'Caballero Mágico Superior',
    forma: 'escudo',
    metal: ['#a07010', '#ffe27a'],
    hojas: 3,
    gema: '#ff2a4a',
  },
  {
    desde: 50,
    n: 'Capitán de Escuadrón',
    forma: 'emblema',
    metal: ['#1a3aa0', '#6a9aff'],
    hojas: 4,
    borde: '#ffd24a',
  },
  {
    desde: 70,
    n: 'Comandante de la Orden',
    forma: 'emblema',
    metal: ['#4a1a8a', '#b06bff'],
    hojas: 4,
    borde: '#ffd24a',
    alas: 1,
  },
  {
    desde: 80,
    n: 'General',
    forma: 'emblema',
    metal: ['#7a0a1a', '#ff4a5a'],
    hojas: 4,
    borde: '#ffd24a',
    alas: 1,
    estrellas: 3,
  },
  {
    desde: 90,
    n: 'Rey Mago',
    forma: 'corona',
    metal: ['#0b0812', '#3a2a4a'],
    hojas: 5,
    borde: '#ffd24a',
    alas: 1,
    rayos: 1,
  },
];
const tituloDe = piso => TITULOS.filter(t => piso >= t.desde).pop();
const nivelTitulo = piso => TITULOS.indexOf(tituloDe(piso));

// Dibuja la insignia en cualquier lienzo, centrada en (cx, cy), de "s" píxeles de alto. t anima el brillo.
function dibujarInsignia(x, nivel, cx, cy, s, t) {
  const T = TITULOS[nivel],
    k = s / 100;
  x.save();
  x.translate(cx, cy);
  x.scale(k, k);
  t = t || 0;
  if (T.rayos) {
    x.save();
    x.rotate(t * 0.01);
    for (let i = 0; i < 16; i++) {
      x.rotate(Math.PI / 8);
      x.fillStyle = i % 2 ? 'rgba(255,233,74,.35)' : 'rgba(255,255,255,.18)';
      x.beginPath();
      x.moveTo(0, 0);
      x.lineTo(-6, -64);
      x.lineTo(6, -64);
      x.fill();
    }
    x.restore();
  }
  if (T.alas)
    [-1, 1].forEach(d => {
      x.fillStyle = T.borde;
      for (let i = 0; i < 4; i++) {
        x.beginPath();
        x.ellipse(d * (30 + i * 7), -8 + i * 6, 16 - i * 2, 6, d * (0.5 + i * 0.25), 0, 7);
        x.fill();
      }
    });
  const g = x.createLinearGradient(0, -45, 0, 45);
  g.addColorStop(0, T.metal[1]);
  g.addColorStop(1, T.metal[0]);
  x.fillStyle = g;
  x.strokeStyle = T.borde || T.metal[0];
  x.lineWidth = 5;
  x.beginPath();
  if (T.forma == 'escudo') {
    x.moveTo(-34, -40);
    x.lineTo(34, -40);
    x.lineTo(34, 2);
    x.quadraticCurveTo(30, 32, 0, 46);
    x.quadraticCurveTo(-30, 32, -34, 2);
    x.closePath();
  } else if (T.forma == 'emblema') {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 - Math.PI / 8,
        r = i % 2 ? 36 : 44;
      x.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    x.closePath();
  } else {
    x.arc(0, 4, 38, 0, 7);
  }
  x.fill();
  x.stroke();
  x.strokeStyle = 'rgba(255,255,255,.35)';
  x.lineWidth = 2;
  x.stroke();
  if (T.forma == 'corona') {
    x.fillStyle = '#ffd24a';
    x.strokeStyle = '#a07010';
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(-30, -36);
    [-30, -20, -10, 0, 10, 20, 30].forEach((px, i) => x.lineTo(px, i % 2 ? -50 : -62));
    x.lineTo(30, -36);
    x.closePath();
    x.fill();
    x.stroke();
    ['#ff2a4a', '#5ee7ff', '#7cff4a'].forEach((c, i) => {
      x.fillStyle = c;
      x.beginPath();
      x.arc(-16 + i * 16, -44, 3.5, 0, 7);
      x.fill();
    });
  }
  // Trébol del grimorio: las hojas salen del centro como en un reloj.
  const n = T.hojas,
    verde = T.forma == 'corona' ? '#2affb0' : '#3aff8a';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + ((i - (n - 1) / 2) * 2 * Math.PI) / Math.max(n, 3),
      hx = Math.cos(a) * 13,
      hy = Math.sin(a) * 13 + 2;
    x.fillStyle = verde;
    x.strokeStyle = '#0a4a2a';
    x.lineWidth = 2;
    x.beginPath();
    x.arc(hx, hy, 10, 0, 7);
    x.fill();
    x.stroke();
    x.fillStyle = 'rgba(255,255,255,.4)';
    x.beginPath();
    x.arc(hx - 3, hy - 3, 3, 0, 7);
    x.fill();
  }
  x.strokeStyle = '#0a4a2a';
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(0, 6);
  x.quadraticCurveTo(4, 22, 0, 30);
  x.stroke();
  if (T.gema) {
    x.fillStyle = T.gema;
    x.beginPath();
    x.moveTo(0, -36);
    x.lineTo(6, -30);
    x.lineTo(0, -24);
    x.lineTo(-6, -30);
    x.fill();
  }
  if (T.estrellas)
    for (let i = 0; i < T.estrellas; i++) {
      x.save();
      x.translate(-18 + i * 18, 34);
      x.fillStyle = '#ffd24a';
      x.beginPath();
      for (let j = 0; j < 10; j++) {
        const a = (j * Math.PI) / 5 - Math.PI / 2,
          r = j % 2 ? 2.6 : 6.5;
        x.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      x.fill();
      x.restore();
    }
  if (T.rayos) {
    x.globalAlpha = 0.5 + Math.sin(t * 0.08) * 0.3;
    x.strokeStyle = '#ffe94a';
    x.lineWidth = 3;
    x.beginPath();
    x.arc(0, 4, 44, 0, 7);
    x.stroke();
    x.globalAlpha = 1;
  }
  x.restore();
}
