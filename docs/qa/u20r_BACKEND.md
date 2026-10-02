# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `a2c3a6a` (`a2c3a6ae…`) — tip con UX nav/tipo/portada + tests TZ QA fixtures  
**Nest SHA (tarball Crop):** `a69f751`  
**Base URL (agente):** `http://localhost:3000/api` — **solo dentro de la VM del agente** (no es el `:3000` de QA en la box).  
**Astro:** `PUBLIC_API_BASE_URL=http://localhost:3000/api` → `astro preview` `http://127.0.0.1:4321` (`devToolbar` off)  
**Seed:** `johndoe@correo.com.sv` / `Password123`  
**Node:** ≥22

## Nest TZ (fix -6h)

| Paso | Valor |
| --- | --- |
| Seed | `TZ=America/El_Salvador npm run db:setup` (Prisma `new Date(y,m,d,19,0)` → wall SV) |
| Runtime Nest | `TZ=America/El_Salvador node dist/src/main.js` (`/proc/<pid>/environ` → `TZ=America/El_Salvador`) |
| Formatter web | `Intl` con `timeZone: 'America/El_Salvador'` (independiente de `process.env.TZ`) |

### ISO crudos API → display (misma VM)

| Evento | `start_date` (API) | Display cards/detail |
| --- | --- | --- |
| Festival de cortos ESCINE | `2026-10-24T01:00:00.000Z` | **vie 23 oct · 19:00** |
| Sold Out Waitlist (seed) | `2026-10-12T02:00:00.000Z` | **dom 11 oct · 20:00** |
| DJ PARTY - 80s Night | `2026-10-13T03:00:00.000Z` | lun 12 oct · 21:00 |
| U20r Solo pago | `2026-10-17T02:00:00.000Z` | vie 16 oct · 20:00 |

### Unit tests (`npm run test:sv-display-tz`)

Fixtures exactos Nest QA; corren spawn bajo **`TZ=UTC`** y **`TZ=America/New_York`** — ambos dan `19:00` / `20:00`:

```
ok  ESCINE QA ISO → vie 23 oct · 19:00 under TZ=UTC and America/New_York
ok  waitlist QA ISO → dom 11 oct · 20:00 under TZ=UTC and America/New_York
UTC ESCINE= vie 23 oct · 19:00 – 22:00 | waitlist= dom 11 oct · 20:00 – 23:00
America/New_York ESCINE= vie 23 oct · 19:00 – 22:00 | waitlist= dom 11 oct · 20:00 – 23:00
```

## Setup Nest (tarball)

Ver commits previos / tarball Crop en `eku-staging/so-microservicio`. Postgres local `sold_out`, migrate + seed **con** `TZ=America/El_Salvador`, Nest en `:3000` **de la VM** con el mismo TZ.

## DEUDA lat/lng

Hidden `13.6929` / `-89.2182` — Nest a69f751 exige coords.

## UX este HEAD

- **Nav ≤720px:** una fila (~56–59 px, `--header-h: 3.5rem`); logo izq; Crear + campana + avatar der; **sin** `border-left` en `.nav-tools`. Scroll-margin create = `calc(var(--header-h) + 16px)`.
- **Tipo entrada ≤640px:** Nombre full; Precio|Cupo 50/50; × absolute top-right. Affix Precio borde rojo con `:has(input.is-invalid)`.
- **Portada rota/faltante:** `data-cover-fallback` + listener → `cover-ph` ü blanca.
- **Card emoji:** seed/API `🎷 Jazz 80s en el patio` (+ Open Mic emoji) visibles en grid.

## Shots (`docs/qa/u20r_a2c3a6a_nestA69f751_*.png`)

Backend en cada fila: Nest a69f751 tarball en **VM del agente** (`localhost:3000/api` ≠ QA box); Astro preview `127.0.0.1:4321`; Nest **`TZ=America/El_Salvador`**.

| Shot | Path | Evidencia |
| --- | --- | --- |
| Nav mobile | `…_nav_mobile_390.png` | Una fila ~59px; sin divisor |
| Cards precio | `…_cards_precio_fila.png` | Sin etiqueta inventada; U20r 20:00 SV |
| Títulos | `…_cards_titulos_numeros_emoji.png` | viewport; 🎷 Jazz 80s + 80s digits; sin sticky nav duplicado |
| Detalle pago | `…_detail_desde_quedan.png` | Desde / Quedan; vie 16 oct · 20:00 |
| Detalle Entradas | `…_detail_entradas.png` | «Entradas» |
| Coords | `…_detail_coords_abrir_maps.png` | Abrir en Maps |
| Soldout portada | `…_detail_soldout_portada_fallback.png` | ü azul (cover rota); waitlist **20:00** |
| Waitlist | `…_waitlist_soldout.png` | Lista de espera |
| Fechas vacío | `…_create_fechas_copy.png` | Elegí fecha… |
| Fechas desktop | `…_create_fechas_desktop_ok.png` | dd/mm + 24h |
| Fechas mobile | `…_create_fechas_mobile_390.png` | 31/02 + 25:00; nav 1 fila |
| Tipo mobile | `…_create_tipo_entrada_mobile_390.png` | Nombre full; Precio\|Cupo 50/50; × abs; affix rojo |
| Errores | `…_create_errores_campos.png` | Nombre bajo nav |
| Errores scroll | `…_create_errores_campos_scroll.png` | Lugar / tipo / precio / cupo |
| novalidate | `…_create_novalidate.png` | Sin globo nativo |
| Publicado | `…_create_publicado_ok.png` | Detail OK |
| Org invitado | `…_organizador_invitado.png` | Iniciar sesión |

### Tests

```bash
npm run test
# incluye test:sv-display-tz (TZ=UTC + America/New_York)
```
