// Segundo round de los jefes: al morir la primera vez se transforman en su forma de furia (JEFES[id].segundo).
// Aquí está lo común: la transformación, los peligros que dejan (tornados, marcas del cielo y gas),
// su dibujo y la batería que se suma a la música.

function iniciarSegundoRound(B) {
  B.hp = 0;
  B.seg = B.def.segundo;
  B.trans = { t: 0 };
  B.st = 'move';
  B.tele = null;
  B.oculto = 0;
  B.z = 0;
  limpiarBalas();
  G.enem.forEach(m => (m.hp = 0));
  G.spawns = [];
  G.tornados = [];
  G.cielo = [];
  G.gases = [];
  G.slow = 0.4;
  G.slowT = 70;
  G.zt = 1.4;
  sfx('rugido');
  if (fuenteM && AC) fuenteM.g.gain.linearRampToValueAtTime(0.2, AC.currentTime + 1);
}

// Se desploma, la sala tiembla y se levanta más grande, con su color de furia y la vida llena.
function pasoTransformacion(B) {
  const D = JEFES[B.seg],
    C = D.color,
    t = ++B.trans.t;
  if (D.alTransformar) D.alTransformar(B, t);
  G.jug.forEach(P => (P.inv = Math.max(P.inv, 30)));
  G.zt = 1.4;
  if (t < 70) {
    B.hit = t % 8 < 4 ? 4 : 0;
    G.dark = Math.min(0.7, G.dark + 0.02);
    if (t % 4 == 0)
      burst(B.x + rnd(-20, 20), B.y - rnd(0, 50), 6, Math.random() < 0.5 ? '#3a2e3e' : C, 2, 40, 2, -0.02);
    if (t % 12 == 0) G.shake = 6;
  }
  if (t == 70) {
    G.flash = 10;
    G.fcol = C;
    B.def = D;
    B.max = Math.round(D.hp * G.dif.jefe);
    B.phase = 1;
    sfx('ultCarga');
  }
  if (t >= 70 && t < 130) {
    B.hp = Math.round((B.max * (t - 70)) / 60);
    B.esc = B.esc0 * (1 + (0.2 * (t - 70)) / 60);
    if (t % 6 == 0) {
      G.bolts.push(Object.assign(rayoPts(B.x + rnd(-16, 16), B.y - 260, B.x, B.y - 30), { gordo: 1, l: 12 }));
      G.shake = 10;
    }
  }
  if (t == 100) G.banner = { txt: 'SOBREVIVE', t: 0, c: C };
  if (t == 130) {
    G.banner = null;
    B.hp = B.max;
    B.esc = B.esc0 * 1.2;
    B.trans = null;
    B.berserk = 1;
    B.cd = 40;
    B.say = D.grito;
    B.sayT = 120;
    G.shake = 22;
    G.flash = 8;
    G.fcol = '#ffffff';
    G.zt = zb();
    ring(B.x, B.y - 30, 110, C, 28, 4);
    bossFire(36, 1.6, 0, C, B.x, B.y - 34);
    sfx('ultFinal');
    // Algunos jefes cambian de tema al revivir (uno con más tambores); encima suena la capa de furia.
    if (D.musica2) musica(D.musica2);
    musicaFuria(D.bpm);
  }
}

// Atlas teñido del color de furia de cada jefe (se prepara una vez).
const tintesFuria = {};
const atlasTono = col => tintesFuria[col] || (tintesFuria[col] = tint(col));
const atlasFuria = seg => atlasTono(JEFES[seg].color);

