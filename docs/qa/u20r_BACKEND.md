# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `8687d34`  
**Tip docs:** _(tip chase)_  
**Nest:** `a69f751` · `TZ=America/El_Salvador` · API VM `localhost:3000/api`  
**Astro preview:** `127.0.0.1:4321` · `devToolbar` off

## Fixes este HEAD

1. **Pase cover:** strip siempre con `position:relative` + overflow; rota/sin portada → `#3368b1` + ü; QR/meta no se mueven.
2. **Detail error entradas:** sin eyebrow; shot desktop full page.
3. **Waitlist:** 400 email → inline «Revisá el correo…»; 404 → genérico (no «tipos siguen»).
4. **Checkout / `userFacingApiError`:** nunca message crudo de 400; qty>10 y confirm sin orderId mapeados ES.
5. **Perfil 500/red:** mensaje + Reintentar; Entrar solo guest/401.
6. **Lugar:** dedupe equals/contained (fold acentos), sin truncate por cantidad.
7. **cover-fallback test:** puro (sin playwright).
8. Menores: create preview card when; footer SR separator; card fields ES; `detailTicketsChrome` tests.

## Tests

```bash
npm ci && npm test
```

**Conteo limpio:** 109 `ok` (npm ci && npm test).

## Shots (`docs/qa/u20r_8687d34_nestA69f751_*.png`)

Set completo (40). Incluye `pase_con_portada` / `pase_portada_rota` / `pase_sin_portada` @390, `waitlist_error_correo_390`, `waitlist_404`, checkout qty/confirm, perfil 500/red, `create_vista_previa`, `detail_entradas_error` desktop full. `u20r_882e902_*` borrado.
