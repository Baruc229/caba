# SEO et Performance — Caba Résidence

Ce document décrit les optimisations SEO et les objectifs de performance
de la plateforme.

---

## 1. SEO (Référencement Naturel)

### 1.1 URLs propres

Chaque page doit avoir une URL descriptive et lisible :

| Page | Format d'URL | Exemple |
|------|--------------|---------|
| Accueil | `/` | `caba-residence.com/` |
| Logement | `/logements/{slug}` | `caba-residence.com/logements/appartement-vue-mer` |
| Type de logement | `/logements/type/{type}` | `caba-residence.com/logements/type/villas` |
| Résultats de recherche | `/recherche?{params}` | `caba-residence.com/recherche?arrivee=2026-08-17&depart=2026-09-01` |
| Espace client | `/compte` | `caba-residence.com/compte` |
| Blog | `/blog/{slug-article}` | `caba-residence.com/blog/conseils-voyage` |
| Pages légales | `/{page}` | `caba-residence.com/mentions-legales` |

**Règles** :
- Pas de caractères spéciaux ;
- Tirets (-) comme séparateurs ;
- Tout en minuscules ;
- Pas de mots de passe vides (pas de `//`).

### 1.2 Balises meta

Chaque page doit avoir :

| Balise | Règle |
|--------|-------|
| `<title>` | Unique, 50-60 caractères, contient le mot-clé principal |
| `<meta name="description">` | Unique, 150-160 caractères, incite au clic |
| `<meta name="robots">` | `index, follow` pour les pages publiques ; `noindex, nofollow` pour les pages privées |
| `<link rel="canonical">` | URL canonique de chaque page (évite le contenu dupliqué) |

### 1.3 Open Graph

Chaque page doit avoir les balises Open Graph pour le partage social :

| Balise | Contenu |
|--------|---------|
| `og:title` | Titre de la page |
| `og:description` | Description de la page |
| `og:image` | Image de partage (1200×630px) |
| `og:url` | URL de la page |
| `og:type` | `website` (accueil), `article` (blog), `product` (logement) |
| `og:site_name` | "Caba Résidence" |
| `og:locale` | `fr_FR` |

### 1.4 Données structurées (Schema.org)

Utiliser les données structurées JSON-LD pour :

| Type | Usage |
|------|-------|
| `LodgingBusiness` | Informations sur Caba Résidence (accueil) |
| `Product` / `LodgingAccommodation` | Chaque logement (page individuelle) |
| `Review` / `AggregateRating` | Avis clients |
| `BreadcrumbList` | Fil d'Ariane |
| `Organization` | Informations de l'entreprise |
| `FAQPage` | Questions fréquentes |
| `Article` | Articles de blog |

### 1.5 Sitemap

- **Fichier** : `/sitemap.xml` ;
- **Mise à jour** : automatique à chaque ajout/modification de page ;
- **Inclusion** : toutes les pages indexables ;
- **Exclusion** : pages privées, pages de recherche, pages avec paramètres.

### 1.6 Robots.txt

```
User-agent: *
Allow: /
Disallow: /compte/
Disallow: /back-office/
Disallow: /api/
Disallow: /recherche?

Sitemap: https://caba-residence.com/sitemap.xml
```

### 1.7 SEO bilingue

Le site doit supporter au minimum le **français** comme langue principale.
L'architecture doit permettre l'ajout d'une deuxième langue avec :
- URLs préfixées par la langue (`/fr/...`, `/en/...`) ;
- Balises `hreflang` ;
- Contenu traduit.

---

## 2. Performance

### 2.1 Objectifs

| Métrique | Objectif |
|----------|----------|
| Largest Contentful Paint (LCP) | < 2,5 secondes |
| First Input Delay (FID) | < 100 ms |
| Cumulative Layout Shift (CLS) | < 0,1 |
| Time to First Byte (TTFB) | < 200 ms |
| Total Blocking Time (TBT) | < 200 ms |

