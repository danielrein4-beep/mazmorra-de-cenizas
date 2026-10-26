// Invitar con un enlace: el anfitrión copia o comparte la dirección con su código de sala, y quien la abre
// llega directo al paso de unirse con el código ya puesto.
function mostrarInvitacion(codigo) {
  const b = document.getElementById('copiarEnlace'),
    url = location.origin + location.pathname + '?sala=' + codigo;
  b.hidden = false;
  b.onclick = async () => {
    const texto = 'Únete a mi sala en Mazmorra de Cenizas: ' + url;
    try {
      if (navigator.share && coarse)
        return await navigator.share({ title: 'Mazmorra de Cenizas', text: texto, url });
      await navigator.clipboard.writeText(url);
      avisoRed('Enlace copiado. Pásaselo a tu amigo: al abrirlo entra directo a tu sala ' + codigo + '.');
    } catch (e) {
      if (e && e.name == 'AbortError') return;
      avisoRed('Copia este enlace y pásaselo a tu amigo: ' + url);
    }
  };
}
// Con un código de sala puesto, el botón grande une a la sala en vez de empezar un juego suelto
// (así nadie queda jugando solo por tocar «Empezar» en vez de «Unirse»).
function modoUnirse(si) {
  const b = document.getElementById('empezarBtn');
  b.textContent = si ? 'Unirse a la sala' : 'Empezar';
  b.onclick = si ? unirseSala : start;
}
document
  .getElementById('codigoSala')
  .addEventListener('input', e => modoUnirse(/^[A-Za-z0-9]{4}$/.test(e.target.value.trim())));

// Se revisa al terminar de cargar, cuando ya existen todas las pantallas.
addEventListener('load', () => {
  const sala = (new URLSearchParams(location.search).get('sala') || '').toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(sala)) return;
  abrirElegir();
  irPaso(4);
  document.getElementById('codigoSala').value = sala;
  modoUnirse(true);
  avisoRed('Te invitaron a la sala ' + sala + '. Si quieres, elige tu héroe en el paso 2, y toca «Unirse».');
  history.replaceState(null, '', location.pathname);
});

// Compartir la hazaña apenas cae un guardián, desde la pantalla de elegir poder.
document.getElementById('hazanaBtn').onclick = () => {
  const n = G.ultimoJefe || 'un guardián';
  compartirCarta(hacerCarta(), 'Vencí a ' + n + ' en Mazmorra de Cenizas. ¿Te atreves? https://' + URL_JUEGO);
};
