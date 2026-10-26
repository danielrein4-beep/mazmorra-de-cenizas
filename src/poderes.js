// Motor de poderes: objetivos, daño con el arma, proyectiles, tajos, ondas, veneno, golpes finales y sus efectos.
function objetivos(){const L=[],B=G.B;if(B&&!B.dead&&B.z<14&&!G.intro)L.push({x:B.x,y:B.y-34,r:24,ref:B,boss:1});G.enem.forEach(m=>L.push({x:m.x,y:m.y-m.h/2,r:7,ref:m}));return L}
function objetivoCercano(){const P=G.P;let best=null,bd=1e9;objetivos().forEach(o2=>{const d=Math.hypot(o2.x-P.x,o2.y-P.y);if(d<bd){bd=d;best=o2}});return best}
function dañar(tg,d,heavy,sinArma){const P=G.P,A=armaInfo(P.arma);d=Math.round(d*(sinArma?1:A.mult));P.meter=Math.min(100,P.meter+d*.11*(1+.5*lvl('abismo')));
const r=tg.ref;if(A.efecto=='quema')r.quema=150;if(A.efecto=='frio')r.frio=120;
if(A.efecto=='vampiro'){P.vamp=(P.vamp||0)+d;if(P.vamp>=220){P.vamp=0;if(P.hp<P.max){P.hp++;burst(P.x,P.y-14,10,'#ff4a5a',1.5);ring(P.x,P.y-12,10,'#ff8a9a',10)}}}
if(tg.boss){hurtBoss(d,heavy);return}r.hp-=d;r.hit=5;num(r.x,r.y-r.h-4,d);sfx('hit');const a=Math.atan2(r.y-P.y,r.x-P.x);r.kx=Math.cos(a)*1.5;r.ky=Math.sin(a)*1.5;
if(heavy){G.shake=Math.max(G.shake,heavy);G.stop=Math.max(G.stop,2)}}
// Quemado y congelado: se llama cada paso para enemigos y jefes; devuelve el multiplicador de velocidad.
function estados(r,x,y){if(r.quema>0){r.quema--;if(r.quema%12==0){if(r===G.B)hurtBoss(4,0,1);else{r.hp-=4;num(r.x,r.y-r.h-4,4)}}if(G.t%3==0)G.pt.push({x:x+rnd(-5,5),y:y+rnd(-5,5),vx:0,vy:-.6,l:16,m:16,c:Math.random()<.5?'#ff8a2a':'#ffe94a',s:1,g:0})}
if(r.frio>0){r.frio--;if(G.t%5==0)G.pt.push({x:x+rnd(-6,6),y:y+rnd(-6,6),vx:0,vy:.2,l:14,m:14,c:'#bff6ff',s:1,g:0});return .5}return 1}
function cortarBalas(x,y,r,a,arc){G.bul=G.bul.filter(b=>{const d=Math.hypot(b.x-x,b.y-y);if(d>r+3)return true;if(arc){let da=Math.abs(Math.atan2(b.y-y,b.x-x)-a)%6.283;if(da>3.1416)da=6.283-da;if(da>arc/2)return true}
burst(b.x,b.y,4,'#ffffff',1.5);return false})}
function golpeArco(x,y,a,r,arc,dmg,heavy,corta,col){objetivos().forEach(t=>{const d=Math.hypot(t.x-x,t.y-y);if(d>r+t.r)return;let da=Math.abs(Math.atan2(t.y-y,t.x-x)-a)%6.283;if(da>3.1416)da=6.283-da;if(arc<6&&da>arc/2+.3)return;dañar(t,dmg,heavy)});
if(corta)cortarBalas(x,y,r,a,arc<6?arc:0);dañarCajas(x,y,r*.8,dmg);G.tajos.push({x,y,a,r,arc:Math.min(arc,5.8),l:9,c:col||'#fff1b0'});for(let i=0;i<8;i++){const b=a+rnd(-arc/2,arc/2);G.pt.push({x:x+Math.cos(b)*r,y:y+Math.sin(b)*r,vx:Math.cos(b),vy:Math.sin(b),l:12,m:12,c:col||'#fff1b0',s:1,g:0})}}
function cast(){const P=G.P;if(P.cds[P.spell]>0||P.dash>0||P.est||G.U)return;const id=P.tecs[P.spell],T=TEC[id],A=armaInfo(P.arma),a=Math.atan2(P.ay-(P.y-14),P.ax-P.x),ox=P.x+Math.cos(a)*14,oy=P.y-14+Math.sin(a)*14;
P.cds[P.spell]=Math.round(T.cd*A.cdm);P.kick=4;P.circ=12;for(let i=0;i<6;i++){const b=a+rnd(-.7,.7),v=rnd(1,2.6);G.pt.push({x:ox,y:oy,vx:Math.cos(b)*v,vy:Math.sin(b)*v,l:10,m:10,c:i%2?T.c:'#ffffff',s:1,g:0})}
T.usar(P,a,ox,oy)}
function rayoPts(x1,y1,x2,y2){const d=Math.hypot(x2-x1,y2-y1),n=Math.max(2,Math.round(d/10)),pts=[[x1,y1]],br=[],an=Math.atan2(y2-y1,x2-x1);
for(let i=1;i<n;i++){const f=i/n,px=x1+(x2-x1)*f+rnd(-5,5),py=y1+(y2-y1)*f+rnd(-5,5);pts.push([px,py]);
if(Math.random()<.3){const ba=an+rnd(-1.3,1.3),L=rnd(8,20);br.push([[px,py],[px+Math.cos(ba)*L/2+rnd(-3,3),py+Math.sin(ba)*L/2+rnd(-3,3)],[px+Math.cos(ba)*L,py+Math.sin(ba)*L]])}}
pts.push([x2,y2]);return{pts,br,l:10}}
// El tercer rayo de la seguidilla cae del cielo sobre donde pegó y salta a más enemigos.
function rayo(ox,oy,a,dmg,fin){let x=ox,y=oy,hit=null;const T=objetivos();
for(let d=0;d<230;d+=6){x=ox+Math.cos(a)*d;y=oy+Math.sin(a)*d;if(solidAt(x,y,0))break;hit=T.find(t2=>Math.hypot(t2.x-x,t2.y-y)<t2.r+3);if(hit)break}
G.bolts.push(rayoPts(ox,oy,x,y));G.flash=fin?6:3;G.fcol='#b9f3ff';sfx(fin?'trueno':'rayo');burst(x,y,fin?40:18,'#b9f3ff',fin?4.5:3.2,18);ring(x,y,fin?34:16,'#5ee7ff',fin?16:10,2);decal(x,y+6,fin?12:5,'#1a3a4a',300);
if(fin){const b=rayoPts(x+rnd(-10,10),y-220,x,y);b.l=14;b.gordo=1;G.bolts.push(b);G.shake=12;G.stop=5;objetivos().forEach(t=>{if(Math.hypot(t.x-x,t.y-y)<30+t.r&&t!==hit)dañar(t,40,4)})}
if(!hit)return;dañar(hit,dmg,fin?8:5);let from=hit,n=(fin?3:0)+(lvl('rayo')?2:0)+(lvl('rayo')>1?2:0);const usados=[hit.ref];
while(n-->0){const nx=objetivos().filter(t2=>!usados.includes(t2.ref)).sort((p,q)=>Math.hypot(p.x-from.x,p.y-from.y)-Math.hypot(q.x-from.x,q.y-from.y))[0];
if(!nx||Math.hypot(nx.x-from.x,nx.y-from.y)>110)break;usados.push(nx.ref);G.bolts.push(rayoPts(from.x,from.y,nx.x,nx.y));dañar(nx,fin?35:25,2);burst(nx.x,nx.y,10,'#b9f3ff',2.5);from=nx}}
function dash(){const P=G.P;if(P.dash>0||P.dcd>0||P.est||G.U||G.intro||G.over)return;let dx=P.dx,dy=P.dy;if(!dx&&!dy){dx=P.face;dy=0}const m=Math.hypot(dx,dy);
P.dashV=[dx/m*3.6,dy/m*3.6];P.dash=13;P.dcd=Math.round(40*(1-.3*lvl('pies')));burst(P.x,P.y,10,'#8a7a9a',1.5,18);ring(P.x,P.y,10,'#c3b6d9',8,1);sfx('dash')}
function ult(){const P=G.P,B=G.B;if(P.meter<100||G.U||G.over||G.intro||(B&&B.dead))return;const T=objetivos();if(!T.length)return;
P.meter=0;const f=B&&!B.dead?{x:B.x,y:B.y}:{x:T[0].ref.x,y:T[0].ref.y};G.U={t:0,id:P.ult,foco:f,cr:0};G.banner={txt:ULT[P.ult].n.toUpperCase(),t:0,c:ULT[P.ult].c};
G.bul.forEach(b=>burst(b.x,b.y,4,'#ffffff',1.5));G.bul=[];G.stop=8;sfx('ult')}
function golpeFinal(x,y,c){G.inv=7;G.slow=.3;G.slowT=22;G.zt=1.5;G.flash=8;G.fcol='#ffffff';burst(x,y,160,c,7,50,2);burst(x,y,60,'#ffffff',5,50,2);ring(x,y,70,c,24,4);ring(x,y,40,'#ffffff',14,2);decal(x,y+14,30,'#1a0a14',600);sfx('ultFinal')}
function ultStep(){const U=G.U,B=G.B,C=ULT[U.id].c;U.t++;if(B&&!B.dead){U.foco.x=B.x;U.foco.y=B.y}
if(U.t<55){G.zt=1.4;G.dark=Math.min(.65,G.dark+.04);U.cr=Math.min(44,U.cr+1.2);if(U.t%2==0)G.pt.push({x:G.P.x+rnd(-20,20),y:G.P.y,vx:0,vy:-rnd(1,2.5),l:30,m:30,c:Math.random()<.5?C:'#ffffff',s:2,g:0})}
if(U.t==55){G.banner=null;G.zt=1.15}if(U.t>=55)ULT[U.id].paso(U);if(U.t>178){G.U=null;G.zt=zb();G.dark=0}}
function explotar(x,y){const lf=lvl('fuego'),r=26*(1+.5*lf);dañarCajas(x,y,r,30);objetivos().forEach(t2=>{if(Math.hypot(t2.x-x,t2.y-y)<r+t2.r)dañar(t2,Math.round(18*(1+.3*lf)),0)});
ring(x,y,r,'#ff8a2a',16,3);ring(x,y,r*.6,'#ffe94a',10,2);decal(x,y+6,r*.6,'#140806',420);G.flash=3;G.fcol='#ff8a2a';G.shake=Math.max(G.shake,4);G.stop=Math.max(G.stop,3);
burst(x,y,30,'#ff8a2a',3.5,26,2,.05);burst(x,y,16,'#ffe94a',2.5,20,1,.05);for(let i=0;i<10;i++)G.pt.push({x:x+rnd(-r/2,r/2),y:y+rnd(-r/3,r/3),vx:rnd(-.3,.3),vy:-rnd(.3,.8),l:44,m:44,c:'#3a2e3e',s:2,g:-.005});sfx('boom')}
function updatePoderes(){const P=G.P;
if(P.est){P.est.t--;const [dx,dy]=P.est.dir;for(let k=0;k<2;k++){if(!solidAt(P.x+dx*2.3,P.y+dy*2.3,4)){P.x+=dx*2.3;P.y+=dy*2.3}}G.ghosts.push({x:P.x,y:P.y,face:P.face,l:12});
objetivos().forEach(t=>{if(!P.est.hits.includes(t.ref)&&Math.hypot(t.x-P.x,t.y-P.y+12)<t.r+10){P.est.hits.push(t.ref);dañar(t,Math.round(40*(1+.3*lvl('estocada'))),5);burst(t.x,t.y,14,'#ffe94a',3)}});
cortarBalas(P.x,P.y-12,12);if(P.est.t<=0)P.est=null}
if(P.escudo>0)P.escudo--;
G.shots.forEach(s=>{const T=SHOT_T[s.k];if(T.mover)T.mover(s);else{s.x+=s.vx;s.y+=s.vy}s.l--;T.trail&&T.trail(s);
let muere=s.l<=0||(!T.fantasma&&solidAt(s.x,s.y,0));if(!muere)objetivos().forEach(tg=>{if(muere||s.hits.includes(tg.ref))return;if(Math.hypot(s.x-tg.x,s.y-tg.y)<tg.r+s.r){s.hits.push(tg.ref);dañar(tg,s.dmg,s.k=='fuego'?4:0);if(s.pierce>0)s.pierce--;else muere=true}});
if(muere){s.d=1;if(s.l>0)golpeEnMuro(s.x,s.y,s.dmg);T.fin&&T.fin(s)}});G.shots=G.shots.filter(s=>!s.d);
G.ondas.forEach(o2=>{o2.r+=3.2;objetivos().forEach(t=>{if(!o2.hits.includes(t.ref)&&Math.abs(Math.hypot(t.x-o2.x,t.y-o2.y+6)-o2.r)<10){o2.hits.push(t.ref);dañar(t,o2.dmg,3)}});
G.bul=G.bul.filter(b=>{if(Math.abs(Math.hypot(b.x-o2.x,b.y-o2.y)-o2.r)<6){burst(b.x,b.y,3,'#ffb04a',1);return false}return true});if(G.t%2==0)burst(o2.x+Math.cos(G.t)*o2.r,o2.y+Math.sin(G.t)*o2.r*.6,3,'#8a7a6a',1,14)});G.ondas=G.ondas.filter(o2=>o2.r<o2.max);
G.frascos.forEach(f=>{f.t++;const k=f.t/f.T;f.x=f.x0+(f.tx-f.x0)*k;f.y=f.y0+(f.ty-f.y0)*k-Math.sin(Math.PI*k)*30;if(f.t>=f.T){f.d=1;const lv=lvl('veneno');G.nubes.push({x:f.tx,y:f.ty+8,r:28*(1+.35*lv),l:180+90*lv,m:180+90*lv});burst(f.tx,f.ty,20,'#7cff4a',2.5);sfx('veneno')}});G.frascos=G.frascos.filter(f=>!f.d);
G.nubes.forEach(n=>{n.l--;if(G.t%10==0)objetivos().forEach(t=>{if(Math.hypot(t.x-n.x,(t.y-n.y)*1.4)<n.r)dañar(t,4,0)});if(G.t%3==0)G.pt.push({x:n.x+rnd(-n.r,n.r)*.8,y:n.y+rnd(-n.r,n.r)*.4,vx:0,vy:-.3,l:24,m:24,c:Math.random()<.5?'#7cff4a':'#3a8a1a',s:2,g:0})});G.nubes=G.nubes.filter(n=>n.l>0);
G.bolts.forEach(b=>b.l--);G.bolts=G.bolts.filter(b=>b.l>0);G.tajos.forEach(t=>t.l--);G.tajos=G.tajos.filter(t=>t.l>0);G.cortes.forEach(c=>c.l--);G.cortes=G.cortes.filter(c=>c.l>0);
G.spears.forEach(s=>{s.y+=s.big?16:(s.kind=='flecha'?15:13);G.pt.push({x:s.x+rnd(-2,2)*(s.big?3:1),y:s.y-rnd(0,20),vx:0,vy:-1,l:14,m:14,c:s.kind=='lanza'?(Math.random()<.6?'#ff2a4a':'#2a0010'):s.kind=='flecha'?'#b4ff8a':'#8a7a6a',s:s.big?3:1,g:0});
if(s.y>=s.ty){s.d=1;dañarCajas(s.x,s.ty,s.rad,s.dmg);objetivos().forEach(t=>{if(Math.hypot(t.x-s.x,t.y-(s.ty-10))<s.rad+t.r)dañar(t,s.big&&!t.boss?Math.round(s.dmg*.55):s.dmg,s.big?22:4)});
const c=s.kind=='lanza'?'#ff2a4a':s.kind=='flecha'?'#7cff4a':'#ffb04a';if(s.big)golpeFinal(s.x,s.ty,c);else{burst(s.x,s.ty,20,c,3.2);ring(s.x,s.ty,s.rad,c,10,2);decal(s.x,s.ty+4,s.rad*.4,'#1a0a14',400);sfx('hit')}}});G.spears=G.spears.filter(s=>!s.d);
if(G.U)ultStep()}
function drawPoderes(){const t=G.t,P=G.P;
G.nubes.forEach(n=>{w.globalAlpha=Math.min(1,n.l/40)*.35;w.fillStyle='#3a8a1a';w.beginPath();w.ellipse(n.x,n.y,n.r,n.r*.55,0,0,7);w.fill();w.globalAlpha=Math.min(1,n.l/40)*.25;w.fillStyle='#7cff4a';w.beginPath();w.ellipse(n.x+Math.sin(t*.05)*4,n.y-3,n.r*.7,n.r*.35,0,0,7);w.fill()});w.globalAlpha=1;
drawBalas();
if(G.U&&G.U.cr>0){const f=G.U.foco,r=G.U.cr,C=ULT[G.U.id].c;w.strokeStyle=C;w.lineWidth=1;w.globalAlpha=.85;w.beginPath();w.ellipse(f.x,f.y,r,r*.4,0,0,7);w.stroke();w.beginPath();w.ellipse(f.x,f.y,r*.7,r*.28,0,0,7);w.stroke();
for(let i=0;i<12;i++){const a=t*.05+i*.524;w.fillStyle=i%3?C:'#ffffff';w.fillRect(Math.round(f.x+Math.cos(a)*r*.85)-1,Math.round(f.y+Math.sin(a)*r*.34)-1,2,2)}w.globalAlpha=1}
if(G.U&&G.U.cuch)G.U.cuch.forEach(a=>{w.save();w.translate(P.x+Math.cos(a)*G.U.rad,P.y-12+Math.sin(a)*G.U.rad*.7);w.rotate(a+Math.PI);w.drawImage(atlas,293,10,6,13,-3,-6,6,13);w.restore()});
if(P.escudo>0){const k=Math.min(1,P.escudo/15);w.globalAlpha=.8*k;w.strokeStyle='#ffd24a';w.lineWidth=1;for(let i=0;i<6;i++){const a=t*.08+i*1.047,b=a+1.047;w.beginPath();w.moveTo(P.x+Math.cos(a)*20,P.y-12+Math.sin(a)*16);w.lineTo(P.x+Math.cos(b)*20,P.y-12+Math.sin(b)*16);w.stroke()}
w.globalAlpha=.12*k;w.fillStyle='#ffd24a';w.beginPath();w.ellipse(P.x,P.y-12,20,16,0,0,7);w.fill();w.globalAlpha=1}
G.frascos.forEach(f=>{w.save();w.translate(f.x,f.y);w.rotate(f.t*.3);w.drawImage(atlas,320,352,16,16,-8,-8,16,16);w.restore()});
G.shots.forEach(s=>SHOT_T[s.k].draw(s));
G.tajos.forEach(s=>{const k=s.l/9;w.globalAlpha=k;w.fillStyle=s.c;w.beginPath();w.arc(s.x,s.y,s.r,s.a-s.arc/2,s.a+s.arc/2);w.arc(s.x,s.y,s.r*(.55+.3*(1-k)),s.a+s.arc/2,s.a-s.arc/2,true);w.fill();
w.strokeStyle='#ffffff';w.lineWidth=1;w.beginPath();w.arc(s.x,s.y,s.r,s.a-s.arc/2,s.a+s.arc/2);w.stroke()});w.globalAlpha=1;
G.cortes.forEach(c=>{const k=c.l/24;w.globalAlpha=k;w.strokeStyle='#ffe94a';w.lineWidth=10*k+2;w.beginPath();w.moveTo(c.x-Math.cos(c.a)*260,c.y-Math.sin(c.a)*260);w.lineTo(c.x+Math.cos(c.a)*260,c.y+Math.sin(c.a)*260);w.stroke();w.strokeStyle='#ffffff';w.lineWidth=3*k+1;w.stroke()});w.globalAlpha=1;
G.ondas.forEach(o2=>{const k=1-o2.r/o2.max;w.globalAlpha=k;w.strokeStyle='#ffb04a';w.lineWidth=3;w.beginPath();w.ellipse(o2.x,o2.y,o2.r,o2.r*.6,0,0,7);w.stroke();w.strokeStyle='#fff1b0';w.lineWidth=1;w.stroke()});w.globalAlpha=1;
G.bolts.forEach(b=>{const k=b.l/(b.gordo?14:10),g=b.gordo?2.2:1;w.lineCap='round';w.lineJoin='round';const path=p=>{w.beginPath();p.forEach((q,i)=>i?w.lineTo(q[0],q[1]):w.moveTo(q[0],q[1]));w.stroke()};
w.globalAlpha=.35*k;w.strokeStyle='#5ee7ff';w.lineWidth=7*k*g;path(b.pts);w.globalAlpha=1;w.lineWidth=3*k*g;path(b.pts);w.strokeStyle='#ffffff';w.lineWidth=1.4*g;path(b.pts);
w.strokeStyle='#b9f3ff';w.lineWidth=1;b.br.forEach(path)});
G.spears.forEach(s=>{const k=s.big?3:1;if(s.kind=='lanza'){w.fillStyle='#2a0010';w.fillRect(s.x-2*k,s.y-110*k,4*k,90*k);w.fillStyle='#ff2a4a';w.beginPath();w.moveTo(s.x,s.y+6*k);w.lineTo(s.x-5*k,s.y-24*k);w.lineTo(s.x+5*k,s.y-24*k);w.fill();
w.fillStyle='#fff';w.beginPath();w.moveTo(s.x,s.y+2*k);w.lineTo(s.x-1.5*k,s.y-18*k);w.lineTo(s.x+1.5*k,s.y-18*k);w.fill()}
else if(s.kind=='flecha'){w.save();w.translate(s.x,s.y);w.rotate(Math.PI);w.drawImage(atlas,324,202,7,21,-3.5*k,-10*k,7*k,21*k);w.restore()}
else{w.fillStyle='#6a5a4a';w.beginPath();w.arc(s.x,s.y,5*k,0,7);w.fill();w.fillStyle='#a08070';w.beginPath();w.arc(s.x-k,s.y-k,3.5*k,0,7);w.fill()}
if(s.big){w.globalAlpha=.25;w.fillStyle=s.kind=='lanza'?'#ff2a4a':'#7cff4a';w.fillRect(s.x-14,s.y-400,28,400);w.globalAlpha=1}});
G.rings.forEach(r=>{const k=r.l/r.m,rr=r.r0+(r.r-r.r0)*Math.sqrt(1-k);w.globalAlpha=k;w.strokeStyle=r.c;w.lineWidth=r.lw;w.beginPath();w.ellipse(r.x,r.y,rr,rr*.7,0,0,7);w.stroke()});w.globalAlpha=1}
