// Pantalla de Ligas: tu escudo y tus copas, la barra hasta la liga siguiente, el camino de ligas con sus
// premios, la temporada (cuánto falta y qué premio llevas) y la tabla mundial de la temporada.

// Escudo de la liga: forma de escudo de su color, con borde claro, copa al centro y corona en las altas.
function pintarEscudo(x, cx, cy, s, liga) {
  const L = LIGAS[liga];
  x.save();
  x.translate(cx, cy);
  x.scale(s / 40, s / 40);
  const forma = () => {
    x.beginPath();
    x.moveTo(-16, -18);
    x.lineTo(16, -18);
    x.lineTo(16, 2);
    x.quadraticCurveTo(14, 14, 0, 20);
    x.quadraticCurveTo(-14, 14, -16, 2);
    x.closePath();
  };
  forma();
  x.fillStyle = '#0b0812';
  x.fill();
  x.lineWidth = 4;
  x.strokeStyle = L.c;
  x.stroke();
  x.lineWidth = 1;
  x.strokeStyle = '#ffffff';
  x.stroke();
  // Copa.
  x.fillStyle = L.c;
  x.fillRect(-7, -8, 14, 8);
  x.fillRect(-2, 0, 4, 6);
  x.fillRect(-6, 6, 12, 3);
  x.fillStyle = '#ffffff';
  x.fillRect(-5, -7, 3, 5);
  if (liga >= 5) {
    x.fillStyle = '#ffd24a';
    x.fillRect(-9, -26, 18, 5);
    [-9, -3, 3, 7].forEach(d => x.fillRect(d, -30, 2, 4));
  }
  x.restore();
}

let tablaLiga = 'camino';
async function mostrarLigas() {
  revisarTemporada();
  const copas = copasTengo(),
    liga = ligaDe(copas),
    sig = LIGAS[liga + 1],
    c = document.getElementById('ligaEscudo').getContext('2d');
  c.clearRect(0, 0, 120, 120);
  pintarEscudo(c, 60, 62, 96, liga);
  document.getElementById('ligaNombre').textContent = LIGAS[liga].n;
  document.getElementById('ligaNombre').style.color = LIGAS[liga].c;
  document.getElementById('ligaCopas').textContent = copas + ' copas';
  document.getElementById('ligaBarra').style.width = sig
    ? Math.round((100 * (copas - LIGAS[liga].desde)) / (sig.desde - LIGAS[liga].desde)) + '%'
    : '100%';
  document.getElementById('ligaSig').textContent = sig
    ? 'Faltan ' + (sig.desde - copas) + ' copas para ' + sig.n
    : '¡Estás en la liga más alta!';
  const hoy = new Date(),
    dias =
      new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 0)).getUTCDate() - hoy.getUTCDate() + 1;
  const mejor = Math.max(LOGROS.ligaTemporada || 0, liga);
  document.getElementById('ligaTemporada').textContent =
    (LOGROS.avisoTemporada ? LOGROS.avisoTemporada + ' ' : '') +
    'La temporada termina en ' +
    Math.max(1, dias) +
    (dias == 1 ? ' día' : ' días') +
    '. Premio por tu mejor liga (' +
    LIGAS[mejor].n +
    '): ' +
    PREMIO_TEMPORADA[mejor] +
    ' cenizas.';
  LOGROS.avisoTemporada = null;
  document.getElementById('tabCamino').setAttribute('aria-pressed', tablaLiga == 'camino');
  document.getElementById('tabTablaLiga').setAttribute('aria-pressed', tablaLiga == 'tabla');
  const L = document.getElementById('ligaLista');
  L.innerHTML = '';
  irAPanelSiHace('ligas');
  if (tablaLiga == 'camino') {
    const cobradas = LOGROS.ligasCobradas || [];
    LIGAS.forEach((G2, i) => {
      const f = document.createElement('div'),
        cv = document.createElement('canvas');
      f.className = 'fila-liga' + (i == liga ? ' actual' : i > liga ? ' bloqueada' : '');
      cv.width = cv.height = 44;
      pintarEscudo(cv.getContext('2d'), 22, 23, 34, i);
      f.appendChild(cv);
      const t = document.createElement('div');
      t.innerHTML = '<b></b><small></small>';
      t.querySelector('b').textContent = G2.n;
      t.querySelector('b').style.color = G2.c;
      t.querySelector('small').textContent =
        G2.desde +
        ' copas' +
        (G2.premio ? ' · premio ' + G2.premio + ' cenizas' : '') +
        (i == 6 ? ' y el marco Campeón' : i == 7 ? ' y el marco Leyenda' : '') +
        (cobradas.includes(i) || (i == 0 && copas >= 0) ? ' · cobrado' : '');
      f.appendChild(t);
      L.appendChild(f);
    });
    return;
  }
  const nota = document.createElement('p');
  nota.textContent = 'Cargando…';
  L.appendChild(nota);
  try {
    const { lista } = await pedir('/api/liga');
    nota.textContent = lista.length
      ? 'Los mejores de la temporada.' + (LOGROS.apodo ? '' : ' Pon tu apodo en Récords para aparecer.')
      : 'Todavía nadie tiene copas esta temporada. ¡Sé el primero!';
    lista.forEach((r, i) => {
      const f = document.createElement('div');
      f.className = 'fila-record' + (r.apodo == LOGROS.apodo ? ' mia' : '');
      f.innerHTML = '<b></b><span class="apodo"></span><span class="piso"></span><small></small>';
      f.querySelector('b').textContent = i + 1;
      f.querySelector('.apodo').textContent = r.apodo;
      f.querySelector('.piso').textContent = r.copas + ' copas';
      f.querySelector('small').textContent = LIGAS[ligaDe(r.copas)].n + (r.heroe ? ' · ' + r.heroe : '');
      L.appendChild(f);
    });
  } catch (e) {
    nota.textContent = SIN_SERVIDOR;
  }
}
document.getElementById('ligasBtn').onclick = mostrarLigas;
document.getElementById('ligasVolver').onclick = () => volverDePanel('ligas');
document.getElementById('tabCamino').onclick = () => ((tablaLiga = 'camino'), mostrarLigas());
document.getElementById('tabTablaLiga').onclick = () => ((tablaLiga = 'tabla'), mostrarLigas());
// El escudo de tu liga en el botón del menú.
function pintarBotonLiga() {
  const c = document.getElementById('ligaIco').getContext('2d');
  c.clearRect(0, 0, 36, 36);
  pintarEscudo(c, 18, 19, 30, ligaDe(copasTengo()));
}
// Al abrir el juego (ya cargado todo) se revisa si empezó una temporada nueva.
addEventListener('load', revisarTemporada);
