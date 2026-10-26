// El dragón pelea como dragón: aliento de fuego de verdad (un chorro, no bolas), látigo de llamas,
// aletazo que suelta tornados, rugido que llama truenos negros y morados, y rayos negros por el mapa.
// Menos balas sueltas que antes: los peligros se ven venir y se esquivan.
const RAYO_NEGRO = '#8a2aff';

// Aliento: carga (la boca brilla) y suelta un chorro de fuego que va siguiendo a la heroína despacio.
function alientoDragon(B, cx, cy, f) {
  B.moving = false;
  const [mx, my] = bocaDragon(B, cy),
    C = fuegoDe(B),
    largo = B.berserk ? 190 : 165,
    ancho = 0.3;
  if (B.t == 1) {
    B.ang0 = Math.atan2(G.P.y - 10 - my, G.P.x - mx);
    sfx('ultCarga');
  }
  if (B.t < 34) {
    B.tele = { x: mx, y: my + 20, r: 6 + B.t * 0.6, c: C[0] };
    avisoLinea(B, mx, my, B.ang0, largo, C[0], 2);
    if (B.t % 2 == 0) burst(mx, my, 3, C[2], 1.5, 12);
  }
  if (B.t == 34) {
    B.tele = null;
    G.shake = 10;
    sfx('fuego');
  }
  if (B.t > 34 && B.t < 110) {
    const objetivo = Math.atan2(G.P.y - 10 - my, G.P.x - mx),
      dif = Math.atan2(Math.sin(objetivo - B.ang0), Math.cos(objetivo - B.ang0));
    B.ang0 += dif * (B.berserk ? 0.03 : 0.022);
    B.cono = { x: mx, y: my, a: B.ang0, largo, ancho, C };
    for (let k = 0; k < 4; k++) {
      const a = B.ang0 + rnd(-ancho, ancho) * 0.8,
        v = rnd(3, 5.5);
      G.pt.push({
        x: mx,
        y: my,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        l: 30,
        m: 30,
        c: C[k % 3],
        s: 3,
        g: 0,
      });
    }
    vivos().forEach(Q => {
      const d = Math.hypot(Q.x - mx, Q.y - 10 - my),
        a = Math.atan2(Q.y - 10 - my, Q.x - mx);
      if (d < largo && Math.abs(Math.atan2(Math.sin(a - B.ang0), Math.cos(a - B.ang0))) < ancho * 0.85)
        conJugador(Q, hurtPlayer);
    });
    if (B.t % 12 == 0) sfx('fuego');
    G.shake = Math.max(G.shake, 3);
  }
  if (B.t >= 110) B.cono = null;
  return B.t > 120;
}

// El chorro de fuego: capas de su color, más claras al centro, que titilan.
function drawConoDragon(B) {
  const K = B.cono;
  if (!K) return;
  [
    [1, 0.35, K.C[0]],
    [0.7, 0.45, K.C[1]],
    [0.35, 0.6, B.berserk ? '#12051e' : '#fff3c0'],
  ].forEach(([ab, al, c]) => {
    const t = Math.sin(G.t * 0.7) * 0.04,
      a1 = K.a - K.ancho * ab - t,
      a2 = K.a + K.ancho * ab + t,
      L = K.largo * (0.92 + Math.random() * 0.08);
    w.globalAlpha = al;
    w.fillStyle = c;
    w.beginPath();
    w.moveTo(K.x, K.y);
    w.lineTo(K.x + Math.cos(a1) * L, K.y + Math.sin(a1) * L);
    w.quadraticCurveTo(
      K.x + Math.cos(K.a) * L * 1.12,
      K.y + Math.sin(K.a) * L * 1.12,
      K.x + Math.cos(a2) * L,
      K.y + Math.sin(a2) * L,
    );
    w.fill();
  });
  w.globalAlpha = 1;
}

