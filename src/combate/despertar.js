// Poderes que se sienten más rotos con cada nivel (forja guardada + mejoras de la partida, ver nucleo/forja.js):
// III: más grandes y con brillo de su color. IV: un eco repite cada disparo y los golpes sueltan una onda.
// V, el despertar: atraviesan, estallan al pegar y el héroe lleva un aura mientras lanza.
function despertarTecnica(P, id, antes, a, ox, oy) {
  const nv = nivelTec(P, id),
    c = TEC[id].c;
  if (nv < 3) return;
  const nuevos = G.shots.slice(antes);
  ring(ox, oy, 8 + nv * 4, c, 10, nv >= 5 ? 3 : 2);
  nuevos.forEach(s => {
    s.r *= 1 + 0.15 * (nv - 2);
    s.brillo = c;
    if (nv >= 5) {
      s.pierce += 2;
      s.estalla = c;
    }
  });
  if (nv >= 4) {
    if (nuevos.length)
      nuevos.slice(0, 4).forEach(s =>
        [-1, 1].forEach(lado => {
          const giro = 0.14 * lado,
            v = Math.hypot(s.vx, s.vy) * 0.9,
            b = Math.atan2(s.vy, s.vx) + giro;
          G.shots.push(
            Object.assign({}, s, {
              vx: Math.cos(b) * v,
              vy: Math.sin(b) * v,
              dmg: Math.round(s.dmg * 0.45),
              hits: [],
            }),
          );
        }),
      );
    else
      G.ondas.push({
        own: P,
        x: P.x,
        y: P.y,
        r: 6,
        max: 46 + 18 * (nv - 4),
        dmg: Math.round(10 * nv),
        hits: [],
        c,
      });
  }
  if (nv >= 5) {
    P.aura = 40;
    P.auraC = c;
    G.shake = Math.max(G.shake, 3);
  }
}

// Despertar: el proyectil estalla y alcanza a los que estén cerca del golpeado.
function almaEstalla(s, tg) {
  ring(s.x, s.y, 26, s.estalla, 12, 3);
  burst(s.x, s.y, 18, s.estalla, 3, 22);
  burst(s.x, s.y, 8, '#ffffff', 2, 16);
  objetivos().forEach(o2 => {
    if (o2.ref !== tg.ref && Math.hypot(o2.x - s.x, o2.y - s.y) < 30 + o2.r)
      dañar(o2, Math.round(s.dmg * 0.4), 0, true);
  });
}

// Brillo de los proyectiles despertados (antes de dibujarlos).
function drawBrillos() {
  G.shots.forEach(s => {
    if (!s.brillo) return;
    w.globalAlpha = 0.28 + Math.sin(G.t * 0.4 + s.x) * 0.08;
    w.fillStyle = s.brillo;
    w.beginPath();
    w.arc(s.x, s.y, s.r * 2.4, 0, 7);
    w.fill();
    if (s.estalla) {
      w.globalAlpha = 0.5;
      w.fillStyle = '#ffffff';
      w.beginPath();
      w.arc(s.x, s.y, s.r * 0.8, 0, 7);
      w.fill();
    }
  });
  w.globalAlpha = 1;
}
// Aura del despertar alrededor del héroe.
function drawAura(P) {
  if (!P.aura) return;
  const k = P.aura / 40;
  w.globalAlpha = 0.45 * k;
  w.strokeStyle = P.auraC;
  w.lineWidth = 2;
  w.beginPath();
  w.ellipse(P.x, P.y - 12, 14 + (1 - k) * 8, 20 + (1 - k) * 8, 0, 0, 7);
  w.stroke();
  w.globalAlpha = 1;
  if (G.t % 2 == 0)
    G.pt.push({
      x: P.x + rnd(-10, 10),
      y: P.y - rnd(0, 26),
      vx: 0,
      vy: -1,
      l: 16,
      m: 16,
      c: P.auraC,
      s: 2,
      g: 0,
    });
}
