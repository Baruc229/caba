# Sécurité — Caba Résidence

Ce document décrit les mesures de sécurité à implémenter pour protéger
la plateforme, les données des utilisateurs et les transactions financières.

---

## 1. Authentification

### 1.1 Mots de passe

- **Hashage** : utiliser un algorithme fort (bcrypt, Argon2) ;
- **Complexité minimale** : 8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial ;
- **Salt** : chaque mot de passe doit être salé de manière unique ;
- **Interdiction** : pas de mots de passe communs, pas de dictionnaire ;
- **Historique** : interdire la réutilisation des 5 derniers mots de passe.

### 1.2 Sessions

- **Durée** : sessions à durée limitée (ex. : 24h pour les clients, 8h pour les administrateurs) ;
- **Renouvellement** : renouvellement du token à chaque action sensible ;
- **Invalidation** : déconnexion immédiate sur demande ou après changement de mot de passe ;
- **Multi-device** : possibilité de voir les sessions actives et de les révoquer.

### 1.3 Authentification à deux facteurs (2FA)

- Optionnelle pour les clients ;
- **Recommandée** pour les administrateurs et gestionnaires ;
- Méthodes : email, application authenticator (TOTP).

### 1.4 Protection contre les attaques

- **Rate limiting** sur les tentatives de connexion (ex. : 5 tentatives par 15 minutes) ;
- **Verrouillage temporaire** du compte après plusieurs échecs ;
- **CAPTCHA** après plusieurs tentatives échouées ;
- **Notification** au client en cas de connexion suspecte.

---

## 2. Protection des données

### 2.1 Chiffrement

- **HTTPS** obligatoire sur l'ensemble du site ;
- **TLS 1.2 minimum** pour les communications ;
- **Chiffrement au repos** pour les données sensibles (mots de passe, informations de paiement).

### 2.2 Données de paiement

- **Jamais** de stockage de données de carte bancaire sur le serveur ;
- Utilisation de **tokens** fournis par le fournisseur de paiement ;
- **PCI-DSS** : conformité aux normes de sécurité des données de carte ;
- **3D Secure** : authentication forte pour les paiements en ligne.

### 2.3 Données personnelles

- **RGPD** : conformité au Règlement Général sur la Protection des Données ;
- **Droit à l'oubli** : possibilité de supprimer son compte et ses données ;
- **Portabilité** : possibilité d'exporter ses données ;
- **Consentement** : collecte du consentement pour les cookies et données non essentielles ;
- **Minimisation** : ne collecter que les données strictement nécessaires.

---

## 3. Protection contre les attaques web

### 3.1 Validation des entrées

- **Sanitization** de toutes les entrées utilisateur ;
- **Whitelist** plutôt que blacklist pour la validation ;
- **Longueur maximale** sur tous les champs ;
- **Type checking** : vérifier le type de chaque donnée attendue.

### 3.2 Protection XSS (Cross-Site Scripting)

- **Échappement** de tous les contenus affichés ;
- **Content Security Policy (CSP)** : politique stricte ;
- **HttpOnly cookies** : les cookies de session ne doivent pas être accessibles via JavaScript ;
- **X-XSS-Protection** header activé.

### 3.3 Protection CSRF (Cross-Site Request Forgery)

- **Tokens CSRF** sur tous les formulaires ;
- **Vérification** du header Origin/Referer ;
- **SameSite** cookies : attribut "Strict" ou "Lax".

### 3.4 Protection contre les injections

- **Requêtes paramétrées** (prepared statements) pour toutes les requêtes SQL ;
- **ORM** pour l'accès aux données ;
- **Pas d'interpolation** de données utilisateur dans les requêtes ;
- **Validation** de tous les paramètres avant utilisation.

### 3.5 Rate Limiting

- **Taux limité** pour chaque endpoint ;
- **Rate limiting global** pour protéger contre les attaques DDoS ;
- **Rate limiting par IP** pour les endpoints sensibles ;
- **Rate limiting par utilisateur** pour les actions authentifiées.

---

## 4. Sécurité des uploads

### 4.1 Validation des fichiers

