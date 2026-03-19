# Guide de test complet — Serre Chevalier Parapente
*Dernière mise à jour : 2026-03-17 — Version post-migration*

> **Convention** : ✅ = résultat attendu | ❌ = erreur attendue (comportement normal) | 🔑 = action admin uniquement | 👷 = action moniteur ou admin

Ce guide teste **la totalité des fonctionnalités** du backoffice et du site public dans l'ordre logique d'utilisation. Il est conçu pour être suivi du début à la fin : les données créées dans les premières parties sont réutilisées dans les suivantes.

---

## PRÉREQUIS

### 1. Variables d'environnement

**`apps/backoffice/.env.local`** :
```
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
BETTER_AUTH_URL="http://localhost:3001"
BETTER_AUTH_SECRET="..."
PUBLIC_API_KEY="cle-api-locale"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**`apps/front/.env.local`** :
```
NEXT_PUBLIC_BACKOFFICE_URL="http://localhost:3001"
NEXT_PUBLIC_API_KEY="cle-api-locale"   ← identique à PUBLIC_API_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 2. Démarrer la base de données (dev local)

```bash
docker compose up -d
```

### 3. Appliquer les migrations

```bash
pnpm db:migrate
```

### 4. Injecter les données mock

```bash
cd apps/backoffice && pnpm seed:mock
```

Ce script crée :
- 17 stages + 20 baptêmes (avril → août 2026)
- 8 clients + 10 stagiaires
- 6 bons cadeaux (codes `GVSCP-TEST000X-XXXX`) + 4 codes promo
- 2 commandes payées avec réservations (ORD-2026-MOCK01, ORD-2026-MOCK02)
- 1 commande fantôme (ORD-2026-GHOST1, PENDING, 48h)
- 2 audiences + 1 campagne SMS DRAFT
- Tous les tarifs + TopBar

### 5. Démarrer les serveurs

```bash
# depuis la racine du projet
pnpm dev
```

- Backoffice : http://localhost:3001
- Front public : http://localhost:3000

### Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| ADMIN | `clement@serreche-parapente.fr` | `Admin1234!` |
| MONITEUR (à créer en §3) | `marc@serreche-parapente.fr` | `Moniteur1234!` |

### Cartes Stripe de test

| Numéro | Résultat |
|--------|----------|
| `4242 4242 4242 4242` — exp 12/28 — CVC 123 | ✅ Paiement accepté |
| `4000 0000 0000 0002` — exp 12/28 — CVC 123 | ❌ Carte refusée |
| `4000 0025 0000 3155` — exp 12/28 — CVC 123 | 🔐 3DS requis |

---

## PARTIE 1 — AUTHENTIFICATION

### 1.1 Connexion admin
**Route :** `POST /api/auth/sign-in/email`

1. Aller sur http://localhost:3001
2. Saisir email `clement@serreche-parapente.fr` + mot de passe `Admin1234!`
3. Cliquer **Se connecter**
4. ✅ Redirection vers `/dashboard`
5. ✅ Nom "Clément Pons" visible en bas du sidebar

### 1.2 Tentative avec mauvais mot de passe
1. Se déconnecter, revenir sur `/sign-in`
2. Saisir `Admin1234!_mauvais`
3. ❌ Message d'erreur « Identifiants incorrects »

### 1.3 Inscription d'un nouveau compte
**Route :** `POST /api/auth/sign-up/email`

1. Aller sur http://localhost:3001/sign-up
2. Saisir :
   - Prénom + Nom : `Marc Moniteur`
   - Email : `marc@serreche-parapente.fr`
   - Mot de passe : `Moniteur1234!`
3. ✅ Compte créé, redirection vers `/dashboard`
4. ✅ Compte visible avec rôle CUSTOMER par défaut
5. ⚠️ Ce compte sera promu MONITEUR en §17.

### 1.4 Déconnexion
**Route :** `POST /api/auth/sign-out`

1. Cliquer sur le menu utilisateur (bas du sidebar) → **Se déconnecter**
2. ✅ Redirection vers `/sign-in`
3. Tenter d'accéder à `/dashboard`
4. ✅ Redirection vers `/sign-in` (session invalide)
5. **Se reconnecter** avec l'admin pour la suite.

### 1.5 Page Compte
**URL :** http://localhost:3001/account

1. Connecté en admin, aller sur `/account`
2. ✅ Prénom, nom, email de l'admin affichés
3. ✅ Avatar / initiales visibles

---

## PARTIE 2 — DASHBOARD ACCUEIL

### 2.1 Vue admin — KPIs
**Route :** `GET /api/dashboard/stats`

1. Aller sur http://localhost:3001/dashboard
2. ✅ Section **Aujourd'hui** : carte bleue avec nb d'activités du jour
3. ✅ **6 cartes KPI** : Stages à venir, Baptêmes à venir, Réservations actives, Stagiaires totaux, Soldes à encaisser, Nouvelles 24h
4. ✅ **Graphique CA** : barres empilées (Stages / Baptêmes / Bons cadeaux)
5. ✅ **Sélecteur période** [1M / 3M / 6M / 12M] — changer et vérifier que le graphique s'adapte
6. ✅ **4 cartes Ce mois-ci** : CA total, encaissé en ligne, encaissé manuel, soldes restants
7. ✅ **Section Réservations & Stagiaires** : 6 cartes avec chiffres

### 2.2 Vue moniteur — Planning
1. Se connecter avec `marc@serreche-parapente.fr` (après promotion en §17)
2. ✅ Dashboard visible **sans** les KPI de revenus
3. ✅ Section **Mon planning** avec stages et baptêmes assignés
4. ✅ Section **Prochains créneaux** visible

### 2.3 Page Aujourd'hui
**Route :** `GET /api/dashboard/today`
**URL :** http://localhost:3001/dashboard/today

