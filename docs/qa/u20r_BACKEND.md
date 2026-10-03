# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `9306a74`  
**Tip docs:** _(tip chase)_  
**Nest:** `a69f751` · `TZ=America/El_Salvador` · API VM `localhost:3000/api`  
**Astro preview:** `127.0.0.1:4321` · `devToolbar` off

## Fixes este HEAD

1. **Checkout confirm sin orderId:** modal flex — body scroll; alert + Atrás/Confirmar in-flow (no sticky overlay). Verificado desktop + 390.
2. **Waitlist 404:** aviso inline en bloque Entradas (caja roja suave sobre el CTA), sin toast.
3. **Waitlist 400 correo:** shot con `ana@correo` (pasa gate HTML5-like del cliente).  
   **Origen del 400:** real de Nest `a69f751` (`email must be an email` vía class-validator) — el shot **no** usa proxy. Mapeado a «Revisá el correo, parece que no es válido.»

## Tests

```bash
npm ci && npm test
```

**Conteo limpio:** 109 `ok`.

## Shots (`docs/qa/u20r_9306a74_nestA69f751_*.png`)

Set completo (41). Incluye `checkout_confirm_sin_orderId` (+ `_390` crop modal), `waitlist_404` inline, `waitlist_error_correo_390` con `ana@correo`. `u20r_8687d34_*` / `u20r_fcdb751_*` / `u20r_572f2c4_*` borrados.
