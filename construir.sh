#!/bin/sh
# Junta los archivos de src/ en una sola página con el atlas incrustado: mazmorra.html
cd "$(dirname "$0")"
node -e "
const fs=require('fs'),r=f=>fs.readFileSync('src/'+f,'utf8');
const js=['datos.js','motor.js','musica.js','personajes.js','iconos.js','tecnicas.js','poderes.js','enemigos.js','jefes.js','salas.js'].map(r).join('\n');
const png='data:image/png;base64,'+fs.readFileSync('src/atlas.png').toString('base64');
fs.writeFileSync('mazmorra.html',r('juego.html').replace('/*__JS__*/',()=>js).replace('__ATLAS__',png));
new Function(js);console.log('listo',fs.statSync('mazmorra.html').size,'bytes');"
