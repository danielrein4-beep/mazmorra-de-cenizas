// Jugar en línea con código de sala.
// Quien crea la sala (anfitrión) corre la partida y le transmite a cada invitado la imagen y el sonido en vivo;
// los invitados solo mandan sus controles (ver jugadores/varios.js). La conexión entre los dos aparatos la hace PeerJS (gratis, sin servidor propio).
const PEERJS_URL = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
const PREFIJO_SALA = 'mazmorra-cenizas-';
const LETRAS_SALA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// enRed = null | { rol: 'anfitrion', peer, invitados: [...] } | { rol: 'invitado', peer, con, ... }
let enRed = null;

function avisoRed(txt) {
  document.getElementById('redAviso').textContent = txt;
}

function cargarPeerJS() {
  if (window.Peer) return Promise.resolve();
  return new Promise((ok, mal) => {
    const s = document.createElement('script');
    s.src = PEERJS_URL;
    s.onload = ok;
    s.onerror = () => mal(new Error('No se pudo cargar la conexión en línea. Revisa tu internet.'));
    document.head.appendChild(s);
  });
}

function puedeEnLinea() {
  if (!window.RTCPeerConnection) return 'Este navegador no permite jugar en línea.';
  if (/claude\.ai|claudeusercontent/.test(location.hostname))
    return 'El juego en línea funciona en la página propia del juego, no dentro de Claude.';
  return '';
}

function codigoNuevo() {
  let c = '';
  for (let i = 0; i < 4; i++) c += LETRAS_SALA[Math.floor(Math.random() * LETRAS_SALA.length)];
  return c;
}

function mensajeError(e) {
  const t = (e && (e.type || e.message)) || '';
  if (t == 'peer-unavailable') return 'No existe una sala con ese código. Revisa las letras.';
  if (t == 'unavailable-id') return 'Ese código ya está en uso. Prueba de nuevo.';
  if (t == 'network' || t == 'server-error' || t == 'socket-error')
    return 'No hay conexión con el servidor de salas. Revisa tu internet.';
  return 'Se cortó la conexión en línea.';
}

// ---------- Anfitrión ----------
async function crearSala() {
  const no = puedeEnLinea();
  if (no) return avisoRed(no);
  try {
    await cargarPeerJS();
  } catch (e) {
    return avisoRed(e.message);
  }
  cerrarRed();
  initAudio();
  const codigo = codigoNuevo(),
    opciones = await opcionesRed();
  const peer = new Peer(PREFIJO_SALA + codigo, opciones);
  vigilarAnfitrion(peer);
  enRed = {
    rol: 'anfitrion',
    peer,
    codigo,
    invitados: [],
  };
  avisoRed('Creando la sala…');
  peer.on('open', () => {
    avisoRed(
      'Sala ' +
        codigo +
        (maxInvitados() > 1
          ? ' lista. Pueden entrar hasta tres amigos con el código '
          : ' lista. Dile a tu amigo que entre con el código ') +
        codigo +
        ', o pásales el enlace.',
    );
    mostrarInvitacion(codigo);
  });
  peer.on('error', e => avisoRed(mensajeError(e)));
  peer.on('connection', con => aceptarInvitado(con));
}

function alRecibirAnfitrion(inv, d) {
  if (!enRed) return;
  if (d.tipo == 'hola') invitadoSaluda(inv, d);
  if (d.tipo == 'entrada') {
    inv.entrada = d;
    medidasInvitado(inv.vista, d);
    if (d.acc && d.acc.length) inv.acciones.push(...d.acc);
  }
  if (d.tipo == 'elige' && inv.opsMejora) {
    const m = inv.opsMejora[d.i];
    inv.opsMejora = null;
    if (m) elegirMejora(m);
  }
}

