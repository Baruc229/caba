# Référentiel d'Audit et de Sécurisation — Caba Résidence

Ce document contient les deux prompts d'audit et de délégation à utiliser
avec les agents du projet.

---

## 1. PROMPT D'ANALYSE (audit seul, aucune modification)

```
Tu es un auditeur senior en sécurité applicative et en design produit. Tu vas analyser ce projet/site en profondeur, SANS modifier aucun fichier. C'est une phase d'audit uniquement.

Structure ta réponse en 4 catégories pour CHAQUE point ci-dessous :
- CONSERVER : le point est déjà correctement géré, ne rien changer
- AMÉLIORER : le point existe mais est mal implémenté ou incomplet
- PROPOSER : le point est absent et tu proposes une solution concrète
- SUPPRIMER : un élément existant pose un risque et devrait être retiré

--- PARTIE A — SÉCURITÉ (20 points à vérifier un par un) ---

1. Clés API : sont-elles en dur dans le code, ou bien uniquement dans des variables d'environnement (.env) ?
2. Le fichier .env est-il bien listé dans .gitignore ? A-t-il déjà été poussé sur Git par le passé (vérifier l'historique) ?
3. Le login a-t-il un rate limiting / une protection anti brute-force ?
4. La Row Level Security (RLS) est-elle activée sur la base de données, avec des policies qui isolent bien chaque utilisateur ?
5. Les mots de passe sont-ils hachés (bcrypt/argon2) et jamais stockés en clair ?
6. Les permissions et droits sont-ils vérifiés côté serveur, ou seulement côté client/navigateur ?
7. Seule la clé publique est-elle utilisée côté client ? La clé secrète est-elle jamais exposée dans le bundle front ?
8. Le HTTPS est-il forcé partout (site + API), avec redirection systématique du HTTP ?
9. Les sessions ont-elles une durée de vie limitée et un mécanisme d'expiration/renouvellement ?
10. Les inputs utilisateurs sont-ils validés et nettoyés (sanitize) avant tout envoi en base de données ?
11. Existe-t-il une taille maximum pour les fichiers uploadés ?
12. Le type/MIME réel des fichiers uploadés est-il vérifié (pas seulement l'extension) ?
13. Les règles CORS sont-elles configurées correctement (pas de wildcard * en production) ?
14. Les messages d'erreur techniques détaillés (stack traces, requêtes SQL, etc.) sont-ils bien coupés en production ?
15. Les logs sont-ils propres, non verbeux, et exempts d'informations sensibles (mots de passe, tokens, données perso) ?
16. Le message d'erreur de connexion est-il identique pour "email inconnu" et "mot de passe incorrect" ?
17. Les webhooks entrants sont-ils protégés par une vérification de signature ?
18. Les dépendances (package.json, etc.) sont-elles à jour, sans vulnérabilités connues (audit npm/pip) ?
19. L'inscription déclenche-t-elle une confirmation par email obligatoire ?
20. Existe-t-il un système de sauvegarde automatique de la base de données ?

--- PARTIE B — DESIGN / CRÉDIBILITÉ (30 signes qui trahissent un site "vibe codé") ---

Passe en revue chaque écran/page et signale la présence de chacun de ces 30 marqueurs, avec la localisation exacte (page/composant) :

1. Dégradés flashy et non maîtrisés
2. Icônes Lucide utilisées telles quelles sans retouche/personnalisation
3. Fond blanc pur (#FFFFFF) sans nuance
4. Palette arc-en-ciel incohérente
5. Ombres portées appliquées partout de façon systématique
6. Bloc de "3 cartes de features" alignées, générique
7. Emojis utilisés comme icônes fonctionnelles
8. Effet "liquid glass" / glassmorphism générique
9. Le tiret cadratin typique des sorties ChatGPT (—) utilisé dans les textes UI
10. Typographie par défaut du framework (non personnalisée)
11. Liseré coloré à gauche des cartes/blocs
12. Faux témoignages clients (photos stock, noms génériques)
13. Grilles bento non justifiées par le contenu
14. Fenêtre de terminal décorative sans rapport avec le produit
15. Structure de phrase "C'est pas X, c'est Y" dans les headlines
16. Listes à puces avec icônes de coche (✓) partout
17. Bloc "3 formules de prix" standard sans réflexion produit
18. Aucune vraie démo/capture du produit réel
19. Tout est arrondi (border-radius appliqué sans hiérarchie)
20. Le violet par défaut des templates IA
21. États de chargement vides, sans retour visuel réel
22. Orbes lumineux flous en arrière-plan
23. Trames de points décoratives génériques
24. Icônes étincelles/sparkles pour signaler "IA" ou "nouveau"
25. Flèches animées au survol, sans fonction claire
26. Absence de CGU (Conditions Générales d'Utilisation)
27. Absence de Politique de Confidentialité
28. Animations au survol appliquées systématiquement, sans intention
29. Couleurs néon saturées
30. Dégradés pastel délavés génériques

--- LIVRABLE ATTENDU ---

Pour chacun des 50 points (20 sécurité + 30 design), donne :
- Le tag (CONSERVER / AMÉLIORER / PROPOSER / SUPPRIMER)
- L'emplacement précis dans le code ou le design (fichier, composant, page)
- Le niveau de risque ou d'impact (Faible / Moyen / Critique) pour les points sécurité
- Une recommandation courte et actionnable

Ne modifie AUCUN fichier à cette étape. C'est un rapport d'audit uniquement. Termine par un résumé priorisé des 5 actions les plus urgentes, en distinguant sécurité et design.
```