// Látigo de llamas: la línea avisa y la cola de fuego barre un arco frente al dragón.
function latigoDragon(B, cx, cy, f) {
  B.moving = false;
  const [mx, my] = bocaDragon(B, cy),
    largo = 150;
  if (B.t == 1) {
    B.lat0 = Math.atan2(G.P.y - 10 - my, G.P.x - mx) - 1;
    B.latDir = Math.random() < 0.5 ? 1 : -1;
    if (B.latDir < 0) B.lat0 += 2;
    avisoLinea(B, mx, my, B.lat0, largo, fuegoDe(B)[0], 22);
    sfx('rugido');
  }
  B.latigo = null;
  // Dos latigazos, ida y vuelta.
  [
    [22, 1],
    [52, -1],
  ].forEach(([ini, sentido]) => {
    if (B.t < ini || B.t >= ini + 18) return;
    const k = (B.t - ini) / 18,
      dir = B.latDir * sentido,
      base = sentido > 0 ? B.lat0 : B.lat0 + B.latDir * 2,
      a = base + dir * 2 * k,
      pts = [];
    for (let i = 1; i <= 14; i++) {
      const r = (largo * i) / 14,
        ola = Math.sin(i * 0.6 - B.t * 0.5) * i * 0.9;
      pts.push([mx + Math.cos(a) * r - Math.sin(a) * ola, my + Math.sin(a) * r + Math.cos(a) * ola]);
    }
    B.latigo = { pts, C: fuegoDe(B) };
    if (B.t == ini) {
      sfx('tajo');
      G.shake = Math.max(G.shake, 6);
    }
    vivos().forEach(
      Q => pts.some(p => Math.hypot(Q.x - p[0], Q.y - 10 - p[1]) < 11) && conJugador(Q, hurtPlayer),
    );
    const fin = pts[pts.length - 1];
    G.pt.push({
      x: fin[0],
      y: fin[1],
      vx: rnd(-1, 1),
      vy: rnd(-1, 1),
      l: 16,
      m: 16,
      c: fuegoDe(B)[2],
      s: 2,
      g: 0,
    });
  });
  return B.t > 76;
}
function drawLatigoDragon(B) {
  const L = B.latigo;
  if (!L) return;
  w.lineCap = 'round';
  w.lineJoin = 'round';
  [
    [10, 0.35, L.C[0]],
    [5, 1, L.C[1]],
    [2, 1, B.berserk ? '#12051e' : '#fff3c0'],
  ].forEach(([g, al, c]) => {
    w.globalAlpha = al;
    w.strokeStyle = c;
    w.lineWidth = g;
    w.beginPath();
    L.pts.forEach((p, i) => (i ? w.lineTo(p[0], p[1]) : w.moveTo(p[0], p[1])));
    w.stroke();
  });
  w.globalAlpha = 1;
}

// Aletazo: empuja a todos hacia atrás y suelta tornados que se van abriendo (sin lluvia de balas).
function aletazoDragon(B, cx, cy, f) {
  B.moving = false;
  if (B.t < 18) B.z = B.t;
  if (B.t == 18) {
    G.shake = 14;
    sfx('rugido');
    ring(B.x, B.y - 30, 120, '#ffffff', 30, 3);
    burst(B.x, B.y - 20, 60, '#c3b6d9', 4, 30, 2);
    vivos().forEach(Q => {
      const d = Math.max(1, Math.hypot(Q.x - B.x, Q.y - B.y));
      for (let k = 0; k < 40; k += 2) {
        const nx = Q.x + ((Q.x - B.x) / d) * 2,
          ny = Q.y + ((Q.y - B.y) / d) * 2;
        if (solidAt(nx, ny, 4)) break;
        Q.x = nx;
        Q.y = ny;
      }
    });
    const n = B.berserk ? 5 : 4,
      a0 = rnd(0, 6.283);
    if (G.tornados.length < 6)
      for (let i = 0; i < n; i++) {
        const a = a0 + (i * 6.283) / n;
        G.tornados.push({
          x: B.x + Math.cos(a) * 40,
          y: B.y + Math.sin(a) * 26,
          l: 200,
          t: 0,
          sale: a,
          negro: B.berserk,
          sinBalas: 1,
        });
      }
  }
  if (B.t > 18) B.z = Math.max(0, B.z - 1);
  return B.t > 50;
}

