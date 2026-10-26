// Carta de aventurero: una imagen con tu héroe, tu título, su insignia y tu récord de la Torre,
// para compartir por WhatsApp o guardar en el teléfono.
const URL_JUEGO = 'danielrein4-beep.github.io/mazmorra-de-cenizas';

function hacerCarta() {
  const P = G.jug[0],
    record = Math.max(LOGROS.torre || 0, G.piso || 0),
    nivel = nivelTitulo(record),
    T = TITULOS[nivel],
    [c, x] = mk(720, 400);
  const fondo = x.createLinearGradient(0, 0, 720, 400);
  fondo.addColorStop(0, '#1a1030');
  fondo.addColorStop(1, '#0b0812');
  x.fillStyle = fondo;
  x.fillRect(0, 0, 720, 400);
  x.strokeStyle = T.borde || T.metal[1];
  x.lineWidth = 8;
  x.strokeRect(8, 8, 704, 384);
  x.strokeStyle = T.metal[0];
  x.lineWidth = 2;
  x.strokeRect(20, 20, 680, 360);
  dibujarInsignia(x, nivel, 160, 190, 220, 40);
  const r = P.spr.idle[0];
  x.imageSmoothingEnabled = false;
  x.drawImage(P.src, r[0], r[1], r[2], r[3], 600, 240, r[2] * 4, r[3] * 4);
  const t = (s, px, py, size, col, peso) => {
    x.font = (peso || 700) + ' ' + size + 'px "Pixelify Sans",monospace';
    x.fillStyle = col;
    x.fillText(s, px, py);
  };
  t('CARTA DE AVENTURERO', 300, 70, 20, '#8f82a6');
  t(P.nombre, 300, 120, 44, '#ffffff');
  t(PERSONAJES[P.pid][ELEGIDO.sexo].clase, 300, 150, 20, '#c3b6d9', 400);
  // El título usa la letra más grande que entre en el espacio libre de la carta.
  let tam = 36;
  x.font = '700 ' + tam + 'px "Pixelify Sans",monospace';
  while (tam > 16 && x.measureText(T.n).width > 380) x.font = '700 ' + --tam + 'px "Pixelify Sans",monospace';
  t(T.n, 300, 205, tam, T.borde || T.metal[1]);
  t('Récord de la Torre: piso ' + record + ' de 100', 300, 250, 22, '#ffe94a');
  if (G.piso)
    t(
      'Esta partida: piso ' + G.piso + (G.dif.id == 'pesadilla' ? ' · Pesadilla' : ''),
      300,
      282,
      18,
      '#c3b6d9',
      400,
    );
  t(new Date().toLocaleDateString('es'), 300, 330, 16, '#8f82a6', 400);
  t('Mazmorra de Cenizas · ' + URL_JUEGO, 40, 372, 14, '#6a5a8a', 400);
  return c;
}

function mostrarCarta() {
  const c = hacerCarta(),
    img = document.getElementById('cartaImg');
  img.src = c.toDataURL('image/png');
  img.hidden = false;
  document.getElementById('cartaBtn').hidden = false;
  document.getElementById('cartaBtn').onclick = () => compartirCarta(c);
}

// En el teléfono abre el menú de compartir (WhatsApp, Instagram…); en la computadora la descarga.
function compartirCarta(c) {
  c.toBlob(async blob => {
    const archivo = new File([blob], 'carta-mazmorra.png', { type: 'image/png' }),
      texto =
        'Llegué al piso ' +
        Math.max(LOGROS.torre || 0, G.piso || 0) +
        ' de la Torre en Mazmorra de Cenizas. ¿Me superas? https://' +
        URL_JUEGO;
    try {
      if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
        await navigator.share({ files: [archivo], text: texto, title: 'Mazmorra de Cenizas' });
        return;
      }
    } catch (e) {
      if (e && e.name == 'AbortError') return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'carta-mazmorra.png';
    a.click();
  }, 'image/png');
}

// Pantalla final de la Torre: piso alcanzado, rango y la carta lista para compartir.
function finTorre(win) {
  const rec = LOGROS.torre || G.piso;
  document.getElementById('endTitle').textContent = win
    ? '¡Eres el Rey Mago!'
    : 'Caíste en el piso ' + G.piso;
  document.getElementById('endText').textContent =
    (win ? 'Venciste la Torre completa. ' : '') +
    'Rango: ' +
    tituloDe(G.piso).n +
    '. Tu récord: piso ' +
    rec +
    ' de 100.';
  mostrarCarta();
}

// Fila de la pantalla de elegir: Aventura o Torre, con tu récord y su insignia.
function pintarRecordTorre() {
  const rec = LOGROS.torre || 0,
    cv2 = document.getElementById('recordInsignia'),
    x = cv2.getContext('2d');
  x.clearRect(0, 0, cv2.width, cv2.height);
  dibujarInsignia(x, nivelTitulo(rec), 24, 26, 44, 0);
  document.getElementById('recordTexto').textContent = rec
    ? 'Tu récord: piso ' + rec + ' · ' + tituloDe(rec).n
    : 'Todavía no subiste la Torre: ' + TITULOS[0].n;
  const salidas = pisosDeSalida(),
    torre = ELEGIDO.juego == 'torre',
    P = document.getElementById('pisos');
  if (!salidas.includes(ELEGIDO.pisoInicio)) ELEGIDO.pisoInicio = 1;
  document.getElementById('filaPiso').hidden = !torre || salidas.length < 2;
  P.innerHTML = '';
  salidas.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sec';
    b.textContent = 'Piso ' + s;
    b.title = tituloDe(s).n;
    b.setAttribute('aria-pressed', s == ELEGIDO.pisoInicio);
    b.onclick = () => {
      ELEGIDO.pisoInicio = s;
      pintarRecordTorre();
    };
    P.appendChild(b);
  });
  document
    .querySelectorAll('.juego')
    .forEach(b => b.setAttribute('aria-pressed', b.dataset.j == (ELEGIDO.juego || 'aventura')));
}
document.querySelectorAll('.juego').forEach(
  b =>
    (b.onclick = () => {
      ELEGIDO.juego = b.dataset.j;
      if (b.dataset.j == 'arena' && !coarse) ELEGIDO.jug = 2;
      document.getElementById('modoAviso').textContent =
        b.dataset.j == 'reto'
          ? textoReto()
          : b.dataset.j == 'arena'
            ? coarse
              ? 'Arena: tú contra un amigo, al mejor de tres. En el teléfono se juega en línea (paso 4).'
              : 'Arena: tú contra un amigo, al mejor de tres, en esta compu o en línea.'
            : '';
      if (typeof pintarElegir == 'function') pintarElegir();
      pintarRecordTorre();
    }),
);
