// Técnicas (teclas 1-3) y golpes finales (Q) de cada personaje.
// usar(P, ángulo, x, y) dispara la técnica desde la punta del arma; mej = [nombre de la mejora, qué hace].
const disparo=(k,x,y,a,v,o)=>G.shots.push(Object.assign({own:G.P,k,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:3,l:90,dmg:10,pierce:0,hits:[]},o));
const TEC={
hielo:{n:'Hielo',cd:9,c:'#5ee7ff',mej:['Hielo cortante','El hielo sale en abanico de tres y pega más.'],
 usar(P,a,x,y){const n=lvl('hielo')?3:1;for(let i=0;i<n;i++)disparo('hielo',x,y,a+(i-(n-1)/2)*.17,5.2,{dmg:Math.round(13*(lvl('hielo')>1?1.5:lvl('hielo')?1.2:1))});sfx('hielo')}},
fuego:{n:'Fuego',cd:24,c:'#ff8a2a',mej:['Fuego voraz','Explosiones más grandes y más fuertes.'],
 usar(P,a,x,y){disparo('fuego',x,y,a,3.3,{r:6,l:120,dmg:Math.round(34*(1+.3*lvl('fuego')))});G.shake=Math.max(G.shake,2);ring(x,y,10,'#ff8a2a',9);sfx('fire')}},
rayo:{n:'Rayo',cd:16,c:'#b9f3ff',mej:['Rayo en cadena','El rayo salta a más enemigos y la seguidilla pega más.'],
 usar(P,a,x,y){if(G.t-P.comboT>50)P.combo=0;P.combo++;P.comboT=G.t;const fin=P.combo>=3;rayo(x,y,a,fin?60:34+P.combo*8,fin);if(fin){P.combo=0;P.cds[P.spell]=55}}},
tajo:{n:'Tajo',cd:16,c:'#fff1b0',mej:['Filo del alba','Tajo más amplio, más fuerte y que lanza una onda de luz.'],
 usar(P,a){const lv=lvl('tajo'),r=30*(1+.3*lv);golpeArco(P.x,P.y-12,a,r,2.3,Math.round(30*(1+.25*lv)),3,true);P.swing=10;sfx('tajo');
 if(lv>1)disparo('onda',P.x,P.y-12,a,4.2,{r:7,l:40,dmg:20,pierce:9})}},
estocada:{n:'Estocada',cd:45,c:'#ffe94a',mej:['Estocada relámpago','Recorre más distancia y pega más fuerte.'],
 usar(P,a){P.est={t:12+4*lvl('estocada'),dir:[Math.cos(a),Math.sin(a)],hits:[]};P.inv=Math.max(P.inv,20);P.swing=0;sfx('estocada');ring(P.x,P.y-10,14,'#ffe94a',10)}},
escudo:{n:'Escudo',cd:120,c:'#ffd24a',mej:['Égida','El escudo dura más y devuelve las balas con más fuerza.'],
 usar(P){P.escudo=55+25*lvl('escudo');ring(P.x,P.y-12,24,'#ffd24a',14,2);sfx('escudo')}},
flecha:{n:'Flecha',cd:8,c:'#7cff4a',mej:['Punta de acero','Las flechas atraviesan a tres enemigos y pegan más.'],
 usar(P,a,x,y){disparo('flecha',x,y,a,6.5,{dmg:Math.round(14*(1+.25*lvl('flecha'))),pierce:lvl('flecha')?3:1});sfx('flecha')}},
abanico:{n:'Abanico',cd:30,c:'#b4ff8a',mej:['Abanico de siete','Salen siete flechas en vez de cinco.'],
 usar(P,a,x,y){const n=lvl('abanico')?7:5;for(let i=0;i<n;i++)disparo('flecha',x,y,a+(i-(n-1)/2)*.14,6,{dmg:12});sfx('abanico')}},
espinas:{n:'Espinas',cd:50,c:'#3a8a1a',mej:['Zarza','La flecha estalla en el doble de espinas.'],
 usar(P,a,x,y){disparo('espinas',x,y,a,4,{dmg:30,l:70,r:4});sfx('flecha')}},
martillazo:{n:'Martillazo',cd:28,c:'#ffb04a',mej:['Golpe de montaña','Más alcance y más daño.'],
 usar(P,a){const lv=lvl('martillazo'),x=P.x+Math.cos(a)*20,y=P.y-6+Math.sin(a)*14,r=26*(1+.3*lv);P.swing=12;
 objetivos().forEach(t=>{if(Math.hypot(t.x-x,t.y-y)<r+t.r)dañar(t,Math.round(45*(1+.3*lv)),4,true)});cortarBalas(x,y,r);dañarCajas(x,y,r,45);
 G.shake=Math.max(G.shake,5);G.stop=Math.max(G.stop,3);ring(x,y,r,'#ffb04a',14,3);decal(x,y+4,r*.5,'#1a120a',500);burst(x,y,26,'#8a7a6a',3,26,2,.12);sfx('martillazo')}},
hacha:{n:'Hacha',cd:40,c:'#c3c8d8',mej:['Hachas gemelas','Lanzas dos hachas que vuelven a tu mano.'],
 usar(P,a,x,y){const n=lvl('hacha')?2:1;for(let i=0;i<n;i++)disparo('hacha',x,y,a+(i-(n-1)/2)*.35,4.2,{r:6,l:200,dmg:25,pierce:99,ida:30});sfx('hacha')}},
pisoton:{n:'Pisotón',cd:90,c:'#ff8a2a',mej:['Pisada de gigante','La onda llega más lejos y pega más.'],
 usar(P){dañarCajas(P.x,P.y,80*(1+.35*lvl('pisoton')),35);G.ondas.push({own:P,x:P.x,y:P.y,r:6,max:80*(1+.35*lvl('pisoton')),dmg:Math.round(35*(1+.3*lvl('pisoton'))),hits:[]});G.shake=10;G.stop=4;sfx('pisoton');burst(P.x,P.y,30,'#8a7a6a',3,30,2,.1);decal(P.x,P.y+2,20,'#1a120a',500)}},
dagas:{n:'Dagas',cd:6,c:'#c3c8d8',mej:['Mil cortes','Lanzas dos dagas a la vez.'],
 usar(P,a,x,y){const n=lvl('dagas')?2:1;for(let i=0;i<n;i++)disparo('daga',x,y,a+rnd(-.06,.06)+(i-(n-1)/2)*.12,6.2,{dmg:Math.round(9*(lvl('dagas')>1?1.3:1))});sfx('dagas')}},
veneno:{n:'Veneno',cd:70,c:'#7cff4a',mej:['Peste','La nube es más grande y dura más.'],
 usar(P,a,x,y){const d=Math.min(120,Math.hypot(P.ax-x,P.ay-y));G.frascos.push({own:P,x,y,x0:x,y0:y,tx:x+Math.cos(a)*d,ty:y+Math.sin(a)*d,t:0,T:30});sfx('lanzar')}},
sombra:{n:'Sombra',cd:60,c:'#9a3aff',mej:['Paso de sombra','Pega más y se recarga antes.'],
 usar(P,a){const tg=objetivoCercano();burst(P.x,P.y-10,24,'#2a1650',2.5,30,2);ring(P.x,P.y-10,14,'#9a3aff',12);let nx,ny;
 if(tg&&Math.hypot(tg.x-P.x,tg.y-P.y)<170){const b=Math.atan2(tg.y-P.y,tg.x-P.x);nx=tg.ref.x+Math.cos(b)*18;ny=tg.ref.y+Math.sin(b)*10}else{nx=P.x+Math.cos(a)*60;ny=P.y+Math.sin(a)*60}
 for(let k=10;k>=0;k--){const fx2=P.x+(nx-P.x)*k/10,fy2=P.y+(ny-P.y)*k/10;if(!solidAt(fx2,fy2,4)){P.x=fx2;P.y=fy2;break}}
 golpeArco(P.x,P.y-12,Math.atan2((tg?tg.y:P.y)-P.y+12,(tg?tg.x:P.x+P.face)-P.x),30,6.3,Math.round(45*(1+.3*lvl('sombra'))),5,false);P.inv=Math.max(P.inv,20);burst(P.x,P.y-10,24,'#9a3aff',3);sfx('sombra');
 if(lvl('sombra'))P.cds[P.spell]=Math.round(P.cds[P.spell]*.7)}}};
