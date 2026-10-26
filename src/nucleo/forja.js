// Forja de almas: con cenizas cada técnica sube para siempre, hasta entrar a la partida ya en nivel V
// (las del armario también). Cada nivel de forja suma un 15 % de daño y recarga un 8 % más rápido.
const PRECIO_FORJA = [150, 300, 600, 1000],
  FORJA_MAX = PRECIO_FORJA.length;
const ROMANO = ['I', 'II', 'III', 'IV', 'V'];
// La forja de cada héroe: la tuya, o la del amigo en línea que llegó con su perfil.
const forjaDe = (id, P) => ((P && P.forja) || LOGROS.forja || {})[id] || 0;
// Nivel de la técnica en la partida: 1 de base, más la forja (0-4) y las mejoras tras los jefes (0-2).
// La Corona del Rey Mago (reliquia) sube un nivel más; el tope es V.
const nivelTec = (P, id) =>
  Math.min(5, 1 + forjaDe(id, P) + (P.mej[id] || 0) + (tiene(P, 'coronaRey') ? 1 : 0));

// cast() llama a esto alrededor de cada técnica: el daño de golpes y proyectiles sale con su forja.
function conForja(P, id, fn) {
  P.multTec = 1 + 0.15 * forjaDe(id, P);
  try {
    fn();
  } finally {
    P.multTec = 1;
  }
}

function mostrarForja() {
  const p = PERSONAJES[ELEGIDO.p],
    L = document.getElementById('forjaLista');
  document.getElementById('forjaHeroe').textContent =
    p[ELEGIDO.sexo].n + ' · tienes ' + cenizasTengo() + ' cenizas';
  L.innerHTML = '';
  // Todas las técnicas del héroe: las de base y las del armario (las que falta comprar, con aviso).
  tecsDelHeroe(ELEGIDO.p).forEach(id => {
    const f = forjaDe(id),
      fila = document.createElement('div'),
      c = document.createElement('canvas');
    fila.className = 'forja';
    c.width = c.height = 48;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    icono(x, id, 24, 24, 4);
    fila.appendChild(c);
    const info = document.createElement('div');
    info.innerHTML = '<b></b><small></small>';
    info.querySelector('b').textContent = TEC[id].n + ' · nivel ' + ROMANO[f] + ' de V';
    info.querySelector('small').textContent = !tecComprada(id)
      ? 'Primero cómprala en el Armario.'
      : f >= FORJA_MAX
        ? 'Completa: entra a cada partida en nivel V, con su despertar.'
        : 'Nivel ' +
          ROMANO[f + 1] +
          ': +' +
          15 * (f + 1) +
          ' % de daño, recarga más rápida' +
          (f + 1 >= 2
            ? ' y ' + ['', '', 'brillo grande', 'eco en cada disparo', 'su despertar'][f + 1]
            : '') +
          '.';
    fila.appendChild(info);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sec';
    if (f >= FORJA_MAX || !tecComprada(id)) {
      b.textContent = f >= FORJA_MAX ? 'Completa' : 'Sin comprar';
      b.disabled = true;
    } else {
      const precio = PRECIO_FORJA[f];
      b.textContent = 'Forjar · ' + precio;
      b.disabled = cenizasTengo() < precio;
      b.onclick = () => {
        if (cenizasTengo() < precio) return;
        guardarLogro('polvo', cenizasTengo() - precio);
        guardarLogro('forja', Object.assign({}, LOGROS.forja, { [id]: f + 1 }));
        sfx('martillazo');
        revisarLogros();
        mostrarForja();
      };
    }
    fila.appendChild(b);
    L.appendChild(fila);
  });
  irAPanel('forja');
}
document.getElementById('forjaBtn').onclick = mostrarForja;
document.getElementById('forjaVolver').onclick = () => {
  volverDePanel('forja');
};
