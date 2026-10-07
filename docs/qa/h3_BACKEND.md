# HEAD 3 — evidencia Nest 6130711

**HEAD de código (app):** `fdd68ae`  
**Tip docs/shots:** _(este commit)_  
**Nest:** `6130711` (tarball `so-microservicio-6130711.tar.gz`, sha256 `d8995cf0b01a481711fa1f869b96189be0de8c0b68b7f61e233bab01041ba1a9`)  
**Secrets:** only `.env.example` in the tarball (no `uploads/`).  
**TZ:** `America/El_Salvador`  
**API:** `http://localhost:3000/api` · Astro preview `http://127.0.0.1:4321`

## Boot (local)

```bash
cp .env.example .env   # PAYMENTS_ENABLED unset (=false)
# MinIO must be up (MINIO_* in .env) before db:setup / seed
npm ci && npx prisma generate && TZ=America/El_Salvador npm run db:setup
TZ=America/El_Salvador npm run fixture:real-events -- \
  --status=LISTA --live \
  --uploads=./uploads \
  --organizer-names=./uploads/organizer_display_names.json
unset PAYMENTS_ENABLED
TZ=America/El_Salvador npm run start:dev
```

Org: `johndoe@correo.com.sv` / `Password123`

Crop matrix (Nest): past free/paid/waitlist → `409 EVENT_ENDED`; upcoming free confirm + sold-out waitlist OK. EVENT_ENDED is checked **before** PAYMENTS_DISABLED.

## Seed covers (6130711)

| Event | Cover |
|-------|-------|
| DJ PARTY, El Cascanueces, ESCINE | MinIO JPEG |
| Show de mimos, Concierto EUDE, Noche de Gala | **none** → ü |

## Flag values

| Shot group | `PAYMENTS_ENABLED` |
|------------|--------------------|
| 403s, free, waitlist, create, Fin, Publicando, past-ended, imported paid detail, Gala ü, empty, grid | **unset** |
| U20 paid/cap/qty0, pase confirm/entradas | **`true`** |

## Past events (`EVENT_ENDED`)

Web: `isEventPast` — end before now, else start (Nest ISO; display TZ SV). Detail replaces buy/waitlist with neutral `alert--notice` «Este evento ya terminó.» (`#2c3441`); prices / «Desde …» stay.

Nest: `409` + `code: "EVENT_ENDED"` on preview / confirm / waitlist (map by code only, never Nest text). Paid past order → ended copy, **not** payments copy.

### `evento_terminado_409_390` — how 409 was forced

Proyecto Garnachas is already past on the server (start **2026-05-31**, no end). The client normally blocks checkout before any request. For this shot we **stub `Date` in the page** (`evaluateOnNewDocument` → fixed `2026-05-01T12:00:00.000Z`) so `isEventPast` is false and the buy CTA opens; Nest still uses real server time and returns `409 EVENT_ENDED`. UI shows `alert--notice` «Este evento ya terminó.» (not PAYMENTS_DISABLED). Documented here; no Nest clock change.

### Paid 403 vs past Garnachas

Garnachas (past) always returns `EVENT_ENDED` first. `checkout_paid_403_*` / `imported_paid_checkout_403_390` use upcoming **QA Paid Only 403** (created under payments ON, then flag OFF) so PAYMENTS_DISABLED mapping stays covered. Imported detail shots still use Garnachas direct URL with real **31 may**.

## PAYMENTS_DISABLED

Unchanged: map by `code` only. Checkout paid/mixed + create copies as before.

## Create «Publicando…»

Submit loading uses `withButtonLoading(..., { loadingLabel: 'Publicando…' })` — spinner + visible label, width preserved (`is-loading--labeled`). Cover drop unchanged (Bea).

## Wallet codes

Nest wallet: `code: null`, human code in `qrPayload` (`EKU-*`). Web uses that.

## Pass when/place (confirm ≡ entradas ≡ detail)

`/entradas` fetches `/events/:id` per ticket and formats with the same `formatPlace` / `formatEventWhen` as detail and `/confirmacion`.

- DJ / EUDE place: «Teatro Nacional, Centro Histórico»
- Garnachas place: «Bear House»
- Cross-midnight (DJ seed): «sáb 17 oct, 21:00 – dom 18 oct, 02:00» (SV)

## Imported paid dates (PO)

**Do not mutate import dates.** `imported_paid_detail_*` / `_price_390` via **direct** `/eventos/:id` (Proyecto Garnachas **dom 31 may**). Past → ended notice on detail.

**Dropped:** `imported_paid_list_1280` — past imports not in default `/eventos` without Discovery `includePast`.

## Discovery empty

«Todavía no hay eventos próximos.» + «Crear evento» (calendar `#3368b1`, no Reintentar). Guest → login?next=/organizador. Authed → /organizador.

## Grid ü

Natural `/eventos` upcoming = 6 seed events (3 ü + 3 covered).

## Tests

```bash
npm ci && npm test
```

Includes `test:event-past`, `test:loader-ui`, `test:user-facing-error` (409 EVENT_ENDED paid/mixed).

## Shots (`docs/qa/h3_fdd68ae_nest6130711_*.png`) — 45

Prefix: `nest6130711` (no leading N). `h3_1a49d6f_*` deleted.

### Flag OFF

| Shot | Notes |
|------|-------|
| `grid_ufallback_390` / `_1280` | 3 ü + 3 covered |
| `checkout_paid_403_390` / `_1280` | QA Paid Only 403 · paid-only |
| `checkout_mixed_403_390` / `_1280` | DJ · + gratis |
| `free_order_confirm_390` | place Teatro Nacional |
| `waitlist_201_390` | Gala |
| `create_payments_disabled_390` | 0+15 |
| `create_fin_empty_desktop` / `_390` / `_detail_390` | Fin empty **in frame** on desktop/390; detail after publish |
| `create_publicando_390` | «Publicando…» + spinner |
| `evento_terminado_detalle_390` / `_1280` | Garnachas · notice + prices · no buy |
| `evento_terminado_checkout_link_390` | `?reserve=1` · notice · no order |
| `evento_terminado_409_390` | stubbed client Date · Nest 409 · paid |
| `imported_paid_detail_1280` / `_390` / `_price_390` | real **31 may** + ended notice |
| `imported_paid_checkout_403_390` | QA Paid Only 403 (see above) |
| `noche_gala_card_390` / `_detail_390` | ü |
| `discovery_*_empty_{guest,authed}_{390,1280}` | 8 shots |
| `discovery_empty_crear_evento_login_390` | |
| `entradas_invitado_390` | |
| `confirm_sin_tickets_390` / `confirm_guest_cta_login_390` | |

### Flag ON

| Shot | Notes |
|------|-------|
| `u20_checkout_paid_confirm_390` | |
| `u20_checkout_cap_vip_390` | hasta 4 VIP |
| `u20_checkout_qty0_390` | Elegí al menos 1 |
| `pase_confirm_con_portada_390` | DJ cover + Teatro Nacional |
| `pase_confirm_cruza_medianoche_390` | **21:00 – dom 18 oct, 02:00** |
| `pase_confirm_sin_portada_390` | EUDE ü + Teatro Nacional |
| `pase_entradas_wallet_390` | Garnachas **Bear House** + when |
| `pase_entradas_con_portada_390` | DJ cover + Teatro Nacional + EKU |
| `pase_entradas_sin_portada_390` | EUDE ü |
| `perfil_error_390` | light-red |
