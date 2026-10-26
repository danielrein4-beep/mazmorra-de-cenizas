// Armas y poderes de los jefes que no son balas: la espada larga del caballero, el garrote de Gruk, el
// hacha del minotauro, la guadaña del espectro, rayos que barren la sala (láser) y cosas que caen del
// cielo (espadas, flechas). Todo avisa: el arma se levanta y el suelo marca por dónde va a pasar.

// Cómo se ve cada arma: largo, ancho de la hoja y colores (hoja, filo, mango).
const ARMAS_JEFE = {
  espada: { largo: 96, ancho: 11, hoja: '#14101e', filo: '#9af0ff', mango: '#3a2a4a' },
  espadaNegra: { largo: 104, ancho: 12, hoja: '#0b0812', filo: '#b06bff', mango: '#2a1a3a' },
  garrote: { largo: 74, ancho: 16, hoja: '#9a7040', filo: '#ffd9a0', mango: '#4a3220' },
  hacha: { largo: 78, ancho: 18, hoja: '#8a8a9a', filo: '#ffffff', mango: '#4a3020' },
  guadana: { largo: 96, ancho: 16, hoja: '#c3b6d9', filo: '#ffffff', mango: '#2a2030' },
};

// Golpe con arma: se levanta (aviso con el área marcada), barre de a0 a a1 y pega en ese sector.
// Devuelve true cuando terminó. o: { arma, aviso, barre, a0, a1, alcance, c }
function golpeArma(B, t, o) {
  const A = ARMAS_JEFE[o.arma],
    alcance = o.alcance || A.largo + 14,
    cx = B.x,
    cy = B.y - (B.def.cy || 34) * 0.6;
  if (t <= o.aviso) {
    // El arma se echa hacia atrás despacio y el suelo marca el abanico que va a cubrir.
    B.arma = { tipo: o.arma, x: cx, y: cy, a: o.a0 - 0.4 * (t / o.aviso) * Math.sign(o.a1 - o.a0) };
    B.areaArma = { x: cx, y: cy, a0: o.a0, a1: o.a1, r: alcance, c: o.c, k: t / o.aviso };
    if (t == 1) sfx('ultCarga');
    return false;
  }
  const k = Math.min(1, (t - o.aviso) / o.barre),
    a = o.a0 + (o.a1 - o.a0) * k;
  B.areaArma = null;
  B.arma = { tipo: o.arma, x: cx, y: cy, a, estela: [o.a0, a] };
  if (t == o.aviso + 1) {
    sfx('tajo');
    G.shake = Math.max(G.shake, 6);
  }
  vivos().forEach(Q => {
    const d = Math.hypot(Q.x - cx, Q.y - 10 - cy),
      aq = Math.atan2(Q.y - 10 - cy, Q.x - cx),
      lo = Math.min(o.a0, a),
      hi = Math.max(o.a0, a),
      dentro = d < alcance && angEntre(aq, lo, hi);
    if (dentro) conJugador(Q, hurtPlayer);
  });
  if (k >= 1 && t > o.aviso + o.barre + 6) {
    B.arma = null;
    return true;
  }
  return false;
}
// ¿El ángulo a está dentro del arco que va de lo a hi (girando en sentido positivo)?
function angEntre(a, lo, hi) {
  const total = hi - lo,
    d = (((a - lo) % 6.283) + 6.283) % 6.283;
  return d <= total;
}

