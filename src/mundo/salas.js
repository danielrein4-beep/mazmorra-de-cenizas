// Cuarto actual: oleadas de enemigos, fuentes animadas, paso a la zona siguiente y mejoras tras cada jefe.
function updateSala() {
  const P = G.P;
  if (G.fade > 0 && !G.salir) G.fade = Math.max(0, G.fade - 0.05);
  if (G.oleadas && G.cerrado && !G.B && !G.over) {
    if (G.olaT > 0) {
      if (--G.olaT == 0) {
        const L = G.oleadas[G.ola];
        L.forEach((k, j) => {
          const a = (j / L.length) * 6.283 + rnd(-0.3, 0.3);
          const [x, y] = lugarLibre(
            ...enSala(240 + Math.cos(a) * rnd(80, 150), 160 + Math.sin(a) * rnd(40, 80)),
          );
          spawnEnemigo(k, x, y);
          marcarSpawnOleada(j);
        });
      }
    } else if (!G.enem.length && !G.spawns.length) {
      if (G.ola < G.oleadas.length - 1) {
        G.ola++;
        G.olaT = 55;
        G.aviso = { txt: 'Oleada ' + (G.ola + 1), l: 60 };
      } else cuartoLimpio();
    }
  }
  updateMundo();
  if (G.salir) {
    G.fade += 0.04;
    P.moving = true;
    if (G.fade >= 1.2) {
      G.salir = 0;
      if (G.torre) siguientePiso();
      else entrarZona(G.zona + 1);
    }
  }
}
function drawSala() {
  const t = G.t,
    Z = ZONAS[G.zona],
    fi = Math.floor(t / 10) % 3;
  [7, 22].forEach(tx => {
    tile(w, R['fMid' + Z.fuente][fi], tx, 1);
    tile(w, R['fBasin' + Z.fuente][fi], tx, 2);
  });
  drawPuertas();
}
function jefeDerrotado() {
  G.slow = 1;
  G.slowT = 0;
  G.zt = zb();
  const antes = VESTUARIOS.filter(desbloqueado).length;
  guardarLogro(G.B.id);
  G.jefesVencidos = (G.jefesVencidos || 0) + 1;
  G.ultimoJefe = G.B.def.n;
  if (G.B.id == 'dragon' && G.torre && !G.pacto && !G.reto) G.dragonVencido = 1;
  if (G.B.id == 'kiplot' && G.pacto) G.pactoVencido = 1;
  if (G.pacto && G.B.def.demonio) premioDiablo(G.B);
  if (!G.tocadoJefe) guardarLogro('sinGolpes');
  revisarLogros();
  const ultimo = G.reto
    ? retoCumplido()
    : G.pacto
      ? ultimoPacto()
      : G.torre
        ? G.piso >= 100
        : G.zona == ZONAS_AVENTURA - 1;
  if (ultimo && !G.reto && G.dif.id == 'pesadilla') guardarLogro('pesadilla');
  if (VESTUARIOS.filter(desbloqueado).length > antes) G.vestNuevo = 1;
  if (ultimo) {
    end(true);
    return;
  }
  mostrarMejoras();
}
function mostrarMejoras(k) {
  k = k || 0;
  G.elige = k;
  if (!k) salaJefe = salaActiva;
  const P = (G.jugTodos || G.jug)[k];
  running = false;
  mouse.down = false;
  keys = {};
  touch.move = touch.aim = null;
  const MJ = mejorasDe(Object.assign({}, PERSONAJES[P.pid], { tecs: P.tecs })),
    pool = MJ.filter(
      m => m.id != 'cura' && (P.mej[m.id] || 0) < m.max && !(TEC[m.id] && nivelTec(P, m.id) >= 5),
    ).sort(() => Math.random() - 0.5);
  // Dos reliquias al azar y una mejora de técnica o de vida; con la vida baja, también curarse.
  const ops = pool.slice(0, 1),
    r1 = reliquiaAlAzar(P),
    r2 = r1 && reliquiaAlAzar({ rel: Object.assign({}, P.rel, { [r1]: 1 }) });
  [r2, r1]
    .filter(Boolean)
    .forEach(id => ops.unshift({ id: 'rel_' + id, rel: id, n: reliquia(id).n, d: reliquia(id).d, max: 1 }));
  if (P.hp < P.max) ops.push(MJ.find(m => m.id == 'cura'));
  const L = document.getElementById('mejorasLista');
  L.innerHTML = '';
  ops.forEach((m, i) => {
    const b = document.createElement('button');
    b.className = 'carta';
    const nv = (P.mej[m.id] || 0) + 1;
    b.innerHTML =
      '<span class="cab"><canvas width="48" height="48"></canvas><span class="tecla">' +
      (i + 1) +
      '</span></span><strong></strong><span class="desc"></span>';
    const cx = b.querySelector('canvas').getContext('2d');
    cx.imageSmoothingEnabled = false;
    if (m.rel) dibujarReliquia(cx, m.rel, 24, 24, 4);
    else icono(cx, m.ico, 24, 24, 4);
    if (m.rel) {
      b.style.borderColor = RAREZA[reliquia(m.rel).r].c;
      b.dataset.rareza = 'Reliquia ' + RAREZA[reliquia(m.rel).r].n.toLowerCase();
    }
    b.querySelector('strong').textContent = m.n + (m.max > 1 && m.max < 99 ? ' ' + 'I'.repeat(nv) : '');
    b.querySelector('.desc').textContent = (m.rel ? b.dataset.rareza + '. ' : '') + m.d;
    b.onclick = () => elegirMejora(m);
    L.appendChild(b);
  });
  // En la Torre, cada guardián vencido deja una página de la crónica.
  const cronica = G.torre && !G.reto && CRONICAS[G.piso];
  document.querySelector('#mejoras p').textContent =
    (G.miticoNuevo && !k ? '¡OBJETO MÍTICO: ' + G.miticoNuevo + '! Equípalo en el Armario. ' : '') +
    (cronica ? 'Crónica del piso ' + G.piso + ': ' + cronica + ' ' : '') +
    (G.coop ? 'Jugador ' + (k + 1) + ', ' + P.nombre + '. ' : '') +
    (G.vestNuevo
      ? 'El jefe cayó y desbloqueaste un vestuario nuevo. Toma una mejora para lo que viene.'
      : 'El jefe cayó. Toma una mejora para lo que viene.');
  if (!G.coop || k == (G.jugTodos || G.jug).length - 1) G.vestNuevo = 0;
  // En línea, el jugador 2 elige su poder en su propio aparato.
  if (mejorasAlInvitado(ops, k)) {
    L.innerHTML = '';
    document.querySelector('#mejoras p').textContent = 'Tu amigo está eligiendo su poder…';
  }
  document.getElementById('mejoras').hidden = false;
  L.querySelector('button')?.focus();
}
// La mejora se aplica en la sala donde cayó el jefe, aunque el anfitrión esté en otro cuarto.
let salaJefe = null;
function elegirMejora(m) {
  return conSala(SALAS.includes(salaJefe) ? salaJefe : salaActiva, () => elegirMejoraAqui(m));
}
function elegirMejoraAqui(m) {
  const P = (G.jugTodos || G.jug)[G.elige || 0];
  if (m.rel) darReliquia(P, m.rel);
  else P.mej[m.id] = (P.mej[m.id] || 0) + 1;
  if (m.id == 'corazon') {
    P.max += 2;
    P.hp = P.max;
  } else if (m.id == 'cura') P.hp = P.max;
  else P.hp = Math.min(P.max, P.hp + 2);
  // Cada héroe elige el suyo, uno tras otro.
  if (G.coop && (G.elige || 0) < (G.jugTodos || G.jug).length - 1) {
    mostrarMejoras((G.elige || 0) + 1);
    return;
  }
  revivirTodos();
  document.getElementById('mejoras').hidden = true;
  running = true;
  last = 0;
  musica('sala');
  G.room.limpio = true;
  G.cerrado = 0;
  G.B = null;
  ponerEscalera();
  ponerCofre(200, 200, false);
  G.aviso = { txt: 'Baja por la escalera', l: 110 };
}
