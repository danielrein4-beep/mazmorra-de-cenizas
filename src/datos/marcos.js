// Marcos del nombre: el cartel que va sobre tu héroe mientras juegas, con letras blancas sobre fondo negro.
// Se coleccionan: unos se compran con cenizas y otros solo se ganan con hazañas. Cada uno tiene su efecto:
// brillo, copos, llamas, llamas negras o electricidad.
const MARCOS = [
  { id: 'sencillo', n: 'Sencillo', borde: '#6a5a8a' },
  { id: 'dorado', n: 'Dorado', precio: 300, borde: '#ffd24a', fx: 'brillo' },
  { id: 'escarcha', n: 'Escarcha', precio: 400, borde: '#9af0ff', fx: 'copos' },
  { id: 'carmesi', n: 'En llamas', precio: 600, borde: '#ff3a2a', fx: 'llamas' },
  { id: 'negras', n: 'Llamas negras', precio: 900, borde: '#8a2aff', fx: 'negras' },
  { id: 'electrico', n: 'Fuego eléctrico', precio: 1200, borde: '#b06bff', fx: 'electrico' },
  {
    id: 'dragon',
    n: 'Escamas del Dragón',
    req: () => !!LOGROS.dragon,
    pide: 'Vence al Dragón del piso 100',
    borde: '#ff8a2a',
    fx: 'llamas',
  },
  {
    id: 'reyMago',
    n: 'Corona del Rey Mago',
    req: () => (LOGROS.torre || 0) >= 100,
    pide: 'Llega al piso 100 de la Torre',
    borde: '#ffd24a',
    fx: 'corona',
  },
  {
    id: 'campeon',
    n: 'Campeón',
    req: () => (LOGROS.copasMax || 0) >= 2200,
    pide: 'Llega a la liga Campeón (2.200 copas)',
    borde: '#ff3a2a',
    fx: 'corona',
  },
  {
    id: 'leyenda',
    n: 'Leyenda de Cenizas',
    req: () => (LOGROS.copasMax || 0) >= 3000,
    pide: 'Llega a la liga Leyenda de Cenizas (3.000 copas)',
    borde: '#ff8a2a',
    fx: 'llamas',
  },
  {
    id: 'abismo',
    n: 'Pacto del Abismo',
    req: () => !!LOGROS.pacto,
    pide: 'Vence a Kiplot, Rey de los Demonios',
    borde: '#ff2a4a',
    fx: 'abismo',
  },
];
const marcoDe = id => MARCOS.find(m => m.id == id) || MARCOS[0];
const tengoMarco = m => m.id == 'sencillo' || (LOGROS.marcos || []).includes(m.id) || (m.req && m.req());
// Colores de cada fuego: de afuera hacia el centro.
const FUEGOS = {
  llamas: ['#c0301a', '#ff5a1a', '#ffb04a', '#fff3c0'],
  negras: ['#8a2aff', '#2a0a4a', '#12051e', '#000000'],
  abismo: ['#ff2a4a', '#5a0010', '#12051e', '#000000'],
};

