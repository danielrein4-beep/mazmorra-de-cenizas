// Jefe final: ataques nuevos del Señor de las Cenizas y su segundo round como Furia Eterna (modo berserker),
// con tornados que persiguen y arrastran, tormenta de rayos por todo el mapa y música más intensa.

// Ataques nuevos que se suman a los del primer round.
JEFES.cenizas.ataques[1].push('meteoros');
JEFES.cenizas.ataques[2].push('teleporte', 'meteoros');
JEFES.cenizas.ataques[3].push('lanzallamas', 'teleporte', 'meteoros');

JEFES.furia = {
  n: 'Furia Eterna',
  sub: 'Sobrevive si puedes',
  idle: JEFES.cenizas.idle,
  run: JEFES.cenizas.run,
  hp: 3400,
  sp: 1.05,
  fases: [[0.45, '¡NO ME VOY SOLO!']],
  ataques: {
    1: ['tornados', 'tormenta', 'furia', 'espiralInfernal', 'meteoros', 'teleporte'],
    2: ['tornados', 'tormenta', 'furia', 'espiralInfernal', 'lanzallamas', 'teleporte', 'tormenta'],
  },
};

Object.assign(ATAQUES, {
  // Meteoros que caen cerca de la heroína; la sombra en el suelo avisa dónde.
  meteoros: B => {
    if (B.t % 6 == 0 && B.t < 48) {
      const P = G.P,
        [x, y] = enSala(P.x + rnd(-60, 60), P.y + rnd(-40, 40));
      G.cielo.push({ x, y, t: 50, m: 50, tipo: 'meteoro' });
    }
    return B.t > 70;
  },
  // Se deshace en ceniza y reaparece detrás de la heroína con un anillo de balas.
  teleporte: (B, cx, cy, f) => {
    if (B.t == 1) {
      burst(cx, cy, 50, '#3a2e3e', 3, 34, 2);
      burst(cx, cy, 20, '#ff5a3c', 2.5);
      B.oculto = 1;
      sfx('sombra');
    }
    if (B.t == 30) {
      const P = G.P,
        a = Math.atan2(P.y - B.y, P.x - B.x);
      [B.x, B.y] = enSala(P.x + Math.cos(a) * 90, P.y + Math.sin(a) * 60);
      B.oculto = 0;
      ring(B.x, B.y - 30, 40, '#ff5a3c', 16, 3);
      burst(B.x, B.y - 30, 40, '#3a2e3e', 3, 30, 2);
      bossFire(14 + B.phase * 2, 1.5 * f, rnd(0, 1), '#ff5a3c', B.x, B.y - 34);
      sfx('rugido');
    }
    return B.t > 50;
  },
  // Chorro de fuego que barre de un lado a otro.
  lanzallamas: (B, cx, cy, f) => {
    B.moving = false;
    if (B.t == 1) B.ang0 = Math.atan2(G.P.y - cy, G.P.x - cx);
    if (B.t % 2 == 0 && B.t < 80) {
      const a = B.ang0 + Math.sin(B.t * 0.06) * 0.7;
      G.bul.push({
        x: cx,
        y: cy + 6,
        vx: Math.cos(a) * 2.8 * f,
        vy: Math.sin(a) * 2.8 * f,
        c: B.t % 4 ? '#ff8a2a' : '#ffe94a',
        r: 3,
        l: 55,
      });
      G.pt.push({
        x: cx,
        y: cy + 6,
        vx: Math.cos(a) * 2,
        vy: Math.sin(a) * 2,
        l: 16,
        m: 16,
        c: '#ffe94a',
        s: 2,
        g: 0,
      });
    }
    if (B.t % 10 == 0 && B.t < 80) sfx('fuego');
    return B.t > 95;
  },
  tornados: B => {
    if (B.t == 12) {
      const n = G.dif.id == 'pesadilla' ? 3 : 2;
      for (let i = 0; i < n; i++)
        G.tornados.push({ x: B.x + Math.cos(i * 2.1) * 30, y: B.y + Math.sin(i * 2.1) * 20, l: 480, t: 0 });
      ring(B.x, B.y, 50, '#c3b6d9', 16, 3);
      sfx('dash');
    }
    return B.t > 40;
  },
  // Rayos marcados en el suelo por todo el mapa; algunos apuntan a la heroína.
  tormenta: B => {
    if (B.t % 5 == 0 && B.t < 100) {
      const P = G.P,
        [x, y] =
          Math.random() < 0.35
            ? enSala(P.x + rnd(-20, 20), P.y + rnd(-20, 20))
            : enSala(rnd(40, 440), rnd(60, 300));
      G.cielo.push({ x, y, t: 42, m: 42, tipo: 'rayo' });
    }
    G.dark = Math.max(G.dark, 0.35);
    return B.t > 120;
  },
  // Tres embestidas seguidas, cada una con un anillo de balas al chocar.
  furia: (B, cx, cy, f) => {
    const P = G.P;
    if (B.t == 1) {
      B.n = 0;
      B.ft = 0;
    }
    B.ft++;
    if (B.ft == 1) {
      const a = Math.atan2(P.y - B.y, P.x - B.x);
      B.dir = [Math.cos(a), Math.sin(a)];
      B.face = B.dir[0] < 0 ? -1 : 1;
    }
    if (B.ft < 18) {
      B.moving = false;
      G.shake = Math.max(G.shake, 1.5);
      return false;
    }
    B.moving = true;
    const v = 6.5 * f,
      nx = B.x + B.dir[0] * v,
      ny = B.y + B.dir[1] * v;
    if (nx < 40 || nx > WW - 40 || ny < 60 || ny > WH - 24 || B.ft > 70) {
      G.shake = 12;
      G.stop = 4;
      sfx('caida');
      ring(B.x, B.y, 40, '#ff2a4a', 14, 3);
      bossFire(12, 1.7, rnd(0, 1), '#ff2a4a', B.x, B.y - 20);
      B.n++;
      B.ft = 0;
      return B.n >= 3;
    }
    B.x = nx;
    B.y = ny;
    if (B.ft % 2 == 0) G.ghosts.push({ boss: 1, x: B.x, y: B.y, face: B.face, l: 12, fr: B.def.run[0] });
    return false;
  },
  espiralInfernal: (B, cx, cy, f) => {
    if (B.t % 3 == 0) {
      B.ang += 0.21;
      for (let k = 0; k < 6; k++) {
        const a = B.ang + k * 1.047;
        G.bul.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * 2 * f,
          vy: Math.sin(a) * 2 * f,
          c: k % 2 ? '#ff2a4a' : '#ff8a2a',
          r: 3,
        });
      }
    }
    return B.t > 130;
  },
});

