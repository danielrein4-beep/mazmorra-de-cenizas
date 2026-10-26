// La pantalla de elegir va en cuatro pasos (juego, héroe, grimorio y vestuario) para que cada uno quepa sin bajar.
let pasoElegir = 1;
function irPaso(n) {
  pasoElegir = n;
  if (n == 3) {
    grimVisto = null;
    pintarBiblioteca();
  }
  document.querySelectorAll('#elegir .paso').forEach(s => (s.hidden = s.dataset.paso != n));
  document
    .querySelectorAll('.paso-tab')
    .forEach(b =>
      b.dataset.ir == n ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'),
    );
  document.getElementById('elegir').scrollTop = 0;
  document
    .querySelector(n == 2 ? '#heroes .heroe[aria-pressed="true"]' : '#elegir .paso:not([hidden]) .play')
    ?.focus();
}
document.querySelectorAll('#elegir [data-ir]').forEach(b => (b.onclick = () => irPaso(+b.dataset.ir)));
// Escape vuelve al paso anterior.
addEventListener('keydown', e => {
  if (e.code == 'Escape' && !document.getElementById('elegir').hidden && pasoElegir > 1)
    irPaso(pasoElegir - 1);
});