// Marcas del cielo: el suelo avisa y, al terminar la cuenta, cae algo. Cada una devuelve su radio de daño.
const CAE = {
  rayo: m => {
    G.bolts.push(Object.assign(rayoPts(m.x + rnd(-12, 12), -20, m.x, m.y), { gordo: 1, l: 12 }));
    ring(m.x, m.y, 22, '#b06bff', 12, 2);
    burst(m.x, m.y, 18, '#b9f3ff', 3);
    bossFire(6, 1.4, rnd(0, 1), '#b06bff', m.x, m.y - 4);
    decal(m.x, m.y + 2, 6, '#1a1030', 300);
    sfx('trueno');
    return 20;
  },
  meteoro: m => {
    ring(m.x, m.y, 28, '#ff8a2a', 14, 3);
    burst(m.x, m.y, 30, '#ff8a2a', 3.5, 26, 2, 0.05);
    bossFire(8, 1.3, rnd(0, 1), '#ff8a2a', m.x, m.y - 4);
    decal(m.x, m.y + 2, 12, '#140806', 500);
    sfx('explosion');
    return 22;
  },
  roca: m => {
    ring(m.x, m.y, 26, '#c8a070', 14, 3);
    burst(m.x, m.y, 30, '#8a7a6a', 3.5, 30, 2, 0.12);
    bossFire(10, 1.4, rnd(0, 1), '#e0b890', m.x, m.y - 4);
    decal(m.x, m.y + 2, 12, '#1a120a', 600);
    G.shake = Math.max(G.shake, 5);
    sfx('caida');
    return 22;
  },
  veneno: m => {
    for (let i = 0; i < 10; i++) {
      const a = (i * 6.283) / 10,
        v = rnd(0.8, 1.6);
      G.bul.push({
        x: m.x,
        y: m.y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        c: '#7cff4a',
        r: 3,
        charco: Math.round(rnd(14, 30)),
      });
    }
    ring(m.x, m.y, 26, '#7cff4a', 14, 3);
    burst(m.x, m.y, 26, '#3a8a1a', 3, 26, 2, 0.06);
    sfx('veneno');
    return 18;
  },
  tumba: m => {
    spawnEnemigo('tiny', m.x, m.y);
    bossFire(6, 1.3, rnd(0, 1), '#7cff4a', m.x, m.y - 4);
    burst(m.x, m.y, 24, '#6a5a3a', 3, 30, 2, 0.12);
    decal(m.x, m.y + 2, 9, '#14240a', 600);
    sfx('golpe');
    return 14;
  },
};

// Tornados, marcas del cielo y nubes de gas; se mueven aunque el jefe esté atacando.
function updateFinal() {
  if (G.U || G.over) return;
  G.tornados.forEach(tn => {
    tn.t++;
    tn.l--;
    const P = masCercano(tn),
      a =
        tn.sale !== undefined && tn.t < 50
          ? tn.sale
          : Math.atan2(P.y - tn.y, P.x - tn.x) + Math.sin(tn.t * 0.04 + (tn.sale || 0)) * 1.5,
      v = tn.sale !== undefined && tn.t < 50 ? 1.6 : 0.65;
    [tn.x, tn.y] = enSala(tn.x + Math.cos(a) * v, tn.y + Math.sin(a) * v);
    vivos().forEach(Q => {
      const d = Math.hypot(Q.x - tn.x, Q.y - tn.y);
      if (d < 16) conJugador(Q, hurtPlayer);
      else if (d < 60 && !Q.dash) {
        const k = 0.45 * (1 - d / 60);
        if (!solidAt(Q.x + ((tn.x - Q.x) / d) * k, Q.y, 4)) Q.x += ((tn.x - Q.x) / d) * k;
        if (!solidAt(Q.x, Q.y + ((tn.y - Q.y) / d) * k, 4)) Q.y += ((tn.y - Q.y) / d) * k;
      }
    });
    if (tn.t % 45 == 0 && !tn.sinBalas)
      bossFire(3, 1.2, tn.t * 0.1, tn.negro ? '#8a2aff' : '#c3b6d9', tn.x, tn.y - 12);
    if (tn.t % 2 == 0)
      G.pt.push({
        x: tn.x + rnd(-10, 10),
        y: tn.y - rnd(0, 30),
        vx: rnd(-1, 1),
        vy: -0.6,
        l: 18,
        m: 18,
        c: tn.negro ? (tn.t % 4 ? '#8a2aff' : '#12051e') : '#8a7a9a',
        s: 1,
        g: 0,
      });
    if (tn.l <= 0) burst(tn.x, tn.y - 14, 30, '#c3b6d9', 3);
  });
  G.tornados = G.tornados.filter(tn => tn.l > 0);
  G.cielo.forEach(m => {
    if (--m.t > 0) return;
    m.d = 1;
    const r = CAE[m.tipo](m);
    vivos().forEach(Q => Math.hypot(Q.x - m.x, Q.y - m.y) < r && conJugador(Q, hurtPlayer));
  });
  G.cielo = G.cielo.filter(m => !m.d);
  G.gases.forEach(g => {
    g.l--;
    g.r = Math.min(g.max, g.r + 0.5);
    vivos().forEach(Q => Math.hypot(Q.x - g.x, (Q.y - g.y) * 1.4) < g.r && conJugador(Q, hurtPlayer));
    if (G.t % 3 == 0)
      G.pt.push({
        x: g.x + rnd(-g.r, g.r) * 0.8,
        y: g.y + rnd(-g.r, g.r) * 0.4,
        vx: 0,
        vy: -0.3,
        l: 26,
        m: 26,
        c: g.c ? (Math.random() < 0.5 ? g.c : g.c2) : Math.random() < 0.5 ? '#7cff4a' : '#3a8a1a',
        s: 2,
        g: 0,
      });
  });
  G.gases = G.gases.filter(g => g.l > 0);
}

