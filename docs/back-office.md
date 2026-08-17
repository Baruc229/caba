# Back-Office — Caba Résidence

Ce document décrit le back-office de la plateforme, son architecture de navigation,
et chaque section de gestion.

---

## 1. Vue d'ensemble

Le back-office doit fonctionner comme un **système de gestion complet**.
Il est l'interface principale du propriétaire et de son équipe pour gérer
l'ensemble de l'activité de Caba Résidence.

**Principe** : Toutes les réservations, qu'elles proviennent du site, de WhatsApp
ou d'une saisie manuelle, doivent alimenter le même système central.

---

## 2. Navigation principale

La navigation du back-office est organisée en sections :

| # | Section | Description |
|---|---------|-------------|
| 1 | Tableau de bord | Vue d'ensemble de l'activité |
| 2 | Réservations | Gestion de toutes les réservations |
| 3 | Calendrier | Vue calendaire des disponibilités |
| 4 | Logements | Gestion des annonces |
| 5 | Clients | Gestion des clients |
| 6 | Tarifs | Configuration des tarifs |
| 7 | Promotions | Gestion des promotions |
| 8 | Caractéristiques | Gestion des équipements et installations |
| 9 | Avis | Modération des avis |
| 10 | Paiements | Suivi des paiements |
| 11 | Messages | Messagerie interne |
| 12 | WhatsApp | Gestion des demandes WhatsApp |
| 13 | Galerie (page d'accueil) | Photos de présentation du complexe |
| 14 | iCal / Synchronisation | Gestion des synchronisations iCal |
| 15 | Pages | Gestion du contenu (pages légales, etc.) |
| 16 | Blog | Gestion des articles |
| 17 | Rapports | Statistiques et rapports |
| 18 | Rôles & Permissions | Gestion des accès |
| 19 | Paramètres | Configuration générale |

---

## 3. Tableau de bord

### 3.1 Éléments affichés

Le tableau de bord doit afficher en un coup d'œil :

| Élément | Description |
|---------|-------------|
| Réservations du jour | Nombre de réservations prévues aujourd'hui |
| Arrivées | Clients arrivant aujourd'hui |
| Départs | Clients partant aujourd'hui |
| Logements disponibles | Nombre de logements libres |
| Logements occupés | Nombre de logements occupés |
| Demandes WhatsApp | Demandes en attente de traitement |
| Paiements | Paiements récents ou en attente |
| Revenus | Revenus du jour, de la semaine, du mois |
| Réservations récentes | Les 5-10 dernières réservations |
| Notifications | Notifications non lues |
| Statistiques | Graphiques d'évolution (occupancy, revenus, etc.) |

### 3.2 Widgets

Le tableau de bord doit pouvoir être personnalisé avec des widgets :
- Graphique des revenus ;
- Taux d'occupation ;
- Répartition par type de logement ;
- Sources de réservation.

---

## 4. Gestion des réservations

### 4.1 Liste des réservations

Afficher toutes les réservations avec :
- Numéro de réservation ;
- Client ;
- Logement ;
- Dates d'arrivée et de départ ;
- Statut ;
- Montant ;
- Source (site, WhatsApp, manuelle) ;
- Date de création.

### 4.2 Filtres et recherche

Filtrer par :
- Statut (en attente, confirmée, annulée, terminée) ;
- Période (dates d'arrivée) ;
- Logement ;
- Client ;
- Source.

### 4.3 Actions

L'administrateur doit pouvoir :
- **Consulter** le détail d'une réservation ;
- **Créer** une réservation manuelle ;
- **Modifier** les dates, les voyageurs, les notes ;
- **Confirmer** une réservation en attente ;
- **Annuler** une réservation ;
- **Refuser** une demande ;
- **Déplacer** une réservation à d'autres dates ;
- **Bloquer** un créneau sans réservation ;
- **Ajouter des notes internes** (visibles uniquement par l'équipe).

### 4.4 Détail d'une réservation

La page de détail doit afficher :
- Toutes les informations de la réservation ;
- Historique des modifications ;
- Paiements associés ;
- Messages avec le client ;
- Notes internes ;
- Actions possibles.

### 4.5 Calendrier global

Toutes les réservations doivent apparaître dans un **calendrier global**.

Le calendrier doit :
- Utiliser le **même moteur de disponibilité** que le site public ;
- Afficher les réservations par logement ;
- Permettre la création de réservation par clic sur un créneau ;
- Afficher les blocages et la maintenance.

---

## 5. Gestion des logements

### 5.1 Actions

Le propriétaire doit pouvoir pour chaque logement :
- **Créer** un nouveau logement ;
- **Modifier** toutes les informations ;
- **Dupliquer** un logement existant ;
- **Publier** (rendre visible sur le site) ;
- **Dépublier** (masquer du site) ;
- **Désactiver** (indisponible temporairement) ;
- **Supprimer** (suppression logique).

### 5.2 Champs de configuration

Chaque logement doit contenir :

| Section | Champs |
|---------|--------|
| Informations générales | Nom, type, description courte, description complète |
| Capacité | Capacité maximale, adultes, enfants, bébés |
| Espaces | Chambres, lits, salles de bains, superficie |
| Photos | Jusqu'à 20 photos (voir §6) |
| Caractéristiques | Équipements, installations, etc. (voir §8) |
| Tarifs | Prix par unité, frais, taxes (voir moteur-tarification.md) |
| Promotions | Réductions et offres spéciales |
| Disponibilité | Calendrier, blocages, maintenance |
| Règles | Règles d'annulation, de modification, de check-in/out |
| Localisation | Adresse, coordonnées GPS |
| SEO | Titre SEO, meta description, URL slug |
| Contact | Téléphone, email, WhatsApp |

---

## 6. Gestion des photos par logement

**À ne pas confondre avec la « Galerie » de la page d'accueil (§13).**

### 6.1 Limites

- Maximum **20 photos par logement** ;
- Formats acceptés : JPG, PNG, WebP ;
- Taille maximale par photo : 5 Mo.

### 6.2 Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| Upload multiple | Ajouter plusieurs photos en une fois |
| Glisser-déposer | Réorganiser par glisser-déposer |
| Réorganisation | Modifier l'ordre d'affichage |
| Image principale | Définir la photo de couverture |
| Suppression | Supprimer une photo |
| Remplacement | Remplacer une photo existante |
| Compression | Compression automatique pour optimiser le poids |
| Optimisation | Réduction de taille sans perte de qualité |
| Génération de tailles | Création automatique des variantes (thumbnail, medium, large) |

### 6.3 Galerie sur le site

La galerie public s'adapte au nombre de photos :
- **1 photo** : pleine largeur ;
- **2 photos** : côte à côte ;
- **3-5 photos** : disposition en 3 colonnes (1 grande + 2 empilées + 2 empilées) ;
- **6+ photos** : disposition similaire avec bouton "Voir toutes les photos".

---

## 7. Gestion des clients

### 7.1 Liste des clients

Afficher tous les clients avec :
- Nom et prénom ;
- Email ;
- Téléphone ;
- Nombre de réservations ;
- Date de dernière réservation.

### 7.2 Fiche client

La fiche de chaque client doit contenir :
- Informations personnelles ;
- Historique des réservations ;
- Demandes ;
- Paiements ;
- Avis ;
- Favoris ;
- Communications.

### 7.3 Actions

- Consulter les informations ;
- Ajouter des notes internes ;
- Exporter les données.

---

## 8. Gestion des tarifs

### 8.1 Interface

L'interface de gestion des tarifs doit permettre :
- Définir les tarifs par type (standard, horaire, etc.) ;
- Définir les tarifs saisonniers ;
- Définir les tarifs week-end ;
- Définir les tarifs longue durée ;
- Configurer les frais (ménage, taxes) ;
- Appliquer les tarifs à un ou plusieurs logements.

### 8.2 Tarifs par logement

Chaque logement a sa propre grille tarifaire. L'interface doit afficher :
- Le tarif actuel ;
- Les tarifs configurés ;
- Les promotions applicables.

---

## 9. Gestion des promotions

### 9.1 Création d'une promotion

Le propriétaire doit pouvoir définir :
- **Nom** de la promotion ;
- **Logement(s) concerné(s)** ;
- **Type de réduction** : pourcentage ou montant fixe ;
- **Valeur** de la réduction ;
- **Date de début** ;
- **Date de fin** ;
- **Durée minimale** du séjour ;
- **Conditions** supplémentaires ;
- **Activation/désactivation**.

### 9.2 Liste des promotions

Afficher toutes les promotions avec :
- Nom ;
- Logement(s) ;
- Valeur ;
- Période de validité ;
- Statut (active/inactive).

---

## 10. Gestion des caractéristiques

### 10.1 Structure

Les caractéristiques sont organisées en catégories :

| Catégorie | Exemples |
|-----------|----------|
| Équipements | Fax, Chauffage, Internet, Cuisine, Téléphone, Chaînes satellite, Détecteurs de fumée, TV, Lave-linge |
| Chambres et salles de bains | Essentiels, Sèche-cheveux, Cintres |
| Installations | Petit-déjeuner, Ascenseur, Adapté aux familles, Parking gratuit, Salle de sport, Spa, Non-fumeur, Animaux acceptés, Piscine, Accessible aux fauteuils roulants |
| Autres | Catégorie personnalisable |

### 10.2 Actions

Le propriétaire doit pouvoir :
- Ajouter de nouvelles caractéristiques sans intervention technique ;
- Modifier les caractéristiques existantes ;
- Supprimer des caractéristiques ;
- Associer des caractéristiques aux logements.

---

## 11. Gestion des avis

### 11.1 Liste des avis

Afficher tous les avis avec :
- Note ;
- Auteur ;
- Date ;
- Logement concerné ;
- Statut (en attente, publié, masqué, supprimé).

### 11.2 Actions

L'administrateur peut :
- **Modérer** les avis ;
- **Publier** un avis ;
- **Masquer** un avis ;
- **Supprimer** un avis ;
- **Répondre** à un avis.

### 11.3 Avis Google

Les avis Google vérifiés doivent pouvoir être intégrés au système.

---

## 12. Gestion des paiements

### 12.1 Vue d'ensemble

Afficher :
- Paiements récents ;
- Paiements en attente ;
- Montant total des revenus ;
- Remboursements.

### 12.2 Détails

Pour chaque paiement :
- Numéro ;
- Réservation associée ;
- Montant ;
- Statut ;
- Moyen de paiement ;
- Date.

---

## 13. Messages et WhatsApp

### 13.1 Messages

Messagerie interne pour communiquer avec les clients.

### 13.2 WhatsApp

Gestion des demandes WhatsApp :
- Liste des demandes ;
- Transformation en réservation ;
- Réponse directe.

Voir aussi `whatsapp-et-notifications.md`.

---

## 14. Galerie (page d'accueil)

**À ne pas confondre avec les photos par logement (§6).**

Cette section gère la **sélection de photos représentatives** de Caba Résidence
qui sont mises en avant sur la page d'accueil.

Le propriétaire peut :
- Sélectionner les photos à afficher ;
- Réorganiser l'ordre ;
- Ajouter des légendes.

---

## 15. iCal / Synchronisation

Voir `ical-synchronisation.md` pour le détail complet.

---

## 16. Pages et Blog

### 16.1 Pages

Gestion des pages de contenu :
- À propos ;
- Contact ;
- Mentions légales ;
- Conditions générales ;
- Politique de confidentialité ;
- Politique d'annulation ;
- Conditions de réservation ;
- Politique de cookies ;
- Autres pages.

### 16.2 Blog

Gestion des articles de blog :
- Création ;
- Modification ;
- Publication ;
- Suppression ;
- Catégorisation ;
- SEO.

---

## 17. Rapports

### 17.1 Types de rapports

| Rapport | Contenu |
|---------|---------|
| Revenus | Revenus par période, par logement |
| Occupancy | Taux d'occupation par période |
| Réservations | Nombre de réservations par source, par statut |
| Clients | Nouveaux clients, clients récurrents |
| Paiements | Paiements reçus, en attente, remboursés |

### 17.2 Export

Les rapports doivent pouvoir être exportés en PDF et CSV.

---

## 18. Rôles et Permissions

### 18.1 Rôles prédéfinis

| Rôle | Accès |
|------|-------|
| Administrateur | Accès complet à toutes les fonctionnalités |
| Gestionnaire | Logements, réservations, clients |
| Réception | Réservations, arrivées et départs |
| Comptabilité | Paiements et rapports |
| Éditeur | Pages, contenu et blog |

### 18.2 Gestion des permissions

L'administrateur doit pouvoir :
- Créer de nouveaux rôles ;
- Personnaliser les permissions pour chaque rôle ;
- Assigner des rôles aux utilisateurs ;
- Activer/désactiver des comptes.

---

## 19. Paramètres

### 19.1 Paramètres généraux

- Nom de l'établissement ;
- Adresse ;
- Fuseau horaire ;
- Devise ;
- Langue ;
- Logo ;
- Informations de contact.

### 19.2 Paramètres de réservation

- Délai de verrouillage ;
- Règles d'annulation par défaut ;
- Règles de modification par défaut ;
- Durée minimale/maximale.

### 19.3 Paramètres de paiement

- Moyens de paiement activés ;
- Configuration des fournisseurs ;
- Frais transactionnels.

### 19.4 Paramètres de notification

- Canaux de notification activés ;
- Modèles d'email ;
- Configuration WhatsApp.

### 19.5 Paramètres SEO

- Titre par défaut ;
- Meta description par défaut ;
- Structure des URLs.

---

## 20. Responsive Design du back-office

Le back-office doit fonctionner parfaitement sur :
- Mobile ;
- Tablette ;
- Ordinateur portable ;
- Desktop ;
- Grands écrans.

**Aucun** débordement, chevauchement, texte coupé, bouton inaccessible, image déformée, mauvaise marge, mauvais alignement, ou scroll horizontal involontaire n'est acceptable.
