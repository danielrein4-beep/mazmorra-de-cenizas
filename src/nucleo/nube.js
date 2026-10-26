// Récords entre amigos y guardado en la nube, contra el servidor de servidor/servidor.mjs.
// Para probar con un servidor local: ?api=http://localhost:8590 en la dirección del juego.
const API_NUBE = new URLSearchParams(location.search).get('api') || 'https://mazmorra.auroracontigo.com';

// Cada aparato tiene un id al azar para su fila en la tabla (no dice nada de la persona).
function idAparato() {
  if (!LOGROS.idAparato) {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    guardarLogro('idAparato', [...b].map(x => x.toString(16).padStart(2, '0')).join(''));
  }
  return LOGROS.idAparato;
}
async function pedir(ruta, cuerpo) {
  const r = await fetch(API_NUBE + ruta, {
    method: cuerpo ? 'POST' : 'GET',
    headers: cuerpo ? { 'Content-Type': 'application/json' } : {},
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'red');
  return d;
}
const SIN_SERVIDOR = 'No se pudo hablar con el servidor de récords. Revisa tu internet o prueba más tarde.';

// Al terminar una partida: sube tu récord de la Torre (si pusiste apodo) y respalda tu progreso.
function subirALaNube() {
  if (LOGROS.apodo && LOGROS.torre)
    pedir('/api/records', {
      id: idAparato(),
      apodo: LOGROS.apodo,
      piso: Math.min(100, LOGROS.torre),
      heroe: PERSONAJES[ELEGIDO.p][ELEGIDO.sexo].n,
      nivel: estado().nivel,
    }).catch(() => {});
  if (LOGROS.codigoNube) respaldar().catch(() => {});
}

// Récords: la Torre de siempre o el reto de hoy (todos juegan el mismo reto ese día).
let tablaRecords = 'torre';
async function mostrarRecords() {
  const L = document.getElementById('recordsLista'),
    nota = document.getElementById('recordsNota'),
    reto = tablaRecords == 'reto';
  document.getElementById('apodo').value = LOGROS.apodo || '';
  document.getElementById('tabTorre').setAttribute('aria-pressed', !reto);
  document.getElementById('tabReto').setAttribute('aria-pressed', reto);
  irAPanelSiHace('records');
  L.innerHTML = '';
  nota.textContent = 'Cargando…';
  try {
    const { lista } = await pedir(reto ? '/api/reto?fecha=' + fechaHoy() : '/api/records'),
      R = retoDeHoy();
    nota.textContent = reto
      ? 'Reto de hoy: pisos ' +
        R.desde +
        ' a ' +
        R.hasta +
        ' con ' +
        R.reglas.map(r => r.n).join(' y ') +
        '.' +
        (lista.length ? '' : ' Nadie lo jugó todavía.')
      : lista.length
        ? 'Los mejores de la Torre. Tu récord sube solo al terminar cada partida.'
        : 'Todavía nadie subió su récord. ¡Sé el primero!';
    lista.forEach((r, i) => {
      const f = document.createElement('div');
      f.className = 'fila-record' + (r.apodo == LOGROS.apodo ? ' mia' : '');
      f.innerHTML = '<b></b><span class="apodo"></span><span class="piso"></span><small></small>';
      f.querySelector('b').textContent = i + 1;
      f.querySelector('.apodo').textContent = r.apodo;
      f.querySelector('.piso').textContent = reto ? (r.ok ? 'Superado' : 'Piso ' + r.piso) : 'Piso ' + r.piso;
      f.querySelector('small').textContent = reto
        ? Math.floor(r.seg / 60) + ' min ' + (r.seg % 60) + ' s'
        : tituloDe(r.piso).n + (r.heroe ? ' · ' + r.heroe : '');
      L.appendChild(f);
    });
  } catch (e) {
    nota.textContent = SIN_SERVIDOR;
  }
}
document.getElementById('tabTorre').onclick = () => {
  tablaRecords = 'torre';
  mostrarRecords();
};
document.getElementById('tabReto').onclick = () => {
  tablaRecords = 'reto';
  mostrarRecords();
};
// Al terminar un reto, tu intento entra al ranking del día (si pusiste apodo).
function subirReto(ok) {
  if (!LOGROS.apodo || !G.reto) return false;
  pedir('/api/reto', {
    id: idAparato(),
    apodo: LOGROS.apodo,
    fecha: fechaHoy(),
    piso: Math.min(100, G.piso),
    ok: ok ? 1 : 0,
    seg: Math.min(36000, Math.round((performance.now() - G.start) / 1000)),
  }).catch(() => {});
  return true;
}
document.getElementById('recordsBtn').onclick = mostrarRecords;
document.getElementById('recordsVolver').onclick = () => {
  volverDePanel('records');
};
document.getElementById('apodoGuardar').onclick = () => {
  const v = document.getElementById('apodo').value.trim();
  if (!/^[\p{L}\p{N} _.-]{2,18}$/u.test(v)) {
    document.getElementById('recordsNota').textContent = 'El apodo lleva de 2 a 18 letras o números.';
    return;
  }
  guardarLogro('apodo', v);
  subirALaNube();
  setTimeout(mostrarRecords, 600);
};

// Respaldo: tu progreso (cenizas, grimorios, forja, estado, logros…) queda guardado con un código secreto.
async function respaldar() {
  if (!LOGROS.codigoNube) guardarLogro('codigoNube', (await pedir('/api/guardado/nuevo', {})).codigo);
  await pedir('/api/guardado', { codigo: LOGROS.codigoNube, datos: { logros: LOGROS, heroe: ELEGIDO } });
}
document.getElementById('nubeGuardar').onclick = async () => {
  const t = document.getElementById('nubeTexto');
  t.textContent = 'Guardando…';
  try {
    await respaldar();
    t.textContent =
      'Listo. Tu código es ' +
      LOGROS.codigoNube +
      '. Anótalo: con él recuperas tu progreso en otro aparato. Desde ahora se respalda solo al terminar cada partida.';
  } catch (e) {
    t.textContent = SIN_SERVIDOR;
  }
};
document.getElementById('nubeRecuperar').onclick = async () => {
  const t = document.getElementById('nubeTexto'),
    codigo = document.getElementById('nubeCodigo').value.trim().toUpperCase();
  if (!/^[A-F0-9]{10}$/.test(codigo)) {
    t.textContent = 'El código tiene 10 letras y números (del 0 al 9 y de la A a la F).';
    return;
  }
  if (document.getElementById('nubeRecuperar').dataset.seguro != codigo) {
    document.getElementById('nubeRecuperar').dataset.seguro = codigo;
    t.textContent =
      'Esto reemplaza el progreso de este aparato por el del código. Toca «Recuperar» otra vez para seguir.';
    return;
  }
  try {
    const { datos } = await pedir('/api/guardado/leer', { codigo });
    localStorage.setItem(
      'mazmorra-logros',
      JSON.stringify(Object.assign(datos.logros || {}, { codigoNube: codigo })),
    );
    if (datos.heroe) localStorage.setItem('mazmorra-heroe', JSON.stringify(datos.heroe));
    t.textContent = '¡Progreso recuperado! Recargando…';
    setTimeout(() => location.reload(), 800);
  } catch (e) {
    t.textContent = e.message == 'codigo' ? 'No hay ningún progreso guardado con ese código.' : SIN_SERVIDOR;
  }
};
if (LOGROS.codigoNube)
  document.getElementById('nubeTexto').textContent = 'Tu código de respaldo es ' + LOGROS.codigoNube + '.';
