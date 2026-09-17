# ekü web

Frontend Astro (MVP) para boletería / cultura local. Consume Nest [`bea314/so-microservicio`](https://github.com/bea314/so-microservicio) — **happy-path branch** [`cursor/web-mvp-happy-path-astro`](https://github.com/bea314/so-microservicio/pull/3) (Crop PR draft).

Contracts: `docs/WEB_API_CONTRACTS_A1_A10.md` · Nest runbook: `docs/LOCAL_RUNBOOK_WEB_MVP.md` (on that branch).

## Requisitos

- Node.js ≥ 22.12
- Nest API from Crop’s web-MVP PR branch on **:3000** with global prefix `/api`
- CORS en Nest permitiendo el origen Astro (`http://localhost:4321`)

## Setup local (A10 — mirrors Crop LOCAL_RUNBOOK)

### 1. Nest (Crop PR)

```bash
# En so-microservicio @ cursor/web-mvp-happy-path-astro
# Seguí docs/LOCAL_RUNBOOK_WEB_MVP.md → Nest en http://localhost:3000
```

Seed organizador (Crop):

- Email: `johndoe@correo.com.sv`
- Password: `Password123`
- Auth: `POST /api/auth/sign-in` → `accessToken`

### 2. Astro (este repo)

```bash
cp .env.example .env
# Exacto (base YA incluye /api):
# PUBLIC_API_BASE_URL=http://localhost:3000/api

npm install
npm run dev
```

Abrí [http://localhost:4321](http://localhost:4321) → `/eventos`.

> Si apuntás a Nest `main` sin el PR de Crop, endpoints nuevos pueden **404**. El front espera el contrato del PR #3.

### Variables

| Variable | Valor |
| --- | --- |
| `PUBLIC_API_BASE_URL` | `http://localhost:3000/api` (incluye `/api`) |

El cliente llama `${PUBLIC_API_BASE_URL}/events`, `${PUBLIC_API_BASE_URL}/checkout/confirm`, etc.  
Envelope Nest: `{ code, message, data: { items } }` → el client unwrappea `data.items`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Astro en **:4321** |
| `npm run build` | Build SSR (`@astrojs/node`) |
| `npm run preview` | Preview del build |
| `npm start` | `node ./dist/server/entry.mjs` |

## Rutas ↔ criterios

| Ruta | Criterio |
| --- | --- |
| `/eventos` | **A3** `GET /events` |
| `/eventos/[id]?invite=` | **A4/A5/A6/A9** `GET /events/:id` + hosts |
| `/eventos/[id]/checkout` | **A7/A7b/A8** preview + confirm guest |
| `/confirmacion` | orderId + tickets / qrPayloads |
| `/organizador` | **A1/A2/A6** sign-in, create, patch, invites |

## Contratos (Crop)

Base: `http://localhost:3000/api`

- `POST /auth/sign-in` `{ email, password }` → `data.items.{ accessToken, refreshToken }` (JWT crudo en localStorage; org calls `Authorization: Bearer <accessToken>`)
- `GET /events` — discovery público
- `GET /events/:id?invite=`
- `GET /events/:eventId/ticket-types?invite=`
- `POST /events` Bearer — create + publish, ticketTypes `$0`
- `PATCH /events/:id` Bearer
- `GET /events/mine` Bearer
- `POST /events/:id/invites` Bearer → copiar `?invite=`
- `POST /checkout/preview` y `POST /checkout/confirm` **sin** Bearer — body Nest PR #3:
  `{ eventId, items: [{ eventTicketTypeId: number, quantity }], acceptedTerms, inviteToken?, guest: { email, guestSessionId, firstName } }`
  → confirm unwrap → orderId + tickets + qrPayloads
- Stock overflow → **400** con mensaje claro (**A8**)

## QA A1–A9 (local)

1. Nest Crop PR en `:3000` + CORS para `:4321`
2. `PUBLIC_API_BASE_URL=http://localhost:3000/api` + `npm run dev`
3. **A1** `/organizador` → Entrar con seed → publicar evento $0
4. **A2** Editar nombre/fecha → refresh detalle
5. **A3** Evento public aparece en `/eventos`
6. **A4** unlisted: no en lista, sí por URL
7. **A5/A6** private sin/con `?invite=`
8. **A7** guest checkout → confirmación con orderId + ticket/QR
9. **A8** sobrepasar cupo → error 400 en UI
10. **A9** Hosted by en detalle

**A10:** local runbook (este README). Vercel no forzado.

## Deploy (opcional)

Solo cuando Nest tenga URL pública + CORS:

1. `PUBLIC_API_BASE_URL=https://<nest-host>/api`
2. `npm run build && npm start` (o adaptá el host)

## Fuera de scope

Promoter registration, colaboradores, perfiles, mapas, Flutter, pasarela de pago, email transaccional.
