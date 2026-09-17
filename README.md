# ekü web

Frontend Astro (MVP) para boletería / cultura local.

**API required:** Nest from **so-microservicio PR #3** branch  
[`cursor/web-mvp-happy-path-astro`](https://github.com/bea314/so-microservicio/pull/3)  
— **not** Nest `main`. U9 / U10 / U11 endpoints live only on that branch.

Contracts on the Nest branch: `docs/WEB_API_CONTRACTS_A1_A10.md` · runbook: `docs/LOCAL_RUNBOOK_WEB_MVP.md`.

## Requisitos

- Node.js ≥ 22.12
- Nest from Crop PR #3 (`cursor/web-mvp-happy-path-astro`) on **:3000** with global prefix `/api`
- CORS en Nest permitiendo el origen Astro (`http://localhost:4321`)

> **FAIL if you run Nest `main`:** `/auth/me`, `/profiles/me/*`, `/events/:id/waitlist`, `/wallet/tickets` (and related U9–U11) will 404 or reject tokens. Always checkout the happy-path branch below.

## Setup local

### 1. Nest — Crop PR #3 only

```bash
git clone https://github.com/bea314/so-microservicio.git
cd so-microservicio
git fetch origin pull/3/head:cursor/web-mvp-happy-path-astro
# or, if the branch exists on the remote:
git checkout cursor/web-mvp-happy-path-astro

# Follow docs/LOCAL_RUNBOOK_WEB_MVP.md on that branch
# → Nest listening at http://localhost:3000 (prefix /api)
```

Seed organizador (Crop runbook / seed):

| Field | Value |
| --- | --- |
| Email | `johndoe@correo.com.sv` |
| Password | `Password123` |
| Auth | `POST /api/auth/sign-in` → `data.items.accessToken` (raw JWT) |

Use that JWT as `Authorization: Bearer <accessToken>` for org + profile + wallet calls. Store **raw** JWT only (no `Bearer Bearer`).

### 2. Astro (este repo)

```bash
cp .env.example .env
# MUST point at Crop PR #3 Nest (includes /api — do not append another /api):
# PUBLIC_API_BASE_URL=http://localhost:3000/api

npm install
npm run dev
```

Abrí [http://localhost:4321](http://localhost:4321) → `/eventos`.

### Variables

| Variable | Valor |
| --- | --- |
| `PUBLIC_API_BASE_URL` | `http://localhost:3000/api` — Nest **PR #3** only; already includes `/api` |

El cliente llama `${PUBLIC_API_BASE_URL}/events`, `${PUBLIC_API_BASE_URL}/checkout/confirm`, `${PUBLIC_API_BASE_URL}/auth/me`, etc.  
Envelope Nest: `{ code, message, data: { items } }` → el client unwrappea `data.items` (confirm usa envelope raw para no perder `qrPayloads`).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Astro en **:4321** |
| `npm run build` | Build SSR (`@astrojs/node`) |
| `npm run preview` | Preview del build |
| `npm start` | `node ./dist/server/entry.mjs` |

## Rutas ↔ Nest (Crop PR #3)

| Ruta | Criterio / API |
| --- | --- |
| `/eventos` | **A3** `GET /events` |
| `/eventos/[id]?invite=` | **A4/A5/A6/A9** + **U10** waitlist + **U12** native `og:*` |
| `/eventos/[id]` reserve modal | **A7** `POST /checkout/preview` + `POST /checkout/confirm` |
| `/confirmacion` | **U11** `tickets[]` + `qrPayloads[]` → client QR (`uqr`) |
| `/entradas` | **U11** `GET /wallet/tickets` Bearer |
| `/perfil` | **U9** `GET /auth/me` + `GET /profiles/me/hosted\|attended?scope=` |
| `/organizador` | **A1/A2/A6** sign-in, create, patch, invites |

## Contratos (Crop PR #3)

Base: `http://localhost:3000/api` (from happy-path Nest, **not** `main`)

**Core A1–A10**

- `POST /auth/sign-in` `{ email, password }` → `data.items.{ accessToken, refreshToken }`
- `GET /events` — discovery público
- Covers (**N1**): prefer `coverImageUrl`, then `image_url` (nullable). Null → tab favicon placeholder (`/favicon-32.png`)
- `GET /events/:id?invite=`
- `GET /events/:eventId/ticket-types?invite=`
- `POST /events` Bearer — create + publish, ticketTypes `$0`
- `PATCH /events/:id` Bearer
- `GET /events/mine` Bearer
- `POST /events/:id/invites` Bearer → `?invite=`
- `POST /checkout/preview` y `POST /checkout/confirm` **sin** Bearer — body:
  `{ eventId, items: [{ eventTicketTypeId: number, quantity }], acceptedTerms, inviteToken?, guest: { email, guestSessionId, firstName } }`
  → confirm `data.items.{ orderId, tickets[], qrPayloads[] }`

**U9 / U10 / U11 (PR #3 only — missing on Nest `main`)**

- `GET /auth/me` Bearer
- `GET /profiles/me/hosted?scope=upcoming|past|all` Bearer
- `GET /profiles/me/attended?scope=upcoming|past|all` Bearer
- `POST /events/:id/waitlist` (guest session or auth) — on error keep UI, no fake success
- `GET /wallet/tickets` Bearer — fields include `name`, `coverImageUrl`

## Brand (wave palette)

- `--brand-blue: #3368B1` · `--yellow: #FED239` · `--green: #66B97D` · `--ink: #2C3441`
- Page bg: white / cool gray — **not** cream / **not** purple Material
- Type: Geist via `/fonts/Geist-Variable.woff2`

## QA local (Crop PR #3 Nest)

1. Nest **`cursor/web-mvp-happy-path-astro`** on `:3000` + CORS for `:4321`
2. `PUBLIC_API_BASE_URL=http://localhost:3000/api` + `npm run dev`
3. **A1–A9** happy path (org create → list → invite → guest reserve)
4. **U7** reserve opens short modal (not full-page checkout)
5. **U9** `/perfil` after org login → `/auth/me`; guest → soft gate (no Invalid Token spam)
6. **U10** sold-out → `POST …/waitlist` (error keeps CTA)
7. **U11** confirm → notched pase + client QR from Nest `qrPayloads`
8. **U12** view source on `/eventos/:id` → `og:title` / `og:description` / `og:image` / `og:url` from Nest name, description, coverImageUrl (check with opengraph.xyz; do not call it from the app)

## Deploy (opcional)

Solo cuando Nest **PR #3** tenga URL pública + CORS:

1. `PUBLIC_API_BASE_URL=https://<nest-host>/api`
2. `npm run build && npm start`

## Fuera de scope

Promoter registration, colaboradores, mapas, Flutter, pasarela de pago, email transaccional, Nest graph Mutual/Block/Report (UI stubs only).
