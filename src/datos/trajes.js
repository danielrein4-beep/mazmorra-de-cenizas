// Trajes de verdad: además del color, cada uno pone piezas sobre el héroe (capa, alas, corona, cuernos,
// aureola, hombreras, bufanda). Se dibujan en el juego y en la vista previa del vestuario.
const PIEZAS_TRAJE = {
  sombra: { piezas: ['capa'], capa: '#2a1650' },
  escarcha: { piezas: ['corona'], corona: '#9af0ff' },
  sangre: { piezas: ['capa', 'cuernos'], capa: '#7a0a1a' },
  oro: { piezas: ['aureola', 'hombreras'], hombreras: '#ffd24a' },
  pesadilla: { piezas: ['alas', 'cuernos'], alas: '#3a0a1a' },
  esmeralda: { n: 'Guardián del Bosque', piezas: ['capa', 'bufanda'], capa: '#1a6a3a', bufanda: '#7cff4a' },
  noche: {
    n: 'Caballero Nocturno',
    piezas: ['capa', 'cuernos', 'hombreras'],
    capa: '#0b0820',
    hombreras: '#6a6aa0',
  },
  coral: { n: 'Fénix', piezas: ['alas'], alas: '#ff6a2a', chispas: '#ffe94a' },
  lavanda: { n: 'Hechicero Celeste', piezas: ['capa', 'aureola'], capa: '#6a4cff', chispas: '#d0b0ff' },
  marfil: { n: 'Paladín Blanco', piezas: ['capa', 'hombreras'], capa: '#e8e0d0', hombreras: '#ffd24a' },
  aurora: {
    n: 'Aurora',
    piezas: ['bufanda', 'hombreras'],
    bufanda: '#177e89',
    hombreras: '#5ee7ff',
    chispas: '#5ee7ff',
  },
  abismo: { n: 'Señor del Abismo', piezas: ['alas', 'cuernos'], alas: '#2a0a4a', chispas: '#b06bff' },
  reyMago: {
    n: 'Rey Mago',
    piezas: ['capa', 'corona'],
    capa: '#a01a2a',
    corona: '#ffd24a',
    chispas: '#ffe94a',
  },
};
// Los trajes de color pasan a llamarse por su traje completo.
VESTUARIOS.forEach(v => PIEZAS_TRAJE[v.id] && PIEZAS_TRAJE[v.id].n && (v.n = PIEZAS_TRAJE[v.id].n));

// Dibuja las piezas. delante = 0 para las de atrás (capa, alas), 1 para las de adelante.
// (px, py) son los pies del héroe; k es la escala (1 en el juego, 3 en la vista previa).
function dibujarTraje(x, id, px, py, cara, k, t, delante) {
  const T = PIEZAS_TRAJE[id];
  if (!T) return;
  const f = cara < 0 ? -1 : 1,
    X = dx => px + dx * k * f,
    // El héroe mide unos 17 px de alto dentro de su cuadro de 28: las medidas de las piezas se achican a su talla.
    Y = dy => py + dy * 0.62 * k;
  const poli = (pts, c) => {
    x.fillStyle = c;
    x.beginPath();
    pts.forEach(([a, b], i) => (i ? x.lineTo(X(a), Y(b)) : x.moveTo(X(a), Y(b))));
    x.closePath();
    x.fill();
  };
  T.piezas.forEach(p => {
    if (!delante && p == 'capa') {
      const vuelo = 2 + Math.sin(t * 0.15) * 1.5;
      poli(
        [
          [-5, -19],
          [4, -19],
          [6 - vuelo, -1],
          [-8 - vuelo, -1],
        ],
        T.capa,
      );
      poli(
        [
          [-5, -19],
          [-2, -19],
          [-6 - vuelo, -1],
          [-8 - vuelo, -1],
        ],
        'rgba(0,0,0,.3)',
      );
    }
    if (!delante && p == 'alas') {
      const b = Math.sin(t * 0.2) * 3;
      [-1, 1].forEach(l => {
        poli(
          [
            [l * 2, -18],
            [l * 15, -27 - b],
            [l * 13, -16 - b / 2],
            [l * 9, -9],
          ],
          T.alas,
        );
        poli(
          [
            [l * 2, -18],
            [l * 11, -22 - b],
            [l * 6, -11],
          ],
          'rgba(255,255,255,.18)',
        );
      });
    }
    if (delante && p == 'corona') {
      poli(
        [
          [-5, -27],
          [5, -27],
          [5, -31],
          [3, -29],
          [1, -33],
          [-1, -29],
          [-3, -33],
          [-5, -29],
        ],
        T.corona,
      );
      x.fillStyle = '#ff2a4a';
      x.fillRect(X(-0.5) - k / 2, Y(-29), k, k);
    }
    if (delante && p == 'cuernos')
      [-1, 1].forEach(l =>
        poli(
          [
            [l * 3, -26],
            [l * 5, -26],
            [l * 8, -32],
            [l * 6, -31],
          ],
          '#e8dcc0',
        ),
      );
    if (delante && p == 'aureola') {
      x.strokeStyle = '#ffe94a';
      x.globalAlpha = 0.7 + Math.sin(t * 0.1) * 0.25;
      x.lineWidth = Math.max(1, k);
      x.beginPath();
      x.ellipse(X(0), Y(-34), 5 * k, 1.6 * k, 0, 0, 7);
      x.stroke();
      x.globalAlpha = 1;
    }
    if (delante && p == 'hombreras')
      [-1, 1].forEach(l =>
        poli(
          [
            [l * 4, -20],
            [l * 8, -20],
            [l * 8, -17],
            [l * 4, -17],
          ],
          T.hombreras,
        ),
      );
    if (delante && p == 'bufanda') {
      const ola = Math.sin(t * 0.25) * 1.5;
      poli(
        [
          [-4, -20],
          [4, -20],
          [4, -18],
          [-4, -18],
        ],
        T.bufanda,
      );
      poli(
        [
          [-3, -20],
          [-11, -19 + ola],
          [-12, -16 + ola],
          [-3, -18],
        ],
        T.bufanda,
      );
    }
  });
  // Chispas del traje alrededor del héroe (solo en el juego).
  if (delante && T.chispas && k == 1 && G && G.pt && t % 5 == 0)
    G.pt.push({
      x: px + rnd(-9, 9),
      y: py - rnd(4, 28),
      vx: 0,
      vy: -0.5,
      l: 18,
      m: 18,
      c: T.chispas,
      s: 1,
      g: 0,
    });
}
