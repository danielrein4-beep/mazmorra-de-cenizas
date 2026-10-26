// Efectos de las reliquias (datos/reliquias.js). Cada momento del juego llama a su gancho:
// golpear (dañar), derrotar (enemigos), rodar (dash), recibir golpe (hurtPlayer), lanzar (cast),
// cada paso del héroe, cada cuarto nuevo y el dibujo de rastros y dagas.
function darReliquia(P, id, callado) {
  if (!id || tiene(P, id)) return;
  const antes = SINERGIAS.filter(s => sinergia(P, s.id));
  P.rel = Object.assign({}, P.rel, { [id]: 1 });
  if (id == 'corazonWyrm') {
    P.max += 2;
    P.hp = P.max;
  }
  if (id == 'botasViento') P.sp *= 1.18;
  if (callado) return;
  const R0 = reliquia(id);
  G.aviso = { txt: R0.n, l: 90 };
  sfx('cofre');
  ring(P.x, P.y - 12, 24, R0.c, 16, 3);
  burst(P.x, P.y - 12, 30, R0.c, 3);
  SINERGIAS.filter(s => sinergia(P, s.id) && !antes.includes(s)).forEach(s => {
    G.banner = { txt: 'SINERGIA: ' + s.n.toUpperCase(), t: 0, c: '#ffd24a' };
    G.aviso = { txt: s.d, l: 160 };
    sfx('ultFinal');
  });
}

// Al golpear: devuelve el daño final. P.enRel evita que los golpes extra vuelvan a disparar efectos.
function relGolpe(P, tg, d) {
  if (!P.rel || P.enRel) return d;
  const r = tg.ref;
  P.relGolpes = (P.relGolpes || 0) + 1;
  if (tiene(P, 'dadoCaos')) d *= rnd(0.5, 3);
  if (tiene(P, 'ojoCazador') && P.relGolpes % 8 == 0) {
    d *= 2;
    burst(tg.x, tg.y, 10, '#7cff4a', 2.5);
  }
  if (P.velaT > 0) d *= 1.6;
  const vidaMax = r.max || r.hpMax || 1;
  if (tiene(P, 'verdugo') && r.hp < vidaMax * 0.3) {
    d *= 2;
    if (sinergia(P, 'cazadorNocturno') && !tg.boss && r.hp <= d && P.hp < P.max && Math.random() < 0.25)
      curar(P, 1);
  }
  if (tiene(P, 'brasaEterna')) r.quema = Math.max(r.quema || 0, 90);
  if (tiene(P, 'corazonEscarcha') && P.relGolpes % 6 == 0) r.frio = Math.max(r.frio || 0, tg.boss ? 40 : 90);
  if (tiene(P, 'colmillo')) {
    P.relSangre = (P.relSangre || 0) + d;
    if (P.relSangre >= 300) {
      P.relSangre = 0;
      curar(P, 1);
    }
  }
  P.enRel = 1;
  try {
    if (tiene(P, 'bobina') && P.relGolpes % 4 == 0)
      objetivos()
        .filter(o2 => o2.ref !== r)
        .sort((p, q) => Math.hypot(p.x - tg.x, p.y - tg.y) - Math.hypot(q.x - tg.x, q.y - tg.y))
        .slice(0, 2)
        .forEach(o2 => {
          if (Math.hypot(o2.x - tg.x, o2.y - tg.y) > 130) return;
          G.bolts.push(Object.assign(rayoPts(tg.x, tg.y, o2.x, o2.y), { l: 8 }));
          dañar(o2, Math.round(d * 0.5), 0, true);
          if (sinergia(P, 'tormentaHelada')) o2.ref.frio = Math.max(o2.ref.frio || 0, o2.boss ? 30 : 80);
        });
    if (tiene(P, 'runaEco') && P.relGolpes % 5 == 0 && !tg.jugador) {
      dañar(tg, Math.round(d * 0.5), 0, true);
      ring(tg.x, tg.y, 12, '#b06bff', 10);
    }
  } finally {
    P.enRel = 0;
  }
  return d;
}
function curar(P, n) {
  if (P.hp >= P.max) return;
  P.hp = Math.min(P.max, P.hp + n);
  burst(P.x, P.y - 14, 12, '#ff4a5a', 1.6);
  ring(P.x, P.y - 12, 12, '#ff8a9a', 10);
}

