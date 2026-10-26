// Personajes elegibles, armas, vestuarios y logros guardados en este navegador.
const heroe = y => ({ idle: f4(128, y, 16, 28), run: f4(192, y, 16, 28), hit: [256, y, 16, 28] });
// tecs: las tres técnicas de las teclas 1-3; ult: golpe final con Q; arma: tipo de arma que puede llevar.
const PERSONAJES = [
  {
    id: 'mago',
    f: { n: 'Lyra', clase: 'Maga', spr: heroe(132) },
    m: { n: 'Orin', clase: 'Mago', spr: heroe(164) },
    hp: 6,
    sp: 1.45,
    stats: [2, 3, 4],
    arma: 'baston',
    ini: 'red_staff',
    tecs: ['hielo', 'fuego', 'rayo'],
    ult: 'abismo',
    d: 'Hechizos a distancia. El rayo se encadena si lo mantienes.',
  },
  {
    id: 'caballero',
    f: { n: 'Aria', clase: 'Caballera', spr: heroe(68) },
    m: { n: 'Kael', clase: 'Caballero', spr: heroe(100) },
    hp: 8,
    sp: 1.35,
    stats: [4, 2, 3],
    arma: 'espada',
    ini: 'regular_sword',
    tecs: ['tajo', 'estocada', 'escudo'],
    ult: 'celestial',
    d: 'Cuerpo a cuerpo. Su tajo corta las balas y su escudo las devuelve.',
  },
  {
    id: 'elfo',
    f: { n: 'Sylwen', clase: 'Elfa arquera', spr: heroe(4) },
    m: { n: 'Fenris', clase: 'Elfo arquero', spr: heroe(36) },
    hp: 6,
    sp: 1.6,
    stats: [2, 4, 3],
    arma: 'arco',
    ini: 'bow',
    tecs: ['flecha', 'abanico', 'espinas'],
    ult: 'lluvia',
    d: 'Flechas rápidas que atraviesan enemigos. La más veloz.',
  },
  {
    id: 'enano',
    f: { n: 'Brunna', clase: 'Enana', spr: heroe(260) },
    m: { n: 'Brom', clase: 'Enano', spr: heroe(292) },
    hp: 10,
    sp: 1.2,
    stats: [5, 1, 5],
    arma: 'martillo',
    ini: 'hammer',
    tecs: ['martillazo', 'hacha', 'pisoton'],
    ult: 'terremoto',
    d: 'Lento y durísimo. Golpes de área que hacen temblar la sala.',
  },
  {
    id: 'lagarto',
    f: { n: 'Ssira', clase: 'Asesina', spr: heroe(196) },
    m: { n: 'Ssirk', clase: 'Asesino', spr: heroe(228) },
    hp: 6,
    sp: 1.7,
    stats: [2, 5, 2],
    arma: 'daga',
    ini: 'knife',
    tecs: ['dagas', 'veneno', 'sombra'],
    ult: 'torbellino',
    d: 'Lluvia de cuchillos, veneno y saltos por la espalda del enemigo.',
  },
];
// mult: daño; cdm: enfriamiento (menos es más rápido); g: género para concordar el efecto.
const ARMAS = {
  red_staff: { n: 'Bastón rubí', spr: [324, 129, 8, 30], tipo: 'baston', mult: 1, g: 'm' },
  green_staff: { n: 'Bastón esmeralda', spr: [340, 129, 8, 30], tipo: 'baston', mult: 1.25, g: 'm' },
  anime_staff: { n: 'Espada rúnica', spr: [322, 65, 12, 30], tipo: 'baston', mult: 1.35, cdm: 0.9, g: 'f' },
  regular_sword: { n: 'Espada común', spr: [323, 10, 10, 21], tipo: 'espada', mult: 1, g: 'f' },
  rusty_sword: { n: 'Espada oxidada', spr: [307, 10, 10, 21], tipo: 'espada', mult: 0.9, cdm: 0.9, g: 'f' },
  knight_sword: { n: 'Espada de caballero', spr: [339, 98, 10, 29], tipo: 'espada', mult: 1.15, g: 'f' },
  golden_sword: { n: 'Espada dorada', spr: [291, 137, 10, 22], tipo: 'espada', mult: 1.25, g: 'f' },
  red_gem_sword: { n: 'Espada de rubí', spr: [339, 10, 10, 21], tipo: 'espada', mult: 1.2, g: 'f' },
  lavish_sword: { n: 'Espada real', spr: [307, 129, 10, 30], tipo: 'espada', mult: 1.3, g: 'f' },
  anime_sword: { n: 'Espada anime', spr: [322, 65, 12, 30], tipo: 'espada', mult: 1.35, g: 'f' },
  katana: { n: 'Katana', spr: [293, 66, 6, 29], tipo: 'espada', mult: 1.1, cdm: 0.72, g: 'f' },
  duel_sword: { n: 'Espada de duelo', spr: [325, 97, 9, 30], tipo: 'espada', mult: 1.15, cdm: 0.88, g: 'f' },
  saw_sword: { n: 'Espada sierra', spr: [307, 70, 10, 25], tipo: 'espada', mult: 1.45, cdm: 1.15, g: 'f' },
  bow: { n: 'Arco de caza', spr: [289, 195, 14, 26], tipo: 'arco', mult: 1, g: 'm' },
  bow_2: { n: 'Arco élfico', spr: [305, 195, 14, 26], tipo: 'arco', mult: 1.25, cdm: 0.9, g: 'm' },
  hammer: { n: 'Martillo', spr: [307, 39, 10, 24], tipo: 'martillo', mult: 1, g: 'm' },
  mace: { n: 'Maza', spr: [339, 39, 10, 24], tipo: 'martillo', mult: 1.1, g: 'f' },
  spiked: { n: 'Garrote con púas', spr: [323, 41, 10, 22], tipo: 'martillo', mult: 1.2, g: 'm' },
  axe: { n: 'Hacha', spr: [341, 74, 9, 21], tipo: 'martillo', mult: 1.15, cdm: 0.88, g: 'f' },
  waraxe: { n: 'Hacha de guerra', spr: [324, 168, 12, 23], tipo: 'martillo', mult: 1.3, g: 'f' },
  double_axe: { n: 'Hacha doble', spr: [288, 167, 16, 24], tipo: 'martillo', mult: 1.4, cdm: 1.1, g: 'f' },
  big_hammer: {
    n: 'Martillo gigante',
    spr: [291, 26, 10, 37],
    tipo: 'martillo',
    mult: 1.55,
    cdm: 1.2,
    g: 'm',
  },
  knife: { n: 'Cuchillo', spr: [293, 10, 6, 13], tipo: 'daga', mult: 1, g: 'm' },
  cleaver: { n: 'Cuchilla', spr: [310, 108, 9, 19], tipo: 'daga', mult: 1.15, g: 'f' },
  machete: { n: 'Machete', spr: [294, 105, 5, 22], tipo: 'daga', mult: 1.25, g: 'm' },
  spear: { n: 'Lanza corta', spr: [309, 161, 6, 30], tipo: 'daga', mult: 1.3, cdm: 1.1, g: 'f' },
};
const AFIJOS = [
  { id: 'brutal', m: 'brutal', f: 'brutal', mult: 1.3, d: '+30 % de daño' },
  { id: 'veloz', m: 'veloz', f: 'veloz', cdm: 0.75, d: 'técnicas más rápidas' },
  { id: 'quema', m: 'ígneo', f: 'ígnea', d: 'quema a los enemigos' },
  { id: 'frio', m: 'gélido', f: 'gélida', d: 'congela y frena' },
  { id: 'vampiro', m: 'vampírico', f: 'vampírica', d: 'golpear te cura' },
];
function nuevaArma(id, afijo) {
  return { id, af: afijo || null };
}
function armaInfo(a) {
  const b = ARMAS[a.id],
    af = AFIJOS.find(x => x.id == a.af);
  return {
    n: b.n + (af ? ' ' + af[b.g] : ''),
    spr: b.spr,
    mult: b.mult * ((af && af.mult) || 1),
    cdm: (b.cdm || 1) * ((af && af.cdm) || 1),
    efecto: af && !af.mult && !af.cdm ? af.id : null,
    d:
      [Math.round((b.mult * ((af && af.mult) || 1) - 1) * 100), (b.cdm || 1) * ((af && af.cdm) || 1)]
        .map((v, i) =>
          i
            ? v < 1
              ? 'más rápida'
              : v > 1
                ? 'más lenta'
                : ''
            : v > 0
              ? '+' + v + ' % daño'
              : v < 0
                ? v + ' % daño'
                : '',
        )
        .filter(Boolean)
        .concat(af && !af.mult && !af.cdm ? [af.d] : [])
        .join(' · ') || 'arma básica',
    raro: !!af,
  };
}
function armaAlAzar(tipo, raro) {
  const ids = Object.keys(ARMAS).filter(k => ARMAS[k].tipo == tipo && !PERSONAJES.some(p => p.ini == k)),
    id = ids[Math.floor(Math.random() * ids.length)];
  return nuevaArma(
    id,
    raro || Math.random() < 0.5 ? AFIJOS[Math.floor(Math.random() * AFIJOS.length)].id : null,
  );
}
const VESTUARIOS = [
  { id: 'normal', n: 'Clásico' },
  { id: 'sombra', n: 'Sombra', c: [106, 76, 255], req: 'zombi', txt: 'Vence al Rey Podrido' },
  { id: 'escarcha', n: 'Escarcha', c: [94, 231, 255], req: 'ogro', txt: 'Vence a Gruk' },
  { id: 'sangre', n: 'Sangre', c: [255, 42, 74], req: 'cenizas', txt: 'Vence al Señor de las Cenizas' },
  { id: 'oro', n: 'Oro', c: [255, 210, 74], req: 'dos', txt: 'Gana con dos héroes distintos' },
  { id: 'pesadilla', n: 'Pesadilla', c: [150, 20, 60], req: 'pesadilla', txt: 'Gana en modo Pesadilla' },
];
let LOGROS = {};
try {
  LOGROS = JSON.parse(localStorage.getItem('mazmorra-logros') || '{}');
} catch (e) {}
function guardarLogro(k, v) {
  LOGROS[k] = v === undefined ? 1 : v;
  try {
    localStorage.setItem('mazmorra-logros', JSON.stringify(LOGROS));
  } catch (e) {}
}
const desbloqueado = v =>
  v.precio
    ? trajeComprado(v)
    : !v.req || (v.req == 'dos' ? (LOGROS.ganadores || []).length >= 2 : !!LOGROS[v.req]);
