# HEAD 3 — evidencia Nest d043acd

**HEAD de código (app):** `ee5600e`  
**Tip docs/shots:** _(this commit)_  
**Nest:** `d043acd` (tarball `so-microservicio-d043acd.tar.gz`, sha256 `f0a0e6d029ee70d33c54b4d4bd2793bcd90607bf4556a1ef06bbbb9ed5c40ce9`)  
**TZ:** `America/El_Salvador`  
**API:** `http://localhost:3000/api` · Astro preview `http://127.0.0.1:4321`

## Boot (local)

```bash
# Postgres sold_out + MinIO via scripts/setup-local-s3.sh
cp .env.example .env   # PAYMENTS_ENABLED left unset (=false)
npm ci && npx prisma generate && TZ=America/El_Salvador npm run db:setup
# Import 82 LISTA (server-side) — tarball has no uploads/; reuse prior uploads/ for organizer names
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
| DJ PARTY - 80s Night | MinIO JPEG (`seed/dj-party-80s/cover.jpg`) |
| El Cascanueces | MinIO JPEG |
| Festival de cortos ESCINE | MinIO JPEG |
| Show de mimos | **none** → ü |
| Concierto EUDE - Artista local | **none** → ü |
| Noche de Gala San Salvador | **none** → ü |

## Flag values

| Shot group | `PAYMENTS_ENABLED` |
|------------|--------------------|
| checkout 403, free 201, waitlist, create notice, Fin empty, imported paid, Gala ü, discovery empty, grid ü | **unset** (false) |
| U20 paid confirm, cap VIP, qty 0, pase confirm/entradas | **`true`** |

## PAYMENTS_DISABLED contract (map by `code`, never Nest message)

Unchanged vs c804bcc. Checkout paid/mixed → `code: PAYMENTS_DISABLED` + our copy. Create price>0 → create copy. Free confirm → HTTP 201.

## Wallet ticket codes (Nest has no `code`)

`GET /api/wallet/tickets` returns **`code: null`**. Human code lives only in **`qrPayload`** (e.g. `EKU-1-001`). Confirm envelope still returns `tickets[].code` / `number`.

Web: `ticketDisplayCode` / `paseRows` prefer `code` → `number` → `ticketCode` → `qrPayload`; never show a raw UUID (short 8-char fallback only if nothing else).

Example Nest wallet row (coverless EUDE — Nest also injects mic Unsplash placeholder):

```json
{
  "id": "0237c68f-ba69-4c8a-8e12-d04f3b252140",
  "code": null,
  "qrPayload": "EKU-1-001",
  "name": "Concierto EUDE - Artista local",
  "coverImageUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop",
  "eventCoverUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop"
}
```

Web strips that Nest wallet mic placeholder URL → ü for truly coverless events.

## Discovery empty

PO: «Todavía no hay eventos próximos.» + one «Crear evento» (neutral calendar icon `#3368b1`, **no Reintentar**). Guest → `/login?next=/organizador`. Authed → `/organizador`. Shots: home + /eventos × guest + authed × 390 + 1280.

## Grid ü fallback (natural)

At shot time, default `/eventos` upcoming listed exactly the 6 seed catalog events (3 ü + 3 covered) with no filter/date faking: Show de mimos, Concierto EUDE, Noche de Gala, DJ PARTY, El Cascanueces, ESCINE. Shots: `grid_ufallback_390` / `_1280`.

## Tests

```bash
npm ci && npm test
```

**Count:** 135 ok (empty-events + pase-code + cover placeholder strip + PAYMENTS_DISABLED by-code).

## Shots (`docs/qa/h3_ee5600e_nestD043acd_*.png`)

### Flag OFF

| Shot | Notes |
|------|-------|
| `grid_ufallback_390` / `_1280` | 3 ü + 3 covered seed events side by side |
| `checkout_paid_403_390` / `_1280` | Proyecto Garnachas · paid-only copy |
| `checkout_mixed_403_390` / `_1280` | DJ PARTY · + «Podés reservar las gratis.» |
| `free_order_confirm_390` | Entrada libre · 201 · pase |
| `waitlist_201_390` | Gala sold-out |
| `create_payments_disabled_390` | types 0 + 15 |
| `create_fin_empty_desktop` / `_390` / `_detail_390` | Fin omitted · no end on detail |
| `imported_paid_list_1280` | Garnachas (briefly upcoming for list only) |
| `imported_paid_detail_1280` / `_390` / `_price_390` | prices |
| `imported_paid_checkout_403_390` | same 403 |
| `noche_gala_card_390` / `_detail_390` | ü |
| `discovery_home_empty_guest_390` / `_1280` | empty · no Reintentar |
| `discovery_home_empty_authed_390` / `_1280` | Crear → `/organizador` |
| `discovery_eventos_empty_guest_390` / `_1280` | same |
| `discovery_eventos_empty_authed_390` / `_1280` | same |
| `discovery_empty_crear_evento_login_390` | guest → login?next=/organizador |
| `entradas_invitado_390` | guest gate |
| `confirm_sin_tickets_390` | light-blue |
| `confirm_guest_cta_login_390` | login?next=/entradas |

### Flag ON

| Shot | Notes |
|------|-------|
| `u20_checkout_paid_confirm_390` | paid → pase |
| `u20_checkout_cap_vip_390` | «Podés llevar hasta 4 entradas de VIP.» |
| `u20_checkout_qty0_390` | «Elegí al menos 1 entrada.» |
| `pase_confirm_con_portada_390` | DJ cover |
| `pase_confirm_sin_portada_390` | EUDE ü |
| `pase_confirm_cruza_medianoche_390` | sáb 17 oct, 21:00 – dom 18 oct, 02:00 |
| `pase_entradas_wallet_390` | EKU-* codes (not UUID) |
| `pase_entradas_con_portada_390` | DJ cover + EKU |
| `pase_entradas_sin_portada_390` | EUDE ü + EKU |
| `perfil_error_390` | light-red |

`h3_2fea8be_*` and `h3_*_nestC804bcc_*` deleted.
