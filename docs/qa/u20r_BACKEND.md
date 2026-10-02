# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `e79cb75` — nav mobile Explorar pill + avatar «Mis entradas» + Iniciar sesión primary.  
**Tip docs:** puede ser posterior (shots).  
**Nest SHA (tarball Crop):** `a69f751`  
**Base URL (agente):** `http://localhost:3000/api` — **solo VM del agente**.  
**Astro:** `PUBLIC_API_BASE_URL=http://localhost:3000/api` → preview `127.0.0.1:4321` (`devToolbar` off)  
**Seed:** `johndoe@correo.com.sv` / `Password123`  
**Nest runtime TZ:** `America/El_Salvador`

## Caso nav (vs a2c3a6a)

En `a2c3a6a` a 390 logueado: solo Crear + campana + avatar; Inicio/Explorar/Entradas ocultos; avatar = link a `/perfil` **sin menú** → **NO** se llegaba a Explorar/Entradas desde la fila.

## Fix `e79cb75`

≤720 / shot 390 — **una fila**, targets ≥44×44 (cupo: inner 350px; auth sum ítems ~282 + gaps, sin overflow ni shrink):

| Rol | Fila |
| --- | --- |
| Logueado | logo (=Inicio) · **Explorar** pill primaria · **Crear** secundaria · campana · avatar |
| Invitado | logo · **Explorar** pill · **Iniciar sesión** pill |

Menú avatar: **Mis entradas** → Perfil → Salir. Footer `em` «registro gratis» `white-space: nowrap`.

## Nest TZ / ISO

| Evento | API ISO | Display |
| --- | --- | --- |
| ESCINE | `2026-10-24T01:00:00.000Z` | vie 23 oct · **19:00** |
| Waitlist | `2026-10-12T02:00:00.000Z` | dom 11 oct · **20:00** |

## Shots (`docs/qa/u20r_e79cb75_nestA69f751_*.png`)

| Shot | Evidencia |
| --- | --- |
| `…_nav_mobile_390_logueado_cerrado.png` | Fila logueado |
| `…_nav_mobile_390_logueado_menu_abierto.png` | Mis entradas / Perfil / Salir |
| `…_nav_mobile_390_invitado.png` | Explorar + Iniciar sesión |
| resto del set | precios, títulos, detail, create, waitlist… |

```bash
npm run test   # incluye test:nav-mobile (+ runtime 390 si preview+Playwright)
```
