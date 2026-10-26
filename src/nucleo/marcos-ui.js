// En el Armario: los marcos del nombre. Toca uno tuyo para ponértelo; los de cenizas se compran con dos
// toques (el primero dice el precio), y los de hazañas dicen qué hay que lograr.
let marcoAComprar = null;
function pintarMarcos() {
  const L = document.getElementById('marcosLista'),
    aviso = document.getElementById('armarioAviso'),
    nombre = LOGROS.apodo || PERSONAJES[ELEGIDO.p][ELEGIDO.sexo].n;
  L.innerHTML = '';
  MARCOS.forEach(M => {
    const b = document.createElement('button'),
      c = document.createElement('canvas'),
      tiene = tengoMarco(M),
      puesto = (LOGROS.marco || 'sencillo') == M.id;
    b.type = 'button';
    b.className = 'marco' + (puesto ? ' puesto' : '') + (tiene ? '' : ' bloqueado');
    c.width = 180;
    c.height = 44;
    b.appendChild(c);
    const info = document.createElement('span');
    info.innerHTML = '<b></b><small></small>';
    info.querySelector('b').textContent = M.n;
    info.querySelector('small').textContent = puesto
      ? 'Puesto'
      : tiene
        ? 'Tuyo · toca para ponerlo'
        : M.precio
          ? M.precio + ' cenizas'
          : M.pide;
    b.appendChild(info);
    b.onclick = () => {
      if (tiene) {
        guardarLogro('marco', M.id);
        sfx('cofre');
        return pintarMarcos();
      }
      if (!M.precio) return (aviso.textContent = M.n + ': ' + M.pide + '.');
      if (cenizasTengo() < M.precio)
        return (aviso.textContent =
          M.n + ' cuesta ' + M.precio + ' cenizas y tienes ' + cenizasTengo() + '.');
      if (marcoAComprar != M.id) {
        marcoAComprar = M.id;
        return (aviso.textContent = M.n + ' cuesta ' + M.precio + ' cenizas. Toca otra vez para comprarlo.');
      }
      guardarLogro('polvo', cenizasTengo() - M.precio);
      guardarLogro('marcos', (LOGROS.marcos || []).concat([M.id]));
      guardarLogro('marco', M.id);
      marcoAComprar = null;
      aviso.textContent = '¡Compraste el marco ' + M.n + '!';
      sfx('cofre');
      pintarMarcos();
    };
    L.appendChild(b);
    vistaMarco(c, nombre, M.id);
  });
}
// Vista previa animada de cada marco mientras el Armario está abierto.
function vistaMarco(c, nombre, id) {
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  let t = 0;
  const paso = () => {
    if (!c.isConnected || document.getElementById('armario').hidden) return;
    x.clearRect(0, 0, c.width, c.height);
    dibujarPlacaNombre(x, c.width / 2, c.height - 6, nombre, id, t++, 2);
    setTimeout(paso, 50);
  };
  paso();
}