// ---------- Segundo round ----------
function iniciarSegundoRound(B) {
  B.hp = 0;
  B.trans = { t: 0 };
  B.st = 'move';
  B.tele = null;
  B.oculto = 0;
  limpiarBalas();
  G.enem.forEach(m => (m.hp = 0));
  G.spawns = [];
  G.tornados = [];
  G.cielo = [];
  G.slow = 0.4;
  G.slowT = 70;
  G.zt = 1.4;
  sfx('rugido');
  if (fuenteM && AC) fuenteM.g.gain.linearRampToValueAtTime(0.2, AC.currentTime + 1);
}

// Se desploma entre cenizas, la sala tiembla y se levanta más grande, rojo y con la vida llena.
function pasoTransformacion(B) {
  const T = B.trans,
    t = ++T.t;
  G.jug.forEach(P => (P.inv = Math.max(P.inv, 30)));
  G.zt = 1.4;
  if (t < 70) {
    B.hit = t % 8 < 4 ? 4 : 0;
    G.dark = Math.min(0.7, G.dark + 0.02);
    if (t % 4 == 0)
      burst(
        B.x + rnd(-20, 20),
        B.y - rnd(0, 50),
        6,
        Math.random() < 0.5 ? '#3a2e3e' : '#ff5a3c',
        2,
        40,
        2,
        -0.02,
      );
    if (t % 12 == 0) G.shake = 6;
  }
  if (t == 70) {
    G.flash = 10;
    G.fcol = '#ff2a4a';
    B.def = JEFES.furia;
    B.max = Math.round(JEFES.furia.hp * G.dif.jefe);
    B.phase = 1;
    sfx('ultCarga');
  }
  if (t >= 70 && t < 130) {
    B.hp = Math.round((B.max * (t - 70)) / 60);
    B.esc = 2 + (0.4 * (t - 70)) / 60;
    if (t % 6 == 0)
      G.bolts.push(Object.assign(rayoPts(B.x + rnd(-16, 16), B.y - 260, B.x, B.y - 30), { gordo: 1, l: 12 }));
    if (t % 6 == 0) G.shake = 10;
  }
  if (t == 100) G.banner = { txt: 'SOBREVIVE', t: 0, c: '#ff2a4a' };
  if (t == 130) {
    G.banner = null;
    B.hp = B.max;
    B.esc = 2.4;
    B.trans = null;
    B.berserk = 1;
    B.cd = 40;
    B.say = '¡AHORA CONOZCAN MI FURIA!';
    B.sayT = 120;
    G.shake = 22;
    G.flash = 8;
    G.fcol = '#ffffff';
    G.zt = zb();
    ring(B.x, B.y - 30, 110, '#ff2a4a', 28, 4);
    bossFire(36, 1.6, 0, '#ff2a4a', B.x, B.y - 34);
    sfx('ultFinal');
    musicaFuria();
  }
}

