// Muerte del último jefe (el de la Aventura o el Dragón del piso 100): no se apaga sin más. Se congela
// el golpe, suena la fanfarria, rayos de luz salen de su cuerpo, la sala tiembla cada vez más, toda la
// energía se junta en el centro y estalla en una explosión enorme con el cartel de VICTORIA.
const esUltimoJefe = () =>
  !G.reto && (G.pacto ? ultimoPacto() : G.torre ? G.piso >= 100 : G.zona == ZONAS_AVENTURA - 1);
const FIN_EPICO = 260;

// Devuelve true si se encarga de este paso (si no, sigue la muerte de siempre).
function pasoMuerteEpica(B) {
  if (!esUltimoJefe()) return false;
  const t = ++B.dt,
    c = B.def.color || B.def.tono || '#ffd24a',
    cx = B.x,
    cy = B.y - (B.def.cy || 40);
  if (t == 1) {
    G.stop = 26;
    G.flash = 12;
    G.fcol = '#ffffff';
    G.shake = 20;
    G.slow = 0.75;
    B.rayosLuz = [];
    sfx('ultFinal');
  }
  if (t == 24) musica('victoria');
  // Rayos de luz que salen del cuerpo, cada vez más.
  if (t < 170 && t % (t < 80 ? 10 : 5) == 0)
    B.rayosLuz.push({ a: rnd(0, 6.283), l: 0, v: rnd(0.004, 0.012) });
  if (t < 170) {
    G.shake = Math.max(G.shake, 2 + t / 25);
    if (t % 8 == 0) {
      burst(cx + rnd(-30, 30), cy + rnd(-30, 30), 20, Math.random() < 0.5 ? c : '#ffe94a', 3.5, 26);
      sfx('boom');
    }
    if (t % 30 == 0) ring(cx, cy, 40 + t / 2, c, 16, 3);
  }
  // Todo se junta en el centro antes de estallar.
  if (t > 130 && t < 170)
    for (let i = 0; i < 4; i++) {
      const a = rnd(0, 6.283),
        d = rnd(80, 160);
      G.pt.push({
        x: cx + Math.cos(a) * d,
        y: cy + Math.sin(a) * d,
        vx: (-Math.cos(a) * d) / 18,
        vy: (-Math.sin(a) * d) / 18,
        l: 18,
        m: 18,
        c: i % 2 ? '#ffffff' : c,
        s: 2,
        g: 0,
      });
    }
  if (t == 170) {
    B.rayosLuz = [];
    soltarMonedas(B.x, B.y - 20, 40);
    burst(cx, cy, 320, c, 8, 70, 2);
    burst(cx, cy, 160, '#ffffff', 6, 60);
    burst(cx, cy, 80, '#ffe94a', 5, 50);
    [60, 120, 200].forEach((r, i) => ring(cx, cy, r, i == 1 ? '#ffffff' : c, 22 + i * 6, 5));
    decal(B.x, B.y + 2, 46, '#140806', 3000);
    G.flash = 14;
    G.fcol = '#ffffff';
    G.stop = 12;
    G.shake = 34;
    G.inv = 6;
    G.banner = { txt: 'VICTORIA', t: 0, c: '#ffd24a', dura: 110 };
    sfx('boom');
    sfx('explosion');
  }
  B.rayosLuz.forEach(r => {
    r.l = Math.min(1, r.l + 0.04);
    r.a += r.v;
  });
  if (t == FIN_EPICO) jefeDerrotado();
  return true;
}
// Los rayos de luz: franjas que salen del cuerpo y giran despacio.
function drawMuerteEpica(B) {
  if (!B.rayosLuz || !B.rayosLuz.length) return;
  const cx = B.x,
    cy = B.y - (B.def.cy || 40);
  w.save();
  w.globalCompositeOperation = 'lighter';
  B.rayosLuz.forEach((r, i) => {
    const L = 400 * r.l,
      ab = 0.05 + (i % 3) * 0.02;
    w.globalAlpha = 0.35 + Math.sin(G.t * 0.3 + i) * 0.1;
    w.fillStyle = i % 2 ? '#ffffff' : '#ffe9a0';
    w.beginPath();
    w.moveTo(cx, cy);
    w.lineTo(cx + Math.cos(r.a - ab) * L, cy + Math.sin(r.a - ab) * L);
    w.lineTo(cx + Math.cos(r.a + ab) * L, cy + Math.sin(r.a + ab) * L);
    w.fill();
  });
  w.restore();
}