// Una lengua de fuego: sube desde la base, se mece y titila; capas de afuera hacia adentro.
function lenguaFuego(x, cx, base, alto, ancho, col, t, i) {
  const vaiven = Math.sin(t * 0.25 + i * 1.7) * ancho * 0.35,
    h = alto * (0.75 + 0.25 * Math.sin(t * 0.4 + i * 2.3));
  col.forEach((c, n) => {
    const k = 1 - n * 0.24;
    x.fillStyle = c;
    x.beginPath();
    x.moveTo(cx - (ancho / 2) * k, base);
    x.quadraticCurveTo(cx - (ancho / 2) * k, base - h * k * 0.5, cx + vaiven * k, base - h * k);
    x.quadraticCurveTo(cx + (ancho / 2) * k, base - h * k * 0.5, cx + (ancho / 2) * k, base);
    x.fill();
  });
}
// Un rayo en zigzag entre dos puntos, con su brillo.
function rayoCartel(x, x1, y1, x2, y2, c, k) {
  const pts = [[x1, y1]];
  for (let i = 1; i < 6; i++)
    pts.push([
      x1 + ((x2 - x1) * i) / 6 + (Math.random() - 0.5) * 4 * k,
      y1 + ((y2 - y1) * i) / 6 + (Math.random() - 0.5) * 6 * k,
    ]);
  pts.push([x2, y2]);
  [
    [3 * k, c, 0.5],
    [k, '#ffffff', 1],
  ].forEach(([g, col, al]) => {
    x.globalAlpha = al;
    x.strokeStyle = col;
    x.lineWidth = g;
    x.beginPath();
    pts.forEach((p, n) => (n ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
    x.stroke();
  });
  x.globalAlpha = 1;
}

// Dibuja el cartel con el nombre centrado en cx, con su borde inferior en y. k: tamaño (2 en el juego).
function dibujarPlacaNombre(x, cx, y, nombre, id, t, k) {
  const M = marcoDe(id),
    fuego = FUEGOS[M.fx == 'electrico' ? 'negras' : M.fx];
  x.save();
  x.font = 7 * k + 'px ' + FUENTE;
  x.textAlign = 'center';
  x.textBaseline = 'alphabetic';
  const an = Math.ceil(x.measureText(nombre).width) + 10 * k,
    al = 11 * k,
    x0 = Math.round(cx - an / 2),
    y0 = Math.round(y - al);
  // Llamas por detrás: asoman por arriba del cartel.
  if (fuego) {
    const n = Math.max(3, Math.round(an / (6 * k)));
    for (let i = 0; i < n; i++)
      lenguaFuego(x, x0 + ((i + 0.5) * an) / n, y0 + 4 * k, (11 + (i % 3) * 4) * k, 7 * k, fuego, t, i);
  }
  // Fondo negro, borde de su color y un filo claro adentro.
  x.fillStyle = '#050308';
  x.globalAlpha = 0.92;
  x.fillRect(x0, y0, an, al);
  x.globalAlpha = 1;
  x.strokeStyle = M.borde;
  x.lineWidth = k;
  x.strokeRect(x0 + k / 2, y0 + k / 2, an - k, al - k);
  x.globalAlpha = 0.35;
  x.strokeStyle = '#ffffff';
  x.strokeRect(x0 + 1.5 * k, y0 + 1.5 * k, an - 3 * k, al - 3 * k);
  x.globalAlpha = 1;
  // Electricidad: rayos que chispean de una esquina a otra y por los bordes.
  if ((M.fx == 'electrico' || M.fx == 'abismo') && t % 5 < 3) {
    const c = M.fx == 'abismo' ? '#ff2a4a' : '#b06bff',
      lado = Math.floor(t / 5) % 3;
    if (lado == 0) rayoCartel(x, x0 - 2 * k, y0 + al / 2, x0 + an * 0.45, y0 - 3 * k, c, k);
    if (lado == 1) rayoCartel(x, x0 + an + 2 * k, y0 + al / 2, x0 + an * 0.55, y0 + al + 3 * k, c, k);
    if (lado == 2) rayoCartel(x, x0, y0 - k, x0 + an, y0 - k, c, k);
  }
  if (M.fx == 'brillo' || M.fx == 'corona') {
    const p = ((t * 2) % (an + 40 * k)) - 20 * k;
    x.globalAlpha = 0.4;
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.moveTo(x0 + p, y0 + k);
    x.lineTo(x0 + p + 4 * k, y0 + k);
    x.lineTo(x0 + p, y0 + al - k);
    x.lineTo(x0 + p - 4 * k, y0 + al - k);
    x.fill();
    x.globalAlpha = 1;
  }
  if (M.fx == 'copos')
    for (let i = 0; i < 6; i++) {
      x.fillStyle = '#ffffff';
      x.globalAlpha = 0.8;
      x.fillRect(
        x0 + ((i * 29 * k + t * 0.4 * k) % an),
        y0 - 4 * k + ((t * 0.3 + i * 7) % (al + 6 * k)),
        k,
        k,
      );
      x.globalAlpha = 1;
    }
  if (M.fx == 'corona') {
    x.fillStyle = '#ffd24a';
    const c = Math.round(cx);
    x.fillRect(c - 4 * k, y0 - 3 * k, 8 * k, 2 * k);
    [-4, 0, 3].forEach(d => x.fillRect(c + d * k, y0 - 6 * k, k, 3 * k));
    x.fillStyle = '#ff2a4a';
    x.fillRect(c, y0 - 3 * k, k, k);
  }
  // Brasas o chispas que suben del fuego.
  if (fuego)
    for (let i = 0; i < 4; i++) {
      const f = (t * 0.5 + i * 13) % 20;
      x.globalAlpha = 1 - f / 20;
      x.fillStyle = fuego[i % 2 ? 0 : 1] == '#000000' ? fuego[0] : fuego[i % 2];
      x.fillRect(x0 + ((i * 37 * k + Math.floor(t / 20) * 11 * k) % an), y0 - f * k * 0.9, k, k);
    }
  x.globalAlpha = 1;
  // Letras blancas con sombra negra.
  x.fillStyle = '#000000';
  x.fillText(nombre, cx + k, y0 + 8 * k + k);
  x.fillStyle = '#ffffff';
  x.fillText(nombre, cx, y0 + 8 * k);
  x.restore();
}

// Nombre y marco de cada héroe al empezar: el tuyo (apodo o nombre del héroe) y el del amigo en línea.
function ponerNombres(js) {
  js.forEach((P, i) => {
    const amigo = P.invitado && P.invitado.perfil;
    P.etiqueta = i ? P.nombre || 'Jugador ' + (i + 1) : LOGROS.apodo || P.nombre;
    P.marco = i ? 'sencillo' : LOGROS.marco || 'sencillo';
    if (!amigo) return;
    if (typeof amigo.apodo == 'string' && amigo.apodo.trim()) P.etiqueta = amigo.apodo.trim().slice(0, 18);
    if (MARCOS.some(m => m.id == amigo.marco)) P.marco = amigo.marco;
  });
}
// Se dibujan en la pantalla (no en el mundo) para que las letras salgan nítidas: se pasa la posición de
// cada héroe del mundo a la pantalla con la misma cámara que el recorte.
function drawNombres(sx, sy, vw, vh) {
  const ex = OW / vw,
    ey = OH / vh,
    x0 = G.cam.x - vw / 2 + sx,
    y0 = G.cam.y - vh / 2 + sy,
    k = Math.max(2, Math.round(ex / 1.6));
  G.jug.forEach(
    Q =>
      Q.etiqueta &&
      !Q.caido &&
      dibujarPlacaNombre(o, (Q.x - x0) * ex, (Q.y - 31 - y0) * ey, Q.etiqueta, Q.marco, G.t, k),
  );
}