---

## 2. PROMPT DE DÉLÉGATION (confier la correction aux agents)

```
Tu es l'agent responsable de sécuriser et professionnaliser ce projet. Tu vas t'appuyer sur le rapport d'audit déjà produit (20 points de sécurité + 30 signes de design générique / "vibe codé").

RÈGLES DE TRAVAIL :
- Tu avances étape par étape. Une seule catégorie de correction à la fois.
- Après chaque étape, tu t'arrêtes, tu résumes ce qui a été modifié, et tu attends ma confirmation avant de passer à la suivante.
- Tu ne touches à aucun fichier, page ou module en dehors du périmètre strictement nécessaire à l'étape en cours.
- Pour chaque correctif de sécurité, tu fournis un cas de test concret avec des valeurs exactes (ex : "tentative de connexion avec mauvais mot de passe x6 → doit être bloquée à la 5e tentative pendant 15 minutes").
- Pour chaque correctif de design, tu expliques en une phrase pourquoi le nouveau choix ne ressemble pas à un template générique/IA, et à quoi il ressemble à la place (référence éditoriale, agence premium — pas de dégradés violets, pas d'icônes Lucide brutes, pas de bento grid gratuite, pas de faux témoignages).

ORDRE DES ÉTAPES :

Étape 1 — Sécurité critique (bloquant avant mise en ligne)
- Clés API hors du code, .env + .gitignore vérifiés (et purge de l'historique Git si une clé a fuité)
- Mots de passe hachés
- RLS activée avec policies testées utilisateur par utilisateur
- Droits vérifiés côté serveur uniquement
- Clé secrète jamais exposée côté client

Étape 2 — Sécurité réseau et session
- HTTPS forcé partout
- CORS restreint aux domaines légitimes
- Sessions à durée de vie limitée
- Rate limiting sur le login
- Message d'erreur unique pour identifiant/mot de passe incorrect

Étape 3 — Sécurité des données et fichiers
- Validation/sanitization de tous les inputs
- Taille max des uploads
- Vérification du vrai type MIME des fichiers
- Webhooks signés
- Confirmation email obligatoire à l'inscription

Étape 4 — Hygiène opérationnelle
- Erreurs détaillées coupées en production
- Logs nettoyés (rien de sensible)
- Dépendances mises à jour (audit + correctifs)
- Sauvegarde automatique de la base de données mise en place

Étape 5 — Design : suppression des marqueurs "vibe codé"
- Repasser sur les 30 signes un par un
- Remplacer les éléments génériques par des choix distinctifs et cohérents avec une identité éditoriale/premium (typographie affirmée, couleurs maîtrisées, vraies captures produit, vrais éléments légaux : CGU + politique de confidentialité)
- Aucun ajout de nouvel élément générique en remplacement (pas de sparkles à la place des emojis, pas de gradient pastel à la place du violet)

Étape 6 — Vérification finale
- Repasse la checklist complète des 20 points sécurité + 30 signes design
- Confirme pour chaque point le nouveau statut (CONSERVER / RÉSOLU)
- Liste ce qui reste en attente, avec justification si un point est volontairement reporté

Avant de commencer l'étape 1, confirme-moi le périmètre exact de fichiers/pages que tu vas toucher, et attends mon feu vert.
```

---

## 3. Point spécial : Faux témoignages

Le §12 du prompt de design concerne les **faux témoignages clients**.

**Règle pour Caba Résidence** :
- **Aucun faux témoignage** ne doit être affiché sur le site ;
- Les avis affichés doivent provenir de **vrais clients** ayant effectué un séjour ;
- Les avis Google vérifiés doivent pouvoir être intégrés (source : Google Business) ;
- Si le site n'a pas encore de vrais avis, la section "Avis" peut afficher un message du type "Soyez le premier à laisser un avis" ;
- Les photos stock pour les témoignages sont **interdites** ;
- Les noms génériques pour les témoignages sont **interdits**.

**Justification** : Les faux témoignages détruisent la confiance et la crédibilité. Un site de réservation premium ne ment pas sur ses avis.
