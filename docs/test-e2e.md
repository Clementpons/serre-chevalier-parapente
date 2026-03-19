# Guide de test E2E — Processus e-commerce complet

> **Objectif** : Valider l'intégralité du tunnel de réservation depuis une base de données vierge.
> **Durée estimée** : 2–3h pour la suite complète.
> **Dernière mise à jour** : 2026-03-18 (v2 — fix vidéo + applicableProductTypes)

---

---

## 0. SETUP — Base de données et données de test

### 0.1 Réinitialisation complète

```bash
# Depuis apps/backoffice
docker compose up -d          # PostgreSQL
pnpm db:reset                 # Efface tout SAUF users/pricing
pnpm seed:admin               # Recrée le compte admin
```

Vérifier dans Prisma Studio (`pnpm db:studio`) que les tables sont vides :
- `CartSession`, `CartItem` → vides
- `Order`, `OrderItem`, `Payment` → vides
- `StageBooking`, `BaptemeBooking` → vides
- `GiftVoucher` → vide
- `PromoCode` → vide

### 0.2 Vérifier les prix de base en DB

Dans Prisma Studio → `BaptemeCategoryPrice` :

| Catégorie | Prix attendu |
|-----------|-------------|
| AVENTURE | 110€ |
| DUREE | 150€ |
| LONGUE_DUREE | 185€ |
| ENFANT | 90€ |
| HIVER | 130€ |

Dans `BaptemeOptionPrice` (ou équivalent) :
- Option vidéo : **45€**

### 0.3 Créer les créneaux via le backoffice

Ouvrir `http://localhost:3001` → Connexion admin.

#### Stages à créer (Dashboard → Stages → Ajouter)

| # | Type | Date début | Durée | Places | Prix | Acompte |
|---|------|-----------|-------|--------|------|---------|
| S1 | INITIATION | 2026-04-07 | 7j | 6 | 680€ | 150€ |
| S2 | INITIATION | 2026-04-14 | 7j | 4 | 680€ | 150€ |
| S3 | PROGRESSION | 2026-05-05 | 7j | 6 | 680€ | 150€ |
| S4 | AUTONOMIE | 2026-05-12 | 7j | 4 | 1200€ | 250€ |

#### Baptêmes à créer (Dashboard → Baptêmes → Ajouter)

| # | Date | Durée | Places | Catégories dispo | Acompte |
|---|------|-------|--------|-----------------|---------|
| B1 | 2026-04-15 10:00 | 15min | 6 | AVENTURE, ENFANT | 40€ |
| B2 | 2026-04-15 14:00 | 30min | 6 | DUREE | 40€ |
| B3 | 2026-04-20 10:00 | 45min | 4 | LONGUE_DUREE | 40€ |
| B4 | 2026-04-22 10:00 | 15min | 2 | AVENTURE | 40€ ← **seulement 2 places** |

### 0.4 Créer les codes promo (Dashboard → Promotions)

| Code | Type | Valeur | Min panier | Max réduction | Max utilisations | Expiration | Produits applicables |
|------|------|--------|-----------|---------------|-----------------|-----------|---------------------|
| `ETE2026` | FIXED | 50€ | 200€ (subtotal) | — | illimité | 2026-12-31 | tous (vide) |
| `PROMO10` | PERCENTAGE | 10% | — | 100€ | 3 | 2026-12-31 | tous (vide) |
| `BIENVENUE` | FIXED | 20€ | 100€ | — | 5 | 2026-12-31 | tous (vide) |
| `ONEUSE` | FIXED | 30€ | — | — | **1** | 2026-12-31 | tous (vide) |
| `EXPIRED` | FIXED | 99€ | — | — | illimité | **2025-01-01** ← expiré | tous (vide) |
| `INACTIVE` | FIXED | 99€ | — | — | illimité | 2026-12-31 (mais isActive=false) | tous (vide) |
| `STAGES_ONLY` | FIXED | 30€ | — | — | illimité | 2026-12-31 | **STAGE** uniquement |
| `BAPTEMES_ONLY` | FIXED | 20€ | — | — | illimité | 2026-12-31 | **BAPTEME** uniquement |

Désactiver `INACTIVE` après création (toggle actif/inactif).

> Pour `STAGES_ONLY` et `BAPTEMES_ONLY` : cocher uniquement la case correspondante dans le champ "Produits applicables" du formulaire de création.

### 0.5 Environnement

Vérifier dans `.env.local` du backoffice :
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `RESEND_API_KEY=re_...`
- `ADMIN_EMAIL=votre@email.com`

**Cartes de test Stripe :**
- ✅ Succès : `4242 4242 4242 4242`
- ❌ Refusée : `4000 0000 0000 0002`
- 🔐 3DS requis : `4000 0025 0000 3155`

---

## RÉFÉRENCE — Calculs attendus

> Utiliser ce tableau pour vérifier les montants dans les tests.

| Activité | Prix complet | Acompte aujourd'hui | Solde futur |
|----------|-------------|---------------------|-------------|
| Stage INITIATION | 680€ | 150€ | 530€ |
| Stage PROGRESSION | 680€ | 150€ | 530€ |
| Stage AUTONOMIE | 1200€ | 250€ | 950€ |
| Baptême AVENTURE | 110€ | 40€ | 70€ |
| Baptême AVENTURE + vidéo | 155€ | 85€ (40+45) | 70€ |
| Baptême DUREE | 150€ | 40€ | 110€ |
| Baptême DUREE + vidéo | 195€ | 85€ (40+45) | 110€ |
| Baptême LONGUE_DUREE | 185€ | 40€ | 145€ |
| Baptême LONGUE_DUREE + vidéo | 230€ | 85€ (40+45) | 145€ |
| Bon cadeau Stage INITIATION | 680€ | 680€ (paiement complet) | 0€ |
| Bon cadeau Baptême AVENTURE | 110€ | 110€ (paiement complet) | 0€ |

