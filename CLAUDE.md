# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

```
serreche-chevalier-parapente/
├── apps/
│   ├── backoffice/     Admin dashboard + REST API (Next.js 15, React 19)
│   └── front/          Public website + e-commerce (Next.js 14, React 18)
├── packages/
│   ├── db/             Shared Prisma schema + client (@serreche/db)
│   └── types/          Shared TypeScript types (@serreche/types)
├── docs/               Full project documentation
└── docker-compose.yml  Local PostgreSQL database
```

See [docs/architecture.md](docs/architecture.md) for the full architecture overview.

## Commands

### Root (runs all apps via Turborepo)
```bash
pnpm dev            # Start all apps in parallel
pnpm build          # Build all apps
pnpm lint           # Lint all apps
pnpm test           # Run all tests
pnpm db:migrate     # Run Prisma migrations
pnpm db:studio      # Open Prisma Studio
```

### apps/backoffice
```bash
pnpm dev            # prisma generate + next dev (port 3001)
pnpm build          # prisma generate + next build
pnpm lint           # next lint
pnpm db:reset       # tsx prisma/reset-db-keep-essentials.ts
pnpm seed:admin     # Create first admin user (interactive)
pnpm seed:mock      # Inject mock data (stages, baptêmes, vouchers, promos)
pnpm test           # Run Vitest unit tests (39 schema tests)
pnpm test:watch     # Vitest in watch mode
pnpm test:coverage  # Vitest + coverage report
pnpm test:email     # tsx src/scripts/test-email.ts
```

### apps/front
```bash
pnpm dev            # next dev (port 3000)
pnpm build          # next build
pnpm lint           # next lint --fix
pnpm lint:check     # next lint (no auto-fix)
```

### Database (local dev)
```bash
docker compose up -d                    # Start local PostgreSQL
docker compose down                     # Stop
```

## Architecture

### Backoffice = Admin UI + Public API

The backoffice serves two audiences:
1. **Admin users** — dashboard for managing stages, baptêmes, clients, orders, pricing, SMS campaigns
2. **Public frontend** — REST API consumed by `apps/front` (cart, checkout, availability)

**Feature-based layout** — `src/features/<domain>/` owns its own slices:
- `server/` — Hono route handlers
- `api/` — TanStack React Query hooks
- `components/` — UI components
- `forms/` — React Hook Form components
- `schemas.ts` — Zod validation
- `keys.ts` — React Query key factories

Pages in `src/app/(post-auth)/dashboard/<domain>/` are thin shells importing from the feature.

**API framework:** Hono mounted at `src/app/api/[[...route]]/route.ts`. All public responses use `{ success, data?, error? }`.

**Auth:** better-auth (email/password). Server config at `src/lib/auth.ts`. Client at `src/lib/auth-client.ts` (uses `inferAdditionalFields` for typed `role`/`avatarUrl`). better-auth handler at `/api/auth/[...all]` takes priority over Hono's catch-all for all `/api/auth/*` paths.

**Auth middleware** (composed per route): `sessionMiddleware`, `adminSessionMiddleware`, `monitorSessionMiddleware`, `publicAPIMiddleware`, `sessionOrAPIMiddleware`. All use `auth.api.getSession({ headers })` — no manual cookie extraction.

**`getCurrent()` server action** — returns full Prisma `User` (not the better-auth session user) so all downstream components get proper Prisma types including `role: Role` enum.

**`useCurrent()` client hook** — uses `authClient.getSession()` with `inferAdditionalFields<typeof auth>()` for typed `role` field.

**Path alias:** `@/*` → `./src/*`

### Frontend = Public Site (anonymous)

No user authentication. All API calls use:
- `x-api-key` header → identifies the frontend as trusted
- `x-session-id` header → anonymous cart session UUID (localStorage, 24h TTL)

Cart state lives entirely in the backoffice DB. Frontend only stores the session UUID.

**Google tracking:** GTM (`GTM-T7N3XCH`) initialized in `app/layout.tsx` with Consent Mode v2. `purchase` event fires on `/checkout/success`. **Do not remove or modify GTM/consent code.**

**Sanity CMS:** Used for blog content only (`/blog`). Not used for product catalog.

## Key Business Logic

See [docs/shop.md](docs/shop.md) for full detail. Summary:

- **Stages** — deposit paid online, balance paid on-site
- **Baptêmes** — full price paid online
- **Gift vouchers** — product (not a discount code), format `GVSCP-XXXXXXXX-XXXX`, covers one specific activity, 1-year validity, single use
- **Promo codes** — fully integrated (backend + checkout input field with `/api/promocodes/validate`)
- **Cart** — session-based, stage/baptême items hold a seat for 1 hour via `TemporaryReservation`
- **Order finalization** — triggered by Stripe webhook `payment_intent.succeeded`; idempotent via `ProcessedWebhookEvent`

## Environment

See [docs/environment.md](docs/environment.md) for all variables.

- Local dev: Docker PostgreSQL (`docker compose up -d`), Stripe test keys
- Production: Supabase PostgreSQL, Stripe live keys (Vercel `Production` env only)
- Always use `.env.local` (never committed). Copy from `.env.example`.

## API Reference

See [docs/api.md](docs/api.md) for all endpoints.

## First admin user setup

After running migrations (`pnpm db:migrate`), create the first admin account:

```bash
cd apps/backoffice
pnpm seed:admin
```

This prompts for name, email, and password, creates the account via better-auth, then promotes it to ADMIN role in Prisma.

## Known Issues / In Progress

- Promo code: integrated in checkout (Phase 6). Backend + frontend wired.
- RGPD checkboxes: added to checkout (Phase 6). `acceptedMarketing` not yet persisted to DB (pending schema update).
- `/utiliser-bon-cadeau` page: wizard created (Phase 6). Tested with mock data codes (see `docs/test-guide.md`).
- Unit tests (Vitest): set up with 39 schema tests (Phase 9). Run with `pnpm test` from `apps/backoffice`.
- API docs: `docs/api-docs.html` — open in browser for full route reference.
- `apps/front` checkout page is ~1800 lines — split into sub-components is a future task.
- Typed Hono RPC client in `apps/front` — all calls still use raw `fetch`; could be wired to Hono client types.
