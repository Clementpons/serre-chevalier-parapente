# Features — Serre Chevalier Parapente

Référence complète de toutes les fonctionnalités du projet, côté backoffice (API + UI) et côté front public.
Utilisée comme base pour la refactorisation V3.

---

## Table des matières

1. [Activités](#activités)
2. [E-commerce (Panier, Commandes, Paiements)](#e-commerce)
3. [Bons Cadeaux (Gift Vouchers)](#bons-cadeaux)
4. [Codes Promo](#codes-promo)
5. [Clients & Stagiaires](#clients--stagiaires)
6. [Utilisateurs & Auth](#utilisateurs--auth)
7. [Disponibilités & Réservations Temporaires](#disponibilités)
8. [Tarifs & Pricing](#tarifs--pricing)
9. [Contenu Site Web](#contenu-site-web)
10. [Marketing SMS](#marketing-sms)
11. [Dashboard & Stats](#dashboard--stats)
12. [Front Public — Pages](#front-public--pages)
13. [Dead Code à supprimer](#dead-code-à-supprimer)
14. [Bugs actifs](#bugs-actifs)
15. [Décisions de design V3](#décisions-de-design-v3)

---

## Activités

### Stages (`features/stages/`)

Séjours de parapente de plusieurs jours. Types : INITIATION, PROGRESSION, AUTONOMIE, DOUBLE.

**API — Backoffice `GET /api/stages` (public)**
- Liste tous les stages avec disponibilités calculées (places confirmées + réservations temporaires)
- Retourne : id, startDate, duration, places, price, promotionOriginalPrice *(V3)*, type, moniteurs, placesDisponibles

**API — Backoffice `GET /api/stages/:id` (auth)**
- Détail d'un stage avec réservations et moniteurs

**API — Backoffice `POST /api/stages` (admin)**
- Créer un stage : startDate, duration, places, price, type (INITIATION/PROGRESSION/AUTONOMIE/DOUBLE), moniteurIds[]

**API — Backoffice `PUT /api/stages/:id` (admin)**
- Modifier un stage. Gère `allTimeHighPrice` (à remplacer par `promotionOriginalPrice` en V3)

**API — Backoffice `DELETE /api/stages/:id` (admin)**
- Supprimer uniquement si 0 réservation

**API — Backoffice `PATCH /api/stages/promotions` (admin) *(V3 — à créer)***
- Appliquer une promo en bulk : prend `{ stageIds[], discountPercent, reason, endDate? }` OU `{ dateRange: { from, to }, stageType?, discountPercent, reason, endDate? }`
- Stocke `promotionOriginalPrice` sur le stage, crée une entrée `StagePromotionHistory`
- Support de la suppression de promo (reset)

**UI Backoffice — Planning Stages (`/dashboard/stages`)**
- Vue calendrier mensuelle avec cards de stage
- Click sur un jour → `/dashboard/add?type=stage&date=X` (date pré-remplie)
- Click sur un stage → Sheet latéral (détails + réservations + actions edit/delete)
- Affiche : type, durée, date, places disponibles, nb réservations, moniteurs assignés
- Role-based : MONITEUR voit le planning, ADMIN peut créer/éditer/supprimer

---

### Baptêmes (`features/biplaces/`)

> ⚠️ Dossier nommé `biplaces`, renommé en `baptemes` en V3.

Vol biplace découverte. Catégories : AVENTURE, DUREE, LONGUE_DUREE, ENFANT, HIVER.

**API — Backoffice `GET /api/baptemes` (session ou API key)**
- Liste tous les baptêmes avec disponibilités et prix par catégorie
- Un baptême peut avoir plusieurs catégories disponibles sur le même créneau

**API — Backoffice `GET /api/baptemes/:id` (auth)**
- Détail avec réservations et moniteurs

**API — Backoffice `POST /api/baptemes` (monitor+)**
- Créer : date (unique), duration (minutes), places, categories[], acomptePrice, moniteurIds[]
- Règle : un moniteur ne peut créer que des baptêmes sur lesquels il est assigné

**API — Backoffice `PUT /api/baptemes/:id` (monitor+)**
- Modifier. Un moniteur ne peut éditer que ses propres baptêmes

**API — Backoffice `DELETE /api/baptemes/:id` (monitor+)**
- Supprimer uniquement si 0 réservation. Moniteur doit être assigné

**UI Backoffice — Planning Baptêmes (`/dashboard/biplaces`)**
- Vue calendrier mensuelle en grille horaire
- Click sur une heure → `/dashboard/add?type=bapteme-biplace&date=X&hour=X`
- Click sur un baptême → Dialog avec détails, catégories, prix, liste des participants avec liens vers réservations
- Affiche badges de catégories, nb places, moniteurs

---

## E-commerce

### Panier (`features/cart/`)

Panier session-based, 100% anonyme. Pas de compte client côté front.

**API — `GET /api/cart/items` (API key + session)**
- Liste les items du panier pour la session. Nettoie les items expirés.
- Calcule le total : acompte (dépôt en ligne) + solde (à payer sur place)
- Retourne : items[], totalAmount, depositAmount, remainingAmount

**API — `POST /api/cart/add` (API key + session)**
- Ajoute un item. Types supportés : STAGE, BAPTEME, GIFT_VOUCHER
- Pour STAGE/BAPTEME : vérifie disponibilité, crée une `TemporaryReservation` (1h)
- Pour GIFT_VOUCHER : peut ajouter en mode achat OU en mode utilisation (usedGiftVoucherCode)
- Valide les données participant (poids, taille, téléphone, email)
- Valide le voucher si `usedGiftVoucherCode` fourni

**API — `PATCH /api/cart/update/:id` (API key + session)**
- Mise à jour strict d'un item : participantData, quantité, option vidéo
- Recalcule le total du panier

**API — `DELETE /api/cart/remove/:id` (API key + session)**
- Supprime un item et libère les `TemporaryReservation` associées

**API — `DELETE /api/cart/clear` (API key + session)**
- Vide le panier complet et libère toutes les réservations temporaires

---

### Commandes / Orders (`features/orders/`)

**API — `POST /api/orders` (API key + session)**
- Crée une commande depuis le panier
- Cas 1 — Commande payante : crée un `PaymentIntent` Stripe, retourne `clientSecret`
- Cas 2 — Commande 100% bon cadeau : finalise directement (createBookings + clearCart + emails), retourne `orderId` sans Stripe
- Calcule : subtotal, discountAmount (bon cadeau ou promo), totalAmount, depositAmount par item
- Crée le `Client` (payeur) si nouveau
- *(V3)* : intégrer validation promo code → `promoCodeId` + `promoDiscountAmount`

**API — `GET /api/orders/:id` (API key)**
- Détail d'une commande avec items, paiements, allocations participant data

**API — `GET /api/orders` (admin)**
- Liste toutes les commandes avec search (numéro de commande, nom/email client)

**API — `PATCH /api/orders/:id/status` (admin)**
- Modifier le statut d'une commande

**API — `POST /api/orders/:id/final-payment` (admin)**
- Enregistrer le paiement du solde d'un item de commande (sur place)
- Marque `isFullyPaid: true` sur l'OrderItem

**UI Backoffice — Commandes (`/dashboard/commandes`)**
- Table searchable : numéro commande, client, date, items, montant, statut
- Statuts : PENDING, PAID, PARTIALLY_PAID, FULLY_PAID, CONFIRMED, CANCELLED, REFUNDED
- Search : numéro de commande, nom/email client (min 2 chars)
- Click lien externe → filtre les réservations par commande

---

### Paiements (`features/payments/`)

**API — `GET /api/payments` (admin)**
- Liste tous les paiements avec allocations par item
- Types : STRIPE (avec payment intent ID), MANUAL (avec méthode : CARD/BANK_TRANSFER/CASH/CHECK), GIFT_VOUCHER

**UI Backoffice — Paiements (`/dashboard/paiements`)**
- Table searchable : date, commande, client, type, statut, montant, allocations
- Copy button sur transaction Stripe
- Détail des allocations (quel item, quel montant, quelle activité)
- Note admin sur paiements manuels

---

### Réservations (`features/reservations/`)

Vue consolidée des réservations (stages + baptêmes).

**API — `GET /api/reservations` (monitor+)**
- Liste paginée + filtrable : type (STAGE/BAPTEME/ALL), statut, catégorie, plage de dates, search
- Retourne : participant, activité, commande, paiements reçus, montant restant

**API — `GET /api/reservations/:id` (monitor+)**
- Détail complet : participant, activité avec moniteurs, commande, paiements, allocations

**API — `POST /api/reservations/manual-payment` (admin)**
- Enregistre un paiement manuel (solde sur place ou autre)
- Méthodes : CARD, BANK_TRANSFER, CASH, CHECK
- Crée un `Payment` + `PaymentAllocation` + met à jour les montants

**API — `POST /api/reservations/stages` (admin)**
- Crée une réservation de stage directement (sans passer par le panier)

**UI Backoffice — Réservations (`/dashboard/reservations`)**
- Table filtrable avec pagination (URL params pour filtres)
- Filtres : search, type, statut, catégorie, plage de dates
- Colonnes : date création, type, date activité, participant, catégorie, commande, statut paiement, montants

**UI Backoffice — Détail Réservation (`/dashboard/reservations/[id]`)**
- Tab "Aujourd'hui" : stages + baptêmes du jour, bouton "Confirmer le solde final"
- Tab "Vue mensuelle" : navigation mois, stats (total stages, baptêmes, vidéos, clients uniques)
- Dialogue "Confirmer le solde final" : optionnel note admin, confirmation

---

### Webhook Stripe (`app/api/webhooks/stripe/route.ts`)

Route Next.js hard-codée (hors Hono).

- Écoute `payment_intent.succeeded` et `payment_intent.payment_failed`
- Idempotence via `ProcessedWebhookEvent` (évite le double-traitement)
- `payment_intent.succeeded` :
  1. Crée/met à jour le `Client` (payeur depuis metadata Stripe)
  2. Met à jour `Payment` → SUCCEEDED
  3. Alloue le paiement aux `OrderItem` via `allocatePaymentToOrderItems()`
  4. Crée `StageBooking` / `BaptemeBooking` pour chaque participant
  5. Génère les `GiftVoucher` pour les items GIFT_VOUCHER achetés
  6. Marque les vouchers utilisés (isUsed = true)
  7. Envoie emails (confirmation commande, notification admin, gift voucher)
  8. Vide le panier (`clearCart()`)
- `payment_intent.payment_failed` : Payment → FAILED, Order → CANCELLED

> ⚠️ V3 : consolider avec `lib/order-processing.ts` (duplication de logique actuelle)

---

## Bons Cadeaux

### Gift Vouchers (`features/giftvouchers/`)

Un bon cadeau = une place offerte pour une activité précise (STAGE ou BAPTEME, d'une catégorie spécifique). Format code : `GVSCP-XXXXXXXX-XXXX`. Validité 1 an. Usage unique.

**Flux achat :** Client achète un bon sur le front → `CartItem` type GIFT_VOUCHER → Stripe → webhook génère le `GiftVoucher` avec code → email au bénéficiaire

**Flux utilisation (actuel) :** Lors d'une réservation stage/bapteme, le client entre le code → cart add avec `usedGiftVoucherCode` → prix réduit à 0 → commande gratuite

**Flux utilisation (V3 — nouveau) :** Page dédiée `/utiliser-bon-cadeau` → saisie code → sélection créneau → réservation directe sans panier/Stripe

**API — `GET /api/giftvouchers` (admin)**
- Liste tous les bons : actifs, expirés, utilisés

**API — `GET /api/giftvouchers/:id` (admin)**
- Détail d'un bon cadeau

**API — `POST /api/giftvouchers` (admin)**
- Créer manuellement un bon (admin peut en créer sans passer par le shop)

**API — `PATCH /api/giftvouchers/:id` (admin)**
- Modifier un bon (avant utilisation)

**API — `POST /api/giftvouchers/validate` (API key)**
- Valider un code : vérifie existence, non-utilisé, non-expiré, non-réservé, type/catégorie compatible
- Retourne : `{ isValid, message, voucher? }`

**API — `POST /api/giftvouchers/reserve` (API key + session)**
- Réserver un bon dans un panier (empêche utilisation concurrente)

**API — `POST /api/giftvouchers/release` (API key + session)**
- Libérer un bon réservé (si retiré du panier)

**API — `GET /api/giftvouchers/price/:productType/:category` (API key)**
- Récupère le prix d'un bon pour un type/catégorie donnés

**UI Backoffice — Bons Cadeaux (`/dashboard/bons-cadeaux`)**
- Stats : bons actifs, utilisés, expirés (count + valeur totale)
- Grille de cards : code (masqué, toggle visibilité), produit, catégorie, expiration, bénéficiaire, acheteur
- Section "Utilisés" : collapsible, lien vers réservation
- Bouton "Créer un bon cadeau" → dialogue création manuelle

---

## Codes Promo

### PromoCode (`features/promocodes/`)

**Deux types de réduction :**
- `FIXED` : montant fixe (ex: 20€)
- `PERCENTAGE` : pourcentage avec plafond optionnel (ex: 15% max 50€)

**Règles supplémentaires :** montant minimum panier, limite d'utilisations, date d'expiration, code unique.

**API — `GET /api/promocodes` (admin)**
- Liste avec historique d'usage et info clients

**API — `GET /api/promocodes/:id` (admin)**
- Détail avec toutes les utilisations

**API — `POST /api/promocodes` (admin)**
- Créer : code, label?, recipientNote?, discountType, discountValue, maxDiscountAmount?, minCartAmount?, maxUses?, expiryDate?

**API — `PUT /api/promocodes/:id` (admin)**
- Modifier un code (si non encore utilisé)

**API — `DELETE /api/promocodes/:id` (admin)**
- Supprimer uniquement si jamais utilisé

**API — `POST /api/promocodes/validate` (public)**
- Valider un code et calculer la réduction pour un montant de panier donné
- Vérifie : actif, non-expiré, utilisations restantes, montant minimum

> ⚠️ **V3** : Brancher la validation côté front (checkout), passer `promoCodeId` à la création de commande

**UI Backoffice — Codes Promo (`/dashboard/codes-promo`)**
- Stats : actifs, utilisations totales, inactifs/expirés
- Table : code + copy, label, remise, règles, utilisations, expiration, statut (Actif, Expiré, Épuisé, Inactif)
- Bouton "Créer" → dialogue
- Edit (si non utilisé), Delete (désactivé si déjà utilisé)
- Statut auto-calculé : si `currentUses >= maxUses` → Épuisé ; si `expiryDate < now` → Expiré ; si `!isActive` → Inactif

---

## Clients & Stagiaires

### Clients (`features/clients/`)

Le client = la personne qui PAIE la commande.

**API — `GET /api/clients` (admin)**
- Liste paginée + triable + searchable : nom, prénom, email, téléphone, ville
- Retourne : infos contact, adresse, nb commandes

**API — `GET /api/clients/:id` (admin)**
- Détail avec toutes ses commandes et items

**API — `POST /api/clients` (API key)**
- Créer un client (appelé depuis le front lors de la création commande)

**UI Backoffice — Clients (`/dashboard/clients`)**
- Table sortable (nom, nb commandes, date inscription)
- Search (nom, email, téléphone, ville)
- Pagination avec sélecteur de taille (10/25/50/100)
- Badge "ancienne appli" si créé avant 2025-12-01
- Copy ID button
- Bouton "Ajouter un client" → dialogue
- Bouton "Exporter les clients" → dialogue

---

### Stagiaires (`features/stagiaires/`)

Le stagiaire = la personne qui PARTICIPE à l'activité (peut être différente du payeur).

**API — `GET /api/stagiaires` (monitor+)**
- Liste paginée + triable + searchable avec réservations

**API — `GET /api/stagiaires/:id` (monitor+)**
- Détail avec stages et baptêmes réservés

**API — `POST /api/stagiaires` (API key)**
- Créer/retrouver un stagiaire (upsert par email lors de la finalisation commande)

**UI Backoffice — Stagiaires (`/dashboard/stagiaires`)**
- Liste : nom, email, téléphone, mesures physiques, date naissance
- Bouton "Ajouter" → dialogue
- Bouton "Exporter" → dialogue

---

## Utilisateurs & Auth

### Users (`features/users/`)

**API — `GET /api/users` (admin)**
- Liste tous les utilisateurs (tous rôles)

**API — `GET /api/users/:id` (auth)**
- Détail d'un utilisateur

**API — `GET /api/users?role=:role` (monitor+)**
- Filtrer par rôle (ADMIN, MONITEUR, CUSTOMER)

**API — `PATCH /api/users/:id/role` (admin)**
- Modifier le rôle d'un utilisateur

**Auth — better-auth (`/api/auth/[...all]`)**
- `POST /api/auth/sign-in/email` — connexion
- `POST /api/auth/sign-up/email` — inscription
- `POST /api/auth/sign-out` — déconnexion
- Géré par better-auth, prioritaire sur le catch-all Hono

**UI Backoffice — Administrateurs (`/dashboard/administrators`)**
- Liste des utilisateurs ADMIN
- Modifier le rôle

**UI Backoffice — Moniteurs (`/dashboard/monitors`)**
- Liste des utilisateurs MONITEUR
- Modifier le rôle

**UI Backoffice — Compte (`/account`)**
- Nom, email, avatar
- Bouton "Se déconnecter"

---

## Disponibilités

### Availability (`features/availability/`)

**API — `POST /api/availability/check` (API key)**
- Vérifie disponibilité d'un stage ou baptême
- Retourne : available, availablePlaces, totalPlaces, confirmedBookings, temporaryReservations

**API — `GET /api/availability/stages/:id` (API key)**
- Disponibilité spécifique d'un stage

**API — `GET /api/availability/baptemes/:id` (API key)**
- Disponibilité spécifique d'un baptême

**API — `POST /api/availability/reserve` (API key)**
- Crée une `TemporaryReservation` (durée : 15 min)

**API — `DELETE /api/availability/release` (API key)**
- Libère une `TemporaryReservation`

**API — `POST /api/availability/months` (API key)**
- Mois disponibles pour une année donnée

**API — `POST /api/availability/periods` (API key)**
- Périodes disponibles avec comptages de places

---

## Tarifs & Pricing

### Tarifs (`features/tarifs/`)

**API — `GET /api/tarifs` (public)**
- Prix par catégorie baptême (AVENTURE, DUREE, LONGUE_DUREE, ENFANT, HIVER)

**API — `GET /api/tarifs/:category` (public)**
- Prix pour une catégorie de baptême

**API — `PATCH /api/tarifs/:category` (admin)**
- Modifier le prix d'une catégorie

**API — `GET /api/tarifs/video-option` (public)**
- Prix de l'option vidéo (ajouté sur les baptêmes)

**API — `PATCH /api/tarifs/video-option` (admin)**
- Modifier le prix de l'option vidéo

**API — `GET /api/tarifs/stages` (public)**
- Prix de base des stages par type

**API — `GET /api/tarifs/stages/:type` (public)**
- Prix de base pour un type de stage

**API — `PATCH /api/tarifs/stages/:type` (admin)**
- Modifier le prix de base d'un type de stage

**API — `GET /api/tarifs/bapteme-deposit` (public)**
- Montant de l'acompte baptême (défaut : 35€)

**API — `PATCH /api/tarifs/bapteme-deposit` (admin)**
- Modifier l'acompte baptême

**API — `GET /api/tarifs/min?type=X&subType=Y` (public)**
- Prix minimum pour un type/sous-type (utilisé sur le front pour afficher "à partir de X€")
- Réponse cachée

**UI Backoffice — Tarifs (`/dashboard/tarifs`)**
- Cards éditables par catégorie baptême (5 cartes)
- Card option vidéo
- Cards prix de base des stages (3 cartes : Initiation, Progression, Autonomie)
- Card acompte baptême
- Chaque card : input numérique + bouton save (loader pendant sauvegarde) + warning si non sauvegardé

---

## Contenu Site Web

### Content (`features/content/`)

**API — `GET /api/settings/topbar` (public)**
> ⚠️ Bug actuel : front appelle `/api/settings/topbar`, backoffice expose `/api/content/topbar`. À corriger en V3.

- Retourne la configuration de la topbar du site public

**API — `PATCH /api/settings/topbar` (admin)**
- Créer ou modifier la topbar

**Modèle TopBar :**
- `isActive` : afficher/masquer
- `title` : texte principal
- `secondaryText` : texte secondaire optionnel
- `ctaTitle` + `ctaLink` : bouton call-to-action
- `ctaIsFull` : bouton pleine largeur
- `ctaIsExternal` : lien externe (target blank)

**UI Backoffice — Contenu (`/dashboard/content`)**
- Formulaire de gestion de la topbar
- Aperçu en temps réel
- Toggle actif/inactif

---

## Marketing SMS

### Audiences (`features/audiences/`)

Segments de clients ciblés pour les campagnes SMS.

**Règles dynamiques :**
- `CLIENT_RESERVED_STAGE` — a payé un stage (par type, plage de dates)
- `CLIENT_RESERVED_BAPTEME` — a payé un baptême (par catégorie, plage de dates)
- `STAGIAIRE_STAGE` — a participé à un stage
- `STAGIAIRE_BAPTEME` — a participé à un baptême
- `PURCHASED_GIFT_VOUCHER` — a acheté un bon cadeau
- `ORDER_ABOVE_AMOUNT` — a passé une commande > X€

**API — `GET /api/audiences` (admin)**
**API — `GET /api/audiences/:id` (admin)**
**API — `GET /api/audiences/:id/resolve` (admin)** — Calcule les contacts réels de l'audience
**API — `GET /api/audiences/contacts/search?q=X` (admin)** — Recherche clients/stagiaires
**API — `POST /api/audiences` (admin)**
**API — `PUT /api/audiences/:id` (admin)**
**API — `DELETE /api/audiences/:id` (admin)**

**UI Backoffice — Audiences (`/dashboard/audiences`)**
- Cards : nom, description, nb règles, nb contacts manuels
- Aperçu règles (type, filtre, plage dates)
- Bouton "Voir les contacts" → résolution dynamique
- Edit / Delete

---

### Campagnes SMS (`features/campaigns/`)

**API — `GET /api/campaigns` (admin)**
**API — `GET /api/campaigns/:id` (admin)**
**API — `GET /api/campaigns/:id/resolve` (admin)** — Contacts ciblés avec dédoublonnage
**API — `POST /api/campaigns` (admin)**
- Créer : nom, contenu SMS (max 1600 chars), audiences[], scheduledAt?
- Option `generatePromoCode: true` → génère un code promo unique par destinataire lors de l'envoi

**API — `PUT /api/campaigns/:id` (admin)** — Uniquement si DRAFT ou SCHEDULED
**API — `POST /api/campaigns/:id/send` (admin)**
- Déclenche l'envoi : résolution des audiences, normalisation des numéros (E.164), envoi via Twilio
- Si `generatePromoCode: true` : génère un code `S{nanoid(6)}` par contact, personnalise le SMS
- Exécution en arrière-plan (async), logs dans `SmsCampaignLog`

**API — `DELETE /api/campaigns/:id` (admin)** — Uniquement si DRAFT

**UI Backoffice — Campagnes (`/dashboard/campagnes`)**
- Grid de cards : nom, statut, audiences, aperçu SMS, codes promo liés
- Actions : Créer, Edit (DRAFT only), Send (DRAFT only), Delete (DRAFT only)
- Dropdown "Contacts" : voir ciblage / voir rapport d'envoi
- Rapport : statut de livraison par destinataire (QUEUED/SENT/DELIVERED/FAILED)

---

## Dashboard & Stats

### Dashboard (`features/dashboard/`)

**API — `GET /api/dashboard/stats` (monitor+)**
- KPI : CA en ligne (Stripe) ce mois, CA total (Stripe + manuel) ce mois, CA total YTD
- Historique 13 mois (bar chart)
- Role-based : MONITEUR voit les stats globales mais pas les détails financiers

**API — `GET /api/dashboard/schedule` (monitor+)**
- Stages du jour + prochain stage à venir
- Baptêmes du jour + prochain baptême à venir
- Avec participants, paiements, moniteurs assignés

**UI Backoffice — Dashboard (`/dashboard`)**
- KPI cards : CA en ligne, CA total mois, CA total YTD
- Graphique 13 mois
- Planning du jour (stages + baptêmes) avec participants
- Click participant → page de réservation

---

## Front Public — Pages

### Réservations

**`/reserver`** — Hub de sélection produit
- Cards : Stages de Parapente, Baptêmes de l'Air, Bons Cadeaux
- Liens vers les flows respectifs

**`/reserver/stage`** — Flow réservation stage
1. Sélection catégorie (INITIATION / PROGRESSION / AUTONOMIE)
2. Sélection mois/année (appel `POST /api/availability/periods`)
3. Sélection créneau (appel `GET /api/stages` avec filtrage local)
4. Formulaire participant (nom, prénom, email, téléphone, poids, taille, date naissance)
5. Champ voucher optionnel (`POST /api/giftvouchers/validate`)
6. `POST /api/cart/add`

**`/reserver/bapteme`** — Flow réservation baptême
1. Sélection catégorie
2. Sélection mois/année
3. Sélection créneau
4. Formulaire participant + option vidéo (25€)
5. Champ voucher optionnel
6. `POST /api/cart/add`

**`/reserver/bon-cadeau`** — Achat de bon cadeau
1. Sélection produit (3 stages × catégorie + 5 baptêmes × catégorie)
2. Prix affiché dynamiquement (`GET /api/giftvouchers/price/:type/:category`)
3. Infos bénéficiaire (nom, email si notification souhaitée, message personnalisé)
4. Infos acheteur (nom, email)
5. `POST /api/cart/add` avec type GIFT_VOUCHER

**`/utiliser-bon-cadeau` *(V3 — à créer)***
- Flow dédié pour utiliser un bon cadeau sans passer par le shop

### Checkout

**`/checkout`** — Récapitulatif panier
- Chargement items (`GET /api/cart/items`)
- Édition données participant (`PATCH /api/cart/update/:id`)
- Champ code promo *(V3 — à brancher)*
- Validation bon cadeau (`POST /api/giftvouchers/validate`)
- Suppression items, vidage panier
- Bouton "Passer au paiement" → `POST /api/orders` → redirect `/checkout/payment?orderId=X`

**`/checkout/payment`** — Paiement Stripe
- Chargement commande (`GET /api/orders/:id`)
- Affichage : acompte à payer maintenant + solde à payer sur place
- Stripe Elements + `confirmPayment()`
- Redirect vers `/checkout/success?orderId=X`

**`/checkout/success`** — Confirmation
- Chargement commande (`GET /api/orders/:id`)
- Affichage récapitulatif complet
- Push event Google Analytics / GTM (`purchase`)
- Planning des paiements futurs

### Autres pages front

**`/blog`** — Articles (Sanity CMS)
**`/`** — Page d'accueil

---

## Dead Code à supprimer

| Élément | Emplacement | Raison |
|---------|-------------|--------|
| Feature `customers/` | `backoffice/src/features/customers/` | Remplacée par `clients/` + `stagiaires/`. Plus dans la nav. |
| Pages `customers` | `backoffice/src/app/(post-auth)/dashboard/customers/` | Pages orphelines, non accessibles |
| Import `CustomersAddForm` | `dashboard/add/page.tsx` ligne 14 | Import inutilisé |
| `POST /api/checkout/confirm` | `features/checkout/server/route.ts` | Jamais appelé (webhook gère tout) |
| `carte-cadeau/` | `apps/front/app/(public)/reserver/carte-cadeau/` | Fonctionnalité abandonnée |
| `giftCardAmount` | `prisma/schema.prisma` CartItem | Champ lié à GIFT_CARD supprimé |
| Références `GIFT_CARD` | `order-processing.ts`, `webhook/stripe/route.ts`, `payments-list.tsx` | Type supprimé |
| `SessionManager.migrateCartToUser()` | `apps/front/lib/sessionManager.ts` | Appelle une route inexistante |
| `SessionManager.getSessionInfo()` | `apps/front/lib/sessionManager.ts` | Appelle une route inexistante |
| `micro` | `apps/front/package.json` | Aucun import trouvé dans le projet |
| `allTimeHighPrice` | `prisma/schema.prisma` Stage | Remplacé par système promos V3 |
| `docs/architecture.md` — ref carte-cadeau | | Référence à supprimer |

---

## Bugs actifs

| Bug | Détail | Fix V3 |
|-----|--------|--------|
| TopBar cassée | Front appelle `/api/settings/topbar`, backoffice expose `/api/content/topbar` | Unifier le nom de route |
| Checkout ne charge pas le panier | `checkout/page.tsx` appelle `GET /api/cart/get`, route est `GET /api/cart/items` | Corriger l'URL dans le front |
| Update participant en checkout cassé | Front appelle `PATCH /api/cart/update` (sans `:id`), route requiert `PATCH /api/cart/update/:id` | Corriger l'URL dans le front |
| Duplication logique webhook/order-processing | `webhook/stripe/route.ts` redéfinit des fonctions déjà dans `lib/order-processing.ts` | Consolider dans order-processing.ts |

---

## Décisions de design V3

### 1. Système de promotions stages (remplace `allTimeHighPrice`)

Nouvelle table `StagePromotionHistory` + champs sur `Stage` :
- `promotionOriginalPrice Float?` — prix barré affiché si promo active
- `promotionEndDate DateTime?` — expiration auto
- `promotionReason String?` — label interne

Endpoint admin : `PATCH /api/stages/promotions`
- Bulk par IDs de stages OU plage de dates + type optionnel
- Crée une entrée d'historique par stage modifié
- Support reset (annuler la promo)

### 2. Page `/utiliser-bon-cadeau` (Option B — flow court-circuit)

Flow dédié sans panier :
1. Saisie du code → validation (`GET /api/giftvouchers/validate`)
2. Affichage infos du bon (catégorie, type, expiration)
3. Sélection du créneau (disponibilités filtrées sur le bon type/catégorie)
4. Formulaire participant
5. Confirmation → appel direct `POST /api/giftvouchers/redeem` (nouvelle route)
   - Crée la réservation sans Stripe
   - Marque le bon utilisé
   - Envoie email confirmation
6. Page de succès avec **section "Vous avez aimé ? Découvrez..."** :
   - Si baptême utilisé → suggest upgrade stage INITIATION
   - Si stage utilisé → suggest offrir un bon à quelqu'un
   - Toujours : CTA "Partager votre expérience" (Google Reviews)

### 3. Promo codes — intégration front (inclus dans V3)

Ajout d'un champ code promo dans `checkout/page.tsx` :
- Input + bouton "Appliquer"
- Appel `POST /api/promocodes/validate` → affiche la réduction
- Passe `promoCodeId` dans `POST /api/orders`
- Order creation calcule et stocke `promoDiscountAmount`

### 4. Refacto middleware (pattern RailFlow)

Structure `src/lib/middlewares/api/` :
- `app-context.ts` — type `AppEnv` partagé
- `require-auth.ts` — session better-auth
- `require-admin.ts` — rôle ADMIN
- `require-monitor.ts` — rôle ADMIN ou MONITEUR
- `require-api-key.ts` — header `x-api-key`
- `require-session-or-api-key.ts` — combinaison

### 5. Nomenclature REST (toutes les routes)

| Ancien | Nouveau |
|--------|---------|
| `GET /stages/getAll` | `GET /stages` |
| `GET /stages/getById/:id` | `GET /stages/:id` |
| `POST /stages/create` | `POST /stages` |
| `POST /stages/update` | `PUT /stages/:id` |
| `POST /stages/delete` | `DELETE /stages/:id` |
| (idem pour baptemes, clients, etc.) | |
| `POST /users/changeRole` | `PATCH /users/:id/role` |
| `GET /reservations/` | `GET /reservations` |
| `POST /reservations/manual-payment` | `POST /reservations/payments/manual` |
| `GET /dashboard/monitor-schedule` | `GET /dashboard/schedule` |

### 6. Approche : tout en une fois

La refactorisation et les nouvelles features se font en un seul passage. Les mêmes fichiers sont touchés dans les deux cas, faire deux rounds doublerait le risque et la durée.

### 7. Suppression de `Bapteme.date @unique`

Contrainte supprimée. Plusieurs baptêmes peuvent avoir lieu le même jour (créneaux différents). L'UI du planning et le calcul des disponibilités gèrent déjà plusieurs créneaux par jour.

### 8. Client.email requis

`Client.email String?` devient `Client.email String`. L'email est toujours collecté au checkout, il ne peut pas être null. Migration : les rares clients sans email (import legacy) reçoivent un placeholder `<unknown>@legacy.scp`.

### 9. RGPD — Consentement au checkout

Ajout de champs `rgpdConsentAt DateTime?` et `rgpdConsentIp String?` sur `Client` et `Stagiaire`.
- Checkout : case à cocher obligatoire "J'accepte de recevoir des communications de Serre Chevalier Parapente"
- Coché → stockage de la date et IP au moment de la commande
- Audiences SMS : filtre "contacts RGPD uniquement" + warning si ajout manuel de contacts non-consentis

### 10. ShortCode sur réservations

Ajout de `shortCode String? @unique` sur `StageBooking` et `BaptemeBooking`.
- Format : 8 caractères alphanum majuscules (ex: `SCP-X3K9`)
- Généré automatiquement à la création
- Script de migration pour les réservations existantes
- Affiché sur les emails de confirmation et dans le backoffice

### 11. Dashboard — Widget "Encaissements du jour" (Proposal A)

Nouveau widget sur la page `/dashboard` :
- Sections : "Encaissements Stripe aujourd'hui" + "Encaissements manuels aujourd'hui"
- Détail par paiement : montant, type, activité, participant
- Bouton "Enregistrer un paiement" raccourci

### 12. Dashboard — Graphique CA : ventilation acompte vs manuel

Le graphique 13 mois affiche actuellement le CA total. V3 :
- Barres empilées : acompte (Stripe) + paiements manuels (soldes sur place)
- Permet de visualiser le split en ligne / sur place

### 13. SMS — Améliorations UI campagne

Lors de la rédaction d'un SMS de campagne :
- **Bouton "Envoyer un SMS test"** : envoie le message au numéro de l'admin connecté
- **Compteur de segments** : affiche en temps réel `1 SMS (160 car.) / 2 SMS (306 car.)` + coût estimé
- **Prévisualisation mobile** : mockup d'un écran de téléphone avec le rendu du SMS
- **Estimation du coût total** : `X contacts × Y SMS × 0.05€ = Z€`

### 14. SMS — Filtre RGPD dans le builder d'audience

- Case à cocher "Inclure uniquement les contacts RGPD-consentis" (activée par défaut)
- Si décoché + contacts non-consentis inclus → warning orange visible avant envoi
- Contacts manuels sans flag RGPD : warning à l'ajout

### 15. Bon cadeau — Email d'expiration (J-30)

30 jours avant la date d'expiration d'un bon cadeau non utilisé :
- Envoi automatique d'un email au bénéficiaire via Resend
- Contenu : code, activité concernée, date d'expiration, lien vers `/utiliser-bon-cadeau`
- Implémentation : cron ou vérification quotidienne via Next.js cron route

### 16. Acompte par type de stage — Valeur par défaut

Ajout de `defaultAcomptePrice Float?` sur `StageBasePrice`.
- Permet de définir un acompte par défaut pour chaque type de stage (INITIATION, PROGRESSION, AUTONOMIE)
- Utilisé comme valeur pré-remplie lors de la création d'un stage
- Modifiable stage par stage (champ `Stage.acomptePrice` existant)
- UI : nouveau champ dans la page Tarifs pour chaque type de stage

### 17. Ghost orders — Nettoyage automatique

Commandes `PENDING` sans `clientId` depuis plus de 24h = "ghost orders" (abandon avant paiement).
- Implémentation : route Next.js `/api/cron/cleanup-ghost-orders` appelée quotidiennement
- Action : passage en statut `CANCELLED` (soft delete) + libération des réservations temporaires
- Logs dans la console pour suivi

### 18. Affichage du prix total dans le flow de réservation

Actuellement, le prix total n'est visible qu'au moment du paiement.
V3 : afficher clairement le prix total à chaque étape du flow :
- Sélection du créneau : "Stage INITIATION — 350€ (acompte 100€ à payer maintenant)"
- Récapitulatif panier : prix total par item + acompte + solde
- Le mot "acompte" n'apparaît qu'à l'étape paiement pour ne pas semer la confusion

---

*Document généré lors de l'analyse V3 — Mars 2026 | Mis à jour avec décisions finales*
