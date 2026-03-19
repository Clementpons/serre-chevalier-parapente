<div align="center">

# 🪂 Serre Chevalier Parapente

**Plateforme e-commerce & backoffice pour une école de parapente dans les Alpes françaises**

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 📋 Vue d'ensemble

Ce monorepo contient l'intégralité de la plateforme numérique de **Serre Chevalier Parapente** — une école de parapente proposant stages de formation, baptêmes bi-places et bons cadeaux dans les Alpes.

Le projet se compose de **deux applications** déployées séparément :

| App | Description | Port local |
|-----|-------------|-----------|
| `apps/backoffice` | Dashboard admin + API REST publique | `:3001` |
| `apps/front` | Site public + tunnel de réservation/paiement | `:3000` |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    apps/front                        │
│           Site public (Next.js 14, React 18)         │
│   Réservations · Paiements Stripe · Bons cadeaux     │
└──────────────────────┬──────────────────────────────┘
                       │  REST API (x-api-key + x-session-id)
                       ▼
┌─────────────────────────────────────────────────────┐
│                  apps/backoffice                     │
│       Admin dashboard + API (Next.js 15, Hono)       │
│   Planning · Réservations · Paiements · Campagnes    │
└──────────────────────┬──────────────────────────────┘
                       │  Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL (Supabase prod)              │
│  Stages · Baptêmes · Orders · Vouchers · Campagnes  │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités

### 🛒 E-commerce (apps/front)

- **Réservation de stages** — Initiation, Progression, Autonomie, Double
  - Panier avec réservation temporaire de place (1h)
  - Paiement en 2 temps : acompte en ligne + solde sur place
- **Réservation de baptêmes bi-places** — 5 catégories (Aventure, Durée, Longue durée, Enfant, Hiver)
  - Option vidéo (+25€)
- **Bons cadeaux** — Produit dédié (pas un code promo), validité 1 an, usage unique
  - Code format : `GVSCP-XXXXXXXX-XXXX`
  - Email automatique au bénéficiaire via Resend
- **Codes promo** — Réduction fixe (€) ou pourcentage (%), règles configurables
- **Panier anonyme** — Session UUID (localStorage, 24h), pas de compte requis
- **Checkout Stripe** — Stripe Elements avec Consent Mode v2 (RGPD)
- **Page de succès** — Récapitulatif complet + événement `purchase` Google Analytics

### 🎛️ Backoffice (apps/backoffice)

- **Dashboard** — KPIs temps réel, chiffre d'affaires mensuel (graphique 13 mois), planning du jour
- **Planning des stages** — Vue calendrier mensuelle, création/édition/suppression, gestion des moniteurs
- **Planning des baptêmes** — Grille horaire journalière, multi-catégories, gestion des moniteurs
- **Réservations** — Vue consolidée avec filtres (type, statut, date, catégorie), onglets "Aujourd'hui" / "Mensuel"
- **Commandes** — Suivi complet du cycle de vie (PENDING → FULLY_PAID), enregistrement du solde sur place
- **Paiements** — Historique complet, allocations par item, paiements manuels (CB/virement/espèces/chèque)
- **Bons cadeaux** — Création manuelle, suivi (actifs / utilisés / expirés), masquage du code
- **Codes promo** — CRUD complet, statistiques d'utilisation, désactivation
- **Clients & Stagiaires** — Annuaire avec export, données RGPD
- **Tarifs** — Configuration centralisée des prix (par catégorie de baptême, option vidéo, acomptes, stages)
- **Campagnes SMS** — Segmentation dynamique d'audience, génération de codes promo uniques par destinataire, logs de livraison Twilio
- **Contenu** — Topbar configurable du site public
- **Mon compte** — Changement de mot de passe, réinitialisation par email

---

## 🔧 Stack technique

### Backend / API

| Outil | Usage |
|-------|-------|
| **Next.js 15** + App Router | Framework fullstack backoffice |
| **Hono 4.6** | API REST montée sur `/api/[[...route]]` |
| **Prisma 6** | ORM type-safe, migrations PostgreSQL |
| **better-auth 1.5.5** | Auth email/password, sessions, réinitialisation par email |
| **Stripe 18** | Paiements en ligne + webhook `payment_intent.succeeded` |
| **Resend 6** | Emails transactionnels (confirmation, bon cadeau, reset password) |
| **Twilio 5** | Campagnes SMS marketing |

### Frontend

