// Torre de 100 pisos: cada piso es un cuarto más difícil; cada 5 hay descanso con tienda, cada 10 un guardián.
// El piso más alto al que llegas te da tu título (ver datos/titulos.js).
const ZONAS_AVENTURA = 3;
ZONAS.push(
  {
    n: 'Abismo de Sombras',
    tinte: '#8a3aff',
    banner: 'bannerBlue',
    fuente: 'Blue',
    oscuro: 0.55,
    jefe: 'zombi',
    planoJefe: 'pantano',
    enem: ['necro', 'chort', 'murcielago', 'masked', 'fantasma', 'zhielo'],
    planos: ['laberinto', 'cruz', 'pilares', 'cripta', 'foso2'],
  },
  {
    n: 'Cielo de Luz',
    tinte: '#ffe27a',
    banner: 'bannerRed',
    fuente: 'Blue',
    oscuro: 0.22,
    jefe: 'ogro',
    planoJefe: 'foso',
    enem: ['orcW', 'monje', 'shaman', 'baba', 'chort', 'necro'],
    planos: ['pilares', 'antesala', 'cruz', 'vacio2', 'laberinto'],
  },
  {
    n: 'Tormenta Eterna',
    tinte: '#4af0ff',
    banner: 'bannerBlue',
    fuente: 'Blue',
    oscuro: 0.5,
    jefe: 'cenizas',
    planoJefe: 'trono',
    enem: ['zhielo', 'orcW', 'murcielago', 'necro', 'monje', 'fantasma'],
    planos: ['foso2', 'forja', 'laberinto', 'cruz', 'pilares'],
  },
  {
    n: 'Trono del Rey Mago',
    tinte: '#ff2a4a',
    banner: 'bannerRed',
    fuente: 'Red',
    oscuro: 0.55,
    jefe: 'cenizas',
    planoJefe: 'trono',
    enem: ['necro', 'shaman', 'monje', 'baba', 'fantasma', 'murcielago'],
    planos: ['forja', 'trono', 'laberinto', 'cruz', 'pilares'],
  },
);
const zonaDePiso = n =>
  n <= 10 ? 0 : n <= 20 ? 1 : n <= 30 ? 2 : n <= 50 ? 3 : n <= 70 ? 4 : n <= 90 ? 5 : 6;
// Guardianes de cada diez pisos (combate/guardianes.js); en la cima espera el Dragón (combate/dragon.js).
const GUARDIANES = {
  10: 'zombi',
  20: 'ogro',
  30: 'caballeroHielo',
  40: 'nigromante',
  50: 'minotauro',
  60: 'espectro',
  70: 'hechicero',
  80: 'goblinRey',
  90: 'cenizas',
  100: 'dragon',
};
const guardianDe = n => GUARDIANES[n] || 'cenizas';
// El Señor de las Cenizas (muy difícil) pasó al piso 90 y el Caballero de Hielo bajó al 30; la vida
// de cada uno ya crece con el piso, así que el Dragón de la cima sigue siendo el más duro.

// Cada piso pega un poco más fuerte (ajustado para que el Dragón se pueda vencer con lo que juntas en la subida): enemigos con más vida, más enemigos, balas más rápidas y jefes más duros.
function difDePiso(n) {
  const b = DIFS[ELEGIDO.modo] || DIFS.normal;
  return Object.assign({}, b, {
    enem: b.enem * (1 + 0.035 * (n - 1)),
    cant: b.cant * Math.min(2.2, 1 + 0.025 * (n - 1)),
    olas: b.olas + (n > 40 ? 1 : 0) + (n > 80 ? 1 : 0),
    jefe: b.jefe * (1 + 0.18 * Math.floor((n - 1) / 10)),
    bala: b.bala * Math.min(1.45, 1 + 0.005 * n),
    cdJ: b.cdJ * Math.max(0.6, 1 - 0.006 * n),
  });
}

// Pisos desde los que puedes volver a empezar: el 1 y cada piso de guardián (10, 20…) al que ya llegaste.
const pisosDeSalida = () => {
  const L = [1];
  for (let s = 10; s <= Math.min(100, LOGROS.torre || 0); s += 10) L.push(s);
  return L;
};