// Al caer un enemigo: los efectos los da quien lleve la reliquia.
function relMuerte(m) {
  vivos().forEach(P => {
    if (!P.rel) return;
    if (tiene(P, 'calavera'))
      conJugador(P, () => {
        ring(m.x, m.y - 6, 34, '#ff8a2a', 14, 3);
        burst(m.x, m.y - 6, 20, '#ffe94a', 3);
        P.enRel = 1;
        objetivos().forEach(
          o2 => o2.ref !== m && Math.hypot(o2.x - m.x, o2.y - m.y) < 34 + o2.r && dañar(o2, 22, 2, true),
        );
        P.enRel = 0;
        if (sinergia(P, 'pira')) G.rastros.push({ x: m.x, y: m.y, l: 150, r: 18, fuego: 1, own: P });
      });
    if (tiene(P, 'almaErrante'))
      for (let i = 0; i < (sinergia(P, 'legion') ? 2 : 1); i++)
        conJugador(P, () =>
          disparo('alma', m.x, m.y - 6, rnd(0, 6.283), 2, { r: 5, l: 150, dmg: 18, c: '#7cffc4' }),
        );
    if (tiene(P, 'codicia')) soltarMonedas(m.x, m.y - 4, 1);
    if (tiene(P, 'calizFuria')) P.meter = Math.min(100, P.meter + 10);
    if (tiene(P, 'fragmento') && Math.random() < 0.06) curar(P, 1);
  });
}

// Rodar: al empezar, mientras ruedas y al terminar.
function relRodarInicio(P) {
  if (!P.rel) return;
  if (tiene(P, 'relojArena')) P.cds = P.cds.map(c => Math.round(c * 0.66));
  P.rodadas = (P.rodadas || 0) + 1;
  if (tiene(P, 'sangreViva') && P.rodadas % 8 == 0) curar(P, 1);
}
function relRodando(P) {
  if (!P.rel || G.t % 3) return;
  const vapor = sinergia(P, 'vapor');
  if (tiene(P, 'botasBrasa') || tiene(P, 'capaEscarcha'))
    G.rastros.push({
      x: P.x,
      y: P.y,
      l: 110,
      r: vapor ? 16 : 11,
      fuego: tiene(P, 'botasBrasa'),
      hielo: tiene(P, 'capaEscarcha'),
      own: P,
    });
}
function relRodarFin(P) {
  if (tiene(P, 'alaFantasma'))
    G.ondas.push({ own: P, x: P.x, y: P.y, r: 6, max: 56, dmg: 20, hits: [], c: '#c3b6d9' });
}

// Al recibir un golpe (después de perder vida).
function relHerido(P) {
  if (!P.rel) return;
  if (tiene(P, 'espinas')) púas(P, 12);
  if (tiene(P, 'vela')) P.velaT = 240;
  if (tiene(P, 'relojDetenido') && P.hp <= 1 && !G.relojUsado) {
    G.relojUsado = 1;
    G.slow = 0.3;
    G.slowT = 150;
    G.banner = { txt: 'TIEMPO DETENIDO', t: 0, c: '#9af0ff' };
  }
}
function púas(P, n) {
  conJugador(P, () => {
    for (let i = 0; i < n; i++)
      disparo('hoja', P.x, P.y - 12, (i * 6.283) / n, 3.6, { r: 5, l: 40, dmg: 14, pierce: 3, c: '#a08070' });
  });
  ring(P.x, P.y - 12, 26, '#a08070', 12, 3);
}
// La pluma de fénix salva una vez por partida.
function relFenix(P) {
  if (!tiene(P, 'fenix') || P.fenixUsado) return false;
  P.fenixUsado = 1;
  P.hp = 4;
  P.inv = 120;
  G.banner = { txt: 'RENACE DE LAS CENIZAS', t: 0, c: '#ff8a2a' };
  burst(P.x, P.y - 14, 80, '#ff8a2a', 5, 40, 2);
  ring(P.x, P.y - 12, 60, '#ffe94a', 20, 4);
  sfx('ultFinal');
  return true;
}
function relEscudoRoto(P) {
  if (sinergia(P, 'bastion')) {
    púas(P, 12);
    púas(P, 12);
  }
}

// Al lanzar una técnica (antes = cuántos proyectiles había, para tocar solo los nuevos).
function relLanzar(P, antes) {
  if (!P.rel) return;
  const nuevos = G.shots.slice(antes);
  P.relLanzadas = (P.relLanzadas || 0) + 1;
  if (tiene(P, 'tomoGemelo'))
    nuevos.slice(0, 3).forEach(s =>
      (sinergia(P, 'ecoInfinito') ? [0.25, -0.25] : [0.25]).forEach(g => {
        const v = Math.hypot(s.vx, s.vy),
          b = Math.atan2(s.vy, s.vx) + g;
        G.shots.push(
          Object.assign({}, s, {
            vx: Math.cos(b) * v,
            vy: Math.sin(b) * v,
            dmg: Math.round(s.dmg * 0.6),
            hits: [],
          }),
        );
      }),
    );
  if (tiene(P, 'anilloPrisa')) P.cds[P.spell] = Math.round(P.cds[P.spell] * 0.75);
  if (tiene(P, 'piedraEco') && Math.random() < 0.25) {
    P.cds[P.spell] = 0;
    ring(P.x, P.y - 12, 16, '#c3b6d9', 10);
  }
  if (tiene(P, 'orbeCanal') && P.relLanzadas % 5 == 0) {
    nuevos.forEach(s =>
      Object.assign(s, { brillo: '#ffd24a', estalla: '#ffd24a', pierce: s.pierce + 2, r: s.r * 1.4 }),
    );
    ring(P.x, P.y - 12, 28, '#ffd24a', 14, 3);
  }
}

