// Pausa: Escape, el botón II de arriba o salir de la pestaña. En línea solo pausa el anfitrión.
let pausado = false;
function pausar() {
  if (!running || !G || pausado || G.over) return;
  if (enRed && enRed.rol == 'invitado') return;
  pausado = true;
  keys = {};
  mouse.down = false;
  touch.move = touch.aim = null;
  document.getElementById('pausaTexto').textContent = G.torre
    ? 'Piso ' + G.piso + ' · ' + tituloDe(G.piso).n
    : ZONAS[G.zona].n + (G.dif.id == 'pesadilla' ? ' · Pesadilla' : '');
  document.getElementById('pausa').hidden = false;
  document.getElementById('seguirBtn').focus();
  if (AC && !enRed) AC.suspend().catch(() => {});
}
function seguir() {
  if (!pausado) return;
  pausado = false;
  document.getElementById('pausa').hidden = true;
  document.getElementById('opciones').hidden = true;
  last = 0;
  if (AC) AC.resume().catch(() => {});
}
function salirAlMenu() {
  seguir();
  running = false;
  cv.style.filter = '';
  musica(null);
  document.getElementById('tbtns').hidden = true;
  document.getElementById('botonPausa').hidden = true;
  document.getElementById('menu').hidden = false;
}
document.getElementById('seguirBtn').onclick = seguir;
document.getElementById('salirBtn').onclick = salirAlMenu;
document.getElementById('botonPausa').onclick = () => (pausado ? seguir() : pausar());
addEventListener('keydown', e => {
  if (e.code != 'Escape' || !running) return;
  if (!document.getElementById('opciones').hidden) return document.getElementById('opListo').click();
  pausado ? seguir() : pausar();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pausar();
});