const COLOR_MARCA = {
  rayo: '#b06bff',
  meteoro: '#ff8a2a',
  roca: '#c8a070',
  veneno: '#7cff4a',
  tumba: '#6a5a3a',
};
const CAIDA = {
  meteoro: ['#ff8a2a', '#ffe94a', 5],
  roca: ['#6a5a4a', '#a08070', 7],
  veneno: ['#3a8a1a', '#7cff4a', 5],
};
// Marcas en el suelo, lo que cae, el gas y el aura del jefe enfurecido.
function drawFinalSuelo(B) {
  const t = G.t;
  G.gases.forEach(g => {
    const k = Math.min(1, g.l / 40);
    w.globalAlpha = 0.3 * k;
    // El gas es verde; el suelo en llamas del dragón, de su fuego.
    w.fillStyle = g.c || '#3a8a1a';
    w.beginPath();
    w.ellipse(g.x, g.y, g.r, g.r * 0.6, 0, 0, 7);
    w.fill();
    w.globalAlpha = 0.2 * k;
    w.fillStyle = g.c2 || '#7cff4a';
    w.beginPath();
    w.ellipse(g.x + Math.sin(t * 0.04) * 5, g.y - 4, g.r * 0.7, g.r * 0.4, 0, 0, 7);
    w.fill();
    w.globalAlpha = 1;
  });
  G.cielo.forEach(m => {
    const k = 1 - m.t / m.m,
      c = COLOR_MARCA[m.tipo];
    w.globalAlpha = 0.25 + k * 0.4;
    w.fillStyle = c;
    w.beginPath();
    w.ellipse(m.x, m.y, 14 * k + 2, (14 * k + 2) * 0.4, 0, 0, 7);
    w.fill();
    w.globalAlpha = 1;
    w.strokeStyle = t % 6 < 3 ? c : '#ffffff';
    w.lineWidth = 1;
    w.beginPath();
    w.ellipse(m.x, m.y, 16, 6.4, 0, 0, 7);
    w.stroke();
    const caida = CAIDA[m.tipo];
    if (caida) {
      const y = m.y - m.t * 5;
      w.fillStyle = caida[0];
      w.beginPath();
      w.arc(m.x, y, caida[2], 0, 7);
      w.fill();
      w.fillStyle = caida[1];
      w.beginPath();
      w.arc(m.x - 1, y - 1, caida[2] * 0.6, 0, 7);
      w.fill();
    }
  });
  if (B.berserk && !B.dead) {
    const C = B.def.color;
    for (let i = 0; i < 3; i++)
      G.pt.push({
        x: B.x + rnd(-22, 22),
        y: B.y - rnd(0, 70),
        vx: rnd(-0.3, 0.3),
        vy: -rnd(0.6, 1.4),
        l: 22,
        m: 22,
        c: [C, '#ff8a2a', '#2a0010'][i],
        s: 2,
        g: 0,
      });
    if (B.moving && t % 3 == 0)
      G.ghosts.push({ boss: 1, x: B.x, y: B.y, face: B.face, l: 10, fr: B.def.run[0] });
  }
}

