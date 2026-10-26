// Los tres jefes: datos, ataques, daño, cambio de fase y dibujo.
const JEFES={
zombi:{n:'Rey Podrido',sub:'Señor del pantano',idle:f4(16,332,32,36),run:f4(144,332,32,36),hp:1200,sp:.45,fases:[[.5,'¡Grrraaah!']],
 ataques:{1:['vomito','golpe','horda','vomito'],2:['vomito','golpe','horda','lluvia','golpe','lluvia']}},
ogro:{n:'Gruk el Machacador',sub:'Guardián del foso',idle:f4(16,380,32,36),run:f4(144,380,32,36),hp:1400,sp:.6,fases:[[.5,'¡GRUK APLASTA!']],
 ataques:{1:['salto','roca','giro','salto'],2:['salto2','roca','giro','salto2','roca']}},
cenizas:{n:'Señor de las Cenizas',sub:'Dueño de la mazmorra',idle:f4(16,428,32,36),run:f4(144,428,32,36),hp:1600,sp:.6,fases:[[.66,'¡Insolente!'],[.33,'¡ARDE CONMIGO!']],
 ataques:{1:['ring','fan','ring','spiral'],2:['spiral','charge','fan','ring2','charge'],3:['charge','spiral2','imps','ring2','fan','charge']}}};