// Rayo que barre (láser): aviso fino, luego un rayo grueso que sigue a la heroína despacio.
function laserJefe(B, t, cx, cy, o) {
  const largo = o.largo || 420;
  if (t == 1) {
    B.angL = Math.atan2(G.P.y - 10 - cy, G.P.x - cx) + (o.desfase || 0);
    sfx('ultCarga');
  }
  if (t < o.aviso) {
    B.laser = { x: cx, y: cy, a: B.angL, largo, ancho: 1 + (t / o.aviso) * 2, c: o.c, aviso: 1 };
    return false;
  }
  if (t == o.aviso) {
    sfx('rayo');
    G.shake = Math.max(G.shake, 8);
  }
  if (t < o.aviso + o.dura) {
    const obj = Math.atan2(G.P.y - 10 - cy, G.P.x - cx),
      dif = Math.atan2(Math.sin(obj - B.angL), Math.cos(obj - B.angL));
    B.angL += o.gira ? o.gira : dif * (o.sigue || 0.018);
    B.laser = { x: cx, y: cy, a: B.angL, largo, ancho: o.ancho || 10, c: o.c };
    const x2 = cx + Math.cos(B.angL) * largo,
      y2 = cy + Math.sin(B.angL) * largo;
    vivos().forEach(
      Q => distSegmento(Q.x, Q.y - 10, cx, cy, x2, y2) < (o.ancho || 10) / 2 + 4 && conJugador(Q, hurtPlayer),
    );
    if (t % 3 == 0) burst(x2, y2, 3, o.c, 2, 10);
    G.shake = Math.max(G.shake, 2);
    return false;
  }
  B.laser = null;
  return t > o.aviso + o.dura + 10;
}

// Cosas que caen del cielo: marca en el suelo, el objeto cae desde arriba, pega y queda clavado un rato.
function caeDelCielo(x, y, forma, c, espera) {
  [x, y] = enSala(x, y);
  efectoEn({ tipo: 'cae', x, y, forma, c, espera, r: forma == 'espada' ? 16 : 11 });
}
EFECTOS_EXTRA.cae = {
  paso: e => {
    if (e.t == e.espera) {
      vivos().forEach(Q => Math.hypot(Q.x - e.x, Q.y - e.y) < e.r && pegarUnaVez(e, Q));
      burst(e.x, e.y, 10, e.c, 2.5, 16, 2, 0.1);
      decal(e.x, e.y + 2, 6, '#140c0a', 400);
      if (e.forma == 'espada') sfx('tajo');
    }
    if (e.t > e.espera + 60) e.d = 1;
  },
  draw: e => {
    if (e.t < e.espera) {
      w.globalAlpha = 0.2 + 0.45 * (e.t / e.espera);
      w.fillStyle = e.c;
      w.beginPath();
      w.ellipse(e.x, e.y, e.r, e.r / 2, 0, 0, 7);
      w.fill();
    }
    const caida = Math.max(0, 1 - Math.max(0, e.t - e.espera + 12) / 12),
      y = e.y - caida * 220,
      a = e.t > e.espera + 50 ? 1 - (e.t - e.espera - 50) / 10 : 1;
    if (e.t < e.espera - 12) return;
    w.globalAlpha = a;
    if (e.forma == 'espada') dibujarArma('espadaNegra', e.x, y + 6, 1.571 + 3.1416, 0.6);
    else {
      w.strokeStyle = '#6a4a2a';
      w.lineWidth = 2;
      w.beginPath();
      w.moveTo(e.x, y - 18);
      w.lineTo(e.x, y);
      w.stroke();
      w.fillStyle = e.c;
      w.beginPath();
      w.moveTo(e.x, y + 3);
      w.lineTo(e.x - 3, y - 3);
      w.lineTo(e.x + 3, y - 3);
      w.fill();
    }
    w.globalAlpha = 1;
  },
};

