// Logros con premio en cenizas, y trajes nuevos que se compran con cenizas o se ganan con hazañas.
const LISTA_LOGROS = [
  {
    id: 'primerJefe',
    n: 'Primera sangre',
    d: 'Vence a tu primer jefe.',
    p: 20,
    ok: () => !!(LOGROS.zombi || LOGROS.ogro),
  },
  { id: 'aventura', n: 'Dueño de la mazmorra', d: 'Gana la Aventura.', p: 60, ok: () => !!LOGROS.cenizas },
  { id: 'pesadillaL', n: 'Sin miedo', d: 'Gana en modo Pesadilla.', p: 120, ok: () => !!LOGROS.pesadilla },
  {
    id: 'torre10',
    n: 'Primer guardián',
    d: 'Llega al piso 11 de la Torre.',
    p: 30,
    ok: () => (LOGROS.torre || 0) >= 11,
  },
  {
    id: 'torre50',
    n: 'Capitán',
    d: 'Llega al piso 50 de la Torre.',
    p: 100,
    ok: () => (LOGROS.torre || 0) >= 50,
  },
  { id: 'dragonL', n: 'Rey Mago', d: 'Vence al Dragón del piso 100.', p: 300, ok: () => !!LOGROS.dragon },
  {
    id: 'intocable',
    n: 'Intocable',
    d: 'Vence a un jefe sin que te toquen.',
    p: 80,
    ok: () => !!LOGROS.sinGolpes,
  },
  {
    id: 'carnicero',
    n: 'Imparable',
    d: 'Derrota a 100 enemigos en una partida.',
    p: 50,
    ok: () => (LOGROS.maxKills || 0) >= 100,
  },
  {
    id: 'grimorios3',
    n: 'Bibliotecario',
    d: 'Ten tres grimorios abiertos.',
    p: 50,
    ok: () => Object.keys(LOGROS.grim || {}).length >= 3,
  },
  {
    id: 'forjaMax',
    n: 'Herrero de almas',
    d: 'Forja una técnica hasta el nivel V.',
    p: 50,
    ok: () => Object.values(LOGROS.forja || {}).some(v => v >= FORJA_MAX),
  },
  {
    id: 'nivel10',
    n: 'Aventurero de nivel 10',
    d: 'Llega a nivel 10 en Tu estado.',
    p: 100,
    ok: () => estado().nivel >= 10,
  },
  {
    id: 'rangoS',
    n: 'Rango S',
    d: 'Lleva una habilidad al rango S.',
    p: 150,
    ok: () => HABILIDADES.some(h => estado()[h.id] >= 900),
  },
  {
    id: 'arenaL',
    n: 'Campeón de la arena',
    d: 'Gana una partida de arena.',
    p: 40,
    ok: () => !!LOGROS.ganoArena,
  },
  {
    id: 'amigos',
    n: 'En compañía',
    d: 'Termina una partida en línea.',
    p: 30,
    ok: () => !!LOGROS.jugoEnLinea,
  },
  { id: 'retoL', n: 'Reto cumplido', d: 'Supera un reto del día.', p: 40, ok: () => !!LOGROS.retosHechos },
];

// Revisa los logros nuevos, paga sus cenizas y los anuncia. Devuelve el texto para la pantalla final.
function revisarLogros() {
  const hechos = Object.assign({}, LOGROS.logros),
    nuevos = LISTA_LOGROS.filter(l => !hechos[l.id] && l.ok());
  if (!nuevos.length) return '';
  nuevos.forEach(l => (hechos[l.id] = Date.now()));
  guardarLogro('logros', hechos);
  const total = nuevos.reduce((s, l) => s + l.p, 0);
  guardarLogro('polvo', (LOGROS.polvo || 0) + total);
  if (running && G) G.aviso = { txt: 'Logro: ' + nuevos[0].n + ' · +' + nuevos[0].p + ' cenizas', l: 140 };
  sfx('cofre');
  return ' Logros: ' + nuevos.map(l => l.n + ' (+' + l.p + ')').join(', ') + '.';
}

// Trajes que se compran con cenizas o salen de un logro; se suman a los del vestuario.
VESTUARIOS.push(
  { id: 'esmeralda', n: 'Esmeralda', c: [60, 220, 120], precio: 120 },
  { id: 'noche', n: 'Noche', c: [60, 60, 140], precio: 120 },
  { id: 'coral', n: 'Coral', c: [255, 120, 110], precio: 150 },
  { id: 'lavanda', n: 'Lavanda', c: [190, 150, 255], precio: 150 },
  { id: 'marfil', n: 'Marfil', c: [240, 230, 205], precio: 200 },
  { id: 'aurora', n: 'Aurora', c: [23, 126, 137], precio: 200 },
  { id: 'abismo', n: 'Abismo', c: [70, 30, 90], precio: 250 },
  { id: 'reyMago', n: 'Rey Mago', c: [255, 196, 60], req: 'dragon', txt: 'Vence al Dragón del piso 100' },
);
const trajeComprado = v => (LOGROS.trajes || []).includes(v.id);
let trajeAComprar = null;
// Primer toque: dice el precio. Segundo toque: lo compra si alcanzan las cenizas.
function tocarTrajeEnVenta(v) {
  const aviso = document.getElementById('vestAviso'),
    tengo = LOGROS.polvo || 0;
  if (tengo < v.precio) {
    aviso.textContent = v.n + ' cuesta ' + v.precio + ' cenizas y tienes ' + tengo + '. Se ganan jugando.';
    return false;
  }
  if (trajeAComprar != v.id) {
    trajeAComprar = v.id;
    aviso.textContent =
      v.n + ' cuesta ' + v.precio + ' cenizas (tienes ' + tengo + '). Toca otra vez para comprarlo.';
    return false;
  }
  trajeAComprar = null;
  guardarLogro('polvo', tengo - v.precio);
  guardarLogro('trajes', (LOGROS.trajes || []).concat([v.id]));
  aviso.textContent = '¡Compraste ' + v.n + '!';
  sfx('cofre');
  return true;
}

function mostrarLogros() {
  revisarLogros();
  pintarMisiones();
  const L = document.getElementById('logrosLista'),
    hechos = LOGROS.logros || {};
  L.innerHTML = '';
  LISTA_LOGROS.forEach(l => {
    const f = document.createElement('div');
    f.className = 'logro' + (hechos[l.id] ? ' hecho' : '');
    f.innerHTML = '<b></b><small></small><span></span>';
    f.querySelector('b').textContent = l.n;
    f.querySelector('small').textContent = l.d;
    f.querySelector('span').textContent = hechos[l.id] ? 'Hecho' : '+' + l.p;
    L.appendChild(f);
  });
  document.getElementById('logrosCuenta').textContent =
    Object.keys(hechos).length + ' de ' + LISTA_LOGROS.length + ' logros';
  irAPanel('logros');
}
document.getElementById('logrosBtn').onclick = mostrarLogros;
document.getElementById('logrosVolver').onclick = () => {
  volverDePanel('logros');
};
