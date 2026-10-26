// El dragón pelea como dragón: aliento de fuego de verdad (un chorro, no bolas), látigo de llamas,
// aletazo que suelta tornados, rugido que llama truenos negros y morados, y rayos negros por el mapa.
// Menos balas sueltas que antes: los peligros se ven venir y se esquivan.
const RAYO_NEGRO = '#8a2aff';

// Aliento: carga (la boca brilla) y suelta un chorro de fuego que va siguiendo a la heroína despacio.
function alientoDragon(B, cx, cy, f) {
  B.moving = false;
  const [mx, my] = bocaDragon(B, cy),
    C = fuegoDe(B),
    largo = B.berserk ? 340 : 300,
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
    // El chorro es pura chispa: muchos pixelitos de su color que salen de la boca y se abren.
    const P = pixelesFuego(B);
    for (let k = 0; k < 16; k++) {
      const a = B.ang0 + rnd(-ancho, ancho) * 0.75,
        v = rnd(3.2, 6),
        l = Math.round(largo / v) + Math.floor(rnd(-3, 4));
      G.pt.push({
        x: mx + rnd(-2, 2),
        y: my + rnd(-2, 2),
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - rnd(0, 0.3),
        l,
        m: l,
        c: P[Math.floor(Math.random() * P.length)],
        s: Math.random() < 0.3 ? 4 : Math.random() < 0.6 ? 3 : 2,
        g: 0,
        fr: 1,
      });
    }
    vivos().forEach(Q => {
      const d = Math.hypot(Q.x - mx, Q.y - 10 - my),
        a = Math.atan2(Q.y - 10 - my, Q.x - mx);
      if (d < largo && Math.abs(Math.atan2(Math.sin(a - B.ang0), Math.cos(a - B.ang0))) < ancho * 0.85)
        conJugador(Q, hurtPlayer);
    });
    if (B.t % 12 == 0) sfx('fuego');
    // Mientras escupe fuego también caen rayos negros cerca de la heroína (más seguidos al renacer).
    if (B.t % (B.berserk ? 16 : 24) == 0)
      zonaEn(B, G.P.x + rnd(-40, 40), G.P.y + rnd(-30, 30), 22, 34, RAYO_NEGRO, 'rayoNegro', 1);
    G.shake = Math.max(G.shake, 3);
  }
  if (B.t >= 110) B.cono = null;
  return B.t > 120;
}

// Colores de los pixelitos de fuego: naranja y amarillo, o morado, fucsia y negro al renacer.
const pixelesFuego = B =>
  B.berserk
    ? ['#b06bff', '#8a2aff', '#8a2aff', '#ff3fd2', '#2a0a4a', '#12051e', '#e0c0ff']
    : ['#ff8a2a', '#ff5a1a', '#ffb04a', '#ffe94a', '#ffe94a', '#fff3c0', '#c0301a'];
// El chorro ya no tiene forma dibujada: son solo los pixelitos (deja apenas un resplandor en la boca).
function drawConoDragon(B) {
  const K = B.cono;
  if (!K) return;
  w.globalAlpha = 0.35 + Math.random() * 0.2;
  w.fillStyle = pixelesFuego(B)[0];
  w.fillRect(Math.round(K.x - 4), Math.round(K.y - 4), 8, 8);
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
    // La cola de fuego suelta pixelitos por todo su largo.
    const Pf = pixelesFuego(B);
    pts.forEach((p, i) => {
      if (i % 2) return;
      G.pt.push({
        x: p[0],
        y: p[1],
        vx: rnd(-0.6, 0.6),
        vy: rnd(-1, 0.2),
        l: 12,
        m: 12,
        c: Pf[i % Pf.length],
        s: 2,
        g: 0,
      });
    });
  });
  return B.t > 76;
}
// El látigo es una hilera de pixelitos de fuego que titilan (nada de línea lisa).
function drawLatigoDragon(B) {
  const L = B.latigo;
  if (!L) return;
  const Pf = pixelesFuego(B);
  L.pts.forEach((p, i) => {
    const s = i > 10 ? 3 : 4;
    w.fillStyle = Pf[(i + G.t) % Pf.length];
    w.fillRect(Math.round(p[0] - s / 2 + rnd(-1, 1)), Math.round(p[1] - s / 2 + rnd(-1, 1)), s, s);
  });
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
  1: ['aliento', 'vuelo', 'aletazo', 'latigo', 'rayosNegros', 'aliento'],
  2: ['aliento', 'vuelo', 'aletazo', 'latigo', 'rugido', 'rayosNegros', 'garra'],
  3: ['aliento', 'vuelo', 'aletazo', 'latigo', 'rugido', 'rayosNegros', 'rugido', 'infierno', 'muroFuego'],
};
// Al revivir suena Final Stand (chiptune rápido e intenso, como una pelea de Pokémon); el Señor de las
// Cenizas usa su versión con tambores pesados.
JEFES.dragonF.musica2 = 'finalStand';
if (JEFES.furia) JEFES.furia.musica2 = 'finalStandTambores';
JEFES.dragonF.ataques = {
  1: ['aliento', 'rugido', 'aletazo', 'latigo', 'rayosNegros', 'rayosNegros', 'llamaNegra', 'vuelo'],
  2: ['aliento', 'rugido', 'rayosNegros', 'latigo', 'rugido', 'rayosNegros', 'aletazo', 'infierno', 'vuelo'],
};
// En fuego negro, además, cada tanto cae un trueno negro cerca de la heroína (avisa con su marca).
function truenosAmbiente(B) {
  if (B.id != 'dragon' || !B.berserk || B.dead || B.trans || G.t % 150) return;
  const P = G.P;
  for (let i = 0; i < 2; i++)
    zonaEn(B, P.x + rnd(-50, 50), P.y + rnd(-36, 36), 22, 40 + i * 12, RAYO_NEGRO, 'rayoNegro', 1);
}

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