function crearJefe(id){const d=JEFES[id];return{id,def:d,x:240,y:150,z:0,hp:d.hp,max:d.hp,phase:1,st:'move',t:0,cd:90,tx:240,ty:120,face:1,hit:0,moving:false,ang:0,dir:[0,0],dead:0,dt:0,say:'',sayT:0,tele:null,n:0}}
function limpiarBalas(){G.bul.forEach(b=>burst(b.x,b.y,3,b.c,1.5));G.bul=[];G.marcas=[]}
function hurtBoss(d,heavy,quieto){const B=G.B;if(!B||B.dead)return;B.hp-=d;if(!quieto){B.hit=4;sfx('hit')}num(B.x,B.y-B.z-70,d,d>=100);
if(heavy){G.shake=Math.max(G.shake,heavy);G.stop=Math.max(G.stop,Math.round(heavy/2))}
const f=B.def.fases[B.phase-1];if(f&&B.hp>0&&B.hp<B.max*f[0])fase(f[1]);
if(B.hp<=0){B.hp=0;B.dead=1;B.dt=0;B.z=0;B.tele=null;limpiarBalas();G.enem.forEach(m=>{m.hp=0});G.spawns=[];G.slow=.35;G.slowT=9999;G.zt=1.3;sfx('roar');musica(null)}}
function fase(txt){const B=G.B;B.phase++;B.st='move';B.t=0;B.cd=70;B.z=0;B.tele=null;B.say=txt;B.sayT=110;G.stop=20;G.shake=14;G.flash=6;G.fcol='#ff3a2a';limpiarBalas();ring(B.x,B.y-30,60,'#ff3a2a',20,3);sfx('roar')}
function bossFire(n,spd,off,col,cx,cy){for(let i=0;i<n;i++){const a=off+i*6.283/n;G.bul.push({x:cx,y:cy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,c:col,r:3})}}
function aimFan(n,spd,spread,col,cx,cy){const P=G.P,a0=Math.atan2(P.y-10-cy,P.x-cx);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*spread;G.bul.push({x:cx,y:cy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,c:col,r:3,big:1})}}
const enSala=(x,y)=>[Math.max(50,Math.min(430,x)),Math.max(60,Math.min(290,y))];
// Cada ataque recibe el jefe, el centro del cuerpo y el multiplicador de furia; devuelve true al terminar.
const ATAQUES={
ring:(B,cx,cy,f)=>{if(B.t==1){bossFire(18+B.phase*4,1.3*f,rnd(0,1),'#ff3fd2',cx,cy);ring(cx,cy,30,'#ff3fd2',12)}return B.t>30},
ring2:(B,cx,cy,f)=>{if(B.t%16==1&&B.t<40)bossFire(20,1.5*f,B.t*.1,B.t%32==1?'#ff3fd2':'#ff5a3c',cx,cy);return B.t>50},
fan:(B,cx,cy,f)=>{if(B.t%12==1&&B.t<36)aimFan(B.phase==3?7:5,2.3*f,.16,'#ffe94a',cx,cy);return B.t>45},
spiral:(B,cx,cy,f)=>{if(B.t%4==0){B.ang+=.27;for(let k=0;k<2;k++){const a=B.ang+k*3.1416;G.bul.push({x:cx,y:cy,vx:Math.cos(a)*1.6*f,vy:Math.sin(a)*1.6*f,c:k?'#ff5a3c':'#ff3fd2',r:3})}}return B.t>110},
spiral2:(B,cx,cy,f)=>{if(B.t%4==0){B.ang+=.27;for(let k=0;k<4;k++){const a=B.ang+k*1.5708;G.bul.push({x:cx,y:cy,vx:Math.cos(a)*1.6*f,vy:Math.sin(a)*1.6*f,c:k%2?'#ff5a3c':'#ff3fd2',r:3})}}return B.t>110},
charge:(B,cx,cy,f)=>{const P=G.P;if(B.t==1){const a=Math.atan2(P.y-B.y,P.x-B.x);B.dir=[Math.cos(a),Math.sin(a)];B.face=B.dir[0]<0?-1:1}
if(B.t<42){G.shake=Math.max(G.shake,1);return false}B.moving=true;const nx=B.x+B.dir[0]*6.5,ny=B.y+B.dir[1]*6.5;
if(nx<40||nx>WW-40||ny<60||ny>WH-24||B.t>90){G.shake=12;G.stop=5;sfx('land');burst(B.x,B.y-10,40,'#ff8a2a',4);ring(B.x,B.y,40,'#ff8a2a',14,3);decal(B.x,B.y+2,18,'#140806',400);bossFire(16,1.6,0,'#ff5a3c',B.x,B.y-20);return true}
B.x=nx;B.y=ny;if(B.t%2==0)G.ghosts.push({boss:1,x:B.x,y:B.y,face:B.face,l:12,fr:B.def.run[0]});return false},
imps:(B)=>{if(B.t==20)for(let i=0;i<3;i++){const a=i*2.09;spawnEnemigo('imp',...enSala(B.x+Math.cos(a)*40,B.y+Math.sin(a)*24))}return B.t>40},
vomito:(B,cx,cy,f)=>{const P=G.P;B.moving=false;if(B.t%3==0&&B.t<70){const a=Math.atan2(P.y-10-cy,P.x-cx)+rnd(-.3,.3);G.bul.push({x:cx,y:cy+6,vx:Math.cos(a)*2.1*f,vy:Math.sin(a)*2.1*f,c:'#7cff4a',r:3,charco:Math.round(rnd(40,70))})}
if(B.t%4==0)burst(cx,cy+6,4,'#7cff4a',1.5,16);return B.t>85},
golpe:(B,cx,cy,f)=>{if(B.t<40){B.tele={x:B.x,y:B.y,r:8+B.t*1.4,c:'#7cff4a'};G.shake=Math.max(G.shake,.8)}
if(B.t==40){B.tele=null;G.shake=12;G.stop=4;sfx('land');bossFire(24,1.4*f,0,'#7cff4a',B.x,B.y-10);ring(B.x,B.y,60,'#7cff4a',18,3);decal(B.x,B.y+2,26,'#14240a',500);burst(B.x,B.y,30,'#6a5a3a',3,30,2,.1)}
if(B.t==56)bossFire(24,1.1*f,.13,'#b4ff8a',B.x,B.y-10);return B.t>75},
horda:(B)=>{if(B.t==15){for(let i=0;i<4;i++){const a=i*1.571+.4;spawnEnemigo('tiny',...enSala(B.x+Math.cos(a)*44,B.y+Math.sin(a)*28))}ring(B.x,B.y,40,'#9a3aff',16)}return B.t>40},
lluvia:(B)=>{const P=G.P;if(B.t%8==0&&B.t<90){const [x,y]=enSala(P.x+rnd(-50,50),P.y+rnd(-40,40));G.marcas.push({x,y,t:45})}return B.t>100},
salto:(B,cx,cy,f)=>{const P=G.P,T=50;if(B.t==1){B.j0=[B.x,B.y];B.j1=enSala(P.x,P.y);sfx('throw');burst(B.x,B.y,20,'#8a7a6a',2.5,24,2,.1)}
if(B.t<=T){const k=B.t/T;B.x=B.j0[0]+(B.j1[0]-B.j0[0])*k;B.y=B.j0[1]+(B.j1[1]-B.j0[1])*k;B.z=Math.sin(Math.PI*k)*90;B.tele={x:B.j1[0],y:B.j1[1],r:30,c:'#ff3a2a'}}
if(B.t==T){B.z=0;B.tele=null;G.shake=16;G.stop=6;sfx('land');bossFire(f>1?28:22,1.6*f,rnd(0,1),'#ffb04a',B.x,B.y-8);ring(B.x,B.y,70,'#ffb04a',20,4);decal(B.x,B.y+2,30,'#1a120a',600);burst(B.x,B.y,40,'#8a7a6a',3.5,34,2,.12);if(Math.hypot(P.x-B.x,P.y-B.y)<34)hurtPlayer()}
if(B.t>T+20){if(B.st=='salto2'&&!B.n){B.n=1;B.t=0;return false}return true}return false},
roca:(B,cx,cy,f)=>{const P=G.P,tira=t2=>{const a=Math.atan2(P.y-10-cy,P.x-cx);G.bul.push({x:cx,y:cy-10,vx:Math.cos(a)*1.9,vy:Math.sin(a)*1.9,c:'#a08070',r:7,split:60,n:f>1?12:8});sfx('throw');burst(cx,cy-10,10,'#8a7a6a',2)};
if(B.t==18)tira();if(f>1&&B.t==40)tira();return B.t>(f>1?60:36)},
giro:(B,cx,cy,f)=>{const P=G.P,d=Math.max(1,Math.hypot(P.x-B.x,P.y-B.y));B.moving=true;const nx=B.x+(P.x-B.x)/d*1.25*f,ny=B.y+(P.y-B.y)/d*1.25*f;[B.x,B.y]=enSala(nx,ny);B.face=Math.floor(B.t/4)%2?1:-1;
if(B.t%5==0){B.ang+=.5;for(let k=0;k<3;k++){const a=B.ang+k*2.094;G.bul.push({x:cx,y:cy,vx:Math.cos(a)*1.5*f,vy:Math.sin(a)*1.5*f,c:'#ffb04a',r:3})}}if(B.t%3==0)burst(B.x,B.y,2,'#8a7a6a',1.2,14);return B.t>90}};
ATAQUES.salto2=ATAQUES.salto;
function toMove(){const B=G.B,ul=B.phase>B.def.fases.length;B.st='move';B.t=0;B.z=0;B.tele=null;B.cd=ul?rnd(35,60):rnd(55,90)}
function updateJefe(){const B=G.B,P=G.P;if(B.hit>0)B.hit--;if(B.sayT>0)B.sayT--;
if(G.intro){G.intro.t++;G.zt=1.35;if(G.intro.t==40){G.shake=12;sfx('roar');ring(B.x,B.y-30,70,'#ff3a2a',24,3)}if(G.intro.t>=120){G.intro=null;G.zt=zb()}return}
if(B.dead){B.dt++;if(B.dt%6==0&&B.dt<100){burst(B.x+rnd(-24,24),B.y-rnd(10,60),26,Math.random()<.5?'#ff8a2a':'#ffe94a',3.5);ring(B.x+rnd(-20,20),B.y-rnd(10,50),18,'#ffe94a',10);G.shake=8;sfx('boom')}
if(B.dt==100){burst(B.x,B.y-34,220,'#ff5a3c',7,60,2);burst(B.x,B.y-34,90,'#ffffff',5,60);ring(B.x,B.y-30,90,'#ffffff',26,4);decal(B.x,B.y+2,34,'#140806',2000);G.flash=10;G.fcol='#ffffff';G.inv=6;G.shake=24;sfx('boom')}
if(B.dt==170)jefeDerrotado();return}
G.marcas.forEach(m=>{if(--m.t<=0){m.d=1;bossFire(8,1.3,rnd(0,1),'#7cff4a',m.x,m.y-4);burst(m.x,m.y,16,'#7cff4a',2.5);ring(m.x,m.y,16,'#7cff4a',10);decal(m.x,m.y+2,8,'#14240a',300);sfx('hit')}});G.marcas=G.marcas.filter(m=>!m.d);
const vel=estados(B,B.x,B.y-B.z-34);if(G.U||G.over)return;B.t++;const ul=B.phase>B.def.fases.length,f=ul?1.3:1,cx=B.x,cy=B.y-B.z-34;
if(B.st=='move'){if(Math.hypot(B.tx-B.x,B.ty-B.y)<6){B.tx=rnd(80,400);B.ty=rnd(70,200)}const d=Math.max(1,Math.hypot(B.tx-B.x,B.ty-B.y)),sp=B.def.sp*(ul?1.5:1)*vel;B.moving=true;B.x+=(B.tx-B.x)/d*sp;B.y+=(B.ty-B.y)/d*sp;
if(--B.cd<=0){const L=B.def.ataques[B.phase];B.st=L[Math.floor(Math.random()*L.length)];B.t=0;B.moving=false;B.n=0}}
else if(ATAQUES[B.st](B,cx,cy,f))toMove();
if(B.st!='charge'&&B.st!='giro')B.face=P.x<B.x?-1:1;
if(B.z<10&&Math.hypot(P.x-B.x,P.y-B.y+14)<22)hurtPlayer()}
function drawJefe(){const B=G.B,t=G.t;if(B.dead&&B.dt>=100)return;
if(B.tele){const tl=B.tele;w.globalAlpha=.25;w.fillStyle=tl.c;w.beginPath();w.ellipse(tl.x,tl.y,tl.r,tl.r*.4,0,0,7);w.fill();w.globalAlpha=1;w.strokeStyle=t%6<3?tl.c:'#ffffff';w.lineWidth=1;w.beginPath();w.ellipse(tl.x,tl.y,tl.r,tl.r*.4,0,0,7);w.stroke()}
const sh=Math.max(.3,1-B.z/120);w.fillStyle='rgba(0,0,0,.35)';w.beginPath();w.ellipse(B.x,B.y,20*sh,5*sh,0,0,7);w.fill();
const fr=(B.moving?B.def.run:B.def.idle)[Math.floor(t/(B.moving?6:10))%4],jx=(B.st=='charge'&&B.t<42)||(B.st=='roca'&&B.t<18)||(G.intro&&G.intro.t>40&&G.intro.t<70)?rnd(-1.5,1.5):0,y=B.y-B.z;
spr(w,B.dead&&t%4<2?white:atlas,fr,B.x+jx,y,B.face<0,2);if(B.hit>2)spr(w,white,fr,B.x+jx,y,B.face<0,2);
if(B.frio>0){w.globalAlpha=.45;spr(w,cyan,fr,B.x+jx,y,B.face<0,2);w.globalAlpha=1}
if(B.phase>B.def.fases.length&&!B.dead){w.globalAlpha=.22+Math.sin(t*.2)*.1;spr(w,red,fr,B.x+jx,y,B.face<0,2);w.globalAlpha=1}
if(B.st=='charge'&&B.t<42&&!B.dead){w.strokeStyle=B.t%6<3?'rgba(255,58,42,.8)':'rgba(255,233,74,.5)';w.lineWidth=2;w.setLineDash([4,3]);w.beginPath();w.moveTo(B.x,B.y-10);w.lineTo(B.x+B.dir[0]*400,B.y-10+B.dir[1]*400);w.stroke();w.setLineDash([])}}
