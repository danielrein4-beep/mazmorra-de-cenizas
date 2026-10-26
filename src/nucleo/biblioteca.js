// Biblioteca de grimorios (paso 3 de elegir): mirar cada grimorio, comprar hojas con cenizas y equiparlo.
let grimVisto = null;
const cenizasTengo = () => LOGROS.polvo || 0;

function pintarBiblioteca() {
  const pid = PERSONAJES[ELEGIDO.p].id,
    eq = grimorioDe({ pid: ELEGIDO.p }),
    L = document.getElementById('grimorios');
  if (!grimVisto) grimVisto = eq;
  document.getElementById('cenizasTxt').textContent =
    'Tienes ' + cenizasTengo() + ' cenizas. Se ganan en cada partida, ganes o pierdas.';
  L.innerHTML = '';
  GRIMORIOS.forEach(g => {
    const h = hojasDe(g.id, pid),
      b = document.createElement('button'),
      c = document.createElement('canvas');
    b.type = 'button';
    b.className = 'grim' + (g.id == eq ? ' equipado' : '');
    b.setAttribute('aria-pressed', g.id == grimVisto);
    b.setAttribute('aria-label', g.n + (h ? ', ' + h + ' hojas' : ', sin abrir'));
    c.width = 44;
    c.height = 52;
    const x = c.getContext('2d');
    if (!h) x.globalAlpha = 0.45;
    dibujarGrimorio(x, g, h, 22, 26, 48, 0);
    b.appendChild(c);
    b.onclick = () => {
      grimVisto = g.id;
      pintarBiblioteca();
    };
    L.appendChild(b);
  });
  const g = grimorio(grimVisto),
    h = hojasDe(g.id, pid),
    x2 = document.getElementById('grimGrande').getContext('2d');
  x2.clearRect(0, 0, 120, 120);
  dibujarGrimorio(x2, g, h, 60, 60, 100, 0);
  document.getElementById('grimNombre').textContent =
    g.n + (h ? ' · ' + h + (h == 1 ? ' hoja' : ' hojas') : ' · sin abrir');
  document.getElementById('grimTexto').textContent = g.efecto + ' Hechizo: ' + g.hechizo + '. ' + g.hDesc;
  const usar = document.getElementById('grimUsar'),
    comprar = document.getElementById('grimComprar'),
    heroe = PERSONAJES[ELEGIDO.p][ELEGIDO.sexo].n;
  usar.hidden = !h;
  usar.disabled = g.id == eq;
  usar.textContent = g.id == eq ? 'Lo usa ' + heroe : 'Usar con ' + heroe;
  usar.onclick = () => {
    guardarLogro('grimEquipado', Object.assign({}, LOGROS.grimEquipado, { [pid]: g.id }));
    pintarBiblioteca();
  };
  comprar.hidden = false;
  if (g.hojasFijas) {
    comprar.hidden = !!h;
    comprar.disabled = true;
    comprar.textContent = g.reqTxt;
    return;
  }
  if (h >= 3) {
    comprar.hidden = true;
    return;
  }
  const precio = PRECIO_HOJA[h];
  comprar.disabled = cenizasTengo() < precio;
  comprar.textContent =
    (h ? 'Subir a ' + (h + 1) + ' hojas' : 'Abrir el grimorio') + ' · ' + precio + ' cenizas';
  comprar.onclick = () => {
    if (cenizasTengo() < precio) return;
    guardarLogro('polvo', cenizasTengo() - precio);
    guardarLogro('grim', Object.assign({}, LOGROS.grim, { [g.id]: h + 1 }));
    sfx('cofre');
    pintarBiblioteca();
  };
}

// Al terminar la partida: las cenizas ganadas van a la Biblioteca.
function ganarCenizas() {
  const n = cenizasDePartida();
  if (!n) return;
  guardarLogro('polvo', cenizasTengo() + n);
  document.getElementById('endText').textContent +=
    ' Ganaste ' + n + ' cenizas para la Biblioteca de grimorios.';
}
