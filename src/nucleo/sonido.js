// Efectos de sonido épicos hechos con el sintetizador del navegador: capas de golpe grave,
// ruido filtrado, distorsión y eco de sala, con un compresor al final para que suenen grandes sin saturar.
let fxBus = null,
  fxSalida = null,
  revIn = null,
  curvaDist = null;
const ultimoSfx = {};
function prepararSonido() {
  if (fxBus || !AC) return;
  const comp = AC.createDynamicsCompressor();
  fxSalida = comp;
  comp.threshold.value = -16;
  comp.ratio.value = 5;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;
  comp.connect(AC.destination);
  fxBus = AC.createGain();
  fxBus.gain.value = 0.85 * (OPC ? OPC.efectos / 100 : 1);
  fxBus.connect(comp);
  const conv = AC.createConvolver(),
    n = Math.floor(AC.sampleRate * 2.4),
    b = AC.createBuffer(2, n, AC.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.8);
  }
  conv.buffer = b;
  revIn = AC.createGain();
  revIn.gain.value = 0.5;
  revIn.connect(conv);
  conv.connect(comp);
  curvaDist = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) {
    const x = i / 512 - 1;
    curvaDist[i] = (31 * x) / (1 + 30 * Math.abs(x));
  }
}
function envol(t0, dur, vol, rev) {
  const e = AC.createGain();
  e.gain.setValueAtTime(0.0001, t0);
  e.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  e.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  e.connect(fxBus);
  if (rev) {
    const s = AC.createGain();
    s.gain.value = rev;
    e.connect(s);
    s.connect(revIn);
  }
  return e;
}
// tono(tipo, frecuencia inicial, final, retraso, duración, volumen, eco, distorsión)
function tono(tipo, f1, f2, dt, dur, vol, rev, dis) {
  const t0 = AC.currentTime + dt,
    o = AC.createOscillator(),
    e = envol(t0, dur, vol, rev);
  o.type = tipo;
  o.frequency.setValueAtTime(f1, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
  if (dis) {
    const ws = AC.createWaveShaper();
    ws.curve = curvaDist;
    o.connect(ws);
    ws.connect(e);
  } else o.connect(e);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}
// ruido(filtro, frecuencia inicial, final, resonancia, retraso, duración, volumen, eco)
function ruido(tipo, f1, f2, q, dt, dur, vol, rev) {
  const t0 = AC.currentTime + dt,
    s = AC.createBufferSource(),
    f = AC.createBiquadFilter(),
    e = envol(t0, dur, vol, rev);
  s.buffer = noise;
  s.loop = true;
  f.type = tipo;
  f.Q.value = q;
  f.frequency.setValueAtTime(f1, t0);
  f.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0 + dur);
  s.connect(f);
  f.connect(e);
  s.start(t0, Math.random() * 0.5);
  s.stop(t0 + dur + 0.05);
}
const chispas = (n, dt, vol) => {
  for (let i = 0; i < n; i++)
    ruido(
      'highpass',
      4000 + Math.random() * 3000,
      2500,
      1,
      dt + i * 0.025 + Math.random() * 0.01,
      0.03,
      vol,
      0.2,
    );
};
const SND = {
  hielo: v => {
    tono('triangle', 2400 * v, 1700 * v, 0, 0.12, 0.05, 0.3);
    tono('sine', 3300 * v, 2600 * v, 0, 0.1, 0.03, 0.3);
    ruido('highpass', 6000, 9000, 1, 0, 0.08, 0.05);
  },
  hieloRompe: v => {
    ruido('highpass', 5000, 3000, 1, 0, 0.16, 0.07, 0.3);
    tono('triangle', 1900 * v, 1500 * v, 0, 0.2, 0.035, 0.4);
  },
  fuego: v => {
    ruido('bandpass', 380, 1900, 0.8, 0, 0.35, 0.2, 0.25);
    tono('sawtooth', 130 * v, 55, 0, 0.3, 0.07, 0.2, 1);
  },
  explosion: v => {
    tono('sine', 95 * v, 28, 0, 0.7, 0.55);
    ruido('lowpass', 2600, 180, 0.6, 0, 0.8, 0.38, 0.55);
    tono('square', 65 * v, 32, 0, 0.25, 0.12, 0, 1);
    chispas(3, 0.05, 0.04);
  },
  rayo: v => {
    ruido('highpass', 3200, 1400, 1, 0, 0.16, 0.24, 0.25);
    tono('sawtooth', 1700 * v, 90, 0, 0.18, 0.09, 0.2, 1);
    chispas(4, 0, 0.07);
  },
  trueno: v => {
    ruido('lowpass', 5000, 110, 0.5, 0, 1.1, 0.55, 0.8);
    tono('sine', 72 * v, 28, 0, 0.9, 0.5);
    tono('sawtooth', 1900, 70, 0, 0.25, 0.1, 0.3, 1);
    chispas(8, 0, 0.09);
  },
  tajo: v => {
    ruido('bandpass', 700, 4200, 2.2, 0, 0.15, 0.22, 0.2);
    tono('triangle', 1500 * v, 1420 * v, 0.02, 0.3, 0.035, 0.45);
    tono('square', 3100 * v, 2900, 0, 0.05, 0.02);
  },
  estocada: v => {
    ruido('bandpass', 280, 3200, 1.5, 0, 0.26, 0.22, 0.2);
    tono('triangle', 2050 * v, 2150 * v, 0.08, 0.45, 0.045, 0.5);
  },
  escudo: v => {
    [523, 659, 784, 1046].forEach((f, i) => tono('sine', f * v, f * v * 1.01, i * 0.03, 0.7, 0.04, 0.7));
    ruido('highpass', 7000, 9000, 1, 0, 0.4, 0.03, 0.5);
  },
  reflejo: v => tono('triangle', 1200 * v, 2600 * v, 0, 0.09, 0.04, 0.3),
  flecha: v => {
    tono('triangle', 760 * v, 330 * v, 0, 0.13, 0.08);
    ruido('highpass', 4200, 6000, 1, 0, 0.07, 0.05);
  },
  abanico: v => {
    for (let i = 0; i < 3; i++) {
      tono('triangle', (760 + i * 60) * v, 330 * v, i * 0.035, 0.13, 0.06);
      ruido('highpass', 4200, 6000, 1, i * 0.035, 0.06, 0.04);
    }
  },
  martillazo: v => {
    tono('sine', 115 * v, 34, 0, 0.5, 0.6);
    ruido('lowpass', 1900, 150, 0.7, 0, 0.38, 0.42, 0.45);
    tono('square', 85 * v, 40, 0, 0.2, 0.2, 0, 1);
    ruido('bandpass', 300, 120, 1, 0.03, 0.3, 0.15, 0.3);
  },
  hacha: v => {
    ruido('bandpass', 500, 1100, 3, 0, 0.4, 0.1, 0.2);
    tono('triangle', 300 * v, 500 * v, 0, 0.35, 0.03);
  },
  pisoton: v => {
    tono('sine', 62 * v, 24, 0, 1.1, 0.65);
    ruido('lowpass', 900, 70, 0.6, 0, 1.1, 0.45, 0.65);
    tono('square', 48 * v, 26, 0, 0.4, 0.18, 0, 1);
  },
  dagas: v => {
    ruido('bandpass', 2100, 5200, 2, 0, 0.07, 0.1);
    tono('triangle', 2700 * v, 2500 * v, 0, 0.05, 0.02);
  },
  lanzar: v => ruido('bandpass', 400, 1400, 2, 0, 0.22, 0.1, 0.1),
  veneno: v => {
    tono('triangle', 3100 * v, 2800 * v, 0, 0.16, 0.045, 0.3);
    ruido('highpass', 5200, 3000, 1, 0, 0.13, 0.07, 0.2);
    [0, 0.08, 0.15].forEach(d => tono('sine', 420 * v, 950 * v, 0.12 + d, 0.07, 0.05));
  },
  sombra: v => {
    ruido('bandpass', 3200, 260, 1, 0, 0.32, 0.22, 0.3);
    tono('sawtooth', 210 * v, 55, 0.05, 0.32, 0.12, 0.5, 1);
  },
  ultCarga: v => {
    tono('sawtooth', 110, 440, 0, 1.1, 0.07, 0.5, 1);
    tono('sawtooth', 165, 660, 0, 1.1, 0.05, 0.5);
    ruido('bandpass', 200, 3200, 1, 0, 1.1, 0.12, 0.4);
    tono('sine', 55, 58, 0, 1.3, 0.22);
  },
  ultFinal: v => {
    tono('sine', 82, 24, 0, 1.5, 0.7);
    ruido('lowpass', 6500, 100, 0.5, 0, 1.7, 0.6, 0.95);
    tono('square', 56, 28, 0, 0.6, 0.25, 0, 1);
    tono('sawtooth', 220, 110, 0, 1.1, 0.07, 0.8);
    tono('sawtooth', 330, 165, 0, 1.1, 0.05, 0.8);
    chispas(10, 0, 0.08);
  },
  golpe: v => {
    ruido('bandpass', 1300 * v, 300, 1, 0, 0.07, 0.18);
    tono('square', 230 * v, 90, 0, 0.06, 0.07);
  },
  golpeJefe: v => {
    ruido('bandpass', 1100 * v, 250, 1, 0, 0.1, 0.22, 0.15);
    tono('square', 200 * v, 80, 0, 0.08, 0.08);
    tono('sine', 105 * v, 48, 0, 0.14, 0.32);
  },
  daño: v => {
    tono('square', 320 * v, 85, 0, 0.26, 0.08, 0.2, 1);
    ruido('lowpass', 1300, 300, 1, 0, 0.22, 0.18);
  },
  rugido: v => {
    tono('sawtooth', 92 * v, 40, 0, 1, 0.17, 0.6, 1);
    tono('sawtooth', 95 * v, 41, 0, 1, 0.12, 0.6, 1);
    ruido('bandpass', 320, 110, 0.6, 0, 1, 0.3, 0.5);
  },
  caida: v => {
    tono('sine', 75 * v, 26, 0, 0.7, 0.55);
    ruido('lowpass', 1200, 90, 0.6, 0, 0.7, 0.42, 0.5);
  },
  puerta: v => {
    ruido('lowpass', 400, 120, 1, 0, 0.6, 0.15, 0.4);
    [392, 523, 659].forEach((f, i) => tono('triangle', f, f, 0.15 + i * 0.09, 0.5, 0.04, 0.6));
  },
  cofre: v => {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tono('square', f, f, i * 0.07, 0.2, 0.03, 0.5));
    ruido('highpass', 7000, 9000, 1, 0.3, 0.4, 0.03, 0.6);
  },
  arma: v => {
    ruido('highpass', 6200, 8000, 1, 0, 0.25, 0.09, 0.5);
    tono('triangle', 1800, 2300, 0, 0.35, 0.05, 0.6);
    tono('triangle', 2700, 3000, 0.04, 0.3, 0.03, 0.6);
  },
  recoger: v => {
    tono('square', 650 * v, 1400 * v, 0, 0.13, 0.035, 0.3);
  },
  moneda: v => {
    tono('square', 1320, 1320, 0, 0.05, 0.025);
    tono('square', 1980, 1980, 0.05, 0.08, 0.025, 0.2);
  },
  aparece: v => {
    ruido('bandpass', 200, 2400, 2, 0, 0.35, 0.08, 0.4);
    tono('sine', 300 * v, 900 * v, 0, 0.35, 0.04, 0.4);
  },
  dash: v => ruido('bandpass', 1400, 400, 1.2, 0, 0.16, 0.12),
};
const ALIAS = {
  ice: 'hielo',
  fire: 'fuego',
  bolt: 'rayo',
  hit: 'golpe',
  boom: 'explosion',
  hurt: 'daño',
  ult: 'ultCarga',
  roar: 'rugido',
  door: 'puerta',
  pick: 'recoger',
  spawn: 'aparece',
  land: 'caida',
  throw: 'lanzar',
  coin: 'moneda',
};
function sfx(k) {
  if (!AC) return;
  prepararSonido();
  k = ALIAS[k] || k;
  const f = SND[k];
  if (!f) return;
  const ahora = AC.currentTime;
  if (ultimoSfx[k] && ahora - ultimoSfx[k] < 0.035) return;
  ultimoSfx[k] = ahora;
  try {
    f(1 + (Math.random() - 0.5) * 0.08);
  } catch (e) {}
}

