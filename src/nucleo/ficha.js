// Ficha del aventurero (como la hoja de estado de DanMachi): tu héroe con su traje, tu rango, nivel,
// las cinco habilidades, las técnicas que llevas, tu grimorio y tu traje, todo en una pantalla.
let fichaAnim = 0;
function mostrarEstado() {
  const E = estado(),
    pi = ELEGIDO.p,
    p = PERSONAJES[pi],
    rec = LOGROS.torre || 0,
    T = tituloDe(rec);
  document.getElementById('estadoNivel').textContent = 'Nivel ' + E.nivel;
  document.getElementById('estadoExp').style.width = (100 * E.exp) / expParaNivel(E.nivel) + '%';
  document.getElementById('estadoExpTxt').textContent =
    E.exp + ' de ' + expParaNivel(E.nivel) + ' de experiencia';
  document.getElementById('fichaNombre').textContent = p[ELEGIDO.sexo].n + ' · ' + p[ELEGIDO.sexo].clase;
  document.getElementById('fichaTitulo').textContent = T.n;
  document.getElementById('fichaRecord').textContent = rec
    ? 'Récord de la Torre: piso ' + rec
    : 'Todavía sin récord en la Torre';
  const ins = document.getElementById('fichaInsignia').getContext('2d');
  ins.clearRect(0, 0, 64, 70);
  dibujarInsignia(ins, nivelTitulo(rec), 32, 36, 60, 30);
  const L = document.getElementById('estadoLista');
  L.innerHTML = '';
  HABILIDADES.forEach(h => {
    const f = document.createElement('div');
    f.className = 'hab';
    f.innerHTML =
      '<b></b><span class="rango"></span><i class="barra-hab"><i></i></i><span class="val"></span>';
    f.title = h.d;
    f.querySelector('b').textContent = h.n;
    f.querySelector('.rango').textContent = rangoDe(E[h.id]);
    f.querySelector('.barra-hab i').style.width = (100 * E[h.id]) / 999 + '%';
    f.querySelector('.val').textContent = E[h.id];
    L.appendChild(f);
  });
  const TC = document.getElementById('fichaTecs');
  TC.innerHTML = '';
  tecsEquipadas(pi).forEach(id => {
    const d = document.createElement('span'),
      c = document.createElement('canvas');
    d.className = 'tec-ficha';
    c.width = c.height = 36;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    icono(x, id, 18, 18, 3);
    d.appendChild(c);
    d.appendChild(
      Object.assign(document.createElement('span'), { textContent: TEC[id].n + ' ' + ROMANO[forjaDe(id)] }),
    );
    TC.appendChild(d);
  });
  const gid = grimorioDe({ pid: pi }),
    g = grimorio(gid),
    gc = document.getElementById('fichaGrimorio').getContext('2d');
  gc.clearRect(0, 0, 40, 48);
  dibujarGrimorio(gc, g, hojasDe(gid, p.id), 20, 24, 40, 0);
  document.getElementById('fichaGrimTxt').textContent = g.n + ' · ' + hojasDe(gid, p.id) + ' hojas';
  const v = VESTUARIOS.find(x => x.id == ELEGIDO.vest);
  document.getElementById('fichaTraje').textContent = 'Traje: ' + (v ? v.n : 'Clásico');
  irAPanelSiHace('estado');
  cancelAnimationFrame(fichaAnim);
  animarFicha();
}
// El héroe de la ficha camina en su lugar y se da vuelta de a ratos.
function animarFicha() {
  if (document.getElementById('estado').hidden) return;
  const c = document.getElementById('fichaHeroe').getContext('2d'),
    t = Math.floor(performance.now() / 16),
    s = PERSONAJES[ELEGIDO.p][ELEGIDO.sexo],
    fr = s.spr.run[Math.floor(t / 8) % 4],
    cara = Math.floor(t / 150) % 2 ? -1 : 1;
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, 120, 150);
  c.fillStyle = 'rgba(0,0,0,.35)';
  c.beginPath();
  c.ellipse(60, 140, 22, 6, 0, 0, 7);
  c.fill();
  dibujarTraje(c, ELEGIDO.vest, 60, 142, cara, 5, t, 0);
  c.save();
  c.translate(60, 142);
  c.scale(cara, 1);
  c.drawImage(atlasVestuario(ELEGIDO.vest), fr[0], fr[1], 16, 28, -40, -138, 80, 140);
  c.restore();
  dibujarTraje(c, ELEGIDO.vest, 60, 142, cara, 5, t, 1);
  fichaAnim = requestAnimationFrame(animarFicha);
}
document.getElementById('estadoBtn').onclick = mostrarEstado;
document.getElementById('estadoVolver').onclick = () => volverDePanel('estado');
document.getElementById('fichaForja').onclick = () => {
  volverDePanel('estado');
  mostrarForja();
};
document.getElementById('fichaArmario').onclick = () => {
  volverDePanel('estado');
  espacioArmario = 0;
  mostrarArmario();
};

// Botonera del inicio.
document.getElementById('armarioMenuBtn').onclick = () => {
  espacioArmario = 0;
  mostrarArmario();
};
document.getElementById('grimMenuBtn').onclick = () => {
  abrirElegir();
  irPaso(3);
};
document.getElementById('ayudaBtn').onclick = () => irAPanel('ayuda');
document.getElementById('ayudaVolver').onclick = () => volverDePanel('ayuda');

// Placa del inicio: tu héroe, tu rango y tu nivel (se repinta solo si algo cambió).
let placaHecha = '';
function pintarPlaca() {
  const E = estado(),
    rec = LOGROS.torre || 0,
    p = PERSONAJES[ELEGIDO.p],
    clave = [E.nivel, E.exp, rec, ELEGIDO.p, ELEGIDO.sexo].join();
  if (clave == placaHecha) return;
  placaHecha = clave;
  document.getElementById('placaNombre').textContent = p[ELEGIDO.sexo].n + ' · Nivel ' + E.nivel;
  document.getElementById('placaTitulo').textContent = tituloDe(rec).n;
  document.getElementById('placaExp').style.width = (100 * E.exp) / expParaNivel(E.nivel) + '%';
  const x = document.getElementById('placaInsignia').getContext('2d');
  x.clearRect(0, 0, 48, 52);
  dibujarInsignia(x, nivelTitulo(rec), 24, 27, 46, 0);
}
setInterval(pintarPlaca, 500);
pintarPlaca();
