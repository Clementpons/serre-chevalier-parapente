# Environment Variables

Each app has its own `.env.example` with placeholder values. Copy it to `.env.local` (never committed) and fill in real values.

## apps/backoffice

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (pooled, for runtime). Use Supabase in prod, `postgresql://postgres:postgres@localhost:5432/serreche_dev` in dev. |
| `DIRECT_URL` | ✅ | PostgreSQL direct connection (for Prisma migrations). |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL of this backoffice app. Used for CORS and auth redirects. |
| `PUBLIC_API_KEY` | ✅ | Secret key required in `x-api-key` header by the public frontend. Choose a strong random string. |
| `BETTER_AUTH_URL` | ✅ | Same as `NEXT_PUBLIC_APP_URL`. Used by better-auth internally. |
| `BETTER_AUTH_SECRET` | ✅ | Random secret for signing sessions. Min 32 characters. |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key. `sk_test_...` in dev, `sk_live_...` in prod only. |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret (`whsec_...`). Get it from Stripe CLI in dev or from Stripe dashboard in prod. |
| `RESEND_API_KEY` | ✅ | Resend API key for transactional emails. |
| `RESEND_FROM_EMAIL` | ✅ | Sender email address (must be verified in Resend). |
| `ADMIN_EMAIL` | ✅ | Email address that receives new order notifications. |
| `BREVO_API_KEY` | ⚡ SMS only | Clé API Brevo (`xkeysib-...`). Disponible dans Brevo > Paramètres > API. |
| `BREVO_SENDER_NAME` | ⚡ SMS only | Nom d'expéditeur alphanumérique (max 11 caractères, ex: `SCPARAPENTE`). |
| `SMS_SIMULATION` | — | Set `"true"` in dev to log SMS instead of sending. Default: `"false"`. |

## apps/front

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKOFFICE_URL` | ✅ | URL of the backoffice API. `http://localhost:3001` in dev. |
| `NEXT_PUBLIC_API_KEY` | ✅ | Must match `PUBLIC_API_KEY` in the backoffice. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key. `pk_test_...` in dev, `pk_live_...` in prod only. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ | Sanity project ID (find it in sanity.io/manage). |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ | Sanity dataset name (`production` or `dev`). |
| `NEXT_PUBLIC_SANITY_API_VERSION` | — | Sanity API version date. Defaults to `2024-10-01`. |
| `SANITY_API_READ_TOKEN` | — | Sanity read token. Only needed for draft preview mode. |

## Vercel environment configuration

In Vercel, set environment variables per environment:

| Variable | Development | Preview | Production |
|----------|------------|---------|-----------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_test_...` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_test_...` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | (Stripe CLI) | `whsec_...` | `whsec_...` |
| `DATABASE_URL` | (Docker) | (Supabase dev DB) | (Supabase prod DB) |
| `SMS_SIMULATION` | `true` | `true` | `false` |

**Never put live Stripe keys in local `.env.local`.** Use test keys locally. Vercel's `Production` environment is the only place live keys should exist.
