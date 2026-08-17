# Design System — Caba Résidence

Ce document définit le design system de la plateforme, incluant la palette de couleurs,
la typographie, les icônes, les principes de responsive design et l'identité visuelle.

---

## 1. Principes de design

Le design de Caba Résidence doit être :

- **Minimaliste** : l'essentiel, rien de superflu ;
- **Premium** : sensation de qualité et de luxe ;
- **Moderne** : tendances actuelles du web design ;
- **Professionnel** : digne d'une plateforme de réservation haut de gamme ;
- **Élégant** : lignes pures, espaces généreux ;
- **Clair** : navigation intuitive, informations lisibles.

---

## 2. Palette de couleurs

### 2.1 Couleurs principales

| Couleur | Rôle | Valeur approximative |
|---------|------|----------------------|
| Bleu clair | Couleur d'accent (CTA, liens, éléments actifs) | #4A90D9 |
| Noir | Texte principal, titres | #1A1A1A |
| Blanc | Fond principal, espaces | #FFFFFF |
| Gris clair | Fond secondaire, bordures | #F5F5F5 |
| Gris moyen | Texte secondaire, icônes | #6B7280 |
| Gris foncé | Séparateurs, bordures | #D1D5DB |

### 2.2 Règles d'utilisation

- Le **bleu** doit être utilisé comme couleur d'accent et **non comme couleur dominante partout** ;
- Le **noir** est réservé au texte principal et aux titres ;
- Le **blanc** est la couleur de fond par défaut ;
- Le **gris** est utilisé pour les éléments secondaires et les séparateurs.

### 2.3 États interactifs

| État | Couleur | Description |
|------|---------|-------------|
| Normal | Couleur de base | État par défaut |
| Survol (hover) | Couleur assombrie de 10 % | Au passage de la souris |
| Actif (active) | Couleur assombrie de 20 % | Au clic |
| Focus | Contour bleu | Sélection au clavier |
| Désactivé | Gris clair, opacity 50 % | Élément non interactif |
| Erreur | Rouge | Message d'erreur |
| Succès | Vert | Confirmation |

---

## 3. Typographie

### 3.1 Police principale

Utiliser une police moderne et lisible :
- **Titres** : police sans-serif élégante (ex. : Inter, Plus Jakarta Sans) ;
- **Corps de texte** : police sans-serif lisible (ex. : Inter, DM Sans).

### 3.2 Hiérarchie

| Élément | Taille | Poids | Espacement |
|---------|--------|-------|------------|
| H1 | 36-48px | Bold (700) | -0.02em |
| H2 | 28-36px | Semi-Bold (600) | -0.01em |
| H3 | 22-28px | Semi-Bold (600) | Normal |
| H4 | 18-22px | Medium (500) | Normal |
| Corps | 16px | Regular (400) | 1.5-1.6 |
| Petit | 14px | Regular (400) | 1.4-1.5 |
| Légende | 12px | Regular (400) | 1.3-1.4 |

### 3.3 Règles

- Maximum 2 polices différentes sur le site ;
- Line-height : 1.5 minimum pour le corps de texte ;
- Contraste respecté (WCAG AA minimum) ;
- Aucun texte en dessous de 12px.

---

## 4. Icônes

### 4.1 Famille d'icônes

Toutes les icônes doivent appartenir à **une même famille graphique**.

Recommandations :
- Phosphor Icons ;
- Lucide Icons ;
- Heroicons.

### 4.2 Tailles

| Taille | Usage |
|--------|-------|
| 16px | Icônes inline avec texte |
| 20px | Icônes dans les boutons |
| 24px | Icônes de navigation |
| 32px | Icônes de mise en avant |
| 48px | Icônes hero/section |

### 4.3 Style

- Style outline (trait) par défaut ;
- Style filled pour les états actifs ;
- Épaisseur de trait : 1.5px ou 2px ;
- Toujours accompagnées d'un label ou d'un tooltip si non évidentes.

---

## 5. Espacement et grille

### 5.1 Système d'espacement

Utiliser une échelle d'espacement cohérente (base : 4px ou 8px) :

| Token | Taille |
|-------|--------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

### 5.2 Conteneur

- Largeur maximale : **1400 px** ;
- Marges latérales automatiques ;
- Padding intérieur : 16px (mobile), 24px (tablette), 32px (desktop).

### 5.3 Grille

- Desktop : 12 colonnes ;
- Tablette : 8 colonnes ;
- Mobile : 4 colonnes ;
- Gouttière : 16px (mobile), 24px (desktop).

---

## 6. Responsive Design

### 6.1 Breakpoints

