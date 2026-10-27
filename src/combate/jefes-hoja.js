// Jefes dibujados con una hoja de animaciones hecha por un artista (en vez de los cuadros del atlas).
// Cada hoja tiene una fila por animación (quieto, caminar, ataque, golpe, muerte), mirando a la derecha.
// Kiplot: el Dragón Demonio de Sombras de Vinzes. Silfred: la ArchDemon y Zagred: la DemonKin de KiyoZ
// (serie DuskBorne). Todos de itch.io, con uso en juegos permitido.
const imagenHoja = src => Object.assign(new Image(), { src });
const HOJAS = {
  // filas: cuadros de cada animación; vel: pasos por cuadro; suave: dibujo en alta (no es pixel art).
  kiplot: {
    img: imagenHoja(KIPLOT_SRC),
    fw: 248,
    fh: 136,
    filas: [10, 10, 10, 10, 10],
    vel: [8, 6, 5, 8, 14],
    pieX: 117,
    pieY: 123,
    escala: 0.92,
    suave: 1,
  },
  silfred: {
    img: imagenHoja(SILFRED_SRC),
    fw: 128,
    fh: 128,
    filas: [6, 6, 30, 4, 8],
    vel: [8, 6, 3, 6, 16],
    pieX: 62,
    pieY: 80,
    escala: 1.5,
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
};
const FILA_HOJA = { idle: 0, walk: 1, attack: 2, hit: 3, death: 4 };

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
    der = B.face >= 0;
  w.save();
  w.imageSmoothingEnabled = !!H.suave;
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
  w.drawImage(H.img, n * H.fw, fila * H.fh, H.fw, H.fh, -H.pieX * k, -H.pieY * k, H.fw * k, H.fh * k);
  w.restore();
  return true;
}
// Para la entrada «VS»: la hoja y el primer cuadro quieto, recortado a la figura.
const retratoHoja = B => {
  const H = HOJAS[B.id];
  if (!H || !H.img.complete) return null;
  return H.suave ? [H.img, [0, 0, H.fw, H.fh]] : [H.img, [H.pieX - 34, H.pieY - 70, 68, 74]];
};
