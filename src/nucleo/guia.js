// Guía de la primera partida: un cartel arriba que enseña un paso a la vez y avanza cuando lo haces.
// Se puede volver a ver desde Opciones.
const PASOS_GUIA = [
  {
    pc: 'Muévete con WASD o las flechas',
    tel: 'Arrastra el lado izquierdo para moverte',
    listo: P => P.moving,
  },
  {
    pc: 'Apunta con el ratón y mantén el clic para lanzar',
    tel: 'Arrastra el lado derecho para apuntar y lanzar',
    listo: P => P.cds.some(c => c > 0),
  },
  {
    pc: 'Cambia de técnica con 1, 2 y 3 (o la rueda del ratón)',
    tel: 'Toca «Técnica» para cambiar de poder',
    listo: (P, g) => P.spell != g.spell0,
  },
  {
    pc: 'Espacio para rodar: mientras ruedas las balas no te tocan',
    tel: 'Toca «Rodar»: mientras ruedas las balas no te tocan',
    listo: P => P.dash > 0,
  },
  {
    pc: 'G lanza el hechizo de tu grimorio',
    tel: 'Toca «Grimorio» para lanzar su hechizo',
    listo: P => P.gcd > 0,
  },
  {
    pc: 'Cuando la barra de furia brilla, Q es tu golpe final. ¡Suerte!',
    tel: 'Cuando la barra de furia brilla, toca «Final». ¡Suerte!',
    listo: (P, g) => g.t > 240,
  },
];

function empezarGuia() {
  G.guia = LOGROS.guiaVista || enRed ? null : { i: 0, t: 0, spell0: G.jug[0].spell, ok: 0 };
}
function pasoGuia() {
  const g = G.guia;
  if (!g) return;
  // El tiempo cuenta solo mientras el cartel se ve (no mientras está el nombre del cuarto).
  if (!G.aviso) g.t++;
  if (g.ok) {
    if (--g.ok == 0) {
      g.i++;
      g.t = 0;
      g.spell0 = G.jug[0].spell;
      if (g.i >= PASOS_GUIA.length) {
        G.guia = null;
        guardarLogro('guiaVista', 1);
      }
    }
    return;
  }
  if (g.t > 30 && PASOS_GUIA[g.i].listo(G.jug[0], g)) {
    g.ok = 40;
    sfx('moneda');
  }
}
function drawGuia() {
  const g = G.guia;
  // Espera a que se vaya el cartel del cuarto para no taparlo.
  if (!g || G.U || G.intro || G.aviso) return;
  const p = PASOS_GUIA[g.i],
    texto = coarse ? p.tel : p.pc,
    y = OH * (vertical() ? 0.3 : 0.2);
  o.font = '400 ' + (coarse ? 18 : 16) + 'px ' + FUENTE;
  const ancho = Math.min(OW - 24, o.measureText(texto).width + 60);
  o.fillStyle = 'rgba(10,6,16,.85)';
  o.fillRect(OW / 2 - ancho / 2, y - 26, ancho, 50);
  o.strokeStyle = g.ok ? '#3aff8a' : '#177e89';
  o.lineWidth = 2;
  o.strokeRect(OW / 2 - ancho / 2, y - 26, ancho, 50);
  txt('Guía ' + (g.i + 1) + ' de ' + PASOS_GUIA.length, OW / 2, y - 8, 11, '#8f82a6', 'center');
  txt(g.ok ? '¡Bien!' : texto, OW / 2, y + 14, coarse ? 16 : 15, g.ok ? '#3aff8a' : '#f1e9ff', 'center');
}
