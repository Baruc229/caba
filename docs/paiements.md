# Paiements — Caba Résidence

Ce document décrit le système de paiements de la plateforme, incluant les moyens de paiement,
les statuts, l'architecture et les considérations de sécurité.

---

## 1. Moyens de paiement

### 1.1 Moyens supportés initialement

| Moyen | Description | Statut |
|-------|-------------|--------|
| Carte bancaire | Visa, Mastercard, etc. | Supporté |
| PayPal | Paiement via PayPal | Supporté |
| Virement bancaire | Virement depuis un compte bancaire | Supporté |

### 1.2 Moyens futurs

L'architecture doit permettre l'intégration ultérieure de moyens de paiement locaux
adaptés au marché africain :
- Mobile Money (MTN, Orange, Wave, etc.) ;
- Moov Money ;
- Autres moyens de paiement locaux.

---

## 2. Statuts de paiement

### 2.1 Statuts principaux

| Statut | Description | Action possible |
|--------|-------------|-----------------|
| En attente | Paiement initié mais non encore confirmé | Annuler, réessayer |
| Confirmé | Paiement reçu avec succès | Consulter |
| Échoué | Le paiement a échoué | Réessayer |
| Remboursé | Le montant a été remboursé au client | Consulter |

### 2.2 Statuts de solde

| Statut | Description |
|--------|-------------|
| Acompte | Une partie du montant a été payée |
| Solde restant | Le reste du montant est à payer |
| Intégralement payé | Le montant total a été payé |

---

## 3. Cycle de vie d'un paiement

### 3.1 Flux standard

```
1. Le client initie le paiement
   ↓
2. Le système crée un enregistrement de paiement (statut : "en attente")
   ↓
3. Le système redirige vers le fournisseur de paiement
   ↓
4. Le client effectue le paiement
   ↓
5. Le fournisseur de paiement confirme ou rejette
   ↓
6. Si confirmé :
   a. Le système met à jour le statut à "confirmé"
   b. Le système met à jour le statut de la réservation
   c. Le système envoie la confirmation
   ↓
7. Si rejeté :
   a. Le système met à jour le statut à "échoué"
   b. Le système informe le client
   c. Le client peut réessayer
```

### 3.2 Paiement avec acompte

```
1. Le client réserve avec acompte (ex. : 30 %)
   ↓
2. Le système calcule l'acompte : 3 315 € × 30 % = 994,50 €
   ↓
3. Le client paie l'acompte : 994,50 €
   ↓
4. La réservation passe en statut "Acquitée"
   ↓
5. Le solde restant (2 320,50 €) est à payer avant l'arrivée
   ↓
6. Le client paie le solde restant
   ↓
7. La réservation passe en statut "Payée"
```

### 3.3 Remboursement

```
1. Le client demande une annulation
   ↓
2. Le système vérifie les règles d'annulation
   ↓
3. Si remboursement applicable :
   a. Le système calcule le montant à rembourser
   b. Le système crée un enregistrement de remboursement
   c. Le système initie le remboursement via le fournisseur
   d. Le montant est remboursé au client
   e. Le statut du paiement passe à "remboursé"
   ↓
4. Le client reçoit la confirmation du remboursement
```

---

## 4. Détail du calcul des paiements

### 4.1 Exemple complet

**Réservation** :
- Montant total : 3 315 €
- Règle d'annulation : annulation gratuite jusqu'à 48h avant l'arrivée
- Règle d'acompte : 30 % à la réservation

**Détail** :
```
Montant total : 3 315 €

Acompte (30 %) : 994,50 €
  → Payé le 10 août 2026
  → Statut : confirmé

Solde restant : 2 320,50 €
  → À payer avant le 15 août 2026
  → Statut : en attente
```

### 4.2 Annulation avec remboursement

**Scénario** : Le client annule 5 jours avant l'arrivée (dans les règles).

```
Montant payé : 994,50 €
Frais d'annulation : 0 € (annulation gratuite)
Montant remboursé : 994,50 €
```

### 4.3 Annulation hors délai

**Scénario** : Le client annule 1 jour avant l'arrivée (hors des règles).

