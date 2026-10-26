// Salas: oleadas, puerta, paso a la siguiente sala, tiendas y mejoras tras cada jefe.
function entrarSala(i){G.sala=i;resetSala();buildFloor(i);const S=SALAS[i],P=G.P;P.x=240;P.y=290;P.dash=0;G.cam={x:240,y:240};
if(S.tipo=='pelea'){G.olaT=70;G.aviso={txt:S.n,l:90};musica('sala')}
else if(S.tipo=='tienda'){ponerTienda();G.door=1;G.clear=1;G.aviso={txt:S.n,l:90};musica('sala')}
else{G.B=crearJefe(S.jefe);G.intro={t:0};musica(S.jefe=='cenizas'?'final':'jefe_'+S.jefe)}}
function abrirPuerta(txt){G.clear=1;G.door=1;G.aviso={txt,l:100};sfx('door');burst(240,30,30,'#ffe94a',2.5);ring(240,30,24,'#ffe94a',16);premioSala()}
function updateSala(){const S=SALAS[G.sala],P=G.P;if(G.fade>0&&!G.salir)G.fade=Math.max(0,G.fade-.05);
if(S.tipo=='pelea'&&!G.clear&&!G.over){if(G.olaT>0){if(--G.olaT==0){const L=S.oleadas[G.ola];L.forEach((k,j)=>{const a=j/L.length*6.283+rnd(-.3,.3);const [x,y]=lugarLibre(...enSala(240+Math.cos(a)*rnd(80,150),150+Math.sin(a)*rnd(40,80)));spawnEnemigo(k,x,y)})}}
else if(!G.enem.length&&!G.spawns.length){if(G.ola<S.oleadas.length-1){G.ola++;G.olaT=60;G.aviso={txt:'Oleada '+(G.ola+1),l:60}}else abrirPuerta('Sala despejada')}}
if(G.door&&!G.salir&&P.y<38&&P.x>229&&P.x<251){G.salir=1;sfx('door')}
if(G.salir){G.fade+=.05;P.y-=.6;P.moving=true;if(G.fade>=1.2)entrarSala(G.sala+1)}}
function drawSala(){const t=G.t,S=SALAS[G.sala],fi=Math.floor(t/10)%3;[7,22].forEach(tx=>{tile(w,R['fMid'+S.fuente][fi],tx,1);tile(w,R['fBasin'+S.fuente][fi],tx,2)});
const dr=G.door?R.doorOpen:R.doorClosed;w.drawImage(atlas,16,240,16,32,208,0,16,32);w.drawImage(atlas,64,240,16,32,256,0,16,32);w.drawImage(atlas,dr[0],dr[1],32,32,224,0,32,32);
if(G.door&&!G.salir){const b=Math.round(Math.sin(t*.12)*2);w.fillStyle='#ffe94a';w.beginPath();w.moveTo(240,40+b);w.lineTo(235,46+b);w.lineTo(245,46+b);w.fill()}}
function jefeDerrotado(){G.slow=1;G.slowT=0;G.zt=zb();const antes=VESTUARIOS.filter(desbloqueado).length;guardarLogro(G.B.id);if(VESTUARIOS.filter(desbloqueado).length>antes)G.vestNuevo=1;if(G.sala==SALAS.length-1){end(true);return}mostrarMejoras()}
function mostrarMejoras(){const P=G.P;running=false;mouse.down=false;keys={};touch.move=touch.aim=null;
const MJ=mejorasDe(),pool=MJ.filter(m=>m.id!='cura'&&(P.mej[m.id]||0)<m.max).sort(()=>Math.random()-.5);const ops=pool.slice(0,P.hp<P.max?2:3);if(P.hp<P.max)ops.push(MJ.find(m=>m.id=='cura'));
const L=document.getElementById('mejorasLista');L.innerHTML='';ops.forEach((m,i)=>{const b=document.createElement('button');b.className='carta';const nv=(P.mej[m.id]||0)+1;
b.innerHTML='<span class="cab"><canvas width="48" height="48"></canvas><span class="tecla">'+(i+1)+'</span></span><strong></strong><span class="desc"></span>';const cx=b.querySelector('canvas').getContext('2d');cx.imageSmoothingEnabled=false;icono(cx,m.ico,24,24,4);b.querySelector('strong').textContent=m.n+(m.max>1&&m.max<99?' '+'I'.repeat(nv):'');b.querySelector('.desc').textContent=m.d;
b.onclick=()=>elegirMejora(m);L.appendChild(b)});document.querySelector('#mejoras p').textContent=G.vestNuevo?'El jefe cayó y desbloqueaste un vestuario nuevo. Toma una mejora para lo que viene.':'El jefe cayó. Toma una mejora para lo que viene.';G.vestNuevo=0;document.getElementById('mejoras').hidden=false;L.querySelector('button')?.focus()}
function elegirMejora(m){const P=G.P;P.mej[m.id]=(P.mej[m.id]||0)+1;if(m.id=='corazon'){P.max+=2;P.hp=P.max}else if(m.id=='cura')P.hp=P.max;else P.hp=Math.min(P.max,P.hp+2);
document.getElementById('mejoras').hidden=true;running=true;last=0;musica('sala');abrirPuerta(m.n)}