| Breakpoint | Largeur | Cible |
|------------|---------|-------|
| Mobile | < 640px | Smartphones |
| Tablette | 640px - 1024px | Tablets, petits écrans |
| Desktop | > 1024px | Ordinateurs |
| Grand écran | > 1440px | Écrans larges |

### 6.2 Principes

- **Mobile first** : concevoir d'abord pour mobile, puis adapter aux écrans plus grands ;
- **Contenu prioritaire** : sur mobile, le contenu essentiel doit être visible sans scroll ;
- **Touch targets** : minimum 44px × 44px pour les éléments interactifs sur mobile.

### 6.3 Règles strictes

Aucun :
- Débordement ;
- Chevauchement ;
- Texte coupé ;
- Bouton inaccessible ;
- Image déformée ;
- Mauvaise marge ;
- Mauvais alignement ;
- Scroll horizontal involontaire.

### 6.4 Galerie responsive

- Desktop : disposition 3 colonnes (1 grande + 2×2 empilées) ;
- Mobile : galerie tactile, swipe horizontal, optimisée pour l'écran.

### 6.5 Formulaire de réservation

- Desktop : colonne sticky à droite ;
- Mobile : barre fixe en bas ou modal/panneau optimisé.

---

## 7. Header (Navigation principale)

### 7.1 Comportement

Le header doit être **sticky au scroll** : il reste fixé en haut de l'écran
lorsque l'utilisateur fait défiler la page.

- **Hauteur** : 70-80px ;
- **Fond** : blanc avec légère ombre portée au scroll ;
- **Transition** : apparition de l'ombre lors du scroll (pas de changement brutal) ;
- **Z-index** : 1000 (toujours au-dessus du contenu).

### 7.2 Disposition Desktop (> 1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]    [FR|EN]     [rounded-pill: 📞 +33 1 23 45 67]    [👤 Inscrire] [Se connecter]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Zones de gauche à droite** :

| Zone | Contenu | Style |
|------|---------|-------|
| Gauche | Logo Caba Résidence | Image, hauteur max 40-50px, lien vers l'accueil |
| Centre-gauche | Sélecteur de langue (FR / EN) | Toggle ou dropdown discret, texte 14px |
| Centre | Numéro de téléphone + icône téléphone | **Bordure arrondie (pill shape)**, bordure 1px gris moyen, padding horizontal 16px, padding vertical 8px, icône 📞 à gauche du numéro |
| Droite | Liens « S'inscrire » et « Se connecter » | Icône utilisateur à gauche du texte, style ghost ou text |

