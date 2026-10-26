// Arena PvP: los dos héroes frente a frente, al mejor de tres rondas. Se juega en la misma compu o en línea.
// Las técnicas, los grimorios y los golpes finales pegan al rival (objetivos() lo suma cuando G.arena existe).
const RONDAS_PARA_GANAR = 2;

function iniciarArena() {
  G.arena = { r: [0, 0], ronda: 1, entre: 0 };
  G.dif = Object.assign({}, G.dif, { golpe: 1 });
  const c = {
    x: 0,
    y: 0,
    tipo: 'arena',
    plano: 'pilares',
    p: {},
    limpio: true,
    visto: true,
    conocido: true,
    est: null,
  };
  G.mundo = { cu: { '0,0': c }, W: 1, H: 1, inicio: c };
  G.room = null;
  entrarCuarto(c, null);
  G.aviso = { txt: 'Arena · al mejor de tres', l: 110 };
  musica('jefe_ogro');
  empezarRonda();
}

function empezarRonda() {
  const A = G.arena;
  G.jug.forEach((P, i) => {
    P.x = i ? 380 : 100;
    P.y = 175;
    P.hp = P.max;
    P.caido = false;
    P.inv = 90;
    P.meter = 0;
    P.dash = 0;
    P.est = null;
    P.cds = P.cds.map(() => 0);
    P.gcd = 0;
  });
  G.shots = [];
  G.bul = [];
  G.banner = { txt: 'RONDA ' + A.ronda, t: 0, c: '#ffe94a' };
  sfx('ultCarga');
}

// Golpe a un héroe rival: medio corazón, con un momento intocable para que no muera de un solo combo.
function golpearJugador(Q, heavy) {
  if (!G.arena || G.arena.entre || Q.caido || Q.inv > 0 || Q.dash > 0 || G.over) return;
  Q.hp -= 1;
  Q.inv = 45;
  Q.hurt = 20;
  G.shake = Math.max(G.shake, 6 + (heavy || 0));
  burst(Q.x, Q.y - 12, 18, '#ff4a5a', 2.5);
  ring(Q.x, Q.y - 10, 18, '#ff4a5a', 14);
  sfx('hurt');
  if (Q === G.jug[0]) vibrar(70);
  if (Q.hp <= 0) finRonda(Q);
}

function finRonda(perdedor) {
  const A = G.arena,
    gana = G.jug[0] === perdedor ? 1 : 0;
  perdedor.hp = 0;
  perdedor.caido = true;
  A.r[gana]++;
  G.slow = 0.35;
  G.slowT = 60;
  G.flash = 8;
  G.fcol = '#ffffff';
  burst(perdedor.x, perdedor.y - 12, 60, '#ff4a5a', 4, 40, 2);
  if (A.r[gana] >= RONDAS_PARA_GANAR) {
    A.campeon = gana;
    guardarLogro('ganoArena');
    G.over = 1;
    G.banner = { txt: G.jug[gana].nombre.toUpperCase() + ' GANA', t: 0, c: '#ffe94a' };
    sfx('ultFinal');
    setTimeout(() => end(true), 1800);
    return;
  }
  A.entre = 120;
  A.ronda++;
  sfx('rugido');
}

function pasoArena() {
  const A = G.arena;
  if (!A || !A.entre) return;
  if (--A.entre == 0) empezarRonda();
}

function finArena() {
  const A = G.arena,
    g = G.jug[A.campeon || 0];
  document.getElementById('endTitle').textContent = '¡' + g.nombre + ' gana la arena!';
  document.getElementById('endText').textContent =
    'Jugador ' +
    g.num +
    ' ganó ' +
    A.r[A.campeon || 0] +
    ' a ' +
    A.r[1 - (A.campeon || 0)] +
    '. ¿La revancha?';
}

// Marcador arriba al centro, debajo del botón de pausa.
function drawArena() {
  const A = G.arena;
  if (!A) return;
  const y = 64;
  o.fillStyle = 'rgba(10,6,16,.8)';
  o.fillRect(OW / 2 - 130, y - 20, 260, 30);
  txt(G.jug[0].nombre, OW / 2 - 30, y, 14, '#5ee7ff', 'right');
  txt(A.r[0] + ' - ' + A.r[1], OW / 2, y, 16, '#ffe94a', 'center');
  txt(G.jug[1].nombre, OW / 2 + 30, y, 14, '#ff8a2a', 'left');
}
