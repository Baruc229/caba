# Modèle de Données — Caba Résidence

Ce document définit les entités principales de la base de données et leurs relations.
Il constitue la référence pour la conception de la base de données.

---

## 1. Entités principales

### 1.1 Logement (Property)

L'entité centrale du système. Chaque logement est une unité de location.

```
Logement
├── id                          : UUID (identifiant unique)
├── nom                         : String (nom du logement)
├── type                        : Enum (chambre, chambre_avec_salon, studio, appartement_meublé, suite, villa, duplex, maison_entière, personnalisé)
├── description_courte          : Text (résumé en quelques lignes)
├── description_complète        : Text (description détaillée)
├── statut                      : Enum (brouillon, publié, dépublié, désactivé, maintenance)
├── propriétaire_id             : UUID (référence vers le propriétaire)
├── super_categorie             : Enum (chambre_privée, logement_entier)
├── capacité_maximale           : Integer (nombre maximum de voyageurs)
├── adultes_max                 : Integer (nombre maximum d'adultes)
├── enfants_max                 : Integer (nombre maximum d'enfants)
├── bébés_max                   : Integer (nombre maximum de bébés)
├── nombre_chambres             : Integer
├── nombre_lits                 : Integer
├── nombre_salles_de_bains      : Integer
├── superficie_m2               : Integer (superficie en mètres carrés)
├── adresse                     : Text (adresse complète)
├── ville                       : String
├── pays                        : String
├── code_postal                 : String
├── latitude                    : Decimal (coordonnée GPS)
├── longitude                   : Decimal (coordonnée GPS)
├── fuseau_horaire              : String (ex: "Africa/Porto-Novo")
├── langue_principale           : String (ex: "fr")
├── devise                      : String (ex: "EUR")
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
```

**Relations** :
- Un logement appartient à **un propriétaire** (User) ;
- Un logement a **plusieurs photos** (PropertyPhoto) ;
- Un logement a **plusieurs tarifs** (Tarif) ;
- Un logement a **plusieurs promotions** (Promotion) ;
- Un logement a **plusieurs caractéristiques** (via PropertyCaractéristique) ;
- Un logement a **plusieurs réservations** (Réservation) ;
- Un logement a **plusieurs avis** (Avis) ;
- Un logement a **un calendrier de disponibilité** (Disponibilité) ;
- Un logement a **des règles** (PropertyRègle) ;
- Un logement a **des informations de contact** (PropertyContact).

---

### 1.2 Utilisateur (User)

Représente un client ou un administrateur/propriétaire.

```
Utilisateur
├── id                          : UUID
├── email                       : String (unique)
├── mot_de_passe                : String (hashé)
├── nom                         : String
├── prénom                      : String
├── téléphone                   : String
├── rôle                        : Enum (client, administrateur, gestionnaire, réception, comptabilité, éditeur)
├── avatar_url                  : String (URL de la photo de profil)
├── email_confirme              : Boolean
├── actif                       : Boolean
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
├── dernière_connexion          : DateTime
```

**Relations** :
- Un utilisateur a **plusieurs réservations** (Réservation) ;
- Un utilisateur a **plusieurs avis** (Avis) ;
- Un utilisateur a **plusieurs favoris** (Favori) ;
- Un utilisateur a **plusieurs notifications** (Notification) ;
- Un utilisateur (propriétaire) a **plusieurs logements** (Property).

---

### 1.3 Réservation (Booking)

Représente une réservation effectuée par un client.

