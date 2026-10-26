// Música: temas grabados de OpenGameArt (CC0) en bucle por tipo de sala, y una fanfarria sintetizada al ganar.
let musicaOn=true,pista=null,mStep=0,mNext=0,musBus=null,fuenteM=null,temaAct=null;
try{musicaOn=localStorage.getItem('mazmorra-musica')!=='no'}catch(e){}
const TEMAS={sala:{src:'musica/salas.mp3'},jefe_zombi:{src:'musica/rey.mp3'},jefe_ogro:{src:'musica/gruk.mp3',intro:'musica/gruk-intro.mp3'},final:{src:'musica/cenizas.mp3'}};
const FANFARRIA={bpm:132,ch:[[60,64,67],[60,64,67],[65,69,72],[67,71,74]],bajo:[48,48,53,55],dr:'k...k...k...k.k.',lead:[
72,0,72,0,72,0,76,0,79,0,0,0,76,0,79,0, 84,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
81,0,79,0,77,0,76,0,74,0,72,0,74,0,76,0, 79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
function bus(){if(!musBus){musBus=AC.createGain();musBus.gain.value=musicaOn?.55:0;musBus.connect(AC.destination)}return musBus}
// El MP3 trae unos milisegundos de silencio al principio y al final; se saltan para que el bucle no tenga corte.
function bordes(b){const d=b.getChannelData(0),u=1e-3;let i=0,f=d.length-1;while(i<f&&Math.abs(d[i])<u)i++;while(f>i&&Math.abs(d[f])<u)f--;b.ini=i/b.sampleRate;b.fin=(f+1)/b.sampleRate;return b}
function cargarTema(n){const T=TEMAS[n];if(!T||!AC)return Promise.resolve();
return T.p||(T.p=Promise.all([T.src,T.intro].filter(Boolean).map(u=>fetch(u).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(a=>AC.decodeAudioData(a)).then(bordes))).then(([b,i])=>{T.buf=b;T.ibuf=i}).catch(()=>{T.p=null}))}
function precargarMusica(){cargarTema('sala').then(()=>Object.keys(TEMAS).forEach(cargarTema))}
function soltar(){if(!fuenteM)return;const {g,ss}=fuenteM,t=AC.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+.6);ss.forEach(s=>{try{s.stop(t+.65)}catch(e){}});fuenteM=null}
function tocarTema(n){const T=TEMAS[n];if(!T.buf||temaAct!==n)return;soltar();const g=AC.createGain(),t=AC.currentTime+.05;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+.8);g.connect(bus());
const ss=[];let t0=t;if(T.ibuf){const s=AC.createBufferSource();s.buffer=T.ibuf;s.connect(g);s.start(t,T.ibuf.ini,T.ibuf.fin-T.ibuf.ini);ss.push(s);t0=t+T.ibuf.fin-T.ibuf.ini}
const l=AC.createBufferSource();l.buffer=T.buf;l.loop=true;l.loopStart=T.buf.ini;l.loopEnd=T.buf.fin;l.connect(g);l.start(t0,T.buf.ini);ss.push(l);fuenteM={g,ss}}
function musica(n){if(temaAct===n&&fuenteM)return;temaAct=n;pista=null;if(!AC)return;
if(n=='victoria'){soltar();pista=FANFARRIA;mStep=0;mNext=AC.currentTime+.08;return}
if(!TEMAS[n]){soltar();return}cargarTema(n).then(()=>tocarTema(n))}
const hz=v=>440*Math.pow(2,(v-69)/12);
function notaM(type,f,t,dur,vol){const os=AC.createOscillator(),g=AC.createGain();os.type=type;os.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.0005,t+dur);os.connect(g);g.connect(bus());os.start(t);os.stop(t+dur+.02)}
function golpeM(k,t){if(k=='k'){const os=AC.createOscillator(),g=AC.createGain();os.frequency.setValueAtTime(150,t);os.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);os.connect(g);g.connect(bus());os.start(t);os.stop(t+.15);return}
const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noise;f.type='highpass';f.frequency.value=1500;g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);s.connect(f);f.connect(g);g.connect(bus());s.start(t);s.stop(t+.12)}
function pasoM(i,t){const p=pista,sd=60/p.bpm/4,bar=Math.floor(i/16)%4,st=i%16;
if(st%2==0)notaM('triangle',hz(p.bajo[bar]+(st%4==2?12:0)),t,sd*1.8,.11);notaM('square',hz(p.ch[bar][st%3]+12),t,sd*.8,.012);
const v=p.lead[i%64];if(v)notaM('square',hz(v),t,sd*1.9,.03);const dch=p.dr[st];if(dch!='.')golpeM(dch,t)}
function alternarMusica(){musicaOn=!musicaOn;try{localStorage.setItem('mazmorra-musica',musicaOn?'si':'no')}catch(e){}if(musBus)musBus.gain.value=musicaOn?.55:0;
document.querySelectorAll('.btnMusica').forEach(b=>{b.textContent=musicaOn?'Música: sí':'Música: no';b.setAttribute('aria-pressed',musicaOn)})}
setInterval(()=>{if(!AC||!pista)return;if(mNext<AC.currentTime-.2)mNext=AC.currentTime+.02;
while(pista&&mNext<AC.currentTime+.15){pasoM(mStep,mNext);mNext+=60/pista.bpm/4;mStep++;if(mStep>=pista.lead.length)pista=null}},40);
document.querySelectorAll('.btnMusica').forEach(b=>b.addEventListener('click',alternarMusica));
if(!musicaOn){musicaOn=true;alternarMusica()}