// Rugido: el dragón ruge, la sala tiembla y caen truenos negros y morados uno tras otro.
function rugidoDragon(B, cx, cy, f) {
  B.moving = false;
  const P = G.P;
  if (B.t == 1) {
    sfx('rugido');
    G.banner = { txt: B.berserk ? '¡ARDE!' : '¡GRAAAH!', t: 0, c: RAYO_NEGRO };
  }
  if (B.t < 24) {
    G.shake = Math.max(G.shake, 6);
    if (B.t % 4 == 0) ring(B.x, B.y - 40, 30 + B.t * 4, RAYO_NEGRO, 14, 3);
  }
  if (B.t == 24) {
    const n = B.berserk ? 12 : 9;
    for (let i = 0; i < n; i++) {
      const cerca = i % 3 == 0;
      zonaEn(
        B,
        cerca ? P.x + rnd(-30, 30) : rnd(40, 440),
        cerca ? P.y + rnd(-24, 24) : rnd(50, 250),
        22,
        30 + i * 6,
        RAYO_NEGRO,
        'rayoNegro',
        1,
      );
    }
  }
  return B.t > 100;
}

// Rayos negros por el mapa: tres líneas de rayos que cruzan la sala, una detrás de otra.
function rayosNegrosDragon(B, cx, cy, f) {
  B.moving = false;
  const P = G.P;
  if (B.t == 1) sfx('sombra');
  if (B.t % 28 == 1 && B.t < 80) {
    const vertical = Math.random() < 0.5,
      fijo = vertical ? P.x + rnd(-20, 20) : P.y + rnd(-14, 14);
    for (let i = 0; i < 8; i++)
      zonaEn(
        B,
        vertical ? fijo : 30 + i * 60,
        vertical ? 40 + i * 30 : fijo,
        20,
        36 + i * 4,
        RAYO_NEGRO,
        'rayoNegro',
        1,
      );
  }
  return B.t > 130;
}

Object.assign(ATAQUES, {
  aliento: conLlamas('aliento', alientoDragon),
  latigo: latigoDragon,
  aletazo: aletazoDragon,
  rugido: rugidoDragon,
  rayosNegros: rayosNegrosDragon,
});
JEFES.dragon.ataques = {
  1: ['aliento', 'vuelo', 'aletazo', 'latigo', 'aliento'],
  2: ['aliento', 'vuelo', 'aletazo', 'latigo', 'rugido', 'lluviaFuego', 'garra'],
  3: ['aliento', 'vuelo', 'aletazo', 'latigo', 'rugido', 'rayosNegros', 'infierno', 'muroFuego'],
};
JEFES.dragonF.ataques = {
  1: ['aliento', 'rugido', 'aletazo', 'latigo', 'rayosNegros', 'llamaNegra', 'vuelo'],
  2: ['aliento', 'rugido', 'rayosNegros', 'latigo', 'aletazo', 'infierno', 'vuelo', 'llamaNegra'],
};

// Trueno negro: un rayo gordo que baja zigzagueando desde arriba de la pantalla, con ramas largas,
// un destello morado en toda la pantalla, temblor y estruendo.
function truenoNegro(x, y) {
  const pts = [[x + rnd(-30, 30), y - 320]],
    br = [];
  for (let i = 1; i < 16; i++) {
    const k = i / 16,
      px = pts[0][0] + (x - pts[0][0]) * k + rnd(-14, 14),
      py = y - 320 + 320 * k;
    pts.push([px, py]);
    if (Math.random() < 0.4) {
      const ba = 1.57 + rnd(-1.1, 1.1),
        L = rnd(20, 50),
        m = [px + (Math.cos(ba) * L) / 2 + rnd(-8, 8), py + (Math.sin(ba) * L) / 2];
      br.push([[px, py], m, [px + Math.cos(ba) * L, py + Math.sin(ba) * L]]);
    }
  }
  pts.push([x, y]);
  G.bolts.push({ pts, br, l: 22, m: 22, gordo: 1, negro: 1 });
  G.bolts.push(Object.assign(rayoPts(x + rnd(-40, 40), y - 260, x, y), { l: 14, m: 14, negro: 1 }));
  G.flash = Math.max(G.flash || 0, 5);
  G.fcol = '#d9b0ff';
  G.shake = Math.max(G.shake, 10);
  ring(x, y, 34, RAYO_NEGRO, 14, 4);
  burst(x, y, 30, RAYO_NEGRO, 4, 24, 2, 0.05);
  burst(x, y, 12, '#ffffff', 3, 14);
  decal(x, y + 2, 14, '#0b0010', 500);
  sfx('rayo');
  sfx('explosion');
}
