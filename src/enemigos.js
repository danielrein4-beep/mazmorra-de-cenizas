// Enemigos comunes y balas enemigas (también las de los jefes).
function spawnEnemigo(k,x,y){G.spawns.push({k,x,y,t:40});sfx('spawn')}
function enemBala(m,n,spd,spread,c){const P=G.P,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*spread;G.bul.push({x:m.x,y:m.y-10,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,c,r:3})}}
function updateEnemigos(){const P=G.P,quieto=G.U||G.intro||G.over;
G.spawns.forEach(s=>{s.t--;if(s.t%3==0){const a=Math.random()*6.283;G.pt.push({x:s.x+Math.cos(a)*14,y:s.y+Math.sin(a)*6,vx:-Math.cos(a)*.6,vy:-Math.sin(a)*.3-.3,l:16,m:16,c:'#9a3aff',s:1,g:0})}
if(s.t<=0){s.d=1;const d=ENEMIGOS[s.k];G.enem.push({k:s.k,def:d,x:s.x,y:s.y,h:d.run[0][3],hp:d.hp,max:d.hp,hit:0,face:1,t:0,cd:rnd(50,110),kx:0,ky:0,st:'',stT:0});burst(s.x,s.y-6,16,'#9a3aff',2);ring(s.x,s.y,12,'#c08aff',10)}});
G.spawns=G.spawns.filter(s=>!s.d);
G.enem.forEach(m=>{m.t++;if(m.hit>0)m.hit--;const vel=estados(m,m.x,m.y-m.h/2),dx=P.x-m.x,dy=P.y-m.y,dist=Math.hypot(dx,dy)||1,ux=dx/dist,uy=dy/dist;let vx=0,vy=0;
if(!quieto){const ia=m.def.ia,sp=m.def.sp;m.face=dx<0?-1:1;
if(m.st=='tele'){if(--m.stT<=0){m.st='carga';m.stT=22;m.dir=[ux,uy]}}
else if(m.st=='carga'){vx=m.dir[0]*3.2;vy=m.dir[1]*3.2;if(G.t%2==0)burst(m.x,m.y,2,'#8a7a6a',1,12);if(--m.stT<=0)m.st=''}
else{if(ia=='perseguir'||ia=='embestir'||ia=='abanico'){vx=ux*sp;vy=uy*sp}
else{const want=ia=='anillo'?130:95,s2=dist<want-15?-1:dist>want+15?1:0,o2=Math.sin(m.t*.02)*.5;vx=ux*sp*s2-uy*sp*o2;vy=uy*sp*s2+ux*sp*o2}
if(--m.cd<=0){if(ia=='tirador'){enemBala(m,1,1.9,0,'#ff5a3c');m.cd=rnd(80,120)}
else if(ia=='abanico'){enemBala(m,3,1.7,.22,'#ffe94a');m.cd=rnd(100,130)}
else if(ia=='anillo'){const a0=rnd(0,1);for(let i=0;i<10;i++){const a=a0+i*.628;G.bul.push({x:m.x,y:m.y-10,vx:Math.cos(a)*1.2,vy:Math.sin(a)*1.2,c:'#ff3fd2',r:3})}ring(m.x,m.y-10,14,'#ff3fd2',10);m.cd=rnd(140,170)}
else if(ia=='embestir'&&dist<150){m.st='tele';m.stT=26;m.cd=rnd(110,150)}else m.cd=rnd(60,100)}}
G.enem.forEach(n2=>{if(n2!==m){const ex=m.x-n2.x,ey=m.y-n2.y,ed=Math.hypot(ex,ey);if(ed<12&&ed>0){vx+=ex/ed*.4;vy+=ey/ed*.4}}})}
vx=vx*vel+m.kx;vy=vy*vel+m.ky;m.kx*=.8;m.ky*=.8;if(!solidoEnemigo(m.x+vx,m.y,3))m.x+=vx;if(!solidoEnemigo(m.x,m.y+vy,3))m.y+=vy;
if(!quieto&&!P.est&&dist<9)hurtPlayer();
if(m.hp<=0){m.d=1;burst(m.x,m.y-6,22,'#ff5a3c',3,24,1,.06);burst(m.x,m.y-6,8,'#ffffff',2);ring(m.x,m.y-6,14,'#ff5a3c',12);decal(m.x,m.y+2,6,'#2a0a14',500);
G.P.meter=Math.min(100,G.P.meter+6*(1+.5*lvl('abismo')));G.kills++;sfx('boom');soltarMonedas(m.x,m.y-4,m.def.oro||1+Math.floor(Math.random()*2));if(Math.random()<.08)G.pick.push({x:m.x,y:m.y,t:0})}});
G.enem=G.enem.filter(m=>!m.d);
G.bul.forEach(b=>{if(b.charco>0&&--b.charco==0){b.vx=b.vy=0;b.l=150;b.r=5;b.charco=-1}
if(b.split!=null&&--b.split<=0){b.d=1;for(let i=0;i<b.n;i++){const a=i*6.283/b.n;G.bul.push({x:b.x,y:b.y,vx:Math.cos(a)*1.5,vy:Math.sin(a)*1.5,c:'#e0b890',r:3})}burst(b.x,b.y,14,'#a08070',2.5,22,2,.1);ring(b.x,b.y,16,'#e0b890',10);sfx('hit');return}
if(b.l!=null&&--b.l<=0){b.d=1;return}
if(P.escudo>0&&b.charco!=-1&&b.split==null&&Math.hypot(b.x-P.x,b.y-(P.y-12))<22){b.d=1;const tg=objetivoCercano(),a=tg?Math.atan2(tg.y-b.y,tg.x-b.x):Math.atan2(b.y-P.y+12,b.x-P.x);disparo('reflejo',b.x,b.y,a,3.6,{dmg:Math.round(15*(1+.5*lvl('escudo')))});return}
b.x+=b.vx;b.y+=b.vy;if(solidAt(b.x,b.y,-2)){golpeEnMuro(b.x,b.y,4);if(b.split!=null)b.split=1;else{b.d=1;burst(b.x,b.y,3,b.c,1)}return}
const d=Math.hypot(b.x-P.x,b.y-(P.y-10));if(d<b.r+1.5){hurtPlayer();if(P.inv==70&&b.charco!=-1)b.d=1}
else if(d<13&&!b.g&&!G.over){b.g=1;P.meter=Math.min(100,P.meter+1.2*(1+.5*lvl('abismo')))}});G.bul=G.bul.filter(b=>!b.d)}
function drawBalas(){const t=G.t;G.bul.forEach(b=>{if(b.charco==-1){w.globalAlpha=Math.min(1,b.l/30)*.85;w.fillStyle='#3a8a1a';w.beginPath();w.ellipse(b.x,b.y,7,3.5,0,0,7);w.fill();w.fillStyle='#7cff4a';w.fillRect(Math.round(b.x-2+Math.sin(t*.2+b.x)*2),Math.round(b.y-1),2,1);w.globalAlpha=1;return}
if(b.split!=null){w.fillStyle='#6a5a4a';w.beginPath();w.arc(b.x,b.y,7,0,7);w.fill();w.fillStyle='#a08070';w.beginPath();w.arc(b.x-1.5,b.y-1.5,5,0,7);w.fill();w.fillStyle='#e0b890';w.fillRect(Math.round(b.x-3),Math.round(b.y-4),2,2);return}
const r=b.big?4:b.r;w.fillStyle=b.c;w.beginPath();w.arc(b.x,b.y,r,0,7);w.fill();w.fillStyle='#fff';w.fillRect(Math.round(b.x-1),Math.round(b.y-1),2,2)})}
function drawEnemigos(ents){const t=G.t;
G.spawns.forEach(s=>ents.push({y:s.y-20,d:()=>{const k=1-s.t/40;w.fillStyle='rgba(60,10,90,.55)';w.beginPath();w.ellipse(s.x,s.y,10*k,4*k,0,0,7);w.fill();w.strokeStyle='#c08aff';w.lineWidth=1;w.beginPath();w.ellipse(s.x,s.y,12*k+2,5*k+1,0,0,7);w.stroke()}}));
G.enem.forEach(m=>ents.push({y:m.y,d:()=>{w.fillStyle='rgba(0,0,0,.3)';w.beginPath();w.ellipse(m.x,m.y,5,2,0,0,7);w.fill();const fr=m.def.run[Math.floor((t+m.x)/6)%4],jx=m.st=='tele'?rnd(-1,1):0;
spr(w,m.hit>2?white:atlas,fr,m.x+jx,m.y,m.face<0);if(m.st=='tele'&&t%6<3)spr(w,red,fr,m.x+jx,m.y,m.face<0);if(m.frio>0){w.globalAlpha=.45;spr(w,cyan,fr,m.x+jx,m.y,m.face<0);w.globalAlpha=1}
if(m.max>=80&&m.hp<m.max){w.fillStyle='#1a0a14';w.fillRect(Math.round(m.x-8),Math.round(m.y-m.h-5),16,2);w.fillStyle='#ff5a3c';w.fillRect(Math.round(m.x-8),Math.round(m.y-m.h-5),Math.round(16*m.hp/m.max),2)}}}));}
