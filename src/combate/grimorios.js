// Magia del grimorio en combate: el efecto de cada golpe (dañar llama a efectoGrimorio)
// y el hechizo propio de la tecla G, que se recarga con el tiempo.
const CD_HECHIZO = 420;

// Cuchilla de grimorio: atraviesa enemigos y lleva el color de su magia.
SHOT_T.hoja = {
  fantasma: 1,
  trail: s =>
    G.pt.push({ x: s.x + rnd(-3, 3), y: s.y + rnd(-3, 3), vx: 0, vy: 0, l: 10, m: 10, c: s.c, s: 1, g: 0 }),
  draw: s => {
    w.save();
    w.translate(s.x, s.y);
    w.rotate(Math.atan2(s.vy, s.vx));
    w.globalAlpha = Math.min(1, s.l / 15);
    w.strokeStyle = s.c;
    w.lineWidth = 3;
    w.beginPath();
    w.arc(-6, 0, 10, -1, 1);
    w.stroke();
    w.strokeStyle = '#ffffff';
    w.lineWidth = 1;
    w.beginPath();
    w.arc(-6, 0, 10, -0.6, 0.6);
    w.stroke();
    w.restore();
  },
};

// Lo que pasa en cada golpe según el grimorio. Devuelve el daño final.
function efectoGrimorio(P, tg, d) {
  const id = P.grim;
  if (!id || P.enGrim) return d;
  const r = tg.ref,
    f = fuerzaGrim(P.hojas);
  P.golpes = (P.golpes || 0) + 1;
  if (id == 'fuego') r.quema = Math.max(r.quema || 0, Math.round(80 * f));
  if (id == 'hielo' && Math.random() < 0.22 * f) r.frio = Math.max(r.frio || 0, tg.boss ? 40 : 90);
  if ((id == 'rayo' || id == 'tempestad') && P.golpes % 5 == 0) saltoDeRayo(P, tg, Math.round(12 * f));
  if ((id == 'viento' || id == 'tempestad') && !tg.boss) {
    r.kx = (r.kx || 0) * (2 + f);
    r.ky = (r.ky || 0) * (2 + f);
  }
  if (id == 'tierra' && P.golpes % Math.round(32 / f) == 0 && !P.muralla) {
    P.muralla = 1;
    ring(P.x, P.y - 12, 16, '#d0a060', 12);
  }
  if (id == 'luz' && Math.random() < 0.1 * f) {
    d *= 2;
    burst(tg.x, tg.y, 10, '#fff1b0', 2.5);
  }
  if (id == 'sombra') {
    P.sombraVida = (P.sombraVida || 0) + d * f;
    if (P.sombraVida >= 320 && P.hp < P.max) {
      P.sombraVida = 0;
      P.hp++;
      burst(P.x, P.y - 14, 12, '#b06bff', 1.6);
    }
  }
  if (id == 'antimagia') {
    d *= 1.25;
    cortarBalas(tg.x, tg.y, 18);
  }
  return d;
}
// Un rayo chico salta del enemigo golpeado al más cercano.
function saltoDeRayo(P, tg, d) {
  let otro = null,
    bd = 140;
  objetivos().forEach(o2 => {
    const k = Math.hypot(o2.x - tg.x, o2.y - tg.y);
    if (o2.ref !== tg.ref && k < bd) {
      bd = k;
      otro = o2;
    }
  });
  if (!otro) return;
  G.bolts.push(Object.assign(rayoPts(tg.x, tg.y, otro.x, otro.y), { l: 8 }));
  conGrim(P, () => dañar(otro, d, 0, true));
}
// Daño del propio hechizo: no vuelve a disparar el efecto del grimorio.
function conGrim(P, fn) {
  P.enGrim = 1;
  fn();
  P.enGrim = 0;
}
const cercanos = (x, y, r) => objetivos().filter(o2 => Math.hypot(o2.x - x, o2.y - y) < r + o2.r);

