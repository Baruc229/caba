# Moteur de Recherche et de Disponibilité — Caba Résidence

Ce document décrit en détail le moteur de recherche et le moteur de disponibilité,
deux composants critiques et interdépendants de la plateforme.

---

## 1. Moteur de recherche

### 1.1 Emplacement

Le moteur de recherche doit être :
- **disponible sur la page d'accueil** (section Hero) ;
- **accessible depuis toutes les pages du site** (barre de navigation ou raccourci).

### 1.2 Critères de recherche

Le visiteur doit pouvoir rechercher selon les critères suivants :

| Critère | Type | Obligatoire | Notes |
|---------|------|-------------|-------|
| Date d'arrivée | Date | Oui | Format JJ/MM/AAAA |
| Date de départ | Date | Oui | Doit être postérieure à la date d'arrivée |
| Heure d'arrivée | Heure | Conditionnel | Affiché uniquement pour les logements autorisant les réservations horaires |
| Heure de départ | Heure | Conditionnel | Idem |
| Nombre d'adultes | Entier | Oui | Minimum 1 |
| Nombre d'enfants | Entier | Non | Défaut : 0 |
| Nombre de bébés | Entier | Non | Défaut : 0 |
| Type de logement | Liste | Non | Filtrer par type (chambre, villa, etc.) |
| Nombre de chambres | Entier | Non | Filtrer par nombre de chambres |
| Nombre de lits | Entier | Non | Filtrer par nombre de lits |
| Équipements | Liste | Non | Filtrer par équipements spécifiques |
| Prix minimum | Montant | Non | Filtrer par fourchette de prix |
| Prix maximum | Montant | Non | Filtrer par fourchette de prix |
| Durée du séjour | Calculée | Non | Calculée à partir des dates |
| Type de réservation | Liste | Non | Horaire, nuitée, 24h, semaine, mois |

### 1.3 Adaptation automatique

Les critères doivent **s'adapter automatiquement** au type de logement et au mode de réservation.

**Règles d'adaptation** :

- Si un logement autorise **uniquement les nuitées** → les options horaires ne sont **pas affichées**.
- Si un logement autorise les **réservations horaires** → les sélecteurs d'heures sont **affichés**.
- Si un logement autorise les **séjours longue durée** (semaine, mois) → le champ durée est **mis en avant**.

### 1.4 Résultats de recherche

Après soumission, le système affiche **uniquement les logements correspondant aux critères et réellement disponibles**.

**Chaque résultat doit afficher** :

| Élément | Description |
|---------|-------------|
| Photo principale | Première image du logement |
| Nom | Nom du logement |
| Type | Type (chambre, villa, etc.) |
| Capacité | Nombre total de voyageurs |
| Nombre de chambres | Nombre de chambres |
| Nombre de lits | Nombre de lits |
| Équipements principaux | Les 3-5 équipements les plus importants |
| Note | Note moyenne (étoiles) |
| Nombre d'avis | Nombre total d'avis |
| Prix calculé | Prix basé sur les dates sélectionnées |
| Promotion éventuelle | Réduction appliquée le cas échéant |
| Disponibilité | Statut de disponibilité |
| Bouton « Voir le logement » | Accès à la page détaillée |
| Bouton « Réserver » | Réservation directe (si possible) |

### 1.5 Cohérence des prix

**Règle absolue** : Le prix affiché dans les résultats de recherche doit utiliser **exactement le même moteur de tarification** que la page de réservation.

**Il ne doit jamais exister de différence inexpliquée entre** :
```
prix affiché dans la recherche
  → prix de la page logement
  → prix final
```

Toute incohérence est considérée comme un **bug critique**.

---

## 2. Moteur de disponibilité en temps réel

### 2.1 Principe fondamental

Le moteur de disponibilité est une **fonctionnalité centrale et critique**.

Il doit **toujours** interroger la disponibilité réelle enregistrée dans le back-office.

**Le système ne doit JAMAIS afficher comme disponible un logement qui ne l'est pas.**

### 2.2 Sources d'indisponibilité

