// Cuarto actual: oleadas de enemigos, fuentes animadas, paso a la zona siguiente y mejoras tras cada jefe.
function updateSala(){const P=G.P;if(G.fade>0&&!G.salir)G.fade=Math.max(0,G.fade-.05);
if(G.oleadas&&G.cerrado&&!G.B&&!G.over){if(G.olaT>0){if(--G.olaT==0){const L=G.oleadas[G.ola];L.forEach((k,j)=>{const a=j/L.length*6.283+rnd(-.3,.3);const [x,y]=lugarLibre(...enSala(240+Math.cos(a)*rnd(80,150),160+Math.sin(a)*rnd(40,80)));spawnEnemigo(k,x,y)})}}
else if(!G.enem.length&&!G.spawns.length){if(G.ola<G.oleadas.length-1){G.ola++;G.olaT=55;G.aviso={txt:'Oleada '+(G.ola+1),l:60}}else cuartoLimpio()}}
updateMundo();
if(G.salir){G.fade+=.04;P.moving=true;if(G.fade>=1.2){G.salir=0;entrarZona(G.zona+1)}}}
function drawSala(){const t=G.t,Z=ZONAS[G.zona],fi=Math.floor(t/10)%3;[7,22].forEach(tx=>{tile(w,R['fMid'+Z.fuente][fi],tx,1);tile(w,R['fBasin'+Z.fuente][fi],tx,2)});drawPuertas()}
function jefeDerrotado(){G.slow=1;G.slowT=0;G.zt=zb();const antes=VESTUARIOS.filter(desbloqueado).length;guardarLogro(G.B.id);if(G.zona==ZONAS.length-1&&G.dif.id=='pesadilla')guardarLogro('pesadilla');
if(VESTUARIOS.filter(desbloqueado).length>antes)G.vestNuevo=1;if(G.zona==ZONAS.length-1){end(true);return}mostrarMejoras()}
function mostrarMejoras(k){k=k||0;G.elige=k;const P=G.jug[k];running=false;mouse.down=false;keys={};touch.move=touch.aim=null;
const MJ=mejorasDe(PERSONAJES[P.pid]),pool=MJ.filter(m=>m.id!='cura'&&(P.mej[m.id]||0)<m.max).sort(()=>Math.random()-.5);const ops=pool.slice(0,P.hp<P.max?2:3);if(P.hp<P.max)ops.push(MJ.find(m=>m.id=='cura'));
const L=document.getElementById('mejorasLista');L.innerHTML='';ops.forEach((m,i)=>{const b=document.createElement('button');b.className='carta';const nv=(P.mej[m.id]||0)+1;
b.innerHTML='<span class="cab"><canvas width="48" height="48"></canvas><span class="tecla">'+(i+1)+'</span></span><strong></strong><span class="desc"></span>';const cx=b.querySelector('canvas').getContext('2d');cx.imageSmoothingEnabled=false;icono(cx,m.ico,24,24,4);b.querySelector('strong').textContent=m.n+(m.max>1&&m.max<99?' '+'I'.repeat(nv):'');b.querySelector('.desc').textContent=m.d;
b.onclick=()=>elegirMejora(m);L.appendChild(b)});document.querySelector('#mejoras p').textContent=(G.coop?'Jugador '+(k+1)+', '+P.nombre+'. ':'')+(G.vestNuevo?'El jefe cayó y desbloqueaste un vestuario nuevo. Toma una mejora para lo que viene.':'El jefe cayó. Toma una mejora para lo que viene.');if(!G.coop||k==1)G.vestNuevo=0;document.getElementById('mejoras').hidden=false;L.querySelector('button')?.focus()}
function elegirMejora(m){const P=G.jug[G.elige||0];P.mej[m.id]=(P.mej[m.id]||0)+1;if(m.id=='corazon'){P.max+=2;P.hp=P.max}else if(m.id=='cura')P.hp=P.max;else P.hp=Math.min(P.max,P.hp+2);if(G.coop&&!G.elige){mostrarMejoras(1);return}revivirTodos();
document.getElementById('mejoras').hidden=true;running=true;last=0;musica('sala');G.room.limpio=true;G.cerrado=0;G.B=null;ponerEscalera();ponerCofre(200,200,false);G.aviso={txt:'Baja por la escalera',l:110}}
