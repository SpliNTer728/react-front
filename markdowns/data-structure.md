# Data Structure — SWEN Booking App

## MySQL Tables

### `users` (exists — from auth)
| Column | Type | Notes |
|--------|------|-------|
| id | int | Primary key |
| name | string | |
| email | string | |
| password | string | Hashed |
| stripe_customer_id | string | Set at registration — links to Stripe Customer |
| email_verified_at | timestamp | Nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### `personal_access_tokens` (exists — managed by Laravel Sanctum)
| Column | Type | Notes |
|--------|------|-------|
| id | int | Primary key — first half of token (e.g. `29|...`) |
| tokenable_type | string | Polymorphic — usually `App\Models\User` |
| tokenable_id | int | FK to users.id |
| name | string | Token label |
| token | string | SHA-256 hash of the secret half |
| abilities | json | Nullable |
| last_used_at | timestamp | Nullable |
| expires_at | timestamp | Nullable |

---

### `schedule_slots` (✅ migration exists)
| Column | Type | Notes |
|--------|------|-------|
| id | int | Primary key |
| stripe_product_id | string | FK to Stripe Product (e.g. `prod_ABC123`) |
| date | date | Day of the slot |
| start_time | dateTime | Full timestamp — extract time part for display |
| end_time | dateTime | Full timestamp — extract time part for display |
| capacity | int | Total spots |
| spots_remaining | int | Decremented by webhook on confirmed booking |
| status | enum | `open`, `full`, `cancelled` — default `open` |
| women_sailing | boolean | Women-only slot — display badge on slot card, default `false` |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### `bookings` (✅ migration exists)
| Column | Type | Notes |
|--------|------|-------|
| id | int | Primary key |
| schedule_slot_id | int | FK to `schedule_slots.id` (constrained) |
| stripe_customer_id | string | FK to Stripe Customer |
| stripe_checkout_session_id | string | From Stripe Checkout |
| stripe_payment_intent_id | ~~integer~~ **should be string** | ⚠️ Bug in migration — Stripe PI IDs are strings like `pi_3Abc...` |
| quantity | int | Total places réservées (client + accompagnants) — default `1` |
| status | enum | `pending`, `confirmed`, `cancelled`, `refunded` — default `pending` |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## Stripe Objects

### Product (one per formule — 24 total, created manually in dashboard)
```json
{
  "id": "prod_ABC123",
  "name": "Initiation à la voile",
  "metadata": {
    "type": "formule",
    "format": "Journalier",
    "niveaux": "IN1|IN2",
    "nb_max_personnes": "4",
    "duree_heures": "14",
    "lieu": "Yacht Club de Beaconsfield"
  }
}
```
- `niveaux` is pipe-separated — parse by splitting on `|`
- `type` is either `"slot"` or `"formule"`
- All metadata values are strings — parse to int/array as needed

---

### Price (attached to each Product — holds the dollar amount)
```json
{
  "id": "price_XYZ",
  "product": "prod_ABC123",
  "unit_amount": 18500,
  "currency": "cad"
}
```
- `unit_amount` is in cents (18500 = $185.00 CAD)
- Backend references this when creating a Checkout Session

---

### Customer (one per registered user — created at signup)
```json
{
  "id": "cus_XYZ789",
  "email": "jean@example.com",
  "name": "Jean Tremblay",
  "metadata": {
    "niveau": "IN2",
    "auth_user_id": "42"
  }
}
```
- `niveau` is the user's current skill level — set manually in Stripe dashboard for now
- `auth_user_id` links back to `users.id`
- Stored in `users.stripe_customer_id`

---

### Checkout Session (created per booking attempt)
```json
{
  "id": "cs_live_...",
  "customer": "cus_XYZ789",
  "payment_status": "paid",
  "metadata": {
    "slot_id": "7",
    "user_id": "42"
  }
}
```

---

## How Everything Connects

```
users.id ──────────────────────────► stripe_customer.metadata.auth_user_id
users.stripe_customer_id ──────────► stripe_customer.id
                                              │
                                         .metadata.niveau
                                              │
                                     determines which stripe
                                     products user can access
                                              │
                                    stripe_product.id
                                              │
schedule_slots.stripe_product_id ────────────┘
       │
       │ .id
       ▼
bookings.schedule_slot_id
bookings.stripe_customer_id ───────► stripe_customer.id
bookings.stripe_checkout_session_id ► stripe checkout_session.id
                                              │
                                    checkout_session → payment_intent.id
                                              │
                                    bookings.stripe_payment_intent_id
```

---

## What's Not Built Yet

| Item | Status | Owner |
|------|--------|-------|
| `users.stripe_customer_id` set at registration | ❌ | Backend |
| `stripe_customer.metadata.niveau` set per user | ❌ | Manual (Stripe dashboard) |
| 24 Stripe Products created | ❌ | Manual (Stripe dashboard) |
| `schedule_slots` table + migration | ❌ | Backend |
| `bookings` table + migration | ❌ | Backend |
| `GET /api/user` | ❌ | Backend |
| `GET /api/schedule/slots` | ❌ | Backend |
| `POST /api/booking/checkout` | ❌ | Backend |
| `POST /api/webhooks/stripe` | ❌ | Backend |
| `GET /api/booking/session/{id}` | ❌ | Backend |