```
Réservation
├── id                          : UUID
├── numéro                      : String (numéro unique, ex: "RES-2026-00001")
├── statut                      : Enum (demande_en_attente, réservation_temporaire, en_attente_paiement, confirmée, payée, modifiée, annulée, terminée)
├── logement_id                 : UUID (référence vers le logement)
├── client_id                   : UUID (référence vers le client)
├── date_arrivée                : Date
├── date_départ                  : Date
├── heure_arrivée               : Time (conditionnel, pour réservations horaires)
├── heure_départ                 : Time (conditionnel, pour réservations horaires)
├── type_réservation             : Enum (heure, plusieurs_heures, demi_journée, journée, nuitée, 24_heures, semaine, mois)
├── nombre_adultes              : Integer
├── nombre_enfants              : Integer
├── nombre_bébés                : Integer
├── nombre_voyageurs_total      : Integer (calculé)
├── prix_séjour                 : Decimal (montant du séjour hors taxes/frais)
├── frais_ménage                : Decimal
├── taxe_séjour                 : Decimal
├── suppléments                 : Decimal
├── réductions                  : Decimal
├── prix_total                  : Decimal (prix final)
├── devise                      : String
├── source                      : Enum (site_web, whatsapp, manuelle, ical)
├── notes_internes              : Text (notes visibles uniquement par l'équipe)
├── motif_annulation            : Text (si annulée)
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
```

**Relations** :
- Une réservation concerne **un logement** (Property) ;
- Une réservation est associée **à un client** (User) ;
- Une réservation a **un ou plusieurs paiements** (Paiement) ;
- Une réservation a **un historique** (RéservationHistorique) ;
- Une réservation peut avoir **un ou plusieurs messages** (Message).

---

### 1.4 Tarif (Pricing)

Définit les tarifs d'un logement.

```
Tarif
├── id                          : UUID
├── logement_id                 : UUID (référence vers le logement)
├── type_tarif                  : Enum (standard, horaire, demi_journée, journée, nuitée, 24_heures, hebdomadaire, mensuel)
├── prix                        : Decimal (prix unitaire)
├── devise                      : String
├── jour_de_la_semaine          : Enum (tous, lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche)
├── date_début                  : Date (début de validité)
├── date_fin                    : Date (fin de validité)
├── saison                      : String (optionnel, ex: "haute_saison", "basse_saison")
├── actif                       : Boolean
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
```

**Relations** :
- Un tarif est associé **à un logement** (Property) ;
- Un logement peut avoir **plusieurs tarifs** (par type, par saison, par jour).

---

### 1.5 Promotion

Définit les promotions applicables à un logement.

```
Promotion
├── id                          : UUID
├── logement_id                 : UUID (référence vers le logement)
├── nom                         : String (nom de la promotion)
├── type_réduction              : Enum (pourcentage, montant_fixe)
├── valeur                      : Decimal (valeur de la réduction)
├── date_début                  : Date
├── date_fin                    : Date
├── durée_minimale_nuits        : Integer (durée minimale du séjour pour appliquer la promotion)
├── conditions                  : Text (conditions supplémentaires)
├── actif                       : Boolean
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
```

---

### 1.6 Paiement

Représente un paiement effectué pour une réservation.

```
Paiement
├── id                          : UUID
├── numéro                      : String (numéro unique)
├── réservation_id              : UUID (référence vers la réservation)
├── montant                     : Decimal
├── devise                      : String
├── statut                      : Enum (en_attente, confirmé, échoué, remboursé)
├── moyen_paiement              : Enum (carte_bancaire, paypal, virement_bancaire, autre)
├── référence_externe           : String (ID de transaction du fournisseur de paiement)
├── date_paiement               : DateTime
├── remboursement_montant       : Decimal (montant remboursé si applicable)
├── remboursement_date          : DateTime
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
```

---

### 1.7 Photo (PropertyPhoto)

Photos associées à un logement.

```
Photo
├── id                          : UUID
├── logement_id                 : UUID (référence vers le logement)
├── url                         : String (URL de l'image)
├── url_thumbnail               : String (URL de la miniature)
├── url_medium                  : String (URL en taille moyenne)
├── url_large                   : String (URL en grande taille)
├── ordre                       : Integer (ordre d'affichage)
├── est_principale              : Boolean
├── légende                     : String (description de l'image)
├── créé_le                     : DateTime
```