// Controles de un invitado que juega desde otro aparato (los lee leerControles).
function controlesRemotos(P, c) {
  const inv = P.invitado;
  if (!inv) return;
  // El ratón del invitado apunta sobre su propia vista (jugadores/vista-invitado.js).
  const e = inv.entrada,
    V = inv.vista,
    vw = V.OW / 3 / V.zoom,
    vh = V.OH / 3 / V.zoom;
  c.mx = e.mx || 0;
  c.my = e.my || 0;
  if (e.stick && Math.hypot(e.stick.dx, e.stick.dy) > 0.2) {
    c.ax = P.x + e.stick.dx * 100;
    c.ay = P.y - 14 + e.stick.dy * 100;
  } else if (e.raton) {
    c.ax = V.cam.x + (e.ax / V.OW - 0.5) * vw;
    c.ay = V.cam.y + (e.ay / V.OH - 0.5) * vh;
  } else {
    const tg = objetivoCercano();
    c.ax = tg ? tg.x : P.x + P.face * 50;
    c.ay = tg ? tg.y : P.y - 14;
  }
  c.fuego = !!e.fuego;
  while (inv.acciones.length) ACCIONES_RED[inv.acciones.shift()]?.();
}

const ACCIONES_RED = {
  dash: () => dash(),
  ult: () => ult(),
  tomar: () => interactuar(),
  pocima: () => beber(),
  grim: () => hechizoGrimorio(),
  sig: () => (G.P.spell = (G.P.spell + 1) % 3),
  t1: () => (G.P.spell = 0),
  t2: () => (G.P.spell = 1),
  t3: () => (G.P.spell = 2),
};

// Mejoras: cada invitado elige la suya en su pantalla; los demás esperan.
function mejorasAlInvitado(ops, k) {
  if (!enRed || enRed.rol != 'anfitrion') return false;
  const T = G.jugTodos || G.jug,
    inv = T[k] && T[k].invitado;
  if (inv && inv.con && inv.con.open) {
    inv.opsMejora = ops;
    inv.con.send({ tipo: 'mejoras', ops: ops.map(m => ({ n: m.n, d: m.d, ico: m.ico, rel: m.rel })) });
    aInvitados(
      { tipo: 'espera', txt: (T[k].etiqueta || 'Tu amigo') + ' está eligiendo su poder…' },
      i => i !== inv,
    );
    return true;
  }
  aInvitados({ tipo: 'espera', txt: ((T[k] && T[k].etiqueta) || 'Tu amigo') + ' está eligiendo su poder…' });
  return false;
}

// Lo que el amigo lleva a la partida: su grimorio, su forja y su estado, guardados en su aparato.
function miPerfil() {
  const P = { pid: ELEGIDO.p },
    grim = grimorioDe(P);
  return {
    grim,
    hojas: hojasDe(grim, PERSONAJES[ELEGIDO.p].id),
    forja: LOGROS.forja || {},
    estado: estado(),
    tecs: tecsEquipadas(ELEGIDO.p),
    vest: ELEGIDO.vest,
    apodo: LOGROS.apodo || '',
    marco: LOGROS.marco || 'sencillo',
  };
}
// Al terminar, cada invitado recibe sus cenizas y lo que ganó su héroe, y lo guarda en su aparato.
function premiosAlInvitado() {
  if (!enRed || enRed.rol != 'anfitrion' || !G.jugTodos) return;
  G.jugTodos.forEach(Q => {
    const inv = Q.invitado;
    if (!inv || !inv.con || !inv.con.open || !Q.hazañas) return;
    inv.con.send({
      tipo: 'premios',
      cenizas: cenizasDePartida(),
      haz: Q.hazañas,
      exp: expDePartida(),
      kills: G.kills,
      copas: copasDelInvitado(),
    });
    Q.hazañas = null;
  });
}
function recibirPremios(d) {
  if (d.cenizas) guardarLogro('polvo', cenizasTengo() + d.cenizas);
  const t =
    (d.cenizas ? ' Ganaste ' + d.cenizas + (d.cenizas == 1 ? ' ceniza.' : ' cenizas.') : '') +
    sumarEstado(d.haz || {}, d.exp || 0) +
    sumarCopas(d.copas || 0);
  guardarLogro('jugoEnLinea');
  guardarLogro('maxKills', Math.max(LOGROS.maxKills || 0, d.kills || 0));
  document.getElementById('endText').textContent += t + revisarLogros();
  subirALaNube();
}
function finAlInvitado(titulo, texto) {
  if (enRed && enRed.rol == 'anfitrion') aInvitados({ tipo: 'fin', titulo, texto });
}

