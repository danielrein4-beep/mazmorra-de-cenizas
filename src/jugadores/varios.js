// Sala con varios invitados. En el Pacto de Demonios entran hasta tres amigos (cuatro héroes); en los
// demás modos, uno. Cada invitado tiene su héroe, su cámara, su videollamada y elige su propio poder.
const maxInvitados = () => (ELEGIDO.juego == 'pacto' ? 3 : 1);
const COLOR_JUGADOR = ['#5ee7ff', '#ff8a2a', '#7cff4a', '#ff5ad2'];
const invitadosConectados = () =>
  enRed && enRed.invitados ? enRed.invitados.filter(i => i.con && i.con.open) : [];
// Cuántos se reparten los premios: en línea, todos los héroes de la partida; en una sola compu, uno.
const jugadoresEnLinea = () => (enRed && G && G.jugTodos ? G.jugTodos.length : 1);

function aceptarInvitado(con) {
  const lleno = enRed.invitados.filter(i => i.con).length >= maxInvitados();
  if (running || lleno) {
    con.on('open', () => {
      con.send({
        tipo: 'llena',
        txt: running
          ? 'La partida ya empezó. Pídele a tu amigo que te espere al terminar.'
          : 'La sala está llena.',
      });
      setTimeout(() => con.close(), 500);
    });
    return;
  }
  const inv = { con, entrada: { mx: 0, my: 0, fuego: false }, acciones: [], vista: nuevaVista() };
  enRed.invitados.push(inv);
  con.on('data', d => alRecibirAnfitrion(inv, d));
  con.on('close', () => invitadoSeFue(inv));
}

// Al llegar el saludo: con un solo invitado la partida arranca sola; en el Pacto se espera a todos.
function invitadoSaluda(inv, d) {
  Object.assign(inv, { p: d.p, sexo: d.sexo, nombre: d.nombre, perfil: d.perfil || null });
  ELEGIDO.jug = 2;
  const listos = enRed.invitados.filter(i => i.nombre);
  if (maxInvitados() == 1) {
    avisoRed('¡' + d.nombre + ' se unió! Empezando…');
    return start();
  }
  avisoRed(
    '¡' +
      d.nombre +
      ' se unió! Son ' +
      (listos.length + 1) +
      ' de 4: ' +
      listos.map(i => i.nombre).join(', ') +
      '. Toca Empezar cuando estén todos.',
  );
}

// Los héroes de los invitados (del 2 al 4), cada uno con su perfil: grimorio, forja, traje y técnicas.
function heroesInvitados(js) {
  enRed.invitados
    .filter(i => i.nombre && i.con && i.con.open)
    .slice(0, 3)
    .forEach((inv, k) => {
      const P = crearJugador(inv.p || 0, inv.sexo || 'm', 'normal', k + 2);
      P.invitado = inv;
      js.push(P);
    });
}
function aplicarPerfiles(js) {
  js.forEach(P => {
    const amigo = P.invitado && P.invitado.perfil;
    if (!amigo) return;
    P.grim = amigo.grim;
    P.hojas = amigo.hojas;
    P.forja = amigo.forja || {};
    if (amigo.vest && VESTUARIOS.some(v => v.id == amigo.vest)) {
      P.traje = amigo.vest;
      P.src = atlasVestuario(amigo.vest);
    }
    if (Array.isArray(amigo.tecs) && amigo.tecs.length == 3 && amigo.tecs.every(id => TEC[id]))
      P.tecs = amigo.tecs;
  });
}

// Mensajes a los invitados (a todos, o a los que cumplan el filtro).
function aInvitados(msg, filtro) {
  invitadosConectados()
    .filter(i => !filtro || filtro(i))
    .forEach(i => i.con.send(msg));
}
// Al empezar: aviso a todos y, a quien todavía no la tiene, su videollamada.
function avisarEmpieza() {
  if (!enRed || enRed.rol != 'anfitrion') return;
  aInvitados({ tipo: 'empieza' });
  (G.jugTodos || []).forEach(
    Q => Q.invitado && !Q.invitado.llamada && Q.invitado.con.open && transmitir(Q.invitado),
  );
}

// La imagen de su vista y todo el sonido del juego salen como una videollamada hacia cada invitado.
function transmitir(inv) {
  const video = inv.vista.cv.captureStream(30);
  // Pixel art: mejor nítido que suave, aunque baje un poco la fluidez si la conexión es lenta.
  video.getVideoTracks().forEach(t => (t.contentHint = 'detail'));
  if (AC) {
    prepararSonido();
    if (!enRed.audioDest) {
      enRed.audioDest = AC.createMediaStreamDestination();
      if (fxSalida) fxSalida.connect(enRed.audioDest);
    }
    enRed.audioDest.stream.getAudioTracks().forEach(t => video.addTrack(t.clone()));
  }
  inv.llamada = enRed.peer.call(inv.con.peer, video);
  setTimeout(() => subirCalidad(inv), 1500);
}
function subirCalidad(inv) {
  const pc = inv.llamada && inv.llamada.peerConnection;
  if (!pc) return;
  // Con varios invitados cada video lleva menos, para que la conexión del anfitrión alcance.
  const tope = Math.round(4000000 / Math.max(1, invitadosConectados().length));
  pc.getSenders().forEach(s => {
    if (!s.track || s.track.kind != 'video') return;
    const p = s.getParameters();
    p.encodings = p.encodings && p.encodings.length ? p.encodings : [{}];
    p.encodings[0].maxBitrate = tope;
    p.degradationPreference = 'maintain-resolution';
    s.setParameters(p).catch(() => {});
  });
}

function invitadoSeFue(inv) {
  if (!enRed || enRed.rol != 'anfitrion') return;
  inv.con = null;
  inv.entrada = { mx: 0, my: 0, fuego: false };
  if (!running) enRed.invitados = enRed.invitados.filter(i => i !== inv);
  const quien = inv.nombre || 'Tu amigo';
  if (G && G.aviso !== undefined && running) G.aviso = { txt: quien + ' se desconectó', l: 150 };
  avisoRed(quien + ' se desconectó. La sala ' + enRed.codigo + ' sigue abierta.');
}
