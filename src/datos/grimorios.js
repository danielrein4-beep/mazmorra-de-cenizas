// Grimorios: cada uno da un atributo mágico a todos tus golpes y un hechizo propio (tecla G).
// Los normales se compran en la Biblioteca con cenizas y suben de 1 a 3 hojas; el de cuatro hojas
// se gana venciendo al Minotauro del piso 50 y el de cinco hojas venciendo al Dragón del piso 100.
const GRIMORIOS = [
  {
    id: 'fuego',
    n: 'Grimorio de Fuego',
    c: '#ff6a2a',
    tapa: '#7a1a0a',
    efecto: 'Tus golpes queman.',
    hechizo: 'Llamarada Carmesí',
    hDesc: 'Un anillo de bolas de fuego sale de ti hacia todos lados.',
  },
  {
    id: 'hielo',
    n: 'Grimorio de Hielo',
    c: '#5ee7ff',
    tapa: '#0a3a5a',
    efecto: 'A veces congelas y frenas al enemigo.',
    hechizo: 'Prisión de Hielo',
    hDesc: 'Congela a todos los que estén cerca y les hace daño.',
  },
  {
    id: 'rayo',
    n: 'Grimorio de Rayo',
    c: '#ffe94a',
    tapa: '#5a4a0a',
    efecto: 'Cada cinco golpes, un rayo salta a otro enemigo.',
    hechizo: 'Juicio del Trueno',
    hDesc: 'Rayos caen sobre los cinco enemigos más cercanos.',
  },
  {
    id: 'viento',
    n: 'Grimorio de Viento',
    c: '#7cffc4',
    tapa: '#0a4a3a',
    efecto: 'Tus golpes empujan lejos a los enemigos.',
    hechizo: 'Vendaval',
    hDesc: 'Barre las balas cercanas y lanza cuchillas de viento.',
  },
  {
    id: 'tierra',
    n: 'Grimorio de Tierra',
    c: '#d0a060',
    tapa: '#4a2a10',
    efecto: 'Pegar mucho te da una coraza que aguanta un golpe.',
    hechizo: 'Muralla de Roca',
    hDesc: 'Te cubre una coraza de roca y las piedras golpean alrededor.',
  },
  {
    id: 'luz',
    n: 'Grimorio de Luz',
    c: '#fff1b0',
    tapa: '#6a5a2a',
    efecto: 'Corres más rápido y a veces pegas doble.',
    hechizo: 'Espadas de Luz',
    hDesc: 'Ocho espadas de luz que atraviesan a todos.',
  },
  {
    id: 'sombra',
    n: 'Grimorio de Sombra',
    c: '#b06bff',
    tapa: '#2a0a4a',
    efecto: 'Pegar te devuelve vida poco a poco.',
    hechizo: 'Paso de Sombra',
    hDesc: 'Te vuelves sombra, cruzas hacia donde apuntas y cortas lo que hay en el camino.',
  },
  {
    id: 'tempestad',
    n: 'Grimorio de Cuatro Hojas',
    c: '#4af0ff',
    tapa: '#0a2a4a',
    hojasFijas: 4,
    req: 'minotauro',
    reqTxt: 'Vence al Minotauro del piso 50 de la Torre.',
    efecto: 'Viento y rayo juntos: empujas y tus rayos saltan.',
    hechizo: 'Tempestad',
    hDesc: 'Vendaval y Juicio del Trueno a la vez.',
  },
  {
    id: 'antimagia',
    n: 'Grimorio de Cinco Hojas',
    c: '#ff2a4a',
    tapa: '#0b0812',
    hojasFijas: 5,
    req: 'dragon',
    reqTxt: 'Vence al Dragón del piso 100 de la Torre.',
    efecto: 'Antimagia: pegas un 25 % más y tus golpes borran balas.',
    hechizo: 'Espada Antimagia',
    hDesc: 'Borra todas las balas de la sala y corta todo a tu alrededor.',
  },
];
// El grimorio con el que nace cada héroe: viene gratis con una hoja.
const GRIMORIO_NATURAL = {
  mago: 'fuego',
  caballero: 'luz',
  elfo: 'viento',
  enano: 'tierra',
  lagarto: 'sombra',
};
// Lo que cuesta en cenizas cada hoja: abrir el grimorio (1 hoja), la segunda y la tercera.
const PRECIO_HOJA = [100, 180, 300];