// ---------- Invitado ----------
async function unirseSala() {
  const no = puedeEnLinea();
  if (no) return avisoRed(no);
  const codigo = document.getElementById('codigoSala').value.trim().toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(codigo)) return avisoRed('Escribe el código de 4 letras que te pasó tu amigo.');
  try {
    await cargarPeerJS();
  } catch (e) {
    return avisoRed(e.message);
  }
  cerrarRed();
  if (running) {
    running = false;
    musica(null);
  }
  initAudio();
  precargarMusica();
  avisoRed('Conectando con la sala ' + codigo + '…');
  const peer = new Peer(await opcionesRed());
  enRed = { rol: 'invitado', peer, codigo, acc: [] };
  peer.on('error', e => avisoRed(mensajeError(e)));
  peer.on('open', () => {
    const con = peer.connect(PREFIJO_SALA + codigo, { reliable: true });
    enRed.con = con;
    vigilarInvitado(con, codigo);
    con.on('open', () => {
      const p = PERSONAJES[ELEGIDO.p];
      con.send({
        tipo: 'hola',
        p: ELEGIDO.p,
        sexo: ELEGIDO.sexo,
        nombre: p[ELEGIDO.sexo].n,
        perfil: miPerfil(),
      });
      avisoRed('Conectado. Esperando la imagen del juego…');
    });
    con.on('data', d => alRecibirInvitado(d));
    con.on('close', () => salaCerrada());
  });
  peer.on('call', llamada => {
    llamada.answer();
    llamada.on('stream', s => verTransmision(s));
  });
}

function verTransmision(stream) {
  const v = document.getElementById('videoRed');
  v.srcObject = stream;
  v.hidden = false;
  v.volume = OPC.efectos / 100;
  reproducirTransmision(v);
  ['menu', 'endScr', 'mejoras', 'elegir'].forEach(id => (document.getElementById(id).hidden = true));
  document.getElementById('tbtns').hidden = !coarse;
  pantallaCompleta();
  if (!enRed.envio) enRed.envio = setInterval(enviarEntrada, 33);
}

// Lo que el invitado aprieta se manda unas 30 veces por segundo.
function enviarEntrada() {
  if (!enRed || !enRed.con || !enRed.con.open) return;
  let mx = 0,
    my = 0;
  if (keys.KeyA || keys.ArrowLeft) mx--;
  if (keys.KeyD || keys.ArrowRight) mx++;
  if (keys.KeyW || keys.ArrowUp) my--;
  if (keys.KeyS || keys.ArrowDown) my++;
  if (touch.move) {
    mx = touch.move.dx;
    my = touch.move.dy;
  }
  enRed.con.send({
    tipo: 'entrada',
    w: OW,
    h: OH,
    mx,
    my,
    ax: mouse.x,
    ay: mouse.y,
    raton: !coarse,
    stick: touch.aim ? { dx: touch.aim.dx, dy: touch.aim.dy } : null,
    fuego: mouse.down || !!touch.aim,
    acc: enRed.acc.splice(0),
  });
}

