# Architecture Générale — Caba Résidence

Ce document décrit l'architecture fonctionnelle de la plateforme Caba Résidence.
Il constitue la source de vérité pour toutes les décisions architecturales transversales.

---

## 1. Vision du projet

Caba Résidence est une **plateforme complète de réservation et de gestion immobilière/hôtelière**.
Elle ne doit pas être considérée comme un simple site vitrine.

Le système doit fonctionner comme un tout cohérent où :
- le visiteur peut **découvrir, rechercher, vérifier, réserver et payer** ;
- le propriétaire peut **gérer l'ensemble de son activité** depuis un seul système central.

---

## 2. Objectifs fonctionnels

### 2.1 Parcours visiteur

```
Arriver
  → Découvrir Caba Résidence
  → Rechercher un logement
  → Vérifier sa disponibilité
  → Connaître immédiatement le prix
  → Réserver
  → Payer ou contacter Caba
  → Recevoir sa confirmation
  → Retrouver sa réservation dans son espace client
```

### 2.2 Parcours propriétaire

```
Ajouter un logement
  → Ajouter ses photos
  → Sélectionner ses caractéristiques
  → Configurer ses tarifs
  → Définir ses disponibilités
  → Recevoir les réservations
  → Gérer les clients
  → Gérer les demandes WhatsApp
  → Suivre les paiements
  → Gérer les avis
  → Suivre son activité
```

---

## 3. Moteurs centraux

Le cœur de la plateforme repose sur **six moteurs interconnectés**.
Chaque moteur a une responsabilité unique et communique avec les autres via des interfaces clairement définies.

### 3.1 Moteur de recherche

**Responsabilité** : Trouver les logements correspondant aux critères du visiteur.

**Entrées** : dates, horaires, nombre de voyageurs, type de logement, équipements, prix, durée.

**Sortie** : liste des logements disponibles correspondant aux critères.

**Principe** : Le moteur de recherche interroge le moteur de disponibilité pour ne retourner que les logements réellement réservables.

### 3.2 Moteur de disponibilité

**Responsabilité** : Déterminer en temps réel quels logements sont réellement disponibles.

**Sources d'indisponibilité** :
- réservations confirmées ;
- réservations en attente ;
- réservations WhatsApp ;
- réservations manuelles ;
- blocages administratifs ;
- maintenance ;
- synchronisation iCal ;
- horaires d'arrivée/départ ;
- durée minimale/maximale ;
- capacité maximale.

**Règle absolue** : Le moteur de disponibilité est **la source de vérité centrale**. Il est utilisé par :
- le site public ;
- le back-office ;
- l'espace client ;
- WhatsApp ;
- les calendriers synchronisés.

**Aucune source ne doit contourner ce moteur.**

### 3.3 Moteur de tarification

**Responsabilité** : Calculer automatiquement le prix correspondant à une réservation.

**Paramètres d'entrée** :
- dates et heures ;
- durée ;
- type de réservation (heure, nuitée, 24h, semaine, mois) ;
- nombre de personnes ;
- tarif applicable ;
- promotions ;
- frais ;
- taxes ;
- suppléments.

**Règle** : Le prix affiché dans la recherche, la page logement et le formulaire de réservation doit toujours être identique. Tout écart est un bug.

### 3.4 Moteur de réservation

**Responsabilité** : Créer, verrouiller, confirmer, modifier et annuler les réservations.

**Cycle de vie d'une réservation** :
1. Vérifier la disponibilité ;
2. Calculer le prix ;
3. Créer un verrouillage temporaire (si nécessaire) ;
4. Effectuer le paiement ;
5. Vérifier à nouveau la disponibilité ;
6. Confirmer la réservation ;
7. Supprimer le verrouillage temporaire ;
8. Bloquer définitivement le créneau ;
9. Mettre à jour les calendriers.

**Libération automatique** : Une réservation expirée ou annulée libère le créneau.

### 3.5 Moteur de synchronisation

**Responsabilité** : Synchroniser les disponibilités avec les calendriers externes via iCal.

**Fonctionnalités** :
- import iCal ;
- export iCal ;
- synchronisation des réservations ;
- synchronisation des blocages ;
- prévention des doubles réservations ;
- enregistrement et signalement des erreurs.

### 3.6 Back-office

**Responsabilité** : Centraliser toutes les réservations quelle que soit leur source.

**Sources alimentant le back-office** :
- site public ;
- WhatsApp ;
- saisie manuelle.

**Règle** : Toute réservation, quelle que soit son origine, doit alimenter le même système central.

---

## 4. Workflow de développement