const grimorio = id => GRIMORIOS.find(g => g.id == id);
// Hojas que tienes de cada grimorio (0 = no lo tienes).
function hojasDe(id, pid) {
  const g = grimorio(id);
  if (!g) return 0;
  if (g.hojasFijas) return LOGROS[g.req] ? g.hojasFijas : 0;
  const propias = (LOGROS.grim || {})[id] || 0;
  return Math.max(propias, GRIMORIO_NATURAL[pid] == id ? 1 : 0);
}
// El grimorio equipado por el héroe P (o el natural si el elegido ya no vale).
function grimorioDe(P) {
  const pid = PERSONAJES[P.pid].id,
    elegido = (LOGROS.grimEquipado || {})[pid];
  return hojasDe(elegido, pid) ? elegido : GRIMORIO_NATURAL[pid];
}
// Fuerza del grimorio según sus hojas: 1 hoja = 1, cada hoja suma un 25 %.
const fuerzaGrim = hojas => 1 + 0.25 * (hojas - 1);
// Cenizas de una partida: por enemigos, jefes vencidos y pisos de la Torre.
const cenizasDePartida = () =>
  Math.round((G.kills || 0) / 4 + (G.jefesVencidos || 0) * 20 + (G.torre ? G.piso * 2 : 0));

// Dibuja el libro: tapa de su color, esquinas de metal y el trébol con sus hojas.
function dibujarGrimorio(x, g, hojas, cx, cy, s, t) {
  const k = s / 100;
  x.save();
  x.translate(cx, cy);
  x.scale(k, k);
  if (hojas >= 4) {
    x.globalAlpha = 0.35 + Math.sin((t || 0) * 0.08) * 0.15;
    x.fillStyle = g.c;
    x.beginPath();
    x.arc(0, 0, 50, 0, 7);
    x.fill();
    x.globalAlpha = 1;
  }
  x.fillStyle = '#1a1020';
  x.fillRect(-30, -42, 66, 86);
  x.fillStyle = g.tapa;
  x.fillRect(-34, -44, 66, 86);
  x.fillStyle = 'rgba(255,255,255,.15)';
  x.fillRect(-34, -44, 8, 86);
  x.strokeStyle = g.c;
  x.lineWidth = 3;
  x.strokeRect(-30, -40, 58, 78);
  x.fillStyle = '#ffd24a';
  [
    [-34, -44],
    [24, -44],
    [-34, 34],
    [24, 34],
  ].forEach(([a, b]) => x.fillRect(a, b, 8, 8));
  const n = Math.max(1, hojas),
    verde = hojas >= 5 ? '#1a1a1a' : hojas >= 4 ? '#2affe0' : '#3aff8a';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + ((i - (n - 1) / 2) * 2 * Math.PI) / Math.max(n, 3),
      d = n == 1 ? 0 : 13,
      hx = -3 + Math.cos(a) * d,
      hy = -4 + Math.sin(a) * d;
    x.globalAlpha = hojas ? 1 : 0.3;
    x.fillStyle = verde;
    x.strokeStyle = hojas >= 5 ? '#ff2a4a' : '#0a4a2a';
    x.lineWidth = 2;
    x.beginPath();
    x.arc(hx, hy, n == 1 ? 12 : 10, 0, 7);
    x.fill();
    x.stroke();
  }
  x.globalAlpha = 1;
  x.strokeStyle = hojas >= 5 ? '#ff2a4a' : '#0a4a2a';
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(-3, 6);
  x.quadraticCurveTo(0, 16, -3, 24);
  x.stroke();
  x.restore();
}