Le moteur doit prendre en compte **toutes** les sources d'indisponibilité suivantes :

| Source | Description | Priorité |
|--------|-------------|----------|
| Réservation confirmée | Réservation validée et payée | Haute |
| Réservation en attente | Réservation créée mais non encore confirmée | Haute |
| Réservation WhatsApp | Demande reçue via WhatsApp | Moyenne |
| Réservation manuelle | Saisie par l'administrateur dans le back-office | Haute |
| Blocage administratif | Bloqué manuellement par l'administrateur | Haute |
| Maintenance | Logement en cours de maintenance | Haute |
| Synchronisation iCal | Bloqué par un calendrier externe | Moyenne |
| Horaires d'arrivée/départ | Créneau non disponible selon les horaires configurés | Moyenne |
| Durée minimale | Séjour trop court par rapport au minimum configuré | Basse |
| Durée maximale | Séjour trop long par rapport au maximum configuré | Basse |
| Capacité maximale | Nombre de voyageurs dépassant la capacité | Basse |

### 2.3 Vérification de disponibilité

Pour chaque requête de disponibilité, le moteur doit :

1. **Récupérer le logement** demandé ;
2. **Vérifier le statut** du logement (actif, en maintenance, etc.) ;
3. **Croiser toutes les sources** d'indisponibilité ;
4. **Vérifier les contraintes** (durée, capacité, horaires) ;
5. **Retourner le résultat** : disponible ou indisponible, avec la raison si indisponible.

### 2.4 Logique de vérification

```
POUR CHAQUE logement DEMANDÉ :
  SI statut = maintenance OU désactivé :
    RETOURNER indisponible

  POUR CHAQUE réservation EXISTANTE SUR LA PÉRIODE :
    SI chevauchement détecté :
      RETOURNER indisponible (raison : réservation existante)

  POUR CHAQUE blocage EXISTANT SUR LA PÉRIODE :
    SI chevauchement détecté :
      RETOURNER indisponible (raison : blocage)

  POUR CHAQUE synchronisation iCal ACTIVE :
    SI chevauchement détecté :
      RETOURNER indisponible (raison : sync externe)

  SI durée séjour < durée minimale configurée :
    RETOURNER indisponible (raison : durée insuffisante)

  SI durée séjour > durée maximale configurée :
    RETOURNER indisponible (raison : durée excessive)

  SI nombre voyageurs > capacité maximale :
    RETOURNER indisponible (raison : capacité dépassée)

  RETOURNER disponible
```

---

## 3. Disponibilité pour les réservations horaires

### 3.1 Principe

Le système ne doit **pas** fonctionner uniquement selon le principe binaire :
```
Disponible / Indisponible pour une journée entière
```

Pour les logements autorisant les réservations horaires, le système doit gérer des **créneaux horaires**.

### 3.2 Gestion des créneaux

**Exemple concret** :

```
Date : 17 août 2026

Créneau 1 : 08h00 – 12h00 → DISPONIBLE
Créneau 2 : 12h00 – 16h00 → RÉSERVÉ
Créneau 3 : 16h00 – 22h00 → DISPONIBLE
```

Le client doit pouvoir sélectionner **uniquement un créneau réellement libre**.

### 3.3 Réservation à la nuitée

Pour une réservation à la nuitée, le moteur applique les **horaires d'arrivée et de départ configurés** pour le logement.

**Exemple** :
- Heure d'arrivée configurée : 15h00
- Heure de départ configurée : 11h00
- Si le logement est occupé la nuit précédente (départ à 11h00), il est disponible à partir de 11h00 pour une nuitée commençant à 15h00.

### 3.4 Réservation de 24 heures

Pour une réservation de 24 heures, la période est calculée à partir de l'**heure d'arrivée effective** du client.

**Exemple** :
- Le client arrive à 14h00 le 17 août
- La réservation est valable jusqu'à 14h00 le 18 août
- Le créneau suivant (à partir de 14h00 le 18 août) doit être vérifié séparément

---

## 4. Verrouillage des disponibilités

### 4.1 Objectif

