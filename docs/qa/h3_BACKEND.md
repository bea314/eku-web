# HEAD 3 — STEP A evidencia (Nest ecb4d8c)

**HEAD de código (app):** `19ecbd3`  
**Tip docs/shots:** see tip commit after this note  
**Nest esperado:** `ecb4d8c` · `TZ=America/El_Salvador` · API `localhost:3000/api`  
**Astro preview:** `127.0.0.1:4321` · `devToolbar` off

## Scope STEP A

1. **Vercel SSR** — `@astrojs/vercel` when `VERCEL=1`, else `@astrojs/node`. Env: `PUBLIC_API_BASE_URL` / `PUBLIC_API_URL`. Docs: `docs/deploy/VERCEL.md`.
2. **PAYMENTS_DISABLED** — map `status === 403` + `body.code === "PAYMENTS_DISABLED"` only (never Nest message text). Own copy:
   - checkout paid-only: «La venta de entradas de pago todavía no está abierta.»
   - checkout mixed: same + «Podés reservar las gratis.»
   - create/PATCH: «Por ahora solo podés publicar eventos gratis. Poné el precio en 0 para publicarlo.»
   - 403 without that code → existing auth/generic handling.
3. **Fin (opcional)** — omit `endDate`/`endsAt` when empty; validate end>start only if set.
4. **lat/lng opcionales** — empty coords omitted from payload.
5. **U20 minors** — pase when/place, entradas copy, guest CTA, confirm blue notice, cap without N → checkout generic, perfil light-red error.

## Tests

```bash
npm ci && npm test
```

**Count:** 125 ok (includes PAYMENTS_DISABLED by-code + 403-without-code + Nest-ES-text-without-code).

## Shots (`docs/qa/h3_19ecbd3_nestEcb4d8c_*.png`)

### Taken (UI-only — Nest DOWN)

| Shot | Notes |
|------|-------|
| `confirm_sin_tickets` (+ `_390`) | Blue notice + single CTA `Ir a Mis entradas` (session orderId, empty tickets) |
| `entradas_invitado` | Guest gate «Iniciá sesión…» + Entrar |
| `organizador_invitado` | Guest create CTA |
| `perfil_sin_api` | Guest perfil (no light-red; needs authed+API for error box) |
| `home_preview` | SSR preview loads; events error (Nest down) |

### Blocked — need Nest `ecb4d8c`

Checkout/create **403 PAYMENTS_DISABLED** (paid / mixed / create), free/waitlist **201**, Fin opcional on create form, paid detail, wallet pase when/place, perfil error box, U20 regression set.

`bea314/so-microservicio@ecb4d8c` not reachable (private / no API on `:3000`). External access requested. STEP B waits on Crop SHA + Nest.

`u20r_*` deleted (U20 gate closed).

## PAYMENTS_DISABLED contract (Crop)

| Case | Nest | UI |
|------|------|-----|
| Paid checkout | 403 `{ code: "PAYMENTS_DISABLED", message: <ES Nest> }` | Our checkout copy (ignore Nest message) |
| Mixed checkout | same | Checkout + «Podés reservar las gratis.» |
| Create paid | same | Create copy; keep form; red borders price>0 |
| Free / waitlist | 201 | Unchanged |
| 403 other | no `PAYMENTS_DISABLED` code | Existing auth/generic |