const tintes = {};
// Recolorea el atlas respetando luces y sombras: así el traje cambia de color sin perder el dibujo.
function atlasVestuario(id) {
  if (tintes[id]) return tintes[id];
  const v = VESTUARIOS.find(x => x.id == id);
  if (!v || !v.c) return atlas;
  const [c, x] = mk(atlas.width, atlas.height);
  x.drawImage(atlas, 0, 0);
  const d = x.getImageData(128, 0, 144, 330),
    a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    const l = (a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11) / 255,
      k = 0.35 + l * 1.05;
    for (let j = 0; j < 3; j++) a[i + j] = Math.min(255, a[i + j] * 0.3 + v.c[j] * k * 0.7);
  }
  x.putImageData(d, 128, 0);
  return (tintes[id] = c);
}
const ELEGIDO = { p: 0, sexo: 'f', vest: 'normal', modo: 'normal', jug: 1, p2: 1, sexo2: 'm' };
try {
  Object.assign(ELEGIDO, JSON.parse(localStorage.getItem('mazmorra-heroe') || '{}'));
} catch (e) {}
const PERS = () => PERSONAJES[ELEGIDO.p] || PERSONAJES[0];
function mejorasDe(p) {
  p = p || PERS();
  return p.tecs
    .map(t => ({ id: t, n: TEC[t].mej[0], d: TEC[t].mej[1], max: 2, ico: t }))
    .concat([
      { id: 'corazon', n: 'Corazón de dragón', d: 'Un corazón más y la vida llena.', max: 3, ico: 'corazon' },
      {
        id: 'abismo',
        n: 'Furia hambrienta',
        d: 'Tu golpe final se carga un 50 % más rápido.',
        max: 2,
        ico: p.ult,
      },
      { id: 'pies', n: 'Pies de viento', d: 'Corres más rápido y ruedas más seguido.', max: 2, ico: 'pies' },
      { id: 'cura', n: 'Pócima mayor', d: 'Recuperas toda la vida.', max: 99, ico: 'cura' },
    ]);
}
function pintarElegir() {
  const L = document.getElementById('heroes');
  if (!L.children.length) {
    PERSONAJES.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'heroe';
      b.type = 'button';
      b.innerHTML =
        '<canvas width="48" height="84"></canvas><strong></strong><span class="clase"></span><span class="barras"></span>';
      b.onclick = () => {
        ELEGIDO.p = i;
        pintarElegir();
      };
      L.appendChild(b);
    });
  }
  [...L.children].forEach((b, i) => {
    const p = PERSONAJES[i],
      s = p[ELEGIDO.sexo];
    b.querySelector('strong').textContent = s.n;
    b.querySelector('.clase').textContent = s.clase;
    b.setAttribute('aria-pressed', i == ELEGIDO.p);
    b.querySelector('.barras').innerHTML = ['Vida', 'Rapidez', 'Fuerza']
      .map(
        (n, k) =>
          '<span class="barra"><em>' + n + '</em><i style="width:' + p.stats[k] * 20 + '%"></i></span>',
      )
      .join('');
  });
  const p = PERS();
  document.getElementById('heroeDesc').textContent = p.d;
  const T = document.getElementById('heroeTecs');
  T.innerHTML = '';
  tecsEquipadas(ELEGIDO.p)
    .concat([p.ult])
    .forEach((t, k) => {
      const d = document.createElement('span');
      d.className = 'tec';
      const c = document.createElement('canvas');
      c.width = c.height = 36;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      icono(x, t, 18, 18, 3);
      d.appendChild(c);
      d.appendChild(document.createTextNode((k < 3 ? k + 1 + ' ' : 'Q ') + (k < 3 ? TEC[t].n : ULT[t].n)));
      T.appendChild(d);
    });
  document
    .querySelectorAll('.sexo')
    .forEach(b => b.setAttribute('aria-pressed', b.dataset.s == ELEGIDO.sexo));
  if (coarse) ELEGIDO.jug = 1;
  document
    .querySelectorAll('.njug')
    .forEach(b => b.setAttribute('aria-pressed', +b.dataset.n == ELEGIDO.jug));
  document.getElementById('filaJug').hidden = coarse;
  const j2 = PERSONAJES[ELEGIDO.p2][ELEGIDO.sexo2];
  document.getElementById('j2').hidden = ELEGIDO.jug != 2;
  document.getElementById('j2nombre').textContent = j2.n + ', ' + j2.clase.toLowerCase();
  document
    .querySelectorAll('.sexo2')
    .forEach(b => b.setAttribute('aria-pressed', b.dataset.s == ELEGIDO.sexo2));
  if (!LOGROS.cenizas) ELEGIDO.modo = 'normal';
  document.querySelectorAll('.modo').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.m == ELEGIDO.modo);
    if (b.dataset.m == 'pesadilla') b.textContent = LOGROS.cenizas ? 'Pesadilla' : 'Pesadilla (bloqueado)';
  });
  const V = document.getElementById('vestuarios');
  V.innerHTML = '';
  VESTUARIOS.forEach(v => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'vest';
    const ok = desbloqueado(v);
    b.innerHTML =
      '<i style="background:' +
      (v.c ? 'rgb(' + v.c.join(',') + ')' : 'linear-gradient(90deg,#6a4cff,#ff5a3c)') +
      '"></i><span></span>';
    b.querySelector('span').textContent = ok ? v.n : v.precio ? v.precio + ' cenizas' : 'Bloqueado';
    b.title = ok ? v.n : v.precio ? v.n + ': ' + v.precio + ' cenizas' : v.txt;
    b.setAttribute('aria-pressed', ELEGIDO.vest == v.id);
    b.setAttribute(
      'aria-label',
      ok
        ? 'Vestuario ' + v.n
        : 'Vestuario ' + v.n + (v.precio ? ' a la venta: ' + v.precio + ' cenizas' : ' bloqueado: ' + v.txt),
    );
    b.onclick = () => {
      if (!ok && v.precio) {
        if (!tocarTrajeEnVenta(v)) return;
      } else if (!ok) {
        document.getElementById('vestAviso').textContent =
          'Para desbloquear ' + v.n + ': ' + v.txt.toLowerCase() + '.';
        return;
      }
      ELEGIDO.vest = v.id;
      if (ok) document.getElementById('vestAviso').textContent = '';
      pintarElegir();
    };
    V.appendChild(b);
  });
  try {
    localStorage.setItem('mazmorra-heroe', JSON.stringify(ELEGIDO));
    pintarRecordTorre();
  } catch (e) {}
}
function animarElegir() {
  if (document.getElementById('elegir').hidden) return;
  const src = atlasVestuario(ELEGIDO.vest),
    t = Math.floor(performance.now() / 150) % 4;
  [...document.getElementById('heroes').children].forEach((b, i) => {
    const c = b.querySelector('canvas'),
      x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.clearRect(0, 0, 48, 84);
    const r = PERSONAJES[i][ELEGIDO.sexo].spr[i == ELEGIDO.p ? 'run' : 'idle'][t];
    x.drawImage(i == ELEGIDO.p ? src : atlas, r[0], r[1], 16, 28, 0, 0, 48, 84);
  });
  // En el paso del vestuario, tu héroe en grande con el traje que elegiste.
  const vp = document.getElementById('vestPrevia').getContext('2d'),
    rv = PERSONAJES[ELEGIDO.p][ELEGIDO.sexo].spr.run[t];
  vp.imageSmoothingEnabled = false;
  vp.clearRect(0, 0, 48, 84);
  vp.drawImage(src, rv[0], rv[1], 16, 28, 0, 0, 48, 84);
  requestAnimationFrame(animarElegir);
}
function abrirElegir() {
  initAudio();
  document.getElementById('menu').hidden = true;
  document.getElementById('endScr').hidden = true;
  document.getElementById('elegir').hidden = false;
  pintarElegir();
  animarElegir();
  irPaso(1);
}
document.querySelectorAll('.sexo').forEach(
  b =>
    (b.onclick = () => {
      ELEGIDO.sexo = b.dataset.s;
      pintarElegir();
    }),
);
document.querySelectorAll('.njug').forEach(
  b =>
    (b.onclick = () => {
      ELEGIDO.jug = +b.dataset.n;
      pintarElegir();
    }),
);
document.querySelectorAll('.sexo2').forEach(
  b =>
    (b.onclick = () => {
      ELEGIDO.sexo2 = b.dataset.s;
      pintarElegir();
    }),
);
document.getElementById('j2ant').onclick = () => {
  ELEGIDO.p2 = (ELEGIDO.p2 + PERSONAJES.length - 1) % PERSONAJES.length;
  pintarElegir();
};
document.getElementById('j2sig').onclick = () => {
  ELEGIDO.p2 = (ELEGIDO.p2 + 1) % PERSONAJES.length;
  pintarElegir();
};
document.querySelectorAll('.modo').forEach(
  b =>
    (b.onclick = () => {
      const av = document.getElementById('modoAviso');
      if (b.dataset.m == 'pesadilla' && !LOGROS.cenizas) {
        av.textContent = 'Pesadilla se desbloquea al ganar una vez.';
        return;
      }
      ELEGIDO.modo = b.dataset.m;
      av.textContent =
        ELEGIDO.modo == 'pesadilla'
          ? 'Pesadilla: jefes con el doble de vida y más rápidos, más enemigos, balas veloces y cada golpe quita un corazón entero.'
          : '';
      pintarElegir();
    }),
);