---

## PARTIE 1 — Tests de validation API (sans paiement)

---

### T-01 — Validation code promo : cas valides et invalides

**Objectif** : Vérifier tous les cas de validation d'un code promo.

**URL de test** : `http://localhost:3000/checkout` (champ code promo)

| Action | Code saisi | Montant panier | Résultat attendu |
|--------|-----------|----------------|-----------------|
| Code inexistant | `NOPE123` | — | ❌ "Code invalide" |
| Code inactif | `INACTIVE` | — | ❌ "Code invalide ou inactif" |
| Code expiré | `EXPIRED` | — | ❌ "Code expiré" |
| Min panier non atteint | `ETE2026` (min 200€) | Panier 150€ | ❌ "Montant minimum 200€" |
| Code valide FIXED | `ETE2026` | Panier 680€ (S1) | ✅ `-50€` — dépôt affiché : 100€ |
| Code valide % | `PROMO10` | Panier 680€ (S1) | ✅ `-15€` — dépôt affiché : 135€ |

> **Note** : Le champ promo est sur `/checkout`, pas sur `/reserver/*`.

---

### T-02 — Validation bon cadeau : cas valides et invalides

**Prérequis** : Effectuer d'abord T-08 pour avoir un code `GVSCP-...` disponible, ou utiliser le code de test créé en T-08.

**URL de test** : `/utiliser-bon-cadeau`

| Action | Situation | Résultat attendu |
|--------|-----------|-----------------|
| Code inexistant | `GVSCP-FAKE0000-TEST` | ❌ "Bon cadeau introuvable" |
| Code expiré | Code avec expiryDate passée | ❌ "Bon cadeau expiré" |
| Code déjà utilisé | Code après utilisation T-10 | ❌ "Bon cadeau déjà utilisé" |
| Code réservé par autre session | Bon dans panier d'une autre tab | ❌ "Bon cadeau non disponible" |
| Code valide | Code issu de T-08 | ✅ Affiche type, destinataire, validité |

---

## PARTIE 2 — Tests de réservation (flux complets)

---

### T-03 — Stage seul, sans code promo

**Objectif** : Valider le flux de bout en bout pour une réservation de stage simple.

**Montants attendus** : Acompte 150€ aujourd'hui, solde 530€ sur place.

#### Étapes

1. Aller sur `http://localhost:3000/reserver/stage`
2. Sélectionner **INITIATION**
   - Vérifier : le select affiche `À partir de 680€` (depuis la DB, pas hardcodé)
3. Sélectionner **Avril 2026**, puis le créneau **S1 (7 avril)**
4. Remplir le formulaire :
   - Prénom : `Alice`, Nom : `Durand`
   - Email : `alice.durand@test.fr`, Téléphone : `0601020304`
   - Poids : `65`, Taille : `170`, Date de naissance : `1990-06-15`
5. Cliquer **Ajouter au panier**
6. Vérifier le panier (sidebar) :
   - [ ] Item `Stage INITIATION - 07 avr. 2026` visible
   - [ ] Timer ~60 min visible
   - [ ] Prix affiché = `150€` (acompte)
7. Aller sur `/checkout`
8. Remplir les infos de facturation (si demandé)
9. Vérifier le récapitulatif checkout :
   - [ ] "À payer aujourd'hui" = **150€**
   - [ ] "Règlements futurs" : 530€ pour Alice Durand (stage INITIATION, 7 avril)
10. Payer avec `4242 4242 4242 4242`, exp 12/28, CVC 123
11. Vérifier la redirection vers `/checkout/success`

#### Vérifications sur la page success

- [ ] Numéro de commande affiché (format `ORD-2026-XXXXXX`)
- [ ] Détail : Stage INITIATION, Alice Durand, 7 avril 2026
- [ ] Montant payé : 150€
- [ ] Solde futur : 530€ à régler sur place

#### Vérifications en DB (Prisma Studio)

**Order :**
```
status              = PARTIALLY_PAID
subtotal            = 680
promoDiscountAmount = 0
totalAmount         = 680
clientId            ≠ null  ← client créé par le webhook
```

**OrderItem :**
```
type            = STAGE
unitPrice       = 680
depositAmount   = 150
remainingAmount = 530
isFullyPaid     = false
stageBookingId  ≠ null  ← booking créé
```

**Payment :**
```
paymentType  = STRIPE
status       = SUCCEEDED
amount       = 150
```

**PaymentAllocation :**
```
allocatedAmount = 150  ← lié à l'OrderItem
```

**StageBooking :**
```
stageId    = ID du stage S1
type       = INITIATION
stagiaireId ≠ null
shortCode  = SCP-XXXX  ← généré automatiquement (ex: SCP-A3KN)
```

**Stagiaire :**
```
firstName = Alice
lastName  = Durand
email     = alice.durand@test.fr
```

**Client :**
```
email = alice.durand@test.fr  ← créé par le webhook
```

**TemporaryReservation (si présente) :**
```
Doit être supprimée après finalisation
```

**CartSession / CartItem :**
```
CartItem de cette session = supprimé (vidé par finalizeOrder)
```

#### Vérifications emails

- [ ] Email de confirmation reçu à `alice.durand@test.fr`
- [ ] Email admin reçu à `ADMIN_EMAIL`
- [ ] Contenu : numéro de commande, stage, montant payé, solde restant

---

### T-04 — Baptême seul, sans vidéo, sans code promo

**Montants attendus** : Acompte 40€ + solde 70€ = total 110€.

#### Étapes

