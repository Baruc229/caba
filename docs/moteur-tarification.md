# Moteur de Tarification — Caba Résidence

Ce document décrit en détail le moteur de tarification, responsable du calcul automatique
des prix pour toutes les réservations.

---

## 1. Principes fondamentaux

### 1.1 Règle absolue

Le moteur de tarification doit **toujours** retourner le même prix pour les mêmes paramètres.

**Il ne doit jamais exister de différence inexpliquée entre** :
```
prix affiché dans la recherche
  → prix de la page logement
  → prix final de réservation
```

Toute incohérence est considérée comme un **bug critique**.

### 1.2 Instantanéité

Le calcul du prix doit être **instantané**. Le client ne doit jamais attendre pour connaître le prix final.

---

## 2. Unités de réservation

Le système doit gérer trois unités de réservation principales, avec des définitions claires pour lever toute ambiguïté.

### 2.1 Nuitée

**Définition** : Séjour classique avec arrivée le soir et départ le lendemain matin, aux horaires configurés pour le logement.

**Exemple** :
- Arrivée : 15h00 le 17 août
- Départ : 11h00 le 18 août
- Durée : 1 nuitée

### 2.2 24 heures

**Définition** : Période de 24 heures calculée à partir de l'heure d'arrivée effective du client, quelle que soit cette heure.

**Exemple** :
- Arrivée : 14h00 le 17 août
- Départ : 14h00 le 18 août
- Durée : 24 heures

### 2.3 Journée

**Définition** : Usage de jour uniquement, sans nuitée. Le logement doit être libéré avant la nuit.

**Exemple** :
- Arrivée : 08h00 le 17 août
- Départ : 18h00 le 17 août
- Durée : 1 journée (pas de nuitée)

---

## 3. Grille tarifaire complète

### 3.1 Types de tarifs

Le système doit pouvoir gérer les types de tarifs suivants :

| Type de tarif | Description | Unité |
|---------------|-------------|-------|
| Tarif standard | Prix de base par nuit | Par nuit |
| Tarif horaire | Prix par heure d'utilisation | Par heure |
| Tarif demi-journée | Prix pour une demi-journée (4-6h) | Par demi-journée |
| Tarif journée | Prix pour une journée complète sans nuitée | Par journée |
| Tarif nuitée | Prix pour une nuitée complète | Par nuitée |
| Tarif 24 heures | Prix pour une période de 24 heures | Par 24h |
| Tarif hebdomadaire | Prix pour 7 nuits et plus | Par semaine |
| Tarif mensuel | Prix pour 30 nuits et plus | Par mois |
| Tarifs saisonniers | Tarifs variant selon la période | Variable |
| Tarifs week-end | Tarifs spéciaux pour le week-end | Par nuit (sam-dim) |
| Tarifs longue durée | Tarifs réduits pour les séjours prolongés | Par nuit |

### 3.2 Déclencheurs de tarification

Le moteur doit appliquer automatiquement le tarif le plus avantageux pour le client, en fonction de :

- **Durée du séjour** : 7 nuits → tarif hebdomadaire, 30 nuits → tarif mensuel ;
- **Période** : tarifs saisonniers, tarifs week-end ;
- **Heure** : tarif horaire, demi-journée, journée ;
- **Type de réservation** : nuitée, 24 heures, semaine, mois.

### 3.3 Hiérarchie des tarifs

Lorsque plusieurs tarifs s'appliquent, le système doit appliquer le tarif le plus favorable au client :

```
Tarif le plus bas = MIN(
  tarif standard × nombre_nuits,
  tarif_hebdomadaire × nombre_semaines + tarif_standard × nuits_restantes,
  tarif_mensuel * nombre_mois + tarif_standard * nuits_restantes
)
```

---

## 4. Frais et taxes

### 4.1 Frais de ménage

- Montant fixe par réservation ;
- Configurable par logement ;
- Appliqué une seule fois quelle que soit la durée.

**Exemple** : Frais de ménage = 45 €

### 4.2 Taxe de séjour

- Montant par nuit et par personne ;
- Calculée sur la base du nombre total de voyageurs (adultes + enfants) ;
- Les bébés peuvent être exemptés (configurable).

**Exemple** :
```
Taxe de séjour = 2 €/nuit/personne × 9 voyageurs × 15 nuits = 270 €
```

### 4.3 Suppléments

- Supplément pour animal de compagnie ;
- Supplément pour parking ;
- Supplément pour vue panoramique ;
- Tout supplément configurable par le propriétaire.

### 4.4 Taxes locales

- Taxes municipales ;
- Taxes touristiques ;
- Toute taxe imposée par la réglementation locale.

---

## 5. Promotions et réductions

### 5.1 Types de promotions

| Type | Description | Exemple |
|------|-------------|---------|
| Réduction pourcentage | Réduction en pourcentage sur le montant total | -10 % |
| Réduction montant | Réduction fixe sur le montant total | -50 € |
| Réduction longue durée | Réduction automatique pour les séjours prolongés | -15 % après 7 nuits |
| Réduction réservation anticipée | Réduction pour les réservations faites à l'avance | -10 % si réservé 30 jours à l'avance |
| Offre spéciale | Promotion définie manuellement | Prix fixe pour une période donnée |

### 5.2 Conditions d'application

Chaque promotion doit pouvoir définir :

- **Logement concerné** : un ou plusieurs logements ;
- **Date de début** : date de début de validité ;
- **Date de fin** : date de fin de validité ;
- **Durée minimale** : durée minimum du séjour pour appliquer la réduction ;
- **Conditions supplémentaires** : nombre minimum de voyageurs, période de l'année, etc.

