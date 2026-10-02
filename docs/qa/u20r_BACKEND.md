# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `f50a7268fb11b37e991be064fe07da0e8e236510` (`f50a726`)  
**Nest SHA (tarball Crop):** `a69f751f2189d9e8d06844fe3db9d9ad1fa77787` (`a69f751`)  
**Base URL:** `http://localhost:3000/api`  
**Astro:** `PUBLIC_API_BASE_URL=http://localhost:3000/api` → `http://127.0.0.1:4321`  
**Seed:** `johndoe@correo.com.sv` / `Password123` · `POST /auth/sign-in`  
**Node:** ≥22 (`.nvmrc` + `engines`)

## Setup Nest (tarball, sin Docker / sin S3)

```bash
mkdir -p /workspace/eku-staging
tar -xzf uploads/so-microservicio-a69f751.tar.gz -C /workspace/eku-staging
cd /workspace/eku-staging/so-microservicio

# .env ANTES de npm ci — DATABASE_URL literal
cat > .env <<'EOF'
PORT=3000
CORS_ORIGINS=http://localhost:4321,http://127.0.0.1:4321
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sold_out?schema=public
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=sold_out
DB_HOST=localhost
DB_PORT=5432
SECRET_AUTH_TOKEN_KEY='SECRET_AUTH_TOKEN_KEY'
IMGPROXY_ENABLED=false
EOF

sudo service postgresql start
sudo -u postgres dropdb --if-exists sold_out && sudo -u postgres createdb sold_out
npm ci && npx prisma generate && npm run db:setup
npm run build && node dist/src/main.js
```

## DEUDA lat/lng (create)

Hidden `lat=13.6929` / `lng=-89.2182` — Nest a69f751 exige coordenadas. Sacar cuando Crop permita publish solo con dirección.

## Precio en cards (a69f751 lista)

`GET /events` **no** incluye `startingPrice` / `event_ticket_types` / `ticketTypes`.  
Regla Bea: **sin dato → sin etiqueta** (nunca «Gratis» inventado). «Ver evento →» sola, sin hueco.

Detalle sí trae `startingPrice` + `ticketTypes[].available` → «Desde …» / «Quedan N» / «Gratis» solo si min conocido = 0.

## Create — validación cliente

- `novalidate` + reglas declarativas (`src/lib/create-event-validate.ts`).
- Publicar siempre habilitado; al tocar marca **todos** los errores, scroll/foco al primero.
- Clear en blur/change cuando el campo queda válido.
- Descripción **opcional**.
- Publish con nombre vacío: **0** `POST /events` (ver evidencia abajo).

## Shots (`docs/qa/u20r_f50a726_nestA69f751_*.png`)

| Shot | Path | Evidencia |
| --- | --- | --- |
| Cards precio | `docs/qa/u20r_f50a726_nestA69f751_cards_precio_fila.png` | U20r Solo pago / gratis / mixta misma fila; **sin** etiqueta de precio (lista a69f751 sin datos); títulos `U20r` legibles |
| Títulos | `docs/qa/u20r_f50a726_nestA69f751_cards_titulos_numeros_emoji.png` | `DJ PARTY - 80s Night`, `Festival 2026`, `10K San Salvador`, `Open Mic 😀 ☺️ 👨‍👩‍👧` — dígitos normales, emoji a tamaño de texto |
| Detalle pago | `docs/qa/u20r_f50a726_nestA69f751_detail_desde_quedan.png` | Desde 20,00 US$; Quedan 20 / 40; Ilimitado sin cupo |
| Waitlist | `docs/qa/u20r_f50a726_nestA69f751_waitlist_soldout.png` | Seed agotado → waitlist |
| Coords maps | `docs/qa/u20r_f50a726_nestA69f751_detail_coords_abrir_maps.png` | Dirección + Abrir en Maps (sin Leaflet) |
| Fechas | `docs/qa/u20r_f50a726_nestA69f751_create_fechas_copy.png` | «Elegí fecha y hora de inicio» |
| Errores campos | `docs/qa/u20r_f50a726_nestA69f751_create_errores_campos.png` | Nombre/lugar/tipo/precio/cupo inline tras Publicar; **POST /events = 0** |
| novalidate | `docs/qa/u20r_f50a726_nestA69f751_create_novalidate.png` | Mismo patrón, sin globo nativo |
| Publicado OK | `docs/qa/u20r_f50a726_nestA69f751_create_publicado_ok.png` | Create UI → detalle visible |
| Org invitado | `docs/qa/u20r_f50a726_nestA69f751_organizador_invitado.png` | Copy producto + Iniciar sesión |

### Create sin red (nombre vacío / errores)

Al marcar errores de campo (nombre vacío u otros), el contador de requests Playwright `POST …/events` quedó en **0**. No se envía el publish inválido.

### Payloads POST (cards de precio) — coords fijas

- **U20r Solo pago** `e391bce0-6b5d-43c1-9b24-5c5cbaaa7e56` — VIP 20 / General 40 / Ilimitado null  
- **U20r Solo gratis** `901fe5a4-848e-4e0d-b371-9d2928573356` — price 0  
- **U20r Mixta** `f10dd9f8-5ac0-4f4b-8428-87c9edaa8759` — 0 + 25  

### GET detalle pago (excerpt)

```json
{
  "id": "e391bce0-6b5d-43c1-9b24-5c5cbaaa7e56",
  "name": "U20r Solo pago",
  "startingPrice": 20,
  "ticketTypes": [
    { "name": "VIP", "price": 20, "available": 20 },
    { "name": "General", "price": 40, "available": 40 },
    { "name": "Ilimitado", "price": 55, "available": null }
  ]
}
```

### Seed waitlist

`1555c682-a573-4fe7-af29-1ef0618fbcdb` — `available: 0`, `isSoldOut: true`.

### Tests

```bash
npm run test
# smoke + ticket-stock (null → no Gratis) + create-validate (UX copy)
```
