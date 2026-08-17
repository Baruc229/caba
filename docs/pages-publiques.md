# Pages Publiques — Caba Résidence

Ce document décrit toutes les pages publiques du site : page d'accueil,
page individuelle de logement et pages de contenu.

---

## 1. Page d'accueil

La page d'accueil doit être conçue comme une **plateforme de réservation**
et non comme une simple présentation.

### 1.1 Hero

Le Hero est la première section visible. Il doit présenter Caba Résidence
avec une photographie réelle et professionnelle en arrière-plan.

**Contenu du Hero** :
- Présentation courte de Caba Résidence (1-2 phrases) ;
- **Moteur de recherche** intégré :
  - Date d'arrivée ;
  - Date de départ ;
  - Nombre de voyageurs (adultes, enfants, bébés) ;
  - Type de logement (optionnel) ;
  - Bouton de recherche.

**Règle** : Le moteur de recherche doit être immédiatement compréhensible
et utilisable sans instruction.

---

### 1.2 Sections de la page d'accueil

La page d'accueil est composée des sections suivantes, dans l'ordre :

#### Section 1 : Hero / Recherche
Recherche directe de logements.

#### Section 2 : Types de logements
Affichage des 8 types de logements :
- Chambres ;
- Chambres avec salon ;
- Studios ;
- Appartements meublés ;
- Suites ;
- Villas ;
- Duplex ;
- Maisons entières.

Chaque type est représenté par une image et un lien vers la recherche filtrée.

#### Section 3 : Logements disponibles
Grille dynamique des logements disponibles.
Affiche les logements les mieux notés ou les plus populaires.

#### Section 4 : Promotions
Logements bénéficiant de réductions actives.
Affiche le pourcentage de réduction et le prix barré.

#### Section 5 : Séjours longue durée
Mise en avant des tarifs hebdomadaires et mensuels.
Explique les avantages d'un séjour longue durée.

#### Section 6 : Expérience Caba Résidence
Présentation des principaux avantages :
- Emplacement ;
- Service ;
- Confort ;
- Équipements.

#### Section 7 : Galerie
Sélection de photos représentatives de Caba Résidence.
**À distinguer de la galerie propre à chaque logement** (voir §2.4).
Cette galerie met en avant le complexe dans son ensemble.

#### Section 8 : Avis
Avis clients et avis Google lorsque disponibles.
Affiche la note moyenne et quelques avis sélectionnés.

#### Section 9 : Localisation
Carte interactive et informations pratiques :
- Adresse ;
- Accès ;
- Parkings à proximité ;
- Points d'intérêt.

#### Section 10 : CTA final
Invitation à vérifier les disponibilités et réserver.
Bouton vers le moteur de recherche.

---

## 2. Page individuelle d'un logement

La page Single doit être particulièrement soignée.
Elle doit être : élégante, rapide, claire, facile à comprendre,
responsive et optimisée pour la réservation.

### 2.1 En-tête

**À gauche** :
- Nom du logement ;
- Type ;
- Localisation ;
- Note (étoiles) ;
- Nombre d'avis.

**À droite** :
- Prix ;
- Unité tarifaire (ex. : "par nuit").

**Règle** : La note et le nombre d'avis n'apparaissent qu'une fois, à gauche, près du nom.

---

### 2.2 Galerie photo

Chaque logement peut contenir jusqu'à **20 photos**.

#### Disposition desktop (3 colonnes)

```
┌──────────────────┬───────────────┬───────────────┐
│                  │               │               │
│                  │    Image 2    │    Image 4    │
│     Image 1      │               │               │
│                  ├───────────────┼───────────────┤
│                  │    Image 3    │    Image 5    │
│                  │               │               │
└──────────────────┴───────────────┴───────────────┘
```

- Image 1 : grande zone (gauche) ;
- Images 2 et 3 : empilées au milieu ;
- Images 4 et 5 : empilées à droite ;
- Bouton "Voir toutes les photos" si plus de 5 photos.

#### Disposition mobile
- Galerie tactile et optimisée pour l'écran ;
- Swipe horizontal ;
- Indicateur de position.

#### Règles
- Fonctionnement propre avec 1 à 20 photos ;
- Aucun débordement, mauvaise proportion, espace incohérent,
  image déformée, alignement incorrect ou scroll horizontal involontaire.

---

### 2.3 Informations principales

Sous la galerie, présenter **deux colonnes sur desktop**.

#### Colonne principale (gauche)

- Type de logement ;
- Capacité ;
- Nombre de chambres ;
- Nombre de lits ;
- Nombre de salles de bains ;
- Caractéristiques principales.

**Exemple** :
```
Appartement entier

4 voyageurs · 2 chambres · 3 lits · 2 salles de bains
```

Des icônes cohérentes doivent accompagner les informations.

