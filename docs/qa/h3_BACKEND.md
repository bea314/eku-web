# HEAD 3 — evidencia Nest d043acd

**HEAD de código (app):** `1a49d6f`  
**Tip docs/shots:** `8faecce`
**Nest:** `d043acd` (tarball `so-microservicio-d043acd.tar.gz`, sha256 `f0a0e6d029ee70d33c54b4d4bd2793bcd90607bf4556a1ef06bbbb9ed5c40ce9`)  
**TZ:** `America/El_Salvador`  
**API:** `http://localhost:3000/api` · Astro preview `http://127.0.0.1:4321`

## Boot (local)

```bash
cp .env.example .env   # PAYMENTS_ENABLED unset (=false)
npm ci && npx prisma generate && TZ=America/El_Salvador npm run db:setup
TZ=America/El_Salvador npm run fixture:real-events -- \
  --status=LISTA --live \
  --uploads=./uploads \
  --organizer-names=./uploads/organizer_display_names.json
unset PAYMENTS_ENABLED
TZ=America/El_Salvador npm run start:dev
```

Org: `johndoe@correo.com.sv` / `Password123`

## Seed covers (d043acd)

| Event | Cover |
|-------|-------|
| DJ PARTY, El Cascanueces, ESCINE | MinIO JPEG |
| Show de mimos, Concierto EUDE, Noche de Gala | **none** → ü |

## Flag values

| Shot group | `PAYMENTS_ENABLED` |
|------------|--------------------|
| 403s, free, waitlist, create, Fin, imported paid (direct URL), Gala ü, empty, grid | **unset** |
| U20 paid/cap/qty0, pase confirm/entradas | **`true`** |

## PAYMENTS_DISABLED

Unchanged: map by `code` only. Checkout paid/mixed + create copies as before.

## Wallet codes

Nest wallet: `code: null`, human code in `qrPayload` (`EKU-*`). Web uses that.

## Pass when/place (confirm ≡ entradas ≡ detail)

`/entradas` fetches `/events/:id` per ticket and formats with the same `formatPlace` / `formatEventWhen` as detail and `/confirmacion`.

- DJ / EUDE place: «Teatro Nacional, Centro Histórico» (not Nest geo `venue`)
- Garnachas place: «Bear House» (`location.name`)
- Cross-midnight (DJ seed): «sáb 17 oct, 21:00 – dom 18 oct, 02:00» (SV)

## Imported paid dates (PO)

**Do not mutate import dates.** `imported_paid_detail_*` / `_price_390` / `_checkout_403_390` taken via **direct** `/eventos/:id` (Proyecto Garnachas stays **dom 31 may**).

**Dropped:** `imported_paid_list_1280` — past imports are not in default `/eventos` upcoming without Discovery `includePast` (Bea decides). Documented here instead of faking dates.

## Discovery empty

«Todavía no hay eventos próximos.» + «Crear evento» (calendar `#3368b1`, no Reintentar). Guest → login?next=/organizador. Authed → /organizador. home+/eventos × guest+authed × 390+1280.

## Grid ü

Natural `/eventos` upcoming = 6 seed events (3 ü + 3 covered). `grid_ufallback_390` / `_1280`.

## Tests

```bash
npm ci && npm test
```

**Count:** 136 ok.

## Shots (`docs/qa/h3_1a49d6f_nestD043acd_*.png`) — 40

### Flag OFF

| Shot | Notes |
|------|-------|
| `grid_ufallback_390` / `_1280` | 3 ü + 3 covered |
| `checkout_paid_403_390` / `_1280` | Garnachas · paid-only |
| `checkout_mixed_403_390` / `_1280` | DJ · + gratis |
| `free_order_confirm_390` | place Teatro Nacional |
| `waitlist_201_390` | Gala |
| `create_payments_disabled_390` | 0+15 |
| `create_fin_empty_desktop` / `_390` / `_detail_390` | Fin omitted |
| `imported_paid_detail_1280` / `_390` / `_price_390` | real **31 may** via direct URL |
| `imported_paid_checkout_403_390` | same |
| ~~`imported_paid_list_1280`~~ | **dropped** (see above) |
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

`h3_ee5600e_*` deleted.
