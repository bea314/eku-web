# U20r backend evidence (Nest REAL)

**HEAD (eku-web tip):** `2a26db9b9f002bae7514a7538099698f63ac87b1`  
**Code fix commit:** `ba6dd23c31afc97b554c6559782c77e518133f3b`  
**Target Nest:** `bea314/so-microservicio` @ `a69f751` (PR #3)

## BLOCKED — Nest REAL no accesible en esta VM

Intentos:

```text
$ git clone https://github.com/bea314/so-microservicio.git
remote: Repository not found.
fatal: repository 'https://github.com/bea314/so-microservicio.git/' not found

$ gh api repos/bea314/so-microservicio/pulls/3
{"message":"Not Found","status":"404"}

$ gh repo list bea314
# so-microservicio NO aparece (solo repos públicos del owner; el Nest es privado
# y el token del agent cursor no tiene acceso)
```

**No se fabricaron shots de cupo/precio/waitlist/create contra Nest.**  
Cuando haya acceso al repo privado + Postgres, checkout `a69f751`, migraciones + seed, y regenerar:

| Shot propuesto | Qué demuestra |
| --- | --- |
| `docs/qa/u20r_<head7>_nestA69f751_cards_precio_fila.png` | Card paga + gratis (min 0) + mixta en la misma fila |
| `docs/qa/u20r_<head7>_nestA69f751_detail_desde_quedan.png` | Detalle pago: encabezado «Desde X,XX US$» (sin $0) + Quedan N |
| `docs/qa/u20r_<head7>_nestA69f751_waitlist_soldout.png` | Seed agotado → waitlist (no Reservar gratis) |
| `docs/qa/u20r_<head7>_nestA69f751_detail_coords_abrir_maps.png` | Con coords: dirección + Abrir en Maps (sin Leaflet/tiles) |
| `docs/qa/u20r_<head7>_nestA69f751_create_fechas_copy.png` | Error fechas en español inline |
| `docs/qa/u20r_<head7>_nestA69f751_create_publicado_ok.png` | Create publica OK (con lat/lng fijos) |
| `docs/qa/u20r_<head7>_nestA69f751_organizador_invitado.png` | Copy producto + Iniciar sesión |
| `docs/qa/u20r_<head7>_nestA69f751_create_novalidate.png` | novalidate, sin globo nativo EN |

## DEUDA — lat/lng fijos en create

Nest `a69f751` responde **400** «debes seleccionar una ubicación con coordenadas» si el POST no manda lat/lng.

Por decisión de Jefe (corrección): este HEAD **mantiene** los hidden:

- `lat=13.6929`
- `lng=-89.2182`

**Sacar** cuando Crop publique el SHA que permita publicar solo con dirección.  
No inventar coords en UI; son defaults ocultos de deuda.

## Código alineado a contrato a69f751 (sin shots reales)

- Cupo: `ticketTypes[].available` (number \| null). `stockOf()` lee `available` primero; `quantity` solo fallback.
- Agotado: `available !== null && available <= 0` (o `isSoldOut` si viene).
- Precio lista: min de `event_ticket_types[]` / `ticketTypes[]` / `startingPrice` → «Gratis» solo si min=0; si no «Desde X,XX US$».
- Mapa: `ENABLE_LEAFLET_MAP=false` → siempre dirección + Abrir en Maps (con o sin coords).

## Cómo desbloquear shots

1. Dar acceso al agent al repo privado `bea314/so-microservicio` (o mirror).
2. `git checkout a69f751`
3. Postgres + migraciones + seed (runbook Nest).
4. `PUBLIC_API_BASE_URL=http://localhost:3000/api`
5. Crear vía API real (si el seed no tiene) los 3 casos de precio + 1 agotado; anotar payloads aquí.
6. Regenerar shots con el naming `u20r_<head7>_nestA69f751_<qué>.png`.