// Tecla G: el hechizo del grimorio.
function hechizoGrimorio() {
  const P = G.P;
  if (!P.grim || P.caido || P.gcd > 0 || P.est || G.U || G.over || G.intro) return;
  const f = fuerzaGrim(P.hojas),
    g = grimorio(P.grim),
    a = Math.atan2(P.ay - (P.y - 12), P.ax - P.x),
    x = P.x,
    y = P.y - 12;
  P.gcd = Math.round(CD_HECHIZO / (0.8 + 0.2 * P.hojas));
  G.aviso = { txt: g.hechizo, l: 70 };
  ring(x, y, 40, g.c, 16, 3);
  burst(x, y, 30, g.c, 3);
  G.shake = Math.max(G.shake, 6);
  HECHIZOS[P.grim](P, a, x, y, f, g.c);
  hazaña('mag', 3);
}
const HECHIZOS = {
  fuego: (P, a, x, y, f) => {
    for (let i = 0; i < 14; i++)
      disparo('fuego', x, y, (i * 6.283) / 14, 3, { r: 6, l: 80, dmg: Math.round(22 * f) });
    sfx('explosion');
  },
  hielo: (P, a, x, y, f) => {
    conGrim(P, () =>
      cercanos(x, y, 130).forEach(o2 => {
        o2.ref.frio = o2.boss ? 90 : 200;
        dañar(o2, Math.round(26 * f), 2, true);
        burst(o2.x, o2.y, 14, '#e8fbff', 2.5);
      }),
    );
    ring(x, y, 130, '#9af0ff', 22, 4);
    sfx('hieloRompe');
  },
  rayo: (P, a, x, y, f) => {
    const L = objetivos()
      .sort((p, q) => Math.hypot(p.x - x, p.y - y) - Math.hypot(q.x - x, q.y - y))
      .slice(0, 5);
    conGrim(P, () =>
      L.forEach(o2 => {
        G.bolts.push(
          Object.assign(rayoPts(o2.x + rnd(-10, 10), o2.y - 200, o2.x, o2.y), { gordo: 1, l: 12 }),
        );
        dañar(o2, Math.round(40 * f), 4, true);
      }),
    );
    G.flash = 4;
    G.fcol = '#ffe94a';
    sfx('trueno');
  },
  viento: (P, a, x, y, f, c) => {
    cortarBalas(x, y, 90 + 20 * f);
    conGrim(P, () =>
      cercanos(x, y, 90).forEach(o2 => {
        if (o2.boss) return;
        const b = Math.atan2(o2.y - y, o2.x - x);
        o2.ref.kx = Math.cos(b) * 8;
        o2.ref.ky = Math.sin(b) * 8;
      }),
    );
    for (let i = -2; i <= 2; i++)
      disparo('hoja', x, y, a + i * 0.2, 4.4, { c, r: 7, l: 50, dmg: Math.round(20 * f), pierce: 9 });
    sfx('abanico');
  },
  tierra: (P, a, x, y, f) => {
    P.muralla = P.hojas >= 3 ? 2 : 1;
    conGrim(P, () => cercanos(x, y, 70).forEach(o2 => dañar(o2, Math.round(24 * f), 4, true)));
    for (let i = 0; i < 8; i++) {
      const b = (i * 6.283) / 8;
      burst(x + Math.cos(b) * 40, y + Math.sin(b) * 28, 10, '#a08070', 3, 26, 2, 0.12);
    }
    decal(P.x, P.y + 2, 26, '#1a120a', 500);
    G.shake = 12;
    sfx('pisoton');
  },
  luz: (P, a, x, y, f, c) => {
    for (let i = 0; i < 8; i++)
      disparo('hoja', x, y, a + (i - 3.5) * 0.13, 5, { c, r: 6, l: 60, dmg: Math.round(18 * f), pierce: 9 });
    P.inv = Math.max(P.inv, 20);
    sfx('tajo');
  },
  sombra: (P, a, x, y, f) => {
    let px = P.x,
      py = P.y;
    for (let k = 0; k < 30; k++) {
      const nx = px + Math.cos(a) * 4,
        ny = py + Math.sin(a) * 4;
      if (solidAt(nx, ny, 4)) break;
      px = nx;
      py = ny;
    }
    conGrim(P, () =>
      objetivos().forEach(o2 => {
        const t = Math.max(
            0,
            Math.min(
              1,
              ((o2.x - P.x) * (px - P.x) + (o2.y - P.y) * (py - P.y)) /
                (Math.hypot(px - P.x, py - P.y) ** 2 || 1),
            ),
          ),
          cx = P.x + (px - P.x) * t,
          cy = P.y + (py - P.y) * t;
        if (Math.hypot(o2.x - cx, o2.y - cy) < o2.r + 16) dañar(o2, Math.round(34 * f), 3, true);
      }),
    );
    G.ghosts.push({ x: P.x, y: P.y, l: 30, face: P.face, spr: P.spr });
    burst(P.x, P.y - 12, 30, '#2a0a4a', 3, 30, 2);
    P.x = px;
    P.y = py;
    P.inv = Math.max(P.inv, 60);
    if (P.hojas >= 3 && P.hp < P.max) P.hp++;
    burst(P.x, P.y - 12, 30, '#b06bff', 3, 30, 2);
    sfx('sombra');
  },
  tempestad: (P, a, x, y, f, c) => {
    HECHIZOS.viento(P, a, x, y, f, c);
    HECHIZOS.rayo(P, a, x, y, f, c);
  },
  antimagia: (P, a, x, y, f) => {
    G.bul.forEach(b => burst(b.x, b.y, 3, '#ff2a4a', 1.5));
    G.bul = [];
    G.marcas = [];
    G.banner = { txt: 'ANTIMAGIA', t: 0, c: '#ff2a4a' };
    conGrim(P, () => cercanos(x, y, 120).forEach(o2 => dañar(o2, Math.round(60 * f), 6, true)));
    ring(x, y, 120, '#ff2a4a', 26, 5);
    ring(x, y, 80, '#0b0812', 20, 4);
    G.stop = 8;
    G.flash = 6;
    G.fcol = '#0b0812';
    sfx('ultFinal');
  },
};

// La coraza de roca de Tierra aguanta golpes; hurtPlayer la consulta antes de quitar vida.
function corazaAguanta(P) {
  if (!P.muralla) return false;
  P.muralla--;
  P.inv = 50;
  burst(P.x, P.y - 12, 24, '#d0a060', 3, 26, 2, 0.1);
  ring(P.x, P.y - 12, 20, '#d0a060', 12, 3);
  sfx('escudo');
  return true;
}
function drawCoraza(P) {
  if (!P.muralla) return;
  w.strokeStyle = '#d0a060';
  w.globalAlpha = 0.5 + Math.sin(G.t * 0.2) * 0.2;
  w.lineWidth = 2;
  w.beginPath();
  w.ellipse(P.x, P.y - 12, 13, 17, 0, 0, 7);
  w.stroke();
  if (P.muralla > 1) {
    w.beginPath();
    w.ellipse(P.x, P.y - 12, 16, 20, 0, 0, 7);
    w.stroke();
  }
  w.globalAlpha = 1;
}
