// Poderes de Lyra: hielo, fuego, rayo, rodar y las Lanzas del Abismo, con sus efectos.
function objetivos(){const L=[],B=G.B;if(B&&!B.dead&&B.z<14&&!G.intro)L.push({x:B.x,y:B.y-34,r:24,ref:B,boss:1});G.enem.forEach(m=>L.push({x:m.x,y:m.y-m.h/2,r:7,ref:m}));return L}
function objetivoCercano(){const P=G.P;let best=null,bd=1e9;objetivos().forEach(o2=>{const d=Math.hypot(o2.x-P.x,o2.y-P.y);if(d<bd){bd=d;best=o2}});return best}
function dañar(tg,d,heavy){G.P.meter=Math.min(100,G.P.meter+d*.11*(1+.5*lvl('abismo')));if(tg.boss){hurtBoss(d,heavy);return}
const m=tg.ref;m.hp-=d;m.hit=5;num(m.x,m.y-m.h-4,d);sfx('hit');const a=Math.atan2(m.y-G.P.y,m.x-G.P.x);m.kx=Math.cos(a)*1.5;m.ky=Math.sin(a)*1.5;if(heavy){G.shake=Math.max(G.shake,heavy);G.stop=Math.max(G.stop,2)}}
function cast(){const P=G.P;if(P.cd>0||P.dash>0||G.U)return;const k=P.spell,sp=SPELLS[k],a=Math.atan2(P.ay-(P.y-14),P.ax-P.x),ox=P.x+Math.cos(a)*14,oy=P.y-14+Math.sin(a)*14;
P.cd=sp.cd;P.kick=4;P.circ=12;
for(let i=0;i<6;i++){const b=a+rnd(-.7,.7),v=rnd(1,2.6);G.pt.push({x:ox,y:oy,vx:Math.cos(b)*v,vy:Math.sin(b)*v,l:10,m:10,c:i%2?sp.c:sp.c2,s:1,g:0})}
if(k==0){const n=lvl('hielo')?3:1;for(let i=0;i<n;i++){const b=a+(i-(n-1)/2)*.17;G.shots.push({x:ox,y:oy,vx:Math.cos(b)*5.2,vy:Math.sin(b)*5.2,k,r:3,l:90})}sfx('ice')}
if(k==1){G.shots.push({x:ox,y:oy,vx:Math.cos(a)*3.3,vy:Math.sin(a)*3.3,k,r:6,l:120});G.shake=Math.max(G.shake,2);ring(ox,oy,10,'#ff8a2a',9);sfx('fire')}
if(k==2)rayo(ox,oy,a)}
function rayoPts(x1,y1,x2,y2){const d=Math.hypot(x2-x1,y2-y1),n=Math.max(2,Math.round(d/10)),pts=[[x1,y1]],br=[],an=Math.atan2(y2-y1,x2-x1);
for(let i=1;i<n;i++){const f=i/n,px=x1+(x2-x1)*f+rnd(-5,5),py=y1+(y2-y1)*f+rnd(-5,5);pts.push([px,py]);
if(Math.random()<.3){const ba=an+rnd(-1.3,1.3),L=rnd(8,20);br.push([[px,py],[px+Math.cos(ba)*L/2+rnd(-3,3),py+Math.sin(ba)*L/2+rnd(-3,3)],[px+Math.cos(ba)*L,py+Math.sin(ba)*L]])}}
pts.push([x2,y2]);return{pts,br,l:10}}
function rayo(ox,oy,a){let x=ox,y=oy,hit=null;const T=objetivos();
for(let d=0;d<230;d+=6){x=ox+Math.cos(a)*d;y=oy+Math.sin(a)*d;if(solidAt(x,y,0))break;hit=T.find(t2=>Math.hypot(t2.x-x,t2.y-y)<t2.r+3);if(hit)break}
G.bolts.push(rayoPts(ox,oy,x,y));G.flash=3;G.fcol='#b9f3ff';sfx('bolt');burst(x,y,18,'#b9f3ff',3.2,18);ring(x,y,16,'#5ee7ff',10,2);decal(x,y+6,5,'#1a3a4a',200);
if(!hit)return;dañar(hit,48,5);let from=hit,n=lvl('rayo')==1?2:lvl('rayo')>1?4:0;const usados=[hit.ref];
while(n-->0){const nx=objetivos().filter(t2=>!usados.includes(t2.ref)).sort((p,q)=>Math.hypot(p.x-from.x,p.y-from.y)-Math.hypot(q.x-from.x,q.y-from.y))[0];
if(!nx||Math.hypot(nx.x-from.x,nx.y-from.y)>110)break;usados.push(nx.ref);G.bolts.push(rayoPts(from.x,from.y,nx.x,nx.y));dañar(nx,30,2);burst(nx.x,nx.y,10,'#b9f3ff',2.5);from=nx}}
function dash(){const P=G.P;if(P.dash>0||P.dcd>0||G.U||G.intro||G.over)return;let dx=P.dx,dy=P.dy;if(!dx&&!dy){dx=P.face;dy=0}const m=Math.hypot(dx,dy);
P.dashV=[dx/m*3.6,dy/m*3.6];P.dash=13;P.dcd=Math.round(40*(1-.3*lvl('pies')));burst(P.x,P.y,10,'#8a7a9a',1.5,18);ring(P.x,P.y,10,'#c3b6d9',8,1);sfx('dash')}
function ult(){const P=G.P,B=G.B;if(P.meter<100||G.U||G.over||G.intro||(B&&B.dead))return;const T=objetivos();if(!T.length)return;
P.meter=0;const f=B&&!B.dead?{x:B.x,y:B.y}:{x:T[0].ref.x,y:T[0].ref.y};G.U={t:0,foco:f,cr:0};G.banner={txt:'LANZAS DEL ABISMO',t:0};
G.bul.forEach(b=>burst(b.x,b.y,4,'#ffffff',1.5));G.bul=[];G.stop=8;sfx('ult')}
function ultStep(){const U=G.U,B=G.B;U.t++;if(B&&!B.dead){U.foco.x=B.x;U.foco.y=B.y}
if(U.t<55){G.zt=1.4;G.dark=Math.min(.65,G.dark+.04);U.cr=Math.min(44,U.cr+1.2);if(U.t%2==0)G.pt.push({x:G.P.x+rnd(-20,20),y:G.P.y,vx:0,vy:-rnd(1,2.5),l:30,m:30,c:Math.random()<.5?'#ff2a4a':'#ffffff',s:2,g:0})}
if(U.t==55){G.banner=null;G.zt=1.15}
if(U.t>=60&&U.t<=104&&U.t%5==0){const T=objetivos(),tg=B&&!B.dead?null:T[Math.floor(Math.random()*T.length)];const x=tg?tg.ref.x:U.foco.x+rnd(-34,34),y=tg?tg.ref.y:U.foco.y-rnd(10,40);G.spears.push({x,y:y-230,ty:y,big:0})}
if(U.t==114)G.spears.push({x:U.foco.x,y:U.foco.y-340,ty:U.foco.y-6,big:1});
if(U.t>178){G.U=null;G.zt=zb();G.dark=0}}
function explotar(x,y){const lf=lvl('fuego'),r=26*(1+.5*lf);objetivos().forEach(t2=>{if(Math.hypot(t2.x-x,t2.y-y)<r+t2.r)dañar(t2,Math.round(18*(1+.3*lf)),0)});
ring(x,y,r,'#ff8a2a',16,3);ring(x,y,r*.6,'#ffe94a',10,2);decal(x,y+6,r*.6,'#140806',420);G.flash=3;G.fcol='#ff8a2a';G.shake=Math.max(G.shake,4);G.stop=Math.max(G.stop,3);
burst(x,y,30,'#ff8a2a',3.5,26,2,.05);burst(x,y,16,'#ffe94a',2.5,20,1,.05);for(let i=0;i<10;i++)G.pt.push({x:x+rnd(-r/2,r/2),y:y+rnd(-r/3,r/3),vx:rnd(-.3,.3),vy:-rnd(.3,.8),l:44,m:44,c:'#3a2e3e',s:2,g:-.005});sfx('boom')}
function updatePoderes(){const lh=lvl('hielo'),lf=lvl('fuego');
G.shots.forEach(s=>{s.x+=s.vx;s.y+=s.vy;s.l--;
if(s.k==0)G.pt.push({x:s.x+rnd(-1,1),y:s.y+rnd(-1,1),vx:-s.vx*.1,vy:-s.vy*.1,l:12,m:12,c:Math.random()<.5?'#bff6ff':'#5ee7ff',s:1,g:0});
else{G.pt.push({x:s.x+rnd(-2,2),y:s.y+rnd(-2,2),vx:-s.vx*.2+rnd(-.4,.4),vy:-s.vy*.2+rnd(-.4,.4),l:16,m:16,c:Math.random()<.5?'#ff8a2a':'#ffe94a',s:2,g:0});if(G.t%3==0)G.pt.push({x:s.x,y:s.y,vx:rnd(-.2,.2),vy:-.4,l:30,m:30,c:'#4a3a4a',s:2,g:-.004})}
let hit=solidAt(s.x,s.y,0)||s.l<=0;const tg=objetivos().find(t2=>Math.hypot(s.x-t2.x,s.y-t2.y)<t2.r+s.r);
if(tg){hit=true;dañar(tg,s.k?Math.round(34*(1+.3*lf)):Math.round(13*(lh>=2?1.5:lh?1.2:1)),s.k?4:0)}
if(hit){s.d=1;if(s.k==1)explotar(s.x,s.y);else{burst(s.x,s.y,10,'#bff6ff',2.2,22,1,.12);ring(s.x,s.y,9,'#ffffff',8,1);decal(s.x,s.y+6,4,'#3a6a7a',160)}}});G.shots=G.shots.filter(s=>!s.d);
G.bolts.forEach(b=>b.l--);G.bolts=G.bolts.filter(b=>b.l>0);
G.spears.forEach(s=>{s.y+=s.big?16:13;G.pt.push({x:s.x+rnd(-2,2)*(s.big?3:1),y:s.y-rnd(0,20),vx:0,vy:-1,l:14,m:14,c:Math.random()<.6?'#ff2a4a':'#2a0010',s:s.big?3:1,g:0});
if(s.y>=s.ty){s.d=1;const rr=s.big?60:16;objetivos().forEach(t2=>{if(Math.hypot(t2.x-s.x,t2.y-(s.ty-10))<rr+t2.r)dañar(t2,s.big?(t2.boss?260:140):32,s.big?22:6)});
if(s.big){G.inv=7;G.slow=.3;G.slowT=22;G.zt=1.5;G.flash=8;G.fcol='#ffffff';burst(s.x,s.ty,180,'#ff2a4a',7,50,2);burst(s.x,s.ty,60,'#1a0010',5,50,2);burst(s.x,s.ty,30,'#8a7a9a',4,40,2,.15);ring(s.x,s.ty,70,'#ff2a4a',24,4);ring(s.x,s.ty,40,'#ffffff',14,2);decal(s.x,s.ty+4,30,'#2a0010',600);sfx('boom')}
else{burst(s.x,s.ty,26,'#ff2a4a',3.5);burst(s.x,s.ty,8,'#ffffff',2);ring(s.x,s.ty,16,'#ff2a4a',10,2);decal(s.x,s.ty+4,7,'#2a0010',400);sfx('hit')}}});G.spears=G.spears.filter(s=>!s.d);
if(G.U)ultStep()}
function drawPoderes(){const t=G.t;drawBalas();
if(G.U&&G.U.cr>0){const f=G.U.foco,r=G.U.cr;w.strokeStyle='#ff2a4a';w.lineWidth=1;w.globalAlpha=.85;w.beginPath();w.ellipse(f.x,f.y,r,r*.4,0,0,7);w.stroke();w.beginPath();w.ellipse(f.x,f.y,r*.7,r*.28,0,0,7);w.stroke();
for(let i=0;i<12;i++){const a=t*.05+i*.524;w.fillStyle=i%3?'#ff2a4a':'#ffffff';w.fillRect(Math.round(f.x+Math.cos(a)*r*.85)-1,Math.round(f.y+Math.sin(a)*r*.34)-1,2,2)}w.globalAlpha=1}
G.shots.forEach(s=>{if(s.k==1){const r=6+Math.sin(t*.8);w.globalAlpha=.45;w.fillStyle='#ff4a1a';w.beginPath();w.arc(s.x,s.y,r+3,0,7);w.fill();w.globalAlpha=1;
w.fillStyle='#ff8a2a';w.beginPath();w.arc(s.x,s.y,r,0,7);w.fill();w.fillStyle='#ffe94a';w.beginPath();w.arc(s.x+rnd(-.6,.6),s.y+rnd(-.6,.6),r*.6,0,7);w.fill();w.fillStyle='#fff';w.fillRect(Math.round(s.x-1),Math.round(s.y-1),2,2)}
else{const an=Math.atan2(s.vy,s.vx);w.save();w.translate(s.x,s.y);w.rotate(an);w.fillStyle='#5ee7ff';w.beginPath();w.moveTo(7,0);w.lineTo(0,-2.5);w.lineTo(-6,0);w.lineTo(0,2.5);w.fill();w.fillStyle='#fff';w.fillRect(-2,-.5,7,1);w.restore()}});
G.bolts.forEach(b=>{const k=b.l/10;w.lineCap='round';w.lineJoin='round';const path=p=>{w.beginPath();p.forEach((q,i)=>i?w.lineTo(q[0],q[1]):w.moveTo(q[0],q[1]));w.stroke()};
w.globalAlpha=.35*k;w.strokeStyle='#5ee7ff';w.lineWidth=7*k;path(b.pts);w.globalAlpha=1;w.lineWidth=3*k;path(b.pts);w.strokeStyle='#ffffff';w.lineWidth=1.4;path(b.pts);
w.strokeStyle='#b9f3ff';w.lineWidth=1;b.br.forEach(path)});
G.spears.forEach(s=>{const k=s.big?3:1;w.fillStyle='#2a0010';w.fillRect(s.x-2*k,s.y-110*k,4*k,90*k);w.fillStyle='#ff2a4a';w.beginPath();w.moveTo(s.x,s.y+6*k);w.lineTo(s.x-5*k,s.y-24*k);w.lineTo(s.x+5*k,s.y-24*k);w.fill();
w.fillStyle='#fff';w.beginPath();w.moveTo(s.x,s.y+2*k);w.lineTo(s.x-1.5*k,s.y-18*k);w.lineTo(s.x+1.5*k,s.y-18*k);w.fill();if(s.big){w.globalAlpha=.25;w.fillStyle='#ff2a4a';w.fillRect(s.x-14,s.y-400,28,400);w.globalAlpha=1}});
G.rings.forEach(r=>{const k=r.l/r.m,rr=r.r0+(r.r-r.r0)*Math.sqrt(1-k);w.globalAlpha=k;w.strokeStyle=r.c;w.lineWidth=r.lw;w.beginPath();w.ellipse(r.x,r.y,rr,rr*.7,0,0,7);w.stroke()});w.globalAlpha=1}
