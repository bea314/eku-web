# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `abf637c`  
**Tip docs:** `3f9fdae`  
**Nest:** `a69f751` · `TZ=America/El_Salvador` · API VM `localhost:3000/api`  
**Astro preview:** `127.0.0.1:4321` · `devToolbar` off

## Fixes este HEAD

**confirm_sin_tickets:** solo el aviso + un CTA primario `Ir a Mis entradas`. El bloque viejo (`Mis entradas` + flecha) queda oculto. Shots retaken **logueado** (avatar visible).

**Invitado sin sesión:** el CTA sigue yendo a `/entradas`. Esa ruta, sin token, muestra el gate existente («Iniciá sesión…» + `Entrar` → `/login?next=/entradas`). No hay copy nueva en confirmación.

**Pase en /confirmacion:** mismo markup que `/entradas` (`paseCardHtml` variant `wallet` + `PASE_QR_WALLET`): brand `ekü`, franja de portada / fallback ü `#3368b1`, línea de tipo — sin facts «TIPO», sin watermark.

Prior (sigue): tope Nest real `Podés llevar hasta N entradas de {tipo}.`; qty 0 → `Elegí al menos 1 entrada.`; dedupe de lugar solo por segmentos idénticos.

## Shots de tope — 400 REAL de Nest

| Shot | Evento / tipo | Cómo se forzó el 400 |
|------|---------------|----------------------|
| `checkout_cantidad_max` | U20r Solo gratis · **Libre QA** · N=10 | Shot sube `#free-quantity` a `11` (`max=99`) y submit. |
| `checkout_cantidad_max_dj` | DJ PARTY · **VIP** · N=4 | Shot bumpa `items[0].quantity` a `5` en el POST Nest (el stepper clampea). |

## Tests

```bash
npm ci && npm test
```

## Shots (`docs/qa/u20r_abf637c_nestA69f751_*.png`)

Set completo. `u20r_381a09b_*` borrado.
