// «Una más»: al terminar, la pantalla final muestra lo que viene (lo próximo que puedes comprar, tu
// siguiente nivel, el próximo guardián o logro y el reto del día), y «Otra vez» arranca al instante.
function comprasPosibles() {
  const pi = ELEGIDO.p,
    pid = PERSONAJES[pi].id,
    L = [];
  GRIMORIOS.filter(g => !g.hojasFijas).forEach(g => {
    const h = hojasDe(g.id, pid);
    if (h < 3) L.push({ n: g.n + (h ? ' a ' + (h + 1) + ' hojas' : ''), p: PRECIO_HOJA[h] });
  });
  tecsEquipadas(pi).forEach(id => {
    const f = forjaDe(id);
    if (f < FORJA_MAX) L.push({ n: 'forjar ' + TEC[id].n + ' ' + ROMANO[f + 1], p: PRECIO_FORJA[f] });
  });
  TECS_EXTRA.filter(t => t.heroe == pid && !tecComprada(t.id)).forEach(t =>
    L.push({ n: 'la técnica ' + TEC[t.id].n, p: t.precio }),
  );
  VESTUARIOS.filter(v => v.precio && !trajeComprado(v)).forEach(v =>
    L.push({ n: 'el traje ' + v.n, p: v.precio }),
  );
  return L.sort((a, b) => a.p - b.p);
}
function loQueViene() {
  const tengo = LOGROS.polvo || 0,
    L = comprasPosibles(),
    ya = L.filter(c => c.p <= tengo),
    falta = L.find(c => c.p > tengo),
    E = estado(),
    metas = [];
  if (ya.length)
    metas.push('Ya te alcanza para ' + ya[ya.length - 1].n + ' (' + ya[ya.length - 1].p + ' cenizas).');
  else if (falta) metas.push('Te faltan ' + (falta.p - tengo) + ' cenizas para ' + falta.n + '.');
  metas.push(
    'Te faltan ' + (expParaNivel(E.nivel) - E.exp) + ' de experiencia para el nivel ' + (E.nivel + 1) + '.',
  );
  const rec = LOGROS.torre || 0,
    proximo = Math.min(100, Math.floor(rec / 10) * 10 + 10);
  if (G && (G.torre || G.reto)) {
    if (rec < 50) metas.push('El Minotauro del piso 50 guarda el grimorio de cuatro hojas.');
    else if (!LOGROS.dragon)
      metas.push('En el piso 100 te espera el Dragón, y con él el título de Rey Mago.');
    else metas.push('Próximo guardián: piso ' + proximo + '.');
  } else if (!LOGROS.cenizas)
    metas.push('Vence al Señor de las Cenizas para ganar la Aventura y su vestuario.');
  else {
    const l = LISTA_LOGROS.find(x => !(LOGROS.logros || {})[x.id]);
    if (l) metas.push('Logro pendiente: ' + l.n + '. ' + l.d + ' (+' + l.p + ' cenizas)');
  }
  const R = retoDeHoy();
  metas.push(
    retoHechoHoy()
      ? 'Mañana hay un reto nuevo.'
      : 'Reto de hoy: pisos ' + R.desde + ' a ' + R.hasta + ', paga ' + PREMIO_RETO + ' cenizas.',
  );
  return metas.slice(0, 4);
}
function pintarQueViene() {
  const C = document.getElementById('queViene');
  C.innerHTML = '';
  loQueViene().forEach(t => C.appendChild(Object.assign(document.createElement('li'), { textContent: t })));
}
// Otra vez: misma elección, sin pasar por las pantallas de elegir.
document.getElementById('againBtn').onclick = () => {
  if (ELEGIDO.juego == 'arena' && !(enRed || !coarse)) return abrirElegir();
  start();
};
document.getElementById('cambiarBtn').onclick = abrirElegir;