**Contrainte** : Maximum 20 photos par logement.

---

### 1.8 Caractéristique

Liste des caractéristiques disponibles (équipements, installations, etc.).

```
Caractéristique
├── id                          : UUID
├── nom                         : String
├── catégorie                   : Enum (équipements, chambres_et_salles_de_bains, installations, autre)
├── icône                       : String (nom de l'icône associée)
├── ordre                       : Integer
├── actif                       : Boolean
├── créé_le                     : DateTime
```

**Relation** : Un logement peut avoir **plusieurs caractéristiques** (via PropertyCaractéristique).

---

### 1.9 PropertyCaractéristique (Table de liaison)

```
PropertyCaractéristique
├── logement_id                 : UUID
├── caractéristique_id          : UUID
```

---

### 1.10 Avis (Review)

Avis laissés par les clients.

```
Avis
├── id                          : UUID
├── logement_id                 : UUID (référence vers le logement)
├── client_id                   : UUID (référence vers le client)
├── réservation_id              : UUID (référence vers la réservation)
├── note                        : Integer (1 à 5)
├── commentaire                 : Text
├── statut                      : Enum (en_attente, publié, masqué, supprimé)
├── réponse_admin               : Text (réponse de l'administrateur)
├── date_réponse                : DateTime
├── source                      : Enum (interne, google)
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
```

---

### 1.11 Disponibilité (Availability)

Gestion des créneaux de disponibilité.

```
Disponibilité
├── id                          : UUID
├── logement_id                 : UUID (référence vers le logement)
├── date                        : Date
├── heure_début                 : Time (pour créneaux horaires)
├── heure_fin                   : Time (pour créneaux horaires)
├── statut                      : Enum (disponible, réservé, bloqué, maintenance)
├── réservation_id              : UUID (si réservé, référence vers la réservation)
├── source                      : Enum (manuelle, réservation, ical, maintenance)
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
```

**Règle** : Cette entité est la **source de vérité** pour la disponibilité.

---

### 1.12 Notification

Notifications envoyées aux utilisateurs.

```
Notification
├── id                          : UUID
├── utilisateur_id              : UUID (référence vers le destinataire)
├── type                        : Enum (nouvelle_réservation, demande_whatsapp, paiement, annulation, modification, nouveau_message, nouvel_avis, rappel_arrivée, rappel_départ, disponibilité_libérée, erreur_sync)
├── titre                       : String
├── message                     : Text
├── lue                         : Boolean
├── lien                        : String (URL de redirection)
├── données                     : JSON (données supplémentaires)
├── créé_le                     : DateTime
```

---

### 1.13 Message

Messages échangés entre le client et l'administration.

```
Message
├── id                          : UUID
├── réservation_id              : UUID (référence vers la réservation, optionnel)
├── expéditeur_id               : UUID (référence vers l'expéditeur)
├── destinataire_id             : UUID (référence vers le destinataire)
├── contenu                     : Text
├── lu                          : Boolean
├── créé_le                     : DateTime
```

---

### 1.14 Favori

Logements sauvegardés par un client.

```
Favori
├── id                          : UUID
├── client_id                   : UUID (référence vers le client)
├── logement_id                 : UUID (référence vers le logement)
├── créé_le                     : DateTime
```

---

### 1.15 RéservationHistorique

Historique des modifications d'une réservation.

```
RéservationHistorique
├── id                          : UUID
├── réservation_id              : UUID (référence vers la réservation)
├── action                      : Enum (création, modification, annulation, confirmation, paiement)
├── détails                      : JSON (champs modifiés)
├── effectué_par                : UUID (référence vers l'utilisateur)
├── créé_le                     : DateTime
```

---

### 1.16 Règle

Règles configurables par logement.

