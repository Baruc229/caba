# Moteur de Réservation — Caba Résidence

Ce document décrit le moteur de réservation, responsable de la création, modification,
annulation et gestion du cycle de vie complet des réservations.

---

## 1. Principes fondamentaux

### 1.1 Règles absolues

Le moteur de réservation doit garantir :

- **Aucune double réservation** sur un même créneau ;
- **Aucune réservation sur une période indisponible** ;
- **Aucune incohérence de prix** entre le devis et la confirmation ;
- **Aucune réservation dépassant la capacité** du logement ;
- **Recalcul automatique des tarifs** en cas de modification ;
- **Mise à jour immédiate du calendrier** après chaque opération ;
- **Libération des disponibilités** après annulation ou expiration.

### 1.2 Source de vérité

Le moteur de disponibilité est **la source de vérité centrale**. Toute réservation doit le passer par lui.

---

## 2. Types de réservation

### 2.1 Unités de réservation

Chaque logement peut être configuré pour accepter les unités de réservation suivantes :

| Unité | Description | Exemple |
|-------|-------------|---------|
| Heure | Réservation pour une durée en heures | 3 heures |
| Plusieurs heures | Réservation pour une durée multiple d'heures | 6 heures |
| Demi-journée | Réservation pour une demi-journée (4-6h) | Matin ou après-midi |
| Journée | Réservation pour une journée complète sans nuitée | 08h – 18h |
| Nuitée | Réservation pour une nuit (arrivée soir, départ matin) | 15h – 11h |
| 24 heures | Réservation pour une période de 24 heures | 14h aujourd'hui – 14h demain |
| Semaine | Réservation pour 7 nuits consécutives | 1 semaine |
| Mois | Réservation pour 30 nuits consécutives | 1 mois |

### 2.2 Configuration par logement

Chaque logement doit pouvoir être configuré individuellement avec les unités autorisées.

**Exemple 1 : Chambre A**
```
Unités autorisées :
  - 3 heures : tarif configuré
  - 6 heures : tarif configuré
  - Nuitée : tarif configuré
  - 24 heures : tarif configuré
```

**Exemple 2 : Villa B**
```
Unités autorisées :
  - Nuitée : tarif configuré
  - Semaine : tarif configuré
  - Mois : tarif configuré
```

---

## 3. Cycle de vie d'une réservation

### 3.1 Statuts de réservation

| Statut | Description | Action possible |
|--------|-------------|-----------------|
| Demande en attente | Demande reçue (WhatsApp, formulaire) | Confirmer, refuser |
| Réservation temporaire | Verrouillage en cours (en attente de paiement) | Payer, annuler |
| En attente de paiement | Réservation créée, paiement en cours | Payer, annuler |
| Confirmée | Réservation validée et payée | Modifier (selon règles), annuler |
| Payée | Paiement reçu intégralement | Consulter |
| Modifiée | Réservation modifiée par le client ou l'admin | Consulter |
| Annulée | Réservation annulée | Consulter |
| Terminée | Séjour terminé | Ajouter un avis |

### 3.2 Flux de création

```
1. Le client sélectionne un logement et des dates
   ↓
2. Le système vérifie la disponibilité via le moteur de disponibilité
   ↓
3. Le système calcule le prix via le moteur de tarification
   ↓
4. Le système crée un verrouillage temporaire (TTL : 15-30 minutes)
   ↓
5. Le client choisit le mode de réservation :
   a. Réserver en ligne (compte client)
   b. Demander via WhatsApp
   ↓
6. Si réservation en ligne :
   a. Le client crée ou utilise son compte
   b. Le client effectue le paiement
   c. Le système vérifie à nouveau la disponibilité
   d. Le système confirme la réservation
   e. Le système supprime le verrouillage temporaire
   f. Le système bloque définitivement le créneau
   g. Le système met à jour les calendriers
   h. Le système envoie la confirmation
   ↓
7. Si demande WhatsApp :
   a. La demande est enregistrée dans le back-office
   b. Le propriétaire confirme ou refuse
   c. Si confirmé → même flux que réservation en ligne
```