Lorsqu'un client commence une réservation, le système doit pouvoir **temporairement verrouiller** le créneau pour éviter qu'un autre client ne le réserve simultanément.

### 4.2 Cycle de vie du verrouillage

```
1. Vérifier la disponibilité
   ↓
2. Calculer le prix
   ↓
3. Créer un verrouillage temporaire (TTL : 15-30 minutes)
   ↓
4. Effectuer le paiement
   ↓
5. Vérifier à nouveau la disponibilité (avant confirmation)
   ↓
6. Confirmer la réservation
   ↓
7. Supprimer le verrouillage temporaire
   ↓
8. Bloquer définitivement le créneau
   ↓
9. Mettre à jour les calendriers
```

### 4.3 Expiration du verrouillage

- Si le paiement n'est pas effectué dans le délai imparti, le verrouillage expire automatiquement.
- Le créneau est libéré et redevient disponible pour d'autres clients.

### 4.4 Libération automatique

Une réservation **expirée** ou **annulée** doit libérer automatiquement le créneau lorsque les conditions le permettent.

**Conditions de libération** :
- La réservation n'est plus dans un état actif ;
- Aucun autre verrouillage n'est en cours sur le même créneau ;
- La synchronisation iCal n'est pas en cours.

---

## 5. Calendrier de disponibilité

### 5.1 Affichage

La page de chaque logement doit présenter un **calendrier** affichant :

- Mois actuel ;
- Mois suivant ;
- Jours disponibles ;
- Jours indisponibles ;
- Créneaux horaires (si applicable) ;
- Blocages ;
- Réservations.

### 5.2 Légende

Un **tooltip** doit expliquer les différents états :

| Couleur/Symbole | Signification |
|-----------------|---------------|
| Vert | Disponible |
| Rouge | Réservé |
| Gris | Bloqué / Indisponible |
| Orange | En attente de confirmation |
| Bleu | Maintenance |

### 5.3 Connexion au moteur

Le calendrier doit être **directement connecté** au moteur de disponibilité.

**Toute modification** dans le back-office (nouvelle réservation, blocage, maintenance) doit se refléter **immédiatement** dans le calendrier public.

---

## 6. Considérations de performance

### 6.1 Cache intelligent

- Les disponibilités doivent être cachées avec un **TTL court** (quelques secondes) pour garantir la fraîcheur des données.
- Les informations de base du logement (nom, photos, description) peuvent être cachées plus longtemps.

### 6.2 Requêtes optimisées

- Les requêtes de disponibilité doivent utiliser des **index de base de données** optimisés.
- Les plages de dates doivent être vérifiées via des **requêtes spatiales** efficaces.

### 6.3 Latence cible

- Réponse de disponibilité : **< 200 ms**
- Résultats de recherche : **< 500 ms**
- Affichage du calendrier : **< 300 ms**

---

## 7. Cas de test — Recherche et disponibilité

### Scénario 1 : Recherche simple

**Données** :
- Date d'arrivée : 17 août 2026
- Date de départ : 20 août 2026
- 2 adultes
- Type : chambre

**Résultat attendu** :
- Le système retourne uniquement les chambres disponibles pour 3 nuits
- Les chambres avec réservation existante sur cette période ne sont pas affichées
- Le prix affiché correspond au tarif applicable (3 nuits)

### Scénario 2 : Vérification horaire

**Données** :
- Logement : Chambre A (autorise les réservations horaires)
- Créneau demandé : 17 août, 12h00 – 16h00

**État existant** :
- Chambre A est réservée de 08h00 à 12h00 le 17 août

**Résultat attendu** :
- Le créneau 12h00 – 16h00 est disponible (le précédent se termine à 12h00)
- Le système propose de réserver ce créneau

### Scénario 3 : Conflit de réservation

**Données** :
- Logement : Villa B
- Période demandée : 1 au 15 septembre 2026

**État existant** :
- Villa B est réservée du 5 au 10 septembre 2026

**Résultat attendu** :
- La Villa B n'est **pas affichée** comme disponible pour la période complète
- Le système pourrait suggérer des périodes alternatives (1-4 septembre ou 11-15 septembre)