```
Montant payé : 994,50 €
Frais d'annulation : 50 % = 497,25 €
Montant remboursé : 497,25 €
```

---

## 5. Sécurité des paiements

### 5.1 Principes

- **Jamais** de stockage de données de carte bancaire sur le serveur ;
- Utilisation de **tokens** fournis par le fournisseur de paiement ;
- **Chiffrement** de toutes les communications avec le fournisseur ;
- **Validation** de chaque transaction côté serveur (pas uniquement côté client).

### 5.2 Fournisseurs de paiement

Pour chaque fournisseur, le système doit :
- Vérifier la signature des webhooks ;
- Valider le montant ;
- Vérifier l'unicité de la transaction ;
- Journaliser chaque opération.

### 5.3 Conformité

- **PCI-DSS** : les données de carte ne transittent jamais par notre serveur ;
- **3D Secure** : authentication forte pour les paiements en ligne ;
- **Rate limiting** : protection contre les tentatives frauduleuses.

---

## 6. Interface d'administration

### 6.1 Liste des paiements

Afficher tous les paiements avec :
- Numéro ;
- Réservation associée ;
- Client ;
- Montant ;
- Statut ;
- Moyen de paiement ;
- Date.

### 6.2 Filtres

Filtrer par :
- Statut (en attente, confirmé, échoué, remboursé) ;
- Période ;
- Moyen de paiement ;
- Réservation.

### 6.3 Détail d'un paiement

La page de détail doit afficher :
- Toutes les informations du paiement ;
- Historique des statuts ;
- Réservation associée ;
- Actions possibles (rembourser, réessayer).

### 6.4 Rapports

- Revenus par période ;
- Paiements en attente ;
- Remboursements effectués ;
- Répartition par moyen de paiement.

---

## 7. Espace client — Paiements

### 7.1 Historique

Le client doit pouvoir consulter l'historique de ses paiements :
- Montant ;
- Date ;
- Statut ;
- Réservation associée.

### 7.2 Reçu / Facture

Le client doit pouvoir :
- Consulter son reçu/facture en ligne ;
- Télécharger son reçu/facture en PDF.

### 7.3 Paiement du solde

Le client doit pouvoir payer le solde restant depuis son espace client :
- Lien direct vers la page de paiement ;
- Montant pré-rempli ;
- Confirmation immédiate.

---

## 8. Cas de test — Paiements

### Cas de test 1 : Paiement réussi

**Données** :
- Réservation : RES-2026-00001
- Montant : 3 315 €
- Moyen : Carte bancaire

**Étapes** :
1. Le client clique sur "Payer maintenant" ;
2. Il est redirigé vers la page de paiement ;
3. Il saisit ses informations de carte ;
4. Il valide le paiement ;
5. Le fournisseur confirme ;
6. Le système met à jour le statut à "confirmé" ;
7. La réservation passe à "Payée" ;
8. Le client reçoit la confirmation par email.

**Résultat attendu** : Paiement confirmé, réservation payée.

### Cas de test 2 : Paiement échoué

**Données** :
- Réservation : RES-2026-00002
- Montant : 1 500 €
- Moyen : Carte bancaire

**Étapes** :
1. Le client initie le paiement ;
2. Le fournisseur rejette la transaction (fonds insuffisants) ;
3. Le système met à jour le statut à "échoué" ;
4. Le client est informé de l'échec ;
5. Le client peut réessayer avec un autre moyen.

**Résultat attendu** : Paiement échoué, réservation en attente.

### Cas de test 3 : Remboursement

**Données** :
- Réservation : RES-2026-00003
- Montant payé : 994,50 € (acompte)
- Annulation : 5 jours avant l'arrivée

**Étapes** :
1. Le client demande l'annulation ;
2. Le système vérifie les règles (annulation gratuite) ;
3. Le système initie le remboursement de 994,50 € ;
4. Le fournisseur traite le remboursement ;
5. Le statut du paiement passe à "remboursé" ;
6. Le client reçoit la confirmation.

**Résultat attendu** : Remboursement effectué, montant retourné au client.