**Règles du numéro de téléphone** :
- **Bordures arrondies** : `border-radius: 999px` (pill) ;
- **Bordure** : 1px solid gris moyen (#D1D5DB) ;
- **Padding** : 8px horizontal, 6px vertical ;
- **Icône** : téléphone (📞 ou icône Lucide `Phone`) à gauche ;
- **Texte** : numéro formaté, 14px, poids medium ;
- **Hover** : bordure passe à bleu accent, texte passe à bleu ;
- **Clic** : déclenche l'appel (`tel:`) ou copie le numéro.

**Règles des liens d'authentification** :
- **Icône utilisateur** (👤 ou icône Lucide `User`) à gauche du texte ;
- **Style** : texte seul (ghost), pas de bordure ;
- **S'inscrire** : texte + icône ;
- **Se connecter** : texte + icône, légèrement plus visible (poids medium) ;
- **Hover** : couleur passe à bleu accent.

### 7.3 Disposition Mobile (< 1024px)

```
┌───────────────────────────────┐
│    [☰]    [Logo]    [👤]     │
└───────────────────────────────┘
```

**Zones de gauche à droite** :

| Zone | Contenu | Style |
|------|---------|-------|
| Gauche | Icône burger (☰) | Icône menu, 24px, ouvre un panneau latéral |
| Centre | Logo Caba Résidence | Centré, hauteur max 35-40px |
| Droite | Icône utilisateur (👤) | Icône Lucide `User`, ouvre un dropdown ou modal avec « S'inscrire » et « Se connecter » |

**Règles du burger** :
- Icône burger classique (3 lignes) ;
- Ouvre un **panneau latéral gauche** (drawer) ;
- Le panneau contient :
  - Numéro de téléphone (avec icône) ;
  - Liens de navigation ;
  - Liens d'authentification ;
  - Sélecteur de langue.

**Règles de l'icône utilisateur** :
- Icône `User` (cercle avec silhouette) ;
- Clic → **dropdown** ou **modal** avec :
  - « S'inscrire » (lien vers inscription) ;
  - « Se connecter » (lien vers connexion) ;
  - Si connecté : « Mon compte », « Mes réservations », « Déconnexion ».

### 7.4 Accessibilité

- **ARIA labels** sur tous les boutons (ex. : `aria-label="Menu principal"`) ;
- **Focus visible** : contour bleu au focus clavier ;
- **Tab order** : logo → langue → téléphone → inscription → connexion ;
- **Skip link** : lien « Aller au contenu principal » invisible mais accessible au clavier.

---

## 8. Footer

### 8.1 Structure générale

Le footer est organisé en **deux sections verticales** empilées.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECTION 1 : CONTENU                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │     ABOUT        │  │     CONTACT      │  │    LISTINGS      │         │
│  │                  │  │                  │  │    RÉCENTS       │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
├─────────────────────────────────────────────────────────────────────────────┤
│                         SECTION 2 : LÉGAL                                  │
│  ┌──────────────────────────────┐      ┌──────────────────────────────┐   │
│  │         COPYRIGHT            │      │  MENTIONS LÉGALES  |  POLITIQUE │   │
│  │     © 2026 Caba Résidence    │      │  DE CONFIDENTIALITÉ          │   │
│  └──────────────────────────────┘      └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Section 1 : Contenu principal (3 colonnes)

La première section contient **3 colonnes** avec **bordures arrondies** sur chaque colonne.

#### Colonne 1 : About

```
┌─────────────────────────────────┐
│           ABOUT                 │
│                                 │
│  [Logo Caba Résidence]          │
│                                 │
│  Description courte de Caba     │
│  Résidence, son emplacement     │
│  et ses valeurs.                │
│                                 │
│  [Icônes réseaux sociaux]       │
│  Facebook | Instagram | Twitter │
└─────────────────────────────────┘
```

**Contenu** :
- Logo Caba Résidence ;
- Description courte (2-3 phrases) ;
- Icônes des réseaux sociaux (Facebook, Instagram, Twitter/X).

**Style** :
- **Bordures arrondies** : `border-radius: 12px` ;
- **Padding** : 24-32px ;
- **Fond** : gris très clair (#F9FAFB) ou blanc avec bordure ;
- **Largeur** : 1/3 du footer (desktop).

#### Colonne 2 : Contact

```
┌─────────────────────────────────┐
│           CONTACT               │
│                                 │
│  📞 +33 1 23 45 67 89          │
│  📧 info@caba-residence.com     │
│                                 │
│  [Icônes réseaux sociaux]       │
│  Facebook | Instagram | Twitter │
└─────────────────────────────────┘
```

**Contenu** :
- Numéro de téléphone (icône téléphone) ;
- Email (icône email) ;
- Lien WhatsApp (icône WhatsApp) ;
- Icônes réseaux sociaux.

**Style** :
- Même style que la colonne About ;
- **Bordures arrondies** : `border-radius: 12px`.

#### Colonne 3 : Listings récents

```
┌─────────────────────────────────┐
│        LISTINGS RÉCENTS         │
│                                 │
│  🏠 Appartement Vue Mer         │
│     ⭐ 4.8 (12 avis)           │
│                                 │
│  🏠 Chambre Premium             │
│     ⭐ 4.9 (8 avis)            │
│                                 │
│  🏠 Villa avec Piscine          │
│     ⭐ 4.7 (15 avis)           │
│                                 │
│  [Voir tous les logements →]    │
└─────────────────────────────────┘
```

**Contenu** :
- Titre « Listings récents » ;
- 3-5 derniers logements ajoutés avec :
  - Petite photo miniature ;
  - Nom du logement ;
  - Note (étoiles) ;
  - Nombre d'avis ;
- Lien « Voir tous les logements ».

**Style** :
- Même style que les autres colonnes ;
- **Bordures arrondies** : `border-radius: 12px`.

### 8.3 Section 2 : Légal (2 colonnes aux extrémités)

La deuxième section contient **2 colonnes positionnées aux extrémités** (gauche et droite),
avec un espace vide au milieu.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────┐                    ┌──────────────────────┐  │
│  │       COPYRIGHT          │                    │  MENTIONS LÉGALES    │  │
│  │  © 2026 Caba Résidence   │                    │  Politique de        │  │
│  │  Tous droits réservés    │                    │  confidentialité     │  │
│  └──────────────────────────┘                    └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Colonne gauche : Copyright

```
┌──────────────────────────┐
│       COPYRIGHT          │
│  © 2026 Caba Résidence   │
│  Tous droits réservés    │
└──────────────────────────┘
```

**Contenu** :
- Symbole copyright ;
- Année ;
- Nom de Caba Résidence ;
- « Tous droits réservés ».

**Style** :
- **Bordures arrondies** : `border-radius: 12px` ;
- **Alignement** : gauche ;
- **Texte** : 14px, gris moyen.

#### Colonne droite : Liens légaux

```
┌──────────────────────────┐
│  Mentions légales        │
│  Politique de            │
│  confidentialité         │
└──────────────────────────┘
```

**Contenu** :
- Lien « Mentions légales » ;
- Lien « Politique de confidentialité » ;
- Lien « Conditions générales » (optionnel) ;
- Lien « Politique d'annulation » (optionnel).

**Style** :
- **Bordures arrondies** : `border-radius: 12px` ;
- **Alignement** : droite ;
- **Disposition** : horizontal (côte à côte) ou vertical ;
- **Texte** : 14px, gris moyen, souligné au hover.

### 8.4 Style global du footer

| Propriété | Valeur |
|-----------|--------|
| Fond | Gris très clair (#F9FAFB) ou noir très foncé (#111827) selon le thème |
| Texte | Gris moyen (#6B7280) pour le corps, blanc si fond sombre |
| Liens | Gris moyen, passe à bleu accent au hover |
| Bordures colonnes | `border-radius: 12px` |
| Padding colonnes | 24-32px |
| Espacement entre colonnes | 24px (mobile), 32px (desktop) |
| Padding global | 48-64px vertical, 32px horizontal |
| Séparateur | Ligne fine entre section 1 et section 2 (optionnel) |

### 8.5 Responsive

#### Mobile (< 640px)

- Les 3 colonnes de la section 1 s'empilent verticalement ;
- Chaque colonne prend 100 % de la largeur ;
- La section 2 passe en colonnes empilées (copyright au-dessus, liens légaux en dessous) ;
- Espacement réduit à 16px.

#### Tablette (640px - 1024px)

- Les 3 colonnes de la section 1 s'affichent en 2 colonnes (2+1) ;
- La section 2 reste en 2 colonnes.

#### Desktop (> 1024px)

- Disposition complète en 3 colonnes pour la section 1 ;
- Disposition en 2 colonnes aux extrémités pour la section 2.

---

## 9. Composants réutilisables

### 7.1 Boutons

| Type | Usage | Style |
|------|-------|-------|
| Primaire | Action principale (Réserver, Payer) | Fond bleu, texte blanc |
| Secondaire | Action alternative (Contacter, Partager) | Fond blanc, bordure grise, texte noir |
| Tertiaire | Action discrète (En savoir plus) | Fond transparent, texte bleu |
| Danger | Action destructive (Annuler, Supprimer) | Fond rouge, texte blanc |
| Ghost | Navigation, filtres | Fond transparent, texte gris/noir |

### 7.2 Champs de formulaire

- Label au-dessus du champ ;
- Placeholder descriptif ;
- Message d'erreur sous le champ ;
- Border : 1px gris moyen au repos, 1px bleu au focus.

### 7.3 Cartes (Cards)

- Border-radius : 8-12px ;
- Ombre subtile (box-shadow) ;
- Padding intérieur : 16-24px ;
- Hover : légère élévation supplémentaire.

### 7.4 Badges / Étiquettes

- Background color selon le statut ;
- Texte blanc ou foncé selon le contraste ;
- Border-radius : 999px (pill shape) ou 4px (rectangle).

---

## 10. Identité visuelle

## 10.1 Ce que le site ne doit PAS être

- Un template WordPress ;
- Un dashboard SaaS ;
- Un site généré automatiquement par IA ;
- Un clone Airbnb.

## 10.2 Ce que le site DOIT être

- Une identité visuelle **propre à Caba Résidence** ;
- Un design qui évoque le **confort, la qualité et l'élégance** ;
- Une expérience utilisateur **fluide et intuitive** ;
- Un sentiment de **confiance et de professionnalisme**.

## 10.3 Emotions à transmettre

- Confiance ;
- Calme ;
- Luxe accessible ;
- Professionalisme ;
- Chaleur humaine.

---

## 11. Accessibilité

### 11.1 Conformité WCAG

- Niveau AA minimum ;
- Contraste des couleurs respecté ;
- Navigation au clavier possible ;
- Labels associés aux champs de formulaire ;
- Textes alternatifs pour les images.

### 11.2 Bonnes pratiques

- Utiliser des couleurs suffisamment contrastées ;
- Fournir des labels pour tous les éléments interactifs ;
- Permettre la navigation au clavier ;
- Tester avec un lecteur d'écran ;
- Utiliser desunités relatives (rem, em) plutôt que des px pour le texte.