- **Type MIME** vérifié (pas uniquement l'extension) ;
- **Taille maximale** configurée (ex. : 5 Mo par image) ;
- **Dimensions maximales** configurées ;
- **Extension autorisée** : whitelist stricte (JPG, PNG, WebP uniquement).

### 4.2 Traitement

- **Renommage** des fichiers uploadés (pas de nom d'origine) ;
- **Stockage** hors du dossier web ;
- **Vérification** de l'intégrité du fichier ;
- **Compression** et **optimisation** automatiques.

### 4.3 Protection

- **Pas d'exécution** de fichiers uploadés ;
- **Scan antivirus** recommandé pour les production ;
- **Isolation** du dossier d'upload.

---

## 5. Sécurité des paiements

### 5.1 Architecture

- **Tokenisation** : les données de carte ne transittent jamais par notre serveur ;
- **HTTPS** obligatoire pour toutes les transactions ;
- **Webhook signature** : vérification de la signature des webhooks du fournisseur.

### 5.2 Validation

- **Montant** vérifié côté serveur (pas uniquement côté client) ;
- **Devise** vérifiée ;
- **Unicité** de la transaction garantie ;
- **Idempotency** : protection contre les doubles paiements.

### 5.3 Journalisation

- **Logging** de chaque opération de paiement ;
- **Audit trail** : traçabilité complète des transactions ;
- **Alertes** en cas d'anomalie.

---

## 6. Audit et monitoring

### 6.1 Logs

- **Authentification** : chaque tentative de connexion (succès/échec) ;
- **Actions sensibles** : modification de réservation, annulation, paiement ;
- **Erreurs** : toutes les erreurs serveur ;
- **Performance** : temps de réponse, lenteurs.

### 6.2 Audit des actions administratives

Chaque action administrative doit être tracée :
- Qui (utilisateur) ;
- Quoi (action effectuée) ;
- Quand (horodatage) ;
- Où (endpoint, IP) ;
- Résultat (succès/échec).

### 6.3 Monitoring

- **Alertes** en cas de taux d'erreur élevé ;
- **Alertes** en cas de tentative d'intrusion ;
- **Alertes** en cas de performance dégradée ;
- **Dashboard** de supervision en temps réel.

---

## 7. Sauvegardes

### 7.1 Stratégie

- **Sauvegardes automatiques** quotidiennes de la base de données ;
- **Sauvegardes incrémentales** toutes les heures ;
- **Rétention** : 30 jours de sauvegardes ;
- **Stockage** : sauvegardes stockées dans un emplacement sécurisé et séparé.

### 7.2 Tests de restauration

- **Tests réguliers** de restauration des sauvegardes ;
- **Documentation** des procédures de restauration ;
- **Objectif** : restauration en moins de 4 heures.

---

## 8. Sécurité de l'infrastructure

### 8.1 Serveurs

- **Mises à jour** régulières du système d'exploitation ;
- **Pare-feu** configuré et activé ;
- **Accès SSH** limité et audité ;
- **Clés SSH** plutôt que mots de passe.

### 8.2 Réseau

- **Isolation** des environnements (développement, staging, production) ;
- **VPN** pour l'accès aux ressources internes ;
- **Monitoring réseau** en temps réel.

### 8.3 Déploiement

- **Pipeline CI/CD** sécurisé ;
- **Secrets** stockés dans un gestionnaire de secrets (pas dans le code) ;
- **Déploiement** automatisé avec vérification ;
- **Rollback** possible en cas de problème.

---

## 9. Conformité

### 9.1 RGPD

- **Politique de confidentialité** accessible ;
- **Consentement** collecté pour les cookies ;
- **Droit d'accès** : possibilité de consulter ses données ;
- **Droit de rectification** : possibilité de modifier ses données ;
- **Droit à l'effacement** : possibilité de supprimer son compte ;
- **Portabilité** : possibilité d'exporter ses données.

### 9.2 PCI-DSS

- **Pas de stockage** de données de carte bancaire ;
- **HTTPS** obligatoire ;
- **Tokenisation** des paiements ;
- **Audit** régulier de la conformité.

---

## 10. Plan de réponse aux incidents

### 10.1 Classification

| Niveau | Description | Délai de réponse |
|--------|-------------|------------------|
| Critique | Fuite de données, ransomware | Immédiat |
| Haute | Intrusion détectée, service indisponible | < 1 heure |
| Moyenne | Tentative d'intrusion, erreur de sécurité | < 4 heures |
| Basse | Anomalie détectée, anomalie de performance | < 24 heures |

### 10.2 Procédure

1. **Détection** : identification de l'incident ;
2. **Classification** : évaluation de la sévérité ;
3. **Containment** : isolation du problème ;
4. **Éradication** : suppression de la menace ;
5. **Récupération** : restauration du service ;
6. **Leçons** : analyse post-mortem et améliorations.