Chaque modification doit suivre le processus contrôlé suivant :

```
Modification
  → Lint
  → Type Check
  → Tests unitaires
  → Tests d'intégration
  → Test réservation
  → Test disponibilité
  → Test responsive
  → Test sécurité
  → Build production
  → Audit visuel
  → Validation
  → Commit
  → Push
  → Déploiement
```

**Règle** : Aucune modification ne doit être considérée comme terminée sans vérification.

---

## 5. Règles essentielles du moteur de réservation

Le système doit garantir :

- **Aucune double réservation** ;
- **Aucune réservation sur une période indisponible** ;
- **Aucune incohérence de prix** ;
- **Aucune réservation dépassant la capacité** ;
- **Recalcul automatique des tarifs** ;
- **Mise à jour immédiate du calendrier** ;
- **Libération des disponibilités** après annulation ou expiration ;
- **Synchronisation des réservations** WhatsApp et manuelles ;
- **Synchronisation iCal** ;
- **Prise en compte de tous les types de réservation** :
  - horaire ;
  - nuitée ;
  - 24 heures ;
  - hebdomadaire ;
  - mensuel.

---

## 6. Types de logements

La plateforme gère les types suivants :

| Type | Description |
|------|-------------|
| Chambre | Espace individuel avec lit, douche, TV, Wi-Fi |
| Chambre avec salon | Chambre + espace salon séparé |
| Studio | Espace ouvert combinant chambre et kitchenette |
| Appartement meublé | Logement complet meublé |
| Suite | Chambre haut de gamme avec équipements premium |
| Villa | Propriété individuelle avec extérieur |
| Duplex | Logement sur deux niveaux |
| Maison entière | Propriété complète |
| Type personnalisé | Défini par le propriétaire |

**Configuration par type** : Chaque type peut être configuré individuellement pour autoriser certaines unités de réservation (heure, nuitée, 24h, semaine, mois) et en interdire d'autres.

**Exemple** :
- Chambre A → autorise : 3h, 6h, nuitée, 24h
- Villa B → autorise : nuitée, semaine, mois uniquement

---

## 7. Sources de données centralisées

Toutes les données doivent provenir d'une **base de données unique et centralisée**.

Aucune donnée ne doit être stockée de manière isolée ou dupliquée sans raison technique justifiée.

**Principe** : Une seule source de vérité pour :
- les disponibilités ;
- les tarifs ;
- les réservations ;
- les clients ;
- les paiements.

---

## 8. Évolutivité

L'architecture doit permettre :

- l'ajout de nouveaux types de logements ;
- l'ajout de nouveaux moyens de paiement (marché africain) ;
- l'ajout de nouvelles langues ;
- l'intégration de nouvelles sources de réservation ;
- l'ajout de nouvelles fonctionnalités sans refactorisation majeure.

---

## 9. Contraintes techniques

### 9.1 Déploiement

Le projet sera déployé sur **Vercel** en priorité, avec une migration possible vers **Hostinger** si nécessaire.

**Avantages de Vercel pour Caba Résidence** :
- Déploiement automatique depuis le dépôt Git ;
- Preview deployments pour chaque PR ;
- Edge network mondiale (performance) ;
- Support natif de Next.js ;
- Variables d'environnement sécurisées ;
- Analytics intégrés ;
- SSL/TLS automatique ;
- Rolling deployments sans downtime.

**Architecture de déploiement (Vercel)** :
- **Frontend** : Vercel (Next.js) ;
- **Backend / API** : Vercel Serverless Functions ou API Routes Next.js ;
- **Base de données** : service externe (PostgreSQL/PlanetScale/Neon) ;
- **Stockage fichiers** : service externe (Cloudinary/S3) ;
- **Paiements** : service externe (Stripe/PayPal) ;
- **Emails** : service externe (Resend/SendGrid) ;
- **Monitoring** : Vercel Analytics + service externe si nécessaire.

**Migration vers Hostinger** (si nécessaire) :
- Hostinger supporte Node.js et Next.js ;
- La base de données, le stockage et les paiements étant déjà externes, la migration concerne uniquement l'hébergement du code ;
- Adapter la configuration de build et les variables d'environnement ;
- Configurer le SSL et le domaine ;
- Tester les performances avant et après la migration.

### 9.2 Autres contraintes

- **Pas de dépendance technique verrouillante** : l'architecture doit permettre une migration si nécessaire.
- **Performance** : affichage extrêmement rapide, latence minimale pour les informations essentielles.
- **Sécurité** : intégrée dès l'architecture, pas ajoutée a posteriori.
