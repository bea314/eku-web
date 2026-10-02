# U20r backend evidence — Nest REAL a69f751

**Astro HEAD (shots):** `cc85dd4fcee8bfea6fc515c1acbf412cc79c00c5` (`cc85dd4`) — sin cambios de app en este run; solo `docs/qa`.  
**Nest SHA (tarball):** `a69f751f2189d9e8d06844fe3db9d9ad1fa77787` (`a69f751`) — `VERSION.txt` del tarball Crop.  
**Base URL:** `http://localhost:3000/api`  
**Astro:** `PUBLIC_API_BASE_URL=http://localhost:3000/api` → `http://127.0.0.1:4321`  
**Seed user:** `johndoe@correo.com.sv` / `Password123`  
**Auth:** `POST /auth/sign-in` → `data.items.accessToken`

## Setup (sin Docker / sin S3)

```bash
# 1) Extraer tarball FUERA de eku-web (no commitear)
mkdir -p /workspace/eku-staging
tar -xzf uploads/so-microservicio-a69f751.tar.gz -C /workspace/eku-staging
# → /workspace/eku-staging/so-microservicio

# 2) .env ANTES de npm ci (DATABASE_URL literal)
cd /workspace/eku-staging/so-microservicio
cat > .env <<'EOF'
PORT=3000
APP_URL=http://localhost
CORS_ORIGINS=http://localhost:4321,http://127.0.0.1:4321
DB_PASSWORD=postgres
DB_USERNAME=postgres
DB_NAME=sold_out
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sold_out?schema=public
SECRET_AUTH_TOKEN_KEY='SECRET_AUTH_TOKEN_KEY'
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=soldout-events
MINIO_PUBLIC_URL=http://127.0.0.1:9000/soldout-events
IMGPROXY_ENABLED=false
# REDIS_HOST=127.0.0.1
GEO_PROVIDER=selfhosted
ALLOW_PUBLIC_OSM=false
EOF

# 3) Postgres + deps + migrate/seed + build/start
sudo service postgresql start
sudo -u postgres dropdb --if-exists sold_out && sudo -u postgres createdb sold_out
npm ci
npx prisma generate   # si .env se movió después de ci
npm run db:setup      # migrate deploy + seed (incluye Sold Out Waitlist)
npm run build
node dist/src/main.js # NO usar start:prod (busca dist/main)

# 4) Astro (otra terminal)
cd /workspace
# .env ya tiene PUBLIC_API_BASE_URL=http://localhost:3000/api
npm run dev -- --host 127.0.0.1 --port 4321
```

**Nota:** En esta VM había un mock en `:3000` (`/tmp/eku-mock-crop.mjs`); se mató antes de levantar Nest real.

## DEUDA — lat/lng fijos en create (ekü)

Nest `a69f751` responde **400** «debes seleccionar una ubicación con coordenadas» sin lat/lng.  
Create UI mantiene hidden `lat=13.6929` / `lng=-89.2182`. Sacar cuando Crop publique SHA con publish solo-dirección.

## Hallazgo lista vs detalle (cards)

`GET /events` en **a69f751** **no** incluye `event_ticket_types` / `ticketTypes` / `startingPrice` (`findAll` omite esas relaciones).  
La UI de cards hace fallback a **«Gratis»** cuando no hay precio en el item de lista.  
Los tres casos de precio (pago / gratis / mixta) se crearon por `POST /events` real y se ven **en la misma fila** (`?search=U20r`); los labels de precio correctos se demuestran en **detalle** (`startingPrice` + `ticketTypes[].available`).

## Eventos creados vía API (payloads)

Coords fijas en todos. Auth Bearer de `johndoe@correo.com.sv`.

### U20r Solo pago → `e391bce0-6b5d-43c1-9b24-5c5cbaaa7e56`

```json
{
  "name": "U20r Solo pago",
  "description": "Solo tipos pagos — card Desde",
  "startDate": "<+14d 20:00Z>",
  "endDate": "<+14d 23:00Z>",
  "visibility": "public",
  "status": "published",
  "location": {
    "address": "Teatro Nacional, Centro Histórico",
    "latitude": 13.698,
    "longitude": -89.191,
    "source": "manual"
  },
  "ticketTypes": [
    { "name": "General", "price": 40, "quantity": 40, "maxPerOrder": 5 },
    { "name": "VIP", "price": 20, "quantity": 20, "maxPerOrder": 4 },
    { "name": "Ilimitado", "price": 55, "quantity": null, "maxPerOrder": 3 }
  ]
}
```

### U20r Solo gratis → `901fe5a4-848e-4e0d-b371-9d2928573356`

```json
{
  "name": "U20r Solo gratis",
  "description": "Solo precio 0 — card Gratis",
  "visibility": "public",
  "status": "published",
  "location": {
    "address": "Plaza Libertad",
    "latitude": 13.7,
    "longitude": -89.2,
    "source": "manual"
  },
  "ticketTypes": [
    { "name": "Entrada libre", "price": 0, "quantity": 50, "maxPerOrder": 5 }
  ]
}
```

### U20r Mixta → `f10dd9f8-5ac0-4f4b-8428-87c9edaa8759`

