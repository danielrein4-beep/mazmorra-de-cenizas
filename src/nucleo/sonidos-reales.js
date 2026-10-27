// Sonidos grabados (paquetes CC0 de Kenney) que suenan encima del sintetizador: golpes, cortes, monedas,
// puertas, botones. Vienen incrustados en la página (construir.cjs, carpeta recursos/sonidos); se
// decodifican al primer sonido y, mientras tanto, suena solo el sintetizado.
const SONIDOS_DATOS = __SONIDOS__;
const MUESTRAS = {};
let muestrasListas = false;
function prepararMuestras() {
  if (muestrasListas || !AC) return;
  muestrasListas = true;
  for (const [k, lista] of Object.entries(SONIDOS_DATOS)) {
    MUESTRAS[k] = [];
    lista.forEach(b64 => {
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      AC.decodeAudioData(bytes.buffer)
        .then(buf => MUESTRAS[k].push(buf))
        .catch(() => {});
    });
  }
}
// Volumen de cada grabación (las demás van a 0,6).
const VOL_MUESTRA = {
  golpe: 0.75,
  golpeJefe: 1,
  daño: 0.9,
  pisoton: 0.8,
  boton: 0.35,
  logro: 0.6,
  nivel: 0.8,
};
// Suena una de las grabaciones de ese sonido, al azar, con el mismo tono variado que el sintetizado.
function muestra(k, v) {
  const l = MUESTRAS[k];
  if (!l || !l.length || !fxBus) return;
  const s = AC.createBufferSource(),
    g = AC.createGain();
  s.buffer = l[Math.floor(Math.random() * l.length)];
  s.playbackRate.value = v;
  g.gain.value = VOL_MUESTRA[k] || 0.6;
  s.connect(g);
  g.connect(fxBus);
  s.start();
}
// Clic suave en los botones de los menús (no en los botones táctiles de la partida).
document.addEventListener(
  'click',
  e => {
    const b = e.target.closest && e.target.closest('button');
    if (b && !b.classList.contains('tb')) sfx('boton');
  },
  true,
);