function drawTornados() {
  const t = G.t;
  G.tornados.forEach(tn => {
    const k = Math.min(1, tn.l / 30);
    w.globalAlpha = 0.75 * k;
    for (let i = 0; i < 7; i++) {
      w.strokeStyle = i % 2 ? '#c3b6d9' : '#6a5a8a';
      w.lineWidth = 2;
      w.beginPath();
      w.ellipse(
        tn.x + Math.sin(t * 0.3 + i) * i * 0.8,
        tn.y - i * 6,
        4 + i * 2.6,
        1.5 + i * 0.9,
        0,
        t * 0.4 + i,
        t * 0.4 + i + 4.5,
      );
      w.stroke();
    }
    for (let i = 0; i < 4; i++) {
      const a = t * 0.25 + i * 1.57;
      w.fillStyle = '#8a7a9a';
      w.fillRect(Math.round(tn.x + Math.cos(a) * 14), Math.round(tn.y - 16 + Math.sin(a) * 5), 2, 2);
    }
    w.globalAlpha = 1;
  });
}

// ---------- Música del segundo round ----------
// El tema del jefe se acelera un poco y encima suena una batería rápida con bajo grave.
let capaFuria = null;
function musicaFuria(bpm) {
  if (!musicaDeMiCuarto({ tipo: 'furia', bpm })) return;
  if (!AC) return;
  if (fuenteM) {
    fuenteM.g.gain.linearRampToValueAtTime(1, AC.currentTime + 0.5);
    fuenteM.ss.forEach(s => {
      s.playbackRate.setValueAtTime(s.playbackRate.value, AC.currentTime);
      s.playbackRate.linearRampToValueAtTime(1.07, AC.currentTime + 2);
    });
  }
  capaFuria = { paso: 0, prox: AC.currentTime + 0.1, tema: temaAct, bpm: bpm || 180 };
}
function platillo(t) {
  const s = AC.createBufferSource(),
    f = AC.createBiquadFilter(),
    g = AC.createGain();
  s.buffer = noise;
  f.type = 'highpass';
  f.frequency.value = 7000;
  g.gain.setValueAtTime(0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  s.connect(f);
  f.connect(g);
  g.connect(bus());
  s.start(t, Math.random() * 0.5);
  s.stop(t + 0.05);
}
setInterval(() => {
  if (!AC || !capaFuria) return;
  if (temaAct !== capaFuria.tema) {
    capaFuria = null;
    return;
  }
  if (capaFuria.prox < AC.currentTime - 0.2) capaFuria.prox = AC.currentTime + 0.02;
  const sd = 60 / capaFuria.bpm / 4;
  while (capaFuria.prox < AC.currentTime + 0.15) {
    const st = capaFuria.paso % 16,
      t = capaFuria.prox;
    if (st % 4 == 0 || st == 10) golpeM('k', t);
    if (st == 4 || st == 12) golpeM('s', t);
    platillo(t);
    if (st % 8 == 0) notaM('sawtooth', 41.2, t, sd * 3, 0.06);
    capaFuria.paso++;
    capaFuria.prox += sd;
  }
}, 40);
