<!-- Copied guidance for AI agents working on rahma-cell-frontend -->
# Copilot instructions — Rahma Cell (frontend)

This repo is a Vite + React + TypeScript single-page app with Tailwind and Zustand for local state. The goal of these notes is to make an AI coding assistant productive immediately by pointing to the project's architecture, conventions, and common workflows.

Core overview
- **Build & run:** `npm run dev` (vite dev server). `npm run build` runs `tsc -b` then `vite build`. Use `npm run preview` to preview a production build. See `package.json`.
- **Bundler/plugins:** `vite.config.ts` (uses `@vitejs/plugin-react` and `@tailwindcss/vite`).
- **State:** `zustand` with `persist` middleware. Key stores: `src/store/auth.store.ts`, `src/store/cart.store.ts`.
- **API layer:** `src/services/api.service.ts` exports `api` (axios) with an auth interceptor. `VITE_API_BASE_URL` is the env var to set the backend base URL.

Where to look first (high value files)
- `src/services/api.service.ts` — default axios instance, `API_BASE_URL`, and `attachAuthInterceptor`. Use this when implementing new API calls to get token injection.
- `src/services/auth.service.ts` — login/register flows and how the code normalizes the base url.
- `src/store/auth.store.ts` — token + role persisted under the `auth-store` key; `getPersistedToken()` reads this raw storage shape.
- `src/routes/Router.tsx` — shows route layout, `ProtectedRoute`/`PublicRoute` role checks and page naming conventions (`*.page.tsx`).
- `src/components/ui/` — shared UI components (buttons, headers, sidebar, popups). Follow their prop patterns when adding new UI components.
- `src/layouts/` — layout components for admin/customer/main.
- `src/utils/productImporter.ts` and `src/components/ui/ImportFile.tsx` — example of CSV/XLSX import using `xlsx`.

Conventions & patterns
- Pages: files named `*.page.tsx` and grouped under `pages/admin` and `pages/customer`.
- Services: one file per backend area under `src/services/` (e.g., `product.service.ts`, `order.service.ts`). Prefer reusing the exported `api` from `api.service.ts` so the auth interceptor supplies the JWT.
- Auth token storage: `zustand` persist stores `auth-store` in localStorage. Tokens may be nested under `.state.token` depending on how the store is serialized; helper `getPersistedToken()` normalizes that.
- Route protection: use `ProtectedRoute` with `allowedRoles={['customer']}` or `['admin']` as seen in `Router.tsx`.
- Naming: small UI components live in `src/components/ui`. Large logical components (pages/layouts) live in `src/pages` and `src/layouts`.

Integration points & external deps
- Backend API: default host `http://localhost:5000/api`. Set `VITE_API_BASE_URL` in your `.env` for dev (Vite uses `import.meta.env`). See `src/services/*`.
- File import: uses `xlsx` (`package.json`) — see `src/utils/productImporter.ts` and the `ImportFile` component.
- Payment/webhooks: backend integrates Midtrans; frontend may call payment endpoints — coordinate with backend routes `/api/payment/*`.

Development & debugging tips (project-specific)
- If tokens are not attached to requests, inspect `localStorage.auth-store` shape; `getPersistedToken()` expects either `state.token` or `token` at top level.
- Some services create their own axios instance (e.g., `auth.service.ts`). When adding new service files prefer importing `api` unless you intentionally need a separate base or config.
- Build requires type-checking step (`tsc -b`). Fix TypeScript errors in `src/` before `vite build` completes.
- To expose the backend for webhook testing use `ngrok` on port `5000` (backend README). Frontend dev server is separate (vite default port 5173). Configure `VITE_API_BASE_URL` accordingly.

What an AI assistant should do and avoid
- Do: Reuse `api` from `src/services/api.service.ts` for new HTTP calls; follow page and component naming; keep UI components small and prop-driven; update `src/routes/Router.tsx` when adding new top-level routes.
- Avoid: changing the persisted store key names or altering `auth-store` shape without migrating reads in `getPersistedToken()`.

Examples (quick copy/paste)
- Use API instance:
  - `import { api } from '../services/api.service'`
  - `const res = await api.get('/products')`
- Read token helper for tests/debugging:
  - `import { getPersistedToken } from '../services/api.service'`
  - `console.log(getPersistedToken())`

Notes for merging (if an existing file exists)
- Preserve any developer-written policy blocks. Keep this file focused, short, and anchored to files listed above. If local `.github/copilot-instructions.md` already contains per-developer notes, copy them into a `Local Notes` section instead of overwriting.

If anything here is unclear or you'd like more depth (example PR template for changes, unit-test patterns, or how to run end-to-end tests), tell me which area to expand.
