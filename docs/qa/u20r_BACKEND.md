# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `381a09b`  
**Tip docs:** _(tip chase al commit de este set)_  
**Nest:** `a69f751` · `TZ=America/El_Salvador` · API VM `localhost:3000/api`  
**Astro preview:** `127.0.0.1:4321` · `devToolbar` off

## Fixes este HEAD

**Checkout tope de cantidad:** el texto Nest **nunca** llega al usuario. Se extrae `N` (estructura o regex ES/EN) y se muestra `Podés llevar hasta N entradas de {tipo}.` con `{tipo}` del ticketType elegido en el cliente. Sin `N` → genérico de confirm. Cantidad 0 → `Elegí al menos 1 entrada.`

**Confirm sin tickets/QR:** con `orderId` pero sin tickets ni `qrPayloads`, `/confirmacion` muestra aviso de compra registrada + CTA primario `Ir a Mis entradas` (`/entradas`). Sin texto técnico ni reintentar compra.

**Portada en /confirmacion:** misma franja que `/entradas` (`pase-card__cover`, ü sobre `#3368b1` si falta/falla; QR fijo 304).

**Place dedupe:** solo segmentos completos idénticos (fold case/acentos/espacios); nunca subcadenas. `Av. San Salvador 45, San Salvador` queda igual.

## Shots de tope — 400 REAL de Nest

| Shot | Evento / tipo | Cómo se forzó el 400 |
|------|---------------|----------------------|
| `checkout_cantidad_max` | U20r Solo gratis · **Libre QA** · N=10 | El `+` del stepper se deshabilita en el tope; el shot sube `#free-quantity` a `11` (`max=99`) y hace submit. Nest responde `Máximo 10 por orden para Libre QA` → UI `Podés llevar hasta 10 entradas de Libre QA.` |
| `checkout_cantidad_max_dj` | DJ PARTY · **VIP** · N=4 | `syncPayTotal` clampea al `maxPerOrder`; el shot deja VIP seleccionado y **bump**ea `items[0].quantity` a `5` en el POST a Nest (`preview`/`confirm`) vía route `continue`. Nest responde `Máximo 4 por orden para VIP` → UI `Podés llevar hasta 4 entradas de VIP.` |

## Tests

```bash
npm ci && npm test
```

## Shots (`docs/qa/u20r_381a09b_nestA69f751_*.png`)

Set completo. `u20r_09a8cf7_*` borrado.

Nuevos / tocados este HEAD: `checkout_cantidad_max`, `checkout_cantidad_max_dj`, `confirm_sin_tickets`, `confirm_sin_tickets_390`, `confirmacion_pase_con_portada_390`, `confirmacion_pase_sin_portada_390`.
