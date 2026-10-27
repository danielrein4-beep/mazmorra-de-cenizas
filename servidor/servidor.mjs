// Servidor de Mazmorra de Cenizas: tabla de récords de la Torre y guardado en la nube.
// Sin dependencias: Node 20+ y un archivo JSON en /datos (montar un volumen ahí para no perderlo).
// No guarda datos personales: solo un apodo, el récord y un bloque de progreso del juego por código secreto.
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';

const PUERTO = +process.env.PORT || 8080;
const CARPETA = process.env.DATOS || '/datos';
const ARCHIVO = CARPETA + '/mazmorra.json';
// Páginas que pueden usar el servidor (el juego publicado y las pruebas locales).
const ORIGENES = (
  process.env.ORIGENES || 'https://danielrein4-beep.github.io,http://localhost:8505,http://127.0.0.1:8505'
).split(',');
const TOPE_GUARDADO = 64 * 1024;

let db = { records: {}, guardados: {}, retos: {} };
try {
  db = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
} catch (e) {}
db.retos = db.retos || {};
db.periodos = db.periodos || {};
db.porHeroe = db.porHeroe || {};
db.ligas = db.ligas || {};
// La clave del servidor de enlace se genera en el VPS y se deja en el volumen de datos (nunca en el repo).
let claveTurnCache = null;
function claveTurn() {
  if (claveTurnCache === null)
    try {
      claveTurnCache = fs.readFileSync(CARPETA + '/turn.secreto', 'utf8').trim();
    } catch (e) {
      claveTurnCache = '';
    }
  return claveTurnCache;
}
let pendiente = null;
// Escribe a disco como mucho una vez por segundo, en un archivo aparte que luego reemplaza al bueno.
function guardarDisco() {
  if (pendiente) return;
  pendiente = setTimeout(() => {
    pendiente = null;
    fs.mkdirSync(CARPETA, { recursive: true });
    fs.writeFileSync(ARCHIVO + '.tmp', JSON.stringify(db));
    fs.renameSync(ARCHIVO + '.tmp', ARCHIVO);
  }, 1000);
}

// Límite por dirección: 60 pedidos por minuto.
const visitas = new Map();
function demasiados(ip) {
  const ahora = Date.now(),
    v = visitas.get(ip) || { n: 0, desde: ahora };
  if (ahora - v.desde > 60000) Object.assign(v, { n: 0, desde: ahora });
  v.n++;
  visitas.set(ip, v);
  return v.n > 60;
}
setInterval(() => visitas.clear(), 10 * 60000).unref();
// Para subir récords el tope es más bajo: 8 por minuto por dirección.
const subidas = new Map();
function muchasSubidas(ip) {
  const ahora = Date.now(),
    v = subidas.get(ip) || { n: 0, desde: ahora };
  if (ahora - v.desde > 60000) Object.assign(v, { n: 0, desde: ahora });
  v.n++;
  subidas.set(ip, v);
  return v.n > 8;
}
setInterval(() => subidas.clear(), 10 * 60000).unref();

// Claves de la temporada (el mes) y de la semana (que empieza el lunes), en hora UTC.
const claveMes = () => 'mes:' + new Date().toISOString().slice(0, 7);
function claveSemana() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return 'semana:' + d.toISOString().slice(0, 10);
}
// Guarda el récord en una tabla si lo mejora; las tablas viejas de mes y semana se borran solas.
function mejorar(tabla, clave, r) {
  const viejo = tabla[clave];
  if (!viejo || r.piso > viejo.piso || (r.piso == viejo.piso && r.seg < viejo.seg)) tabla[clave] = r;
  else if (viejo.apodo != r.apodo) viejo.apodo = r.apodo;
}
function podarPeriodos() {
  ['mes:', 'semana:'].forEach(p =>
    Object.keys(db.periodos)
      .filter(k => k.startsWith(p))
      .sort()
      .slice(0, -3)
      .forEach(k => delete db.periodos[k]),
  );
}
const tablaPublica = filas =>
  Object.values(filas)
    .sort((a, b) => b.piso - a.piso || (a.seg || 0) - (b.seg || 0) || a.fecha - b.fecha)
    .slice(0, 50)
    .map(({ apodo, piso, heroe, nivel, fecha }) => ({ apodo, piso, heroe, nivel, fecha }));

const apodoValido = s => typeof s == 'string' && /^[\p{L}\p{N} _.-]{2,18}$/u.test(s.trim());
const idValido = s => typeof s == 'string' && /^[a-f0-9]{32}$/.test(s);
const entero = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;

