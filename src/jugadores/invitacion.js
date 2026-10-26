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
// Se revisa al terminar de cargar, cuando ya existen todas las pantallas.
addEventListener('load', () => {
  const sala = (new URLSearchParams(location.search).get('sala') || '').toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(sala)) return;
  abrirElegir();
  irPaso(4);
  document.getElementById('codigoSala').value = sala;
  avisoRed('Te invitaron a la sala ' + sala + '. Si quieres, elige tu héroe en el paso 2, y toca «Unirse».');
  history.replaceState(null, '', location.pathname);
});

// Compartir la hazaña apenas cae un guardián, desde la pantalla de elegir poder.
document.getElementById('hazanaBtn').onclick = () => {
  const n = G.ultimoJefe || 'un guardián';
  compartirCarta(hacerCarta(), 'Vencí a ' + n + ' en Mazmorra de Cenizas. ¿Te atreves? https://' + URL_JUEGO);
};