function iniciarTorre(desde) {
  const ini = desde || (pisosDeSalida().includes(ELEGIDO.pisoInicio) ? ELEGIDO.pisoInicio : 1);
  G.torre = 1;
  G.piso = ini - 1;
  G.pisoInicio = ini;
  G.rangoPartida = nivelTitulo(ini);
  // Si empiezas más arriba, recibes los poderes de los guardianes que te saltas y algo de oro.
  const saltados = Math.floor((ini - 1) / 10);
  G.jug.forEach(P => {
    for (let i = 0; i < saltados; i++) {
      const pool = mejorasDe(Object.assign({}, PERSONAJES[P.pid], { tecs: P.tecs })).filter(
        m => m.id != 'cura' && (P.mej[m.id] || 0) < m.max && !(TEC[m.id] && nivelTec(P, m.id) >= 5),
      );
      if (!pool.length) break;
      const m = pool[Math.floor(Math.random() * pool.length)];
      P.mej[m.id] = (P.mej[m.id] || 0) + 1;
      if (m.id == 'corazon') P.max += 2;
      darReliquia(P, reliquiaAlAzar(P, true), true);
    }
    P.hp = P.max;
  });
  G.jug[0].oro += saltados * 25;
  siguientePiso();
}

function siguientePiso() {
  if (G.pacto) return siguientePisoPacto();
  juntarTodos();
  const n = ++G.piso;
  G.zona = zonaDePiso(n);
  G.dif = conReglasDelReto(difDePiso(n));
  const Z = ZONAS[G.zona],
    tipo = n % 10 == 0 ? 'jefe' : n % 5 == 0 ? 'tienda' : 'pelea',
    plano =
      tipo == 'jefe'
        ? Z.planoJefe
        : tipo == 'tienda'
          ? 'tienda'
          : Z.planos[Math.floor(Math.random() * Z.planos.length)],
    c = {
      x: 0,
      y: 0,
      tipo,
      plano,
      p: { N: { tipo: 'normal', abierta: true } },
      limpio: false,
      visto: true,
      conocido: true,
      est: null,
    };
  if (tipo == 'jefe') c.jefe = guardianDe(n);
  G.tocadoJefe = 0;
  G.mundo = { cu: { '0,0': c }, W: 1, H: 1, inicio: c };
  G.room = null;
  entrarCuarto(c, null);
  G.aviso = {
    txt:
      tipo == 'jefe'
        ? 'Piso ' + n + ' · Guardián'
        : tipo == 'tienda'
          ? 'Piso ' + n + ' · Descanso'
          : 'Piso ' + n,
    l: 110,
  };
  if (tipo == 'tienda') G.jug.forEach(P => (P.hp = Math.min(P.max, P.hp + 2)));
  if (!G.reto && n > (LOGROS.torre || 0)) guardarLogro('torre', n);
  const nv = nivelTitulo(n);
  if (nv > G.rangoPartida) {
    G.rangoPartida = nv;
    if (n > 1) {
      G.nuevoTitulo = { nivel: nv, t: 0 };
      sfx('cofre');
    }
  }
}

// Aviso de rango nuevo: la insignia entra girando en el centro de la pantalla.
function drawNuevoTitulo() {
  const N = G.nuevoTitulo;
  if (!N || G.intro) return;
  N.t++;
  if (N.t > 200) return (G.nuevoTitulo = null);
  const ent = Math.min(1, N.t / 20),
    sal = N.t > 170 ? (200 - N.t) / 30 : 1,
    a = ent * sal;
  o.globalAlpha = 0.75 * a;
  o.fillStyle = '#0b0004';
  o.fillRect(0, OH / 2 - 130, OW, 260);
  o.globalAlpha = a;
  o.save();
  o.translate(OW / 2, OH / 2 - 30);
  o.rotate((1 - ent) * 3);
  o.scale(ent, ent);
  dibujarInsignia(o, N.nivel, 0, 0, 150, G.t);
  o.restore();
  txt('¡NUEVO RANGO!', OW / 2, OH / 2 + 70, 26, '#ffe94a', 'center', 1);
  txt(TITULOS[N.nivel].n, OW / 2, OH / 2 + 104, 22, '#ffffff', 'center', 1);
  o.globalAlpha = 1;
}
