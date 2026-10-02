# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `a7bbc647a79ff678c943ec7ea5fcce7bfd5d26f7` (`a7bbc64`)  
**Nest SHA (tarball Crop):** `a69f751f2189d9e8d06844fe3db9d9ad1fa77787` (`a69f751`)  
**Base URL:** `http://localhost:3000/api`  
**Astro:** `PUBLIC_API_BASE_URL=http://localhost:3000/api` → `astro preview` `http://127.0.0.1:4321` (`devToolbar` off)  
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

## Create — fechas propias + validación

- Por Inicio/Fin: dos inputs `dd/mm/aaaa` + `hh:mm` (`inputmode="numeric"`, máscara tipéa/pega).
- Fin **obligatorio** en este HEAD (`endDateRequired: true`; misma regla sirve para opcional después).
- Errores exactos: «Esa fecha no existe», «Esa hora no es válida», «El fin tiene que ser después del inicio»; vacíos → «Elegí fecha y hora de inicio/fin».
- `novalidate` + reglas declarativas; Publicar siempre habilitado; clear blur/change.
- Descripción **opcional**. Spanglish: Entradas / Portada / Correo.
- Publish con nombre vacío: **0** `POST /events`.

## Shots (`docs/qa/u20r_a7bbc64_nestA69f751_*.png`)

Backend en **cada** shot (igual en todas las filas): Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); base URL `http://localhost:3000/api` (Astro preview `http://127.0.0.1:4321` con `PUBLIC_API_BASE_URL=http://localhost:3000/api`).

| Shot | Path | Evidencia | Backend |
| --- | --- | --- | --- |
| Cards precio | `docs/qa/u20r_a7bbc64_nestA69f751_cards_precio_fila.png` | U20r Solo pago / gratis / mixta; **sin** etiqueta de precio (lista a69f751 sin datos) | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Títulos | `docs/qa/u20r_a7bbc64_nestA69f751_cards_titulos_numeros_emoji.png` | `DJ PARTY - 80s Night`, `Festival 2026`, `10K San Salvador`, Open Mic emoji — dígitos normales | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Detalle pago | `docs/qa/u20r_a7bbc64_nestA69f751_detail_desde_quedan.png` | Desde 20,00 US$; Quedan 20 / 40; Ilimitado | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Detalle Entradas | `docs/qa/u20r_a7bbc64_nestA69f751_detail_entradas.png` | Título sección «Entradas» (no Spanglish) | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Waitlist | `docs/qa/u20r_a7bbc64_nestA69f751_waitlist_soldout.png` | Seed agotado → waitlist. Descripción «Fixture sold out…» = texto seed a69f751 (Crop limpia en `c7d9c7b`) | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Coords maps | `docs/qa/u20r_a7bbc64_nestA69f751_detail_coords_abrir_maps.png` | Dirección + Abrir en Maps (sin Leaflet) | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Fechas vacío | `docs/qa/u20r_a7bbc64_nestA69f751_create_fechas_copy.png` | «Elegí fecha y hora de inicio/fin» | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Fechas mobile 390 | `docs/qa/u20r_a7bbc64_nestA69f751_create_fechas_mobile_390.png` | `31/02` → «Esa fecha no existe»; `25:00` → «Esa hora no es válida»; Fin alineado | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Fechas desktop OK | `docs/qa/u20r_a7bbc64_nestA69f751_create_fechas_desktop_ok.png` | `01/12/2026` + `20:00` / `23:00` llenos (dd/mm/aaaa + 24 h) | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Errores campos | `docs/qa/u20r_a7bbc64_nestA69f751_create_errores_campos.png` | Nombre/lugar/tipo/precio/cupo inline; **POST /events = 0** | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| novalidate | `docs/qa/u20r_a7bbc64_nestA69f751_create_novalidate.png` | Sin globo nativo | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Publicado OK | `docs/qa/u20r_a7bbc64_nestA69f751_create_publicado_ok.png` | Create → detalle visible | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |
| Org invitado | `docs/qa/u20r_a7bbc64_nestA69f751_organizador_invitado.png` | Copy + Iniciar sesión | Nest a69f751 desde tarball, instancia propia del agente en su VM, seed propio (`db:setup`); `http://localhost:3000/api` |

**No en este HEAD:** shot «Fin vacío publicando» (Fin sigue obligatorio hasta el HEAD siguiente).

### Create sin red (nombre vacío / errores)

Contador Playwright `POST …/events` = **0** al marcar errores de campo.

### Payloads POST (cards de precio) — coords fijas

- **U20r Solo pago** `e391bce0-6b5d-43c1-9b24-5c5cbaaa7e56` — VIP 20 / General 40 / Ilimitado null  
- **U20r Solo gratis** `901fe5a4-848e-4e0d-b371-9d2928573356` — price 0  
- **U20r Mixta** `f10dd9f8-5ac0-4f4b-8428-87c9edaa8759` — 0 + 25  

### Seed waitlist

`1555c682-a573-4fe7-af29-1ef0618fbcdb` — `available: 0`, `isSoldOut: true`.  
**Conocido de backend:** descripción seed «Fixture sold out para POST /events/:id/waitlist». Crop lo arregla en `c7d9c7b`.

### Tests

```bash
npm run test
# smoke + ticket-stock + create-validate + sv-datetime
# (31/02, 29/02/2027 vs 2028, 25:00, 12:60, 23:59, 00:00, paste, fin==inicio)
```
