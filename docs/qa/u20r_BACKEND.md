# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `5c94220` — nav mobile Explorar pill + avatar «Mis entradas»; tip docs puede seguir.  
**Nest SHA (tarball Crop):** `a69f751`  
**Base URL (agente):** `http://localhost:3000/api` — **solo dentro de la VM del agente** (no es el `:3000` de QA en la box).  
**Astro:** `PUBLIC_API_BASE_URL=http://localhost:3000/api` → `astro preview` `http://127.0.0.1:4321` (`devToolbar` off)  
**Seed:** `johndoe@correo.com.sv` / `Password123`  
**Node:** ≥22

## Nest TZ (fix -6h)

| Paso | Valor |
| --- | --- |
| Seed | `TZ=America/El_Salvador npm run db:setup` |
| Runtime Nest | `TZ=America/El_Salvador node dist/src/main.js` |
| Formatter web | `Intl` con `timeZone: 'America/El_Salvador'` |

### ISO crudos API → display

| Evento | `start_date` (API) | Display |
| --- | --- | --- |
| Festival de cortos ESCINE | `2026-10-24T01:00:00.000Z` | **vie 23 oct · 19:00** |
| Sold Out Waitlist (seed) | `2026-10-12T02:00:00.000Z` | **dom 11 oct · 20:00** |

### Unit tests TZ

`npm run test:sv-display-tz` bajo `TZ=UTC` y `TZ=America/New_York` → ambos `19:00` / `20:00`.

## Nav mobile ≤720 (390)

**Caso:** a `a2c3a6a` NO se llegaba a Explorar/Entradas logueado (links ocultos; avatar = link a `/perfil` sin menú).

**Fix `5c94220`:** una fila — logo (Inicio), **Explorar** pill primaria, **Crear** secundaria (solo authed), campana, avatar. Menú avatar: **Mis entradas** → Perfil → Salir. Invitado: logo + Explorar + Iniciar sesión. Targets ≥44×44 (cabía en 350px útiles sin apretar). Footer `em` «registro gratis» `white-space: nowrap`.

Medidas 390 auth (inner 350): brand 46.7×44, Explorar 84.8×44, Crear 62.4×44, bell/avatar 44×44.

## DEUDA lat/lng

Hidden `13.6929` / `-89.2182` — Nest a69f751 exige coords.

## Shots (`docs/qa/u20r_5c94220_nestA69f751_*.png`)

Backend: Nest a69f751 VM `localhost:3000/api`; Astro `127.0.0.1:4321`; Nest **`TZ=America/El_Salvador`**.

| Shot | Evidencia |
| --- | --- |
| `…_nav_mobile_390_logueado_cerrado.png` | Logo · Explorar · Crear · campana · avatar |
| `…_nav_mobile_390_logueado_menu_abierto.png` | Mis entradas / Perfil / Salir |
| `…_nav_mobile_390_invitado.png` | Logo · Explorar · Iniciar sesión |
| `…_nav_mobile_390.png` | Alias invitado (compat) |
| resto del set | precios, títulos emoji, detail, create, waitlist, etc. |

### Tests

```bash
npm run test
# test:nav-mobile (+ runtime 390 con Playwright si preview up)
```
