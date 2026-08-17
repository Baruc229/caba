# WhatsApp et Notifications — Caba Résidence.

Ce document décrit l'intégration WhatsApp et le système de notifications de la plateforme.

---

## 1. Intégration WhatsApp

### 1.1 Principe

WhatsApp est un canal de communication secondaire permettant au client d'envoyer
une demande de réservation au propriétaire, même sans compte client.

### 1.2 Fonctionnement

```
Le client clique sur "Demander via WhatsApp"
  ↓
Une conversation WhatsApp s'ouvre avec le numéro configuré
  ↓
Le client envoie sa demande avec les informations pré-remplies
  ↓
La demande est enregistrée dans le back-office
  ↓
Le propriétaire traite la demande
```

### 1.3 Données pré-remplies

Lorsque le client clique sur "Demander via WhatsApp", le message pré-rempli doit contenir :

```
Bonjour, je souhaite réserver :

Logement : [Nom du logement]
Dates : [Date d'arrivée] au [Date de départ]
Voyageurs : [Nombre] ([Détail : X adultes, Y enfants, Z bébés])
Prix estimé : [Prix] €

Merci de me confirmer la disponibilité.
```

### 1.4 Enregistrement dans le back-office

Même si la demande provient de WhatsApp, elle doit être enregistrée dans le back-office avec :

| Champ | Valeur |
|-------|--------|
| Client | Nom, email, téléphone |
| Logement | Logement demandé |
| Dates | Date d'arrivée et de départ |
| Heures | Heure d'arrivée et de départ (si applicable) |
| Voyageurs | Nombre d'adultes, enfants, bébés |
| Prix estimé | Prix calculé par le moteur de tarification |
| Message | Message libre du client |
| Source | "WhatsApp" |
| Statut | "Demande en attente" |

### 1.5 Gestion par le propriétaire

Le propriétaire peut :
- **Confirmer** la demande → la transformer en réservation ;
- **Refuser** la demande → informer le client du motif ;
- **Demander des informations complémentaires** → envoyer un message via WhatsApp.

### 1.6 Transformation en réservation

Lorsque le propriétaire confirme une demande WhatsApp :

1. La demande est transformée en réservation ;
2. Le statut passe à "En attente de paiement" ;
3. Le client reçoit un lien pour créer un compte (si nécessaire) et payer ;
4. Le paiement est effectué ;
5. La réservation passe au statut "Confirmée" ;
6. Le créneau est bloqué ;
7. Le client reçoit sa confirmation.

### 1.7 Création de compte

Si le client n'a pas de compte, il pourra en créer un pour :
- Retrouver sa réservation ;
- Consulter son historique ;
- Ajouter un avis ;
- Gérer ses favoris.

---

## 2. Système de notifications

### 2.1 Types de notifications

Le système doit gérer les types de notifications suivants :

| Type | Description | Destinataire(s) |
|------|-------------|------------------|
| Nouvelle réservation | Nouvelle réservation reçue | Administrateur |
| Demande WhatsApp | Nouvelle demande WhatsApp | Administrateur |
| Paiement | Paiement reçu | Administrateur, Client |
| Annulation | Réservation annulée | Administrateur, Client |
| Modification | Réservation modifiée | Administrateur, Client |
| Nouveau message | Message reçu du client | Administrateur |
| Nouvel avis | Nouvel avis laissé par un client | Administrateur |
| Rappel d'arrivée | Rappel avant l'arrivée du client | Client |
| Rappel de départ | Rappel avant le départ du client | Client |
| Disponibilité libérée | Un créneau est devenu libre | Administrateur |
| Erreur de synchronisation | Problème de sync iCal | Administrateur |

### 2.2 Canaux de notification

| Canal | Description | Utilisation |
|-------|-------------|-------------|
| Email | Envoi d'emails transactionnels | Confirmations, rappels, alertes |
| WhatsApp | Messages WhatsApp | Confirmations, rappels |
| In-app | Notifications dans l'interface | Alertes en temps réel |
| Push | Notifications push (si application mobile) | Alertes urgentes |
| SMS | Messages SMS (optionnel) | Rappels importants |

