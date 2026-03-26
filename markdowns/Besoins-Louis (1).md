
## Tables SQL

La table `users` existe déjà (auth). S'assurer que la colonne `stripe_customer_id` est présente.

### schedule_slots

Chaque ligne représente un créneau disponible dans le calendrier, lié à un Stripe Product.

| Colonne | Type | Notes |
|---------|------|-------|
| id | int | Clé primaire |
| stripe_product_id | string | Référence au Stripe Product (ex. `prod_ABC123`) |
| date | date | Jour du créneau |
| start_time | time | Heure de début (ex. `09:00`) |
| end_time | time | Heure de fin |
| capacity | int | Nombre total de places |
| spots_remaining | int | Décrémenté à la confirmation de réservation (webhook) |
| status | enum | `open`, `full`, `cancelled` |

### bookings

Chaque ligne représente une réservation d'un client pour un créneau.

| Colonne | Type | Notes |
|---------|------|-------|
| id | int | Clé primaire |
| schedule_slot_id | int | FK vers `schedule_slots` |
| stripe_customer_id | string | Le Stripe Customer qui a réservé |
| stripe_checkout_session_id | string | ID de la session Stripe Checkout |
| stripe_payment_intent_id | string | Reçu via le webhook Stripe |
| quantity | int | Nombre de places réservées (1 = client seul, 2+ = avec accompagnants) — default `1` |
| status | enum | `pending`, `confirmed`, `cancelled`, `refunded` |
| created_at | timestamp | |

---

## Système de niveau

Le niveau est un **entier**. Chaque formule (Stripe Product) a un niveau dans ses metadata (`"niveau": "5"`). Chaque client (Stripe Customer) a aussi un niveau dans ses metadata.

**Règle de filtrage : un client de niveau N peut accéder à toutes les formules dont le niveau est ≤ N.**

Mapping complet :

| Niveau | Formules |
|--------|----------|
| 1 | 5 à 8 - Découvrir la voile |
| 2 | Voyager autrement à la voile |
| 3 | Initiation à la voile |
| 4 | Croisière élémentaire, Voyage Accompagnée |
| 5 | Journée de Navigation - manoeuvres élémentaire, Pratique de Navigation - Soirée, Manoeuvre de Port & Pilotage, Balade à Voile |
| 6 | Journée de Navigation - manoeuvres complexes |
| 7 | Carte d'embarcation de plaisance (PCOC) |
| 9 | Certificat de secourisme et RCR, CROM(M) VHF avec endossement ASN, Initiation à la Navigation de Nuit |
| 12 | Brevet de Navigation Côtière - Niveau 1 |
| 14 | Cap sur l'Intermédiaire |
| 15 | Croisière Intermédiaire |
| 16 | Cap sur l'Instructeur IVQ et élémentaire - Voile Canada |
| 17 | Brevet de Navigation Côtière Intermédiaire - Niveau 2 |
| 18 | Cap sur l'Avancé |
| 19 | Croisière Avancée |
| 20 | Voyage en Flotille |
| 21 | Cap sur le Yachtmaster |
| 22 | Yachtmaster |

> Les niveaux 8, 10, 11, 13 n'existent pas — c'est intentionnel.

---

## Metadata Stripe

### Stripe Product (une formule)

```json
{
  "id": "prod_ABC123",
  "name": "Initiation à la voile",
  "metadata": {
    "type": "formule",
    "format": "Journalier",
    "nb_max_personnes": "4",
    "niveau": "3",
    "duree_heures": "14",
    "lieu": "Yacht Club de Beaconsfield"
  }
}
```

- `niveau` : entier sous forme de string (Stripe stocke tout en string). Parser en int pour comparer.
- `type` : `"slot"` ou `"formule"`.

### Stripe Customer (un client)

```json
{
  "id": "cus_XYZ789",
  "metadata": {
    "niveau": "1",
    "auth_user_id": "42"
  }
}
```

Les Stripe Products seront créés manuellement dans le dashboard Stripe. Le backend doit les lire, pas les créer.

---

## Routes API

Toutes les routes authentifiées requièrent le header `Authorization: Bearer {token}`.

---

### 1. GET /api/user

Restaure la session utilisateur. Appelé à chaque chargement de page par le frontend.

**Auth :** Requis

**Réponse 200 :**
```json
{
  "id": 42,
  "name": "Jean Tremblay",
  "email": "user@example.com",
  "role": "user",
  "actif": true,
  "niveau": 1,
  "stripe_customer_id": "cus_XYZ789",
  "email_verified_at": "2026-01-01T00:00:00Z",
  "created_at": "...",
  "updated_at": "..."
}
```

Le champ `niveau` doit être lu depuis les metadata du Stripe Customer (ou une version cachée). C'est un entier.

---

### 2. GET /api/schedule/slots

