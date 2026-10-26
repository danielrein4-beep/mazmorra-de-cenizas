// Mundo: tres zonas de colores; cada una es un laberinto de cuartos con puertas, una llave para el jefe,
// una sala secreta tras una pared agrietada, tienda, tesoro y una escalera hacia la zona siguiente.
const LADOS = { N: [0, -1], S: [0, 1], W: [-1, 0], E: [1, 0] },
  OPUESTO = { N: 'S', S: 'N', W: 'E', E: 'W' };
const PUERTA_POS = { N: [240, 24], S: [240, 308], W: [10, 160], E: [470, 160] },
  ENTRADA = { N: [240, 52], S: [240, 286], W: [36, 170], E: [444, 170] };
const claveC = (x, y) => x + ',' + y;
function generarZona(zi) {
  const Z = ZONAS[zi],
    W = 5,
    H = 4,
    cu = {};
  const nuevo = (x, y, tipo) =>
    (cu[claveC(x, y)] = {
      x,
      y,
      tipo,
      p: {},
      plano: 'vacio',
      limpio: false,
      visto: false,
      conocido: false,
      est: null,
    });
  const unir = (a, b, lado, tipo) => {
    const c = { tipo: tipo || 'normal', abierta: !tipo || tipo == 'normal' };
    a.p[lado] = c;
    b.p[OPUESTO[lado]] = c;
  };
  const libres = c =>
    Object.entries(LADOS).filter(([l, [dx, dy]]) => {
      const nx = c.x + dx,
        ny = c.y + dy;
      return nx >= 0 && nx < W && ny >= 0 && ny < H && !cu[claveC(nx, ny)];
    });
  let cur = nuevo(2, 3, 'inicio');
  const camino = [cur];
  for (let i = 0; i < 5; i++) {
    const op = libres(cur).sort(() => Math.random() - 0.5);
    if (!op.length) break;
    const el = op.find(o => o[0] == 'N' && Math.random() < 0.45) || op[0],
      [l, [dx, dy]] = el;
    const n = nuevo(cur.x + dx, cur.y + dy, 'pelea');
    unir(cur, n, l);
    cur = n;
    camino.push(n);
  }
  const opJ = libres(cur);
  if (opJ.length) {
    const [l, [dx, dy]] = opJ[0];
    unir(cur, nuevo(cur.x + dx, cur.y + dy, 'jefe'), l, 'llave');
  } else {
    const prev = camino[camino.length - 2];
    cur.tipo = 'jefe';
    const l = Object.keys(prev.p).find(k => prev.p[k] === Object.values(cur.p)[0]);
    prev.p[l].tipo = 'llave';
    prev.p[l].abierta = false;
    camino.pop();
  }
  ['llave', 'tesoro', 'tienda', 'secreto'].forEach(t => {
    for (let k = 0; k < 40; k++) {
      const base = camino[Math.floor(Math.random() * camino.length)];
      if (t != 'tienda' && base.tipo == 'inicio' && k < 20) continue;
      const o = libres(base);
      if (!o.length) continue;
      const [l, [dx, dy]] = o[Math.floor(Math.random() * o.length)];
      unir(base, nuevo(base.x + dx, base.y + dy, t), l, t == 'secreto' ? 'secreta' : 'normal');
      return;
    }
    if (t == 'llave') {
      const c = camino.filter(c => c.tipo == 'pelea').pop();
      if (c) c.tipo = 'llave';
    }
  });
  Object.values(cu).forEach(c => {
    c.plano =
      c.tipo == 'pelea' || c.tipo == 'llave'
        ? Z.planos[Math.floor(Math.random() * Z.planos.length)]
        : c.tipo == 'jefe'
          ? Z.planoJefe
          : c.tipo == 'tienda'
            ? 'tienda'
            : c.tipo == 'tesoro'
              ? 'tesoro'
              : 'vacio';
  });
  return { cu, W, H, inicio: camino[0] };
}
function entrarZona(i) {
  juntarTodos();
  G.zona = i;
  G.mundo = generarZona(i);
  G.room = null;
  entrarCuarto(G.mundo.inicio, null);
}
function guardarCuarto() {
  const c = G.room;
  if (c)
    c.est = {
      inter: G.inter,
      monedas: G.monedas,
      pick: G.pick,
      mapa: G.mapa,
      cajas: G.cajas,
      decals: G.decals,
      vendedor: G.vendedor,
      escalera: G.escalera,
    };
}
function vecino(c, l) {
  const [dx, dy] = LADOS[l];
  return G.mundo.cu[claveC(c.x + dx, c.y + dy)];
}
function entrarCuarto(c, lado) {
  guardarCuarto();
  const P = G.P,
    Z = ZONAS[G.zona];
  resetSala();
  G.room = c;
  c.visto = true;
  Object.keys(c.p).forEach(l => {
    const n = vecino(c, l);
    if (n && (c.p[l].tipo != 'secreta' || c.p[l].abierta)) n.conocido = true;
  });
  buildFloor(c);
  if (c.est) Object.assign(G, c.est);
  const e = lado ? ENTRADA[lado] : [240, 286];
  G.jug.forEach((Q, i) => {
    const off = i ? (lado == 'W' || lado == 'E' ? [0, 18] : [18, 0]) : [0, 0];
    Q.x = e[0] + off[0];
    Q.y = e[1] + off[1];
    Q.dash = 0;
    Q.est = null;
    Q.safe = [Q.x, Q.y];
  });
  G.cam = { x: P.x, y: P.y - 20 };
  G.fade = lado ? 0.7 : 1;
  if (c.tipo == 'jefe' && !c.limpio) {
    G.B = crearJefe(c.jefe || Z.jefe);
    G.tocadoJefe = 0;
    G.cerrado = 1;
    G.intro = { t: 0 };
    const idJ = c.jefe || Z.jefe;
    musica(JEFES[idJ].musica || (idJ == 'cenizas' ? 'final' : 'jefe_' + idJ));
    return;
  }
  musica('sala');
  if ((c.tipo == 'pelea' || c.tipo == 'llave') && !c.limpio) {
    G.cerrado = 1;
    G.olaT = 45;
    G.oleadas = crearOleadas(c);
  }
  if (!c.est) {
    if (c.tipo == 'tienda') ponerTienda();
    if (c.tipo == 'tesoro') {
      ponerCofre(240, 160, false, 'raro');
      soltarMonedas(240, 200, 8);
    }
    if (c.tipo == 'secreto') {
      ponerCofre(240, 150, false, 'raro');
      soltarMonedas(240, 195, 22);
      G.pick.push({ x: 200, y: 180, t: 0 });
    }
  }
  if (!lado) G.aviso = { txt: Z.n, l: 120 };
  if (c.tipo == 'secreto' && !c.est) G.aviso = { txt: 'Sala secreta', l: 90 };
}
function crearOleadas(c) {
  const Z = ZONAS[G.zona],
    D = G.dif,
    n = (c.tipo == 'llave' ? 2 : 1 + (Math.random() < 0.55 ? 1 : 0)) + D.olas,
    L = [];
  for (let i = 0; i < n; i++) {
    const k = Math.round(rnd(4, 6.5) * D.cant) + G.zona;
    L.push([...Array(k)].map(() => Z.enem[Math.floor(Math.random() * Z.enem.length)]));
  }
  return L;
}
function cuartoLimpio() {
  const c = G.room;
  c.limpio = true;
  revivirTodos();
  G.cerrado = 0;
  G.oleadas = null;
  sfx('puerta');
  G.aviso = { txt: 'Cuarto despejado', l: 80 };
  if (c.tipo == 'llave') ponerCofre(240, 170, false, 'llave');
  else if (Math.random() < 0.45) ponerCofre(240, 170, Math.random() < 0.15);
  else if (Math.random() < 0.3 * G.dif.poc) G.pick.push({ x: 240, y: 170, t: 0 });
}
function ponerEscalera() {
  G.escalera = { x: 240, y: 150 };
  burst(240, 150, 40, '#ffe94a', 3);
  ring(240, 150, 24, '#ffe94a', 16);
}
// Puertas: abiertas si el cuarto no está en pelea; la del jefe pide la llave; la secreta se rompe a golpes.
const puertaAbierta = l => {
  const pc = G.room && G.room.p[l];
  return !!pc && pc.abierta && !G.cerrado;
};
function golpePared(x, y, r) {
  const c = G.room;
  if (!c) return;
  Object.keys(c.p).forEach(l => {
    const pc = c.p[l],
      [px, py] = PUERTA_POS[l];
    if (pc.tipo != 'secreta' || pc.abierta || Math.hypot(x - px, y - py) > (r || 0) + 28) return;
    pc.golpes = (pc.golpes || 0) + 1;
    burst(px, py, 10, '#8a7a9a', 2.5, 24, 2, 0.12);
    G.shake = Math.max(G.shake, 3);
    sfx('golpe');
    if (pc.golpes >= 3) {
      pc.abierta = true;
      const n = vecino(c, l);
      if (n) n.conocido = true;
      burst(px, py, 40, '#c3b6d9', 3.5, 30, 2, 0.12);
      ring(px, py, 26, '#ffe94a', 16);
      G.aviso = { txt: '¡Un pasaje secreto!', l: 90 };
      sfx('cofre');
    }
  });
}
function updateMundo() {
  const c = G.room,
    P = G.P,
    algun = f => vivos().some(f),
    quien = f => vivos().find(f);
  if (!c || G.over || G.salir) return;
  Object.keys(c.p).forEach(l => {
    const pc = c.p[l],
      [px, py] = PUERTA_POS[l];
    if (pc.tipo == 'llave' && !pc.abierta && !G.cerrado && algun(Q => Math.hypot(Q.x - px, Q.y - py) < 34)) {
      if (P.llaves > 0) {
        P.llaves--;
        pc.abierta = true;
        sfx('puerta');
        burst(px, py, 30, '#ffe94a', 3);
        ring(px, py, 22, '#ffe94a', 14);
        G.aviso = { txt: 'Puerta del jefe abierta', l: 80 };
      } else if (!G.avisoLlave || G.t - G.avisoLlave > 120) {
        G.avisoLlave = G.t;
        G.aviso = { txt: 'Necesitas la llave de esta zona', l: 80 };
      }
    }
  });
  const sale = (l, Q) => {
    if (Q && puertaAbierta(l)) {
      // En la Torre, la puerta de arriba lleva al piso siguiente.
      if (G.torre) {
        siguientePiso();
        return true;
      }
      const n = vecino(c, l);
      // En línea, cada uno cruza solo y puede ir a otro cuarto (jugadores/salas-separadas.js).
      if (n && puedeSeparar()) {
        if (!Q.cruzando) {
          Q.cruzando = 1;
          pendientesSala.push(() => salirSolo(Q, n, OPUESTO[l]));
        }
        return true;
      }
      if (n) {
        entrarCuarto(n, OPUESTO[l]);
        return true;
      }
    }
    return false;
  };
  if (
    sale(
      'N',
      quien(Q => Q.y < 26),
    ) ||
    sale(
      'S',
      quien(Q => Q.y > 306),
    ) ||
    sale(
      'W',
      quien(Q => Q.x < 12),
    ) ||
    sale(
      'E',
      quien(Q => Q.x > 468),
    )
  )
    return;
  if (G.escalera && algun(Q => Math.hypot(Q.x - G.escalera.x, Q.y - G.escalera.y - 4) < 12)) {
    G.salir = 1;
    sfx('puerta');
  }
}
function drawPuertas() {
  const c = G.room,
    t = G.t;
  if (!c) return;
  Object.keys(c.p).forEach(l => {
    const pc = c.p[l],
      ab = puertaAbierta(l),
      [px, py] = PUERTA_POS[l];
    if (pc.tipo == 'secreta' && !pc.abierta) {
      w.strokeStyle = '#120c18';
      w.lineWidth = 1;
      w.beginPath();
      const g = pc.golpes || 0;
      for (let k = 0; k < 3 + g * 3; k++) {
        const a = k * 2.1,
          r0 = 2 + (k % 3) * 3;
        w.moveTo(px + Math.cos(a) * r0, py + Math.sin(a) * r0);
        w.lineTo(px + Math.cos(a) * (r0 + 5 + g * 2), py + Math.sin(a) * (r0 + 4 + g * 2));
      }
      w.stroke();
      return;
    }
    if (l == 'N') {
      const dr = ab ? R.doorOpen : R.doorClosed;
      w.drawImage(atlas, 16, 240, 16, 32, 208, 0, 16, 32);
      w.drawImage(atlas, 64, 240, 16, 32, 256, 0, 16, 32);
      w.drawImage(atlas, dr[0], dr[1], 32, 32, 224, 0, 32, 32);
    } else {
      const [x, y, ww, hh] = l == 'S' ? [224, 304, 32, 16] : l == 'W' ? [0, 144, 16, 32] : [464, 144, 16, 32];
      w.fillStyle = ab ? '#0a0612' : '#1a1226';
      w.fillRect(x, y, ww, hh);
      if (!ab) {
        w.fillStyle = '#8a8fa8';
        if (l == 'S') for (let i = 0; i < 5; i++) w.fillRect(x + 3 + i * 6, y, 2, hh);
        else for (let i = 0; i < 5; i++) w.fillRect(x, y + 3 + i * 6, ww, 2);
      }
    }
    if (pc.tipo == 'llave' && !pc.abierta) {
      const b = Math.sin(t * 0.1) * 1.5;
      w.fillStyle = '#c08a2a';
      w.fillRect(px - 5, py - 3 + b, 10, 8);
      w.strokeStyle = '#ffe94a';
      w.lineWidth = 1.5;
      w.beginPath();
      w.arc(px, py - 3 + b, 3.5, Math.PI, 0);
      w.stroke();
      w.fillStyle = '#2a1a08';
      w.fillRect(px - 1, py + b, 2, 3);
    }
    if (ab && pc.tipo != 'secreta' && !G.salir && t % 40 < 20) {
      w.fillStyle = 'rgba(255,233,74,.5)';
      const [ex, ey] = ENTRADA[l];
      w.fillRect(ex - 1, ey - 14, 2, 2);
    }
  });
  if (G.escalera) {
    const s = G.escalera;
    w.globalAlpha = 0.35 + Math.sin(t * 0.1) * 0.15;
    w.fillStyle = '#ffe94a';
    w.beginPath();
    w.ellipse(s.x, s.y + 8, 14, 5, 0, 0, 7);
    w.fill();
    w.globalAlpha = 1;
    w.drawImage(atlas, 80, 192, 16, 16, s.x - 8, s.y, 16, 16);
  }
}
// Minimapa: cuartos vistos, conocidos y el actual; iconos de jefe, llave, tienda, tesoro y secreto.
function drawMinimapa(x0, y0) {
  const M = G.mundo;
  if (!M) return;
  const cw = 22,
    ch = 15,
    gap = 4;
  Object.values(M.cu).forEach(c => {
    if (!c.visto && !c.conocido) return;
    const x = x0 + c.x * (cw + gap),
      y = y0 + c.y * (ch + gap);
    Object.keys(c.p).forEach(l => {
      const pc = c.p[l];
      if (pc.tipo == 'secreta' && !pc.abierta) return;
      const [dx, dy] = LADOS[l];
      o.fillStyle = pc.tipo == 'llave' && !pc.abierta ? '#c08a2a' : '#4e4070';
      o.fillRect(
        x + cw / 2 - 2 + dx * (cw / 2 + 1),
        y + ch / 2 - 2 + dy * (ch / 2 + 1),
        4 + Math.abs(dy) * 0,
        4,
      );
    });
    o.fillStyle =
      c === G.room
        ? '#ffe94a'
        : c === cuartoDelAmigo()
          ? '#ff8a2a'
          : c.visto
            ? c.limpio ||
              c.tipo == 'inicio' ||
              c.tipo == 'tienda' ||
              c.tipo == 'tesoro' ||
              c.tipo == 'secreto'
              ? '#6a4cff'
              : '#a0204a'
            : 'rgba(78,64,112,.5)';
    o.fillRect(x, y, cw, ch);
    o.strokeStyle = '#0b0812';
    o.lineWidth = 1;
    o.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
    const ico = {
      jefe: '#ff2a4a',
      llave: '#ffe94a',
      tienda: '#7cff4a',
      tesoro: '#5ee7ff',
      secreto: '#ff8aff',
    }[c.tipo];
    if (ico && (c.visto || c.tipo == 'jefe')) {
      o.fillStyle = c === G.room ? '#0b0812' : ico;
      o.fillRect(x + cw / 2 - 3, y + ch / 2 - 3, 6, 6);
    }
  });
}
