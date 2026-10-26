// Planos de las salas y su terreno: muros, columnas, cajas, pinchos, fosos, lava, antorchas y luz.
// Cada plano son 17 filas de 28 casillas (de la fila 2 a la 18 del cuarto).
// . suelo   # muro   c columna   x caja   ^ pinchos   h foso   L lava
const PLANOS={
antesala:['','','....x.................x.....','','......c..............c......','','...........xx..xx...........','','..^^^..................^^^..','',
'...........xx..xx...........','','......c..............c......','','....x.................x.....','',''],
pantano:['','','....c..................c....','','','.x........................x.','','.........hh........hh.......','.........hh........hh.......','','','.x........................x.','','....c..................c....','','',''],
cripta:['','','...####..............####...','...#....................#...','...#...x....hhhh....x...#...','...........hhhhhh...........','..c........hhhhhh........c..','...........hhhhhh...........',
'...#...x....hhhh....x...#...','...#....................#...','...####..............####...','','.....^^^^..........^^^^.....','','...x....................x...','',''],
foso:['hhh.......................hhh','hh.........................hh','h..........................h','','','.....x................x.....','','','','','','.....x................x.....','','h..........................h','hh........................hh','',''],
forja:['','','..x......................x..','....LLLLLLLL....LLLLLLLL....','....LLLLLLLL....LLLLLLLL....','','..c.....x..........x.....c..','','.^^^^..................^^^^.','',
'....LLLLLLLL....LLLLLLLL....','....LLLLLLLL....LLLLLLLL....','','..x....c............c....x..','','',''],
trono:['','','.LLL....c...........c....LLL.','.LLL.....................LLL.','.LL........................LL','','','...c....................c...','','','','...c....................c...','','.LL........................LL','.LLL......................LLL','',''],
vacio:['','','..x......................x..','','','','','','','','','','','','..x......................x..','',''],
tesoro:['','','','','.........c........c.........','','','','','','','.........c........c.........','','','','',''],
pilares:['','','....c.....c......c.....c....','','','','....c.....c......c.....c....','','','','....c.....c......c.....c....','','','','....c.....c......c.....c....','',''],
cruz:['','','','....hhhhh..........hhhhh....','....hhhhh..........hhhhh....','....hhhhh..........hhhhh....','','','','','....hhhhh..........hhhhh....','....hhhhh..........hhhhh....','....hhhhh..........hhhhh....','','','',''],
laberinto:['','','....######........######....','.........#........#.........','.........#...x....#.........','.........#........#.........','','.....c..............c.......','','.........#........#.........','.........#....x...#.........','.........#........#.........','....######........######....','','','',''],
vacio2:['','','','.....^^^............^^^.....','','','','','','','','','','.....^^^............^^^.....','','',''],
foso2:['','','.hh......................hh.','.hh......................hh.','','','.....x....hhhhhhhh....x.....','','','','.....x....hhhhhhhh....x.....','','','.hh......................hh.','.hh......................hh.','',''],
tienda:['','','...xx..................xx...','...x....................x...','','.....c..............c.......','','','','','','.....c..............c.......','','...x....................x...','...xx..................xx...','','']};
const ANTORCHAS=[3,12,17,26];
// Las zonas junto a cada puerta del cuarto se dejan libres para poder entrar y salir.
function cargarPlano(c){const P0=PLANOS[c.plano]||PLANOS.vacio,lib=[[13,16,15,18]];if(c.p.N)lib.push([13,16,2,4]);if(c.p.S)lib.push([13,16,15,18]);if(c.p.W)lib.push([1,3,8,11]);if(c.p.E)lib.push([26,28,8,11]);
G.mapa=[];G.cajas={};for(let ty=0;ty<20;ty++){const fila=[];for(let tx=0;tx<30;tx++){let ch='#';
if(ty>=2&&ty<=18&&tx>=1&&tx<=28){ch=(P0[ty-2]||'')[tx-1]||'.';if(ch==' ')ch='.';if(lib.some(([a,b,c2,e])=>tx>=a&&tx<=b&&ty>=c2&&ty<=e))ch='.'}if(ch=='x')G.cajas[tx+','+ty]=20;fila.push(ch)}G.mapa.push(fila)}}
const celda=(x,y)=>{const tx=Math.floor(x/16),ty=Math.floor(y/16);return G.mapa&&G.mapa[ty]?G.mapa[ty][tx]||'#':'#'};
// Muros, columnas y cajas paran a todos; fosos y lava solo frenan a los enemigos (la heroína puede rodar por encima).
function solidAt(x,y,pad){if(y<34+pad)return !(puertaAbierta('N')&&x>229&&x<251&&y>-12);if(y>WH-18-pad)return !(puertaAbierta('S')&&x>229&&x<251&&y<WH+12);
if(x<16+pad)return !(puertaAbierta('W')&&y>150&&y<176&&x>-12);if(x>WW-16-pad)return !(puertaAbierta('E')&&y>150&&y<176&&x<WW+12);
for(const [dx,dy] of [[-pad,-pad],[pad,-pad],[-pad,pad],[pad,pad]]){const ch=celda(x+dx,y+dy);if(ch=='#'||ch=='c'||ch=='x')return true}return false}
function solidoEnemigo(x,y,pad){if(solidAt(x,y,pad))return true;const ch=celda(x,y);return ch=='h'||ch=='L'}
const libreEn=(x,y)=>!solidoEnemigo(x,y,5)&&celda(x,y)!='^';
function lugarLibre(x,y){for(let k=0;k<40;k++){const a=Math.random()*6.283,r=k*3,px=Math.max(40,Math.min(440,x+Math.cos(a)*r)),py=Math.max(56,Math.min(296,y+Math.sin(a)*r));if(libreEn(px,py))return[px,py]}return[240,200]}
function romperCaja(tx,ty){G.mapa[ty][tx]='.';delete G.cajas[tx+','+ty];const x=tx*16+8,y=ty*16+10;burst(x,y,20,'#8a5a3a',2.8,26,2,.12);burst(x,y,8,'#c08a5a',2,20,1,.1);ring(x,y,12,'#c08a5a',10);decal(x,y+4,7,'#2a1a10',800);sfx('hit');
if(Math.random()<.45)soltarMonedas(x,y,1+Math.floor(Math.random()*3));if(Math.random()<.1)G.pick.push({x,y,t:0})}
function dañarCajas(x,y,r,d){golpePared(x,y,r);for(const k in G.cajas){const [tx,ty]=k.split(',').map(Number),cx=tx*16+8,cy=ty*16+8;if(Math.hypot(cx-x,cy-y)<r+8){G.cajas[k]-=d;if(G.cajas[k]<=0)romperCaja(tx,ty)}}}
function golpeEnMuro(x,y,d){golpePared(x,y,0);const tx=Math.floor(x/16),ty=Math.floor(y/16),k=tx+','+ty;if(G.cajas[k]!=null){G.cajas[k]-=d;burst(x,y,4,'#8a5a3a',1.5);if(G.cajas[k]<=0)romperCaja(tx,ty)}}
const pinchosArriba=(tx,ty)=>(G.t+tx*7+ty*13)%150<45;
function updateTerreno(){const P=G.P,ch=celda(P.x,P.y),tx=Math.floor(P.x/16),ty=Math.floor(P.y/16);if(G.over||G.salir)return;
if(ch=='.'&&!P.dash)P.safe=[P.x,P.y];
if(ch=='^'&&pinchosArriba(tx,ty)&&!P.dash)hurtPlayer();
if(ch=='L'&&!P.dash&&!P.est){hurtPlayer();if(G.t%4==0)burst(P.x,P.y-4,4,'#ff8a2a',1.5)}
if(ch=='h'&&!P.dash&&!P.est&&P.safe){burst(P.x,P.y,14,'#2a1a3a',2);ring(P.x,P.y,10,'#5a4a6a',10);const inv=P.inv;P.inv=0;hurtPlayer();if(P.inv==0)P.inv=inv;[P.x,P.y]=P.safe;ring(P.x,P.y-10,14,'#c3b6d9',12)}
for(let y2=2;y2<19;y2++)for(let x2=1;x2<29;x2++)if(G.mapa[y2][x2]=='L'&&Math.random()<.004)G.pt.push({x:x2*16+rnd(2,14),y:y2*16+rnd(2,14),vx:rnd(-.2,.2),vy:-rnd(.4,.9),l:30,m:30,c:Math.random()<.5?'#ff8a2a':'#ffe94a',s:1,g:0})}
// Suelo fijo del cuarto (se pinta una vez); lo animado se pinta cada cuadro en drawTerreno.
function buildFloor(c){const S=ZONAS[G.zona];cargarPlano(c);fx.fillStyle='#120c18';fx.fillRect(0,0,WW,WH);let s=7+G.zona*31+c.x*7+c.y*13;const r=()=>(s=(s*16807)%2147483647)/2147483647;
for(let ty=2;ty<19;ty++)for(let tx=1;tx<29;tx++)tile(fx,R.floors[Math.floor(r()*R.floors.length)],tx,ty);
for(let tx=0;tx<30;tx++){tile(fx,R.wallTop,tx,0);tile(fx,R.wallMid,tx,1);tile(fx,R.wallTop,tx,19)}
for(let ty=0;ty<20;ty++){tile(fx,R.wallTop,0,ty);tile(fx,R.wallTop,29,ty)}
[4,10,19,25].forEach(tx=>tile(fx,R[S.banner],tx,1));[7,22].forEach(tx=>tile(fx,R.fTop,tx,0));
for(let ty=2;ty<19;ty++)for(let tx=1;tx<29;tx++){const ch=G.mapa[ty][tx];if(ch=='#')tile(fx,G.mapa[ty+1][tx]=='#'?R.wallTop:R.wallMid,tx,ty);if(ch=='h'){const x=tx*16,y=ty*16,arriba=G.mapa[ty-1][tx]!='h';fx.fillStyle='#030108';fx.fillRect(x,y,16,16);if(arriba){fx.fillStyle='#3a2e4a';fx.fillRect(x,y,16,3);fx.fillStyle='#1a1226';fx.fillRect(x,y+3,16,3)}
if(G.mapa[ty][tx-1]!='h'){fx.fillStyle='#1a1226';fx.fillRect(x,y,2,16)}if(G.mapa[ty][tx+1]!='h'){fx.fillStyle='#1a1226';fx.fillRect(x+14,y,2,16)}}
if(ch=='L'){fx.fillStyle='#3a0a04';fx.fillRect(tx*16,ty*16,16,16)}}
for(let k=0;k<3;k++){const tx=2+Math.floor(r()*26),ty=4+Math.floor(r()*14);if(G.mapa[ty][tx]=='.')tile(fx,R.skull,tx,ty)}
fx.save();fx.globalCompositeOperation='color';fx.globalAlpha=.32;fx.fillStyle=S.tinte;fx.fillRect(0,0,WW,WH);fx.restore()}
function drawTerreno(ents){const t=G.t;
for(let ty=2;ty<19;ty++)for(let tx=1;tx<29;tx++){const ch=G.mapa[ty][tx],x=tx*16,y=ty*16;
if(ch=='^'){const c=(t+tx*7+ty*13)%150,f=c<4?1:c<8?2:c<41?3:c<45?2:c<49?1:0;w.drawImage(atlas,16+16*f,192,16,16,x,y,16,16)}
if(ch=='L'){for(let k=0;k<6;k++){const px=(k*5+Math.floor(t/6)+tx*3)%16,py=(k*7+ty*5+Math.floor(t/9))%16;w.fillStyle=k%3?'#ff5a1a':'#ffb04a';w.fillRect(x+px,y+py,2,1)}
w.fillStyle='rgba(255,90,26,'+(.55+Math.sin(t*.08+tx)*.1)+')';w.fillRect(x+1,y+1,14,14)}
if(ch=='x')ents.push({y:y+16,d:()=>{w.drawImage(atlas,288,408,16,24,x,y-8,16,24);const hp=G.cajas[tx+','+ty];if(hp<20){w.fillStyle='#1a0e08';w.fillRect(x+4,y+2,1,6);w.fillRect(x+10,y-3,1,5)}}});
if(ch=='c')ents.push({y:y+16,d:()=>w.drawImage(atlas,80,80,16,48,x,y-32,16,48)})}
ANTORCHAS.forEach(tx=>{const x=tx*16+8,f=Math.sin(t*.3+tx)*1.2;w.fillStyle='#5a4030';w.fillRect(x-1,22,3,8);w.fillStyle='#ff8a2a';w.fillRect(x-3,14+f,7,8);w.fillStyle='#ffe94a';w.fillRect(x-1,17+f,3,4);if(t%5==0)G.pt.push({x:x+rnd(-2,2),y:14,vx:rnd(-.1,.1),vy:-.5,l:18,m:18,c:'#ff8a2a',s:1,g:0})})}
// Oscuridad con huecos de luz: la heroína, antorchas, fuentes, lava, fuego y rayos alumbran.
const [lc,lx]=mk(WW,WH);
function drawLuz(){const osc=ZONAS[G.zona].oscuro||.42;if(osc<=0)return;lx.globalCompositeOperation='source-over';lx.clearRect(0,0,WW,WH);lx.fillStyle='rgba(6,3,14,'+osc+')';lx.fillRect(0,0,WW,WH);lx.globalCompositeOperation='destination-out';
const L=(x,y,r,k)=>{const g=lx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+k+')');g.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=g;lx.fillRect(x-r,y-r,r*2,r*2)};
const P=G.P,t=G.t;L(P.x,P.y-12,95,1);ANTORCHAS.forEach(tx=>L(tx*16+8,26,60+Math.sin(t*.2+tx)*4,.95));[7,22].forEach(tx=>L(tx*16+8,30,40,.7));
for(let ty=2;ty<19;ty+=2)for(let tx=1;tx<29;tx+=2)if(G.mapa[ty][tx]=='L')L(tx*16+8,ty*16+8,38,.6);
G.shots.forEach(s=>{if(s.k=='fuego'||s.k=='reflejo')L(s.x,s.y,40,.8)});G.bolts.forEach(b=>{const e=b.pts[b.pts.length-1];L(e[0],e[1],70,.9)});G.rings.forEach(r=>{if(r.r>25)L(r.x,r.y,r.r*1.2,.5*r.l/r.m)});
if(G.B&&!G.B.dead)L(G.B.x,G.B.y-30,70,.6);G.inter.forEach(c=>L(c.x,c.y-8,30,.5));Object.keys(G.room.p).forEach(l=>{if(puertaAbierta(l)){const [px,py]=PUERTA_POS[l];L(px,py,46,.7)}});if(G.escalera)L(G.escalera.x,G.escalera.y+8,55,.85);
w.drawImage(lc,0,0)}
