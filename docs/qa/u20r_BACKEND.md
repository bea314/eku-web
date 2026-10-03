# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `3753147`  
**Tip docs:** `eb70050`  
**Nest:** `a69f751` · `TZ=America/El_Salvador` · API VM `localhost:3000/api`  
**Astro preview:** `127.0.0.1:4321` · `devToolbar` off

## Fixes este HEAD

1. **Footer:** «Eventos y planes en El Salvador» — espacio visible (≤520 sin `display:flex` en copy; `letter-spacing: 0`; NBSP; `padding-inline-start` en `<strong>`). Logo left-aligned con el texto (`brand`/`copy` same left inset). Verificado 360 / 390 / desktop.
2. **Entradas error:** ticket-types fail → sin DESDE ni CTA Reservar/Pagar; solo aviso + Reintentar. Desktop + 390.
3. **Nav invitado desktop:** Explorar primaria; Iniciar sesión secundaria (blanco + borde), igual que mobile.
4. **Perfil ES:** Organizo / Fui / Próximos / Pasados + ü thumbs.

## Seed perfil (Fui / Próximos / Pasados)

El seed Nest no crea `assigned_ticket` (attended=0 de fábrica). Para el shot se insertó en la DB local:

- **Pasados:** evento `U20r Asistí pasado` (start 2026-09-20) + ticket + `assigned_ticket` → johndoe.
- **Próximos / Fui:** ticket + `assigned_ticket` sobre **El Cascanueces**.

Sin ese seed, el perfil solo muestra Organizo. Documentado aquí; no es gap de UI.

## Tests

```bash
npm run test
# OK: smoke, ticket-stock, create-validate, sv-datetime, sv-display-tz, nav-mobile, user-facing-error
```

## Shots (`docs/qa/u20r_3753147_nestA69f751_*.png`)

Set completo (28). Incluye `detail_entradas_error` (+ `_390`), `perfil_labels_es_miniaturas_390`, `perfil_fui_proximos_pasados_390`, `footer_registro_gratis_360` (+390 + desktop), `detail_cruza_medianoche`. Sets `d92c8c3` / `ab0898e` borrados.
