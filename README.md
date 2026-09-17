# ekü web

Frontend Astro (MVP) para boletería / cultura local. Consume la API Nest [`bea314/so-microservicio`](https://github.com/bea314/so-microservicio) vía `PUBLIC_API_BASE_URL`.

Norte de producto (no scope de este sprint): boletería + tercer lugar + cultura local. UI web/desktop — no clona la app Flutter 1:1.

## Requisitos

- Node.js ≥ 22.12
- Nest API corriendo (local o remoto) con prefijo global `/api`
- CORS en Nest permitiendo el origen del front (ej. `http://localhost:4321`)

## Setup local

```bash
cp .env.example .env
# Editá PUBLIC_API_BASE_URL — base Nest SIN /api ni slash final
# Ejemplo: PUBLIC_API_BASE_URL=http://localhost:3000

npm install
npm run dev
```

Abrí [http://localhost:4321](http://localhost:4321) → redirige a `/eventos`.

### Variables de entorno

| Variable | Uso |
| --- | --- |
| `PUBLIC_API_BASE_URL` | Base Nest (browser + build). Ej. `http://localhost:3000` |
| `API_BASE_URL` | Opcional, server-only override (misma forma) |

El cliente arma URLs como `{BASE}/api/events`, `{BASE}/api/checkout/confirm`, etc.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Dev server Astro (puerto 4321) |
| `npm run build` | Build SSR (`@astrojs/node`) |
| `npm run preview` | Preview del build |
| `npm start` | Sirve el build Node (`dist/server/entry.mjs`) |

## Rutas

| Ruta | Rol (criterio) |
| --- | --- |
| `/` → `/eventos` | Discovery público — `GET /api/events` (**A3**) |
| `/eventos/[id]?invite=` | Detalle + Hosted by + tickets (**A4/A5/A6/A9**) |
| `/eventos/[id]/checkout` | Guest checkout $0 (**A7/A8**) |
| `/confirmacion` | Order ID + evidencia de ticket |
| `/organizador` (alias `/org`) | Login/token, crear+publicar (**A1**), editar (**A2**), invite link (**A6**) |

## Contratos Nest usados

Base: `{PUBLIC_API_BASE_URL}/api`

- `GET /events`
- `GET /events/:id?invite=`
- `GET /events/:eventId/ticket-types`
- `POST /events` (Bearer)
- `PATCH /events/:id` (Bearer)
- `GET /events/mine` (Bearer)
- `POST /events/:id/invites` (Bearer)
- `POST /checkout/preview`
- `POST /checkout/confirm` (guest + email)
- `POST /auth/login` (opcional; si no existe, pegá JWT)

Respuestas esperadas con forma `{ items, pagination? }` cuando aplica. Si un endpoint falta o falla, la UI muestra el error de Nest — no inventa mocks de dominio.

## QA runbook (A1–A9)

Prerrequisitos: Nest arriba, `.env` apuntando, `npm run dev`, CORS OK. Token de organizador (Bearer) listo.

1. **A1 Crear &lt;2 min** — `/organizador` → pegá JWT → formulario Crear y publicar (nombre, datetime, lugar, ticket $0, visibility, publicar) → submit → aparece en “Mis eventos”.
2. **A2 Editar** — Editar → cambiá nombre o fecha → Guardar → refresh detalle `/eventos/:id` muestra el cambio.
3. **A3 Public en discovery** — Evento `public`+`published` aparece en `/eventos`.
4. **A4 Unlisted** — Creá `unlisted` → no en `/eventos` → sí abre `/eventos/:id` directo.
5. **A5 Private sin invite** — `private` sin `?invite=` → detalle/checkout bloqueado (404/403 API).
6. **A6 Private con link** — En editar private → “Crear / copiar link” → abrí el link → detalle OK → checkout $0.
7. **A7 Guest checkout** — Checkout sin login → email + qty → `/confirmacion` con `orderId` + códigos.
8. **A8 Stock** — Capacidad N → N reservas OK → N+1 error o CTA agotado.
9. **A9 Hosted by** — Detalle muestra host real desde API (si Nest lo envía).

**A10:** este repo documenta el entorno local. Vercel no se forzó (front y API son URLs distintas; deploy preview solo cuando Nest tenga URL pública estable + CORS).

## Deploy (opcional)

No hay configuración Vercel en este PR a propósito. Cuando Nest esté en una URL pública:

1. Set `PUBLIC_API_BASE_URL` al origen Nest.
2. Habilitá CORS para el dominio del front.
3. `npm run build && npm start` (Node standalone), o adaptá el host a tu plataforma.

## Fuera de scope

Registro de promoters, colaboradores, perfiles públicos, mapas, Flutter, pasarela de pago, email transaccional.