### 2.3 Configuration

Le propriétaire doit pouvoir configurer :
- Les canaux activés pour chaque type de notification ;
- Les modèles de message (email, WhatsApp, etc.) ;
- Les délais de rappel (ex. : 24h avant l'arrivée) ;
- Les destinataires par défaut.

---

## 3. Notifications détaillées

### 3.1 Nouvelle réservation

**Destinataire** : Administrateur

**Contenu** :
```
Objet : Nouvelle réservation #RES-2026-00001

Une nouvelle réservation a été reçue :

Client : Jean Dupont
Logement : Appartement meublé - Vue mer
Dates : 17 août au 1 septembre 2026
Voyageurs : 9
Montant : 3 315 €
Source : Site web

[Consulter la réservation]
```

### 3.2 Demande WhatsApp

**Destinataire** : Administrateur

**Contenu** :
```
Objet : Nouvelle demande WhatsApp

Une nouvelle demande a été reçue via WhatsApp :

Client : Marie Martin
Téléphone : +33 6 98 76 54 32
Logement : Chambre A
Dates : 20 au 22 août 2026
Message : "Bonjour, je souhaiterais réserver pour 2 nuits"

[Traiter la demande]
```

### 3.3 Confirmation de réservation

**Destinataire** : Client

**Contenu** :
```
Objet : Confirmation de votre réservation #RES-2026-00001

Bonjour Jean,

Votre réservation est confirmée !

Logement : Appartement meublé - Vue mer
Dates : 17 août au 1 septembre 2026
Voyageurs : 9
Montant total : 3 315 €

Nous vous attendons avec impatience !

Caba Résidence
```

### 3.4 Rappel d'arrivée

**Destinataire** : Client

**Délai** : 24h avant l'arrivée (configurable)

**Contenu** :
```
Objet : Rappel : votre arrivée demain

Bonjour Jean,

Nous vous rappelons que votre arrivée est prévue demain.

Logement : Appartement meublé - Vue mer
Date d'arrivée : 17 août 2026
Heure d'arrivée : 15h00

Adresse : [Adresse complète]

À demain !

Caba Résidence
```

### 3.5 Rappel de départ

**Destinataire** : Client

**Délai** : 24h avant le départ (configurable)

**Contenu** :
```
Objet : Rappel : votre départ demain

Bonjour Jean,

Nous vous rappelons que votre départ est prévu demain.

Logement : Appartement meublé - Vue mer
Date de départ : 1 septembre 2026
Heure de départ : 11h00

Merci de vérifier que vous avez tout votre belonging.

Au revoir et à bientôt !

Caba Résidence
```

### 3.6 Erreur de synchronisation

**Destinataire** : Administrateur

**Contenu** :
```
Objet : Alerte : erreur de synchronisation iCal

Une erreur de synchronisation iCal a été détectée :

Logement : Villa B
URL : https://calendar.airbnb.com/ical/...
Erreur : Timeout lors de la connexion
Dernière sync réussie : 15 août 2026 14h30

[Consulter les détails]
```

---

## 4. Gestion des préférences de notification

### 4.1 Côté administrateur

L'administrateur doit pouvoir :
- Activer/désactiver chaque canal pour chaque type ;
- Personnaliser les modèles de message ;
- Configurer les délais de rappel ;
- Définir les destinataires par défaut.

### 4.2 Côté client

Le client doit pouvoir :
- Consulter ses préférences de notification ;
- Activer/désactiver les notifications par canal ;
- Se désinscrire des notifications marketing (garder les transactionnelles).

---

## 5. Journal des notifications

Toutes les notifications envoyées doivent être enregistrées dans un journal avec :
- Date d'envoi ;
- Destinataire ;
- Type ;
- Canal ;
- Statut (envoyé, échoué, lu) ;
- Contenu.

Ce journal doit être accessible depuis le back-office pour le suivi et le dépannage.