1. Aller sur `/reserver/bapteme` ou `/bi-places`
2. Sélectionner **AVENTURE**
   - Vérifier : prix affiché = **110€** (pas "À partir de", c'est un prix fixe)
3. Sélectionner **Avril 2026**, puis le créneau **B1 (15 avril 10h)**
4. Remplir le formulaire : `Bob Martin`, `bob.martin@test.fr`, `0612345678`, poids 80, taille 180
5. **Ne pas activer** l'option vidéo
6. Ajouter au panier → vérifier prix = `40€` dans le panier
7. Aller sur `/checkout`

#### Vérifications checkout

- [ ] "À payer aujourd'hui" = **40€**
- [ ] "Règlements futurs" : 70€ (Bob Martin, baptême AVENTURE, 15 avril)
- [ ] **Pas** de section "Acompte" — le baptème est intégralement facturé en deux fois

> ⚠️ **Point à vérifier** : Est-ce que le système distingue bien que c'est un baptème (sans notion de dépôt/acompte visible au client) ou affiche-t-il "acompte" ?

#### Payer et vérifier en DB

**Order :**
```
status = PARTIALLY_PAID
subtotal = 110
```

**OrderItem :**
```
type            = BAPTEME
unitPrice       = 110
depositAmount   = 40
remainingAmount = 70
```

**BaptemeBooking :**
```
category   = AVENTURE
hasVideo   = false
shortCode  = SCP-XXXX  ← généré automatiquement
```

---

### T-05 — Baptême seul, AVEC vidéo

**Montants attendus** : Acompte 40€ + vidéo 45€ = **85€ aujourd'hui**, solde 110€.

#### Étapes

1. Même parcours que T-04, mais sur le créneau **B2 (DUREE, 15 avril 14h)**
2. **Activer** l'option vidéo
   - Vérifier : le prix vidéo affiché = **45€** (depuis la DB)
3. Vérifier le récapitulatif du formulaire :
   - Baptême DUREE = 150€
   - Option vidéo = +45€
   - Total = 195€
   - Acompte aujourd'hui = 40 + 45 = **85€**

#### Vérifications checkout

- [ ] "À payer aujourd'hui" = **85€**
- [ ] "Règlements futurs" : 110€

#### Vérifications en DB

**Payment :**
```
amount = 85
```

**OrderItem :**
```
unitPrice       = 195  (150 + 45)
depositAmount   = 85   (40 + 45)
remainingAmount = 110
```

**BaptemeBooking :**
```
hasVideo   = true
category   = DUREE
shortCode  = SCP-XXXX  ← généré automatiquement
```

---

### T-06 — Deux stages distincts, même commande

**Montants attendus** : 150€ + 150€ = **300€** aujourd'hui, soldes : 530€ + 530€ = 1060€.

#### Étapes

1. Ajouter le stage **S1 (INITIATION, 7 avril)** pour `Charlie Dupont` au panier
2. **Sans aller au checkout**, ajouter le stage **S2 (INITIATION, 14 avril)** pour `Diana Prince` au panier
3. Ouvrir le panier :
   - [ ] 2 items STAGE visibles, chacun avec son propre timer
4. Aller sur `/checkout`

#### Vérifications checkout

- [ ] "À payer aujourd'hui" = **300€**
- [ ] "Règlements futurs" liste **2 soldes** : Charlie 530€ (7 avril) et Diana 530€ (14 avril)

#### Payer et vérifier en DB

**Order :**
```
status  = PARTIALLY_PAID
subtotal = 1360
```

**OrderItems (2) :**
```
Item 1 : depositAmount=150, remainingAmount=530, stageBookingId ≠ null
Item 2 : depositAmount=150, remainingAmount=530, stageBookingId ≠ null
```

**Payment :**
```
amount = 300  ← un seul Payment Stripe pour les deux acomptes
```

**PaymentAllocation (2) :**
```
Allocation 1 : allocatedAmount=150 → OrderItem 1
Allocation 2 : allocatedAmount=150 → OrderItem 2
```

**StageBooking (2) :**
```
Booking 1 : stagiaireId = Charlie Dupont, type=INITIATION, stageId=S1
Booking 2 : stagiaireId = Diana Prince, type=INITIATION, stageId=S2
```

**CartItems :** vidés pour cette session.

---

### T-07 — Deux baptêmes distincts, même commande

**Montants attendus** : 40€ + 40€ = **80€** aujourd'hui, soldes 70€ + 110€.

#### Étapes

1. Ajouter **B1 (AVENTURE, 15 avril 10h)** pour `Eve Martin`, sans vidéo
2. Ajouter **B2 (DUREE, 15 avril 14h)** pour `Frank Leroy`, sans vidéo
3. Vérifier le panier : 2 items BAPTEME

#### Vérifications checkout

- [ ] "À payer aujourd'hui" = **80€**
- [ ] Règlements futurs : Eve 70€, Frank 110€

#### Vérifications en DB

**Order :** `status = PARTIALLY_PAID`, `subtotal = 260`

**BaptemeBookings (2) :**
```
Booking 1 : category=AVENTURE, hasVideo=false, stagiaireId=Eve
Booking 2 : category=DUREE, hasVideo=false, stagiaireId=Frank
```

---

### T-08 — Un stage + un baptème, même personne, même commande

**Montants attendus** :
- Stage INITIATION : acompte 150€
- Baptême AVENTURE (sans vidéo) : acompte 40€
- **Total aujourd'hui : 190€**
- Soldes futurs : 530€ (stage) + 70€ (baptème) = 600€

#### Étapes

1. Ajouter **S3 (PROGRESSION, 5 mai)** pour `Grace Hopper` (poids 55, taille 165)
2. Ajouter **B1 (AVENTURE, 15 avril 10h)** pour `Grace Hopper` (mêmes coordonnées)
3. Panier : 1 STAGE + 1 BAPTEME, même nom participant

#### Vérifications checkout

- [ ] "À payer aujourd'hui" = **190€**
- [ ] Règlements futurs : 530€ stage + 70€ baptème

#### Vérifications en DB

**Order :** `subtotal = 790 (680+110)`, `status = PARTIALLY_PAID`

**StageBooking + BaptemeBooking :**
```
Les deux doivent pointer vers le MÊME Stagiaire (Grace Hopper)
→ findOrCreateStagiaire() doit retourner le même ID
```

---

### T-09 — Achat d'un bon cadeau stage (pour offrir)

**Montants attendus** : 680€ paiement complet immédiat.

#### Étapes

1. Aller sur `/reserver/bon-cadeau`
2. Sélectionner type **Stage**, catégorie **INITIATION**
3. Remplir :
   - Destinataire : `Henri Leconte`
   - Email destinataire : `henri.leconte@test.fr`
   - Message : "Joyeux anniversaire !"
   - Notifier le destinataire : **OUI**
   - Votre nom : `Isabelle Bonnet`
   - Votre email : `isabelle.bonnet@test.fr`
4. Prix affiché : **680€** (vient de la DB, pas hardcodé)
5. Ajouter au panier → vérifier badge "🎁 Bon Cadeau à offrir"
6. Aller sur `/checkout`

#### Vérifications checkout

- [ ] "À payer aujourd'hui" = **680€** (paiement complet, pas d'acompte)
- [ ] Pas de section "Règlements futurs"

#### Vérifications en DB

**Order :** `status = PAID` (paiement complet, pas de solde)

**OrderItem :**
```
type               = GIFT_VOUCHER
totalPrice         = 680
depositAmount      = 680
remainingAmount    = 0
isFullyPaid        = true
generatedGiftVoucherId ≠ null  ← bon cadeau créé
```

**GiftVoucher (créé automatiquement) :**
```
code          = GVSCP-XXXXXXXX-XXXX  ← noter ce code pour T-11
productType   = STAGE
stageCategory = INITIATION
purchasePrice = 680
isUsed        = false
expiryDate    = ~ 2027-03-18 (1 an)
recipientName = Henri Leconte
recipientEmail = henri.leconte@test.fr
clientId      ≠ null  ← lié à Isabelle Bonnet
```

**Payment :**
```
amount = 680
status = SUCCEEDED
paymentType = STRIPE
```

#### Vérifications emails

- [ ] Email bon cadeau reçu à **henri.leconte@test.fr** (notifyRecipient=true)
  - Contenu : code `GVSCP-...`, type "Stage INITIATION", expiration
- [ ] Email de confirmation commande reçu à **isabelle.bonnet@test.fr**
- [ ] Email admin reçu

> **Sauvegarder le code `GVSCP-...` généré** pour utilisation dans T-11.

---

### T-10 — Achat d'un bon cadeau baptème (sans notification)

**Montants attendus** : 110€ paiement complet.

#### Étapes

1. `/reserver/bon-cadeau` → type **Baptème**, catégorie **AVENTURE**
2. Destinataire : `Jules Verne`, email : `jules.verne@test.fr`
3. **Notifier le destinataire : NON**
4. Votre email : `marie.curie@test.fr`
5. Prix affiché : **110€**
6. Payer → vérifier `/checkout/success`

#### Vérifications en DB

**GiftVoucher :**
```
code          = GVSCP-XXXXXXXX-XXXX  ← noter pour T-12
productType   = BAPTEME
baptemeCategory = AVENTURE
purchasePrice = 110
isUsed        = false
```

#### Vérifications emails

- [ ] **Pas d'email** à `jules.verne@test.fr` (notifyRecipient=false)
- [ ] Email de confirmation à `marie.curie@test.fr` avec le code bon cadeau

---

### T-11 — Utilisation d'un bon cadeau STAGE (commande gratuite)

**Prérequis** : Code `GVSCP-...` issu de T-09 (Stage INITIATION).

**Montants attendus** : 0€ à payer (commande 100% bon cadeau).

#### Étapes

1. Aller sur `/utiliser-bon-cadeau` ou `/reserver/stage`
2. Sélectionner **INITIATION**, créneau **S1 (7 avril)**
   > Si S1 est pris par T-03, utiliser S2
3. Remplir le formulaire pour `Henri Leconte` (le destinataire du bon)
4. Dans le champ bon cadeau (si présent dans le formulaire), entrer le code `GVSCP-...`
   - Alternativement : ajouter au panier, puis entrer le code sur `/checkout`
5. Vérifier :
   - [ ] Prix barré 680€ → **0€**
   - [ ] Badge "🎁 Bon Cadeau Appliqué"

#### Vérifications checkout

- [ ] "À payer aujourd'hui" = **0€**
- [ ] Pas de formulaire Stripe (commande gratuite)
- [ ] Bouton "Confirmer gratuitement" ou équivalent

#### Vérifications en DB

**Order :**
```
status   = PAID  ← finalisé immédiatement, sans Stripe
clientId ≠ null  ← créé immédiatement (commande gratuite)
```

**OrderItem :**
```
totalPrice      = 680 (prix original)
depositAmount   = 0
remainingAmount = 0
isFullyPaid     = true
usedGiftVoucherId ≠ null  ← bon utilisé lié
stageBookingId  ≠ null    ← booking créé
```

**Payment :**
```
paymentType = GIFT_VOUCHER
status      = SUCCEEDED
amount      = 680
```

**GiftVoucher (mis à jour) :**
```
isUsed = true
usedAt = timestamp actuel
reservedBySessionId = null  ← libéré
```

**StageBooking :**
```
stagiaireId ≠ null
type = INITIATION
stageId = S1 (ou S2)
```

#### Test de réutilisation du bon

Essayer de réutiliser le même code `GVSCP-...` :
- [ ] ❌ Erreur "Bon cadeau déjà utilisé"

---

### T-12 — Utilisation d'un bon cadeau BAPTÈME

**Prérequis** : Code `GVSCP-...` issu de T-10 (Baptême AVENTURE).

**Montants attendus** : 0€ (commande gratuite).

#### Étapes

1. Réserver le baptème **B4 (AVENTURE, 22 avril)** pour `Jules Verne`
2. Appliquer le code bon cadeau
3. Finaliser sans paiement

#### Vérifications en DB

**BaptemeBooking :**
```
category   = AVENTURE
hasVideo   = false
stagiaireId = Jules Verne
```

**GiftVoucher :** `isUsed = true`

---

### T-13 — Code promo FIXED sur un seul stage

**Prérequis** : Code `ETE2026` (FIXED 50€, min panier 200€ subtotal).

**Montants attendus** :
- Subtotal : 680€ (> 200€ → code valide)
- Acompte avant promo : 150€
- Réduction : 50€ (sur l'acompte)
- **À payer aujourd'hui : 100€**
- Solde futur inchangé : 530€

#### Étapes

1. Ajouter **S3 (PROGRESSION, 5 mai)** pour `Lena Fischer` au panier
2. Aller sur `/checkout`
3. Saisir le code **`ETE2026`**
4. Vérifier :
   - [ ] Réduction affichée : -50€
   - [ ] "À payer aujourd'hui" = **100€**
   - [ ] "Règlements futurs" : 530€ ← **inchangé par la promo**

#### Payer et vérifier en DB

**Order :**
```
subtotal            = 680
promoDiscountAmount = 50
totalAmount         = 680  ← ne change PAS avec la promo
```

**Payment :**
```
amount = 100  ← 150 - 50
```

**PromoCodeUsage :**
```
discountApplied = 50
orderId         = ID de cette commande
```

**PromoCode (ETE2026) :**
```
currentUses = 1  ← incrémenté
```

---

### T-14 — Code promo PERCENTAGE sur deux stages

**Prérequis** : Code `PROMO10` (10%, max 100€, 3 utilisations max).

**Montants attendus** :
- Subtotal : 1360€ (2 × 680€)
- Acompte avant promo : 300€ (2 × 150€)
- Réduction 10% sur 300€ : **30€**
- **À payer aujourd'hui : 270€**
- Plafond max 100€ → ici 30€ < 100€, donc plafond non atteint

#### Étapes

1. Ajouter **S1** pour `Maria Gonzalez` et **S2** pour `Pedro Alonso`
2. Sur `/checkout`, saisir `PROMO10`
3. Vérifier :
   - [ ] Réduction = **-30€**
   - [ ] "À payer aujourd'hui" = **270€**

#### Tester le plafond

Pour tester le plafond de 100€ :
- Ajouter **S1 + S2 + S3 + S4** (acomptes : 150+150+150+250 = 700€)
- Code `PROMO10` : 10% de 700€ = 70€ < 100€ → réduction = 70€
- Avec 8 stages (4×150 + 4×150 = 1200€ d'acomptes) : 10% = 120€ > 100€ → réduction plafonnée à **100€**

#### Vérifications en DB

**PromoCode (PROMO10) :**
```
currentUses = 1 (incrémenté)
```

---

### T-15 — Épuisement d'un code promo (maxUses=1)

**Prérequis** : Code `ONEUSE` (FIXED 30€, 1 utilisation max).

#### Étapes

1. Première utilisation : réserver S1, appliquer `ONEUSE` → succès, -30€
2. Deuxième tentative (nouvelle session) : réserver S2, saisir `ONEUSE`
   - [ ] ❌ Erreur "Nombre maximum d'utilisations atteint"

#### Vérification en DB

**PromoCode (ONEUSE) :**
```
currentUses = 1
maxUses     = 1
```

---

### T-16 — Code promo appliqué sur un panier avec bon cadeau acheté

**Objectif** : Vérifier que la promo s'applique aussi sur les bons cadeaux achetés.

**Montants attendus** :
- Bon cadeau Stage INITIATION : 680€
- Subtotal : 680€ (> 200€ → ETE2026 valide)
- DepositTotal : 680€ (bon cadeau = paiement complet)
- Réduction ETE2026 : 50€ sur 680€
- **À payer aujourd'hui : 630€**

#### Étapes

1. Acheter un bon cadeau Stage INITIATION (680€) pour `Oscar Wild`
2. Sur `/checkout`, saisir `ETE2026`
3. Vérifier :
   - [ ] Réduction = -50€
   - [ ] "À payer aujourd'hui" = **630€**

> ℹ️ **Comportement par défaut** : Un code sans restriction (`applicableProductTypes = []`) s'applique aussi aux bons cadeaux. Pour l'interdire, créer le code avec uniquement `STAGE` et/ou `BAPTEME` dans les produits applicables (voir T-31 pour les tests dédiés).

#### Vérification en DB

**GiftVoucher généré :**
```
purchasePrice = 680  ← prix original (non réduit)
```

**Order :**
```
promoDiscountAmount = 50
totalAmount         = 680  ← inchangé
```

---

### T-17 — Code promo + bon cadeau utilisé (panier mixte)

**Objectif** : Stage payé + stage gratuit (bon cadeau). La promo s'applique sur l'acompte du stage payant seulement.

**Montants attendus** :
- Stage S1 payant : acompte 150€
- Stage S2 avec bon cadeau : 0€
- DepositTotal : 150€
- Code ETE2026 (-50€ sur 150€) : -50€
- **À payer aujourd'hui : 100€**

#### Étapes

1. Prérequis : avoir un code bon cadeau Stage INITIATION valide (T-09)
2. Ajouter **S1** (7 avril) pour `Rachel Green` (payant)
3. Ajouter **S2** (14 avril) pour `Monica Geller` avec code bon cadeau
4. Vérifier le panier :
   - [ ] Item S1 : 150€
   - [ ] Item S2 : **0€**, badge "🎁 Bon Cadeau Appliqué"
5. Sur `/checkout`, appliquer `ETE2026`
6. Vérifier :
   - [ ] "À payer aujourd'hui" = **100€** (150 - 50)
   - [ ] Règlements futurs : 530€ pour Rachel (S1)

#### Vérifications en DB

**Order :**
```
status              = PARTIALLY_PAID
promoDiscountAmount = 50
```

**OrderItem S1 (payant) :**
```
depositAmount   = 150
remainingAmount = 530
stageBookingId  ≠ null
```

**OrderItem S2 (bon cadeau) :**
```
depositAmount   = 0
remainingAmount = 0
isFullyPaid     = true
usedGiftVoucherId ≠ null
stageBookingId  ≠ null
```

**Payment :**
```
amount = 100
```

**GiftVoucher (S2) :**
```
isUsed = true
```

---

### T-18 — Bon cadeau + stage payant + code promo (triple combinaison)

**Objectif** : Baptème payant + bon cadeau pour un baptème + achat d'un nouveau bon cadeau + code promo.

**Montants attendus** :
- Baptême DUREE payant : acompte 40€
- Baptême AVENTURE avec bon cadeau utilisé : 0€
- Achat bon cadeau Stage PROGRESSION : 680€
- DepositTotal avant promo : 40 + 0 + 680 = **720€**
- Code BIENVENUE (-20€, min 100€) : subtotal = 110+110+680 = 900€ > 100€ → valide
- Réduction : 20€ sur 720€ → **700€**

#### Étapes

1. Prérequis : avoir un code bon cadeau Baptême AVENTURE valide (T-10)
2. Ajouter **B2 (DUREE)** pour `Ted Mosby` (payant)
3. Ajouter **B1 (AVENTURE)** pour `Marshall Eriksen` avec code bon cadeau
4. Ajouter un bon cadeau Stage PROGRESSION pour `Lily Aldrin`
5. Appliquer `BIENVENUE`
6. Vérifier :
   - [ ] "À payer aujourd'hui" = **700€**

#### Vérifications en DB

**3 OrderItems** : BAPTEME payant, BAPTEME gratuit, GIFT_VOUCHER
**2 BaptemeBookings** créés
**1 GiftVoucher** créé (Stage PROGRESSION pour Lily)
**1 GiftVoucher** utilisé (Baptème AVENTURE Marshall)

---

### T-19 — Panier mixte complet (scénario ultime)

**Objectif** : Tester absolument tous les types d'articles dans une seule commande.

Contenu du panier :
- Stage INITIATION pour moi (payant)
- Baptême AVENTURE pour moi (avec vidéo, payant)
- Stage PROGRESSION via bon cadeau (gratuit)
- Achat d'un bon cadeau Baptème DUREE pour offrir
- Code promo PROMO10 (10%)

**Calcul détaillé :**
| Article | Prix complet | Acompte |
|---------|-------------|---------|
| Stage INITIATION (payant) | 680€ | 150€ |
| Baptème AVENTURE + vidéo (payant) | 155€ (110+45) | 85€ (40+45) |
| Stage PROGRESSION (bon cadeau) | 680€ | 0€ |
| Achat bon cadeau Baptème DUREE | 150€ | 150€ |
| **Subtotal** | **1665€** | — |
| **DepositTotal** | — | **385€** |
| Code PROMO10 (10% de 385€ = 38.5€) | — | **-38.50€** |
| **À payer aujourd'hui** | — | **346.50€** |
| Règlements futurs | — | Stage 530€ + Baptème 70€ = **600€** |

#### Étapes

1. Prérequis : avoir un code bon cadeau Stage PROGRESSION valide
2. Ajouter le stage S1 pour vous (payant)
3. Ajouter le baptème B1 (AVENTURE) pour vous, avec vidéo (payant)
4. Ajouter le stage S3 (PROGRESSION) avec code bon cadeau
5. Ajouter un bon cadeau Baptème DUREE (pour offrir)
6. Sur `/checkout`, saisir `PROMO10`
7. Vérifier les totaux affichés

#### Vérifications exhaustives

**Interface :**
- [ ] 4 items dans le panier (sections séparées)
- [ ] Timer actif sur les 2 activités payantes
- [ ] Badge bon cadeau sur le stage gratuit
- [ ] Récapitulatif : 4 lignes détaillées

**Checkout :**
- [ ] "À payer aujourd'hui" = **346.50€**
- [ ] "Règlements futurs" : 530€ + 70€

**DB après paiement :**
- [ ] 1 `Order` avec status `PARTIALLY_PAID`
- [ ] 4 `OrderItem`
- [ ] 1 `StageBooking` (payant)
- [ ] 1 `BaptemeBooking` (avec hasVideo=true)
- [ ] 1 `StageBooking` (bon cadeau)
- [ ] 1 `GiftVoucher` créé (Baptème DUREE)
- [ ] 1 `GiftVoucher` utilisé (Stage PROGRESSION)
- [ ] 1 `Payment` STRIPE amount=346.50€
- [ ] 4 `PaymentAllocation` (150€, 85€, 0€, 150€ → ajusté par promo)
- [ ] `PromoCode.currentUses` incrémenté pour PROMO10
- [ ] 3 emails envoyés (client + admin + bon cadeau destinataire)

---

## PARTIE 3 — Tests de cas d'erreur et edge cases

---

### T-20 — Paiement refusé (carte déclinée)

#### Étapes

1. Ajouter un stage au panier
2. Sur `/checkout`, payer avec `4000 0000 0000 0002` (carte refusée)

#### Vérifications

- [ ] Message d'erreur Stripe affiché dans le formulaire de paiement
- [ ] Redirection **non effectuée** vers `/checkout/success`

**DB :**
```
Order.status  = CANCELLED  ← mis à jour par webhook payment_intent.payment_failed
Payment.status = FAILED
CartItem      = toujours présent  ← non vidé
```

- [ ] L'utilisateur peut corriger la carte et réessayer sans recréer la commande (si Stripe Payment Intent est réutilisé) OU doit relancer depuis le checkout

---

### T-21 — Tentative de réservation sur créneau complet

**Prérequis** : Créneau **B4 (AVENTURE, 22 avril, 2 places seulement)**

#### Étapes

1. Session 1 : réserver la place 1 sur B4 (sans finaliser)
2. Session 2 : réserver la place 2 sur B4 (sans finaliser)
3. Session 3 : tenter d'ajouter B4

**Vérifications :**
- [ ] ❌ Session 3 : erreur "Plus de places disponibles"
- [ ] Sessions 1 et 2 : toujours actives (timer visible)

**DB :**
```
B4 : 2 places
CartItem actifs sur B4 : 2
→ disponibilité = 0 → refus correct
```

---

### T-22 — Expiration du panier (simulation)

**Objectif** : Vérifier que les places sont libérées à l'expiration.

#### Étapes

1. Ajouter un stage au panier (CartItem.expiresAt = now + 1h)
2. Dans Prisma Studio : mettre manuellement `CartItem.expiresAt = now - 1 minute` pour simuler l'expiration
3. Recharger le panier (GET /api/cart/items)

**Vérifications :**
- [ ] Le CartItem expiré est supprimé automatiquement
- [ ] Le panier apparaît vide
- [ ] La place est de nouveau disponible pour d'autres clients

---

### T-23 — Idempotence du webhook Stripe

**Objectif** : Rejouer le même webhook ne doit pas créer de doublons.

#### Étapes

1. Compléter T-03 (commande finalisée)
2. Récupérer le `stripeEventId` depuis `ProcessedWebhookEvent` en DB
3. Simuler un renvoi du webhook via Stripe CLI :
   ```bash
   stripe events resend evt_XXXXXX
   ```
   ou en appelant manuellement `/api/webhooks/stripe` avec le même payload

**Vérifications :**
- [ ] Pas de doublon dans `StageBooking`
- [ ] Pas de double email envoyé
- [ ] `ProcessedWebhookEvent` : un seul enregistrement pour cet eventId
- [ ] `Order.status` inchangé

---

### T-24 — Bon cadeau réservé par une autre session

**Objectif** : Un bon cadeau en cours d'achat ne peut pas être utilisé simultanément.

#### Étapes

1. Session A : ajouter le bon cadeau (code GVSCP-...) au panier mais ne pas finaliser
   - En DB : `GiftVoucher.reservedBySessionId = sessionA`
2. Session B : essayer d'utiliser le même code
   - [ ] ❌ Erreur "Bon cadeau non disponible" ou "Déjà réservé"

---

### T-25 — Modification des infos participant après ajout au panier

**Objectif** : L'édition inline dans le checkout fonctionne correctement.

#### Étapes

1. Ajouter un baptème au panier
2. Sur `/checkout`, cliquer "Modifier" sur l'item
3. Changer le prénom et l'email
4. Sauvegarder

**Vérifications :**
- [ ] Les nouvelles infos apparaissent dans le récapitulatif
- [ ] `CartItem.participantData` mis à jour en DB (via PATCH /api/cart/items/:id)
- [ ] Après paiement, le `Stagiaire` créé a les **nouvelles** infos

---

### T-26 — Ajout/retrait de l'option vidéo depuis le checkout

#### Étapes

1. Ajouter un baptème sans vidéo au panier
2. Sur `/checkout` (ou dans le panier), activer l'option vidéo via le toggle
3. Vérifier :
   - [ ] Prix mis à jour : +45€ sur l'acompte
4. Désactiver la vidéo
5. Vérifier :
   - [ ] Prix revient à l'acompte initial

**Vérifications DB :**
```
CartItem.participantData.hasVideo = true puis false
CartItem recalculé à chaque toggle via PATCH /api/cart/items/:id
```

---

## PARTIE 4 — Vérifications backoffice

---

### T-27 — Commandes visibles dans le backoffice admin

Après avoir exécuté T-03 :

1. Se connecter sur `http://localhost:3001`
2. Aller dans **Dashboard → Commandes**
3. Vérifier :
   - [ ] La commande ORD-2026-XXXXXX apparaît
   - [ ] Status : PARTIALLY_PAID
   - [ ] Client : Alice Durand
   - [ ] Montant : 150€ payé / 530€ restant

---

### T-28 — Réservations visibles dans le backoffice

1. Dashboard → **Stages** → Stage S1 (7 avril)
2. Vérifier :
   - [ ] 1 stagiaire réservé (Alice Durand)
   - [ ] Places restantes : 5/6

1. Dashboard → **Baptèmes** → B1 (15 avril)
2. Vérifier :
   - [ ] Stagiaires inscrits visibles

---

### T-29 — Bons cadeaux dans le backoffice

1. Dashboard → **Bons Cadeaux**
2. Vérifier :
   - [ ] Bon cadeau T-09 : isUsed=false
   - [ ] Bon cadeau T-09 après T-11 : isUsed=true, usedAt renseigné

---

### T-30 — Codes promo et compteurs d'utilisation

1. Dashboard → **Codes Promo**
2. Vérifier pour chaque code utilisé dans les tests :
   - [ ] `ETE2026.currentUses` = nombre correct
   - [ ] `PROMO10.currentUses` = nombre correct
   - [ ] `ONEUSE.currentUses` = 1 (et donc refusé à la 2ème tentative)

---

### T-31 — Codes promo avec restriction par type de produit (`applicableProductTypes`)

**Prérequis** : Codes `STAGES_ONLY` (FIXED 30€, STAGE uniquement) et `BAPTEMES_ONLY` (FIXED 20€, BAPTEME uniquement) créés en 0.4.

---

#### T-31a — Code STAGES_ONLY sur un panier avec seulement des baptêmes

1. Ajouter **B1 (AVENTURE)** au panier (sans stage)
2. Sur `/checkout`, saisir `STAGES_ONLY`
3. **Résultat attendu** : ❌ _"Ce code promo est réservé aux stages"_

---

#### T-31b — Code STAGES_ONLY sur un panier avec seulement des stages

**Montants attendus** :
- Stage INITIATION : acompte 150€
- Réduction STAGES_ONLY : -30€ sur les stages → **120€ aujourd'hui**

1. Ajouter **S1 (INITIATION)** au panier
2. Saisir `STAGES_ONLY`
3. Vérifier :
   - [ ] Réduction affichée : **-30€**
   - [ ] "À payer aujourd'hui" = **120€**

**DB :**
```
promoDiscountAmount = 30
Payment.amount      = 120
```

---

#### T-31c — Code STAGES_ONLY sur un panier mixte (stage + baptême)

**Montants attendus** :
- Stage INITIATION : acompte 150€
- Baptème AVENTURE : acompte 40€
- DepositTotal : 190€
- `STAGES_ONLY` s'applique seulement sur l'acompte du stage : 150€ → -30€
- **À payer aujourd'hui : 160€** (190 - 30)

1. Ajouter **S1** + **B1** au panier
2. Saisir `STAGES_ONLY`
3. Vérifier :
   - [ ] Réduction affichée : **-30€** (pas -30€ sur 190€, mais bien calculée sur la portion stage uniquement)
   - [ ] "À payer aujourd'hui" = **160€**

**DB :**
```
promoDiscountAmount = 30
Payment.amount      = 160
```

---

#### T-31d — Code BAPTEMES_ONLY sur un panier avec seulement des stages

1. Ajouter **S1** au panier, saisir `BAPTEMES_ONLY`
2. **Résultat attendu** : ❌ _"Ce code promo est réservé aux baptêmes"_

---

#### T-31e — Code STAGES_ONLY sur un panier avec achat d'un bon cadeau

**Montants attendus** :
- Bon cadeau Stage INITIATION : 680€ (type GIFT_VOUCHER, pas STAGE)
- `STAGES_ONLY` n'inclut pas GIFT_VOUCHER → **refusé**

1. Ajouter un bon cadeau Stage (type = GIFT_VOUCHER dans le panier)
2. Saisir `STAGES_ONLY`
3. **Résultat attendu** : ❌ _"Ce code promo est réservé aux stages"_

> ℹ️ Un achat de bon cadeau a le type `GIFT_VOUCHER`, pas `STAGE`. Pour qu'un code s'applique aux bons cadeaux, il faut inclure `GIFT_VOUCHER` dans les produits applicables.

---

## RÉCAPITULATIF DES MONTANTS À VÉRIFIER

| Test | À payer aujourd'hui | Soldes futurs | Status Order |
|------|---------------------|---------------|-------------|
| T-03 Stage seul | 150€ | 530€ | PARTIALLY_PAID |
| T-04 Baptème seul | 40€ | 70€ | PARTIALLY_PAID |
| T-05 Baptème + vidéo | 85€ | 110€ | PARTIALLY_PAID |
| T-06 Deux stages | 300€ | 1060€ | PARTIALLY_PAID |
| T-07 Deux baptèmes | 80€ | 180€ | PARTIALLY_PAID |
| T-08 Stage + Baptème | 190€ | 600€ | PARTIALLY_PAID |
| T-09 Achat bon cadeau | 680€ | 0€ | PAID |
| T-11 Utilisation bon cadeau | 0€ | 0€ | PAID |
| T-13 Stage + ETE2026 | 100€ | 530€ | PARTIALLY_PAID |
| T-14 2 stages + PROMO10 | 270€ | 1060€ | PARTIALLY_PAID |
| T-17 Stage + bon cadeau + ETE2026 | 100€ | 530€ | PARTIALLY_PAID |
| T-19 Panier complet | ~346.50€ | 600€ | PARTIALLY_PAID |

---

## CHECKLIST FINALE

- [ ] Tous les prix viennent de la DB (aucun hardcodé dans l'UI)
- [ ] Option vidéo : même prix en DB, en frontend ET dans `Payment.amount` backend (85€ si DUREE + vidéo)
- [ ] Les timers expirent et libèrent les places
- [ ] Chaque `StageBooking` et `BaptemeBooking` a un `shortCode` de type `SCP-XXXX` (non NULL)
- [ ] Le `shortCode` apparaît dans l'email de confirmation client
- [ ] Les bons cadeaux sont marqués `isUsed=true` après utilisation
- [ ] Les codes promo incrémentent `currentUses`
- [ ] Un code promo avec maxUses=1 est refusé à la 2ème tentative
- [ ] Un code promo avec `applicableProductTypes` est refusé si le panier ne contient aucun type compatible
- [ ] Un code promo avec `applicableProductTypes` ne réduit que la portion du dépôt concernée
- [ ] Les emails partent aux bonnes adresses avec le bon contenu
- [ ] L'idempotence des webhooks est garantie
- [ ] Le backoffice reflète toutes les réservations
- [ ] Les consentements RGPD sont stockés (Client.rgpdConsentAt, Stagiaire.rgpdConsentAt)
