// Jefes dibujados con una hoja de animaciones hecha por un artista (en vez de los cuadros del atlas).
// Kiplot es el Dragón Demonio de Sombras de Vinzes (itch.io, uso en juegos permitido): una fila por
// animación (quieto, caminar, ataque, golpe, muerte), diez cuadros cada una, mirando a la derecha.
const KIPLOT_IMG = new Image();
KIPLOT_IMG.src = KIPLOT_SRC;
const HOJAS = {
  kiplot: { img: KIPLOT_IMG, fw: 248, fh: 136, n: 10, pieX: 117, pieY: 123, escala: 0.92 },
};
const FILA_HOJA = { idle: 0, walk: 1, attack: 2, hit: 3, death: 4 };

// Qué animación y qué cuadro toca según lo que está haciendo el jefe.
function cuadroHoja(B, t, H) {
  if (B.dead) return [FILA_HOJA.death, Math.min(H.n - 1, Math.floor(B.dt / 14))];
  // Al revivir se alza rugiendo (la animación de golpe es la que se para en dos patas).
  if (B.trans) return [FILA_HOJA.hit, Math.floor(t / 8) % H.n];
  if (B.st != 'move') return [FILA_HOJA.attack, Math.floor(B.t / 5) % H.n];
  if (B.moving) return [FILA_HOJA.walk, Math.floor(t / 6) % H.n];
  return [FILA_HOJA.idle, Math.floor(t / 8) % H.n];
}
// Dibuja el jefe en el mundo con los pies en (B.x, y). Devuelve false si la hoja todavía no cargó.
function drawJefeHoja(B, t, jx, y) {
  const H = HOJAS[B.id];
  if (!H || !H.img.complete || !H.img.naturalWidth) return false;
  const [fila, n] = cuadroHoja(B, t, H),
    k = H.escala,
    der = B.face >= 0;
  w.save();
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
// Para la entrada «VS»: la hoja y el primer cuadro quieto.
const retratoHoja = B => {
  const H = HOJAS[B.id];
  return H && H.img.complete ? [H.img, [0, 0, H.fw, H.fh]] : null;
};