const SHOT_T={
hielo:{trail:s=>G.pt.push({x:s.x+rnd(-1,1),y:s.y+rnd(-1,1),vx:-s.vx*.1,vy:-s.vy*.1,l:12,m:12,c:Math.random()<.5?'#bff6ff':'#5ee7ff',s:1,g:0}),
 fin:s=>{burst(s.x,s.y,10,'#bff6ff',2.2,22,1,.12);ring(s.x,s.y,9,'#ffffff',8,1);decal(s.x,s.y+6,4,'#3a6a7a',160);sfx('hieloRompe')},
 draw:s=>{w.save();w.translate(s.x,s.y);w.rotate(Math.atan2(s.vy,s.vx));w.fillStyle='#5ee7ff';w.beginPath();w.moveTo(7,0);w.lineTo(0,-2.5);w.lineTo(-6,0);w.lineTo(0,2.5);w.fill();w.fillStyle='#fff';w.fillRect(-2,-.5,7,1);w.restore()}},
fuego:{trail:s=>{G.pt.push({x:s.x+rnd(-2,2),y:s.y+rnd(-2,2),vx:-s.vx*.2+rnd(-.4,.4),vy:-s.vy*.2+rnd(-.4,.4),l:16,m:16,c:Math.random()<.5?'#ff8a2a':'#ffe94a',s:2,g:0});if(G.t%3==0)G.pt.push({x:s.x,y:s.y,vx:rnd(-.2,.2),vy:-.4,l:30,m:30,c:'#4a3a4a',s:2,g:-.004})},
 fin:s=>explotar(s.x,s.y),draw:s=>{const r=6+Math.sin(G.t*.8);w.globalAlpha=.45;w.fillStyle='#ff4a1a';w.beginPath();w.arc(s.x,s.y,r+3,0,7);w.fill();w.globalAlpha=1;
 w.fillStyle='#ff8a2a';w.beginPath();w.arc(s.x,s.y,r,0,7);w.fill();w.fillStyle='#ffe94a';w.beginPath();w.arc(s.x,s.y,r*.6,0,7);w.fill();w.fillStyle='#fff';w.fillRect(Math.round(s.x-1),Math.round(s.y-1),2,2)}},
flecha:{trail:s=>{if(G.t%2==0)G.pt.push({x:s.x,y:s.y,vx:0,vy:0,l:8,m:8,c:'#b4ff8a',s:1,g:0})},fin:s=>burst(s.x,s.y,6,'#c8a070',1.5,14,1,.1),
 draw:s=>{w.save();w.translate(s.x,s.y);w.rotate(Math.atan2(s.vy,s.vx)+Math.PI/2);w.drawImage(atlas,324,202,7,21,-3.5,-10,7,21);w.restore()}},
espinas:{trail:s=>G.pt.push({x:s.x,y:s.y,vx:rnd(-.3,.3),vy:rnd(-.3,.3),l:14,m:14,c:'#3a8a1a',s:2,g:0}),
 fin:s=>{const n=lvl('espinas')?16:8;for(let i=0;i<n;i++)disparo('espina',s.x,s.y,i*6.283/n,3,{dmg:9,l:30,r:2});ring(s.x,s.y,20,'#7cff4a',12,2);burst(s.x,s.y,20,'#3a8a1a',3);sfx('hit')},
 draw:s=>{SHOT_T.flecha.draw(s);w.fillStyle='#7cff4a';w.fillRect(Math.round(s.x-1),Math.round(s.y-1),3,3)}},
espina:{fin:s=>burst(s.x,s.y,3,'#3a8a1a',1),draw:s=>{w.fillStyle='#7cff4a';w.fillRect(Math.round(s.x-1),Math.round(s.y-1),3,2);w.fillStyle='#1a4a0a';w.fillRect(Math.round(s.x),Math.round(s.y),1,1)}},
onda:{fantasma:1,trail:s=>G.pt.push({x:s.x+rnd(-4,4),y:s.y+rnd(-4,4),vx:0,vy:0,l:10,m:10,c:'#fff1b0',s:1,g:0}),
 draw:s=>{w.save();w.translate(s.x,s.y);w.rotate(Math.atan2(s.vy,s.vx));w.globalAlpha=Math.min(1,s.l/15);w.strokeStyle='#fff1b0';w.lineWidth=3;w.beginPath();w.arc(-6,0,10,-1,1);w.stroke();w.strokeStyle='#fff';w.lineWidth=1;w.stroke();w.restore();w.globalAlpha=1}},
hacha:{fantasma:1,mover:s=>{const P=G.P;if(s.ida>0){s.ida--;s.x+=s.vx;s.y+=s.vy;if(s.ida==0||solidAt(s.x,s.y,0)){s.ida=0;s.hits=[]}}
 else{const a=Math.atan2(P.y-12-s.y,P.x-s.x);s.x+=Math.cos(a)*4.6;s.y+=Math.sin(a)*4.6;if(Math.hypot(P.x-s.x,P.y-12-s.y)<8)s.l=0}},
 trail:s=>{if(G.t%2==0)G.pt.push({x:s.x,y:s.y,vx:0,vy:0,l:10,m:10,c:'#8a8fa8',s:1,g:0})},
 draw:s=>{w.save();w.translate(s.x,s.y);w.rotate(G.t*.5);w.drawImage(atlas,340,161,10,14,-5,-7,10,14);w.restore()}},
daga:{fin:s=>burst(s.x,s.y,4,'#c3c8d8',1.2,12),draw:s=>{w.save();w.translate(s.x,s.y);w.rotate(Math.atan2(s.vy,s.vx)+Math.PI/2);w.drawImage(atlas,293,10,6,13,-3,-6,6,13);w.restore()}},
reflejo:{trail:s=>G.pt.push({x:s.x,y:s.y,vx:0,vy:0,l:10,m:10,c:'#ffd24a',s:1,g:0}),fin:s=>burst(s.x,s.y,6,'#ffd24a',1.5),
 draw:s=>{w.fillStyle='#ffd24a';w.beginPath();w.arc(s.x,s.y,3.5,0,7);w.fill();w.fillStyle='#fff';w.fillRect(Math.round(s.x-1),Math.round(s.y-1),2,2)}}};
