# Servidor de récords y guardado en la nube

Un solo archivo (`servidor.mjs`), sin dependencias. Guarda todo en `/datos/mazmorra.json`.

## Qué hace

- `GET /api/records`: los 50 mejores de la Torre.
- `POST /api/records`: sube un récord. Lleva `id` (al azar por aparato), `apodo`, `piso`, `heroe` y `nivel`.
- `POST /api/guardado/nuevo`, `POST /api/guardado` y `POST /api/guardado/leer`: respaldo del progreso con un código secreto de 10 letras.
- `GET /salud`: para el chequeo de vida.

No guarda datos personales, solo un apodo. Además:

- acepta pedidos solo de la página del juego (`ORIGENES`);
- limita cada dirección a 60 pedidos por minuto;
- cada respaldo pesa como máximo 64 KB.

## Dónde está montado

Desde el 26-10-2026 corre en el Coolify del VPS de Aurora, como aplicación aparte llamada `mazmorra-records`,
con su propio volumen `/datos`, en https://mazmorra.auroracontigo.com. El DNS ya sirve porque `*.auroracontigo.com`
apunta al VPS. Coolify la construye desde el repo público, así que un push no la vuelve a desplegar sola:
si cambias `servidor.mjs`, toca «Redeploy» en Coolify.

## Servidor de enlace para jugar en línea (TURN)

Dos aparatos en redes distintas (datos móviles, routers estrictos) casi nunca se conectan directo; el
tráfico pasa por un servidor de enlace. Los gratuitos de PeerJS ya no existen, así que hay uno propio:

- Contenedor `mazmorra-turn` (imagen `coturn/coturn`) en el mismo VPS, fuera de Coolify porque necesita
  la red del host. Escucha en `2.25.251.103:3478` (UDP y TCP) y reenvía por los puertos UDP 49160-49260.
- Se arranca (o rearranca) con `/root/mazmorra-turn/arrancar.sh`; se levanta solo si el VPS se reinicia.
- No reenvía hacia redes internas ni a `127.0.0.1`: nadie puede usarlo para llegar a los servicios de Aurora.
- La clave maestra está en `/root/mazmorra-turn/secreto` (solo root) y una copia en el volumen de datos
  (`turn.secreto`). Nunca va al repo. `GET /api/turn` entrega claves que vencen en 6 horas.
- Para comprobarlo: en el juego en línea, el invitado debería ver la imagen aunque esté con datos móviles.

## Montarlo de nuevo en Coolify (si hiciera falta)

1. En Hostinger (hPanel → DNS) agregar un registro `A` con nombre `mazmorra`, apuntando a `2.25.251.103`.
2. En Coolify:
   - crear una aplicación nueva desde el repo `danielrein4-beep/mazmorra-de-cenizas`, rama `main`;
   - en «Build Pack» elegir **Dockerfile**, y en «Base Directory» poner `/servidor`;
   - en el dominio poner `https://mazmorra.auroracontigo.com`; el puerto es `8080`;
   - en «Storages» agregar un volumen persistente montado en `/datos`.
3. Desplegar y abrir `https://mazmorra.auroracontigo.com/salud`; debe responder `{"ok":1}`.

No toca nada de Aurora: es otro contenedor con su propio volumen.

## Probar en la compu

```bash
DATOS=./datos PORT=8590 node servidor.mjs
```

Después abrir el juego con `?api=http://localhost:8590` al final de la dirección.
