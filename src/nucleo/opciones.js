// Opciones que se guardan en este aparato: volumen de música y de efectos, vibración y tamaño de los botones.
// Con var para que la música y el sonido puedan consultarla aunque carguen antes.
var OPC = { musica: 100, efectos: 100, vibrar: 1, botones: 'normal' };
try {
  Object.assign(OPC, JSON.parse(localStorage.getItem('mazmorra-opciones') || '{}'));
} catch (e) {}
let volverDeOpciones = null;

function aplicarOpciones() {
  if (musBus) musBus.gain.value = musicaOn ? 0.55 * (OPC.musica / 100) : 0;
  if (fxBus) fxBus.gain.value = 0.85 * (OPC.efectos / 100);
  document.body.classList.toggle('botonesGrandes', OPC.botones == 'grande');
  document.getElementById('opMusica').value = OPC.musica;
  document.getElementById('opEfectos').value = OPC.efectos;
  document.getElementById('opMusicaV').textContent = OPC.musica + ' %';
  document.getElementById('opEfectosV').textContent = OPC.efectos + ' %';
  document
    .querySelectorAll('.opVibrar')
    .forEach(b => b.setAttribute('aria-pressed', +b.dataset.v == OPC.vibrar));
  document
    .querySelectorAll('.opBotones')
    .forEach(b => b.setAttribute('aria-pressed', b.dataset.b == OPC.botones));
}
function guardarOpciones() {
  try {
    localStorage.setItem('mazmorra-opciones', JSON.stringify(OPC));
  } catch (e) {}
  aplicarOpciones();
}
// Vibra el teléfono si el jugador lo dejó encendido.
function vibrar(ms) {
  if (OPC.vibrar && coarse && navigator.vibrate) navigator.vibrate(ms);
}

function abrirOpciones(desde) {
  volverDeOpciones = desde;
  if (desde) document.getElementById(desde).hidden = true;
  document.getElementById('opciones').hidden = false;
  aplicarOpciones();
  document.getElementById('opListo').focus();
}
document
  .querySelectorAll('.abrirOpciones')
  .forEach(b => (b.onclick = () => abrirOpciones(b.closest('.overlay').id)));
document.getElementById('opListo').onclick = () => {
  document.getElementById('opciones').hidden = true;
  if (volverDeOpciones) document.getElementById(volverDeOpciones).hidden = false;
};
document.getElementById('opMusica').oninput = e => {
  OPC.musica = +e.target.value;
  guardarOpciones();
};
document.getElementById('opEfectos').oninput = e => {
  OPC.efectos = +e.target.value;
  guardarOpciones();
  sfx('moneda');
};
document.querySelectorAll('.opVibrar').forEach(
  b =>
    (b.onclick = () => {
      OPC.vibrar = +b.dataset.v;
      guardarOpciones();
      vibrar(80);
    }),
);
document.querySelectorAll('.opBotones').forEach(
  b =>
    (b.onclick = () => {
      OPC.botones = b.dataset.b;
      guardarOpciones();
    }),
);
document.getElementById('opGuia').onclick = () => {
  guardarLogro('guiaVista', 0);
  document.getElementById('opGuia').textContent = 'Saldrá en tu próxima partida';
};
aplicarOpciones();