// Dibuja un arma desde (x, y) apuntando al ángulo a. esc: tamaño (1 = el del jefe).
function dibujarArma(tipo, x, y, a, esc) {
  const A = ARMAS_JEFE[tipo],
    L = A.largo * (esc || 1),
    an = A.ancho * (esc || 1);
  w.save();
  w.translate(x, y);
  w.rotate(a);
  w.fillStyle = A.mango;
  w.fillRect(-10, -2, 14, 4);
  if (tipo == 'guadana' || tipo == 'hacha') {
    w.fillRect(0, -2, L, 4);
    w.fillStyle = A.hoja;
    w.beginPath();
    if (tipo == 'guadana') {
      w.moveTo(L, 0);
      w.quadraticCurveTo(L - an, -an * 2.2, L - an * 2.6, -an * 0.6);
      w.quadraticCurveTo(L - an * 0.8, -an * 1.1, L, 0);
    } else {
      w.moveTo(L - an * 1.4, -2);
      w.quadraticCurveTo(L - an * 0.6, -an * 1.6, L + 2, -an * 0.9);
      w.lineTo(L + 2, an * 0.9);
      w.quadraticCurveTo(L - an * 0.6, an * 1.6, L - an * 1.4, 2);
    }
    w.fill();
    w.strokeStyle = A.filo;
    w.lineWidth = 1;
    w.stroke();
  } else {
    if (tipo != 'garrote') {
      w.fillStyle = '#8a7a9a';
      w.fillRect(4, -an, 3, an * 2);
    }
    w.fillStyle = A.hoja;
    w.beginPath();
    w.moveTo(7, -an / 2);
    w.lineTo(L - an, -an / 2);
    w.lineTo(L, 0);
    w.lineTo(L - an, an / 2);
    w.lineTo(7, an / 2);
    w.closePath();
    // Brillo del filo alrededor de la hoja, para que la espada negra se vea sobre el suelo oscuro.
    {
      w.globalAlpha *= 0.5;
      w.strokeStyle = A.filo;
      w.lineWidth = 4;
      w.stroke();
      w.globalAlpha *= 2;
      w.lineWidth = 1;
      w.stroke();
    }
    w.fill();
    w.fillStyle = A.filo;
    w.fillRect(9, -an / 2, L - an - 4, 1.5);
    if (tipo == 'garrote')
      [0.5, 0.7, 0.9].forEach(k => {
        w.fillStyle = '#c8c8d0';
        w.fillRect(L * k, -an / 2 - 2, 3, 3);
      });
  }
  w.restore();
}

// Lo que dibuja el jefe encima: el área de su arma, el arma con su estela y el láser.
function drawArmasJefe(B) {
  // Al terminar el ataque (o si lo corta un cambio de fase) el arma y el láser se guardan.
  if (B.st == 'move' || B.trans) B.arma = B.laser = B.areaArma = null;
  const R = B.areaArma;
  if (R) {
    w.globalAlpha = 0.12 + 0.2 * R.k;
    w.fillStyle = R.c;
    w.beginPath();
    w.moveTo(R.x, R.y);
    w.arc(R.x, R.y, R.r, Math.min(R.a0, R.a1), Math.max(R.a0, R.a1));
    w.closePath();
    w.fill();
    w.globalAlpha = 1;
  }
  const A = B.arma;
  if (A) {
    if (A.estela) {
      const [e0, e1] = A.estela,
        L = ARMAS_JEFE[A.tipo].largo;
      w.globalAlpha = 0.28;
      w.fillStyle = ARMAS_JEFE[A.tipo].filo;
      w.beginPath();
      w.moveTo(A.x, A.y);
      w.arc(A.x, A.y, L + 6, Math.min(e0, e1), Math.max(e0, e1));
      w.closePath();
      w.fill();
      w.globalAlpha = 1;
    }
    dibujarArma(A.tipo, A.x, A.y, A.a, 1);
  }
  const Lz = B.laser;
  if (Lz) {
    const x2 = Lz.x + Math.cos(Lz.a) * Lz.largo,
      y2 = Lz.y + Math.sin(Lz.a) * Lz.largo;
    w.lineCap = 'round';
    [
      [Lz.ancho * 2.2, Lz.aviso ? 0.15 : 0.3, Lz.c],
      [Lz.ancho, Lz.aviso ? 0.5 : 0.9, Lz.c],
      [Lz.ancho * 0.4, Lz.aviso ? 0 : 1, '#ffffff'],
    ].forEach(([g, al, c]) => {
      w.globalAlpha = al * (Lz.aviso ? 0.6 + 0.4 * Math.sin(G.t * 0.8) : 1);
      w.strokeStyle = c;
      w.lineWidth = g;
      w.beginPath();
      w.moveTo(Lz.x, Lz.y);
      w.lineTo(x2, y2);
      w.stroke();
    });
    w.globalAlpha = 1;
  }
}