| Outil | Usage |
|-------|-------|
| **Next.js 14** + App Router | Framework public |
| **TanStack React Query 5** | Cache serveur côté backoffice |
| **React Hook Form 7** + Zod | Formulaires typés et validés |
| **Radix UI** + shadcn/ui | Composants accessibles |
| **Tailwind CSS 3** | Styles utilitaires |
| **Sanity v3** | CMS blog uniquement |
| **Google Tag Manager** | Analytics avec Consent Mode v2 |

### Infrastructure

| Outil | Usage |
|-------|-------|
| **pnpm 9** + **Turborepo 2** | Monorepo, builds parallèles |
| **PostgreSQL** | Base de données (Docker en dev, Supabase en prod) |
| **Vercel** | Déploiement des deux apps |

---

## 📁 Structure du monorepo

```
serreche-chevalier-parapente/
├── apps/
│   ├── backoffice/                 # Admin + API
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Schéma de base de données
│   │   │   ├── seed-admin.ts       # Création du premier admin
│   │   │   ├── seed-mock.ts        # Données de démo
│   │   │   └── migrate-from-old.ts # Migration ancienne BDD → nouvelle
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/         # Pages de connexion
│   │       │   ├── (post-auth)/    # Dashboard (protégé)
│   │       │   └── api/            # Routes API (Hono + webhooks Stripe)
│   │       ├── features/           # Domaines métier (feature-based)
│   │       │   ├── auth/
│   │       │   ├── stages/
│   │       │   ├── biplaces/
│   │       │   ├── orders/
│   │       │   ├── payments/
│   │       │   ├── giftvouchers/
│   │       │   ├── promocodes/
│   │       │   ├── campaigns/
│   │       │   └── ...
│   │       ├── emails/             # Templates React Email
│   │       └── lib/                # Prisma, auth, Resend, Stripe, Twilio
│   └── front/                      # Site public
│       └── app/
│           ├── (public)/
│           │   ├── reserver/       # Tunnels de réservation
│           │   ├── checkout/       # Panier + paiement
│           │   └── blog/           # Articles Sanity
│           └── (legal)/            # CGU, CGV, RGPD
├── packages/
│   ├── db/                         # @serreche/db — client Prisma partagé
│   └── types/                      # @serreche/types — types TypeScript partagés
├── docs/                           # Documentation technique complète
└── docker-compose.yml              # PostgreSQL local
```

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** ≥ 20
- **pnpm** ≥ 9.15
- **Docker** (pour la base de données locale)

### Installation

```bash
# Cloner le dépôt
git clone <repo-url>
cd serreche-chevalier-parapente

# Installer les dépendances
pnpm install
```

### Configuration

```bash
# Copier les fichiers d'environnement
cp apps/backoffice/.env.example apps/backoffice/.env.local
cp apps/front/.env.example apps/front/.env.local
```

Remplir les variables (voir [docs/environment.md](docs/environment.md)) :

**apps/backoffice/.env.local** (variables clés) :
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/serreche_dev"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/serreche_dev"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
BETTER_AUTH_URL="http://localhost:3001"
BETTER_AUTH_SECRET="<32 caractères aléatoires>"
PUBLIC_API_KEY="<clé secrète partagée avec le front>"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Serre Chevalier Parapente <noreply@...>"
ADMIN_EMAIL="admin@example.com"
```

**apps/front/.env.local** :
```env
NEXT_PUBLIC_BACKOFFICE_URL="http://localhost:3001"
NEXT_PUBLIC_API_KEY="<même valeur que PUBLIC_API_KEY>"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_SANITY_PROJECT_ID="..."
NEXT_PUBLIC_SANITY_DATASET="production"
```

### Base de données

```bash
# Démarrer PostgreSQL
docker compose up -d

# Appliquer les migrations
pnpm db:migrate

# Créer le premier admin
cd apps/backoffice && pnpm seed:admin