```json
{
  "name": "U20r Mixta",
  "description": "Tipo gratis + tipo pago — card Gratis (min 0)",
  "visibility": "public",
  "status": "published",
  "location": {
    "address": "Parque Cuscatlán",
    "latitude": 13.701,
    "longitude": -89.22,
    "source": "manual"
  },
  "ticketTypes": [
    { "name": "Entrada libre", "price": 0, "quantity": 30, "maxPerOrder": 5 },
    { "name": "General", "price": 25, "quantity": 40, "maxPerOrder": 5 }
  ]
}
```

## Shots (`docs/qa/u20r_cc85dd4_nestA69f751_<qué>.png`)

| Shot | Path | Qué demuestra | JSON Nest relevante |
| --- | --- | --- | --- |
| 1 Cards fila | `docs/qa/u20r_cc85dd4_nestA69f751_cards_precio_fila.png` | Tres cards U20r (pago/gratis/mixta) en la misma fila (`/eventos?search=U20r`). Labels de lista = «Gratis» por contrato lista a69f751 (ver hallazgo). | Lista slim: sin `event_ticket_types`/`startingPrice`. Detalle paga abajo. |
| 2 Detalle pago | `docs/qa/u20r_cc85dd4_nestA69f751_detail_desde_quedan.png` | Encabezado **Desde 20,00 US$** (sin `$0`); VIP Quedan 20; General Quedan 40; Ilimitado sin cupo line | `GET /events/:id` + `ticket-types` abajo |
| 3 Waitlist | `docs/qa/u20r_cc85dd4_nestA69f751_waitlist_soldout.png` | Seed `Sold Out Waitlist (seed)` → EVENTO LLENO + waitlist (no «Reservar gratis») | `available: 0` seed |
| 4 Coords maps | `docs/qa/u20r_cc85dd4_nestA69f751_detail_coords_abrir_maps.png` | Con coords: dirección + Abrir en Maps; sin Leaflet/tiles/API KEY | location lat/lng en detalle |
| 5 Fechas ES | `docs/qa/u20r_cc85dd4_nestA69f751_create_fechas_copy.png` | Inline «Elegí fecha y hora de inicio» | — |
| Create OK | `docs/qa/u20r_cc85dd4_nestA69f751_create_publicado_ok.png` | Evento creado vía UI visible en detalle (`bab9d935-…`, Desde 12,00 US$) | respuesta create UI |
| Org guest | `docs/qa/u20r_cc85dd4_nestA69f751_organizador_invitado.png` | Copy producto + Iniciar sesión | — |
| novalidate | `docs/qa/u20r_cc85dd4_nestA69f751_create_novalidate.png` | `novalidate` + error inline (sin globo nativo de submit) | — |

### GET `/events/e391bce0-…` (detalle pago) — `startingPrice` + `available` 40/20/null

```json
{
  "id": "e391bce0-6b5d-43c1-9b24-5c5cbaaa7e56",
  "name": "U20r Solo pago",
  "startingPrice": 20,
  "location": {
    "address": "Teatro Nacional, Centro Histórico",
    "latitude": "13.698",
    "longitude": "-89.191"
  },
  "ticketTypes": [
    { "name": "VIP", "price": 20, "available": 20, "maxPerOrder": 4 },
    { "name": "General", "price": 40, "available": 40, "maxPerOrder": 5 },
    { "name": "Ilimitado", "price": 55, "available": null, "maxPerOrder": 3 }
  ]
}
```

(`GET …/ticket-types` confirma los mismos `available`.)

### GET `/events/1555c682-…/ticket-types` (seed agotado)

```json
{
  "items": [
    {
      "id": "24",
      "name": "Agotado",
      "price": 0,
      "available": 0,
      "maxPerOrder": 1,
      "isSoldOut": true
    }
  ]
}
```

Seed id: `1555c682-a573-4fe7-af29-1ef0618fbcdb` — `Sold Out Waitlist (seed)`.

### GET `/events` lista — U20r items (sin ticket types)

```json
{
  "items": [
    {
      "id": "e391bce0-6b5d-43c1-9b24-5c5cbaaa7e56",
      "name": "U20r Solo pago",
      "startingPrice": null,
      "event_ticket_types": null,
      "ticketTypes": null,
      "NOTE": "a69f751 findAll omite ticket types / startingPrice"
    },
    {
      "id": "901fe5a4-848e-4e0d-b371-9d2928573356",
      "name": "U20r Solo gratis"
    },
    {
      "id": "f10dd9f8-5ac0-4f4b-8428-87c9edaa8759",
      "name": "U20r Mixta"
    }
  ]
}
```

### Create UI publicado OK

- Nombre: `U20r Publicado 1790981885863`
- id: `bab9d935-8452-4591-aef7-4b369dca1ac8`
- Status UI: «Evento publicado. Ver evento»
- Detalle: `startingPrice` efectivo → **Desde 12,00 US$**; Quedan 40 / Quedan 20
- lat/lng enviados: defaults deuda `13.6929` / `-89.2182`

## Smoke

```bash
API_BASE=http://localhost:3000/api npm run smoke:web
# (opcional; shots U20r no dependen del smoke)
```