### 2.2 Optimisations images

- **Format** : WebP avec fallback JPG/PNG ;
- **Compression** : qualité 80-85 % (bon compromis qualité/poids) ;
- **Responsive images** : `srcset` et `sizes` pour chaque image ;
- **Lazy loading** : chargement différé pour les images hors écran ;
- **Dimensions** : toujours spécifier width et height pour éviter le CLS ;
- **CDN** : servir les images via un CDN.

### 2.3 Optimisation CSS et JavaScript

- **Minification** : supprimer les espaces, commentaires et caractères inutiles ;
- **Bundling** : regrouper les fichiers pour réduire le nombre de requêtes ;
- **Tree shaking** : supprimer le code mort ;
- **Code splitting** : charger uniquement le code nécessaire par page ;
- **Differ/defer** : charger le JS de manière asynchrone.

### 2.4 Polices

- **Chargement** : utiliser `font-display: swap` pour éviter le flash de texte invisible ;
- **Compression** : préférer les formats WOFF2 ;
- **Nombre** : maximum 2-3 polices différentes ;
- **Subsetting** : inclure uniquement les caractères nécessaires.

### 2.5 Cache

| Ressource | Durée de cache |
|-----------|----------------|
| Images (avec hash) | 1 an |
| CSS/JS (avec hash) | 1 an |
| Polices | 1 an |
| HTML | 0 (toujours frais) |
| API | 0-60 secondes |

### 2.6 Optimisation des requêtes

- **Indexation** de la base de données ;
- **Pagination** des résultats ;
- **Debouncing** de la recherche ;
- **Mise en cache** côté serveur pour les données peu变化antes.

### 2.7 API

- **Compression** : gzip/brotli ;
- **Pagination** : limiter le nombre de résultats par requête ;
- **Filtrage** : ne retourner que les champs nécessaires ;
- **Rate limiting** : protéger contre les abus.

---

## 3. SEO Local

### 3.1 Google Business

- Créer et maintenir un profil Google Business ;
- Informations cohérentes (nom, adresse, téléphone) ;
- Photos régulièrement mises à jour ;
- Réponse aux avis.

### 3.2 Citation

- Nom, Adresse, Téléphone (NAT) cohérents sur toutes les plateformes ;
- Inscriptions dans les annuaires locaux ;
- Données structurées `LocalBusiness`.

---

## 4. Monitoring

### 4.1 Outils

- **Google Search Console** : suivi de l'indexation et des erreurs ;
- **Google Analytics** : suivi du trafic et des conversions ;
- **PageSpeed Insights** : évaluation des performances ;
- **Lighthouse** : audit complet (performance, SEO, accessibilité, bonnes pratiques).

### 4.2 KPIs

| KPI | Objectif |
|-----|----------|
| Pages indexées | 100 % des pages publiques |
| Temps de chargement moyen | < 3 secondes |
| Score Lighthouse Performance | > 90 |
| Score Lighthouse SEO | > 95 |
| Taux de rebond | < 40 % |
| Temps moyen sur site | > 2 minutes |
| Taux de conversion | > 3 % (visite → réservation) |

---

## 5. Cas de test — SEO

### Cas de test 1 : Balises meta

**Vérification** :
- Chaque page a un `<title>` unique et descriptif ;
- Chaque page a un `<meta description>` unique et incitative ;
- Pas de balises meta manquantes ;
- Longueur des balises dans les limites.

### Cas de test 2 : Données structurées

**Vérification** :
- Données structurées valides (test avec l'outil Google) ;
- Toutes les pages de logement ont des données `Product` ;
- L'accueil a des données `LodgingBusiness` ;
- Pas d'erreurs dans les données structurées.

### Cas de test 3 : Performance

**Vérification** :
- LCP < 2,5 secondes sur mobile ;
- FID < 100 ms ;
- CLS < 0,1 ;
- Score Lighthouse > 90.
