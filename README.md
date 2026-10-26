# Mazmorra de Cenizas

Juego de mazmorras en pixel art: cinco héroes, tres zonas con llaves y salas secretas, tres jefes,
modo Pesadilla y cooperativo de dos jugadores en la misma pantalla.

## Armar y jugar

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

- Dibujos: 16x16 DungeonTileset II de 0x72 (CC0).
- Música: MintoDog y nene en OpenGameArt (CC0).
