// Motor: lienzos, atlas, sonido, entradas, bucle, cámara, dibujo del mundo y del HUD.
const cv=document.getElementById('cv'),o=cv.getContext('2d');o.imageSmoothingEnabled=false;
const mk=(a,b)=>{const c=document.createElement('canvas');c.width=a;c.height=b;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]};
const [wc,w]=mk(WW,WH),[fc,fx]=mk(WW,WH);
const atlas=new Image();atlas.src=ATLAS_SRC;let white,red,cyan;
let G,keys={},mouse={x:OW/2,y:OH/2,down:false},touch={move:null,aim:null},running=false;
const coarse=matchMedia('(pointer: coarse)').matches;
let AC,noise,sfxBus;
function initAudio(){try{if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate;noise=AC.createBuffer(1,n,n);const d=noise.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;sfxBus=AC.createGain();sfxBus.gain.value=1;sfxBus.connect(AC.destination)}AC.resume?.()}catch(e){AC=null}}
function sfx(k){if(!AC)return;const t=AC.currentTime,g=AC.createGain();g.connect(sfxBus);
const tone=(type,f1,f2,dur,vol)=>{const os=AC.createOscillator();os.type=type;os.frequency.setValueAtTime(f1,t);os.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);os.connect(g);os.start(t);os.stop(t+dur)};
const hiss=(dur,vol,freq)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=noise;f.type='lowpass';f.frequency.value=freq;s.connect(f);f.connect(g);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);s.start(t);s.stop(t+dur)};
({ice:()=>tone('square',1200,500,.07,.03),fire:()=>tone('sawtooth',260,70,.18,.05),bolt:()=>hiss(.18,.12,5000),hit:()=>tone('triangle',180,60,.08,.07),
boom:()=>hiss(.5,.18,700),hurt:()=>tone('square',320,90,.25,.07),ult:()=>tone('sawtooth',70,420,.7,.06),roar:()=>tone('sawtooth',90,40,.7,.09),dash:()=>hiss(.1,.05,2500),
door:()=>tone('triangle',220,440,.4,.06),pick:()=>tone('square',600,1400,.15,.04),spawn:()=>tone('sine',300,900,.3,.04),land:()=>hiss(.6,.22,400),throw:()=>tone('triangle',200,120,.2,.06)})[k]?.()}
const rnd=(a,b)=>a+Math.random()*(b-a);
function spr(x,src,r,dx,dy,flip,sc){sc=sc||1;x.save();x.translate(Math.round(dx),Math.round(dy));if(flip)x.scale(-1,1);x.drawImage(src,r[0],r[1],r[2],r[3],-r[2]*sc/2,-r[3]*sc,r[2]*sc,r[3]*sc);x.restore()}
function tile(x,r,tx,ty){x.drawImage(atlas,r[0],r[1],16,16,tx*16,ty*16,16,16)}
function tint(col){const [c,x]=mk(512,512);x.drawImage(atlas,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,512,512);return c}
const lvl=id=>G.P.mej[id]||0;
const zb=()=>G.B&&!G.B.dead?.8:1;
function newRun(){const p=PERS(),s=p[ELEGIDO.sexo];G={sala:0,start:performance.now(),kills:0,P:{x:240,y:285,hp:p.hp,max:p.hp,sp:p.sp,spr:s.spr,nombre:s.n,src:atlasVestuario(ELEGIDO.vest),tecs:p.tecs,ult:p.ult,arma:nuevaArma(p.ini),
cds:[0,0,0],combo:0,comboT:-99,swing:0,escudo:0,est:null,inv:0,dash:0,dcd:0,dx:0,dy:0,face:1,spell:0,meter:0,hurt:0,moving:false,ax:240,ay:100,kick:0,circ:0,mej:{}}}}
function resetSala(){Object.assign(G,{t:0,stop:0,slow:1,slowT:0,shake:0,zoom:1,zt:1,dark:0,flash:0,fcol:'#fff',inv:0,acc:0,over:0,cam:{x:240,y:250},
B:null,enem:[],spawns:[],shots:[],bul:[],pt:[],nums:[],bolts:[],spears:[],ghosts:[],rings:[],decals:[],marcas:[],pick:[],tajos:[],cortes:[],ondas:[],frascos:[],nubes:[],armas:[],cerca:null,U:null,banner:null,intro:null,aviso:null,door:0,clear:0,fade:1,salir:0,ola:0,olaT:0})}
function burst(x,y,n,c,sp,l,s,g){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=Math.random()*sp;G.pt.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:l||24,m:l||24,c,s:s||(Math.random()<.4?2:1),g:g||0})}}
function num(x,y,v,big){G.nums.push({x:x+rnd(-8,8),y,v:Math.round(v),l:big?70:40,big})}
function ring(x,y,r,c,l,lw){G.rings.push({x,y,r0:2,r,c,l,m:l,lw:lw||2})}
function decal(x,y,r,c,l){G.decals.push({x,y,r,c,l,m:l});if(G.decals.length>60)G.decals.shift()}
function solidAt(x,y,pad){if(y<34+pad)return !(G.door&&x>229&&x<251&&y>6);if(x<16+pad||x>WW-16-pad||y>WH-18-pad)return true;
return SALAS[G.sala].cols.some(([cx,cy])=>x>cx*16-pad&&x<cx*16+16+pad&&y>cy*16-pad&&y<cy*16+16+pad)}
function hurtPlayer(){const P=G.P;if(P.inv>0||P.dash>0||P.est||G.U||G.over||G.intro)return;P.hp--;P.inv=70;P.hurt=20;G.shake=10;G.stop=6;G.flash=6;G.fcol='#ff2a2a';burst(P.x,P.y-12,18,'#ff4a5a',2.5);ring(P.x,P.y-10,18,'#ff4a5a',14);sfx('hurt');
if(P.hp<=0){G.over=1;G.slow=0.3;G.slowT=9999;musica(null);setTimeout(()=>end(false),1400)}}
function step(){const P=G.P;G.t++;if(G.slowT>0&&--G.slowT==0)G.slow=1;
let mx=0,my=0;if(keys.KeyA||keys.ArrowLeft)mx--;if(keys.KeyD||keys.ArrowRight)mx++;if(keys.KeyW||keys.ArrowUp)my--;if(keys.KeyS||keys.ArrowDown)my++;
if(touch.move){mx=touch.move.dx;my=touch.move.dy}
const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml}P.dx=mx;P.dy=my;
const vw=VW/G.zoom,vh=VH/G.zoom,tg=objetivoCercano();
if(touch.aim&&(Math.abs(touch.aim.dx)+Math.abs(touch.aim.dy)>0.2)){P.ax=P.x+touch.aim.dx*100;P.ay=P.y-14+touch.aim.dy*100}
else if(touch.aim||coarse){P.ax=tg?tg.x:P.x+P.face*50;P.ay=tg?tg.y:P.y-14}
else{P.ax=G.cam.x+(mouse.x/OW-.5)*vw;P.ay=G.cam.y+(mouse.y/OH-.5)*vh}
P.face=P.ax<P.x?-1:1;
const libre=!G.over&&!G.U&&!G.intro&&!G.salir;
if(libre&&!P.est){let vx,vy;const sp=P.sp*(1+.15*lvl('pies'));if(P.dash>0){P.dash--;[vx,vy]=P.dashV;if(G.t%2==0)G.ghosts.push({x:P.x,y:P.y,face:P.face,l:14});if(P.dash==0)burst(P.x,P.y,6,'#8a7a9a',1,16)}else{vx=mx*sp;vy=my*sp}
if(!solidAt(P.x+vx,P.y,4))P.x+=vx;if(!solidAt(P.x,P.y+vy,4))P.y+=vy;P.moving=ml>0.1||P.dash>0;if(P.moving&&!P.dash&&G.t%14==0)G.pt.push({x:P.x+rnd(-3,3),y:P.y,vx:0,vy:-.2,l:14,m:14,c:'#5a4a6a',s:1,g:0});
if(mouse.down||touch.aim)cast()}else P.moving=!!P.est;
P.cds=P.cds.map(c=>c>0?c-1:0);['dcd','inv','hurt','kick','circ','swing'].forEach(k=>{if(P[k]>0)P[k]--});
if(G.B)updateJefe();updateEnemigos();updatePoderes();updateSala();
G.pt.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.93;p.vy=p.vy*.93+p.g;p.l--});G.pt=G.pt.filter(p=>p.l>0);if(G.pt.length>1500)G.pt.splice(0,G.pt.length-1500);
G.ghosts.forEach(g=>g.l--);G.ghosts=G.ghosts.filter(g=>g.l>0);G.rings.forEach(r=>r.l--);G.rings=G.rings.filter(r=>r.l>0);G.decals.forEach(d=>d.l--);G.decals=G.decals.filter(d=>d.l>0);
G.nums.forEach(n=>{n.y-=.45;n.l--});G.nums=G.nums.filter(n=>n.l>0);if(G.banner)G.banner.t++;if(G.aviso&&--G.aviso.l<=0)G.aviso=null;
if(!G.U&&!(G.B&&G.B.dead))G.dark=Math.max(0,G.dark-.04);
const B=G.B;let focus;if(G.intro||(B&&B.dead&&B.dt<170))focus={x:B.x,y:B.y-30};else if(G.U)focus=G.U.t<55?P:G.U.foco;else{focus={x:P.x+(P.ax-P.x)*.22,y:P.y-14+(P.ay-P.y)*.22};if(B&&!B.dead){focus.x=focus.x*.7+B.x*.3;focus.y=focus.y*.7+(B.y-B.z-30)*.3}}
G.cam.x+=(focus.x-G.cam.x)*.1;G.cam.y+=(focus.y-G.cam.y)*.1;G.zoom+=(G.zt-G.zoom)*.1;if(!G.U&&!(B&&B.dead)&&!G.intro)G.zt+=(zb()-G.zt)*.05;
G.cam.x=Math.max(vw/2,Math.min(WW-vw/2,G.cam.x));G.cam.y=Math.max(vh/2,Math.min(WH-vh/2,G.cam.y));G.shake*=.86;if(G.flash>0)G.flash--}
function drawPlayer(){const P=G.P,t=G.t;if(P.inv>0&&t%6<3&&!G.over)return;
if(P.circ>0){const c=TEC[P.tecs[P.spell]].c,k=P.circ/12;w.strokeStyle=c;w.globalAlpha=k;w.lineWidth=1;w.beginPath();w.ellipse(P.x,P.y,12+(1-k)*6,4+(1-k)*2,0,0,7);w.stroke();for(let i=0;i<8;i++){const a=t*.15+i*.785;w.fillStyle=c;w.fillRect(Math.round(P.x+Math.cos(a)*(13+(1-k)*6)),Math.round(P.y+Math.sin(a)*(4.5+(1-k)*2)),1,1)}w.globalAlpha=1}
w.fillStyle='rgba(0,0,0,.35)';w.beginPath();w.ellipse(P.x,P.y,6,2,0,0,7);w.fill();
const fr=P.hurt>0||G.over?P.spr.hit:(P.moving?P.spr.run:P.spr.idle)[Math.floor(t/(P.moving?5:9))%4],A=armaInfo(P.arma),[sx,sy,sw,sh]=A.spr,tipo=ARMAS[P.arma.id].tipo,a=Math.atan2(P.ay-(P.y-14),P.ax-P.x),back=Math.sin(Math.atan2(P.ay-P.y,P.ax-P.x))<-0.3;
const staff=()=>{const kk=P.kick>0?-P.kick*.8:0;let ang=a+Math.PI/2;if(P.swing>0)ang+=(P.swing/12-.5)*2.6*P.face;
w.save();w.translate(Math.round(P.x+Math.cos(a)*(5+kk)),Math.round(P.y-12+Math.sin(a)*(3+kk)));w.rotate(tipo=='arco'?a:ang);w.drawImage(atlas,sx,sy,sw,sh,-sw/2,tipo=='arco'?-sh/2:-sh+8,sw,sh);
if(tipo=='baston'&&(P.cds[P.spell]>0||G.U)){const c=G.U?ULT[P.ult].c:TEC[P.tecs[P.spell]].c;w.fillStyle=c;w.globalAlpha=.5+Math.sin(t*.6)*.3;w.fillRect(-2,-sh+6,4,4);w.globalAlpha=1}w.restore()};
if(back)staff();spr(w,P.dash||P.est?white:P.src,fr,P.x,P.y,P.face<0);if(P.hurt>0)spr(w,white,fr,P.x,P.y,P.face<0);if(!back)staff()}
function drawWorld(){const t=G.t;w.drawImage(fc,0,0);
G.decals.forEach(d=>{w.globalAlpha=Math.min(1,d.l/60)*.7;w.fillStyle=d.c;w.beginPath();w.ellipse(d.x,d.y,d.r,d.r*.55,0,0,7);w.fill()});w.globalAlpha=1;
drawSala();G.marcas.forEach(m=>{w.strokeStyle=m.t%8<4?'#ff3a2a':'#ffe94a';w.lineWidth=1;w.beginPath();w.ellipse(m.x,m.y,10,4,0,0,7);w.stroke();w.fillStyle='rgba(0,0,0,.4)';w.beginPath();w.ellipse(m.x,m.y,10*(1-m.t/45),4*(1-m.t/45),0,0,7);w.fill()});
const ents=[];SALAS[G.sala].cols.forEach(([cx,cy])=>ents.push({y:cy*16+16,d:()=>w.drawImage(atlas,80,80,16,48,cx*16,cy*16-32,16,48)}));
G.ghosts.forEach(g=>ents.push({y:g.y-1,d:()=>{w.globalAlpha=g.l/30;if(g.boss)spr(w,red,g.fr,g.x,g.y,g.face<0,2);else spr(w,white,G.P.spr.run[0],g.x,g.y,g.face<0);w.globalAlpha=1}}));
if(G.B)ents.push({y:G.B.y,d:drawJefe});drawEnemigos(ents);ents.push({y:G.P.y,d:drawPlayer});
ents.sort((a,b)=>a.y-b.y).forEach(e=>e.d());drawPoderes();
G.pt.forEach(p=>{w.globalAlpha=Math.min(1,p.l/p.m*1.6);w.fillStyle=p.c;w.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s)});w.globalAlpha=1;
if(G.dark>0){w.fillStyle='rgba(5,0,10,'+G.dark+')';w.fillRect(0,0,WW,WH)}}
const FUENTE='"Pixelify Sans",monospace',CIFRAS='"Press Start 2P",monospace';
function txt(s,x,y,size,col,al,sh){o.font=/\d/.test(s)?Math.round(size*.62)+'px '+CIFRAS:(size>=20?'700 ':'400 ')+size+'px '+FUENTE;o.letterSpacing='0.5px';o.textAlign=al||'left';if(sh){o.fillStyle='#000';o.fillText(s,x+2,y+2)}o.fillStyle=col;o.fillText(s,x,y)}
function drawHud(){const P=G.P,B=G.B,t=G.t,sala=SALAS[G.sala];
for(let i=0;i<P.max/2;i++){const v=P.hp-i*2,r=v>=2?R.hFull:v==1?R.hHalf:R.hEmpty;o.drawImage(atlas,r[0],r[1],13,12,18+i*44,16,39,36)}
const full=P.meter>=100;o.fillStyle='rgba(10,6,16,.8)';o.fillRect(18,60,140,14);o.fillStyle=full?(t%20<10?'#ff2a4a':'#ffffff'):'#a0204a';o.fillRect(20,62,136*P.meter/100,10);
txt(full?ULT[P.ult].n+(coarse?'':' · Q'):'Furia',20,94,15,full?'#ffe94a':'#c3b6d9');
const AI=armaInfo(P.arma);o.fillStyle='rgba(10,6,16,.8)';o.fillRect(18,104,40,40);o.strokeStyle=AI.raro?'#5ee7ff':'#4e4070';o.lineWidth=2;o.strokeRect(19,105,38,38);
o.save();o.translate(38,124);o.rotate(.785);const sk=Math.max(1,Math.floor(30/Math.max(AI.spr[2],AI.spr[3])));o.drawImage(atlas,AI.spr[0],AI.spr[1],AI.spr[2],AI.spr[3],-AI.spr[2]*sk/2,-AI.spr[3]*sk/2,AI.spr[2]*sk,AI.spr[3]*sk);o.restore();
txt(AI.n,66,120,15,AI.raro?'#5ee7ff':'#f1e9ff');txt(AI.d,66,138,12,'#c3b6d9');
txt('Sala '+(G.sala+1)+' de '+SALAS.length,OW-18,32,15,'#c3b6d9','right');txt(sala.n,OW-18,52,17,'#f1e9ff','right');txt(musicaOn?'M · música sí':'M · música no',OW-18,72,13,'#8f82a6','right');
if(B&&(!B.dead||B.dt<100)&&!G.intro){o.fillStyle='rgba(10,6,16,.85)';o.fillRect(OW/2-230,16,460,22);o.fillStyle='#3a1020';o.fillRect(OW/2-226,20,452,14);o.fillStyle=B.phase>B.def.fases.length?'#ff3a2a':'#c8324a';o.fillRect(OW/2-226,20,452*B.hp/B.max,14);
o.fillStyle='#ff8a9a';o.fillRect(OW/2-226,20,452*B.hp/B.max,3);o.fillStyle='#0b0812';B.def.fases.forEach(f=>o.fillRect(OW/2-226+452*f[0],20,2,14));txt(B.def.n,OW/2,58,16,'#f1e9ff','center')}
else if(sala.tipo=='pelea'&&!G.clear){const n=G.enem.length+G.spawns.length;txt('Oleada '+(G.ola+1)+' de '+sala.oleadas.length+(n?' · quedan '+n:''),OW/2,34,18,'#f1e9ff','center',1)}
P.tecs.forEach((id,i)=>{const s=TEC[id],x=18+i*66,y=OH-74,sel=P.spell==i;o.fillStyle='rgba(10,6,16,.8)';o.fillRect(x,y,58,58);o.strokeStyle=sel?s.c:'#4e4070';o.lineWidth=sel?3:2;o.strokeRect(x+1,y+1,56,56);
icono(o,id,x+29,y+23,3);if(lvl(id)){o.fillStyle='#ffe94a';for(let k=0;k<lvl(id);k++)o.fillRect(x+6+k*6,y+6,4,4)}
const cdT=Math.round(s.cd*armaInfo(P.arma).cdm);if(P.cds[i]>0){o.fillStyle='rgba(0,0,0,.55)';o.fillRect(x+3,y+3,52,Math.min(52,52*P.cds[i]/cdT))}txt(s.n,x+29,y+52,13,sel?'#f1e9ff':'#c3b6d9','center');if(!coarse){o.font='9px '+CIFRAS;o.fillStyle='#8f82a6';o.textAlign='left';o.fillText(i+1,x+45,y+14)}});
const vw=VW/G.zoom,vh=VH/G.zoom,toS=(x,y)=>[(x-G.cam.x)/vw*OW+OW/2,(y-G.cam.y)/vh*OH+OH/2];
if(P.combo>0&&G.t-P.comboT<50&&P.tecs[P.spell]=='rayo'){const [cx,cy]=toS(P.x,P.y-34);txt('x'+(P.combo+1),cx,cy,22,P.combo==2?'#ffe94a':'#b9f3ff','center',1)}
if(G.cerca){const c=G.cerca,I=armaInfo(c.arma),[cx,cy]=toS(c.x,c.y-26),t1=(coarse?'Tomar: ':'E · Tomar ')+I.n;o.font='700 17px '+FUENTE;const tw=Math.max(o.measureText(t1).width,o.measureText(I.d).width*.8)+28;
o.fillStyle='rgba(10,6,16,.9)';o.fillRect(cx-tw/2,cy-50,tw,50);o.strokeStyle=I.raro?'#5ee7ff':'#c3b6d9';o.lineWidth=2;o.strokeRect(cx-tw/2,cy-50,tw,50);txt(t1,cx,cy-28,17,I.raro?'#5ee7ff':'#ffffff','center');txt(I.d,cx,cy-10,13,'#c3b6d9','center')}
o.textAlign='center';G.nums.forEach(n=>{const [sx,sy]=toS(n.x,n.y);o.globalAlpha=Math.min(1,n.l/15);o.font=(n.big?28:14)+'px '+CIFRAS;o.fillStyle='#000';o.fillText(n.v,sx+3,sy+3);o.fillStyle=n.big?'#ffe94a':'#ffffff';o.fillText(n.v,sx,sy)});o.globalAlpha=1;
if(B&&B.sayT>0&&!B.dead){const [sx,sy]=toS(B.x,B.y-B.z-84);o.font='700 22px '+FUENTE;const tw=o.measureText(B.say).width+28;o.fillStyle='#f1e9ff';o.fillRect(sx-tw/2,sy-30,tw,40);o.fillStyle='#7a1f3d';o.textAlign='center';o.fillText(B.say,sx,sy-2)}
if(G.intro&&B){const k=Math.min(1,G.intro.t/14),out=G.intro.t>100?(G.intro.t-100)/20:0;o.globalAlpha=1-out;o.fillStyle='#0b0004';o.beginPath();o.moveTo(0,OH-150);o.lineTo(OW*k,OH-190);o.lineTo(OW*k,OH-90);o.lineTo(0,OH-60);o.fill();
o.fillStyle='#ff2a4a';o.fillRect(0,OH-196,OW*k,6);txt(B.def.n.toUpperCase(),60+(1-k)*-400,OH-130,46,'#ffffff','left',1);txt(B.def.sub,64+(1-k)*-400,OH-96,20,'#ff8a9a','left');o.globalAlpha=1}
if(G.banner){const k=Math.min(1,G.banner.t/8);o.strokeStyle='rgba(255,255,255,.35)';o.lineWidth=2;for(let i=0;i<36;i++){const a=Math.random()*6.283;o.beginPath();o.moveTo(OW/2+Math.cos(a)*300,OH/2+Math.sin(a)*200);o.lineTo(OW/2+Math.cos(a)*700,OH/2+Math.sin(a)*500);o.stroke()}
o.fillStyle=G.banner.c||'#ff2a4a';o.fillRect(0,OH/2-48,OW*k,96);o.fillStyle='#0b0004';o.fillRect(0,OH/2-40,OW*k,80);o.globalAlpha=k;txt(G.banner.txt,OW/2+(1-k)*300,OH/2+18,54,'#ffffff','center');o.globalAlpha=1}
if(G.aviso){o.globalAlpha=Math.min(1,G.aviso.l/20);txt(G.aviso.txt,OW/2,OH/2-150,32,'#ffe94a','center',1);o.globalAlpha=1}
if(G.slow<1||G.intro){o.fillStyle='#000';o.fillRect(0,0,OW,34);o.fillRect(0,OH-34,OW,34)}
[[touch.move,'241,233,255'],[touch.aim,'94,231,255']].forEach(([m,c])=>{if(!m)return;o.strokeStyle='rgba('+c+',.5)';o.lineWidth=3;o.beginPath();o.arc(m.ox,m.oy,60,0,7);o.stroke();o.fillStyle='rgba('+c+',.5)';o.beginPath();o.arc(m.ox+m.dx*60,m.oy+m.dy*60,24,0,7);o.fill()})}
function render(){const vw=VW/G.zoom,vh=VH/G.zoom,sx=(Math.random()-.5)*G.shake,sy=(Math.random()-.5)*G.shake;drawWorld();
o.fillStyle='#000';o.fillRect(0,0,OW,OH);o.drawImage(wc,G.cam.x-vw/2+sx,G.cam.y-vh/2+sy,vw,vh,0,0,OW,OH);
const vg=o.createRadialGradient(OW/2,OH/2,OH*.35,OW/2,OH/2,OH*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');o.fillStyle=vg;o.fillRect(0,0,OW,OH);
document.getElementById('tTomar').hidden=!(coarse&&G.cerca);drawHud();if(G.flash>0){o.globalAlpha=G.flash/14;o.fillStyle=G.fcol;o.fillRect(0,0,OW,OH);o.globalAlpha=1}
if(G.fade>0){o.fillStyle='rgba(0,0,0,'+Math.min(1,G.fade)+')';o.fillRect(0,0,OW,OH)}
cv.style.filter=G.inv>0?'invert(1) grayscale(1) contrast(4)':'';if(G.inv>0)G.inv--}
let last=0;
function frame(now){requestAnimationFrame(frame);if(!running||!G)return;const el=Math.min(50,now-(last||now));last=now;
if(G.stop>0){G.stop--;render();return}G.acc+=G.slow*el/16.67;let n=0;while(G.acc>=1&&n<4){step();G.acc--;n++}render()}
function end(win){if(!running)return;running=false;cv.style.filter='';musica(win?'victoria':null);const s=Math.round((performance.now()-G.start)/1000),antes=VESTUARIOS.filter(desbloqueado).length;
if(win){guardarLogro('cenizas');const g=LOGROS.ganadores||[];if(!g.includes(PERS().id))guardarLogro('ganadores',g.concat([PERS().id]))}const nuevos=VESTUARIOS.filter(desbloqueado).length-antes;
document.getElementById('endTitle').textContent=win?'¡La mazmorra es tuya!':'Caíste';
document.getElementById('endText').textContent=win?'Venciste a los tres jefes en '+Math.floor(s/60)+' min '+(s%60)+' s y derrotaste a '+G.kills+' enemigos.'+(nuevos?' Desbloqueaste un vestuario nuevo.':''):'Llegaste a la sala '+(G.sala+1)+' de '+SALAS.length+': '+SALAS[G.sala].n+'. Rueda a través de las balas: mientras ruedas no te tocan.';
document.getElementById('endScr').hidden=false;document.getElementById('againBtn').focus()}
function start(){initAudio();precargarMusica();newRun();entrarSala(0);['menu','endScr','mejoras','elegir'].forEach(id=>document.getElementById(id).hidden=true);document.getElementById('tbtns').hidden=!coarse;running=true;last=0}
document.getElementById('playBtn').onclick=abrirElegir;document.getElementById('againBtn').onclick=abrirElegir;document.getElementById('empezarBtn').onclick=start;
if(coarse){document.getElementById('keysPc').hidden=true;document.getElementById('keysTouch').hidden=false}
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code=='KeyM'){alternarMusica();return}
if(!document.getElementById('mejoras').hidden&&/^Digit[1-3]$/.test(e.code)){document.querySelectorAll('#mejorasLista button')[+e.code.slice(5)-1]?.click();return}if(!running||!G)return;if(e.code=='Space'||e.code=='ShiftLeft'){dash();e.preventDefault()}if(e.code=='KeyQ')ult();if(e.code=='KeyE')tomar();
if(['Digit1','Digit2','Digit3'].includes(e.code))G.P.spell=+e.code.slice(5)-1;if(e.code.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>{keys[e.code]=false});addEventListener('blur',()=>{keys={};mouse.down=false});
const toC=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*OW,(e.clientY-r.top)/r.height*OH]};
cv.addEventListener('mousemove',e=>{[mouse.x,mouse.y]=toC(e)});
cv.addEventListener('mousedown',e=>{[mouse.x,mouse.y]=toC(e);if(e.button==2){if(running&&G)ult()}else mouse.down=true});
addEventListener('mouseup',()=>{mouse.down=false});cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('wheel',e=>{if(running&&G)G.P.spell=(G.P.spell+(e.deltaY>0?1:2))%3},{passive:true});
function stick(s,x,y){const dx=x-s.ox,dy=y-s.oy,m=Math.hypot(dx,dy),c=Math.min(1,m/60);s.dx=m?dx/m*c:0;s.dy=m?dy/m*c:0}
cv.addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches){const [x,y]=toC(t);const s={id:t.identifier,ox:x,oy:y,dx:0,dy:0};if(x<OW/2&&!touch.move)touch.move=s;else if(x>=OW/2&&!touch.aim)touch.aim=s}},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){const [x,y]=toC(t);if(touch.move?.id===t.identifier)stick(touch.move,x,y);if(touch.aim?.id===t.identifier)stick(touch.aim,x,y)}},{passive:false});
const tend=e=>{for(const t of e.changedTouches){if(touch.move?.id===t.identifier)touch.move=null;if(touch.aim?.id===t.identifier)touch.aim=null}};cv.addEventListener('touchend',tend);cv.addEventListener('touchcancel',tend);
const tap=(id,fn)=>document.getElementById(id).addEventListener('touchstart',e=>{e.preventDefault();if(running&&G)fn()},{passive:false});
tap('tDash',dash);tap('tUlt',ult);tap('tTomar',()=>tomar());tap('tSpell',()=>{G.P.spell=(G.P.spell+1)%3});
atlas.onload=()=>{white=tint('#ffffff');red=tint('#ff2a2a');cyan=tint('#5ee7ff');newRun();resetSala();buildFloor(0);G.fade=0;render();requestAnimationFrame(frame)};
document.fonts?.load('700 16px "Pixelify Sans"');document.fonts?.load('14px "Press Start 2P"');
