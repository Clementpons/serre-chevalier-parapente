# Features Ideas — Backlog Futur

Idées de fonctionnalités écartées du scope V3 pour des raisons de priorité ou de besoin de discussion avec le client.
Pas de deadline, pas d'engagement. Reprendre lors des prochaines sessions de planification.

---

## E-commerce & Checkout

### Payer le montant total en ligne (option)

À l'étape de paiement, afficher une option "Payer la totalité maintenant" en plus de "Payer l'acompte uniquement".
- Actuellement : seul l'acompte est encaissé en ligne ; le solde est payé sur place
- Idée : laisser le client choisir de tout payer en ligne s'il le souhaite
- Avantage : réduit le risque de no-show, simplifie la gestion sur place
- Points à clarifier avec le client : impact sur la gestion manuelle des paiements côté admin ?

### Page de succès — CTAs plus ciblés

Page `/checkout/success` aujourd'hui : récap de commande + planning des paiements.
Idées d'ajouts :
- CTA "Laisser un avis Google" (lien direct Google Reviews)
- CTA "Partager votre expérience" (WhatsApp/Facebook)
- Upsell contextuel : si baptême → suggérer stage INITIATION ; si stage → suggérer offrir un bon cadeau
- Email de rappel 48h avant l'activité (Resend)

### Flow questionnaire interactif sur `/reserver`

Au lieu de choisir directement entre "Stage / Baptême / Bon cadeau", proposer un mini-questionnaire :
"Vous êtes débutant ?" → guide vers baptême ou stage INITIATION
"Vous avez déjà volé ?" → guide vers PROGRESSION / AUTONOMIE
"C'est pour offrir ?" → guide vers bons cadeaux

---

## Activités & Planning

### Limites par catégorie de baptême

Actuellement, un baptême a un nombre de places global (ex: 6 places).
Idée : permettre de définir des sous-limites par catégorie (ex: max 2 ENFANT, max 4 AVENTURE sur le même créneau).
- Cela nécessite une table `BaptemeCategoryLimit` en remplacement/complément du champ `places`
- À discuter avec le directeur de l'école : est-ce un vrai besoin opérationnel ?
- Complexité : impact sur le calcul de disponibilité et l'UI du planning

### Gestion des stages du jour — Vue mobile (Proposals B & C)

La Proposal A (widget "Encaissements du jour") est implementée en V3.
Deux autres pistes pour la gestion terrain sur mobile :

**Proposal B — Vue "Today" dédiée**
- Page `/dashboard/today` accessible depuis la nav mobile
- Liste simplifiée des activités du jour avec leurs participants
- Focus opérationnel : confirmer présences, encaisser soldes, notes rapides

**Proposal C — Application mobile dédiée (PWA)**
- Version PWA du backoffice avec une vue optimisée mobile
- Accès rapide : planning du jour, liste participants, encaissements
- Notifications push pour les nouvelles réservations
- Nécessite un investissement plus conséquent

---

## Marketing & Communication

### Notifications push web

Envoyer des notifications aux clients inscrits (ex: nouvelles dates stages disponibles, promo).
- Nécessite une intégration Web Push API + service worker
- Alternative légère aux SMS pour les communications non-urgentes

### Programme de fidélité

Système de points ou de remises pour les clients récurrents.
- Ex: 5€ de réduction par stage effectué (à partir du 3e)
- Nécessite un modèle de données supplémentaire et une logique côté checkout

---

## Dashboard & Analytics

### Export des données financières

Exporter les revenus par période au format CSV/Excel.
- Utilisable pour la comptabilité et les déclarations fiscales
- Données : commandes, paiements Stripe, paiements manuels, remboursements

### Rapports automatiques hebdomadaires

Email envoyé automatiquement à l'admin chaque lundi :
- CA de la semaine écoulée
- Nb réservations par type
- Top clients de la semaine
- Alerte si des réservations approchent avec solde non payé

---

## Infrastructure

### Multi-school / Multi-tenant

Si le concept est réutilisé pour d'autres écoles de parapente :
- Isolation des données par `schoolId`
- Panel super-admin pour gérer plusieurs écoles
- Facturation SaaS par école

---

*Créé lors de la session de planification V3 — Mars 2026*
