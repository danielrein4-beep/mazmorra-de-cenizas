// Tu héroe en grande en la portada: rayos de luz del color de su grimorio detrás, un círculo de runas que
// gira bajo sus pies, el libro flotando a su alrededor y el aura que sube. En la compu va a la izquierda
// (como en la portada de un anime); en el teléfono, al centro.
// Dónde cae un elemento de la página dentro de la escena (en sus píxeles).
function enEscena(sel, W, H) {
  const el = document.querySelector(sel),
    wr = document.getElementById('wrap');
  if (!el || !el.offsetParent) return null;
  const a = el.getBoundingClientRect(),
    b = wr.getBoundingClientRect();
  return { top: ((a.top - b.top) / b.height) * H, bottom: ((a.bottom - b.top) / b.height) * H };
}
function pintarHeroeMenu(W, H, t) {
  const P = PERSONAJES[ELEGIDO.p] || PERSONAJES[0],
    gid = grimorioDe({ pid: ELEGIDO.p }),
    g = grimorio(gid) || { c: '#5ee7ff', tapa: '#2a2050' },
    s = P[ELEGIDO.sexo] || P.f,
    ancha = W > H,
    [sx, sy] = capa(1),
    // En el teléfono se para en el hueco entre el logo y tu placa, del tamaño que quepa.
    logo = enEscena('#menu .logo', W, H),
    placa = enEscena('#placa', W, H),
    hueco = placa && logo ? placa.top - logo.bottom : 80,
    k = ancha ? 3 : Math.max(2, Math.min(4, Math.floor(hueco / 24))),
    cx = Math.round((ancha ? W * (innerHeight < 500 ? 0.09 : 0.16) : W / 2) + sx),
    pies = Math.round((ancha ? H * 0.86 : placa ? placa.top - 2 : H * 0.5) + sy),
    flota = Math.round(Math.sin(t * 0.05) * 1.5),
    pecho = pies - 12 * k;
  // Rayos de luz que giran despacio detrás del héroe.
  fm.save();
  fm.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const a = t * 0.004 + (i * 6.283) / 9,
      L = H * (ancha ? 0.75 : 0.45),
      ab = 0.07 + (i % 3) * 0.03;
    fm.globalAlpha = 0.07 + Math.sin(t * 0.03 + i) * 0.03;
    fm.fillStyle = i % 2 ? g.c : '#fff3c0';
    fm.beginPath();
    fm.moveTo(cx, pecho);
    fm.lineTo(cx + Math.cos(a - ab) * L, pecho + Math.sin(a - ab) * L);
    fm.lineTo(cx + Math.cos(a + ab) * L, pecho + Math.sin(a + ab) * L);
    fm.fill();
  }
  fm.restore();
  luzEscena(cx, pecho, 26 * k, g.c + '40');
  luzEscena(cx, pecho, 12 * k, 'rgba(255,255,255,.12)');
  // Círculo de runas bajo sus pies.
  fm.save();
  fm.translate(cx, pies);
  fm.scale(1, 0.3);
  fm.strokeStyle = g.c;
  fm.globalAlpha = 0.8;
  fm.lineWidth = 2;
  fm.setLineDash([6, 4]);
  fm.lineDashOffset = -t * 0.4;
  fm.beginPath();
  fm.arc(0, 0, 15 * k, 0, 7);
  fm.stroke();
  fm.setLineDash([2, 6]);
  fm.lineDashOffset = t * 0.3;
  fm.globalAlpha = 0.5;
  fm.beginPath();
  fm.arc(0, 0, 11 * k, 0, 7);
  fm.stroke();
  fm.setLineDash([]);
  fm.restore();
  fm.globalAlpha = 1;
  luzEscena(cx, pies, 18 * k, g.c + '66');
  // El grimorio da vueltas: pasa por detrás y por delante del héroe.
  const ag = t * 0.03,
    gx = Math.round(cx + Math.cos(ag) * 10 * k),
    gy = Math.round(pecho - 2 * k + Math.sin(ag) * 3 * k),
    libro = () => dibujarGrimorio(fm, g, hojasDe(gid, P.id) || 1, gx, gy, 5 * k, t);
  if (Math.sin(ag) < 0) libro();
  const fr = s.spr.idle[Math.floor(t / 10) % 4],
    src = atlasVestuario(ELEGIDO.vest);
  dibujarTraje(fm, ELEGIDO.vest, cx, pies - flota, 1, k, t, 0);
  fm.drawImage(
    src,
    fr[0],
    fr[1],
    fr[2],
    fr[3],
    cx - (fr[2] * k) / 2,
    pies - flota - fr[3] * k,
    fr[2] * k,
    fr[3] * k,
  );
  dibujarTraje(fm, ELEGIDO.vest, cx, pies - flota, 1, k, t, 1);
  if (Math.sin(ag) >= 0) libro();
  // Aura que sube del héroe.
  if (t % 3 == 0)
    escena.cenizas.push({
      x: cx + rnd(-6, 6) * k,
      y: pies - rnd(0, 4) * k,
      v: -rnd(0.4, 0.9),
      d: 0,
      aura: Math.random() < 0.7 ? g.c : '#ffffff',
      tope: pies - 30 * k,
    });
}