// iPhone: el sonido de las páginas va por el canal de "ambiente", que se apaga con el interruptor de silencio
// y se pausa al salir de la app. Se pide el canal de reproducción (como una app de música), se mantiene
// sonando un audio en silencio para conservarlo y, en cada toque, se reanuda el sonido si estaba pausado.
let audioDesbloqueado = false;
function silencioURL() {
  const n = 4000,
    b = new DataView(new ArrayBuffer(44 + n * 2)),
    s = (o, t) => [...t].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
  s(0, 'RIFF');
  b.setUint32(4, 36 + n * 2, true);
  s(8, 'WAVEfmt ');
  b.setUint32(16, 16, true);
  b.setUint16(20, 1, true);
  b.setUint16(22, 1, true);
  b.setUint32(24, 8000, true);
  b.setUint32(28, 16000, true);
  b.setUint16(32, 2, true);
  b.setUint16(34, 16, true);
  s(36, 'data');
  b.setUint32(40, n * 2, true);
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
}
function desbloquearAudio() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
  } catch (e) {}
  if (!AC) return;
  if (AC.state != 'running') AC.resume().catch(() => {});
  if (!audioDesbloqueado) {
    audioDesbloqueado = true;
    const a = new Audio(silencioURL());
    a.loop = true;
    a.setAttribute('playsinline', '');
    a.play().catch(() => (audioDesbloqueado = false));
  }
}
['touchend', 'pointerdown', 'click', 'keydown'].forEach(ev =>
  addEventListener(ev, desbloquearAudio, { capture: true, passive: true }),
);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && AC && AC.state != 'running') AC.resume().catch(() => {});
});
