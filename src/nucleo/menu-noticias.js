// Portada: el panel «Hoy» con las misiones del día y el reto, y un punto de aviso en los botones cuando
// hay algo para hacer (forjar una técnica o comprar una del armario con las cenizas que tienes).
function pintarNoticiasMenu() {
  const N = document.getElementById('noticias');
  if (!N || document.getElementById('menu').hidden) return;
  const M = avanceMisiones(),
    lista = misionesDeHoy(),
    hechas = lista.filter(m => M.cobradas.includes(m.id)).length,
    clave = JSON.stringify(M) + cenizasTengo() + ELEGIDO.p;
  if (N.dataset.clave == clave) return;
  N.dataset.clave = clave;
  N.innerHTML = '<b class="hoy">Hoy · misiones <span></span></b><ul></ul><p class="reto"></p>';
  N.querySelector('.hoy span').textContent = hechas + ' de 3';
  let primera = true;
  lista.forEach(m => {
    const lista2 = M.cobradas.includes(m.id),
      prog = lista2 ? m.meta : M.prog[m.id] || 0,
      li = document.createElement('li');
    li.className = (lista2 ? 'hecha' : '') + (!lista2 && primera ? ' primera' : '');
    if (!lista2) primera = false;
    li.innerHTML = '<span></span><i><em></em></i><small></small>';
    li.querySelector('span').textContent = m.n;
    li.querySelector('em').style.width = Math.round((100 * prog) / m.meta) + '%';
    li.querySelector('small').textContent = lista2 ? 'Cobrada' : '+' + m.p;
    N.querySelector('ul').appendChild(li);
  });
  N.querySelector('.reto').textContent = retoHechoHoy() ? 'Reto de hoy: superado' : textoReto();
  pintarAvisosMenu();
}
document.getElementById('noticias').onclick = () => mostrarLogros();

// Punto de aviso: Forja si alcanza para subir una técnica, Armario si alcanza para comprar una.
function pintarAvisosMenu() {
  const pi = ELEGIDO.p,
    c = cenizasTengo(),
    forjar = tecsDelHeroe(pi).some(
      id => tecComprada(id) && forjaDe(id) < FORJA_MAX && c >= PRECIO_FORJA[forjaDe(id)],
    ),
    comprar = TECS_EXTRA.some(t => t.heroe == PERSONAJES[pi].id && !tecComprada(t.id) && c >= t.precio);
  document.getElementById('forjaBtn').classList.toggle('aviso', forjar);
  document.getElementById('armarioMenuBtn').classList.toggle('aviso', comprar);
}
