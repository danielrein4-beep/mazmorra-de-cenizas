// Eventos de sala: a veces, al despejar un cuarto, aparece algo raro en vez del cofre.
// Altar de sangre (un corazón por una reliquia legendaria), cofre maldito (premio o trampa),
// fuente de las almas (vida y furia llenas) y los dados de Zaro (apuesta monedas).
const EVENTOS = {
  altar: {
    n: 'Altar de sangre',
    d: 'Ofrece un corazón de vida máxima a cambio de una reliquia legendaria.',
    c: '#ff2a4a',
  },
  cofreMaldito: { n: 'Cofre maldito', d: 'Puede tener una reliquia… o una trampa.', c: '#b06bff' },
  fuente: { n: 'Fuente de las almas', d: 'Bebe: vida y furia llenas.', c: '#5ee7ff' },
  dados: { n: 'Dados de Zaro', d: 'Apuesta 20 monedas: si ganas, te llevas 50.', c: '#ffd24a' },
};
function ponerEvento() {
  const ids = Object.keys(EVENTOS),
    ev = ids[Math.floor(Math.random() * ids.length)];
  G.inter.push({ tipo: 'evento', ev, x: 240, y: 172, t: 0, usos: ev == 'dados' ? 3 : 1 });
  G.aviso = { txt: EVENTOS[ev].n, l: 110 };
}
function textoEvento(c, E) {
  const V = EVENTOS[c.ev];
  return [E + V.n, V.d, true];
}
function usarEvento(P, c) {
  const V = EVENTOS[c.ev],
    fin = () => ((G.eventosUsados = (G.eventosUsados || 0) + 1), (c.usos -= 1), c.usos <= 0 && (c.d = 1));
  if (c.ev == 'altar') {
    if (P.max <= 2) return (G.aviso = { txt: 'No te queda vida para ofrecer', l: 70 });
    P.max -= 2;
    P.hp = Math.min(P.hp, P.max);
    const leg = RELIQUIAS.filter(r => r.r == 'l' && !tiene(P, r.id));
    darReliquia(P, leg.length ? leg[Math.floor(Math.random() * leg.length)].id : reliquiaAlAzar(P));
    burst(c.x, c.y - 10, 40, '#ff2a4a', 3);
    sfx('rugido');
  } else if (c.ev == 'cofreMaldito') {
    if (Math.random() < 0.55) {
      darReliquia(P, reliquiaAlAzar(P, true));
      soltarMonedas(c.x, c.y, 15);
    } else {
      G.aviso = { txt: '¡Era una trampa!', l: 90 };
      for (let i = 0; i < 3; i++) {
        spawnEnemigo(
          ZONAS[G.zona].enem[Math.floor(Math.random() * 6)],
          ...enSala(c.x + rnd(-80, 80), c.y + rnd(-50, 50)),
        );
        G.spawns[G.spawns.length - 1].forzarElite = 1;
      }
      sfx('sombra');
    }
    burst(c.x, c.y - 8, 30, '#b06bff', 3);
  } else if (c.ev == 'fuente') {
    P.hp = P.max;
    P.meter = 100;
    burst(c.x, c.y - 10, 30, '#5ee7ff', 2.5);
    ring(P.x, P.y - 12, 24, '#5ee7ff', 14);
    sfx('cofre');
  } else if (c.ev == 'dados') {
    if (P.oro < 20) return (G.aviso = { txt: 'Te faltan monedas para apostar', l: 70 });
    P.oro -= 20;
    const gana = Math.random() < 0.5;
    if (gana) soltarMonedas(c.x, c.y, 50);
    G.aviso = { txt: gana ? '¡Ganaste!' : 'Perdiste… ¿otra?', l: 70 };
    sfx(gana ? 'moneda' : 'hurt');
  }
  fin();
}
function drawEvento(c, t) {
  const V = EVENTOS[c.ev],
    b = Math.sin(t * 0.07) * 2;
  w.globalAlpha = 0.3 + Math.sin(t * 0.1) * 0.12;
  w.fillStyle = V.c;
  w.beginPath();
  w.ellipse(c.x, c.y, 14, 5, 0, 0, 7);
  w.fill();
  w.globalAlpha = 1;
  if (c.ev == 'altar' || c.ev == 'fuente') {
    w.fillStyle = '#3a2e4a';
    w.fillRect(c.x - 9, c.y - 12, 18, 12);
    w.fillStyle = '#5a4a6a';
    w.fillRect(c.x - 10, c.y - 14, 20, 3);
    w.fillStyle = V.c;
    if (c.ev == 'altar') {
      w.beginPath();
      w.moveTo(c.x, c.y - 26 + b);
      w.lineTo(c.x + 4, c.y - 21 + b);
      w.lineTo(c.x, c.y - 16 + b);
      w.lineTo(c.x - 4, c.y - 21 + b);
      w.fill();
    } else w.fillRect(c.x - 7, c.y - 15, 14, 2);
  } else if (c.ev == 'cofreMaldito') {
    w.fillStyle = '#2a1650';
    w.fillRect(c.x - 8, c.y - 12, 16, 11);
    w.fillStyle = '#b06bff';
    w.fillRect(c.x - 8, c.y - 12, 16, 2);
    w.fillRect(c.x - 1, c.y - 9, 2, 4);
  } else dibujarReliquia(w, 'dadoCaos', c.x, c.y - 12 + b, 1);
  if (t % 6 == 0)
    G.pt.push({
      x: c.x + rnd(-8, 8),
      y: c.y - rnd(4, 18),
      vx: 0,
      vy: -0.5,
      l: 20,
      m: 20,
      c: V.c,
      s: 1,
      g: 0,
    });
}