#### Colonne de réservation (droite)
Voir §2.7.

---

### 2.4 Navigation rapide

Après le dépassement de la galerie, une navigation rapide doit apparaître.

**Liens** :
- Description ;
- Tarifs ;
- Caractéristiques ;
- Disponibilité ;
- Avis ;
- Localisation.

**Règle** : La navigation doit être discrète, sticky lorsque nécessaire
et parfaitement adaptée au mobile.

---

### 2.5 Description

La section Description doit contenir :
- Description courte ;
- Description complète ;
- Informations importantes ;
- Règles ;
- Informations supplémentaires.

Tout doit être administrable depuis le back-office.

---

### 2.6 Tarifs

La section Tarifs affiche la grille tarifaire du logement.

**Exemple** :
```
Prix par nuit : 235 €
Prix par nuit — 7 jours et plus : 200 €
Prix par nuit — 30 jours et plus : 150 €
Frais de ménage : 45 €
Taxe de séjour : 2 € par nuit et par personne
Nombre minimum de nuits : 2
Réduction réservation anticipée : 10 %
```

Voir `moteur-tarification.md` pour les détails du calcul.

---

### 2.7 Formulaire de réservation

La colonne de réservation doit être **sticky sur desktop**.

**Champs** :

| Champ | Description |
|-------|-------------|
| Arrivée | Date et heure (si applicable) |
| Départ | Date et heure (si applicable) |
| Voyageurs | Adults / Enfants / Bébés avec sélecteur −/+ |

Chaque catégorie de voyageurs doit utiliser :
```
−  Nombre  +
```
avec une indication sur les tranches d'âge.

#### Calcul du prix en temps réel

Le formulaire doit afficher le détail du prix en temps réel :

```
Book Now

17-08-2026
01-09-2026

9 Guests

200 € × 15 nuits
3 000 €

Cleaning Fee
45 €

City Fee
270 €

TOTAL
3 315 €
```

Le calcul doit être **instantané**.

#### Boutons d'action

- **Réserver** : lance la réservation en ligne ;
- **Demander via WhatsApp** : envoie une demande WhatsApp ;
- **Partager** : partage le lien du logement ;
- **Contacter** : accès aux informations de contact.

---

### 2.8 Calendrier

La section Calendrier affiche les disponibilités du logement.

**Contenu** :
- Mois actuel ;
- Mois suivant ;
- Jours disponibles ;
- Jours indisponibles ;
- Créneaux horaires (si applicable) ;
- Blocages.

**Tooltip** : Un tooltip explique les différents états (disponible, réservé, bloqué, maintenance).

**Règle** : Le calendrier est directement connecté au moteur de disponibilité.

---

### 2.9 Avis

La section Avis affiche :
- Note moyenne ;
- Étoiles ;
- Nombre d'avis ;
- Avis individuels :
  - Auteur ;
  - Date ;
  - Note ;
  - Commentaire ;
  - Réponse administrateur (le cas échéant).

**Modération** : L'administrateur peut modérer, publier, masquer,
supprimer et répondre aux avis.

---

### 2.10 Localisation

La dernière section de la page logement présente :

**Localisation** avec :
- Carte interactive ;
- Adresse ;
- Accès ;
- Informations pratiques ;
- Points d'intérêt éventuels.

---

### 2.11 Contact et partage

Sous la colonne de réservation :

**Partager** : Liens de partage (Facebook, Twitter, copier le lien).

**Contacter** :
- Adresse ;
- Téléphone ;
- Téléphone secondaire ;
- Email ;
- WhatsApp ;
- Nom de Caba Résidence.

---

## 3. Pages légales et contenu

### 3.1 Pages obligatoires

| Page | Description |
|------|-------------|
| À propos | Présentation de Caba Résidence |
| Contact | Formulaire de contact + informations |
| Mentions légales | Informations légales |
| Conditions générales | CGV de la plateforme |
| Politique de confidentialité | RGPD et protection des données |
| Politique d'annulation | Règles d'annulation |
| Conditions de réservation | Conditions spécifiques à la réservation |
| Politique de cookies | Utilisation des cookies |

### 3.2 Pages optionnelles

| Page | Description |
|------|-------------|
| Blog | Articles et actualités |
| Services | Description des services proposés |
| FAQ | Questions fréquentes |
| Carrières | Offres d'emploi |

---

## 4. Règles de design pour les pages publiques

- Design minimaliste, premium, moderne, professionnel, élégant, clair ;
- Palette : bleu clair, noir, blanc, gris ;
- Conteneur : 1400 px maximum ;
- Le bleu comme couleur d'accent, pas dominante ;
- Icônes d'une même famille graphique ;
- Aucun emoji ;
- Pas de template WordPress, dashboard SaaS, site IA, clone Airbnb ;
- Identité visuelle propre à Caba Résidence.
