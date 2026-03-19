# Architecture

## Overview

Serre Chevalier Parapente is a **Turborepo monorepo** containing two Next.js applications and two shared packages.

```
serreche-chevalier-parapente/
├── apps/
│   ├── backoffice/     Admin dashboard + REST API (Next.js 15, React 19)
│   └── front/          Public website + e-commerce (Next.js 14, React 18)
├── packages/
│   ├── db/             Shared Prisma schema + client
│   └── types/          Shared TypeScript types (Cart, Order, etc.)
└── docs/               This documentation
```

## apps/backoffice

The backoffice serves **two distinct audiences**:

1. **Admin users** — full CRUD dashboard for managing stages, baptêmes, orders, clients, pricing, SMS campaigns.
2. **Public frontend** — a REST API consumed by `apps/front` for cart, checkout, availability, and content.

### Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 15 (App Router) |
| API | Hono (mounted at `/api/[[...route]]`) |
| Database | PostgreSQL via Prisma 6 |
| Auth | better-auth (migrated from Supabase auth) |
| Payments | Stripe |
| Email | Resend |
| SMS | Twilio |
| State (client) | Jotai + TanStack React Query |
| Validation | Zod |
| UI | shadcn/ui + Radix UI + Tailwind CSS |

### Feature-based structure

Source code lives in `src/features/<domain>/` — each domain owns its own slices:

```
src/features/<domain>/
├── server/         Hono route handlers (server-side only)
├── api/            TanStack React Query hooks (client-side)
├── components/     UI components for the dashboard
├── forms/          React Hook Form form components
├── schemas.ts      Zod validation schemas
└── keys.ts         React Query key factories
```

Pages in `src/app/(post-auth)/dashboard/<domain>/` are thin shells that import from `src/features/<domain>/`.

### API authentication

Three middleware strategies, composed per route:

- `sessionMiddleware` — validates the better-auth session cookie (httpOnly, 30-day expiry)
- `adminSessionMiddleware` — session + role must be ADMIN
- `monitorSessionMiddleware` — session + role must be ADMIN or MONITEUR
- `publicAPIMiddleware` — validates `x-api-key` header (used by `apps/front`)
- `sessionOrAPIMiddleware` — accepts either strategy

### Path alias

`@/*` → `./src/*`

## apps/front

The public website: informational pages, booking flows, blog, and checkout.

### Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| CMS | Sanity v3 (blog only) |
| Payments | Stripe Elements |
| Validation | Zod + React Hook Form |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Analytics | Google Tag Manager (GTM-T7N3XCH) |

### API communication

The front calls the backoffice API via native `fetch()` with two headers:
- `x-api-key: <PUBLIC_API_KEY>` — identifies the frontend as a trusted caller
- `x-session-id: <uuid>` — anonymous cart session (stored in localStorage, 24h TTL)

There is **no user authentication** on the public site. All booking flows are anonymous.

### Cart session

Cart state lives entirely in the backoffice database. The frontend only stores the session UUID in `localStorage` under `cart-session-id`. This means:
- Cart survives page refreshes and browser restarts
- Cart does NOT survive clearing localStorage
- Cart expires server-side after 24h inactivity

### Google tracking

GTM is initialized in `app/layout.tsx` with Consent Mode v2 enabled by default (all storage denied). The cookie consent banner grants permissions on user acceptance. A `purchase` event fires on the `/checkout/success` page with full order data, deduplicated via localStorage.

### Route groups

```
app/(public)/
├── (legal)/            Legal pages (CGU, CGV, cookies, privacy)
├── bi-places/          Baptême informational page
├── blog/               Blog (powered by Sanity)
├── checkout/           Cart → Payment → Success flow
│   ├── payment/
│   └── success/
├── nos-stages/         Stage pages (autonomie, initiation, progression)
└── reserver/           Booking flows
    ├── bapteme/
    ├── bon-cadeau/      Gift voucher purchase
    ├── carte-cadeau/    Gift card (admin-issued monetary cards)
    └── stage/
```

## packages/db

Shared Prisma schema and client. Both apps reference this package instead of having separate Prisma setups.

Database: **PostgreSQL** (Supabase in production, Docker locally).

See [shop.md](./shop.md) for the full data model overview.

## packages/types

TypeScript types shared between the front and backoffice — primarily the API response shapes, cart types, and order types. Allows the frontend to be type-safe without importing `@prisma/client`.

## Data flow: booking a stage

```
User → /reserver/stage
  → GET /api/stages/getAll          (loads available stages)
  → GET /api/availability/periods   (loads available months)
  → POST /api/cart/add              (creates CartItem, TemporaryReservation — 1h hold)
  → User fills participant details
  → GET /api/cart/items             (review cart)
  → POST /api/orders/create         (creates Order + Stripe PaymentIntent)
  → Stripe Elements (client-side payment)
  → POST /api/webhooks/stripe       (payment_intent.succeeded)
    → Creates StageBooking + Stagiaire
    → Sends confirmation email
    → Clears cart
  → Redirect to /checkout/success
```
