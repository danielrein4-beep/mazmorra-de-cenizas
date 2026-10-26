// Efectos de sonido épicos hechos con el sintetizador del navegador: capas de golpe grave,
// ruido filtrado, distorsión y eco de sala, con un compresor al final para que suenen grandes sin saturar.
let fxBus=null,revIn=null,curvaDist=null;const ultimoSfx={};
function prepararSonido(){if(fxBus||!AC)return;const comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=5;comp.attack.value=.003;comp.release.value=.2;comp.connect(AC.destination);
fxBus=AC.createGain();fxBus.gain.value=.85;fxBus.connect(comp);const conv=AC.createConvolver(),n=Math.floor(AC.sampleRate*2.4),b=AC.createBuffer(2,n,AC.sampleRate);
for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.8)}conv.buffer=b;revIn=AC.createGain();revIn.gain.value=.5;revIn.connect(conv);conv.connect(comp);
curvaDist=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;curvaDist[i]=31*x/(1+30*Math.abs(x))}}
function envol(t0,dur,vol,rev){const e=AC.createGain();e.gain.setValueAtTime(.0001,t0);e.gain.exponentialRampToValueAtTime(vol,t0+.008);e.gain.exponentialRampToValueAtTime(.0001,t0+dur);e.connect(fxBus);
if(rev){const s=AC.createGain();s.gain.value=rev;e.connect(s);s.connect(revIn)}return e}
// tono(tipo, frecuencia inicial, final, retraso, duración, volumen, eco, distorsión)
function tono(tipo,f1,f2,dt,dur,vol,rev,dis){const t0=AC.currentTime+dt,o=AC.createOscillator(),e=envol(t0,dur,vol,rev);o.type=tipo;o.frequency.setValueAtTime(f1,t0);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t0+dur);
if(dis){const ws=AC.createWaveShaper();ws.curve=curvaDist;o.connect(ws);ws.connect(e)}else o.connect(e);o.start(t0);o.stop(t0+dur+.05)}
// ruido(filtro, frecuencia inicial, final, resonancia, retraso, duración, volumen, eco)
function ruido(tipo,f1,f2,q,dt,dur,vol,rev){const t0=AC.currentTime+dt,s=AC.createBufferSource(),f=AC.createBiquadFilter(),e=envol(t0,dur,vol,rev);s.buffer=noise;s.loop=true;f.type=tipo;f.Q.value=q;
f.frequency.setValueAtTime(f1,t0);f.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t0+dur);s.connect(f);f.connect(e);s.start(t0,Math.random()*.5);s.stop(t0+dur+.05)}
const chispas=(n,dt,vol)=>{for(let i=0;i<n;i++)ruido('highpass',4000+Math.random()*3000,2500,1,dt+i*.025+Math.random()*.01,.03,vol,.2)};
const SND={
hielo:v=>{tono('triangle',2400*v,1700*v,0,.12,.05,.3);tono('sine',3300*v,2600*v,0,.1,.03,.3);ruido('highpass',6000,9000,1,0,.08,.05)},
hieloRompe:v=>{ruido('highpass',5000,3000,1,0,.16,.07,.3);tono('triangle',1900*v,1500*v,0,.2,.035,.4)},
fuego:v=>{ruido('bandpass',380,1900,.8,0,.35,.2,.25);tono('sawtooth',130*v,55,0,.3,.07,.2,1)},
explosion:v=>{tono('sine',95*v,28,0,.7,.55);ruido('lowpass',2600,180,.6,0,.8,.38,.55);tono('square',65*v,32,0,.25,.12,0,1);chispas(3,.05,.04)},
rayo:v=>{ruido('highpass',3200,1400,1,0,.16,.24,.25);tono('sawtooth',1700*v,90,0,.18,.09,.2,1);chispas(4,0,.07)},
trueno:v=>{ruido('lowpass',5000,110,.5,0,1.1,.55,.8);tono('sine',72*v,28,0,.9,.5);tono('sawtooth',1900,70,0,.25,.1,.3,1);chispas(8,0,.09)},
tajo:v=>{ruido('bandpass',700,4200,2.2,0,.15,.22,.2);tono('triangle',1500*v,1420*v,.02,.3,.035,.45);tono('square',3100*v,2900,0,.05,.02)},
estocada:v=>{ruido('bandpass',280,3200,1.5,0,.26,.22,.2);tono('triangle',2050*v,2150*v,.08,.45,.045,.5)},
escudo:v=>{[523,659,784,1046].forEach((f,i)=>tono('sine',f*v,f*v*1.01,i*.03,.7,.04,.7));ruido('highpass',7000,9000,1,0,.4,.03,.5)},
reflejo:v=>tono('triangle',1200*v,2600*v,0,.09,.04,.3),
flecha:v=>{tono('triangle',760*v,330*v,0,.13,.08);ruido('highpass',4200,6000,1,0,.07,.05)},
abanico:v=>{for(let i=0;i<3;i++){tono('triangle',(760+i*60)*v,330*v,i*.035,.13,.06);ruido('highpass',4200,6000,1,i*.035,.06,.04)}},
martillazo:v=>{tono('sine',115*v,34,0,.5,.6);ruido('lowpass',1900,150,.7,0,.38,.42,.45);tono('square',85*v,40,0,.2,.2,0,1);ruido('bandpass',300,120,1,.03,.3,.15,.3)},
hacha:v=>{ruido('bandpass',500,1100,3,0,.4,.1,.2);tono('triangle',300*v,500*v,0,.35,.03)},
pisoton:v=>{tono('sine',62*v,24,0,1.1,.65);ruido('lowpass',900,70,.6,0,1.1,.45,.65);tono('square',48*v,26,0,.4,.18,0,1)},
dagas:v=>{ruido('bandpass',2100,5200,2,0,.07,.1);tono('triangle',2700*v,2500*v,0,.05,.02)},
lanzar:v=>ruido('bandpass',400,1400,2,0,.22,.1,.1),
veneno:v=>{tono('triangle',3100*v,2800*v,0,.16,.045,.3);ruido('highpass',5200,3000,1,0,.13,.07,.2);[0,.08,.15].forEach(d=>tono('sine',420*v,950*v,.12+d,.07,.05))},
sombra:v=>{ruido('bandpass',3200,260,1,0,.32,.22,.3);tono('sawtooth',210*v,55,.05,.32,.12,.5,1)},
ultCarga:v=>{tono('sawtooth',110,440,0,1.1,.07,.5,1);tono('sawtooth',165,660,0,1.1,.05,.5);ruido('bandpass',200,3200,1,0,1.1,.12,.4);tono('sine',55,58,0,1.3,.22)},
ultFinal:v=>{tono('sine',82,24,0,1.5,.7);ruido('lowpass',6500,100,.5,0,1.7,.6,.95);tono('square',56,28,0,.6,.25,0,1);tono('sawtooth',220,110,0,1.1,.07,.8);tono('sawtooth',330,165,0,1.1,.05,.8);chispas(10,0,.08)},
golpe:v=>{ruido('bandpass',1300*v,300,1,0,.07,.18);tono('square',230*v,90,0,.06,.07)},
golpeJefe:v=>{ruido('bandpass',1100*v,250,1,0,.1,.22,.15);tono('square',200*v,80,0,.08,.08);tono('sine',105*v,48,0,.14,.32)},
daño:v=>{tono('square',320*v,85,0,.26,.08,.2,1);ruido('lowpass',1300,300,1,0,.22,.18)},
rugido:v=>{tono('sawtooth',92*v,40,0,1,.17,.6,1);tono('sawtooth',95*v,41,0,1,.12,.6,1);ruido('bandpass',320,110,.6,0,1,.3,.5)},
caida:v=>{tono('sine',75*v,26,0,.7,.55);ruido('lowpass',1200,90,.6,0,.7,.42,.5)},
puerta:v=>{ruido('lowpass',400,120,1,0,.6,.15,.4);[392,523,659].forEach((f,i)=>tono('triangle',f,f,.15+i*.09,.5,.04,.6))},
cofre:v=>{[523,659,784,1046,1318].forEach((f,i)=>tono('square',f,f,i*.07,.2,.03,.5));ruido('highpass',7000,9000,1,.3,.4,.03,.6)},
arma:v=>{ruido('highpass',6200,8000,1,0,.25,.09,.5);tono('triangle',1800,2300,0,.35,.05,.6);tono('triangle',2700,3000,.04,.3,.03,.6)},
recoger:v=>{tono('square',650*v,1400*v,0,.13,.035,.3)},
moneda:v=>{tono('square',1320,1320,0,.05,.025);tono('square',1980,1980,.05,.08,.025,.2)},
aparece:v=>{ruido('bandpass',200,2400,2,0,.35,.08,.4);tono('sine',300*v,900*v,0,.35,.04,.4)},
dash:v=>ruido('bandpass',1400,400,1.2,0,.16,.12)};
const ALIAS={ice:'hielo',fire:'fuego',bolt:'rayo',hit:'golpe',boom:'explosion',hurt:'daño',ult:'ultCarga',roar:'rugido',door:'puerta',pick:'recoger',spawn:'aparece',land:'caida',throw:'lanzar',coin:'moneda'};
function sfx(k){if(!AC)return;prepararSonido();k=ALIAS[k]||k;const f=SND[k];if(!f)return;const ahora=AC.currentTime;if(ultimoSfx[k]&&ahora-ultimoSfx[k]<.035)return;ultimoSfx[k]=ahora;try{f(1+(Math.random()-.5)*.08)}catch(e){}}
