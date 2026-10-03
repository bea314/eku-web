# U20r — evidencia Nest REAL a69f751

**HEAD de código (app):** `27b2a3c`  
**Tip docs:** `6e14c43`  
**Nest:** `a69f751` · `TZ=America/El_Salvador` · API VM `localhost:3000/api`  
**Astro preview:** `127.0.0.1:4321` · `devToolbar` off

## Causa regresión miniaturas ü (set 9d86bc7)

**No fue URL/clave de portada ni onerror mal registrado.**  
`coverUrlOf` ya lee `coverImageUrl` / `image_url` (Nest feed perfil OK). El handler solo actúa en `error`.

La causa fue el **script de shots**: antes del full-page forzaba `src=https://example.invalid/...` en **todas** las thumbs de Organizo/Próximos/Pasados → el fallback ü se aplicaba a propósito en el artefacto. Live `/perfil` nunca perdió las portadas.

## Fixes este HEAD

1. Shot: solo **una** thumb intencional rota para demo ü; `waitCoverImages` (scroll + `decode`/`complete`) antes de capturar.
2. `applyCoverFallback`: no reemplaza si `complete && naturalWidth > 0`.
3. Perfil/pase thumbs: `loading="eager"`.
4. Test `test:cover-fallback`: coverUrl válida → no fallback; rota → ü.

## Tests

```bash
npm run test
# + test:cover-fallback
```

## Shots (`docs/qa/u20r_27b2a3c_nestA69f751_*.png`)

Set completo (28). `u20r_9d86bc7_*` borrado.
