// Armario de técnicas: cada héroe lleva tres. Las de base vienen con él; las de la Biblioteca se compran
// con cenizas (por ahora el mago tiene cinco) y se eligen aquí: toca un espacio y luego la técnica que va ahí.
const TECS_EXTRA = [
  { id: 'luz', heroe: 'mago', precio: 150 },
  { id: 'cadenas', heroe: 'mago', precio: 180 },
  { id: 'vacio', heroe: 'mago', precio: 220 },
  { id: 'meteoro', heroe: 'mago', precio: 260 },
  { id: 'eclipse', heroe: 'mago', precio: 320 },
];
const tecComprada = id => !TECS_EXTRA.some(t => t.id == id) || (LOGROS.tecsCompradas || []).includes(id);
const tecsDelHeroe = pi =>
  PERSONAJES[pi].tecs.concat(TECS_EXTRA.filter(t => t.heroe == PERSONAJES[pi].id).map(t => t.id));
// Las tres que lleva el héroe: las elegidas en el armario si siguen valiendo, si no las de base.
function tecsEquipadas(pi) {
  const p = PERSONAJES[pi],
    e = (LOGROS.tecsEquipadas || {})[p.id];
  return e && e.length == 3 && e.every(id => tecsDelHeroe(pi).includes(id) && tecComprada(id))
    ? e.slice()
    : p.tecs.slice();
}
let espacioArmario = 0,
  tecAComprar = null;

function mostrarArmario() {
  const pi = ELEGIDO.p,
    p = PERSONAJES[pi],
    lleva = tecsEquipadas(pi),
    E = document.getElementById('armarioEspacios'),
    L = document.getElementById('armarioLista');
  document.getElementById('armarioTitulo').textContent = 'Armario de ' + p[ELEGIDO.sexo].n;
  const icoBtn = (id, extra) => {
    const b = document.createElement('button'),
      c = document.createElement('canvas');
    b.type = 'button';
    c.width = c.height = 40;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    icono(x, id, 20, 20, 3);
    b.appendChild(c);
    b.appendChild(Object.assign(document.createElement('span'), { textContent: extra }));
    return b;
  };
  E.innerHTML = '';
  lleva.forEach((id, i) => {
    const b = icoBtn(id, i + 1 + ' · ' + TEC[id].n);
    b.className = 'espacio';
    b.setAttribute('aria-pressed', i == espacioArmario);
    b.onclick = () => {
      espacioArmario = i;
      mostrarArmario();
    };
    E.appendChild(b);
  });
  L.innerHTML = '';
  tecsDelHeroe(pi).forEach(id => {
    const x = TECS_EXTRA.find(t => t.id == id),
      tiene = tecComprada(id),
      b = icoBtn(id, TEC[id].n);
    b.className = 'tecArm' + (lleva.includes(id) ? ' puesta' : '') + (tiene ? '' : ' bloqueada');
    const d = document.createElement('small');
    d.textContent = tiene ? TEC[id].desc || TEC[id].mej[1] : x.precio + ' cenizas · ' + TEC[id].desc;
    b.appendChild(d);
    b.onclick = () => elegirEnArmario(pi, id, x);
    L.appendChild(b);
  });
  irAPanelSiHace('armario');
}
function elegirEnArmario(pi, id, x) {
  const aviso = document.getElementById('armarioAviso'),
    tengo = LOGROS.polvo || 0;
  if (!tecComprada(id)) {
    if (tengo < x.precio)
      return (aviso.textContent = TEC[id].n + ' cuesta ' + x.precio + ' cenizas y tienes ' + tengo + '.');
    if (tecAComprar != id) {
      tecAComprar = id;
      return (aviso.textContent =
        TEC[id].n + ' cuesta ' + x.precio + ' cenizas. Toca otra vez para comprarla.');
    }
    tecAComprar = null;
    guardarLogro('polvo', tengo - x.precio);
    guardarLogro('tecsCompradas', (LOGROS.tecsCompradas || []).concat([id]));
    sfx('cofre');
    aviso.textContent = '¡Aprendiste ' + TEC[id].n + '! Quedó en el espacio ' + (espacioArmario + 1) + '.';
  } else aviso.textContent = '';
  const lleva = tecsEquipadas(pi),
    ya = lleva.indexOf(id);
  if (ya >= 0) [lleva[ya], lleva[espacioArmario]] = [lleva[espacioArmario], lleva[ya]];
  else lleva[espacioArmario] = id;
  guardarLogro('tecsEquipadas', Object.assign({}, LOGROS.tecsEquipadas, { [PERSONAJES[pi].id]: lleva }));
  espacioArmario = (espacioArmario + 1) % 3;
  mostrarArmario();
}
// Abre el panel solo la primera vez; al repintar no vuelve a guardar de dónde vino.
function irAPanelSiHace(id) {
  if (document.getElementById(id).hidden) irAPanel(id);
}
document.getElementById('armarioBtn').onclick = () => {
  espacioArmario = 0;
  mostrarArmario();
};
document.getElementById('armarioVolver').onclick = () => {
  volverDePanel('armario');
  pintarElegir();
};