### 3.3 Flux de modification

```
1. Le client ou l'admin demande une modification
   ↓
2. Le système vérifie les règles de modification :
   - Délai minimum avant arrivée ?
   - Type de modification autorisé ?
   - Impact sur le prix ?
   ↓
3. Si modification autorisée :
   a. Le système vérifie la disponibilité pour les nouvelles dates
   b. Le système recalcule le prix
   c. Le système applique la différence de prix
   d. Le système met à jour la réservation
   e. Le système met à jour les calendriers
   f. Le système envoie la confirmation de modification
   ↓
4. Si modification refusée :
   a. Le système informe le client du motif
```

### 3.4 Flux d'annulation

```
1. Le client ou l'admin demande une annulation
   ↓
2. Le système vérifie les règles d'annulation :
   - Délai minimum avant arrivée ?
   - Frais d'annulation applicables ?
   ↓
3. Si annulation autorisée :
   a. Le système calcule les frais d'annulation (le cas échéant)
   b. Le système traite le remboursement (le cas échéant)
   c. Le système met à jour le statut à "Annulée"
   d. Le système libère le créneau
   e. Le système met à jour les calendriers
   f. Le système envoie la confirmation d'annulation
   ↓
4. Si annulation refusée :
   a. Le système informe le client du motif
```

---

## 4. Réservation WhatsApp

### 4.1 Principe

Le client doit pouvoir envoyer une demande de réservation via WhatsApp, même sans compte client.

### 4.2 Données de la demande

La demande WhatsApp doit contenir :

| Champ | Description | Obligatoire |
|-------|-------------|-------------|
| Client | Nom, email, téléphone | Oui |
| Logement | Logement souhaité | Oui |
| Dates | Date d'arrivée et de départ | Oui |
| Heures | Heure d'arrivée et de départ | Conditionnel |
| Voyageurs | Nombre d'adultes, enfants, bébés | Oui |
| Prix estimé | Prix calculé par le système | Oui |
| Message | Message libre du client | Non |
| Source | "WhatsApp" | Automatique |
| Statut | "Demande en attente" | Automatique |

### 4.3 Gestion par le propriétaire

Le propriétaire peut :
- **Confirmer** la demande → la transformer en réservation ;
- **Refuser** la demande → informer le client du motif ;
- **Demander des informations complémentaires** → envoyer un message via WhatsApp.

### 4.4 Création de compte

Si nécessaire, le client pourra créer un espace client et retrouver sa réservation associée.

---

## 5. Gestion des réservations dans le back-office

### 5.1 Actions administratives

L'administrateur doit pouvoir :

| Action | Description |
|--------|-------------|
| Consulter | Voir le détail d'une réservation |
| Créer | Ajouter une réservation manuelle |
| Modifier | Modifier les dates, les voyageurs, etc. |
| Confirmer | Confirmer une réservation en attente |
| Annuler | Annuler une réservation |
| Refuser | Refuser une demande |
| Déplacer | Déplacer une réservation à d'autres dates |
| Bloquer | Bloquer un créneau sans réservation |
| Notes internes | Ajouter des notes visibles uniquement par l'équipe |

### 5.2 Calendrier global

Toutes les réservations doivent apparaître dans un **calendrier global**.

Le calendrier doit utiliser le **même moteur de disponibilité** que le site public.

### 5.3 Synchronisation

Toute réservation créée, modifiée ou annulée dans le back-office doit immédiatement :
- Mettre à jour le moteur de disponibilité ;
- Mettre à jour les calendriers publics ;
- Synchroniser avec iCal si configuré.

---

## 6. Contraintes de réservation

### 6.1 Capacité

- Le nombre de voyageurs ne doit jamais dépasser la capacité maximale du logement ;
- Les bébés peuvent être comptés ou non selon la configuration.

### 6.2 Durée

- **Durée minimale** : configurable par logement (ex. : 2 nuits minimum) ;
- **Durée maximale** : configurable par logement (ex. : 30 nuits maximum).