const TECLAS_INVITADO = {
  Space: 'dash',
  ShiftLeft: 'dash',
  KeyQ: 'ult',
  KeyE: 'tomar',
  KeyF: 'pocima',
  KeyG: 'grim',
  Digit1: 't1',
  Digit2: 't2',
  Digit3: 't3',
};
function teclaInvitado(code) {
  if (!enRed || enRed.rol != 'invitado' || !enRed.envio) return false;
  if (TECLAS_INVITADO[code]) enRed.acc.push(TECLAS_INVITADO[code]);
  return true;
}
function botonInvitado(accion) {
  if (!enRed || enRed.rol != 'invitado' || !enRed.envio) return false;
  enRed.acc.push(accion);
  return true;
}

function alRecibirInvitado(d) {
  if (d.tipo == 'llena') return avisoRed(d.txt);
  if (d.tipo == 'premios') return recibirPremios(d);
  // La música de su cuarto suena en su propio aparato; por la llamada solo llegan los efectos.
  if (d.tipo == 'musica') return musica(d.n);
  if (d.tipo == 'furia') return musicaFuria(d.bpm);
  if (d.tipo == 'mejoras') {
    const L = document.getElementById('mejorasLista');
    L.innerHTML = '';
    d.ops.forEach((m, i) => {
      const b = document.createElement('button');
      b.className = 'carta';
      b.innerHTML =
        '<span class="cab"><canvas width="48" height="48"></canvas><span class="tecla">' +
        (i + 1) +
        '</span></span><strong></strong><span class="desc"></span>';
      const cx = b.querySelector('canvas').getContext('2d');
      cx.imageSmoothingEnabled = false;
      if (m.rel) dibujarReliquia(cx, m.rel, 24, 24, 4);
      else icono(cx, m.ico, 24, 24, 4);
      b.querySelector('strong').textContent = m.n;
      b.querySelector('.desc').textContent = m.d;
      b.onclick = () => {
        enRed.con.send({ tipo: 'elige', i });
        document.getElementById('mejoras').hidden = true;
      };
      L.appendChild(b);
    });
    document.querySelector('#mejoras p').textContent = 'El jefe cayó. Elige tu poder.';
    document.getElementById('mejoras').hidden = false;
  }
  if (d.tipo == 'espera') avisoRed(d.txt);
  if (d.tipo == 'fin') {
    document.getElementById('endTitle').textContent = d.titulo;
    document.getElementById('endText').textContent = d.texto;
    document.getElementById('queViene').innerHTML = '';
    document.getElementById('queViene').appendChild(
      Object.assign(document.createElement('li'), {
        textContent: 'Tu amigo empieza la próxima partida: quédate aquí y entras solo.',
      }),
    );
    document.getElementById('againBtn').hidden = true;
    document.getElementById('cambiarBtn').hidden = true;
    document.getElementById('endScr').hidden = false;
  }
  if (d.tipo == 'empieza') {
    [
      'menu',
      'endScr',
      'mejoras',
      'elegir',
      'estado',
      'forja',
      'logros',
      'records',
      'armario',
      'ayuda',
      'opciones',
    ].forEach(id => (document.getElementById(id).hidden = true));
    document.getElementById('videoRed').hidden = false;
    document.getElementById('tbtns').hidden = !coarse;
  }
}

function salaCerrada() {
  if (!enRed || enRed.rol != 'invitado') return;
  document.getElementById('videoRed').hidden = true;
  document.getElementById('endTitle').textContent = 'Se cerró la sala';
  document.getElementById('endText').textContent = 'Tu amigo cerró la partida o se cortó la conexión.';
  document.getElementById('endScr').hidden = false;
  cerrarRed();
}

function cerrarRed() {
  document.getElementById('againBtn').hidden = false;
  document.getElementById('cambiarBtn').hidden = false;
  if (!enRed) return;
  if (enRed.envio) clearInterval(enRed.envio);
  try {
    enRed.peer.destroy();
  } catch (e) {}
  enRed = null;
}

document.getElementById('crearSala').onclick = crearSala;
document.getElementById('unirseSala').onclick = unirseSala;
document.getElementById('codigoSala').addEventListener('keydown', e => {
  if (e.code == 'Enter') unirseSala();
  e.stopPropagation();
});
