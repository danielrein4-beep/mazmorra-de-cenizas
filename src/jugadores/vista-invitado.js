// En línea, cada uno tiene su propia cámara: el anfitrión dibuja una vista por invitado que sigue a su
// héroe, con la forma de la pantalla de ese invitado, y esa es la imagen que viaja por su videollamada.
function nuevaVista() {
  const V = {
    cv: document.createElement('canvas'),
    OW: 960,
    OH: 540,
    cam: { x: 240, y: 160 },
    zoom: 1,
    zt: 1,
  };
  V.o = V.cv.getContext('2d');
  V.cv.width = V.OW;
  V.cv.height = V.OH;
  return V;
}
// ¿Hay invitados con héroe en la partida? (entonces el anfitrión dibuja sus vistas).
const vistaPropia = () =>
  !!(enRed && enRed.rol == 'anfitrion' && G && G.jugTodos && G.jugTodos.some(Q => Q.invitado));

// El invitado manda el tamaño de su lienzo; la vista se rehace cuando cambia (por ejemplo, al girar el teléfono).
function medidasInvitado(V, e) {
  const ow = Math.max(300, Math.min(1400, Math.round(e.w || 0))),
    oh = Math.max(300, Math.min(1400, Math.round(e.h || 0)));
  if (!e.w || (ow == V.OW && oh == V.OH)) return;
  V.OW = V.cv.width = ow;
  V.OH = V.cv.height = oh;
  V.o.imageSmoothingEnabled = false;
  V.vineta = null;
}

// Cámara de un invitado: igual que la de un jugador solo, pero con su pantalla y su héroe.
function camaraInvitado(P, especial) {
  const inv = P.invitado,
    V = inv.vista,
    B = G.B,
    t = (inv.entrada && inv.entrada.raton) || !coarse,
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
// Las cámaras de los invitados que están en la sala que se está moviendo.
function camarasInvitados(especial) {
  G.jug.forEach(Q => Q.invitado && camaraInvitado(Q, especial));
}

// Dibuja la vista de cada invitado cambiando por un momento el lienzo, el tamaño, la cámara y el héroe activo.
function renderInvitados() {
  G.jugTodos.forEach(Q => Q.invitado && conSala(Q.sala, () => pintarInvitado(Q)));
}
function pintarInvitado(Q) {
  const V = Q.invitado.vista,
    antes = [o, OW, OH, VW, VH, VINETA, G.cam, G.zoom, G.P];
  o = V.o;
  OW = V.OW;
  OH = V.OH;
  VW = OW / 3;
  VH = OH / 3;
  VINETA = V.vineta || (V.vineta = hacerVineta());
  G.cam = V.cam;
  G.zoom = V.zoom;
  G.P = Q;
  try {
    // Si el invitado está en otro cuarto, se dibuja su cuarto antes de su pantalla.
    if (separadas()) drawWorld();
    pintarSalida();
  } finally {
    [o, OW, OH, VW, VH, VINETA, G.cam, G.zoom, G.P] = antes;
  }
}
