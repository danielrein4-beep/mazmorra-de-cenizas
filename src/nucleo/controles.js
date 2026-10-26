// Botones, teclado, ratón y táctil; arranque cuando carga el atlas.
document.getElementById('playBtn').onclick = abrirElegir;
document.getElementById('againBtn').onclick = abrirElegir;
document.getElementById('empezarBtn').onclick = start;
if (coarse) {
  document.getElementById('keysPc').hidden = true;
  document.getElementById('keysTouch').hidden = false;
}
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code == 'KeyM') {
    alternarMusica();
    return;
  }
  if (!document.getElementById('mejoras').hidden && /^Digit[1-3]$/.test(e.code)) {
    document.querySelectorAll('#mejorasLista button')[+e.code.slice(5) - 1]?.click();
    return;
  }
  if (teclaInvitado(e.code)) {
    if (e.code == 'Space') e.preventDefault();
    return;
  }
  if (!running || !G) return;
  if (teclaJ2(e.code)) return;
  if (G.P.caido && !['KeyM'].includes(e.code)) return;
  if (e.code == 'Space' || e.code == 'ShiftLeft') {
    dash();
    e.preventDefault();
  }
  if (e.code == 'KeyQ') ult();
  if (e.code == 'KeyE') interactuar();
  if (e.code == 'KeyF') beber();
  if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) G.P.spell = +e.code.slice(5) - 1;
  if (e.code.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup', e => {
  keys[e.code] = false;
});
addEventListener('blur', () => {
  keys = {};
  mouse.down = false;
});
const toC = e => {
  const r = cv.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * OW, ((e.clientY - r.top) / r.height) * OH];
};
cv.addEventListener('mousemove', e => {
  [mouse.x, mouse.y] = toC(e);
});
cv.addEventListener('mousedown', e => {
  [mouse.x, mouse.y] = toC(e);
  if (e.button == 2) {
    if (botonInvitado('ult')) return;
    if (running && G) ult();
  } else mouse.down = true;
});
addEventListener('mouseup', () => {
  mouse.down = false;
});
cv.addEventListener('contextmenu', e => e.preventDefault());
addEventListener(
  'wheel',
  e => {
    if (botonInvitado('sig')) return;
    if (running && G) G.P.spell = (G.P.spell + (e.deltaY > 0 ? 1 : 2)) % 3;
  },
  { passive: true },
);
function stick(s, x, y) {
  const dx = x - s.ox,
    dy = y - s.oy,
    m = Math.hypot(dx, dy),
    c = Math.min(1, m / 60);
  s.dx = m ? (dx / m) * c : 0;
  s.dy = m ? (dy / m) * c : 0;
}
cv.addEventListener(
  'touchstart',
  e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const [x, y] = toC(t);
      const s = { id: t.identifier, ox: x, oy: y, dx: 0, dy: 0 };
      if (x < OW / 2 && !touch.move) touch.move = s;
      else if (x >= OW / 2 && !touch.aim) touch.aim = s;
    }
  },
  { passive: false },
);
cv.addEventListener(
  'touchmove',
  e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const [x, y] = toC(t);
      if (touch.move?.id === t.identifier) stick(touch.move, x, y);
      if (touch.aim?.id === t.identifier) stick(touch.aim, x, y);
    }
  },
  { passive: false },
);
const tend = e => {
  for (const t of e.changedTouches) {
    if (touch.move?.id === t.identifier) touch.move = null;
    if (touch.aim?.id === t.identifier) touch.aim = null;
  }
};
cv.addEventListener('touchend', tend);
cv.addEventListener('touchcancel', tend);
// En línea, los botones del invitado se mandan al anfitrión.
const BOTON_RED = { tDash: 'dash', tUlt: 'ult', tTomar: 'tomar', tPocion: 'pocima', tSpell: 'sig' };
const tap = (id, fn) =>
  document.getElementById(id).addEventListener(
    'touchstart',
    e => {
      e.preventDefault();
      if (botonInvitado(BOTON_RED[id])) return;
      if (running && G) fn();
    },
    { passive: false },
  );
tap('tDash', dash);
tap('tUlt', ult);
tap('tTomar', () => interactuar());
tap('tPocion', beber);
tap('tSpell', () => {
  G.P.spell = (G.P.spell + 1) % 3;
});
atlas.onload = () => {
  white = tint('#ffffff');
  red = tint('#ff2a2a');
  cyan = tint('#5ee7ff');
  newRun();
  G.mundo = generarZona(0);
  resetSala();
  G.room = G.mundo.inicio;
  buildFloor(G.room);
  G.fade = 0;
  render();
  requestAnimationFrame(frame);
};
document.fonts?.load('700 16px "Pixelify Sans"');
document.fonts?.load('14px "Press Start 2P"');
