# Synchronisation iCal — Caba Résidence

Ce document décrit le système de synchronisation iCal, permettant d'importer et d'exporter
les disponibilités avec des plateformes externes.

---

## 1. Principe

La synchronisation iCal permet de maintenir les disponibilités à jour entre
Caba Résidence et les plateformes externes (Airbnb, Booking.com, Google Calendar, etc.).

**Objectif** : Prévenir les doubles réservations en synchronisant en temps réel
les disponibilités entre toutes les sources.

---

## 2. Fonctionnalités

### 2.1 Import iCal

**Description** : Récupérer les disponibilités depuis un calendrier externe.

**Fonctionnement** :
```
1. Le propriétaire configure l'URL du calendrier iCal source
   ↓
2. Le système fetch périodiquement le fichier iCal
   ↓
3. Le système analyse les événements (réservations, blocages)
   ↓
4. Le système met à jour la disponibilité dans le moteur central
   ↓
5. Le créneau est bloqué sur Caba Résidence
```

**Données importées** :
- Dates d'arrivée et de départ ;
- Statut (confirmé, en attente) ;
- Identifiant unique de l'événement.

### 2.2 Export iCal

**Description** : Publier les disponibilités de Caba Résidence vers un calendrier externe.

**Fonctionnement** :
```
1. Le système génère un fichier iCal avec les disponibilités
   ↓
2. Le propriétaire copie l'URL d'export
   ↓
3. Il la configure sur la plateforme externe
   ↓
4. La plateforme externe récupère les disponibilités
   ↓
5. Les créneaux réservés sur Caba Résidence sont bloqués sur la plateforme externe
```

**Données exportées** :
- Toutes les réservations confirmées ;
- Tous les blocages administratifs ;
- Les périodes de maintenance.

### 2.3 Synchronisation bidirectionnelle

Pour une synchronisation complète, le système doit supporter :
- L'import depuis une source externe ;
- L'export vers une source externe ;
- La synchronisation automatique périodique.

---

## 3. Prévention des doubles réservations

### 3.1 Principe

Le système doit **toujours vérifier** les sources externes avant de confirmer une réservation.

### 3.2 Flux de vérification

```
1. Un client demande une réservation sur Caba Résidence
   ↓
2. Le système vérifie la disponibilité locale
   ↓
3. Si le créneau est libre localement :
   a. Le système vérifie les calendriers iCal synchronisés
   b. Si le créneau est libre sur toutes les sources → confirmation
   c. Si le créneau est occupé sur une source → refus
   ↓
4. Si le créneau est occupé localement → refus immédiat
```

### 3.3 Conflits

En cas de conflit (réservation reçue simultanément sur Caba Résidence et une source externe) :
- La première réservation confirmée est conservée ;
- La seconde est automatiquement rejetée ;
- Un message d'alerte est envoyé à l'administrateur.

---

## 4. Gestion dans le back-office

### 4.1 Interface de configuration

Pour chaque logement, le propriétaire peut :
- **Ajouter** une source iCal (URL d'import) ;
- **Générer** une URL d'export ;
- **Configurer** la fréquence de synchronisation ;
- **Activer/Désactiver** la synchronisation.

### 4.2 Fréquence de synchronisation

| Option | Fréquence | Description |
|--------|-----------|-------------|
| Manuelle | À la demande | Le propriétaire lance la sync manuellement |
| Horaire | Toutes les heures | Sync automatique chaque heure |
| Quotidienne | Une fois par jour | Sync automatique une fois par jour |

### 4.3 Statut de synchronisation

Pour chaque synchronisation, afficher :
- Statut (active, error, désactivée) ;
- Dernière synchronisation réussie ;
- Message d'erreur (le cas échéant) ;
- Nombre d'événements synchronisés.

### 4.4 Journal des synchronisations

Le système doit enregistrer chaque opération de synchronisation :
- Date et heure ;
- Logement concerné ;
- Type (import/export) ;
- Nombre d'événements traités ;
- Statut (succès/erreur) ;
- Message d'erreur (le cas échéant).

---

## 5. Gestion des erreurs

### 5.1 Types d'erreurs

| Erreur | Description | Action |
|--------|-------------|--------|
| URL invalide | L'URL du calendrier iCal n'est pas valide | Vérifier l'URL |
| Timeout | La connexion a expiré | Réessayer plus tard |
| Format invalide | Le fichier iCal n'est pas au bon format | Vérifier le format |
| Authentification échouée | Accès refusé au calendrier | Vérifier les identifiants |
| Données corrompues | Les données du calendrier sont corrompues | Contacter la source |

### 5.2 Notifications d'erreur

Lorsqu'une erreur de synchronisation est détectée :
- Le statut de la synchronisation passe à "error" ;
- Un message d'erreur est enregistré ;
- Une notification est envoyée à l'administrateur ;
- La synchronisation continue de fonctionner avec les données précédentes.

### 5.3 Résolution

L'administrateur doit pouvoir :
- Consulter les détails de l'erreur ;
- Corriger la configuration ;
- Relancer la synchronisation manuellement ;
- Supprimer la synchronisation en cas de problème irrésolu.

---

## 6. Considérations techniques

### 6.1 Performance

- La synchronisation ne doit pas impacter les performances du site ;
- Les opérations de sync doivent être exécutées en arrière-plan ;
- Le cache des disponibilités doit être invalidé après chaque sync.

### 6.2 Fiabilité

- Le système doit gérer les timeouts gracieusement ;
- Les syncs échouées doivent être réessayées automatiquement ;
- Les données doivent être synchronisées de manière atomique.

### 6.3 Sécurité

- Les URLs iCal doivent être stockées de manière sécurisée ;
- L'accès aux calendriers externes doit être authentifié si nécessaire ;
- Les données synchronisées doivent être validées avant injection.

---

## 7. Cas de test — Synchronisation iCal

### Cas de test 1 : Import réussi

**Données** :
- Logement : Villa B
- Source : Airbnb (URL iCal fournie)
- Événement importé : Réservation du 15 au 20 septembre 2026

**Résultat attendu** :
- Le créneau 15-20 septembre est bloqué sur Caba Résidence ;
- Le statut de la sync est "active" ;
- La date de dernière sync est mise à jour.

### Cas de test 2 : Erreur de synchronisation

**Données** :
- Logement : Studio C
- Source : Booking.com (URL incorrecte)

**Résultat attendu** :
- La sync échoue avec une erreur "URL invalide" ;
- Le statut passe à "error" ;
- Une notification est envoyée à l'administrateur ;
- Les disponibilités précédentes restent inchangées.

### Cas de test 3 : Conflit de réservation

**Données** :
- Logement : Chambre A
- Sync iCal : Réservation importée du 10 au 15 août
- Demande simultanée : Client tente de réserver du 12 au 14 août

**Résultat attendu** :
- Le système détecte le conflit via la sync iCal ;
- La réservation est refusée ;
- Le client est informé que le logement n'est pas disponible.
