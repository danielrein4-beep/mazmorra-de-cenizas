# Mazmorra de Cenizas

Juego de mazmorras en pixel art: cinco héroes, tres zonas con llaves y salas secretas, tres jefes,
modo Pesadilla y cooperativo de dos jugadores en la misma pantalla.

## Jugar

En línea: https://danielrein4-beep.github.io/mazmorra-de-cenizas/ (también se instala como app).
Para jugar con un amigo, uno toca **Crear sala** y el otro escribe el código y toca **Unirse**.

## Armar

```
npm install          # una vez: instala Prettier
npm run construir    # arma el juego
npm run formatear    # deja el código con formato uniforme
```

Crea `mazmorra.html` (la página que se publica) y `publicar/` (para servir en localhost
o instalar como app). En localhost se sirve desde `publicar/` en el puerto 8505.

## Dónde está cada cosa

| Carpeta | Qué hay |
|---|---|
| `src/pagina/` | La página: menús, estilos, manifiesto de la app y guardado sin conexión |
| `src/recursos/` | Dibujos (atlas de 0x72), iconos de la app y música |
| `src/nucleo/` | Motor: bucle, cámara, dibujo, controles, sonidos y música |
| `src/datos/` | Datos fijos: salas, enemigos, héroes, armas, vestuarios e iconos |
| `src/jugadores/` | Dos jugadores: controles del segundo, caer y revivir, cámara de a dos |
| `src/combate/` | Técnicas y golpes finales, proyectiles y efectos, enemigos y jefes |
| `src/mundo/` | Planos y terreno, objetos y tienda, generación de zonas y cuarto actual |

`construir.cjs` junta los archivos en el orden de su lista `ORDEN`. Ningún archivo pasa de 500 líneas:
si uno crece, se parte por tema dentro de su carpeta.

## Créditos

- Dibujos: [16x16 DungeonTileset II](https://0x72.itch.io/dungeontileset-ii) de 0x72 (CC0).
- Dragón y criaturas de la Torre: [Debts in the Depths](https://reaktori.itch.io/debts-in-the-depths-asset-pack) de Reaktori (CC0).
- Música: MintoDog ([Heavy Dungeon](https://opengameart.org/node/181405), [Heavy Boss Battle 1](https://opengameart.org/content/heavy-boss-battle-1), [Hard Boss Battle 2](https://opengameart.org/content/hard-boss-battle-2)) y nene ([Boss Battle #2](https://opengameart.org/content/boss-battle-2-symphonic-metal)), en OpenGameArt (CC0).
- Música de la Torre: Emma_MA ([Determined Pursuit](https://opengameart.org/content/determined-pursuit-epic-orchestra-loop)) y Juhani Junkala ([Epic Boss Battle](https://opengameart.org/node/55649)), en OpenGameArt (CC0).
- Música del último jefe y del Dragón: Matthew Pablo, [Colossal Boss Battle Theme](https://opengameart.org/content/colossal-boss-battle-theme) (CC-BY 3.0, http://www.matthewpablo.com). Fanfarria de victoria: cynicmusic, [Victory Fanfare Short](https://opengameart.org/content/victory-fanfare-short) (CC0).
- Cuando un jefe revive y Pacto de Demonios: Kevin MacLeod (incompetech.com), «Volatile Reaction», «Five Armies», «Exit the Premises» y «Final Battle of the Dark Wizards». Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/
- Conexión en línea: [PeerJS](https://peerjs.com/) (MIT).
