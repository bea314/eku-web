# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `07caa26` — guest signin secundaria + when cross-midnight.  
**Tip docs:** puede ser posterior.  
**Nest SHA:** `a69f751` · **TZ Nest:** `America/El_Salvador`  
**API agente:** `http://localhost:3000/api` · Astro preview `127.0.0.1:4321` (`devToolbar` off)

## Nav mobile ≤720 @390

| Rol | Fila |
| --- | --- |
| Logueado | logo · Explorar primaria · Crear secundaria · campana · avatar (Mis entradas→Perfil→Salir) |
| Invitado | logo · Explorar primaria · **Iniciar sesión secundaria** (no compite) |

Targets ≥44×44. Footer `em` «registro gratis» `white-space: nowrap` (shot `footer_registro_gratis_390`).

## When SV (Intl `America/El_Salvador`)

| Caso | Card (`full`) | Detail (`detail`) |
| --- | --- | --- |
| Mismo día | `vie 16 oct · 20:00 – 23:00` | igual |
| Cruza medianoche (DJ) | `lun 12 oct · 21:00` | `lun 12 oct, 21:00 – mar 13 oct, 02:00` |
| Cruza año | `jue 31 dic · 22:00` | `jue 31 dic 2026, 22:00 – vie 1 ene 2027, 02:00` |

Tests: `npm run test:sv-display-tz` bajo `TZ=UTC` y `America/New_York`.

## Shots (`docs/qa/u20r_07caa26_nestA69f751_*.png`)

Incluye `nav_mobile_390_invitado`, `detail_cruza_medianoche`, `cards_titulos_numeros_emoji` (DJ start-only), `footer_registro_gratis_390`. Set completo; `e79cb75` borrado.