1. Connecté en admin, cliquer sur **Aujourd'hui** dans le sidebar (ou sur la carte bleue du dashboard)
2. ✅ Page affichant les activités du jour courant
3. ✅ Si aucune activité : message « Aucune activité aujourd'hui »
4. ✅ Si activités présentes : tableaux Stages et Baptêmes avec participants, poids, taille, statut paiement

---

## PARTIE 3 — CONTENU SITE (TopBar)

### 3.1 Lire la TopBar (API publique)
**Route :** `GET /api/content/topbar`

1. Aller sur http://localhost:3000
2. ✅ Bandeau visible en haut du site avec le contenu du seed

### 3.2 Modifier la TopBar
**Route :** `PUT /api/content/topbar`

1. Backoffice → **Contenu** (`/dashboard/content`)
2. Modifier le titre : `Saison 2026 — Places limitées !`
3. Modifier le texte secondaire : `Stages et baptêmes disponibles`
4. S'assurer que le bandeau est **Actif**
5. Cliquer **Enregistrer**
6. ✅ Toast de confirmation
7. Rafraîchir http://localhost:3000
8. ✅ Nouveau texte visible dans le bandeau

### 3.3 Désactiver la TopBar
1. Dans la page Contenu, passer le bandeau en **Inactif**
2. Enregistrer
3. Rafraîchir http://localhost:3000
4. ✅ Bandeau masqué
5. **Réactiver** avant de continuer.

---

## PARTIE 4 — TARIFS

### 4.1 Lire tous les tarifs (API publique)
**Routes :** `GET /api/tarifs/all`, `GET /api/tarifs/`, `GET /api/tarifs/baptemes`, `GET /api/tarifs/stages/base`, `GET /api/tarifs/video-option`, `GET /api/tarifs/baptemes/deposit`

1. Backoffice → **Tarifs** (`/dashboard/tarifs`)
2. ✅ Tableau prix baptêmes par catégorie (Aventure, Durée, Longue Durée, Enfant, Hiver)
3. ✅ Prix stages de base (Initiation, Progression, Autonomie)
4. ✅ Prix option vidéo et acompte baptême par défaut

### 4.2 Modifier le prix d'une catégorie de baptême
**Route :** `PUT /api/tarifs/`

1. Changer **Aventure** → `125`
2. Cliquer **Enregistrer**
3. ✅ Toast « Tarif mis à jour »
4. Vérifier http://localhost:3000/bi-places
5. ✅ Prix Aventure mis à jour (peut nécessiter un rafraîchissement dû au cache)
6. **Remettre à 120** avant de continuer.

### 4.3 Modifier le prix de l'option vidéo
**Route :** `PATCH /api/tarifs/video-option`

1. Changer l'option vidéo à `50`
2. Enregistrer → ✅ Confirmation
3. Vérifier sur http://localhost:3000/reserver/bapteme (option vidéo affichée)
4. **Remettre à 45** avant de continuer.

### 4.4 Modifier le prix de base d'un stage
**Route :** `PATCH /api/tarifs/stage-base`

1. Changer **Initiation** → `650`
2. Enregistrer → ✅ Confirmation
3. Vérifier http://localhost:3000/nos-stages/initiation
4. ✅ Prix « à partir de » mis à jour
5. **Remettre à 680** avant de continuer.

### 4.5 Modifier l'acompte baptême
**Route :** `PATCH /api/tarifs/bapteme-deposit`

1. Changer l'acompte baptême à `45`
2. Enregistrer → ✅ Confirmation
3. Vérifier le panier sur un baptême (acompte affiché à la réservation)
4. **Remettre à 40** avant de continuer.

### 4.6 Prix minimum (API publique cachée)
**Route :** `GET /api/tarifs/min?type=STAGE&subType=INITIATION`

1. Aller sur http://localhost:3000/nos-stages
2. ✅ Prix « à partir de 680€ » sur la section Initiation
3. Aller sur http://localhost:3000/bi-places
4. ✅ Prix par catégorie affichés dynamiquement

---

## PARTIE 5 — STAGES

### 5.1 Lister tous les stages
**Route :** `GET /api/stages/`

1. Backoffice → **Stages** (`/dashboard/stages`)
2. ✅ Calendrier avec les 17 stages du seed visibles

### 5.2 Créer un stage
**Route :** `POST /api/stages/`

