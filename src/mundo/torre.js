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
    enem: ['necro', 'chort', 'imp', 'masked', 'skelet', 'zhielo'],
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
    enem: ['orcW', 'masked', 'shaman', 'goblin', 'chort', 'necro'],
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
    enem: ['zhielo', 'orcW', 'shaman', 'necro', 'masked', 'chort'],
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
    enem: ['necro', 'shaman', 'orcW', 'masked', 'chort', 'zhielo'],
    planos: ['forja', 'trono', 'laberinto', 'cruz', 'pilares'],
  },
);
const zonaDePiso = n =>
  n <= 10 ? 0 : n <= 20 ? 1 : n <= 30 ? 2 : n <= 50 ? 3 : n <= 70 ? 4 : n <= 90 ? 5 : 6;
// Guardianes de cada diez pisos; el del piso 100 siempre es el Señor de las Cenizas.
const GUARDIANES = ['zombi', 'ogro', 'cenizas'];
const guardianDe = n => (n >= 100 ? 'cenizas' : GUARDIANES[(n / 10 - 1) % GUARDIANES.length]);

// Cada piso pega un poco más fuerte: enemigos con más vida, más enemigos, balas más rápidas y jefes más duros.
function difDePiso(n) {
  const b = DIFS[ELEGIDO.modo] || DIFS.normal;
  return Object.assign({}, b, {
    enem: b.enem * (1 + 0.06 * (n - 1)),
    cant: b.cant * Math.min(2.2, 1 + 0.025 * (n - 1)),
    olas: b.olas + (n > 40 ? 1 : 0) + (n > 80 ? 1 : 0),
    jefe: b.jefe * (1 + 0.3 * Math.floor((n - 1) / 10)),
    bala: b.bala * Math.min(1.45, 1 + 0.005 * n),
    cdJ: b.cdJ * Math.max(0.6, 1 - 0.006 * n),
  });
}

function iniciarTorre() {
  G.torre = 1;
  G.piso = 0;
  G.rangoPartida = 0;
  siguientePiso();
}

function siguientePiso() {
  const n = ++G.piso;
  G.zona = zonaDePiso(n);
  G.dif = difDePiso(n);
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
  if (n > (LOGROS.torre || 0)) guardarLogro('torre', n);
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
  if (!N) return;
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
