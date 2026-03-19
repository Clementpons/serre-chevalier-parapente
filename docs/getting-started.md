# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+ (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the local database)

## 1. Clone and install

```bash
git clone <repo-url>
cd serreche-chevalier-parapente
pnpm install
```

## 2. Start the local database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance on `localhost:5432` with:
- Database: `serreche_dev`
- User: `postgres`
- Password: `postgres`

## 3. Configure environment variables

Copy the example files and fill in the values:

```bash
cp apps/backoffice/.env.example apps/backoffice/.env.local
cp apps/front/.env.example apps/front/.env.local
```

For local dev, the database vars in `apps/backoffice/.env.local` should be:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/serreche_dev"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/serreche_dev"
```

Use Stripe **test** keys (`sk_test_...` / `pk_test_...`), never live keys in local dev.

## 4. Run database migrations

```bash
pnpm db:migrate
```

Or from the backoffice app directly:
```bash
cd apps/backoffice
pnpm prisma migrate dev
```

## 5. Start the development servers

```bash
pnpm dev
```

This starts both apps concurrently via Turborepo:
- **Backoffice** (admin + API): http://localhost:3001
- **Front** (public site): http://localhost:3000

The front calls the backoffice API at `NEXT_PUBLIC_BACKOFFICE_URL=http://localhost:3001`.

## Running a single app

```bash
# Only the backoffice
cd apps/backoffice && pnpm dev

# Only the frontend
cd apps/front && pnpm dev
```

## Useful commands

```bash
pnpm build          # Build all apps
pnpm lint           # Lint all apps
pnpm test           # Run all tests
pnpm db:studio      # Open Prisma Studio (DB GUI)
pnpm db:migrate     # Run pending migrations (dev)
pnpm db:push        # Push schema without migration file (prototyping only)
```

## 6. Create the first admin user

After the database is migrated, run the admin seed script to create your first account:

```bash
cd apps/backoffice
npx tsx prisma/seed-admin.ts
```

This will prompt you for a name, email, and password, then create the account and grant ADMIN role automatically. You can then log in at http://localhost:3001.

> To promote an existing user to ADMIN later, use Prisma Studio (`pnpm db:studio`) and update the `role` field in the `user` table.

## Stripe webhooks in local dev

To test Stripe webhooks locally, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to http://localhost:3001/api/webhooks/stripe
```

Copy the webhook signing secret (`whsec_...`) into `apps/backoffice/.env.local` as `STRIPE_WEBHOOK_SECRET`.

## SMS in development

Set `TWILIO_SIMULATION="true"` in `apps/backoffice/.env.local` to prevent real SMS being sent during development. Logs will be written to the console instead.
