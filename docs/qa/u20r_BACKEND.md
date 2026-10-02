# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `915f4c1e989d5f650ef9661eb1b3319b8caee2ae` (`915f4c1`)  
**Nest SHA (tarball Crop):** `a69f751`  
**Base URL (agente):** `http://localhost:3000/api` — **solo dentro de la VM del agente** (no es el `:3000` de QA en la box).  
**Astro:** `PUBLIC_API_BASE_URL=http://localhost:3000/api` → `astro preview` `http://127.0.0.1:4321` (`devToolbar` off)  
**Seed:** `johndoe@correo.com.sv` / `Password123`  
**Node:** ≥22

## Setup Nest (tarball)

Ver commits previos / tarball Crop en `eku-staging/so-microservicio`. Postgres local `sold_out`, `npm run db:setup`, `node dist/src/main.js` en `:3000` **de la VM**.

## DEUDA lat/lng

Hidden `13.6929` / `-89.2182` — Nest a69f751 exige coords.

## UX este HEAD

- **Nav ≤720px:** una fila (~56–59 px, `--header-h: 3.5rem`); logo izq; Crear + campana + avatar der; **sin** `border-left` en `.nav-tools`. Scroll-margin create = `calc(var(--header-h) + 16px)`.
- **Tipo entrada ≤640px:** Nombre full; Precio|Cupo 50/50; × absolute top-right. Desktop 4-col sin cambio. Affix Precio toma borde rojo con `:has(input.is-invalid)`.
- **Portada rota/faltante:** `data-cover-fallback` + listener en `BaseLayout` → mismo `cover-ph` ü blanca (cards + detail). `coverMediaHtml()`.

## Shots (`docs/qa/u20r_915f4c1_nestA69f751_*.png`)

Backend en cada fila: Nest a69f751 tarball en **VM del agente** (`localhost:3000/api` ≠ QA box); Astro preview `127.0.0.1:4321`.

| Shot | Path | Evidencia |
| --- | --- | --- |
| Nav mobile | `…_nav_mobile_390.png` | Una fila ~59px; sin divisor |
| Cards precio | `…_cards_precio_fila.png` | Sin etiqueta inventada |
| Títulos | `…_cards_titulos_numeros_emoji.png` | 80s / dígitos + emoji a tamaño texto |
| Detalle pago | `…_detail_desde_quedan.png` | Desde / Quedan |
| Detalle Entradas | `…_detail_entradas.png` | «Entradas» |
| Coords | `…_detail_coords_abrir_maps.png` | Abrir en Maps |
| Soldout portada | `…_detail_soldout_portada_fallback.png` | ü azul (cover rota) |
| Waitlist | `…_waitlist_soldout.png` | Lista de espera |
| Fechas vacío | `…_create_fechas_copy.png` | Elegí fecha… |
| Fechas desktop | `…_create_fechas_desktop_ok.png` | dd/mm + 24h |
| Fechas mobile | `…_create_fechas_mobile_390.png` | 31/02 + 25:00; nav 1 fila |
| Tipo mobile | `…_create_tipo_entrada_mobile_390.png` | Layout + errores |
| Errores | `…_create_errores_campos.png` | Nombre bajo nav |
| Errores scroll | `…_create_errores_campos_scroll.png` | Lugar / tipo / precio / cupo |
| novalidate | `…_create_novalidate.png` | Sin globo nativo |
| Publicado | `…_create_publicado_ok.png` | Detail OK |
| Org invitado | `…_organizador_invitado.png` | Iniciar sesión |

### Tests

```bash
npm run test
# smoke: broken/missing cover → data-cover-fallback
```