### 5.3 Cumul des promotions

**Règle** : Par défaut, les promotions ne se cumulent pas. La promotion la plus avantageuse est appliquée.

**Exception** : Cumul autorisé uniquement si configuré explicitement par le propriétaire.

---

## 6. Calcul du prix final

### 6.1 Formule générale

```
Prix final = (Prix unitaire × Nombre d'unités)
           + Frais de ménage
           + Taxe de séjour
           + Suppléments
           - Réductions/Promotions
```

### 6.2 Détail du calcul

Le système doit afficher un **détail complet** du calcul au client :

```
Exemple de réservation :

Date d'arrivée : 17 août 2026
Date de départ : 01 septembre 2026
Voyageurs : 9 (7 adultes + 2 enfants)

Détail :
  200 € × 15 nuits                    = 3 000 €
  Frais de ménage                      =    45 €
  Taxe de séjour (2 € × 9 × 15)       =   270 €
                                       --------
  TOTAL                                = 3 315 €
```

### 6.3 Vérification du calcul

**Cas de test avec données exactes** :

**Données** :
- Logement : Appartement meublé
- Tarif standard : 235 €/nuit
- Tarif 7 jours et plus : 200 €/nuit
- Tarif 30 jours et plus : 150 €/nuit
- Frais de ménage : 45 €
- Taxe de séjour : 2 €/nuit/personne
- Séjour : 17 août au 1 septembre 2026 (15 nuits)
- Voyageurs : 9 (7 adultes + 2 enfants)

**Calcul** :
```
Tarif applicable : 200 €/nuit (car 15 nuits ≥ 7 jours)

Prix séjour : 200 € × 15 nuits = 3 000 €
Frais de ménage : 45 €
Taxe de séjour : 2 € × 9 personnes × 15 nuits = 270 €

TOTAL : 3 000 + 45 + 270 = 3 315 €
```

**Résultat attendu** : 3 315 €

---

## 7. Configuration par logement

### 7.1 Paramètres tarifaires

Chaque logement doit pouvoir configurer :

- Prix par nuit (tarif standard) ;
- Prix par heure ;
- Prix par demi-journée ;
- Prix par journée ;
- Prix par nuitée ;
- Prix pour 24 heures ;
- Prix hebdomadaire ;
- Prix mensuel ;
- Frais de ménage ;
- Taxe de séjour ;
- Suppléments ;
- Durée minimale ;
- Durée maximale ;
- Promotion par défaut.

### 7.2 Tarifs saisonniers

Le propriétaire doit pouvoir définir des tarifs différents selon :

- Période de l'année (haute saison, basse saison) ;
- Jour de la semaine (week-end vs semaine) ;
- Événements spéciaux.

### 7.3 Hiérarchie des tarifs

```
Tarif saisonnier (si applicable)
  > Tarif longue durée (si applicable)
  > Tarif standard
```

Le tarif le plus avantageux pour le client est toujours appliqué.

---

## 8. Considérations techniques

### 8.1 Performance

- Le calcul du prix doit être **instantané** (< 100 ms) ;
- Le cache des tarifs doit être invalidé lors de toute modification ;
- Les tarifs doivent être pré-calculés pour les périodes les plus courantes.

### 8.2 Précision

- Tous les calculs doivent utiliser la **précision décimale** (pas de arrondis intermédiaires) ;
- L'arrondi final doit être fait au centime près ;
- La devise doit être affichée avec le symbole approprié (€).

### 8.3 Traçabilité

- Chaque calcul de prix doit pouvoir être **tracé** (quel tarif a été appliqué, quelles promotions, quelles taxes) ;
- Le détail du calcul doit être conservé avec la réservation.

---

## 9. Cas de test supplémentaires

### Cas de test 1 : Séjour court (nuitée)

**Données** :
- Logement : Chambre A
- Tarif standard : 80 €/nuit
- Séjour : 1 nuit (17 au 18 août 2026)
- 2 adultes

**Calcul** :
```
Prix séjour : 80 € × 1 nuit = 80 €
Frais de ménage : 20 €
Taxe de séjour : 1,50 € × 2 personnes × 1 nuit = 3 €

TOTAL : 80 + 20 + 3 = 103 €
```

### Cas de test 2 : Séjour horaire

**Données** :
- Logement : Studio B (autorise les réservations horaires)
- Tarif horaire : 15 €/heure
- Séjour : 3 heures (17 août, 10h00 – 13h00)
- 1 adulte

**Calcul** :
```
Prix séjour : 15 € × 3 heures = 45 €
Frais de ménage : 10 €
Taxe de séjour : 1,50 € × 1 personne × 0 nuit = 0 € (pas de nuitée)

TOTAL : 45 + 10 + 0 = 55 €
```

### Cas de test 3 : Promotion appliquée

**Données** :
- Logement : Villa C
- Tarif standard : 350 €/nuit
- Promotion : -15 % pour réservation anticipée (plus de 30 jours à l'avance)
- Séjour : 10 nuits (15 au 25 septembre 2026)
- Réservation effectuée le 10 août 2026 (36 jours avant)
- 4 adultes + 2 enfants

**Calcul** :
```
Prix séjour brut : 350 € × 10 nuits = 3 500 €
Réduction anticipée (15 %) : 3 500 × 0,15 = 525 €
Prix séjour net : 3 500 - 525 = 2 975 €
Frais de ménage : 80 €
Taxe de séjour : 2 € × 6 personnes × 10 nuits = 120 €

TOTAL : 2 975 + 80 + 120 = 3 175 €
```