// Golpes finales: paso(U) corre desde U.t=55, cuando termina la carga; el remate llega cerca de U.t=114.
const ULT={
abismo:{n:'Lanzas del Abismo',c:'#ff2a4a',paso(U){if(U.t>=60&&U.t<=104&&U.t%5==0)caerSobre('lanza',32,16);if(U.t==114)G.spears.push({own:G.P,kind:'lanza',x:U.foco.x,y:U.foco.y-340,ty:U.foco.y-6,big:1,dmg:260,rad:60})}},
celestial:{n:'Corte Celestial',c:'#ffe94a',paso(U){if(U.t>=60&&U.t<=104&&U.t%6==0){const T=objetivos(),tg=T[Math.floor(Math.random()*T.length)];if(tg){golpeArco(tg.x,tg.y,rnd(0,6.3),38,6.3,30,4,true,'#ffe94a');sfx('tajo')}}
 if(U.t==114){[.7,-.7].forEach(a=>G.cortes.push({x:U.foco.x,y:U.foco.y-20,a,l:24}));objetivos().forEach(t=>dañar(t,t.boss?240:130,22));golpeFinal(U.foco.x,U.foco.y-20,'#ffe94a')}}},
lluvia:{n:'Lluvia de Flechas',c:'#7cff4a',paso(U){if(U.t>=60&&U.t<=110&&U.t%2==0)caerSobre('flecha',13,10);if(U.t==114)G.spears.push({own:G.P,kind:'flecha',x:U.foco.x,y:U.foco.y-340,ty:U.foco.y-6,big:1,dmg:220,rad:55})}},
terremoto:{n:'Terremoto',c:'#ffb04a',paso(U){G.shake=Math.max(G.shake,U.t<114?5:0);if(U.t>=60&&U.t<=110&&U.t%7==0){caerSobre('roca',30,16);const P=G.P,T=objetivos(),tg=T[Math.floor(Math.random()*T.length)];
 if(tg)for(let k=0;k<6;k++)decal(P.x+(tg.x-P.x)*k/6+rnd(-4,4),P.y+(tg.y+10-P.y)*k/6+rnd(-3,3),3,'#1a120a',400)}
 if(U.t==114){objetivos().forEach(t=>dañar(t,t.boss?200:120,24));ring(G.P.x,G.P.y,160,'#ffb04a',30,4);sfx('pisoton');for(let k=0;k<14;k++)decal(rnd(40,440),rnd(60,300),rnd(4,10),'#1a120a',600);golpeFinal(U.foco.x,U.foco.y-10,'#ffb04a')}}},
torbellino:{n:'Torbellino de Dagas',c:'#c3c8d8',paso(U){if(U.t<56||U.t>114)return;const P=G.P;if(U.t==56)U.cuch=[...Array(12)].map((_,i)=>i*.5236);U.rad=U.t<112?20+(U.t-56)*2.6:U.rad;
 U.cuch=U.cuch.map(a=>a+.18);U.cuch.forEach(a=>{const x=P.x+Math.cos(a)*U.rad,y=P.y-12+Math.sin(a)*U.rad*.7;objetivos().forEach(t=>{if(Math.hypot(t.x-x,t.y-y)<t.r+6&&G.t-(t.ref._tb||0)>8){t.ref._tb=G.t;dañar(t,10,1)}});if(G.t%2==0)G.pt.push({x,y,vx:0,vy:0,l:10,m:10,c:'#c3c8d8',s:1,g:0})});
 if(U.t==114){objetivos().forEach(t=>dañar(t,t.boss?200:110,20));golpeFinal(U.foco.x,U.foco.y-20,'#c3c8d8');U.cuch=null}}}};
function caerSobre(kind,dmg,rad){const U=G.U,B=G.B,T=objetivos(),tg=B&&!B.dead?null:T[Math.floor(Math.random()*T.length)],x=tg?tg.ref.x+rnd(-8,8):U.foco.x+rnd(-34,34),y=tg?tg.ref.y:U.foco.y-rnd(10,40);
G.spears.push({own:G.P,kind,x,y:y-230,ty:y,big:0,dmg,rad})}