// Tornados y marcas del cielo (rayos y meteoros); se actualizan aunque el jefe esté atacando.
function updateFinal() {
  if (G.U || G.over) return;
  G.tornados.forEach(tn => {
    tn.t++;
    tn.l--;
    const P = masCercano(tn),
      a = Math.atan2(P.y - tn.y, P.x - tn.x) + Math.sin(tn.t * 0.05) * 0.8;
    [tn.x, tn.y] = enSala(tn.x + Math.cos(a) * 0.9, tn.y + Math.sin(a) * 0.9);
    vivos().forEach(Q => {
      const d = Math.hypot(Q.x - tn.x, Q.y - tn.y);
      if (d < 16) conJugador(Q, hurtPlayer);
      else if (d < 70 && !Q.dash) {
        const k = 0.6 * (1 - d / 70);
        if (!solidAt(Q.x + ((tn.x - Q.x) / d) * k, Q.y, 4)) Q.x += ((tn.x - Q.x) / d) * k;
        if (!solidAt(Q.x, Q.y + ((tn.y - Q.y) / d) * k, 4)) Q.y += ((tn.y - Q.y) / d) * k;
      }
    });
    if (tn.t % 24 == 0) bossFire(4, 1.3, tn.t * 0.1, '#c3b6d9', tn.x, tn.y - 12);
    if (tn.t % 2 == 0)
      G.pt.push({
        x: tn.x + rnd(-10, 10),
        y: tn.y - rnd(0, 30),
        vx: rnd(-1, 1),
        vy: -0.6,
        l: 18,
        m: 18,
        c: '#8a7a9a',
        s: 1,
        g: 0,
      });
    if (tn.l <= 0) burst(tn.x, tn.y - 14, 30, '#c3b6d9', 3);
  });
  G.tornados = G.tornados.filter(tn => tn.l > 0);
  G.cielo.forEach(m => {
    if (--m.t > 0) return;
    m.d = 1;
    const daña = r => vivos().forEach(Q => Math.hypot(Q.x - m.x, Q.y - m.y) < r && conJugador(Q, hurtPlayer));
    if (m.tipo == 'rayo') {
      G.bolts.push(Object.assign(rayoPts(m.x + rnd(-12, 12), -20, m.x, m.y), { gordo: 1, l: 12 }));
      ring(m.x, m.y, 22, '#b06bff', 12, 2);
      burst(m.x, m.y, 18, '#b9f3ff', 3);
      bossFire(6, 1.4, rnd(0, 1), '#b06bff', m.x, m.y - 4);
      decal(m.x, m.y + 2, 6, '#1a1030', 300);
      daña(20);
      sfx('trueno');
    } else {
      ring(m.x, m.y, 28, '#ff8a2a', 14, 3);
      burst(m.x, m.y, 30, '#ff8a2a', 3.5, 26, 2, 0.05);
      bossFire(8, 1.3, rnd(0, 1), '#ff8a2a', m.x, m.y - 4);
      decal(m.x, m.y + 2, 12, '#140806', 500);
      daña(22);
      sfx('explosion');
    }
  });
  G.cielo = G.cielo.filter(m => !m.d);
}

// Marcas en el suelo (debajo de todo) y aura del berserker.
function drawFinalSuelo(B) {
  const t = G.t;
  G.cielo.forEach(m => {
    const k = 1 - m.t / m.m,
      c = m.tipo == 'rayo' ? '#b06bff' : '#ff8a2a';
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
    if (m.tipo == 'meteoro') {
      const y = m.y - m.t * 5;
      w.fillStyle = '#ff8a2a';
      w.beginPath();
      w.arc(m.x, y, 5, 0, 7);
      w.fill();
      w.fillStyle = '#ffe94a';
      w.beginPath();
      w.arc(m.x, y, 2.5, 0, 7);
      w.fill();
    }
  });
  if (B.berserk && !B.dead) {
    for (let i = 0; i < 3; i++)
      G.pt.push({
        x: B.x + rnd(-22, 22),
        y: B.y - rnd(0, 70),
        vx: rnd(-0.3, 0.3),
        vy: -rnd(0.6, 1.4),
        l: 22,
        m: 22,
        c: ['#ff2a4a', '#ff8a2a', '#2a0010'][i],
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
// El tema se acelera un poco y encima suena una batería rápida a 180 golpes por minuto.
let capaFuria = null;
function musicaFuria() {
  if (!AC) return;
  if (fuenteM) {
    fuenteM.g.gain.linearRampToValueAtTime(1, AC.currentTime + 0.5);
    fuenteM.ss.forEach(s => {
      s.playbackRate.setValueAtTime(s.playbackRate.value, AC.currentTime);
      s.playbackRate.linearRampToValueAtTime(1.07, AC.currentTime + 2);
    });
  }
  capaFuria = { paso: 0, prox: AC.currentTime + 0.1 };
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
  if (temaAct !== 'final') {
    capaFuria = null;
    return;
  }
  if (capaFuria.prox < AC.currentTime - 0.2) capaFuria.prox = AC.currentTime + 0.02;
  const sd = 60 / 180 / 4;
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
