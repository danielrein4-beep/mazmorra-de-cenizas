// Salas: suelo y paredes, oleadas, puerta, pócimas, paso a la siguiente sala y mejoras tras cada jefe.
function buildFloor(i){const S=SALAS[i];fx.fillStyle='#120c18';fx.fillRect(0,0,WW,WH);let s=7+i*31;const r=()=>(s=(s*16807)%2147483647)/2147483647;
for(let ty=2;ty<19;ty++)for(let tx=1;tx<29;tx++)tile(fx,R.floors[Math.floor(r()*R.floors.length)],tx,ty);
for(let tx=0;tx<30;tx++){tile(fx,R.wallTop,tx,0);tile(fx,R.wallMid,tx,1);tile(fx,R.wallTop,tx,19)}
for(let ty=0;ty<20;ty++){tile(fx,R.wallTop,0,ty);tile(fx,R.wallTop,29,ty)}
[4,10,19,25].forEach(tx=>tile(fx,R[S.banner],tx,1));[7,22].forEach(tx=>tile(fx,R.fTop,tx,0));
for(let k=0;k<3;k++)tile(fx,R.skull,2+Math.floor(r()*26),4+Math.floor(r()*14))}
function entrarSala(i){G.sala=i;resetSala();buildFloor(i);const S=SALAS[i],P=G.P;P.x=240;P.y=290;P.dash=0;G.cam={x:240,y:240};
if(S.tipo=='pelea'){G.olaT=70;G.aviso={txt:S.n,l:90};musica('sala')}
else{G.B=crearJefe(S.jefe);G.intro={t:0};musica(S.jefe=='cenizas'?'final':'jefe_'+S.jefe)}}
function abrirPuerta(txt){G.clear=1;G.door=1;G.aviso={txt,l:100};sfx('door');burst(240,30,30,'#ffe94a',2.5);ring(240,30,24,'#ffe94a',16);if(SALAS[G.sala].tipo=='pelea')G.pick.push({x:240,y:170,t:0})}
function updateSala(){const S=SALAS[G.sala],P=G.P;if(G.fade>0&&!G.salir)G.fade=Math.max(0,G.fade-.05);
if(S.tipo=='pelea'&&!G.clear&&!G.over){if(G.olaT>0){if(--G.olaT==0){const L=S.oleadas[G.ola];L.forEach((k,j)=>{const a=j/L.length*6.283+rnd(-.3,.3);const [x,y]=enSala(240+Math.cos(a)*rnd(80,150),150+Math.sin(a)*rnd(40,80));spawnEnemigo(k,x,y)})}}
else if(!G.enem.length&&!G.spawns.length){if(G.ola<S.oleadas.length-1){G.ola++;G.olaT=60;G.aviso={txt:'Oleada '+(G.ola+1),l:60}}else abrirPuerta('Sala despejada')}}
G.pick.forEach(p=>{p.t++;if(Math.hypot(P.x-p.x,P.y-p.y)<10&&P.hp<P.max){p.d=1;P.hp=Math.min(P.max,P.hp+2);burst(p.x,p.y-6,16,'#ff4a5a',2);ring(p.x,p.y-6,12,'#ff8a9a',12);sfx('pick')}});G.pick=G.pick.filter(p=>!p.d);
if(G.door&&!G.salir&&P.y<38&&P.x>229&&P.x<251){G.salir=1;sfx('door')}
if(G.salir){G.fade+=.05;P.y-=.6;P.moving=true;if(G.fade>=1.2)entrarSala(G.sala+1)}}
function drawSala(){const t=G.t,S=SALAS[G.sala],fi=Math.floor(t/10)%3;[7,22].forEach(tx=>{tile(w,R['fMid'+S.fuente][fi],tx,1);tile(w,R['fBasin'+S.fuente][fi],tx,2)});
const dr=G.door?R.doorOpen:R.doorClosed;w.drawImage(atlas,16,240,16,32,208,0,16,32);w.drawImage(atlas,64,240,16,32,256,0,16,32);w.drawImage(atlas,dr[0],dr[1],32,32,224,0,32,32);
if(G.door&&!G.salir){const b=Math.round(Math.sin(t*.12)*2);w.fillStyle='#ffe94a';w.beginPath();w.moveTo(240,40+b);w.lineTo(235,46+b);w.lineTo(245,46+b);w.fill()}}
function jefeDerrotado(){G.slow=1;G.slowT=0;G.zt=zb();if(G.sala==SALAS.length-1){end(true);return}mostrarMejoras()}
function mostrarMejoras(){const P=G.P;running=false;mouse.down=false;keys={};touch.move=touch.aim=null;
const pool=MEJORAS.filter(m=>m.id!='cura'&&(P.mej[m.id]||0)<m.max).sort(()=>Math.random()-.5);const ops=pool.slice(0,P.hp<P.max?2:3);if(P.hp<P.max)ops.push(MEJORAS.find(m=>m.id=='cura'));
const L=document.getElementById('mejorasLista');L.innerHTML='';ops.forEach((m,i)=>{const b=document.createElement('button');b.className='carta';const nv=(P.mej[m.id]||0)+1;
b.innerHTML='<span class="tecla">'+(i+1)+'</span><strong></strong><span class="desc"></span>';b.querySelector('strong').textContent=m.n+(m.max>1&&m.max<99?' '+'I'.repeat(nv):'');b.querySelector('.desc').textContent=m.d;
b.onclick=()=>elegirMejora(m);L.appendChild(b)});document.getElementById('mejoras').hidden=false;L.querySelector('button')?.focus()}
function elegirMejora(m){const P=G.P;P.mej[m.id]=(P.mej[m.id]||0)+1;if(m.id=='corazon'){P.max+=2;P.hp=P.max}else if(m.id=='cura')P.hp=P.max;else P.hp=Math.min(P.max,P.hp+2);
document.getElementById('mejoras').hidden=true;running=true;last=0;musica('sala');abrirPuerta(m.n)}
