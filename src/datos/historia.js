// La historia: el prólogo de la primera partida, la frase de cada jefe al presentarse, las crónicas que se
// leen al vencer a cada guardián de la Torre y lo que dice Zaro, el mercader.
const PROLOGO = [
  'Hace mil años, el primer Rey Mago encerró a los demonios de las cenizas en una torre de cien pisos y selló la puerta con su grimorio de cinco hojas.',
  'El sello se está rompiendo. Cada noche sube más ceniza desde la mazmorra, y los guardianes que él dejó ya no obedecen a nadie.',
  'Los gremios buscan aventureros que bajen a la mazmorra, suban la Torre y reclamen el título que nadie lleva desde entonces: Rey Mago.',
  'Tu grimorio acaba de abrirse. Es tu turno.',
];
const FRASES_JEFE = {
  zombi: 'Todo lo que entra a mi pantano se queda a pudrirse conmigo.',
  ogro: '¡Gruk aplasta aventureros chiquitos!',
  cenizas: 'Yo fui el guardián del sello. Ahora soy su dueño.',
  nigromante: 'Mis muertos no se cansan. ¿Y tú?',
  minotauro: 'Nadie sale del laberinto. Nadie.',
  espectro: 'Fui aventurero, como tú. Llegué hasta aquí.',
  hechicero: 'Leí todos los grimorios de la Torre. Ninguno tenía tu nombre.',
  goblinRey: 'Esta Torre es mía y de mi banda. Paga o corre.',
  caballeroHielo: 'Juré proteger al Rey Mago. Él no volvió. Yo sigo aquí.',
  dragon: 'Mil años esperé a alguien digno del fuego. Veamos si eres tú.',
};
const CRONICAS = {
  10: 'El Rey Podrido era el primero de los guardianes. Dicen que antes fue el jardinero del castillo.',
  20: 'Gruk cuidaba la entrada de las minas. Nadie le dijo que el Rey Mago se había ido.',
  30: 'El Señor de las Cenizas custodiaba el sello. Fue el primero en traicionarlo.',
  40: 'La Reina Nigromante perdió a su reino en la guerra contra los demonios. En la Torre los volvió a juntar.',
  50: 'El Minotauro guardaba el grimorio de cuatro hojas que el Rey Mago le confió antes de subir.',
  60: 'El Espectro llegó hasta el piso 60 hace doscientos años. Nunca bajó.',
  70: 'El Gran Hechicero fue aprendiz del Rey Mago. Quiso su título sin ganárselo.',
  80: 'El Señor Goblin juntó a todas las bandas de la Torre con una sola promesa: oro.',
  90: 'El Caballero de Hielo esperó a su rey durante mil años sin dejar su puesto.',
  100: 'En la cima no estaba el Rey Mago. Estaba su dragón, y una corona sin dueño. Ahora es tuya.',
};
const FRASES_ZARO = [
  'Pasa y mira, que todo brilla.',
  'Oí que el Minotauro guarda algo de cuatro hojas. Yo no me acerco.',
  'Las reliquias no se eligen: te eligen a ti. Igual cuestan monedas.',
  'Un aventurero me pagó con un diente de dragón. Era de goblin.',
  '¿Otra vez tú? Me caes bien. Los que no vuelven no compran.',
  'Si juntas fuego y hielo pasan cosas raras. Buenas, creo.',
  'Dicen que el Rey Mago tenía cinco hojas en su trébol. Yo tengo una moneda en el bolsillo.',
];
const fraseZaro = () => FRASES_ZARO[Math.floor(Math.random() * FRASES_ZARO.length)];

// Prólogo: la primera vez que tocas Jugar, antes de elegir.
function mostrarPrologo(luego) {
  const L = document.getElementById('prologoTexto');
  L.innerHTML = '';
  PROLOGO.forEach((t, i) => {
    const p = document.createElement('p');
    p.textContent = t;
    p.style.animationDelay = i * 1.1 + 's';
    L.appendChild(p);
  });
  irAPanel('prologo');
  document.getElementById('prologoSeguir').onclick = () => {
    guardarLogro('prologo', 1);
    document.getElementById('prologo').hidden = true;
    luego();
  };
}