function responder(res, codigo, cuerpo, origen) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (origen) Object.assign(h, { 'Access-Control-Allow-Origin': origen, Vary: 'Origin' });
  res.writeHead(codigo, h);
  res.end(JSON.stringify(cuerpo));
}
function leerCuerpo(req) {
  return new Promise((ok, mal) => {
    let t = '';
    req.on('data', c => {
      t += c;
      if (t.length > TOPE_GUARDADO * 1.5) {
        mal(new Error('grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        ok(JSON.parse(t || '{}'));
      } catch (e) {
        mal(e);
      }
    });
  });
}

const RUTAS = {
  // Los 50 mejores de la Torre.
  'GET /api/records': (b, q) => {
    const periodo = q.get('periodo'),
      heroe = (q.get('heroe') || '').slice(0, 20);
    if (heroe)
      return [200, { lista: tablaPublica(Object.values(db.porHeroe).filter(r => r.heroe == heroe)) }];
    if (periodo == 'mes' || periodo == 'semana')
      return [200, { lista: tablaPublica(db.periodos[periodo == 'mes' ? claveMes() : claveSemana()] || {}) }];
    return [200, { lista: tablaPublica(db.records) }];
  },
  // Sube una partida de la Torre: desde qué piso salió, hasta cuál llegó y cuánto tardó. Cada aparato tiene
  // un id al azar. Contra trampas: solo se puede salir de un piso ya alcanzado antes y cada piso subido
  // pide al menos 8 segundos de juego; si no cuadra, no entra a ninguna tabla.
  'POST /api/records': (b, q, ip) => {
    if (muchasSubidas(ip)) return [429, { error: 'espera' }];
    if (
      !idValido(b.id) ||
      !apodoValido(b.apodo) ||
      !entero(b.piso, 100) ||
      !entero(b.desde, 100) ||
      !entero(b.seg, 36000) ||
      !entero(b.nivel || 1, 99)
    )
      return [400, { error: 'datos' }];
    const r = db.records[b.id],
      techo = r ? r.piso : 1;
    if (b.desde < 1 || b.desde > Math.max(techo, 1) || b.piso <= b.desde || b.seg < (b.piso - b.desde) * 8)
      return [400, { error: 'partida' }];
    const fila = {
      apodo: b.apodo.trim(),
      piso: b.piso,
      seg: b.seg,
      heroe: String(b.heroe || '').slice(0, 20),
      nivel: b.nivel || 1,
      fecha: Date.now(),
    };
    mejorar(db.records, b.id, fila);
    mejorar(db.porHeroe, b.id + '|' + fila.heroe, fila);
    [claveMes(), claveSemana()].forEach(k => mejorar((db.periodos[k] = db.periodos[k] || {}), b.id, fila));
    podarPeriodos();
    guardarDisco();
    return [200, { ok: 1 }];
  },
  // Guardado en la nube: el aparato pide un código secreto nuevo.
  'POST /api/guardado/nuevo': () => {
    const codigo = crypto.randomBytes(5).toString('hex').toUpperCase();
    db.guardados[codigo] = { datos: null, fecha: Date.now() };
    guardarDisco();
    return [200, { codigo }];
  },
  'POST /api/guardado': b => {
    const g = typeof b.codigo == 'string' && db.guardados[b.codigo];
    if (!g) return [404, { error: 'codigo' }];
    if (typeof b.datos != 'object' || JSON.stringify(b.datos).length > TOPE_GUARDADO)
      return [400, { error: 'datos' }];
    Object.assign(g, { datos: b.datos, fecha: Date.now() });
    guardarDisco();
    return [200, { ok: 1 }];
  },
  'POST /api/guardado/leer': b => {
    const g = typeof b.codigo == 'string' && db.guardados[b.codigo];
    return g && g.datos ? [200, { datos: g.datos }] : [404, { error: 'codigo' }];
  },
  // Reto del día: cada aparato guarda su mejor intento de la fecha (UTC). Gana quien lo supera, luego el piso
  // más alto y luego el menor tiempo. Solo se guardan los últimos siete días.
  'POST /api/reto': b => {
    const hoy = new Date().toISOString().slice(0, 10),
      ayer = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    if (!idValido(b.id) || !apodoValido(b.apodo) || ![hoy, ayer].includes(b.fecha) || !entero(b.piso, 100) || !entero(b.seg, 36000))
      return [400, { error: 'datos' }];
    const dia = (db.retos[b.fecha] = db.retos[b.fecha] || {}),
      nuevo = { apodo: b.apodo.trim(), piso: b.piso, ok: b.ok ? 1 : 0, seg: b.seg, fecha: Date.now() },
      viejo = dia[b.id],
      mejor = !viejo || nuevo.ok > viejo.ok || (nuevo.ok == viejo.ok && (nuevo.piso > viejo.piso || (nuevo.piso == viejo.piso && nuevo.seg < viejo.seg)));
    if (mejor || viejo.apodo != nuevo.apodo) dia[b.id] = mejor ? nuevo : Object.assign(viejo, { apodo: nuevo.apodo });
    Object.keys(db.retos).sort().slice(0, -7).forEach(k => delete db.retos[k]);
    guardarDisco();
    return [200, { ok: 1 }];
  },
  'GET /api/reto': (b, q) => {
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(q.get('fecha') || '') ? q.get('fecha') : new Date().toISOString().slice(0, 10),
      lista = Object.values(db.retos[fecha] || {})
        .sort((a, c) => c.ok - a.ok || c.piso - a.piso || a.seg - c.seg)
        .slice(0, 30)
        .map(({ apodo, piso, ok, seg }) => ({ apodo, piso, ok, seg }));
    return [200, { fecha, lista }];
  },
  // Claves temporales (6 horas) para el servidor de enlace TURN, firmadas con la clave que vive solo en el VPS.
  // Sin ellas, dos aparatos en redes distintas (datos móviles, routers estrictos) no logran conectarse.
  'GET /api/turn': () => {
    const secreto = claveTurn();
    const stun = { urls: 'stun:stun.l.google.com:19302' };
    if (!secreto) return [200, { iceServers: [stun] }];
    const username = Math.floor(Date.now() / 1000) + 6 * 3600 + ':mazmorra',
      credential = crypto.createHmac('sha1', secreto).update(username).digest('base64'),
      host = process.env.TURN_HOST || 'mazmorra.auroracontigo.com';
    return [
      200,
      { iceServers: [stun, { urls: ['turn:' + host + ':3478?transport=udp', 'turn:' + host + ':3478?transport=tcp'], username, credential }] },
    ];
  },
  // Ligas: copas de la temporada (el mes). Contra trampas: entre una subida y otra las copas no pueden
  // cambiar más de 120 (una partida da como mucho unas 120), y cada aparato empieza el mes con hasta 1.500.
  'POST /api/liga': (b, q, ip) => {
    if (muchasSubidas(ip)) return [429, { error: 'espera' }];
    if (!idValido(b.id) || !apodoValido(b.apodo) || !entero(b.copas, 20000)) return [400, { error: 'datos' }];
    const mes = new Date().toISOString().slice(0, 7),
      tabla = (db.ligas[mes] = db.ligas[mes] || {}),
      viejo = tabla[b.id];
    if (viejo ? Math.abs(b.copas - viejo.copas) > 120 : b.copas > 1500) return [400, { error: 'copas' }];
    tabla[b.id] = { apodo: b.apodo.trim(), copas: b.copas, heroe: String(b.heroe || '').slice(0, 20), fecha: Date.now() };
    Object.keys(db.ligas)
      .sort()
      .slice(0, -3)
      .forEach(k => delete db.ligas[k]);
    guardarDisco();
    return [200, { ok: 1 }];
  },
  'GET /api/liga': () => {
    const tabla = db.ligas[new Date().toISOString().slice(0, 7)] || {},
      lista = Object.values(tabla)
        .sort((a, c) => c.copas - a.copas || a.fecha - c.fecha)
        .slice(0, 50)
        .map(({ apodo, copas, heroe }) => ({ apodo, copas, heroe }));
    return [200, { lista }];
  },
  'GET /salud': () => [200, { ok: 1 }],
};

http
  .createServer(async (req, res) => {
    const origen = ORIGENES.includes(req.headers.origin) ? req.headers.origin : null,
      ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();
    if (req.method == 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': origen || 'null',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      });
      return res.end();
    }
    if (demasiados(ip)) return responder(res, 429, { error: 'espera' }, origen);
    const ruta = RUTAS[req.method + ' ' + req.url.split('?')[0]];
    if (!ruta) return responder(res, 404, { error: 'ruta' }, origen);
    try {
      const cuerpo = req.method == 'POST' ? await leerCuerpo(req) : {};
      const [codigo, datos] = ruta(cuerpo, new URLSearchParams(req.url.split('?')[1] || ''), ip);
      responder(res, codigo, datos, origen);
    } catch (e) {
      responder(res, 400, { error: 'pedido' }, origen);
    }
  })
  .listen(PUERTO, () => console.log('Mazmorra: servidor en el puerto ' + PUERTO));