```
Règle
├── id                          : UUID
├── logement_id                 : UUID (référence vers le logement)
├── type_règle                  : Enum (annulation, modification, check_in, check_out, séjour, autre)
├── description                 : Text
├── valeur                      : String (valeur de la règle)
├── actif                       : Boolean
├── créé_le                     : DateTime
```

---

### 1.17 PropertyContact

Informations de contact d'un logement.

```
PropertyContact
├── id                          : UUID
├── logement_id                 : UUID (référence vers le logement)
├── adresse                     : Text
├── téléphone                   : String
├── téléphone_secondaire        : String
├── email                       : String
├── whatsapp                    : String
├── nom_établissement           : String
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
```

---

### 1.18 Synchronisation iCal

Enregistre les synchronisations iCal actives.

```
SynchronisationICal
├── id                          : UUID
├── logement_id                 : UUID (référence vers le logement)
├── url_source                  : String (URL du calendrier iCal source)
├── type_sync                   : Enum (import, export)
├── fréquence                   : Enum (manuelle, horaire, quotidienne)
├── dernière_sync               : DateTime
├── statut                      : Enum (active, error, désactivée)
├── message_erreur              : Text
├── créé_le                     : DateTime
├── modifié_le                  : DateTime
```

---

## 2. Relations entre entités

```
User (1) ──────────── (N) Property          [Un propriétaire a plusieurs logements]
User (1) ──────────── (N) Booking           [Un client a plusieurs réservations]
User (1) ──────────── (N) Review            [Un client laisse plusieurs avis]
User (1) ──────────── (N) Notification      [Un utilisateur reçoit plusieurs notifications]
User (1) ──────────── (N) Favorite          [Un client a plusieurs favoris]

Property (1) ──────── (N) PropertyPhoto     [Un logement a plusieurs photos]
Property (1) ──────── (N) Pricing           [Un logement a plusieurs tarifs]
Property (1) ──────── (N) Promotion         [Un logement a plusieurs promotions]
Property (1) ──────── (N) Availability      [Un logement a plusieurs créneaux]
Property (1) ──────── (N) Review            [Un logement reçoit plusieurs avis]
Property (1) ──────── (N) Booking           [Un logement a plusieurs réservations]
Property (1) ──────── (N) Rule              [Un logement a plusieurs règles]
Property (1) ──────── (1) PropertyContact   [Un logement a une fiche de contact]
Property (1) ──────── (N) ICalSync          [Un logement a plusieurs syncs iCal]

Property (N) ──────── (N) Characteristic    [Plusieurs logements ont plusieurs caractéristiques]

Booking (1) ───────── (N) Payment           [Une réservation a plusieurs paiements]
Booking (1) ───────── (N) BookingHistory    [Une réservation a plusieurs entrées d'historique]
Booking (1) ───────── (N) Message           [Une réservation a plusieurs messages]
```

---

## 3. Index recommandés

Pour garantir les performances, les index suivants sont recommandés :

| Table | Index | Justification |
|-------|-------|---------------|
| Property | `statut`, `type`, `propriétaire_id` | Recherche et filtrage |
| Booking | `logement_id`, `date_arrivée`, `date_départ` | Vérification de disponibilité |
| Booking | `client_id`, `statut` | Historique client |
| Availability | `logement_id`, `date` | Recherche de disponibilité |
| Pricing | `logement_id`, `type_tarif`, `date_début`, `date_fin` | Calcul tarifaire |
| Review | `logement_id`, `statut` | Affichage des avis |
| Payment | `réservation_id`, `statut` | Suivi des paiements |

---

## 4. Considérations de sécurité

- **Chiffrement des données sensibles** : mots de passe, informations de paiement ;
- **Journalisation** : toutes les actions critiques doivent être tracées (RéservationHistorique) ;
- **Accès contrôlé** : chaque utilisateur ne doit accéder qu'aux données auxquelles il a droit ;
- **Suppression logique** : les suppressions doivent être logiques (champ `actif` ou `supprimé_le`) plutôt que physiques pour les données importantes.
