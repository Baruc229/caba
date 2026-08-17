# Espace Client — Caba Résidence

Ce document décrit l'espace client, son fonctionnalités et les parcours utilisateur.

---

## 1. Vue d'ensemble

Toute réservation effectuée en ligne doit pouvoir être associée à un compte client.
L'espace client permet au client de gérer ses réservations, ses favoris et son profil.

---

## 2. Authentification

### 2.1 Création de compte

Le client doit pouvoir créer un compte avec :
- Nom ;
- Prénom ;
- Email (unique) ;
- Mot de passe ;
- Téléphone (optionnel).

**Options** :
- Inscription par formulaire ;
- Inscription via OAuth (Google, Apple, Facebook) ;
- Inscription lors de la première réservation.

### 2.2 Connexion

- Email + mot de passe ;
- Mot de passe oublié → email de réinitialisation ;
- Session sécurisée (token JWT ou équivalent) ;
- Option "Se souvenir de moi".

### 2.3 Confirmation d'email

- Après inscription, un email de confirmation est envoyé ;
- Le compte est activé après confirmation ;
- Envoi automatique d'un nouvel email si le premier n'est pas reçu.

### 2.4 Récupération de mot de passe

- Le client saisit son email ;
- Un email avec un lien de réinitialisation est envoyé ;
- Le lien expire après un délai configuré (ex. : 24h) ;
- Le client choisit un nouveau mot de passe.

---

## 3. Tableau de bord

### 3.1 Vue d'ensemble

Le tableau de bord affiche :
- Résumé des réservations actives ;
- Prochaines arrivées/départs ;
- Notifications récentes ;
- Accès rapide aux sections.

### 3.2 Navigation

| Section | Description |
|---------|-------------|
| Réservations | Liste des réservations (actives et passées) |
| Favoris | Logements sauvegardés |
| Avis | Avis laissés |
| Messages | Messagerie avec Caba Résidence |
| Profil | Informations personnelles |
| Paramètres | Préférences et sécurité |

---

## 4. Gestion des réservations

### 4.1 Liste des réservations

Afficher toutes les réservations du client :
- Numéro ;
- Logement ;
- Dates ;
- Statut ;
- Montant.

**Filtres** :
- Toutes ;
- Actives ;
- À venir ;
- Passées ;
- Annulées.

### 4.2 Détail d'une réservation

La page de détail doit afficher :
- Statut de la réservation ;
- Dates d'arrivée et de départ ;
- Nombre de voyageurs ;
- Logement (avec lien vers la page) ;
- Détail du prix (séjour, frais, taxes, total) ;
- Paiements effectués ;
- Actions possibles.

### 4.3 Actions

Selon les règles configurées par le propriétaire, le client peut :
- **Modifier** la réservation (dates, voyageurs) ;
- **Demander une annulation** ;
- **Télécharger le reçu/facture** ;
- **Ajouter un avis** (après le séjour) ;
- **Contacter Caba Résidence** concernant la réservation.

### 4.4 Statuts

| Statut | Description |
|--------|-------------|
| Demande en attente | Demande reçue, en attente de traitement |
| Réservation temporaire | Verrouillage en cours |
| En attente de paiement | Paiement en cours |
| Confirmée | Réservation validée |
| Payée | Paiement reçu intégralement |
| Modifiée | Réservation modifiée |
| Annulée | Réservation annulée |
| Terminée | Séjour terminé |

---

## 5. Paiements

### 5.1 Historique

Le client doit pouvoir consulter l'historique de ses paiements :
- Montant ;
- Date ;
- Statut ;
- Réservation associée.

### 5.2 Reçu / Facture

Le client doit pouvoir :
- Consulter son reçu/facture en ligne ;
- Télécharger son reçu/facture en PDF.

### 5.3 Paiement du solde

Si le client a payé un acompte, il doit pouvoir payer le solde restant
depuis son espace client.

---

## 6. Favoris

### 6.1 Ajout aux favoris

Depuis la page d'un logement ou les résultats de recherche, le client peut
ajouter un logement à ses favoris (bouton cœur).

### 6.2 Liste des favoris

Le client peut consulter la liste de ses favoris :
- Photo du logement ;
- Nom ;
- Type ;
- Prix ;
- Disponibilité ;
- Bouton "Réserver".

### 6.3 Suppression

Le client peut retirer un logement de ses favoris.

---

## 7. Avis

### 7.1 Ajout d'un avis

Après un séjour terminé, le client peut ajouter un avis :
- Note (1 à 5 étoiles) ;
- Commentaire ;
- Photos (optionnel).

### 7.2 Modération

Les avis passent par une modération avant publication.

### 7.3 Avis existants

Le client peut consulter les avis qu'il a laissés.

---

## 8. Messages

### 8.1 Messagerie

Le client peut envoyer des messages à Caba Résidence :
- Depuis son espace client ;
- En lien avec une réservation spécifique.

### 8.2 Notifications

Le client reçoit des notifications pour :
- Mise à jour de réservation ;
- Paiement reçu ;
- Réponse à un message ;
- Rappel d'arrivée/départ.

---

## 9. Profil

### 9.1 Informations personnelles

Le client peut modifier :
- Nom ;
- Prénom ;
- Email ;
- Téléphone ;
- Avatar/photo de profil.

### 9.2 Sécurité

Le client peut :
- Modifier son mot de passe ;
- Activer/désactiver l'authentification à deux facteurs ;
- Consulter les sessions actives ;
- Déconnecter toutes les sessions.

### 9.3 Préférences

Le client peut configurer ses préférences de notification :
- Email ;
- WhatsApp ;
- Push (si disponible).

---

## 10. Responsive

L'espace client doit fonctionner parfaitement sur :
- Mobile ;
- Tablette ;
- Desktop.

**Sur mobile** :
- Navigation simplifiée ;
- Accès rapide aux réservations ;
- Paiement optimisé ;
- Toutes les fonctionnalités accessibles.

---

## 11. Cas de test — Espace client

### Cas de test 1 : Inscription et première réservation

**Étapes** :
1. Le client clique sur "Réserver" ;
2. Le système redirige vers l'inscription ;
3. Le client crée son compte ;
4. Le client confirme son email ;
5. Le client effectue le paiement ;
6. La réservation est confirmée ;
7. Le client retrouve sa réservation dans son espace client.

**Résultat attendu** : Compte créé, réservation confirmée, visible dans l'espace client.

### Cas de test 2 : Modification de réservation

**Étapes** :
1. Le client se connecte à son espace client ;
2. Il sélectionne une réservation active ;
3. Il clique sur "Modifier" ;
4. Il change les dates ;
5. Le système recalcule le prix ;
6. Le client confirme la modification ;
7. Le client reçoit la confirmation.

**Résultat attendu** : Réservation modifiée, prix recalculé, confirmation envoyée.

### Cas de test 3 : Annulation

**Étapes** :
1. Le client se connecte ;
2. Il sélectionne une réservation ;
3. Il clique sur "Annuler" ;
4. Le système vérifie les règles d'annulation ;
5. Si annulation gratuite → remboursement intégral ;
6. Si hors délai → frais d'annulation ;
7. Le client confirme ;
8. La réservation est annulée ;
9. Le remboursement est initié.

**Résultat attendu** : Réservation annulée, remboursement traité si applicable.
