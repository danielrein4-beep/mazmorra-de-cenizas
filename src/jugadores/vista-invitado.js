// En línea, cada uno tiene su propia cámara: el anfitrión dibuja una segunda vista que sigue al invitado,
// con la forma de la pantalla del invitado, y esa es la imagen que viaja por la videollamada.
const VISTA2 = {
  cv: document.createElement('canvas'),
  OW: 960,
  OH: 540,
  cam: { x: 240, y: 160 },
  zoom: 1,
  zt: 1,
};
VISTA2.o = VISTA2.cv.getContext('2d');
VISTA2.cv.width = VISTA2.OW;
VISTA2.cv.height = VISTA2.OH;
const vistaPropia = () => !!(enRed && enRed.rol == 'anfitrion' && G && G.jugTodos && G.jugTodos.length > 1);

// El invitado manda el tamaño de su lienzo; la vista se rehace cuando cambia (por ejemplo, al girar el teléfono).
function medidasInvitado(e) {
  const ow = Math.max(300, Math.min(1400, Math.round(e.w || 0))),
    oh = Math.max(300, Math.min(1400, Math.round(e.h || 0)));
  if (!e.w || (ow == VISTA2.OW && oh == VISTA2.OH)) return;
  VISTA2.OW = VISTA2.cv.width = ow;
  VISTA2.OH = VISTA2.cv.height = oh;
  VISTA2.o.imageSmoothingEnabled = false;
  VISTA2.vineta = null;
}

// Cámara del invitado: igual que la de un jugador solo, pero con su pantalla y su héroe.
function camaraInvitado(especial) {
  const V = VISTA2,
    P = G.jugTodos[1],
    B = G.B,
    t = (enRed.entrada && enRed.entrada.raton) || !coarse,
    vw0 = V.OW / 3,
    vh0 = V.OH / 3,
    base = (B && !B.dead ? 0.8 : 1) * (V.OH > V.OW ? vw0 / 250 : t ? 1 : 1.12);
  let focus = especial;
  if (!focus) {
    focus = { x: P.x + (P.ax - P.x) * 0.22, y: P.y - 14 + (P.ay - P.y) * 0.22 };
    if (B && !B.dead) {
      focus.x = focus.x * 0.7 + B.x * 0.3;
      focus.y = focus.y * 0.7 + (B.y - B.z - 30) * 0.3;
    }
    V.zt += (base - V.zt) * 0.05;
  } else V.zt = G.zt;
  V.cam.x += (focus.x - V.cam.x) * 0.1;
  V.cam.y += (focus.y - V.cam.y) * 0.1;
  V.zoom += (V.zt - V.zoom) * 0.1;
  const vw = vw0 / V.zoom,
    vh = vh0 / V.zoom;
  V.cam.x = vw >= WW ? WW / 2 : Math.max(vw / 2, Math.min(WW - vw / 2, V.cam.x));
  V.cam.y = vh >= WH ? WH / 2 : Math.max(vh / 2, Math.min(WH - vh / 2, V.cam.y));
}

// Dibuja la vista del invitado cambiando por un momento el lienzo, el tamaño, la cámara y el héroe activo.
function renderInvitado() {
  conSala(G.jugTodos[1].sala, pintarInvitado);
}
function pintarInvitado() {
  const V = VISTA2,
    antes = [o, OW, OH, VW, VH, VINETA, G.cam, G.zoom, G.P];
  o = V.o;
  OW = V.OW;
  OH = V.OH;
  VW = OW / 3;
  VH = OH / 3;
  VINETA = V.vineta || (V.vineta = hacerVineta());
  G.cam = V.cam;
  G.zoom = V.zoom;
  G.P = G.jugTodos[1];
  try {
    // Si el invitado está en otro cuarto, se dibuja su cuarto antes de su pantalla.
    if (separadas()) drawWorld();
    pintarSalida();
  } finally {
    [o, OW, OH, VW, VH, VINETA, G.cam, G.zoom, G.P] = antes;
  }
}
