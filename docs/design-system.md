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

## 2. Palette de couleurs — Thème clair (palette Panama)

Le site est en **thème clair** : palette inspirée du drapeau du Panama.
Contraste fort rouge / bleu / gris foncé sur fonds clairs.

### 2.1 Tokens CSS

```css
--bg-primary: #F7F5F1;      /* fond principal blanc cassé */
--bg-card: #FFFFFF;         /* fond des cards/conteneurs, blanc pur */
--border-subtle: #EAE6DE;   /* bordure fine des cards (décorative) */
--border-input: #8A8175;    /* bordure des champs de formulaire (WCAG 1.4.11) */
--accent-red: #D21034;      /* rouge Panama : CTA uniquement */
--accent-red-hover: #B70E2E;
--accent-red-active: #9C0B25;
--accent-blue: #001489;     /* bleu Panama : logo, sur-titres, liens actifs */
--on-accent: #FFFFFF;       /* texte sur fond rouge */
--text-primary: #1A1A1A;    /* titres */
--text-secondary: #6B6459;  /* texte courant, paragraphes */
--btn-secondary-bg: #FFFFFF;
--btn-secondary-text: #1A1A1A;
/* Ombre card (bicouche chaude) :
   0 1px 2px rgba(31,26,20,.06), 0 8px 24px -8px rgba(31,26,20,.10) */
```

### 2.2 Règles d'utilisation

