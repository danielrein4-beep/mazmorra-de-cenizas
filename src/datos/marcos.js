// Marcos del nombre: el cartelito que va sobre tu héroe mientras juegas. Se coleccionan: unos se compran
// con cenizas y otros solo se ganan con hazañas. Cada uno tiene su efecto (brillo, copos, brasas o
// fuego eléctrico negro y morado).
const MARCOS = [
  { id: 'sencillo', n: 'Sencillo', base: '#140e1e', borde: '#4e4070', texto: '#f2ecff' },
  {
    id: 'dorado',
    n: 'Dorado',
    precio: 300,
    base: '#2a1a06',
    borde: '#ffd24a',
    texto: '#ffe9a0',
    fx: 'brillo',
  },
  {
    id: 'escarcha',
    n: 'Escarcha',
    precio: 400,
    base: '#0a1a2a',
    borde: '#9af0ff',
    texto: '#e8fbff',
    fx: 'copos',
  },
  {
    id: 'carmesi',
    n: 'Carmesí',
    precio: 600,
    base: '#2a0608',
    borde: '#ff3a2a',
    texto: '#ffd0c0',
    fx: 'brasas',
  },
  {
    id: 'electrico',
    n: 'Fuego eléctrico',
    precio: 1200,
    base: '#0b0612',
    borde: '#8a2aff',
    texto: '#e0c0ff',
    fx: 'electrico',
  },
  {
    id: 'dragon',
    n: 'Escamas del Dragón',
    req: () => !!LOGROS.dragon,
    pide: 'Vence al Dragón del piso 100',
    base: '#1a0604',
    borde: '#ff8a2a',
    texto: '#ffd9a0',
    fx: 'brasas',
  },
  {
    id: 'reyMago',
    n: 'Corona del Rey Mago',
    req: () => (LOGROS.torre || 0) >= 100,
    pide: 'Llega al piso 100 de la Torre',
    base: '#1a1004',
    borde: '#ffd24a',
    texto: '#fff3c0',
    fx: 'corona',
  },
  {
    id: 'abismo',
    n: 'Pacto del Abismo',
    req: () => !!LOGROS.pacto,
    pide: 'Vence a Kiplot, Rey de los Demonios',
    base: '#050008',
    borde: '#ff2a4a',
    texto: '#ffc0d0',
    fx: 'electrico',
    rojo: 1,
  },
];
const marcoDe = id => MARCOS.find(m => m.id == id) || MARCOS[0];
const tengoMarco = m => m.id == 'sencillo' || (LOGROS.marcos || []).includes(m.id) || (m.req && m.req());

// Dibuja el cartel con el nombre centrado en x, con su borde inferior en y. k: tamaño (1 en el juego).
function dibujarPlacaNombre(x, cx, y, nombre, id, t, k) {
  const M = marcoDe(id);
  x.save();
  x.font = 7 * k + 'px ' + FUENTE;
  x.textAlign = 'center';
  const an = Math.ceil(x.measureText(nombre).width) + 8 * k,
    al = 10 * k,
    x0 = Math.round(cx - an / 2),
    y0 = Math.round(y - al);
  // Efectos de atrás: llamas negras y moradas (o brasas) que suben del cartel.
  if (M.fx == 'electrico' || M.fx == 'brasas')
    for (let i = 0; i < 7; i++) {
      const f = (t * 0.6 + i * 37) % 14,
        px = x0 + ((i * 53 + Math.floor(t / 14) * 17) % an);
      x.globalAlpha = 1 - f / 14;
      x.fillStyle =
        M.fx == 'brasas'
          ? i % 2
            ? '#ff8a2a'
            : '#ffe94a'
          : i % 3
            ? M.rojo
              ? '#ff2a4a'
              : '#8a2aff'
            : '#12051e';
      x.fillRect(px, y0 - f * k * 0.6, k * (i % 2 ? 2 : 1), k * (i % 2 ? 2 : 1));
    }
  x.globalAlpha = 0.9;
  x.fillStyle = M.base;
  x.fillRect(x0, y0, an, al);
  x.globalAlpha = 1;
  x.strokeStyle = M.borde;
  x.lineWidth = k;
  x.strokeRect(x0 + k / 2, y0 + k / 2, an - k, al - k);
  // Fuego eléctrico: rayitos que corren por el borde.
  if (M.fx == 'electrico' && t % 4 < 3) {
    x.strokeStyle = t % 8 < 4 ? '#ffffff' : M.rojo ? '#ff5a7a' : '#d9b0ff';
    x.lineWidth = Math.max(1, k * 0.6);
    x.beginPath();
    const lado = Math.floor(t / 4) % 2,
      yy = lado ? y0 : y0 + al;
    x.moveTo(x0, yy);
    for (let i = 1; i <= 6; i++) x.lineTo(x0 + (an * i) / 6, yy + ((i * 7 + t) % 3) * k - k);
    x.stroke();
  }
  if (M.fx == 'brillo' || M.fx == 'corona') {
    const p = ((t * 1.2) % (an + 30)) - 15;
    x.globalAlpha = 0.35;
    x.fillStyle = '#ffffff';
    x.fillRect(x0 + Math.max(0, p), y0 + k, Math.min(4 * k, Math.max(0, an - p)), al - 2 * k);
    x.globalAlpha = 1;
  }
  if (M.fx == 'copos')
    for (let i = 0; i < 4; i++) {
      x.fillStyle = '#ffffff';
      x.fillRect(x0 + ((i * 29 + t * 0.3) % an), y0 - k * 2 + ((t * 0.2 + i * 5) % 6) * k * 0.4, k, k);
    }
  if (M.fx == 'corona') {
    x.fillStyle = '#ffd24a';
    const c = Math.round(cx);
    x.fillRect(c - 3 * k, y0 - 2 * k, 6 * k, 2 * k);
    [-3, 0, 3].forEach(d => x.fillRect(c + (d - 0.5) * k, y0 - 4 * k, k, 2 * k));
  }
  x.fillStyle = '#0b0812';
  x.fillText(nombre, cx + k * 0.5, y0 + 7.5 * k);
  x.fillStyle = M.texto;
  x.fillText(nombre, cx, y0 + 7 * k);
  x.restore();
}

// Nombre y marco de cada héroe al empezar: el tuyo (apodo o nombre del héroe) y el del amigo en línea.
function ponerNombres(js) {
  const amigo = enRed && enRed.rol == 'anfitrion' && enRed.perfil;
  js.forEach((P, i) => {
    const s = PERSONAJES[P.pid][i ? ELEGIDO.sexo2 || 'm' : ELEGIDO.sexo] || PERSONAJES[P.pid].f;
    P.etiqueta = i ? (s && s.n) || 'Jugador 2' : LOGROS.apodo || s.n;
    P.marco = i ? 'sencillo' : LOGROS.marco || 'sencillo';
  });
  if (js[1] && amigo) {
    if (typeof amigo.apodo == 'string' && amigo.apodo.trim())
      js[1].etiqueta = amigo.apodo.trim().slice(0, 18);
    if (MARCOS.some(m => m.id == amigo.marco)) js[1].marco = amigo.marco;
  }
}
// Se dibuja sobre cada héroe vivo, encima de todo.
function drawNombres() {
  G.jug.forEach(
    Q => Q.etiqueta && !Q.caido && dibujarPlacaNombre(w, Q.x, Q.y - 30, Q.etiqueta, Q.marco, G.t, 1),
  );
}
