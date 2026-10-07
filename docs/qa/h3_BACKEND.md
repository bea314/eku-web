# HEAD 3 — STEP B evidencia (Nest c804bcc)

**HEAD de código (app):** `2fea8be`  
**Tip docs/shots:** _(tip commit)_  
**Nest:** `c804bcc` (tarball `so-microservicio-c804bcc.tar.gz`, sha256 `ced0b1c1f0843ae703f1de64c98a363286d46132e78d3c1420037ec92f911239`)  
**TZ:** `America/El_Salvador`  
**API:** `http://localhost:3000/api` · Astro preview `http://127.0.0.1:4321`

## Boot (local)

```bash
# Postgres sold_out + MinIO via scripts/setup-local-s3.sh
cp .env.example .env   # PAYMENTS_ENABLED left unset (=false)
npm ci && npx prisma generate && TZ=America/El_Salvador npm run db:setup
# Import 82 LISTA (server-side, no HTTP) — flag unset; paid types load anyway
TZ=America/El_Salvador npm run fixture:real-events -- \
  --status=LISTA --live \
  --uploads=./uploads \
  --organizer-names=./uploads/organizer_display_names.json
unset PAYMENTS_ENABLED
TZ=America/El_Salvador npm run start:dev
```

Org: `johndoe@correo.com.sv` / `Password123`

## Flag values

| Shot group | `PAYMENTS_ENABLED` |
|------------|--------------------|
| checkout 403 paid/mixed, free 201, waitlist 201, create payments notice, Fin empty, imported paid list/detail/checkout, Noche de Gala ü, discovery empty | **unset** (false) |
| U20 paid confirm, cap VIP, qty 0 | **`true`** |

## PAYMENTS_DISABLED contract (map by `code`, never Nest message)

### 403 bodies (real Nest)

**Checkout paid / mixed / imported paid** (`POST /api/checkout/preview` or `/confirm`):

```json
{"status":403,"message":"La venta de entradas de pago todavía no está abierta.","code":"PAYMENTS_DISABLED","meta":{"path":"/api/checkout/confirm","timestamp":"…"}}
```

**Create with price > 0** (`POST /api/events`):

```json
{"status":403,"message":"Por ahora solo podés publicar eventos gratis.","code":"PAYMENTS_DISABLED","meta":{"path":"/api/events","timestamp":"…"}}
```

### Our UI copy (never Nest text)

| Context | Copy |
|---------|------|
| Checkout paid-only | «La venta de entradas de pago todavía no está abierta.» |
| Checkout mixed (event has free+paid, order paid) | same + « Podés reservar las gratis.» |
| Create/PATCH | «Por ahora solo podés publicar eventos gratis. Poné el precio en 0 para publicarlo.» |

### Free order 201

`POST /api/checkout/confirm` free type → **HTTP 201**, body `code:200` with `orderId`, `tickets`, `qrPayloads`.

### Waitlist 201

`POST /api/events/:id/waitlist` on sold-out Noche de Gala → **HTTP 201**.

### Create Fin empty (no endDate / no lat/lng) — request body

```json
{
  "name": "QA H3 Fin Shot B",
  "description": "",
  "startDate": "2026-10-26T02:00:00.000Z",
  "startsAt": "2026-10-26T02:00:00.000Z",
  "place": "Plaza Libertad, San Salvador",
  "placeText": "Plaza Libertad, San Salvador",
  "locationText": "Plaza Libertad, San Salvador",
  "location": {
    "name": "Plaza Libertad, San Salvador",
    "address": "Plaza Libertad, San Salvador",
    "formattedAddress": "Plaza Libertad, San Salvador",
    "source": "manual"
  },
  "visibility": "public",
  "status": "published",
  "publish": true,
  "ticketTypes": [{ "name": "Libre", "price": 0, "quantity": 40 }]
}
```

No `endDate` / `endsAt`. No `lat` / `lng` / `latitude` / `longitude`. Nest 201 → detail shows start-only when line.

## Flag ON — real 400s

**Cap VIP** (`quantity: 5`, maxPerOrder 4):

```json
{"status":400,"message":"Máximo 4 por orden para VIP","meta":{…}}
```

UI: «Podés llevar hasta 4 entradas de VIP.»

**Qty 0:**

```json
{"status":400,"message":"items.0.quantity must not be less than 1","meta":{…}}
```

UI: «Elegí al menos 1 entrada.»

## Discovery empty (guest)

All upcoming discovery rows empty (82 imports already past; seed/QA temporarily past-dated for empty shots only — **import dates not altered from fixture** after revert of earlier bumps). Past filter unchanged.

UI: «Todavía no hay eventos próximos.» + button «Crear evento». Guest → `/login?next=/organizador`. Home hides empty «Recomendados» row; category chips stay. No error alert.

## Tests

```bash
npm ci && npm test
```

**Count:** 129 ok (includes PAYMENTS_DISABLED by-code + empty-events PO copy).

## Shots (`docs/qa/h3_2fea8be_nestC804bcc_*.png`)

### Flag OFF

| Shot | Notes |
|------|-------|
| `checkout_paid_403_390` / `_1280` | Proyecto Garnachas · our paid-only copy · card values intact |
| `checkout_mixed_403_390` / `_1280` | DJ PARTY · + «Podés reservar las gratis.» |
| `free_order_confirm_390` | Free-only event · 201 · pase |
| `waitlist_201_390` | Noche de Gala sold-out · «Ya estás en la lista» |
| `create_payments_disabled_390` | types 0 + 15 · notice + red border on 15 |
| `create_fin_empty_desktop` / `_390` / `_detail_390` | Fin empty · 201 · no end on detail |
| `imported_paid_list_1280` | Paid imports visible with price |
| `imported_paid_detail_1280` / `_390` / `_price_390` | Proyecto Garnachas prices |
| `imported_paid_checkout_403_390` | same 403 our copy |
| `noche_gala_card_390` / `_detail_390` | white ü on `#3368b1` |
| `discovery_home_empty_guest_390` / `_1280` | empty upcoming · no Recomendados chrome |
| `discovery_eventos_empty_guest_390` / `_1280` | same on /eventos |
| `discovery_empty_crear_evento_login_390` | guest Crear evento → `/login?next=/organizador` |

### Flag ON + minors

| Shot | Notes |
|------|-------|
| `u20_checkout_paid_confirm_390` | paid → confirmation pase |
| `u20_checkout_cap_vip_390` | «Podés llevar hasta 4 entradas de VIP.» |
| `u20_checkout_qty0_390` | «Elegí al menos 1 entrada.» |
| `pase_confirm_con_portada_390` | cover + when/place |
| `pase_confirm_sin_portada_390` | ü fallback |
| `pase_confirm_cruza_medianoche_390` | sáb 17 oct, 21:00 – dom 18 oct, 02:00 |
| `pase_entradas_con_portada_390` / `_sin_portada_390` / `_wallet_390` | /entradas when+place |
| `entradas_invitado_390` | «Iniciá sesión…» · Mis pases full contrast |
| `confirm_sin_tickets_390` | light-blue notice |
| `confirm_guest_cta_login_390` | Ir a Mis entradas → login?next=/entradas |
| `perfil_error_390` | light-red box |

`h3_*_nestEcb4d8c_*` deleted. `u20r_*` already deleted.
