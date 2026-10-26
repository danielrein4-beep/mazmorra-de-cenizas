// Datos fijos del juego: tamaños, recortes del atlas, hechizos, enemigos, salas y mejoras.
const OW=960,OH=540,VW=320,VH=180,WW=480,WH=320;
const f4=(x,y,w,h)=>[0,1,2,3].map(i=>[x+(w||16)*i,y,w||16,h||16]);
const PLANO=Array(14).fill([16,64]);
const R={wizIdle:f4(128,132,16,28),wizRun:f4(192,132,16,28),wizHit:[256,132,16,28],
floors:PLANO.concat([[32,64],[48,64],[16,80],[32,80],[48,80],[16,96],[32,96]]),
wallTop:[32,0],wallMid:[32,16],bannerRed:[16,32],bannerBlue:[32,32],bannerGreen:[16,48],
fTop:[64,0],fMidRed:[[64,16],[80,16],[96,16]],fBasinRed:[[64,32],[80,32],[96,32]],fMidBlue:[[64,48],[80,48],[96,48]],fBasinBlue:[[64,64],[80,64],[96,64]],
staff:[324,129,8,30],hFull:[289,370,13,12],hHalf:[305,370,13,12],hEmpty:[321,370,13,12],skull:[288,432,16,16],
flask:[288,336,16,16],doorClosed:[32,240,32,32],doorOpen:[80,240,32,32],doorL:[16,240,16,32],doorR:[64,240,16,32]};
// ia: perseguir (va a por ti), tirador (guarda distancia y dispara), embestir (corre hacia ti),
// abanico (tres balas), anillo (círculo de balas desde lejos)
const ENEMIGOS={
skelet:{run:f4(432,88),hp:30,sp:.8,ia:'perseguir'},
imp:{run:f4(432,64),hp:20,sp:1.15,ia:'perseguir'},
goblin:{run:f4(432,40),hp:36,sp:1,ia:'perseguir'},
tiny:{run:f4(432,16),hp:16,sp:1.05,ia:'perseguir'},
chort:{run:f4(432,273,16,23),hp:45,sp:.6,ia:'tirador'},
orcW:{run:f4(432,177,16,23),hp:85,sp:.65,ia:'embestir'},
masked:{run:f4(432,153,16,23),hp:90,sp:.55,ia:'abanico'},
shaman:{run:f4(432,201,16,23),hp:55,sp:.5,ia:'anillo'}};
const SALAS=[
{n:'Antesala',tipo:'pelea',cols:[[7,7],[22,7],[7,14],[22,14]],banner:'bannerBlue',fuente:'Blue',
 oleadas:[['skelet','skelet','skelet','imp','imp'],['goblin','goblin','goblin','skelet','skelet','imp']]},
{n:'Pantano del Rey',tipo:'jefe',jefe:'zombi',cols:[[6,6],[23,6],[6,15],[23,15]],banner:'bannerGreen',fuente:'Blue'},
{n:'Cripta de los orcos',tipo:'pelea',cols:[[10,8],[19,8],[10,13],[19,13]],banner:'bannerGreen',fuente:'Blue',
 oleadas:[['orcW','orcW','chort','chort'],['masked','masked','shaman','imp','imp','imp']]},
{n:'Foso de Gruk',tipo:'jefe',jefe:'ogro',cols:[],banner:'bannerBlue',fuente:'Red'},
{n:'Forja infernal',tipo:'pelea',cols:[[5,10],[24,10],[11,6],[18,6]],banner:'bannerRed',fuente:'Red',
 oleadas:[['chort','chort','chort','masked','skelet','skelet'],['orcW','orcW','shaman','shaman','imp','imp','imp','imp']]},
{n:'Trono de Cenizas',tipo:'jefe',jefe:'cenizas',cols:[[7,7],[22,7],[7,14],[22,14]],banner:'bannerRed',fuente:'Red'}];
