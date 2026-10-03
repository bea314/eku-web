# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `9d86bc7`  
**Tip docs:** `e7175b9`  
**Nest:** `a69f751` · `TZ=America/El_Salvador` · API VM `localhost:3000/api`  
**Astro preview:** `127.0.0.1:4321` · `devToolbar` off

## Fixes este HEAD

1. **Footer:** un solo espacio normal antes de «El Salvador» (sin NBSP ni padding). Sin «·» — «registro gratis» va en su propia línea (`em { display:block }`). Verificado 360 / 390 / desktop.
2. **formatPlace:** dedupe de jerarquía Nest (`Teatro…, San Salvador Centro, San Salvador` → `Teatro Nacional, Centro Histórico`). Misma función para perfil / cards / detalle / pase. Meta place con `line-clamp: 2`. Test unitario de dedupe en `test:user-facing-error`.
3. **Shot perfil:** `perfil_fui_proximos_pasados_390` encuadra stats Organizo/Fui + Próximos + Pasados con filas (Organizo list oculto solo en el clip).

## Seed perfil

`assigned_ticket` local (Pasados: `U20r Asistí pasado`; Próximos: El Cascanueces). Sin seed, solo Organizo. Ver notas previas.

## Tests

```bash
npm run test
# incluye formatPlace dedupe city hierarchy
```

## Shots (`docs/qa/u20r_9d86bc7_nestA69f751_*.png`)

Set completo (28). `u20r_3753147_*` borrado.
