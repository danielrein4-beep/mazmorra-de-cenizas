// Pacto de Demonios: una torre corta en el Abismo con los tres demonios (Silfred, Zagred y Kiplot).
// Hay que entrar de a dos (en esta compu o en línea), o solo si eres un Rey Mago de nivel 20.
// Con «Fuego amigo» los golpes también pegan al compañero: se puede traicionar o pelear entre ustedes.
const PISOS_PACTO = ['pelea', 'pelea', 'silfred', 'tienda', 'pelea', 'zagred', 'tienda', 'pelea', 'kiplot'];
const NIVEL_PACTO_SOLO = 20;
const PREMIO_PACTO = 8000;

// ¿Puede entrar? Devuelve el aviso si no.
function avisoPacto() {
  const dos = ELEGIDO.jug == 2 && (!coarse || enRed);
  if (dos || estado().nivel >= NIVEL_PACTO_SOLO) return '';
  return (
    'Los demonios no se vencen solos: entra con un amigo (en esta compu o en línea), o vuelve cuando seas Rey Mago de nivel ' +
    NIVEL_PACTO_SOLO +
    '.'
  );
}

function iniciarPacto() {
  G.torre = 1;
  G.pacto = { traicion: !!ELEGIDO.traicion };
  G.piso = 0;
  G.pisoInicio = 1;
  G.rangoPartida = 0;
  // Se entra fuerte: cada héroe recibe seis mejoras y seis reliquias, como si viniera de la Torre.
  G.jug.forEach(P => {
    for (let i = 0; i < 6; i++) {
      const pool = mejorasDe(Object.assign({}, PERSONAJES[P.pid], { tecs: P.tecs })).filter(
        m => m.id != 'cura' && (P.mej[m.id] || 0) < m.max && !(TEC[m.id] && nivelTec(P, m.id) >= 5),
      );
      if (pool.length) {
        const m = pool[Math.floor(Math.random() * pool.length)];
        P.mej[m.id] = (P.mej[m.id] || 0) + 1;
        if (m.id == 'corazon') P.max += 2;
      }
      darReliquia(P, reliquiaAlAzar(P, true), true);
    }
    P.hp = P.max;
  });
  G.jug[0].oro += 150;
  siguientePisoPacto();
  if (G.pacto.traicion) G.aviso = { txt: 'Fuego amigo: tus golpes también le pegan a tu compañero', l: 160 };
}

function siguientePisoPacto() {
  juntarTodos();
  const n = ++G.piso,
    tipoP = PISOS_PACTO[n - 1],
    jefe = !['pelea', 'tienda'].includes(tipoP),
    tipo = jefe ? 'jefe' : tipoP;
  G.zona = 3;
  // Dificultad de lo más alto de la Torre, y un poco más en cada piso.
  G.dif = difDePiso(88 + n * 2);
  const Z = ZONAS[G.zona],
    c = {
      x: 0,
      y: 0,
      tipo,
      plano: jefe
        ? Z.planoJefe
        : tipo == 'tienda'
          ? 'tienda'
          : Z.planos[Math.floor(Math.random() * Z.planos.length)],
      p: { N: { tipo: 'normal', abierta: true } },
      limpio: false,
      visto: true,
      conocido: true,
      est: null,
    };
  if (jefe) c.jefe = tipoP;
  G.tocadoJefe = 0;
  G.mundo = { cu: { '0,0': c }, W: 1, H: 1, inicio: c };
  G.room = null;
  entrarCuarto(c, null);
  G.aviso = {
    txt: jefe
      ? 'Abismo ' + n + ' · ' + JEFES[tipoP].n
      : tipo == 'tienda'
        ? 'Abismo ' + n + ' · Respiro'
        : 'Abismo ' + n,
    l: 120,
  };
  if (tipo == 'tienda') G.jug.forEach(P => (P.hp = Math.min(P.max, P.hp + 3)));
}
const ultimoPacto = () => G.piso >= PISOS_PACTO.length;
// Vencer a Kiplot reparte 8.000 cenizas (en línea, mitad y mitad).
const premioPacto = () =>
  G.pactoVencido ? Math.floor(PREMIO_PACTO / (enRed && (G.jugTodos || []).length > 1 ? 2 : 1)) : 0;

function finPacto(win) {
  document.getElementById('endTitle').textContent = win
    ? '¡Vencieron al Rey de los Demonios!'
    : 'El abismo los tragó';
  document.getElementById('endText').textContent = win
    ? 'Silfred, Zagred y Kiplot cayeron. El abismo queda en silencio… por ahora. ¡+' +
      premioPacto() +
      ' cenizas!'
    : 'Cayeron en el abismo ' + G.piso + ' de ' + PISOS_PACTO.length + '.';
  if (win) guardarLogro('pacto');
}