Retourne les créneaux disponibles pour un mois donné, filtrés par le niveau du client.

**Auth :** Requis

**Query params :** `month=6&year=2026`

**Réponse 200 :**
```json
{
  "data": [
    {
      "id": 1,
      "stripe_product_id": "prod_ABC123",
      "product_name": "Initiation à la voile",
      "type": "formule",
      "format": "Journalier",
      "niveau": 3,
      "date": "2026-06-15",
      "start_time": "09:00",
      "end_time": "16:00",
      "spots_remaining": 3,
      "max_spots": 4,
      "nb_max_personnes": 4,
      "duree_heures": 14,
      "lieu": "Yacht Club de Beaconsfield"
    }
  ],
  "meta": {
    "month": 6,
    "year": 2026,
    "total_slots": 42,
    "user_niveau": 5
  }
}
```

**Logique backend :**
1. Lire le niveau (int) du client depuis ses Stripe Customer metadata.
2. Récupérer tous les Stripe Products dont `metadata.niveau` (int) est ≤ au niveau du client.
3. Joindre avec `schedule_slots` pour le mois demandé où `status = 'open'` et `spots_remaining > 0`.
4. Retourner les données fusionnées.

Le filtrage par format et type est fait côté frontend — le backend retourne tous les créneaux correspondants pour le mois.

---

### 3. POST /api/booking/checkout

Crée une session Stripe Checkout et retourne l'URL de paiement.

**Auth :** Requis

**Body :**
```json
{
  "slot_id": 1,
  "stripe_product_id": "prod_ABC123",
  "quantity": 2
}
```

> `quantity` est le nombre total de places (client + accompagnants). Minimum `1`. Le frontend l'envoie toujours, même si c'est `1`.

**Réponse 200 :**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_live_...",
  "session_id": "cs_live_..."
}
```

**Réponse 409 (créneau complet) :**
```json
{
  "message": "Cette plage horaire est maintenant complète."
}
```

**Logique backend :**
1. Vérifier que `quantity <= spots_remaining`. Retourner 409 si insuffisant.
2. Vérifier que le niveau du client (int) est ≥ au niveau du produit.
3. Créer une Stripe Checkout Session avec :
   - `customer` : le `stripe_customer_id` du client
   - `line_items` : le Price du produit avec `quantity` (Stripe multiplie le prix automatiquement)
   - `success_url` : `https://yourdomain.com/reserver/succes?session_id={CHECKOUT_SESSION_ID}` — `{CHECKOUT_SESSION_ID}` est un template Stripe, remplacé automatiquement
   - `cancel_url` : `https://yourdomain.com/reserver`
   - `metadata` : `{ slot_id, user_id, quantity }`
4. Créer une ligne dans `bookings` avec `status = 'pending'` et `quantity`.
5. Retourner l'URL et le session ID.

---

### 4. POST /api/webhooks/stripe

Route appelée directement par Stripe après un paiement. Le frontend n'appelle jamais cette route.

**Auth :** Aucune (vérification via la signature Stripe)

**Événement traité :** `checkout.session.completed`

**Logique backend :**
1. Vérifier la signature du webhook avec le Stripe webhook secret.
2. Trouver la réservation par `stripe_checkout_session_id`.
3. Mettre à jour le `status` de la réservation à `confirmed`.
4. Stocker le `stripe_payment_intent_id`.
5. Décrémenter `spots_remaining` de `quantity` sur le `schedule_slot`.
6. Si `spots_remaining === 0`, mettre le `status` du créneau à `full`.

**Configuration requise :** Un webhook endpoint doit être créé dans le dashboard Stripe (Developers → Webhooks) pointant vers cette URL, avec l'événement `checkout.session.completed` activé. Le webhook signing secret doit être stocké dans le `.env` Laravel (ex. `STRIPE_WEBHOOK_SECRET`).

---

### 5. GET /api/booking/session/{session_id}

Appelé par la page de succès quand le client revient de Stripe Checkout. Le `session_id` vient du query param `?session_id=` que Stripe ajoute à la `success_url`.

**Auth :** Requis. Valider que la session appartient au client authentifié.

**Réponse 200 :**
```json
{
  "id": "book_7k2m9x",
  "productName": "5 à 8 - Découvrir la voile",
  "format": "Soirée",
  "type": "slot",
  "date": "2026-06-18",
  "startTime": "17:00",
  "endTime": "20:00",
  "lieu": "Yacht Club de Beaconsfield",
  "totalPaid": 85.00,
  "currency": "CAD",
  "stripeReceiptUrl": "https://pay.stripe.com/receipts/...",
  "customerEmail": "jean.tremblay@email.com"
}
```

> Le statut de la réservation peut encore être `pending` quand le client arrive sur cette page — le webhook est asynchrone. Cette route doit retourner les données de la session peu importe le statut de confirmation.

---
