# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `e3ede1b18ce7c2b8edef7ddca9bbc40ec2a011ed` (`e3ede1b`)  
**Nest SHA (tarball Crop):** `a69f751f2189d9e8d06844fe3db9d9ad1fa77787` (`a69f751`)  
**Base URL (agente):** `http://localhost:3000/api` — **solo dentro de la VM del agente** (no es el `:3000` de QA en la box).  
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

## Precio en cards + preview create

`GET /events` **no** incluye `startingPrice` / ticket types → cards **sin** etiqueta (nunca «Gratis» inventado).

Preview create: misma regla (`createPreviewPriceLabel`) — ignora vacíos / negativos / no numéricos; «Gratis» solo si min válido = 0; VIP 15 + precio -1 → «Desde 15,00 US$».

## Create — fechas + validación

- Inicio/Fin: `dd/mm/aaaa` + `hh:mm` (`inputmode="numeric"`, máscara).
- Fin **obligatorio** (`endDateRequired: true`).
- Errores: «Esa fecha no existe», «Esa hora no es válida», «El fin tiene que ser después del inicio».
- `scroll-margin-top: calc(var(--header-h) + 16px)` + scroll con offset de nav sticky al primer error.
- Lugar placeholder: «Ej.: Café Central, San Salvador» (gris, no valor).
- Spanglish: Entradas / Portada / Correo.

## Shots (`docs/qa/u20r_e3ede1b_nestA69f751_*.png`)

Backend en **cada** shot: Nest a69f751 desde tarball, **instancia propia del agente en su VM** (`localhost:3000` = VM del agente, no QA box), seed propio (`db:setup`); Astro preview `http://127.0.0.1:4321` con `PUBLIC_API_BASE_URL=http://localhost:3000/api`.

| Shot | Path | Evidencia | Backend |
| --- | --- | --- | --- |
| Cards precio | `docs/qa/u20r_e3ede1b_nestA69f751_cards_precio_fila.png` | U20r Solo pago / gratis / mixta; sin etiqueta de precio | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Títulos | `docs/qa/u20r_e3ede1b_nestA69f751_cards_titulos_numeros_emoji.png` | 80s / 2026 / 10K / emoji — dígitos normales | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Detalle pago | `docs/qa/u20r_e3ede1b_nestA69f751_detail_desde_quedan.png` | Desde 20,00 US$; Quedan 20 / 40 | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Detalle Entradas | `docs/qa/u20r_e3ede1b_nestA69f751_detail_entradas.png` | Sección «Entradas» | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Waitlist | `docs/qa/u20r_e3ede1b_nestA69f751_waitlist_soldout.png` | Seed agotado → waitlist. «Fixture sold out…» = texto seed a69f751 | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Coords maps | `docs/qa/u20r_e3ede1b_nestA69f751_detail_coords_abrir_maps.png` | Dirección + Abrir en Maps | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Fechas vacío | `docs/qa/u20r_e3ede1b_nestA69f751_create_fechas_copy.png` | Elegí fecha y hora de inicio/fin | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Fechas mobile 390 | `docs/qa/u20r_e3ede1b_nestA69f751_create_fechas_mobile_390.png` | 31/02 + 25:00; ambos con borde rojo; sin foco | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Fechas desktop OK | `docs/qa/u20r_e3ede1b_nestA69f751_create_fechas_desktop_ok.png` | dd/mm/aaaa + 24h llenos | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Errores (Nombre) | `docs/qa/u20r_e3ede1b_nestA69f751_create_errores_campos.png` | Viewport 1280×900; Nombre + error bajo nav; preview «Desde 15,00 US$»; **POST=0** | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Errores (scroll) | `docs/qa/u20r_e3ede1b_nestA69f751_create_errores_campos_scroll.png` | Lugar placeholder Ej.; tipo vacío; precio -1; cupo 0 | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| novalidate | `docs/qa/u20r_e3ede1b_nestA69f751_create_novalidate.png` | Sin globo nativo | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Publicado OK | `docs/qa/u20r_e3ede1b_nestA69f751_create_publicado_ok.png` | Create → detalle | Nest a69f751 en VM del agente (`localhost:3000/api`) |
| Org invitado | `docs/qa/u20r_e3ede1b_nestA69f751_organizador_invitado.png` | Iniciar sesión | Nest a69f751 en VM del agente (`localhost:3000/api`) |

**No en este HEAD:** shot «Fin vacío publicando».

### Tests

```bash
npm run test
# + createPreviewPriceLabel: -1+15 → Desde 15; solo inválidos → null; 0 → Gratis
```