# (Optionnel) Injecter des données de démo
pnpm seed:mock
```

### Lancer le projet

```bash
# Démarrer les deux apps en parallèle
pnpm dev
# → backoffice sur http://localhost:3001
# → front sur http://localhost:3000
```

### Stripe (webhook local)

```bash
# Dans un terminal séparé
stripe listen --forward-to http://localhost:3001/api/webhooks/stripe
# Copier le whsec_... dans STRIPE_WEBHOOK_SECRET
```

---

## 📦 Commandes disponibles

### Racine (Turborepo)

```bash
pnpm dev          # Démarrer toutes les apps
pnpm build        # Builder toutes les apps
pnpm lint         # Linter toutes les apps
pnpm test         # Tests unitaires
pnpm db:migrate   # Migrations Prisma
pnpm db:studio    # Ouvrir Prisma Studio
```

### apps/backoffice

```bash
pnpm test           # 39 tests de schéma Zod (Vitest)
pnpm test:coverage  # Tests + rapport de couverture
pnpm test:email     # Tester l'envoi d'email Resend
pnpm db:reset       # Réinitialiser la BDD (garde les essentiels)
pnpm seed:admin     # Créer le premier compte admin
pnpm seed:mock      # Données de démo (stages, baptêmes, vouchers, promos)
```

---

## ☁️ Déploiement sur Vercel

Le projet est conçu pour être déployé sous forme de **deux projets Vercel distincts**.

### 1. Supabase

Créer un projet sur [supabase.com](https://supabase.com) et récupérer :
- `DATABASE_URL` — connection string poolée (port 6543, `?pgbouncer=true`)
- `DIRECT_URL` — connection string directe (port 5432)

### 2. Migration de données

```bash
# Configurer apps/backoffice/.env.migration
# Puis depuis apps/backoffice :
npx dotenv -e .env.migration -- prisma migrate deploy
pnpm migrate:from-old
```

### 3. Vercel — Backoffice

- **Root Directory** → `apps/backoffice`
- **Build Command** → `pnpm vercel-build`
- Variables d'environnement : `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `PUBLIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`

### 4. Vercel — Front

- **Root Directory** → `apps/front`
- **Build Command** → par défaut (`next build`)
- Variables d'environnement : `NEXT_PUBLIC_BACKOFFICE_URL`, `NEXT_PUBLIC_API_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SANITY_*`

### 5. Post-déploiement

```bash
# Configurer le webhook Stripe → https://backoffice.mon-domaine.fr/api/webhooks/stripe
# Créer le premier admin
cd apps/backoffice && pnpm seed:admin
```

> ⚠️ **Sécurité** — Ne jamais mettre de clés Stripe live (`sk_live_...`) en dehors de l'environnement Production de Vercel.

---

## 📊 Modèle de données (simplifié)

```
User ──────────────── Session
  │
  │ moniteur
  ▼
Stage ──── StageMoniteur         Bapteme ──── BaptemeMoniteur
  │                                │
  ├── StageBooking                 ├── BaptemeBooking
  └── CartItem ◄──── CartSession ──┘
          │
          ▼
       OrderItem ◄──── Order ◄──── PromoCodeUsage
          │              │
          ▼              ▼
   PaymentAllocation   Payment (Stripe / Manuel)
          │
          ▼
  StageBooking / BaptemeBooking

GiftVoucher ─── peut couvrir un OrderItem (0€ en caisse)
SmsCampaign ─── Audience ─── AudienceRule (filtres dynamiques)
            └── PromoCode (généré par contact)
```

---

## 📚 Documentation

| Fichier | Contenu |
|---------|---------|
| [docs/architecture.md](docs/architecture.md) | Design système, flux de données |
| [docs/shop.md](docs/shop.md) | Logique métier (panier, commandes, paiements) |
| [docs/api.md](docs/api.md) | Référence complète des endpoints REST |
| [docs/environment.md](docs/environment.md) | Variables d'environnement |
| [docs/getting-started.md](docs/getting-started.md) | Guide de démarrage détaillé |
| [docs/test-guide.md](docs/test-guide.md) | Scénarios de test manuels |
| [docs/api-docs.html](docs/api-docs.html) | Documentation OpenAPI (ouvrir dans le navigateur) |

---

## 🔐 Authentification & Autorisations

**better-auth** — sessions httpOnly, email/password, réinitialisation par email (Resend).

| Rôle | Accès |
|------|-------|
| `ADMIN` | Accès complet + gestion des rôles, tarifs, contenu |
| `MONITEUR` | Planning, réservations, paiements, stagiaires |
| `CUSTOMER` | Espace client (non utilisé actuellement) |

Le frontend public s'authentifie avec :
- Header `x-api-key` — identifie le frontend comme source de confiance
- Header `x-session-id` — UUID de session panier (localStorage, 24h TTL)

---

<div align="center">

Fait avec ❤️ pour les amoureux des Alpes et du parapente

</div>