### 6.3 Horaires

- **Heure d'arrivée** : configurable par logement (ex. : 15h00) ;
- **Heure de départ** : configurable par logement (ex. : 11h00) ;
- **Check-in flexible** : possible si configuré (arrivée plus tôt, départ plus tard).

### 6.4 Anticipation

- **Réservation à l'avance** : le client peut réserver plusieurs semaines/mois à l'avance ;
- **Réservation du jour** : possible si le logement est disponible.

---

## 7. Règles de réservation

### 7.1 Règles d'annulation

Le propriétaire doit pouvoir configurer :

- **Annulation gratuite** : avant un certain délai (ex. : 48h avant l'arrivée) ;
- **Frais d'annulation** : pourcentage du montant total (ex. : 50 %) ;
- **Non-remboursable** : aucune annulation autorisée.

### 7.2 Règles de modification

Le propriétaire doit pouvoir configurer :

- **Modification gratuite** : avant un certain délai ;
- **Modification payante** : frais de modification (ex. : 20 €) ;
- **Pas de modification** : après l'arrivée uniquement.

### 7.3 Règles de paiement

- **Acompte** : pourcentage du montant total à payer à la réservation ;
- **Solde** : reste à payer à l'arrivée ou avant ;
- **Paiement intégral** : 100 % à la réservation.

---

## 8. Notifications liées aux réservations

Le système doit envoyer des notifications pour :

| Événement | Destinataire | Canal |
|-----------|--------------|-------|
| Nouvelle réservation | Admin, Client | Email, WhatsApp |
| Confirmation de réservation | Client | Email, WhatsApp |
| Paiement reçu | Admin, Client | Email |
| Annulation | Admin, Client | Email, WhatsApp |
| Modification | Admin, Client | Email |
| Rappel d'arrivée | Client | Email, WhatsApp |
| Rappel de départ | Client | Email, WhatsApp |
| Demande d'avis | Client | Email |

---

## 9. Cas de test — Réservation

### Cas de test 1 : Réservation standard (nuitée)

**Données** :
- Logement : Appartement meublé
- Dates : 17 août au 1 septembre 2026 (15 nuits)
- Voyageurs : 9 (7 adultes + 2 enfants)
- Tarif applicable : 200 €/nuit (tarif 7 jours et plus)
- Frais de ménage : 45 €
- Taxe de séjour : 2 €/nuit/personne

**Calcul** :
```
Prix séjour : 200 € × 15 nuits = 3 000 €
Frais de ménage : 45 €
Taxe de séjour : 2 € × 9 × 15 = 270 €

TOTAL : 3 315 €
```

**Résultat attendu** :
- Réservation créée avec le statut "En attente de paiement" ;
- Verrouillage temporaire actif ;
- Après paiement → statut "Confirmée" ;
- Créneau bloqué dans le calendrier ;
- Confirmation envoyée par email et WhatsApp.

### Cas de test 2 : Réservation WhatsApp

**Données** :
- Client : Jean Dupont (jean@example.com, +33 6 12 34 56 78)
- Logement : Chambre A
- Dates : 20 au 22 août 2026 (2 nuits)
- Voyageurs : 2 adultes
- Message : "Bonjour, je souhaiterais réserver pour 2 nuits"

**Flux** :
1. La demande est enregistrée dans le back-office avec le statut "Demande en attente" ;
2. Le propriétaire confirme la demande ;
3. Le client reçoit un lien pour créer un compte et payer ;
4. Le paiement est effectué ;
5. La réservation passe au statut "Confirmée" ;
6. Le créneau est bloqué ;
7. Le client reçoit sa confirmation.

### Cas de test 3 : Vérification de capacité

**Données** :
- Logement : Studio B (capacité maximale : 2 personnes)
- Demande : 4 adultes

**Résultat attendu** :
- Le système refuse la réservation ;
- Message d'erreur : "Le nombre de voyageurs (4) dépasse la capacité maximale du logement (2)" ;
- Aucun verrouillage créé.