// Cada paso del héroe: aura, dagas, vela y libro.
function relPaso(P) {
  if (!P.rel) return;
  if (P.velaT > 0) P.velaT--;
  if (tiene(P, 'libroProhibido') && P.gcd > 0) P.gcd--;
  if (tiene(P, 'auraArdiente') && G.t % 20 == 0)
    G.enem.forEach(m => Math.hypot(m.x - P.x, m.y - P.y) < 36 && (m.quema = Math.max(m.quema || 0, 60)));
  if (tiene(P, 'dagas')) {
    const n = sinergia(P, 'torbellino') ? 4 : 2;
    P.dagaA = (P.dagaA || 0) + (n == 4 ? 0.12 : 0.08);
    for (let i = 0; i < n; i++) {
      const a = P.dagaA + (i * 6.283) / n,
        dx = P.x + Math.cos(a) * 26,
        dy = P.y - 12 + Math.sin(a) * 18;
      objetivos().forEach(o2 => {
        if (Math.hypot(o2.x - dx, o2.y - dy) > o2.r + 6 || (o2.ref.dagaT || 0) > G.t) return;
        o2.ref.dagaT = G.t + 20;
        dañar(o2, 9, 0, true);
      });
    }
  }
}
// Cada cuarto nuevo: el escudo rúnico se renueva.
function relSala() {
  G.jug.forEach(P => tiene(P, 'escudoRunico') && (P.muralla = Math.max(P.muralla || 0, 1)));
}
// Rastros de fuego y hielo en el suelo (una vez por sala en cada paso).
function relRastros() {
  G.rastros.forEach(z => {
    z.l--;
    if (G.t % 10) return;
    G.enem.forEach(m => {
      if (Math.hypot(m.x - z.x, m.y - z.y) > z.r + 6) return;
      if (z.fuego) m.quema = Math.max(m.quema || 0, 60);
      if (z.hielo) m.frio = Math.max(m.frio || 0, 50);
    });
    if (G.B && !G.B.dead && Math.hypot(G.B.x - z.x, G.B.y - z.y) < z.r + 16) {
      if (z.fuego) G.B.quema = Math.max(G.B.quema || 0, 40);
      if (z.hielo) G.B.frio = Math.max(G.B.frio || 0, 20);
    }
  });
  G.rastros = G.rastros.filter(z => z.l > 0);
}
function drawReliquiasMundo() {
  G.rastros.forEach(z => {
    w.globalAlpha = Math.min(0.5, z.l / 60);
    w.fillStyle =
      z.fuego && z.hielo ? (G.t % 10 < 5 ? '#ff8a2a' : '#9af0ff') : z.fuego ? '#ff6a2a' : '#9af0ff';
    w.beginPath();
    w.ellipse(z.x, z.y, z.r, z.r * 0.45, 0, 0, 7);
    w.fill();
  });
  w.globalAlpha = 1;
  G.jug.forEach(P => {
    if (!tiene(P, 'dagas') || P.caido) return;
    const n = sinergia(P, 'torbellino') ? 4 : 2;
    for (let i = 0; i < n; i++) {
      const a = (P.dagaA || 0) + (i * 6.283) / n;
      w.save();
      w.translate(P.x + Math.cos(a) * 26, P.y - 12 + Math.sin(a) * 18);
      w.rotate(a + 1.57);
      w.drawImage(atlas, 293, 10, 6, 13, -3, -6, 6, 13);
      w.restore();
    }
  });
}
// Espíritu del alma errante: busca al enemigo más cercano.
SHOT_T.alma = {
  fantasma: 1,
  mover: s => {
    const o2 = objetivos(s.own)
      .filter(t => !t.jugador)
      .sort((p, q) => Math.hypot(p.x - s.x, p.y - s.y) - Math.hypot(q.x - s.x, q.y - s.y))[0];
    if (o2) {
      const a = Math.atan2(o2.y - s.y, o2.x - s.x);
      s.vx += Math.cos(a) * 0.25;
      s.vy += Math.sin(a) * 0.25;
      const v = Math.hypot(s.vx, s.vy);
      if (v > 3) {
        s.vx *= 3 / v;
        s.vy *= 3 / v;
      }
    }
    s.x += s.vx;
    s.y += s.vy;
  },
  trail: s => G.pt.push({ x: s.x, y: s.y, vx: 0, vy: 0, l: 12, m: 12, c: '#7cffc4', s: 1, g: 0 }),
  draw: s => {
    w.fillStyle = '#7cffc4';
    w.beginPath();
    w.arc(s.x, s.y, 3, 0, 7);
    w.fill();
    w.fillStyle = '#ffffff';
    w.fillRect(s.x - 1, s.y - 1, 2, 2);
  },
};