- Le **rouge Panama (#D21034)** est l'accent principal mais **réservé aux boutons d'action** (Réserver, Découvrir, Book now, formulaires). Jamais en texte informatif, décoratif ni en fond large ;
- Le **bleu Panama (#001489)** identifie le **logo**, les **sur-titres** et les **liens actifs/sélectionnés** ;
- Le **gris très foncé (#1A1A1A)** est réservé aux titres ;
- Le **brun-gris (#6B6459)** est utilisé pour tout le texte courant ;
- Les fonds sont toujours `#F7F5F1` (pages) ou `#FFFFFF` (cards), avec bordure fine `#EAE6DE` **et** ombre portée douce pour la profondeur ;
- La bordure `#EAE6DE` est décorative (contraste < 3:1 assumé) ; les champs interactifs utilisent `#8A8175` (≥ 3:1, WCAG 1.4.11) ;
- Aucune autre teinte ne doit être introduite sans validation du product-tech-lead ;
- Erreur : rouge (`#EF4444`) ; succès : vert (`#16A34A`) ; attention : ambre (`#F59E0B`).

### 2.3 États interactifs

| État | Couleur | Description |
|------|---------|-------------|
| Normal | Couleur de base | État par défaut |
| Survol (hover) | Rouge assombri `#B70E2E` (CTA) ou bleu `#001489` (liens) | Au passage de la souris |
| Actif (active) | Rouge encore plus sombre `#9C0B25` | Au clic |
| Focus | Contour bleu `#001489` | Sélection au clavier |
| Désactivé | Gris #6B6459, opacity 50 % | Élément non interactif |
| Erreur | Rouge | Message d'erreur |
| Succès | Vert | Confirmation |

---

## 3. Typographie

### 3.1 Polices

- **Titres (H1/H2)** : police grasse, condensée, italique/oblique, **TOUT EN MAJUSCULES** — style impactant, sportif/architectural. Polices cibles : **Anton**, **Archivo Black** (condensé) ou similaire ;
- **Corps de texte** : sans-serif classique, régulière, casse normale, bonne lisibilité sur fond clair. Polices cibles : **Inter**, **Poppins** ou **Manrope**.

### 3.2 Hiérarchie

Hiérarchie forte : gros titres très larges vs texte courant plus discret en brun-gris.

| Élément | Style |
|---------|-------|
| H1 | 48-72px, Anton/Archivo Black, italique, MAJUSCULES, #1A1A1A |
| H2 | 36-56px, Anton/Archivo Black, italique, MAJUSCULES, #1A1A1A |
| H3 | 22-28px, Semi-Bold (600), casse normale, #1A1A1A |
| H4 | 18-22px, Medium (500), casse normale, #1A1A1A |
| Corps | 16px, Regular (400), #6B6459, line-height 1.5-1.6 |
| Petit | 14px, Regular (400), #6B6459, line-height 1.4-1.5 |
| Légende | 12px, Regular (400), #6B6459, line-height 1.3-1.4 |

### 3.3 Règles

- Maximum 2 polices différentes sur le site ;
- Les titres H1/H2 sont **toujours en majuscules**, en italique ;
- Line-height : 1.5 minimum pour le corps de texte ;
- Contraste respecté sur fond clair (WCAG AA minimum — tous les couples de la palette sont validés, voir §2.1) ;
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
- **Couleur : bleu foncé (#001489)** ou gris foncé selon le contexte, survol rouge accent ;
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

Le header est une **barre classique pleine largeur**, au rendu constant
(aucune transformation au scroll) :

- **Fond** : `--bg-card` (#FFFFFF) opaque dès le chargement, bordure fine
  `#EAE6DE` en bas — pas d'ombre, pas de coins arrondis, pas d'état
  « décollé » ;
- **Position** : `sticky top-0` (reste accessible pendant le défilement,
  sans jamais changer d'apparence) ;
- **Largeur** : bandeau 100 % de l'écran, contenu aligné au conteneur
  1300px ;
- **Hauteur interne** : 72px ;
- **Z-index** : 1000 (toujours au-dessus du contenu).

### 7.2 Disposition Desktop (> 1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] [Accueil|Chambres|À propos|Contact]   Connexion (Réserver) FR | EN │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Zones de gauche à droite** :

| Zone | Contenu | Style |
|------|---------|-------|
| Gauche | Logo Caba Résidence | Titre display (Anton italique MAJUSCULES), lien vers l'accueil |
| Centre-gauche | Menu de navigation dans un conteneur pilule | Bordure fine `--border-subtle`, padding interne 8px, gap 4px entre liens ; lien **actif** : fond `--bg-primary` + texte bleu `#001489` ; liens inactifs : gris `#6B6459` |
| Droite | « Connexion » (ghost) → CTA « Réserver » → sélecteur FR/EN → sélecteur EUR/FCFA | Connexion : texte gris, hover bleu ; Réserver : **pilule rouge plein `#D21034` / texte blanc** ; FR/EN et EUR/FCFA : actif en foncé, séparateur `|` gris |

**Règles des liens d'authentification** :
- Style texte seul (ghost), pas de bordure ;
- Hover : couleur passe au bleu accent secondaire.

### 7.3 Disposition Mobile (< 1024px)

```
┌───────────────────┐
│ [Logo]  [FR|EN] ☰ │
└───────────────────┘
```

**Zones** :

| Zone | Contenu | Style |
|------|---------|-------|
| Gauche | Logo Caba Résidence | Identique au desktop |
| Droite | Sélecteur FR/EN puis icône burger | Burger 40×40px, ouvre un panneau latéral |

**Règles du burger** :
- Icône burger classique (3 lignes) ;
- Ouvre un **panneau latéral droit** (drawer) avec overlay assombri (`bg-black/40`) ;
- Le panneau contient : liens de navigation empilés + sélecteur de devise EUR/FCFA (centré) + bouton « Connexion » (CTA primaire pleine largeur) ;
- Le CTA « Réserver » est masqué sur mobile (présent dans les pages) ;
- Fermeture : croix, clic sur l'overlay ou touche Échap.

### 7.4 Accessibilité

- **ARIA labels** sur tous les boutons (ex. : `aria-label="Ouvrir le menu"`) ;
- **Focus visible** : contour bleu `#001489` au focus clavier ;
- **Tab order** : logo → navigation → connexion → réserver → langue → devise ;
- **Skip link** : lien « Aller au contenu principal » invisible mais accessible au clavier.

---

## 8. Footer

### 8.1 Structure générale

Le footer est un **bandeau pleine largeur** (fond bord à bord — aucun conteneur
ombré ni arrondi), organisé en deux sections verticales séparées par un trait fin :

1. **Section Informations et newsletter** (4 colonnes internes, contenu aligné au
   conteneur du site) :
   logo/description/adresse/**réseaux sociaux** | Navigation | Légal | Newsletter ;
2. **Section Pied de page** : copyright seul, centré, sous un trait fin.

Ordre des colonnes : logo → Navigation → Légal → Restons en contact (newsletter
en dernière position, mobile comme desktop). Sur mobile (< 640px) les contenus
des colonnes sont **centrés** et l'écart entre colonnes est porté à 32px.
Champs et bouton du formulaire en taille réduite (padding vertical 8px).

Bandeau : fond `--bg-card` (#FFFFFF) sur toute la largeur de l'écran, délimité
par une bordure fine `#EAE6DE` en haut — pas d'ombre, pas de coins arrondis.
Le contenu reste aligné au conteneur (max 1300-1400px), padding vertical
généreux (40px mobile → 56px desktop).

### 8.2 Section Informations et newsletter (une seule grande card)

Les 4 colonnes sont à l'intérieur d'une **unique card** (pas de bordures individuelles),
séparées par des gaps de 24-32px : 1 colonne mobile, 2 ≥ 640px, 4 ≥ 1024px.

| Colonne | Contenu |
|---------|---------|
| Logo | Titre display « Caba Résidence » + description + adresse + icônes sociales seules (Facebook, Instagram, X, WhatsApp) |
| Navigation | Accueil, Chambres, À propos, Nos services, Nos équipements, Blog, Contact — un par ligne, espacés de 8px |
| Légal | Mentions légales, Politique de confidentialité, CGV |
| Restons en contact | Titre + description + formulaire newsletter (email requis, téléphone optionnel, bouton pilule pleine largeur) |

Liens : gris `#6B6459` → bleu `#001489` au survol (200ms), jamais soulignés.
Icônes sociales : 18px dans un carré 36px, fond bleu `#001489`, icône blanche,
coins arrondis 10 %, survol fond rouge accent `#D21034` (200ms).
Formulaire : bloc plafonné à 320px de large, champs empilés pleine largeur
(pilules fond blanc, bordure `--border-input`, centrés sur mobile), bouton
« S'inscrire » pilule rouge/texte blanc pleine largeur.

### 8.3 Section Pied de page

Copyright seul, centré, sous un simple trait fin horizontal : « © {année} Caba
Résidence. Tous droits réservés. » — 12px gris (#6B6459), année calculée côté serveur.

### 8.5 Style global du footer

| Propriété | Valeur |
|-----------|--------|
| Fond page | `--bg-primary` (#F7F5F1) |
| Bandeau footer | fond blanc pleine largeur, trait fin `#EAE6DE`, sans ombre ni radius |
| Texte | Gris (#6B6459) pour le corps, #1A1A1A pour les titres |
| Liens | Gris → bleu #001489 au hover ; icônes sociales → rouge au hover |
| Espacement entre sections | 8px — sections resserrées |
| Padding global | 16px horizontal mobile, 32-48px vertical, conteneur max 1400px |

### 8.6 Responsive

#### Mobile (< 768px)

- Toutes les colonnes s'empilent (gap 16px entre colonnes internes) ;
- Le bandeau s'étend sur 100 % de la largeur, aucun débordement horizontal (testé à 320px).

#### Desktop (≥ 1024px)

- Informations et newsletter : 4 colonnes internes dans le bandeau pleine largeur ;
- Pied de page : copyright seul sous un trait fin.

---

## 9. Composants réutilisables

### 9.1 Boutons

Tous les boutons sont en **forme pilule** (`border-radius: 999px`).

| Type | Usage | Style |
|------|-------|-------|
| Primaire (CTA) | Action principale (Réserver, Payer, S'inscrire) | **Fond rouge plein (#D21034), texte blanc (#FFFFFF)** — hover `#B70E2E`, active `#9C0B25` |
| Secondaire (CTA) | Action alternative (Contacter, Partager) | **Fond blanc plein (#FFFFFF), texte foncé (#1A1A1A)** |
| Tertiaire | Action discrète (En savoir plus) | Fond transparent, texte bleu accent secondaire |
| Danger | Action destructive (Annuler, Supprimer) | Fond rouge (#EF4444), texte blanc |
| Ghost | Navigation, filtres | Fond transparent, texte gris (#6B6459), hover bleu |

### 9.2 Champs de formulaire

- Label au-dessus du champ ;
- Placeholder descriptif ;
- Message d'erreur sous le champ ;
- Fond : `--bg-card` (#FFFFFF) ;
- Border : 0.5-1px `--border-input` (#8A8175) au repos (WCAG 1.4.11), ring bleu #001489 au focus ;
- Texte saisi : #1A1A1A ; placeholder : #6B6459 pleine opacité.

### 9.3 Cartes (Cards)

- **Fond : `--bg-card` (#FFFFFF)** ;
- **Border-radius : 12-16px** ;
- Bordure subtile `#EAE6DE` (décorative) + **ombre portée douce obligatoire** (`shadow-card`) pour la profondeur sur fond clair ;
- Padding intérieur : 16-24px mobile, 24-32px desktop ;
- Icônes en bleu foncé (#001489) ou gris foncé, survol rouge accent (#D21034) ;
- Hover : élévation discrète (ombre renforcée).

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

- **Thème clair (palette Panama)**, fort contraste rouge/bleu/gris foncé sur fonds clairs ;
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

---

## 13. Hero (page d'accueil)

### 13.1 Section principale

| Propriété | Valeur |
|-----------|--------|
| Conteneur | 1300px max, centré (conteneur global du site) |
| Dimensions | 1300 × 420px desktop, hauteur auto + min-height 280px < 1024px |
| Coins arrondis | 20px |
| Fond image | `/hero1.webp` (cover, position `center 65%`) |
| Dégradé | `linear-gradient(to bottom, rgba(17,14,11,.82), rgba(17,14,11,.45) 55%, rgba(17,14,11,.62))` |

Contenu (centré verticalement, aligné à gauche, max-width 600px) :

1. **Badge** : pilule rouge `#D21034`, texte blanc 12px — « Complexe résidentiel · Bénin » ;
2. **Titre bicolore** : Anton italique MAJUSCULES blanc, mot clé en or champagne
   `#F2C572` (`clamp(30px, 4.5vw, 46px)`) ;
3. **Sous-titre** : crème clair `#E8E2D8`, 15px.

### 13.2 Preuve sociale

Pilule blanche ombre légère : stack de 3 avatars ronds chevauchants (-10px,
bordure blanche 2px) + 5 étoiles rouges `#D21034` + mention « +240 séjours
notés 4.8 ».

- Desktop ≥ 1024px : flottante au-dessus du Hero (`top: -54px`), alignée à droite ;
- Mobile : version identique affichée sous le sous-titre dans le Hero.

### 13.3 Moteur de recherche en chevauchement

Card blanche, radius 16px, ombre marquée :

- **Desktop ≥ 1024px** : `position: absolute; left/right: 60px; bottom: 0;
  translateY(50%)` — moitié haute sur l'image, moitié basse sur le fond de page
  (largeur ≈ 1180px). Le conteneur réserve 96px de marge basse ;
- **Mobile < 1024px** : bloc statique empilé sous le Hero, champs en colonne ;
- Contenu : onglets « Logements / Chambres » (actif souligné rouge) puis
  Destination, Date d'arrivée, Date de départ, Voyageurs (popover adultes /
  enfants / bébés avec steppers −/+, bornes 0-9, minimum 1 adulte) et bouton
  « Rechercher » pilule rouge.
