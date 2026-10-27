// Pacto de Demonios: una torre corta en el Abismo con los demonios Silfred, Belial, Zagred y Kiplot.
// Se entra solo o acompañado, y el fuego amigo va siempre: los golpes también pegan al compañero, así
// que se puede traicionar o pelear entre ustedes.
// Antes de cada diablo, tres pisos bravos; después de cada uno, un respiro.
const PISOS_PACTO = ['silfred', 'belial', 'zagred', 'kiplot'].flatMap((d, i) =>
  ['pelea', 'pelea', 'pelea', d].concat(i < 3 ? ['tienda'] : []),
);
const PREMIO_PACTO = 8000;

// Cualquiera puede entrar (solo es muy difícil, pero se puede).
const avisoPacto = () => '';

function iniciarPacto() {
  G.torre = 1;
  G.pacto = { traicion: true };
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
  if (G.jug.length > 1) G.aviso = { txt: 'Fuego amigo: tus golpes también le pegan a tu compañero', l: 160 };
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
  // Con más héroes, los demonios aguantan más: la mitad de vida extra por cada compañero.
  G.dif.jefe *= 1 + 0.5 * ((G.jugTodos || G.jug).length - 1);
  // Los pisos de pelea traen una oleada más y más enemigos; los diablos pegan un corazón entero por golpe,
  // aguantan más y atacan más seguido. Hay que llegar con todo al máximo, y aun así cuesta.
  if (tipoP == 'pelea')
    Object.assign(G.dif, { olas: G.dif.olas + 1, cant: G.dif.cant * 1.3, enem: G.dif.enem * 1.25 });
  if (jefe)
    Object.assign(G.dif, { golpe: 2, jefe: G.dif.jefe * 1.4, cdJ: G.dif.cdJ * 0.8, bala: G.dif.bala * 1.1 });
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
const premioPacto = () => (G.pactoVencido ? Math.floor(PREMIO_PACTO / jugadoresEnLinea()) : 0);

function finPacto(win) {
  document.getElementById('endTitle').textContent = win
    ? '¡Vencieron al Rey de los Demonios!'
    : 'El abismo los tragó';
  document.getElementById('endText').textContent = win
    ? 'Silfred, Belial, Zagred y Kiplot cayeron. El abismo queda en silencio… por ahora. ¡+' +
      premioPacto() +
      ' cenizas!' +
      textoPremioDiablo()
    : 'Cayeron en el abismo ' + G.piso + ' de ' + PISOS_PACTO.length + '.' + textoPremioDiablo();
  if (win) guardarLogro('pacto');
}
