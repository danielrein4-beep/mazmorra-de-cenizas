// Jefes dibujados con una hoja de animaciones hecha por un artista (en vez de los cuadros del atlas).
// Cada hoja tiene una fila por animación (quieto, caminar, ataque, golpe, muerte), mirando a la derecha.
// Kiplot: el Dragón Demonio de Sombras de Vinzes. Silfred: la ArchDemon y Zagred: la DemonKin de KiyoZ
// (serie DuskBorne). Belial: Noir «ascendida» de TheSpriteShop. Todos de itch.io, con uso en juegos permitido.
const imagenHoja = src => Object.assign(new Image(), { src });
const HOJAS = {
  // filas: cuadros de cada animación; vel: pasos por cuadro; escala: 1 o 2 si es pixel art del tamaño del
  // juego; menos de 1 si el dibujo es más fino (se reduce a los píxeles del mundo, ver cuadroLimpio).
  kiplot: {
    img: imagenHoja(KIPLOT_SRC),
    fw: 248,
    fh: 136,
    filas: [10, 10, 10, 10, 10],
    vel: [8, 6, 5, 8, 14],
    pieX: 117,
    pieY: 123,
    escala: 0.92,
  },
  silfred: {
    img: imagenHoja(SILFRED_SRC),
    fw: 128,
    fh: 128,
    filas: [6, 6, 30, 4, 8],
    vel: [8, 6, 3, 6, 16],
    pieX: 62,
    pieY: 80,
    escala: 1,
  },
  zagred: {
    img: imagenHoja(ZAGRED_SRC),
    fw: 128,
    fh: 128,
    filas: [6, 8, 12, 4, 8],
    vel: [8, 6, 5, 6, 16],
    pieX: 61,
    pieY: 80,
    escala: 2,
  },
  // Belial trae una sola animación (flotando, con sus alas); la usa para todo. Mira a la izquierda.
  belial: {
    img: imagenHoja(BELIAL_SRC),
    fw: 162,
    fh: 209,
    filas: [7, 7, 7, 7, 7],
    vel: [8, 8, 4, 6, 16],
    pieX: 72,
    pieY: 152,
    escala: 0.7,
    unaFila: 1,
    izq: 1,
    retrato: [22, 18, 100, 140],
  },
};
const FILA_HOJA = { idle: 0, walk: 1, attack: 2, hit: 3, death: 4 };

// Para que los diablos parezcan del mismo juego que los héroes: cada cuadro se pasa una vez a los píxeles
// del mundo (bordes nítidos, sin medio transparente) y lleva el mismo contorno oscuro de un píxel que el
// resto de los personajes. Se guarda para no repetirlo.
function cuadroLimpio(H, fila, n) {
  const clave = fila * 100 + n;
  H.cache = H.cache || {};
  if (H.cache[clave]) return H.cache[clave];
  const k = H.escala,
    W = Math.ceil(H.fw * k) + 2,
    A = Math.ceil(H.fh * k) + 2,
    c = Object.assign(document.createElement('canvas'), { width: W, height: A }),
    x = c.getContext('2d', { willReadFrequently: true });
  x.imageSmoothingEnabled = k < 1;
  x.imageSmoothingQuality = 'high';
  x.drawImage(H.img, n * H.fw, H.unaFila ? 0 : fila * H.fh, H.fw, H.fh, 1, 1, H.fw * k, H.fh * k);
  const img = x.getImageData(0, 0, W, A),
    p = img.data,
    lleno = new Uint8Array(W * A);
  for (let j = 0; j < W * A; j++) {
    lleno[j] = p[j * 4 + 3] > 110 ? 1 : 0;
    p[j * 4 + 3] = lleno[j] ? 255 : 0;
  }
  for (let j = 0; j < W * A; j++) {
    if (lleno[j]) continue;
    const px = j % W;
    if ((px > 0 && lleno[j - 1]) || (px < W - 1 && lleno[j + 1]) || lleno[j - W] || lleno[j + W]) {
      p[j * 4] = 14;
      p[j * 4 + 1] = 6;
      p[j * 4 + 2] = 22;
      p[j * 4 + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  return (H.cache[clave] = c);
}

// Qué animación y qué cuadro toca según lo que está haciendo el jefe.
function cuadroHoja(B, t, H) {
  const c = (fila, paso) => [fila, Math.floor(paso / H.vel[fila]) % H.filas[fila]];
  if (B.dead) return [FILA_HOJA.death, Math.min(H.filas[4] - 1, Math.floor(B.dt / H.vel[4]))];
  // Al revivir: la animación de golpe (el dragón se alza en dos patas).
  if (B.trans) return c(FILA_HOJA.hit, t);
  if (B.st != 'move') return c(FILA_HOJA.attack, B.t);
  if (B.moving) return c(FILA_HOJA.walk, t);
  return c(FILA_HOJA.idle, t);
}
// Dibuja el jefe en el mundo con los pies en (B.x, y). Devuelve false si la hoja todavía no cargó.
function drawJefeHoja(B, t, jx, y) {
  const H = HOJAS[B.id];
  if (!H || !H.img.complete || !H.img.naturalWidth) return false;
  const [fila, n] = cuadroHoja(B, t, H),
    k = H.escala,
    der = B.face >= 0 != !!H.izq;
  w.save();
  w.imageSmoothingEnabled = false;
  w.translate(Math.round(B.x + jx), Math.round(y));
  if (!der) w.scale(-1, 1);
  // Brillo de su color alrededor; blanco al recibir un golpe; rojo cuando está furioso.
  w.filter =
    B.hit > 2
      ? 'brightness(3.5)'
      : B.berserk
        ? 'drop-shadow(0 0 3px #ff2a4a) drop-shadow(0 0 1px #ff5a7a)'
        : 'drop-shadow(0 0 3px #8a2aff)';
  if (B.dead && t % 4 < 2 && B.dt < 100) w.filter = 'brightness(3)';
  w.drawImage(cuadroLimpio(H, fila, n), -Math.round(H.pieX * k) - 1, -Math.round(H.pieY * k) - 1);
  w.restore();
  return true;
}
// Para la entrada «VS»: la hoja y el primer cuadro quieto, recortado a la figura.
const retratoHoja = B => {
  const H = HOJAS[B.id];
  if (!H || !H.img.complete) return null;
  if (H.retrato) return [H.img, H.retrato];
  return H == HOJAS.kiplot ? [H.img, [0, 0, H.fw, H.fh]] : [H.img, [H.pieX - 34, H.pieY - 70, 68, 74]];
};
