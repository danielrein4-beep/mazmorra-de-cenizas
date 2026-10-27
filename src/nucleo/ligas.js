// Ligas, como en Clash Royale: cada partida da o quita copas, y con las copas subes de liga. La primera
// vez que llegas a una liga te llevas su premio. Cada mes empieza una temporada: quien pasa de 1.000
// copas baja (se queda con la mitad de lo que le sobraba) y recibe un premio según la liga más alta a la
// que llegó. Las copas suben al servidor para la tabla de la temporada.
const LIGAS = [
  { n: 'Madera', desde: 0, c: '#a07a50', premio: 0 },
  { n: 'Bronce', desde: 100, c: '#d08a4a', premio: 100 },
  { n: 'Plata', desde: 300, c: '#c3c8d8', premio: 200 },
  { n: 'Oro', desde: 600, c: '#ffd24a', premio: 300 },
  { n: 'Diamante', desde: 1000, c: '#5ee7ff', premio: 500 },
  { n: 'Maestro', desde: 1500, c: '#b06bff', premio: 800 },
  { n: 'Campeón', desde: 2200, c: '#ff3a2a', premio: 1200 },
  { n: 'Leyenda de Cenizas', desde: 3000, c: '#ff8a2a', premio: 2000 },
];
const PREMIO_TEMPORADA = [50, 100, 200, 350, 500, 800, 1200, 2000];
const copasTengo = () => LOGROS.copas || 0;
const ligaDe = copas => {
  let i = 0;
  LIGAS.forEach((L, k) => copas >= L.desde && (i = k));
  return i;
};
const temporadaActual = () => new Date().toISOString().slice(0, 7);

// Al abrir el juego: si empezó un mes nuevo, se cierra la temporada anterior (premio y bajada de copas).
function revisarTemporada() {
  const hoy = temporadaActual();
  if (!LOGROS.temporada) return guardarLogro('temporada', hoy);
  if (LOGROS.temporada == hoy) return;
  const mejor = LOGROS.ligaTemporada || ligaDe(copasTengo()),
    premio = PREMIO_TEMPORADA[mejor];
  if (copasTengo() > 0) guardarLogro('polvo', cenizasTengo() + premio);
  if (copasTengo() > 1000) guardarLogro('copas', 1000 + Math.floor((copasTengo() - 1000) / 2));
  guardarLogro('temporada', hoy);
  guardarLogro('ligaTemporada', ligaDe(copasTengo()));
  if (copasTengo() > 0)
    LOGROS.avisoTemporada =
      'Terminó la temporada: llegaste a ' + LIGAS[mejor].n + ' y ganaste ' + premio + ' cenizas.';
}

// Suma (o resta) copas y devuelve el texto para la pantalla final.
function sumarCopas(n) {
  if (!n) return '';
  const antes = ligaDe(copasTengo()),
    copas = Math.max(0, copasTengo() + n),
    liga = ligaDe(copas);
  guardarLogro('copas', copas);
  guardarLogro('copasMax', Math.max(LOGROS.copasMax || 0, copas));
  guardarLogro('ligaTemporada', Math.max(LOGROS.ligaTemporada || 0, liga));
  let t = ' ' + (n > 0 ? '+' : '') + n + ' copas (' + copas + ', ' + LIGAS[liga].n + ').';
  // Premio de liga nueva, una sola vez por liga.
  const cobradas = LOGROS.ligasCobradas || [];
  if (liga > antes && !cobradas.includes(liga)) {
    guardarLogro('ligasCobradas', cobradas.concat([liga]));
    guardarLogro('polvo', cenizasTengo() + LIGAS[liga].premio);
    t += ' ¡Subiste a ' + LIGAS[liga].n + '! +' + LIGAS[liga].premio + ' cenizas.';
  } else if (liga < antes) t += ' Bajaste a ' + LIGAS[liga].n + '.';
  subirCopas();
  return t;
}

// Copas de una partida según el modo y lo que lograste (Aprendiz da la mitad; Pesadilla, la mitad más).
function copasDePartida(win) {
  let n = 0;
  if (G.arena) {
    // En la arena en línea, el que gana se lleva 30 y el que pierde deja 20. En una sola compu no cuenta.
    if (!enRed) return 0;
    n = G.arena.campeon == 0 ? 30 : -20;
    return n;
  }
  if (G.pacto) n = (G.diablosVencidos || 0) * 30 - (G.diablosVencidos ? 0 : 10);
  else if (G.reto) n = win ? 20 : 0;
  else if (G.torre) n = pisosSubidos() < 3 ? -8 : Math.min(30, pisosSubidos());
  else n = win ? 40 : G.zona * 5 - 8;
  const mult = G.dif.id == 'aprendiz' ? 0.5 : G.dif.id == 'pesadilla' ? 1.5 : 1;
  return Math.round(n > 0 ? n * mult : n);
}
// Copas que se lleva cada invitado en línea (en la arena, al revés que el anfitrión).
const copasDelInvitado = () =>
  G.arena ? (enRed ? (G.arena.campeon == 1 ? 30 : -20) : 0) : copasDePartida(G.win);

// Sube tus copas a la tabla de la temporada (si pusiste apodo).
function subirCopas() {
  if (!LOGROS.apodo) return;
  pedir('/api/liga', {
    id: idAparato(),
    apodo: LOGROS.apodo,
    copas: copasTengo(),
    heroe: PERSONAJES[ELEGIDO.p][ELEGIDO.sexo].n,
  }).catch(() => {});
}
