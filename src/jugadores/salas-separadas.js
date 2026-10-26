// Salas separadas en línea: cada jugador puede estar en un cuarto distinto del mapa.
// Una «sala» guarda todo lo que es de un cuarto (enemigos, balas, efectos, jefe, cámara, piso dibujado…).
// El anfitrión simula cada sala por turnos cambiando esos datos dentro de G, igual que conJugador cambia G.P.
// G.jug son los jugadores de la sala activa; G.jugTodos, los de la partida.
let SALAS = [],
  salaActiva = null,
  clavesSala = null;

// Las claves de una sala: las que limpia resetSala más las del cuarto y su gente.
function clavesDeSala() {
  if (clavesSala) return clavesSala;
  const antes = G;
  G = {};
  resetSala();
  clavesSala = Object.keys(G).concat([
    'room',
    'mapa',
    'lavas',
    'luzFija',
    'cajas',
    'avisoLlave',
    'cerca2',
    'jug',
    'P',
    'temaSala',
  ]);
  G = antes;
  return clavesSala;
}
function nuevaSala(conLienzo) {
  const S = { d: {} };
  if (conLienzo) [S.fc, S.fx] = mk(WW, WH);
  else [S.fc, S.fx] = [fc, fx];
  return S;
}
function iniciarSalas() {
  const S = nuevaSala(false);
  SALAS = [S];
  salaActiva = S;
  G.jugTodos = G.jug;
  G.jug.forEach(P => (P.sala = S));
}
const separadas = () => SALAS.length > 1;
// Las salas solo se separan en línea, con la cámara propia de cada uno.
const puedeSeparar = () => vistaPropia() && !G.torre && !G.arena;

function guardarEnSala(S) {
  clavesDeSala().forEach(k => (S.d[k] = G[k]));
  S.fc = fc;
  S.fx = fx;
}
function cargarSala(S) {
  clavesDeSala().forEach(k => (G[k] = S.d[k]));
  fc = S.fc;
  fx = S.fx;
  salaActiva = S;
}
function conSala(S, fn) {
  if (!S || S === salaActiva) return fn();
  const antes = salaActiva;
  guardarEnSala(antes);
  cargarSala(S);
  try {
    return fn();
  } finally {
    guardarEnSala(S);
    if (SALAS.includes(antes)) cargarSala(antes);
    else cargarSala(G.jugTodos[0].sala);
  }
}
// Entre cuadros, G siempre tiene la sala del anfitrión: sus teclas y botones actúan ahí.
function volverACasa() {
  const S = G.jugTodos && G.jugTodos[0].sala;
  if (!S || S === salaActiva) return;
  if (SALAS.includes(salaActiva)) guardarEnSala(salaActiva);
  cargarSala(S);
}
function porSalas(fn) {
  if (!separadas()) return fn();
  SALAS.slice().forEach(S => SALAS.includes(S) && conSala(S, fn));
  volverACasa();
}

// Lo que cambia de sala se hace entre cuadros, fuera del recorrido por salas.
const pendientesSala = [];

// Q cruza una puerta solo: entra a la sala de su amigo si está en ese cuarto, o abre una sala nueva.
function salirSolo(Q, n, lado) {
  Q.cruzando = 0;
  if (SALAS.includes(salaActiva)) guardarEnSala(salaActiva);
  const vieja = Q.sala,
    otra = SALAS.find(S => S !== vieja && S.d.room === n);
  let vacia = false;
  conSala(vieja, () => {
    G.jug = G.jug.filter(x => x !== Q);
    if (G.P === Q) G.P = G.jug[0];
    vacia = !G.jug.length;
    if (vacia && otra) guardarCuarto();
  });
  if (otra) {
    if (vacia) SALAS = SALAS.filter(S => S !== vieja);
    conSala(otra, () => {
      G.jug.push(Q);
      Q.sala = otra;
      [Q.x, Q.y] = ENTRADA[lado];
      Q.safe = [Q.x, Q.y];
      Q.dash = 0;
      Q.est = null;
      G.aviso = { txt: Q.nombre + ' entró', l: 70 };
      musicaAlUnirse();
    });
  } else if (vacia) {
    conSala(vieja, () => {
      G.jug = [Q];
      G.P = Q;
      entrarCuarto(n, lado);
    });
  } else {
    const S = nuevaSala(true);
    SALAS.push(S);
    conSala(S, () => {
      G.jug = [Q];
      G.P = Q;
      G.room = null;
      Q.sala = S;
      entrarCuarto(n, lado);
      G.aviso = { txt: 'Exploras solo: tu amigo está en el cuarto naranja del mapa', l: 150 };
    });
    // Al que se quedó también se le avisa, para que no parezca que se perdió la partida.
    conSala(
      vieja,
      () => (G.aviso = { txt: Q.nombre + ' fue a otro cuarto: búscalo en naranja en el mapa', l: 150 }),
    );
  }
  volverACasa();
}

// Escaleras, Torre y zonas nuevas: todos juntos otra vez en la sala del anfitrión.
function juntarTodos() {
  if (!separadas()) return;
  // Se juntan en la sala de quien bajó la escalera (puede ser la del invitado).
  const casa = salaActiva;
  SALAS.filter(S => S !== casa).forEach(S => conSala(S, guardarCuarto));
  SALAS = [casa];
  G.jug = G.jugTodos.slice();
  G.jug.forEach(P => (P.sala = casa));
  G.P = G.jug[0];
}

// Si alguien cae solo en su cuarto, aparece caído junto a su amigo para que lo reviva.
function rescatarCaido(P) {
  if (SALAS.includes(salaActiva)) guardarEnSala(salaActiva);
  const vieja = P.sala,
    amigo = G.jugTodos.find(Q => Q !== P && !Q.caido);
  if (!separadas() || !amigo || amigo.sala === vieja || !P.caido) return;
  conSala(vieja, () => {
    G.jug = G.jug.filter(x => x !== P);
    if (G.P === P) G.P = G.jug[0];
    if (!G.jug.length) guardarCuarto();
  });
  if (!vieja.d.jug.length) SALAS = SALAS.filter(S => S !== vieja);
  conSala(amigo.sala, () => {
    G.jug.push(P);
    P.sala = amigo.sala;
    P.x = amigo.x + 16;
    P.y = amigo.y;
    P.safe = [P.x, P.y];
    G.aviso = { txt: P.nombre + ' cayó: ve a su lado para revivirlo', l: 120 };
    musicaAlUnirse();
  });
  volverACasa();
}

// Dónde está el amigo, para el minimapa.
const cuartoDelAmigo = () => {
  if (!separadas()) return null;
  const otro = G.jugTodos.find(Q => !G.jug.includes(Q));
  return otro && otro.sala.d.room;
};

// Quien entra a una sala ya ocupada pasa a escuchar la música de ese cuarto.
function musicaAlUnirse() {
  const n = G.temaSala;
  G.temaSala = null;
  musica(n);
}
