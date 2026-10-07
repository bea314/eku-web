# Deploy ekü web on Vercel (Bea)

Personal Vercel plan. Production deploys on every push/merge to branch `uat`.

> Do **not** create the `uat` branch from this doc — Bea creates it when ready.
> Do **not** put secrets in this file.

## 1. Import the repo

1. Open [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. Import **`bea314/eku-web`** (GitHub).
3. Framework preset: **Astro** (auto-detected).

## 2. Production branch

- Set the project **Production Branch** to `uat`.
- Preview deployments can stay on other branches as needed.

## 3. Environment variables

| Name | Required | Notes |
|------|----------|--------|
| `PUBLIC_API_BASE_URL` | **Yes** (prod) | Nest public API base **including** `/api`, no trailing slash. Example shape: `https://api.example.com/api`. Never use `localhost` in production. |
| `PUBLIC_API_URL` | Optional alias | If set and `PUBLIC_API_BASE_URL` is empty, the app uses this (same shape, with `/api`). |

Leave secrets (JWT, DB, etc.) out of the web project — they belong on Nest only.

## 4. Build & output

| Setting | Value |
|---------|--------|
| **Install Command** | `npm ci` |
| **Build Command** | `astro build` (Vercel sets `VERCEL=1` → `@astrojs/vercel` adapter) |
| **Output** | Handled by `@astrojs/vercel` (`.vercel/output`). Do not set a custom Output Directory unless Vercel asks. |
| **Node** | `22` (see `.nvmrc`) |

## 5. After first deploy

1. Confirm the site loads (no blank page).
2. If the API URL is missing in prod, pages that call Nest fail clearly with a «Falta PUBLIC_API_BASE_URL…» style message — fix the env var and redeploy.
3. Point Nest CORS at the Vercel production (and preview) origins when the public API exists.

## Local vs Vercel

- Local: `astro dev` / `astro build` + `astro preview` use `@astrojs/node` (no `VERCEL` env).
- Vercel: build uses `@astrojs/vercel` automatically.
