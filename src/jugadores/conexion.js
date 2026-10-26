// Conexión por internet: STUN de Google y el servidor de enlace propio (TURN) con claves temporales que
// entrega el servidor de récords. Sin el enlace, dos aparatos en redes distintas (datos móviles, routers
// estrictos) no logran verse. Además: reconectar la sala al volver al juego y avisar si algo no conecta.
async function opcionesRed() {
  const stun = [{ urls: 'stun:stun.l.google.com:19302' }];
  try {
    const ctl = new AbortController(),
      t = setTimeout(() => ctl.abort(), 4000),
      r = await fetch(API_NUBE + '/api/turn', { signal: ctl.signal });
    clearTimeout(t);
    const d = await r.json();
    return { config: { iceServers: d.iceServers && d.iceServers.length ? d.iceServers : stun } };
  } catch (e) {
    return { config: { iceServers: stun } };
  }
}

// El anfitrión: si el teléfono se va a segundo plano (por ejemplo, para mandar el código por WhatsApp),
// la sala pierde su enlace con el servidor de códigos. Se reconecta con el mismo código.
function vigilarAnfitrion(peer) {
  peer.on('disconnected', () =>
    setTimeout(() => {
      if (enRed && enRed.peer === peer && !peer.destroyed && peer.disconnected) peer.reconnect();
    }, 1000),
  );
}
document.addEventListener('visibilitychange', () => {
  const p = enRed && enRed.peer;
  if (!document.hidden && p && p.disconnected && !p.destroyed) p.reconnect();
});

// El invitado: si a los 15 s no hay conexión, o a los 25 s no llega la imagen, se le dice qué hacer.
function vigilarInvitado(con, codigo) {
  setTimeout(() => {
    if (enRed && enRed.con === con && !con.open)
      avisoRed(
        'No se pudo conectar con la sala ' +
          codigo +
          '. Que tu amigo deje la sala abierta, con el juego en pantalla, y prueba de nuevo.',
      );
  }, 15000);
  setTimeout(() => {
    const v = document.getElementById('videoRed');
    if (enRed && enRed.con === con && con.open && (v.hidden || !v.videoWidth))
      avisoRed(
        'Están conectados, pero la imagen no llega. Prueben de nuevo; si sigue, uno de los dos puede pasar de wifi a datos o al revés.',
      );
  }, 25000);
}

// En iPhone el video con sonido puede no arrancar solo: se muestra en silencio y se ofrece activar el sonido.
function reproducirTransmision(v) {
  v.play().catch(() => {
    v.muted = true;
    v.play().catch(() => {});
    if (document.getElementById('activarSonido')) return;
    const b = Object.assign(document.createElement('button'), {
      id: 'activarSonido',
      type: 'button',
      className: 'sec',
      textContent: 'Activar sonido',
    });
    b.onclick = () => {
      v.muted = false;
      v.play().catch(() => {});
      b.remove();
    };
    document.getElementById('wrap').appendChild(b);
  });
}
