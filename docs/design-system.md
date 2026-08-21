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

## 2. Palette de couleurs — Dark mode intégral

Le site est en **dark mode intégral** : aucun fond clair sur le site public.
Contraste fort noir / blanc / vert.

### 2.1 Tokens CSS

```css
--bg-primary: #0D0D0D;      /* fond principal noir anthracite */
--bg-card: #1A1A1A;         /* fond des cards, légèrement plus clair */
--accent-green: #4ADE80;    /* vert menthe : accent principal, CTA, icônes */
--text-primary: #FFFFFF;    /* titres */
--text-secondary: #A0A0A0;  /* texte courant, paragraphes */
--btn-secondary-bg: #FFFFFF;
--btn-secondary-text: #0D0D0D;
```

### 2.2 Règles d'utilisation

- Le **vert menthe (#4ADE80)** est la couleur d'accent unique et **non une couleur dominante partout** : CTA principaux, icônes, états actifs, liens ;
- Le **blanc pur (#FFFFFF)** est réservé aux titres et aux CTA secondaires ;
- Le **gris (#A0A0A0)** est utilisé pour tout le texte courant ;
- Les fonds sont toujours `#0D0D0D` (pages) ou `#1A1A1A` (cards) ;
- Aucune autre teinte ne doit être introduite sans validation du product-tech-lead ;
- Erreur : rouge (`#EF4444`) ; succès : vert accent ; attention : ambre (`#F59E0B`).

### 2.3 États interactifs

| État | Couleur | Description |
|------|---------|-------------|
| Normal | Couleur de base | État par défaut |
| Survol (hover) | Vert accent éclairci (CTA) ou blanc (liens) | Au passage de la souris |
| Actif (active) | Vert accent assombri de 10 % | Au clic |
| Focus | Contour vert accent | Sélection au clavier |
| Désactivé | Gris #A0A0A0, opacity 50 % | Élément non interactif |
| Erreur | Rouge | Message d'erreur |
| Succès | Vert accent | Confirmation |

---

## 3. Typographie

### 3.1 Polices

- **Titres (H1/H2)** : police grasse, condensée, italique/oblique, **TOUT EN MAJUSCULES** — style impactant, sportif/architectural. Polices cibles : **Anton**, **Archivo Black** (condensé) ou similaire ;
- **Corps de texte** : sans-serif classique, régulière, casse normale, bonne lisibilité sur fond sombre. Polices cibles : **Inter**, **Poppins** ou **Manrope**.

### 3.2 Hiérarchie

Hiérarchie forte : gros titres très larges vs texte courant plus discret en gris.

| Élément | Style |
|---------|-------|
| H1 | 48-72px, Anton/Archivo Black, italique, MAJUSCULES, blanc |
| H2 | 36-56px, Anton/Archivo Black, italique, MAJUSCULES, blanc |
| H3 | 22-28px, Semi-Bold (600), casse normale, blanc |
| H4 | 18-22px, Medium (500), casse normale, blanc |
| Corps | 16px, Regular (400), #A0A0A0, line-height 1.5-1.6 |
| Petit | 14px, Regular (400), #A0A0A0, line-height 1.4-1.5 |
| Légende | 12px, Regular (400), #A0A0A0, line-height 1.3-1.4 |

### 3.3 Règles

- Maximum 2 polices différentes sur le site ;
- Les titres H1/H2 sont **toujours en majuscules**, en italique ;
- Line-height : 1.5 minimum pour le corps de texte ;
- Contraste respecté sur fond sombre (WCAG AA minimum) ;
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

- Style outline (trait / line-icons) par défaut ;
- Style filled pour les états actifs ;
- Épaisseur de trait : 1.5px ou 2px ;
- **Couleur : vert accent (#4ADE80)** par défaut, blanc sur les CTA secondaires ;
- Toujours accompagnées d'un label ou d'un tooltip si non évidentes.

### 4.4 Interdiction absolue d'emojis

**ZÉRO EMOJI sur tout le site.** Aucune emoji dans :
- l'interface (boutons, menus, cartes, formulaires) ;
- les contenus (titres, textes, descriptions, avis) ;
- les emails et notifications ;
- le code et la documentation.

Les icônes proviennent exclusivement de la famille graphique définie en §4.1.

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
- **Fond** : `--bg-primary` (#0D0D0D) avec bordure inférieure subtile (#262626) au scroll ;
- **Transition** : apparition de la bordure lors du scroll (pas de changement brutal) ;
- **Z-index** : 1000 (toujours au-dessus du contenu).

### 7.2 Disposition Desktop (> 1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]    [FR|EN]     [rounded-pill: Phone +33 1 23 45 67]    [User Inscrire] [Se connecter]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Zones de gauche à droite** :

| Zone | Contenu | Style |
|------|---------|-------|
| Gauche | Logo Caba Résidence | Image, hauteur max 40-50px, lien vers l'accueil |
| Centre-gauche | Sélecteur de langue (FR / EN) | Toggle ou dropdown discret, texte 14px |
| Centre | Numéro de téléphone + icône téléphone | **Forme pilule (border-radius: 999px)**, bordure 1px #262626, padding horizontal 16px, padding vertical 8px, icône Lucide `Phone` à gauche du numéro |
| Droite | Liens « S'inscrire » et « Se connecter » | Icône utilisateur à gauche du texte, style ghost ou text |

**Règles du numéro de téléphone** :
- **Bordures arrondies** : `border-radius: 999px` (pilule) ;
- **Bordure** : 1px solid #262626 ;
- **Padding** : 8px horizontal, 6px vertical ;
- **Icône** : Lucide `Phone` (vert accent) à gauche ;
- **Texte** : numéro formaté, 14px, poids medium, blanc ;
- **Hover** : bordure passe au vert accent, texte passe au vert ;
- **Clic** : déclenche l'appel (`tel:`) ou copie le numéro.

**Règles des liens d'authentification** :
- **Icône utilisateur** (Lucide `User`) à gauche du texte ;
- **Style** : texte seul (ghost), pas de bordure ;
- **S'inscrire** : texte + icône ;
- **Se connecter** : texte + icône, légèrement plus visible (poids medium) ;
- **Hover** : couleur passe au vert accent.

### 7.3 Disposition Mobile (< 1024px)

```
┌───────────────────────────────┐
│    [Menu]    [Logo]    [User] │
└───────────────────────────────┘
```

**Zones de gauche à droite** :

| Zone | Contenu | Style |
|------|---------|-------|
| Gauche | Icône burger | Lucide `Menu`, 24px, ouvre un panneau latéral |
| Centre | Logo Caba Résidence | Centré, hauteur max 35-40px |
| Droite | Icône utilisateur | Icône Lucide `User`, ouvre un dropdown ou modal avec « S'inscrire » et « Se connecter » |

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
- **Focus visible** : contour vert accent au focus clavier ;
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
- **Fond** : `--bg-card` (#1A1A1A) avec bordure subtile #262626 ;
- **Largeur** : 1/3 du footer (desktop).

#### Colonne 2 : Contact

```
┌─────────────────────────────────┐
│           CONTACT               │
│                                 │
│  Phone +33 1 23 45 67 89        │
│  Mail info@caba-residence.com   │
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
│  [photo] Appartement Vue Mer    │
│     Star 4.8 (12 avis)          │
│                                 │
│  [photo] Chambre Premium        │
│     Star 4.9 (8 avis)           │
│                                 │
│  [photo] Villa avec Piscine     │
│     Star 4.7 (15 avis)          │
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
| Fond | `--bg-primary` (#0D0D0D) |
| Colonnes | `--bg-card` (#1A1A1A), bordure subtile #262626 |
| Texte | Gris (#A0A0A0) pour le corps, blanc pour les titres |
| Liens | Gris, passe au vert accent au hover |
| Bordures colonnes | `border-radius: 12px` |
| Padding colonnes | 24-32px |
| Espacement entre colonnes | 24px (mobile), 32px (desktop) |
| Padding global | 48-64px vertical, 32px horizontal |
| Séparateur | Ligne fine #262626 entre section 1 et section 2 (optionnel) |

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

### 9.1 Boutons

Tous les boutons sont en **forme pilule** (`border-radius: 999px`).

| Type | Usage | Style |
|------|-------|-------|
| Primaire (CTA) | Action principale (Réserver, Payer) | **Fond vert plein (#4ADE80), texte noir (#0D0D0D)** |
| Secondaire (CTA) | Action alternative (Contacter, Partager) | **Fond blanc plein (#FFFFFF), texte noir (#0D0D0D)** |
| Tertiaire | Action discrète (En savoir plus) | Fond transparent, texte vert accent |
| Danger | Action destructive (Annuler, Supprimer) | Fond rouge (#EF4444), texte blanc |
| Ghost | Navigation, filtres | Fond transparent, texte gris (#A0A0A0) |

### 9.2 Champs de formulaire

- Label au-dessus du champ ;
- Placeholder descriptif ;
- Message d'erreur sous le champ ;
- Fond : `--bg-card` (#1A1A1A) ;
- Border : 1px #262626 au repos, 1px vert accent au focus ;
- Texte saisi : blanc.

### 9.3 Cartes (Cards)

- **Fond : `--bg-card` (#1A1A1A)** ;
- **Border-radius : 12-16px** ;
- Bordure subtile #262626 (pas d'ombre portée systématique) ;
- Padding intérieur : 16-24px ;
- Icônes en line-icons vertes (#4ADE80) ;
- Hover : bordure légèrement plus claire ou élévation discrète.

### 9.4 Badges / Étiquettes

- Background color selon le statut ;
- Texte blanc ou noir selon le contraste ;
- Border-radius : 999px (pilule).

### 9.5 Images

Les images ont des **coins « cassés » avec petits repères décoratifs aux angles**
(effet cadre technique / architecte) :

- Découpe d'angle (clip-path) sur un ou plusieurs coins ;
- Petits repères / équerres décoratifs aux angles, en vert accent ou blanc ;
- Border-radius de base : 12px sur les coins non coupés ;
- L'effet doit rester discret et cohérent sur toutes les images du site.

---

## 10. Layout

- **Dark mode intégral**, fort contraste noir/blanc/vert ;
- **Grande respiration** : whitespace généreux entre les sections (96-160px vertical desktop) ;
- **Grilles en colonnes** : 3 colonnes pour les cards de services (desktop), empilement sur mobile ;
- **Sections centrées** : chaque section commence par un titre (H2, majuscules italique) + sous-titre (gris), centrés, avant le contenu ;
- Conteneur : 1400px maximum.

---

## 11. Identité visuelle

## 11.1 Ce que le site ne doit PAS être

- Un template WordPress ;
- Un dashboard SaaS ;
- Un site généré automatiquement par IA ;
- Un clone Airbnb.

## 11.2 Ce que le site DOIT être

- Une identité visuelle **propre à Caba Résidence** ;
- Un design qui évoque le **confort, la qualité et l'élégance** ;
- Une expérience utilisateur **fluide et intuitive** ;
- Un sentiment de **confiance et de professionnalisme**.

## 11.3 Emotions à transmettre

- Confiance ;
- Calme ;
- Luxe accessible ;
- Professionalisme ;
- Chaleur humaine.

---

## 12. Accessibilité

### 12.1 Conformité WCAG

- Niveau AA minimum ;
- Contraste des couleurs respecté ;
- Navigation au clavier possible ;
- Labels associés aux champs de formulaire ;
- Textes alternatifs pour les images.

### 12.2 Bonnes pratiques

- Utiliser des couleurs suffisamment contrastées ;
- Fournir des labels pour tous les éléments interactifs ;
- Permettre la navigation au clavier ;
- Tester avec un lecteur d'écran ;
- Utiliser desunités relatives (rem, em) plutôt que des px pour le texte.
