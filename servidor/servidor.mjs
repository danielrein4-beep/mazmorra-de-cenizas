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
  'GET /api/records': () => {
    const lista = Object.values(db.records)
      .sort((a, b) => b.piso - a.piso || a.fecha - b.fecha)
      .slice(0, 50)
      .map(({ apodo, piso, heroe, nivel, fecha }) => ({ apodo, piso, heroe, nivel, fecha }));
    return [200, { lista }];
  },
  // Sube tu récord: cada aparato tiene un id al azar; solo cuenta si mejora el anterior.
  'POST /api/records': b => {
    if (!idValido(b.id) || !apodoValido(b.apodo) || !entero(b.piso, 100) || !entero(b.nivel || 1, 99))
      return [400, { error: 'datos' }];
    const r = db.records[b.id];
    if (!r || b.piso > r.piso || r.apodo != b.apodo.trim()) {
      db.records[b.id] = {
        apodo: b.apodo.trim(),
        piso: Math.max(b.piso, r ? r.piso : 0),
        heroe: String(b.heroe || '').slice(0, 20),
        nivel: b.nivel || 1,
        fecha: Date.now(),
      };
      guardarDisco();
    }
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
      const [codigo, datos] = ruta(cuerpo, new URLSearchParams(req.url.split('?')[1] || ''));
      responder(res, codigo, datos, origen);
    } catch (e) {
      responder(res, 400, { error: 'pedido' }, origen);
    }
  })
  .listen(PUERTO, () => console.log('Mazmorra: servidor en el puerto ' + PUERTO));