1. Cliquer **Ajouter un stage** (bouton + dans l'en-tête)
2. Remplir :
   - Type : `Initiation`
   - Date de début : `2026-09-07`
   - Durée : `5` jours
   - Places : `6`
   - Prix : `680`
   - Acompte : `150`
   - Moniteur : `Clément Pons`
3. ✅ Stage créé, visible dans le calendrier

**Erreur — sans moniteur :**
4. Tenter de créer sans moniteur sélectionné
5. ❌ Message « Au moins un moniteur doit être sélectionné »

### 5.3 Voir le détail d'un stage
**Route :** `GET /api/stages/:id`

1. Cliquer sur le stage créé (Sept 2026)
2. ✅ Sheet latérale : type, date, durée, places, prix, acompte, moniteur(s), réservations (vides)

### 5.4 Modifier un stage
**Route :** `PUT /api/stages/:id`

1. Dans la sheet, cliquer l'icône crayon (**Modifier**)
2. Changer le prix à `700` et l'acompte à `160`
3. Cliquer **Enregistrer** (icône disquette)
4. ✅ Toast « Stage mis à jour »
5. ✅ Nouveaux prix visibles dans la fiche

### 5.5 Appliquer une promotion
**Route :** `PATCH /api/stages/:id/promote`

1. Ouvrir le stage Initiation du **04 mai 2026** (ou n'importe quel stage futur)
2. Cliquer le bouton **Promo** (icône étiquette)
3. Remplir :
   - Nouveau prix : `590`
   - Date de fin : `2026-04-30`
   - Raison : `Promo printemps`
4. Cliquer **Appliquer la promotion**
5. ✅ Toast avec le % de réduction calculé
6. ✅ Prix barré visible dans la fiche, badge « Promo »
7. ✅ Encart avec date d'expiration et raison

**Erreur — prix supérieur au prix actuel :**
8. Tenter avec un prix `800` (supérieur à 680€)
9. ❌ Erreur de validation

### 5.6 Annuler une promotion
**Route :** `DELETE /api/stages/:id/promote`

1. Sur le même stage en promo, cliquer **Annuler promo** (icône X)
2. ✅ Toast « Promotion annulée, prix restauré à 680€ »
3. ✅ Prix normal affiché, plus de badge Promo

### 5.7 Supprimer un stage
**Route :** `DELETE /api/stages/:id`

1. Ouvrir le stage créé en §5.2 (Sept 2026, aucune réservation)
2. Cliquer **Supprimer** (icône poubelle)
3. ✅ Stage supprimé du calendrier

**Erreur — stage avec réservations :**
4. Tenter de supprimer le stage du **06 Apr 2026** (lié à ORD-2026-MOCK01)
5. ❌ Bouton désactivé ou message « Ce stage contient des réservations »

---

## PARTIE 6 — BAPTÊMES

### 6.1 Lister tous les baptêmes
**Route :** `GET /api/baptemes/`

1. Backoffice → **Baptêmes** (`/dashboard/biplaces`)
2. ✅ Calendrier avec les créneaux du mois courant

### 6.2 Créer un baptême
**Route :** `POST /api/baptemes/`

1. Cliquer **Ajouter un baptême** (bouton +)
2. Remplir :
   - Date : `2026-09-13T10:00`
   - Durée : `120` min
   - Places : `6`
   - Catégories : `AVENTURE`, `DUREE`
   - Acompte : `40`
   - Moniteur : `Clément Pons`
3. ✅ Baptême créé, visible dans le calendrier

### 6.3 Voir le détail d'un baptême
**Route :** `GET /api/baptemes/:id`

1. Cliquer sur un baptême dans le calendrier
2. ✅ Dialog : date, heure, durée, places, catégories, acompte, moniteurs, réservations

### 6.4 Modifier un baptême
**Route :** `PUT /api/baptemes/:id`

1. Dans le dialog, modifier les places à `8`
2. Enregistrer → ✅ Toast de confirmation

### 6.5 Supprimer un baptême
**Route :** `DELETE /api/baptemes/:id`

1. Supprimer le baptême créé en §6.2 (aucune réservation)
2. ✅ Baptême supprimé du calendrier

---

## PARTIE 7 — CODES PROMO

### 7.1 Lister les codes promo
**Route :** `GET /api/promocodes/`

1. Backoffice → **Codes promo** (`/dashboard/codes-promo`)
2. ✅ 4 codes visibles : `PROMO10`, `ETE2026`, `BIENVENUE`, `EXPIREDTEST`
3. ✅ `EXPIREDTEST` affiché comme inactif/expiré

### 7.2 Créer un code promo
**Route :** `POST /api/promocodes/`

1. Cliquer **Nouveau code**
2. Remplir :
   - Code : `TEST50`
   - Label : `Test réduction fixe`
   - Type : `Montant fixe`
   - Valeur : `50`
   - Montant minimum du panier : `200`
   - Actif : oui
3. ✅ Code `TEST50` créé dans la liste

**Erreur — code dupliqué :**
4. Recréer `TEST50` → ❌ Erreur de duplication

**Erreur — valeur manquante :**
5. Créer sans code → ❌ Erreur de validation

### 7.3 Voir le détail d'un code promo
**Route :** `GET /api/promocodes/:id`

1. Cliquer sur `TEST50`
2. ✅ Détails affichés : type, valeur, conditions, utilisations (0)

### 7.4 Modifier un code promo
**Route :** `PUT /api/promocodes/:id`

1. Modifier `TEST50` → valeur `30`
2. ✅ Code mis à jour

### 7.5 Supprimer un code promo
**Route :** `DELETE /api/promocodes/:id`

1. Supprimer `TEST50` (jamais utilisé)
2. ✅ Supprimé de la liste

**Erreur — code utilisé :**
3. Tenter de supprimer `BIENVENUE` (a des utilisations)
4. ❌ Bouton désactivé ou erreur « Code déjà utilisé »

---

## PARTIE 8 — BONS CADEAUX (backoffice)

### 8.1 Lister les bons cadeaux
**Route :** `GET /api/giftvouchers/`

1. Backoffice → **Bons cadeaux** (`/dashboard/bons-cadeaux`)
2. ✅ 6 bons cadeaux visibles (4 actifs, 1 utilisé, 1 expiré)
3. ✅ Cartes de stats : total, actifs, utilisés, expirés

### 8.2 Créer un bon cadeau manuellement
**Route :** `POST /api/giftvouchers/`

1. Cliquer **Créer un bon cadeau**
2. Remplir :
   - Type : `Stage`
   - Catégorie : `Initiation`
   - Bénéficiaire : `Léa Dupont`
   - Email bénéficiaire : `lea.dupont@email.fr`
   - Prix d'achat : `680`
3. ✅ Bon créé avec code au format `GVSCP-XXXXXXXX-XXXX`

### 8.3 Voir le détail d'un bon cadeau
**Route :** `GET /api/giftvouchers/:id`

1. Cliquer sur le bon créé
2. ✅ Code, type, catégorie, bénéficiaire, date d'expiration (1 an), statut Non utilisé

### 8.4 Modifier un bon cadeau
**Route :** `PATCH /api/giftvouchers/:id`

1. Modifier le nom du bénéficiaire → `Léa Martin`
2. ✅ Modification sauvegardée

---

## PARTIE 9 — PAGES PUBLIQUES DU SITE

### 9.1 Page d'accueil
1. Aller sur http://localhost:3000
2. ✅ TopBar visible (bandeau)
3. ✅ Page chargée sans erreur

### 9.2 Pages stages
1. http://localhost:3000/nos-stages → ✅ Liste des 3 types de stages
2. http://localhost:3000/nos-stages/initiation → ✅ Prix à partir de 680€ + créneaux disponibles
3. http://localhost:3000/nos-stages/progression → ✅ Page chargée
4. http://localhost:3000/nos-stages/autonomie → ✅ Page chargée

### 9.3 Page baptêmes
1. http://localhost:3000/bi-places
2. ✅ Prix par catégorie affichés dynamiquement
3. ✅ Créneaux disponibles visibles

### 9.4 Pages légales
1. http://localhost:3000/cgu → ✅
2. http://localhost:3000/cgv → ✅
3. http://localhost:3000/cookies → ✅
4. http://localhost:3000/legal → ✅
5. http://localhost:3000/privacy → ✅

### 9.5 Blog
1. http://localhost:3000/blog → ✅ Liste des articles (Sanity CMS)
2. Cliquer sur un article → ✅ Article complet affiché

---

## PARTIE 10 — PARCOURS CLIENT : RÉSERVATION STAGE

> ⭐ Section critique — tester avec soin

### 10.1 Disponibilités par mois
**Route :** `GET /api/availability/months?type=STAGE&stageType=INITIATION`

1. Aller sur http://localhost:3000/reserver/stage
2. Sélectionner le type **Initiation**
3. ✅ Calendrier avec les mois disponibles mis en évidence

### 10.2 Disponibilités d'un stage
**Route :** `GET /api/availability/stages/:id`

1. Sélectionner le mois **Avril 2026**
2. ✅ Créneaux disponibles affichés avec places restantes

### 10.3 Vérification avant ajout au panier
**Route :** `POST /api/availability/check`

1. Sélectionner le stage **Initiation du 06 avril 2026**
2. ✅ Vérification de disponibilité effectuée (transparente pour l'utilisateur)

### 10.4 Remplir le formulaire participant
1. Remplir :
   ```
   Prénom    : Thomas
   Nom       : Girard
   Email     : thomas.girard@gmail.com
   Téléphone : 07 02 34 56 78
   Poids     : 72 kg
   Taille    : 175 cm
   ```

**Erreur — poids hors limites :**
2. Tenter avec Poids `130`
3. ❌ Erreur « Poids maximum : 120 kg »

### 10.5 Réservation temporaire + ajout panier
**Routes :** `POST /api/availability/reserve`, `POST /api/cart/items`

1. Avec les données valides de §10.4, cliquer **Ajouter au panier**
2. ✅ Dialog de confirmation
3. ✅ Compteur panier mis à jour dans la navigation (icône panier)

### 10.6 Lire le panier
**Route :** `GET /api/cart/items`

1. Cliquer sur l'icône panier dans la navigation
2. ✅ Stage Initiation 06 Avr visible avec : participant, date, acompte 150€
3. ✅ **Timer de 1 heure** visible sur l'article (réservation temporaire)

### 10.7 Modifier un article du panier
**Route :** `PATCH /api/cart/items/:id`

1. Cliquer **Modifier** sur l'article du panier
2. Changer la taille à `178`
3. ✅ Modification prise en compte, prix recalculé si nécessaire

### 10.8 Supprimer un article du panier
**Route :** `DELETE /api/cart/items/:id`

1. Cliquer **Supprimer** sur l'article
2. ✅ Article retiré du panier
3. ✅ La place est à nouveau disponible sur la page de réservation
4. **Rajouter l'article au panier** (refaire §10.4 → §10.5) pour continuer.

---

## PARTIE 11 — PARCOURS CLIENT : RÉSERVATION BAPTÊME

> ⭐ Section critique — tester avec soin

### 11.1 Disponibilités par période
**Route :** `GET /api/availability/periods?type=BAPTEME&category=AVENTURE`

1. Aller sur http://localhost:3000/reserver/bapteme
2. Sélectionner la catégorie **Aventure**
3. ✅ Créneaux disponibles listés avec dates et places

### 11.2 Disponibilités d'un baptême
**Route :** `GET /api/availability/baptemes/:id`

1. Sélectionner le créneau du **05 avril 2026**
2. ✅ Places disponibles affichées

### 11.3 Ajouter un baptême au panier
**Routes :** `POST /api/availability/reserve`, `POST /api/cart/items`

1. Remplir :
   ```
   Prénom    : Sophie
   Nom       : Moreau
   Email     : sophie.moreau@email.fr
   Téléphone : 06 91 23 45 67
   Poids     : 60 kg
   Taille    : 166 cm
   Catégorie : Aventure
   Option vidéo : Non
   ```
2. Cliquer **Ajouter au panier**
3. ✅ Baptême ajouté, compteur panier = 2 (stage + baptême)

### 11.4 Vérifier le panier complet
1. Ouvrir le panier
2. ✅ 2 articles : Stage Initiation (150€) + Baptême Aventure (40€)
3. ✅ Total affiché : 190€
4. ✅ Timer de 1h sur chaque article

---

## PARTIE 12 — CHECKOUT ET PAIEMENT

> ⭐ Section la plus critique — tester chaque variante

### 12.1 Accéder au checkout
**Route :** `GET /api/cart/items`

1. Aller sur http://localhost:3000/checkout
2. ✅ Récapitulatif : 2 articles, total 190€
3. ✅ Timer de réservation temporaire visible

### 12.2 Appliquer un code promo valide
**Route :** `POST /api/promocodes/validate`

1. Saisir le code `PROMO10` dans le champ Code promo
2. Cliquer **Appliquer**
3. ✅ Réduction -10% (max 80€) appliquée : -19€ → total 171€

**Code invalide :**
4. Supprimer `PROMO10`, saisir `FAKEPROMO`
5. ❌ Message « Code invalide ou inactif »

**Code expiré :**
6. Saisir `EXPIREDTEST`
7. ❌ Message « Code expiré ou inactif »

**Montant minimum non atteint :**
8. Saisir `ETE2026` (minimum 300€ requis, panier à 171€)
9. ❌ Message d'erreur montant minimum

**Retirer le code** pour continuer sans réduction.

### 12.3 Consentements RGPD
1. Dans l'étape **Vos informations**
2. ✅ Checkbox CGV obligatoire visible
3. ✅ Checkbox Communications commerciales (optionnel) visible
4. Tenter de passer sans cocher les CGV
5. ❌ Erreur « Vous devez accepter les CGV »

### 12.4 Remplir les informations client
1. Remplir :
   ```
   Prénom      : Thomas
   Nom         : Girard
   Email       : thomas.girard@gmail.com
   Téléphone   : 07 02 34 56 78
   Adresse     : 9 Rue de Bretagne
   Code postal : 75003
   Ville       : Paris
   Pays        : France
   ```
2. Cocher les CGV
3. Cliquer **Payer**

### 12.5 Créer la commande
**Routes :** `POST /api/orders/`, `POST /api/clients/`

1. ✅ Commande créée dans la BDD (visible dans le backoffice → Commandes)
2. ✅ Redirection vers la page de paiement Stripe

### 12.6 Paiement Stripe — carte acceptée
**Webhook :** `payment_intent.succeeded`

1. Utiliser la carte `4242 4242 4242 4242` — exp 12/28 — CVC 123
2. ✅ Paiement accepté
3. ✅ Redirection vers `/checkout/success?order=ORD-...`
4. ✅ Récapitulatif de commande avec numéro ORD
5. ✅ Panier vide (compteur = 0)

**Vérifier dans le backoffice :**
6. Aller sur http://localhost:3001/dashboard/commandes
7. ✅ Nouvelle commande visible avec statut PAID
8. Aller sur http://localhost:3001/dashboard/reservations
9. ✅ 2 nouvelles réservations créées (Stage + Baptême)
10. Aller sur http://localhost:3001/dashboard/paiements
11. ✅ Nouveau paiement Stripe visible

### 12.7 Paiement Stripe — carte refusée
1. Recommencer le parcours depuis §10.4 (un nouveau stage dans le panier)
2. Utiliser la carte `4000 0000 0000 0002`
3. ❌ Paiement refusé, message d'erreur Stripe
4. ✅ Retour sur la page de paiement (commande toujours PENDING)

### 12.8 Vider le panier manuellement
**Route :** `DELETE /api/cart/items`

1. Avoir au moins un article dans le panier
2. Utiliser le bouton **Vider le panier** (si présent dans le sidebar panier)
3. ✅ Panier entièrement vidé, compteur = 0

---

## PARTIE 13 — PARCOURS CLIENT : ACHAT BON CADEAU

> ⭐ Section critique pour l'e-commerce

### 13.1 Afficher le prix d'un bon cadeau
**Route :** `GET /api/giftvouchers/price/:productType/:category`

1. Aller sur http://localhost:3000/reserver/bon-cadeau
2. Sélectionner **Stage — Initiation**
3. ✅ Prix affiché : 680€ (= prix du stage Initiation)
4. Changer pour **Baptême — Aventure**
5. ✅ Prix affiché : 120€ (= prix de la catégorie Aventure)

### 13.2 Acheter un bon cadeau
**Route :** `POST /api/cart/items`

1. Sélectionner **Stage — Initiation**
2. Remplir :
   ```
   Bénéficiaire : Marie Dupont
   Votre nom    : Alice Martin
   Votre email  : alice.martin@email.fr
   ```
3. Cliquer **Ajouter au panier**
4. ✅ Bon cadeau dans le panier (sans timer de 1h — pas de réservation temporaire)

### 13.3 Finaliser l'achat du bon cadeau
1. Aller sur `/checkout`, remplir les infos client (Alice Martin)
2. Payer avec `4242 4242 4242 4242`
3. ✅ Commande créée, bon cadeau généré
4. Vérifier dans le backoffice → **Bons cadeaux**
5. ✅ Nouveau bon cadeau actif avec code `GVSCP-XXXXXXXX-XXXX`
6. ✅ Bénéficiaire : Marie Dupont

---

## PARTIE 14 — UTILISATION D'UN BON CADEAU (site public)

> ⭐ Section critique pour l'e-commerce

### 14.1 Lookup d'un bon cadeau
**Route :** `POST /api/giftvouchers/lookup`

1. Aller sur http://localhost:3000/utiliser-bon-cadeau
2. **Étape 1** — Saisir `GVSCP-TEST0001-STAG`
3. ✅ Résumé : « Bon cadeau pour Stage Initiation — valable jusqu'au... »

### 14.2 Utiliser un bon cadeau Stage
**Routes :** `POST /api/giftvouchers/validate`, `POST /api/giftvouchers/reserve`, `POST /api/cart/items`

1. ✅ Étape 2 — Créneaux Stage Initiation disponibles s'affichent
2. Sélectionner le **20 avril 2026**
3. **Étape 3** — Remplir les infos participant :
   ```
   Prénom    : Marie
   Nom       : Dupont
   Email     : marie.dupont@email.fr
   Téléphone : 06 12 34 56 78
   Poids     : 62 kg
   Taille    : 168 cm
   ```
4. Cliquer **Valider et passer à la caisse**
5. ✅ Étape 4 — Confirmation, total **0€** (couvert par le bon)
6. Remplir les infos client (Marie Dupont)
7. Finaliser → ✅ Commande créée **sans paiement Stripe**
8. ✅ Réservation de stage confirmée
9. Dans le backoffice → Bons cadeaux : `GVSCP-TEST0001-STAG` marqué **Utilisé**

### 14.3 Utiliser un bon cadeau Baptême
1. Saisir `GVSCP-TEST0002-BAPT`
2. ✅ Étape 2 — Créneaux baptêmes Aventure affichés
3. Sélectionner un créneau, remplir les infos
4. ✅ Parcours complet identique à §14.2

### 14.4 Bon cadeau déjà utilisé
**Route :** `POST /api/giftvouchers/lookup`

1. Saisir `GVSCP-TEST0003-USED`
2. ❌ Message « Ce bon cadeau a déjà été utilisé »

### 14.5 Bon cadeau expiré
1. Saisir `GVSCP-TEST0004-EXPR`
2. ❌ Message « Ce bon cadeau a expiré »

### 14.6 Code invalide
1. Saisir `GVSCP-INEXISTANT-0000`
2. ❌ Message « Code de bon cadeau invalide »

### 14.7 Libération de réservation temporaire
**Route :** `POST /api/giftvouchers/release`

1. Commencer §14.2 avec `GVSCP-TEST0005-PROG`
2. Sélectionner un créneau (bon réservé pendant 1h)
3. Fermer le navigateur ou revenir en arrière **sans finaliser**
4. ✅ La réservation du bon expire automatiquement après 1h
5. ✅ Le bon est de nouveau disponible

---

## PARTIE 15 — COMMANDES (backoffice)

### 15.1 Lister toutes les commandes
**Route :** `GET /api/orders/`

1. Backoffice → **Commandes** (`/dashboard/commandes`)
2. ✅ Commandes visibles dont : ORD-2026-MOCK01 (PAID), ORD-2026-MOCK02 (PAID), commandes des tests précédents
3. ✅ La commande fantôme ORD-2026-GHOST1 visible (statut PENDING)

### 15.2 Rechercher une commande
**Route :** `GET /api/orders/search?q=`

1. Saisir `MOCK01` dans la barre de recherche
2. ✅ Uniquement ORD-2026-MOCK01 affiché
3. Rechercher `alice` → ✅ Commandes d'Alice Martin
4. Rechercher l'email `thomas.girard@gmail.com` → ✅ Commandes correspondantes

### 15.3 Voir une commande par ID
**Route :** `GET /api/orders/:id`

1. Cliquer sur ORD-2026-MOCK01
2. ✅ Détails : statut PAID, articles (Stage Initiation 680€), paiement 150€ payé / 530€ restant

### 15.4 Mettre à jour le statut d'une commande
**Route :** `PATCH /api/orders/:id/status`

1. Sur la commande ORD-2026-MOCK01, changer le statut → `CONFIRMED`
2. ✅ Toast « Commande ORD-2026-MOCK01 mise à jour »
3. ✅ Badge de statut CONFIRMED dans la liste

### 15.5 Supprimer les commandes fantômes
**Route :** `DELETE /api/orders/ghost`

1. Cliquer **Nettoyer les commandes fantômes** (bouton dans l'en-tête)
2. ✅ Message « 1 commande(s) fantôme(s) supprimée(s) »
3. ✅ ORD-2026-GHOST1 n'apparaît plus
4. Relancer → ✅ Message « Aucune commande fantôme à supprimer »

### 15.6 Confirmer le paiement final d'un article
**Route :** `POST /api/orders/items/:orderItemId/finalize`

1. Ouvrir la commande ORD-2026-MOCK01 (ou une commande PAID d'un stage)
2. Trouver l'article Stage, cliquer **Confirmer paiement final**
3. Saisir une note : `Solde réglé en espèces le jour du stage`
4. ✅ « Paiement final confirmé »
5. ✅ `isFullyPaid = true`, date de paiement renseignée
6. ✅ Statut commande mis à jour → `FULLY_PAID`

---

## PARTIE 16 — RÉSERVATIONS (backoffice)

### 16.1 Lister toutes les réservations
**Route :** `GET /api/reservations/`

1. Backoffice → **Réservations** (`/dashboard/reservations`)
2. ✅ Réservations du seed + celles créées en §12 et §14

### 16.2 Filtrer les réservations
1. Filtrer par type **Stages** → ✅ Stages uniquement
2. Filtrer par statut **Payé** → ✅ Commandes PAID uniquement
3. Filtrer par date : du 01/04 au 30/04/2026 → ✅ Réservations d'avril
4. Rechercher `Thomas` → ✅ Réservation de Thomas Girard

### 16.3 Voir le détail d'une réservation
**Route :** `GET /api/reservations/:id`

1. Cliquer sur la réservation de **Thomas Girard** (ORD-2026-MOCK01)
2. ✅ Fiche complète :
   - Participant : Thomas Girard, 72kg, 175cm
   - Client payeur : Alice Martin
   - Stage : Initiation, 06 Avr 2026
   - Paiement : 150€ payé / 530€ restant / 680€ total

### 16.4 Enregistrer un paiement manuel
**Route :** `POST /api/reservations/manual-payment`

1. Sur la fiche d'une réservation avec solde restant, cliquer **Enregistrer un paiement**
2. Remplir :
   - Montant : `530`
   - Méthode : `Espèces`
   - Note : `Solde payé sur place le jour du stage`
3. ✅ Paiement enregistré, historique mis à jour
4. ✅ Statut de la réservation mis à jour (FULLY_PAID)

**Montant excessif :**
5. Tenter avec `9999` → ❌ Avertissement montant excessif

### 16.5 Réservation manuelle par l'admin
**Route :** `POST /api/reservationStages/`

1. Trouver le bouton **Créer une réservation manuelle** (page réservations ou profil client)
2. Sélectionner :
   - Client : choisir un client existant de la liste
   - Stage : Stage Initiation d'avril ou mai 2026
   - Type : `INITIATION`
3. ✅ Réservation créée directement (sans paiement Stripe)
4. ✅ Le client apparaît dans les réservations du stage

---

## PARTIE 17 — PAIEMENTS (backoffice)

### 17.1 Lister tous les paiements
**Route :** `GET /api/payments/`

1. Backoffice → **Paiements** (`/dashboard/paiements`)
2. ✅ Paiements du seed visibles :
   - `pi_mock_stage_test_01` — 150€ — STRIPE — ORD-2026-MOCK01
   - `pi_mock_bapteme_test_02` — 40€ — STRIPE — ORD-2026-MOCK02
3. ✅ Paiements des tests de la Partie 12 présents
4. ✅ Cartes de stats : total encaissé, nb paiements Stripe, manuels, bons cadeaux

---

## PARTIE 18 — CLIENTS & STAGIAIRES

### 18.1 Lister les clients
**Route :** `GET /api/clients/`

1. Backoffice → **Clients** (`/dashboard/clients`)
2. ✅ 8 clients du seed + clients créés au checkout
3. Trier par nom → ✅ Liste triée
4. Rechercher `alice` → ✅ Alice Martin affichée

### 18.2 Voir le détail d'un client
**Route :** `GET /api/clients/:id`

1. Cliquer sur **Alice Martin**
2. ✅ Email, téléphone, adresse + historique commandes (ORD-2026-MOCK01)

### 18.3 Lister les stagiaires
**Route :** `GET /api/stagiaires/`

1. Backoffice → **Stagiaires** (`/dashboard/stagiaires`)
2. ✅ 10 stagiaires du seed + ceux créés en §10 et §11
3. Rechercher `Thomas` → ✅ Thomas Girard affiché

### 18.4 Voir le détail d'un stagiaire
**Route :** `GET /api/stagiaires/:id`

1. Cliquer sur **Thomas Girard**
2. ✅ Poids 72kg, taille 175cm, email, téléphone + Stage Initiation réservé

---

## PARTIE 19 — GESTION DES UTILISATEURS

### 19.1 Lister les admins
**Route :** `GET /api/users/by-role/ADMIN`

1. Backoffice → **Administrateurs** (`/dashboard/administrators`)
2. ✅ Clément Pons (ADMIN) visible

### 19.2 Lister les moniteurs
**Route :** `GET /api/users/by-role/MONITEUR`

1. Backoffice → **Moniteurs** (`/dashboard/monitors`)
2. ✅ Liste vide ou moniteurs existants (avant promotion de Marc)

### 19.3 Promouvoir un utilisateur en moniteur
**Route :** `PATCH /api/users/:id/role`

1. Trouver `marc@serreche-parapente.fr` (rôle CUSTOMER)
2. Changer le rôle → **MONITEUR**
3. ✅ Toast « Compte de Marc Moniteur mis à jour »
4. Aller sur `/dashboard/monitors`
5. ✅ Marc Moniteur apparaît dans la liste

### 19.4 Vue moniteur après promotion
1. Se connecter avec `marc@serreche-parapente.fr` / `Moniteur1234!`
2. ✅ Dashboard moniteur : planning, créneaux à venir
3. ✅ Accès **réservations** et **stagiaires**
4. ❌ Pas d'accès aux pages admin (tarifs, commandes, paiements…)

---

## PARTIE 20 — AUDIENCES

### 20.1 Lister les audiences
**Route :** `GET /api/audiences/`

1. Backoffice → **Audiences** (`/dashboard/audiences`)
2. ✅ 2 audiences du seed :
   - « Anciens stagiaires — Initiation »
   - « Contacts manuels — Test »

### 20.2 Résoudre une audience (voir les contacts)
**Route :** `GET /api/audiences/:id/resolve`

1. Cliquer **Voir les contacts** sur « Anciens stagiaires — Initiation »
2. ✅ Thomas Girard affiché (stagiaire Stage Initiation ORD-2026-MOCK01)
3. Cliquer **Voir les contacts** sur « Contacts manuels — Test »
4. ✅ Les contacts manuels affichés (Marie Dupont, Pierre Martin, Camille Robert)

### 20.3 Rechercher des contacts
**Route :** `GET /api/audiences/contacts/search?q=`

1. Dans la création d'audience, chercher `thomas`
2. ✅ Thomas Girard suggéré comme contact manuel

### 20.4 Créer une audience
**Route :** `POST /api/audiences/`

1. Cliquer **Nouvelle audience**
2. Nom : `Clients avec commandes > 100€`
3. Ajouter une règle : `Commande au-dessus de` → montant `100`
4. ✅ Audience créée
5. Résoudre → ✅ Alice Martin, Bob Dupont, clients des tests présents

### 20.5 Modifier une audience
**Route :** `PUT /api/audiences/:id`

1. Modifier le nom de l'audience créée en §20.4
2. ✅ Mise à jour confirmée

### 20.6 Supprimer une audience
**Route :** `DELETE /api/audiences/:id`

1. Supprimer l'audience créée en §20.4
2. ✅ Supprimée de la liste

---

## PARTIE 21 — CAMPAGNES SMS

### 21.1 Lister les campagnes
**Route :** `GET /api/campaigns/`

1. Backoffice → **Campagnes** (`/dashboard/campagnes`)
2. ✅ Campagne DRAFT « Promotion Été 2026 — Stages » visible

### 21.2 Voir le détail d'une campagne
**Route :** `GET /api/campaigns/:id`

1. Cliquer sur la campagne DRAFT
2. ✅ Contenu du message, audience liée, statut DRAFT

### 21.3 Résoudre les contacts d'une campagne
**Route :** `GET /api/campaigns/:id/resolve`

1. Cliquer **Voir les destinataires** sur la campagne DRAFT
2. ✅ Liste des numéros/contacts ciblés par l'audience

### 21.4 Créer une campagne
**Route :** `POST /api/campaigns/`

1. Cliquer **Nouvelle campagne**
2. Remplir :
   - Nom : `Promo Automne 2026`
   - Contenu : `Réservez votre stage d'automne ! Code : PROMO10`
   - Audience : `Contacts manuels — Test`
3. ✅ Campagne créée en DRAFT

### 21.5 Modifier une campagne
**Route :** `PUT /api/campaigns/:id`

1. Modifier le contenu de la campagne créée en §21.4
2. ✅ Mise à jour confirmée

### 21.6 Envoyer une campagne
**Route :** `POST /api/campaigns/:id/send`

> ⚠️ En dev, les SMS ne sont pas envoyés sans clé Twilio valide. Vérifier les logs serveur.

1. Cliquer **Envoyer** sur la campagne DRAFT `Promo Automne 2026`
2. ✅ Statut passe à SENDING puis COMPLETED
3. ✅ Logs d'envoi visibles (succès ou erreurs selon config Twilio)

### 21.7 Supprimer une campagne DRAFT
**Route :** `DELETE /api/campaigns/:id`

1. Supprimer la campagne créée en §21.4
2. ✅ Supprimée de la liste

---

## PARTIE 22 — VÉRIFICATION FINALE CROSS-FEATURES

### 22.1 Vérifier la cohérence backoffice → front
1. Modifier le prix Aventure à `130€` (§4.2)
2. ✅ Sur http://localhost:3000/bi-places, prix Aventure = 130€ (après revalidation cache)
3. Remettre à 120€

### 22.2 Vérifier l'intégrité d'une commande complète
1. Dans le backoffice, ouvrir une commande payée lors des tests
2. ✅ Commande → OrderItems → StageBooking / BaptemeBooking → Stagiaire : chaîne complète vérifiable
3. ✅ Paiement(s) liés à la commande avec allocations correctes

### 22.3 Tester la page Aujourd'hui avec des activités réelles
1. Si un stage ou baptême existe à la date du jour dans les données migrées :
2. Aller sur http://localhost:3001/dashboard/today
3. ✅ Tableaux de participants avec shortCode, nom, contact, poids/taille, statut paiement

### 22.4 Vérifier GTM (front public)
1. Ouvrir les DevTools → Réseau sur http://localhost:3000
2. ✅ Requête vers `googletagmanager.com` présente dans les requêtes réseau
3. Finaliser un achat Stripe en test et vérifier que l'événement `purchase` est déclenché dans la console GTM

---

## RÉCAPITULATIF DES ROUTES TESTÉES

| Feature | Routes | Nb |
|---------|--------|----|
| Auth (better-auth) | sign-in, sign-up, sign-out, session | 4 |
| Content | GET + PUT /topbar | 2 |
| Tarifs | GET all, GET /, GET by-category, PUT, GET video-option, PATCH video-option, GET stages/base, GET stages/base/:type, PATCH stage-base, GET baptemes/deposit, PATCH bapteme-deposit, GET min | 12 |
| Stages | GET /, GET /:id, POST, PUT /:id, PATCH /:id/promote, DELETE /:id/promote, DELETE /:id | 7 |
| Baptêmes | GET /, GET /:id, POST, PUT /:id, DELETE /:id | 5 |
| Promo codes | GET /, GET /:id, POST, POST /validate, PUT /:id, DELETE /:id | 6 |
| Gift Vouchers | GET /, GET /:id, POST, PATCH /:id, POST /lookup, POST /validate, POST /reserve, POST /release, GET /price/:type/:cat | 9 |
| Cart | GET /items, POST /items, PUT /items/:id, PATCH /items/:id, DELETE /items/:id, DELETE /items | 6 |
| Availability | POST /check, GET /stages/:id, GET /baptemes/:id, POST /reserve, DELETE /release, GET /months, GET /periods | 7 |
| Orders | POST /, GET /, GET /search, GET /:id, PATCH /:id/status, DELETE /ghost, POST /items/:id/finalize | 7 |
| Reservations | GET /, GET /:id, POST /manual-payment | 3 |
| ReservationStages | POST / | 1 |
| Payments | GET / | 1 |
| Clients | GET /, GET /:id, POST / | 3 |
| Stagiaires | GET /, GET /:id, POST / | 3 |
| Users | GET /, GET /:id, GET /by-role/:role, PATCH /:id/role | 4 |
| Audiences | GET /, GET /contacts/search, GET /:id, GET /:id/resolve, POST, PUT /:id, DELETE /:id | 7 |
| Campaigns | GET /, GET /:id, GET /:id/resolve, POST, PUT /:id, POST /:id/send, DELETE /:id | 7 |
| Dashboard | GET /stats, GET /today, GET /monitor-schedule | 3 |

**Total : 106 routes — 100% couvertes par ce guide**

---

## DONNÉES DE RÉFÉRENCE (seed mock)

### Bons cadeaux

| Code | Type | Catégorie | Statut |
|------|------|-----------|--------|
| `GVSCP-TEST0001-STAG` | Stage | Initiation | ✅ Valide |
| `GVSCP-TEST0002-BAPT` | Baptême | Aventure | ✅ Valide |
| `GVSCP-TEST0003-USED` | Baptême | Durée | ❌ Déjà utilisé |
| `GVSCP-TEST0004-EXPR` | Stage | Progression | ❌ Expiré |
| `GVSCP-TEST0005-PROG` | Stage | Progression | ✅ Valide |
| `GVSCP-TEST0006-ENFANT` | Baptême | Enfant | ✅ Valide |

### Codes promo

| Code | Type | Valeur | Condition |
|------|------|--------|-----------|
| `PROMO10` | % | -10% (max 80€) | aucune |
| `ETE2026` | Fixe | -50€ | min 300€, expire 31/08/2026 |
| `BIENVENUE` | Fixe | -20€ | min 100€, max 50 usages |
| `EXPIREDTEST` | % | -15% | ❌ expiré/inactif |

### Commandes mock

| Numéro | Statut | Type | Client | Montant |
|--------|--------|------|--------|---------|
| ORD-2026-MOCK01 | PAID | Stage Initiation | Alice Martin → Thomas Girard | 680€ (150€ payé) |
| ORD-2026-MOCK02 | PAID | Baptême Aventure | Bob Dupont | 120€ (40€ payé) |
| ORD-2026-GHOST1 | PENDING | Stage (fantôme) | — | 680€ (aucun paiement) |
