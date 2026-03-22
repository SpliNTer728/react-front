# Booking Scheduler — Feature Specification & Context

## Current Status (as of 2026-03-22)

| Area | Status | Notes |
|---|---|---|
| Auth (login, register, logout) | ✅ Frontend done | Backend endpoints live |
| `GET /api/user` | ⚠️ Frontend done, backend missing | Called on every page load — critical gap |
| Scheduler UI (month/week/list views) | ✅ Frontend done | Running on mock data |
| `GET /api/schedule/slots` | ❌ Backend missing | Spec below |
| `POST /api/booking/checkout` | ❌ Backend missing | Spec below |
| `POST /api/webhooks/stripe` | ❌ Backend missing | Backend-only |
| Success page UI | ✅ Frontend done | Running on mock data |
| `GET /api/booking/session/{session_id}` | ❌ Backend missing | Spec below |
| Niveau system | ⏳ Pending school confirmation | See niveau section |

---

## Project Overview

This is a **boating school booking application** for summer 2026 (été 2026). Customers book sailing courses, navigation sessions, and voyages. The app is partially built — authentication (login, logout, signup) is complete. The remaining major feature is a **calendar/scheduler** where customers browse available formules, filtered by their skill level (niveau), and book appointments via Stripe Checkout.

### Tech Stack

- **Frontend:** React (this is your responsibility)
- **Backend:** PHP Laravel (handled by a colleague — you will consume their API)
- **Database:** MySQL (managed by backend colleague)
- **Payments & Data Store:** Stripe (used as the primary source of truth for product and customer data wherever possible)

### Key Architectural Principle

**Decouple data responsibility from the app.** Stripe should be the source of truth for product definitions (formules) and customer profiles. The app's own MySQL database should store only what Stripe cannot: calendar slots, booking state, and the mapping between auth users and Stripe customers.

---

## Data Architecture — Stripe as Primary Store

### What Lives in Stripe

#### Stripe Products (one per formule)

Each formule from the catalog becomes a Stripe Product. All descriptive data is stored in the product's `metadata` field.

Example Stripe Product:

```json
{
  "id": "prod_ABC123",
  "name": "Initiation à la voile",
  "metadata": {
    "type": "formule",
    "format": "Journalier",
    "nb_max_personnes": "4",
    "niveaux": "IN1|IN2",
    "duree_heures": "14",
    "lieu": "Yacht Club de Beaconsfield",
    "calendar_description": "2 jours différents dans le calendrier - journée - 7h (14h total) - à partir de 9h = 2 journées de Navigation - manoeuvres élémentaire - À la carte"
  }
}
```

Important metadata conventions:
- `niveaux` is a pipe-separated string (e.g., `"IN1|IN2"`, `"CADV1|CADV2|CADV3|CADV4|CADV5"`). Parse it by splitting on `|`.
- `type` is either `"slot"` or `"formule"`.
- `nb_max_personnes` is a string (Stripe metadata values are always strings). Parse to integer when needed. May be empty if undefined.
- `duree_heures` may be empty/absent for formules where duration is variable.
- `lieu` may be empty or `"Destination sur mesure"` for custom-destination voyages.

#### Stripe Prices

Each Product has at least one Price attached. The Price holds the dollar amount. Your frontend doesn't need to manage prices directly — the backend creates Checkout Sessions referencing the correct Price.

#### Stripe Customers

Created at signup. The user's auth record in your DB maps to a `stripe_customer_id`. Customer metadata stores the user's current niveau:

```json
{
  "id": "cus_XYZ789",
  "email": "user@example.com",
  "name": "Jean Tremblay",
  "metadata": {
    "niveau": "DEB",
    "auth_user_id": "42"
  }
}
```

### What Lives in Your MySQL Database (Minimal)

Your backend colleague manages these tables. You consume them via API.

#### `users` table (already exists from auth)

| Column | Type | Notes |
|--------|------|-------|
| id | int | Primary key |
| email | string | |
| stripe_customer_id | string | Set at signup when Stripe Customer is created |
| ... | ... | Other auth fields |

#### `schedule_slots` table

This is the calendar layer Stripe cannot provide. Each row is a specific date/time offering of a product.

| Column | Type | Notes |
|--------|------|-------|
| id | int | Primary key |
| stripe_product_id | string | References the Stripe Product (e.g., `prod_ABC123`) |
| date | date | The day of the slot |
| start_time | time | Start time (e.g., `09:00`, `17:00`) |
| end_time | time | End time |
| capacity | int | Total spots |
| spots_remaining | int | Decremented on confirmed booking |
| status | enum | `open`, `full`, `cancelled` |

#### `bookings` table

| Column | Type | Notes |
|--------|------|-------|
| id | int | Primary key |
| schedule_slot_id | int | FK to `schedule_slots` |
| stripe_customer_id | string | The Stripe Customer who booked |
| stripe_checkout_session_id | string | From Stripe Checkout |
| stripe_payment_intent_id | string | From Stripe webhook |
| status | enum | `pending`, `confirmed`, `cancelled`, `refunded` |
| created_at | timestamp | |

### Why This Split Works

- **Stripe owns "what" (products/formules) and "who" (customers).**
- **Your DB owns "when" (schedule slots) and "how many" (capacity/bookings).**
- Product details, pricing, and customer profiles are never duplicated in your DB — they're fetched from Stripe or cached temporarily.
- If a product name, price, or description changes, you update it in Stripe and it propagates everywhere.

---

## Complete Formule Catalog

Below is every formule/slot that must exist as a Stripe Product. This is the source data from the school's summer 2026 schedule.

### Slot-Type Products (single calendar entry, à la carte)

| # | Formule Name | Format | Max Personnes | Niveaux | Durée (h) | Lieu | Calendar Rule |
|---|-------------|--------|---------------|---------|-----------|------|---------------|
| 1 | 5 à 8 - Découvrir la voile | Soirée | 4 | DEB | 4 | Yacht Club de Beaconsfield | 1 slot - soirée - 3h - à partir de 17h |
| 2 | Balade à Voile | Journalier | 4 | IN2 | 7 | Yacht Club de Beaconsfield | 1 slot - journée - 7h - à partir de 9h |
| 3 | Initiation à la Navigation de Nuit | Soirée | 4 | VE4 | 5 | Yacht Club de Beaconsfield | 1 slot - soirée |
| 4 | Journée de Navigation - manoeuvres complexes - À la carte | Journalier | 4 | VE3, VE4 | 7 | Yacht Club de Beaconsfield | 1 slot - journée - 7h - à partir de 9h |
| 5 | Journée de Navigation - manoeuvres élémentaire - À la carte | Journalier | 4 | IN1, IN2 | 7 | Yacht Club de Beaconsfield | 1 slot - journée - 7h - à partir de 9h |
| 6 | Manoeuvre de Port & Pilotage | Soirée | 4 | MP1, MP2, MP3, MP4 | 3 | Yacht Club de Beaconsfield | 1 slot - soirée - 3h - à partir de 17h |
| 7 | Pratique de Navigation - Soirée | Soirée | 4 | IN2, VE2 | 3 | Yacht Club de Beaconsfield | 1 slot - soirée - 3h - à partir de 17h |

### Formule-Type Products (multi-session programs)

| # | Formule Name | Format | Max Personnes | Niveaux | Durée (h) | Lieu | Calendar Rule |
|---|-------------|--------|---------------|---------|-----------|------|---------------|
| 8 | Brevet de Navigation Côtière - Niveau 1 | à définir | — | CINT5 | — | — | SI inscription donc pas dans le calendrier |
| 9 | Brevet de Navigation Côtière Intermédiaire - Niveau 2 | à définir | — | INTER7 | à définir | — | SI inscription donc pas dans le calendrier |
| 10 | Cap sur l'Instructeur IVQ et élémentaire - Voile Canada | Journée et soirée | 4 | INST1, INST2, INST3, INST4, INST5, INST6 | — | Yacht Club de Beaconsfield | Multi-session program |
| 11 | Cap sur le Yachtmaster | Voyage, journée et soirée | — | CYACHT1–CYACHT10 | — | — | Multi-session program |
| 12 | Cap sur l'Avancé | Journée et soirée | — | CADV1, CADV2, CADV3, CADV4, CADV5 | — | Yacht Club de Beaconsfield | Multi-session program |
| 13 | Cap sur l'Intermédiaire | Journée et soirée | 8 | CINT1, CINT2, CINT3, CINT4, CINT5 | 35h pratique (5 jours) | Yacht Club de Beaconsfield | Multi-session program |
| 14 | Carte d'embarcation de plaisance (PCOC) | à définir | 8 | VE4 | — | — | SI inscription |
| 15 | Certificat de secourisme et RCR général ou Maritime | à définir | 8 | EQUIEL4 | — | — | SI inscription |
| 16 | Croisière Avancée | Voyage à Vie à bord | 4 | CADV1–CADV10 | — | Destination sur mesure | Voyage program |
| 17 | Croisière Intermédiaire | Voyage à Vie à bord | 6 | INTER1–INTER7 | — | Destination sur mesure | Voyage program |
| 18 | Croisière élémentaire | Journalier | 4 | EQUIEL1, EQUIEL2, EQUIEL3, EQUIEL4, VE1, VE2, VE3, VE4 | 32 | Yacht Club de Beaconsfield | 4 jours différents dans le calendrier - journée - 7h (14h total) - à partir de 9h. 2 journées de Navigation manoeuvres élémentaire + 2 journées de Navigation manoeuvres complexes |
| 19 | CROM(M) VHF avec endossement ASN | à définir | 4 | VE4 | — | — | SI inscription |
| 20 | Initiation à la voile | Journalier | 4 | IN1, IN2 | 14 | Yacht Club de Beaconsfield | 2 jours différents dans le calendrier - journée - 7h (14h total) - à partir de 9h. 2 journées de Navigation manoeuvres élémentaire |
| 21 | Voyage Accompagné | Voyage à Vie à bord | 10 | DEB2 | — | Destination sur mesure | Voyage program |
| 22 | Voyage en Flotille | Voyage à Vie à bord | — | CADV5 | — | Destination sur mesure | Voyage program |
| 23 | Voyager autrement à la voile | Voyage à Vie à bord | 10 | DEB | — | Destination sur mesure | Voyage program |
| 24 | Yachtmaster | à définir | — | YACHT1 | — | — | SI inscription |

---

## Niveau (Skill Level) System

Niveaux (French for "levels") represent the customer's current skill level. A customer has exactly one active niveau. The niveau determines which formules they can see and book.

**Critical rule: Niveau is a progression scale — a customer at a higher niveau can access all formules for lower niveaux as well.** For example, if a customer is at VE4, they can also book formules designed for VE3, VE2, VE1, and all niveaux below those in the progression.

### All Niveaux by Track

Based on naming patterns, niveaux appear to fall into these tracks (numbers within each track represent progression from lowest to highest):

| Track | Niveaux | Likely Meaning |
|-------|---------|----------------|
| DEB | DEB, DEB2 | Débutant (Beginner) |
| IN | IN1, IN2 | Initiation |
| VE | VE1, VE2, VE3, VE4 | Voile élémentaire |
| EQUIEL | EQUIEL1, EQUIEL2, EQUIEL3, EQUIEL4 | Équipage élémentaire |
| MP | MP1, MP2, MP3, MP4 | Manoeuvre de Port |
| CINT | CINT1, CINT2, CINT3, CINT4, CINT5 | Cap Intermédiaire |
| INTER | INTER1, INTER2, INTER3, INTER4, INTER5, INTER6, INTER7 | Intermédiaire / Croisière |
| CADV | CADV1, CADV2, CADV3, CADV4, CADV5, CADV6, CADV7, CADV8, CADV9, CADV10 | Cap Avancé |
| CYACHT | CYACHT1, CYACHT2, CYACHT3, CYACHT4, CYACHT5, CYACHT6, CYACHT7, CYACHT8, CYACHT9, CYACHT10 | Cap Yachtmaster |
| INST | INST1, INST2, INST3, INST4, INST5, INST6 | Instructeur |
| YACHT | YACHT1 | Yachtmaster |

### ⚠️ TODO: Confirm Niveau Progression Order with the School

**This section MUST be completed before implementing the filtering logic.** Two things need to be confirmed:

#### 1. Cross-track progression order

Is there a global ordering across tracks? For example, does completing VE4 mean you've surpassed everything in DEB and IN? The suspected (but UNCONFIRMED) global order from beginner to advanced might be something like:

```
DEB → DEB2 → IN1 → IN2 → VE1 → VE2 → VE3 → VE4 → EQUIEL1 → ... → EQUIEL4 → MP1 → ... → MP4 → CINT1 → ... → CINT5 → INTER1 → ... → INTER7 → CADV1 → ... → CADV10 → CYACHT1 → ... → CYACHT10 → INST1 → ... → INST6 → YACHT1
```

**OR** some tracks might be parallel/independent (e.g., MP might be a side track that doesn't gate CINT).

#### 2. Are any tracks independent?

For example, can someone be CADV5 but never have done MP (Manoeuvre de Port)? If so, those are parallel tracks and a CADV5 user should NOT see MP formules unless they also have MP certification.

### How to Define the Progression (for the developer implementing this)

Once the school confirms the order, define the progression as a configuration. Here are two approaches depending on the answer:

#### Option A: Single Linear Ladder

If all niveaux form one ordered scale, define it as an ordered array:

```typescript
// FILL IN THE CORRECT ORDER once confirmed by the school
const NIVEAU_ORDER: string[] = [
  "DEB",
  "DEB2",
  "IN1",
  "IN2",
  // ... all niveaux in order from lowest to highest
  "YACHT1",
];

function getUserAccessibleNiveaux(userNiveau: string): string[] {
  const userIndex = NIVEAU_ORDER.indexOf(userNiveau);
  if (userIndex === -1) return [userNiveau];
  // User can access their level and everything below
  return NIVEAU_ORDER.slice(0, userIndex + 1);
}

function canUserAccessFormule(userNiveau: string, formuleNiveaux: string[]): boolean {
  const accessible = getUserAccessibleNiveaux(userNiveau);
  // User can see the formule if ANY of the formule's niveaux is in their accessible set
  return formuleNiveaux.some(n => accessible.includes(n));
}
```

#### Option B: Multiple Tracks with Internal Progression + Cross-Track Rules

If some tracks are independent or parallel:

```typescript
// Define each track's internal order
const TRACKS: Record<string, string[]> = {
  DEB:    ["DEB", "DEB2"],
  IN:     ["IN1", "IN2"],
  VE:     ["VE1", "VE2", "VE3", "VE4"],
  EQUIEL: ["EQUIEL1", "EQUIEL2", "EQUIEL3", "EQUIEL4"],
  MP:     ["MP1", "MP2", "MP3", "MP4"],
  CINT:   ["CINT1", "CINT2", "CINT3", "CINT4", "CINT5"],
  INTER:  ["INTER1", "INTER2", "INTER3", "INTER4", "INTER5", "INTER6", "INTER7"],
  CADV:   ["CADV1", "CADV2", "CADV3", "CADV4", "CADV5", "CADV6", "CADV7", "CADV8", "CADV9", "CADV10"],
  CYACHT: ["CYACHT1", "CYACHT2", "CYACHT3", "CYACHT4", "CYACHT5", "CYACHT6", "CYACHT7", "CYACHT8", "CYACHT9", "CYACHT10"],
  INST:   ["INST1", "INST2", "INST3", "INST4", "INST5", "INST6"],
  YACHT:  ["YACHT1"],
};

// Define which tracks a given track "includes" (i.e., supersedes)
// FILL IN once confirmed by school
const TRACK_HIERARCHY: Record<string, string[]> = {
  DEB:    [],                                          // base level, no prerequisites
  IN:     ["DEB"],                                     // IN includes all of DEB
  VE:     ["DEB", "IN"],                               // VE includes DEB + IN
  EQUIEL: ["DEB", "IN", "VE"],                         // etc. — CONFIRM THIS
  MP:     [],                                          // Maybe independent? CONFIRM
  CINT:   ["DEB", "IN", "VE", "EQUIEL"],               // CONFIRM
  INTER:  ["DEB", "IN", "VE", "EQUIEL", "CINT"],       // CONFIRM
  CADV:   ["DEB", "IN", "VE", "EQUIEL", "CINT", "INTER"], // CONFIRM
  CYACHT: ["DEB", "IN", "VE", "EQUIEL", "CINT", "INTER", "CADV"], // CONFIRM
  INST:   ["DEB", "IN", "VE", "EQUIEL", "CINT", "INTER", "CADV"], // CONFIRM
  YACHT:  ["DEB", "IN", "VE", "EQUIEL", "CINT", "INTER", "CADV", "CYACHT", "INST"], // CONFIRM
};

function getUserAccessibleNiveaux(userNiveau: string): string[] {
  // Find which track this niveau belongs to
  const userTrack = Object.entries(TRACKS).find(([_, levels]) => levels.includes(userNiveau));
  if (!userTrack) return [userNiveau];

  const [trackName, trackLevels] = userTrack;
  const userIndexInTrack = trackLevels.indexOf(userNiveau);

  // Start with all niveaux at or below user's position in their own track
  const accessible = trackLevels.slice(0, userIndexInTrack + 1);

  // Add ALL niveaux from tracks that are superseded
  const supersededTracks = TRACK_HIERARCHY[trackName] || [];
  for (const st of supersededTracks) {
    accessible.push(...(TRACKS[st] || []));
  }

  return accessible;
}

function canUserAccessFormule(userNiveau: string, formuleNiveaux: string[]): boolean {
  const accessible = getUserAccessibleNiveaux(userNiveau);
  return formuleNiveaux.some(n => accessible.includes(n));
}
```

### Where This Logic Runs

**Ideally server-side** (in the Laravel backend). The `GET /api/schedule/slots` endpoint should use the user's niveau to compute their accessible niveaux and only return matching slots. This avoids leaking the full product catalog to the frontend and keeps the filtering logic centralized.

The frontend can also keep a copy of this logic for **instant client-side filtering** (e.g., when an admin toggles between niveaux), but the server should be the source of truth.

### Stripe Metadata Impact

The `niveaux` field on each Stripe Product's metadata still lists the **specific niveaux the formule is designed for** (not the minimum niveau). The progression logic determines which of those niveaux the user has "unlocked." The matching rule is:

> **A user can see a formule if ANY of the formule's listed niveaux is at or below the user's current niveau in the progression.**

### Filtering Rule — Current Behavior (until progression is confirmed)

Until the school confirms the progression order, implement a **fallback: exact match only**. A customer sees only formules whose `niveaux` list explicitly includes their current niveau. This is safe (never shows too much) and can be upgraded to progression-based filtering by simply plugging in the `NIVEAU_ORDER` or `TRACK_HIERARCHY` configuration.

### Examples (will change once progression is confirmed)

With exact-match filtering (current fallback):
- Customer with `niveau = DEB` sees: "5 à 8 - Découvrir la voile", "Voyager autrement à la voile"
- Customer with `niveau = VE4` sees: "Croisière élémentaire", "CROM(M) VHF avec endossement ASN", "Initiation à la Navigation de Nuit", "Journée de Navigation - manoeuvres complexes"
- Customer with `niveau = IN2` sees: "Balade à Voile", "Initiation à la voile", "Journée de Navigation - manoeuvres élémentaire", "Pratique de Navigation - Soirée"

With progression-based filtering (once confirmed, assuming single ladder DEB < IN < VE < ...):
- Customer with `niveau = VE4` would ALSO see everything for DEB, DEB2, IN1, IN2, VE1, VE2, VE3 — meaning they'd additionally see "5 à 8 - Découvrir la voile", "Balade à Voile", "Initiation à la voile", "Pratique de Navigation - Soirée", etc.

The filtering must happen for every view of the scheduler — calendar view, list view, and search results.

---

## Scheduler Component — Functional Requirements

### Views

#### 1. Month View (default)

A monthly calendar grid showing days with available slots. Each day cell displays small badges/pills for the formules available that day. Clicking a day opens a detail panel listing all slots for that day.

- Navigation: previous/next month arrows.
- Day cells show abbreviated formule names color-coded by format.
- Days with no available slots (for this user's niveau) appear empty/muted.
- Clicking a day with slots opens the **Day Detail Panel** on the side.

#### 2. Week View

A 7-column time grid (Sunday–Saturday) with hour rows on the y-axis. Only hours that contain at least one slot are rendered (no empty rows for hours with nothing scheduled). Each slot appears as a small color-coded card in its corresponding day-column and hour-row.

- Navigation: previous/next week arrows.
- Column headers show day name abbreviation + day number.
- Hour labels on the left column (e.g., "09h", "17h").
- Clicking a slot card directly opens the booking confirmation flow.
- Clicking a day column (with slots) opens the Day Detail Panel on the side showing all that day's slots.
- The grid scrolls vertically if there are many active hours.
- Empty state: "Aucune disponibilité cette semaine pour votre niveau."

#### 3. List View

A chronological flat list of all available slots for the current month, sorted by date/time. Each row shows the formule name, date, time, format badge, type badge, location, and spots remaining. Clicking a row opens the booking confirmation flow. Includes its own month navigation header.

#### 4. Day Detail Panel (side panel)

Appears when a day is selected in the calendar view. Shows all slots for that day with:
- Formule name
- Time
- Format badge (color-coded)
- Type badge (slot vs formule)
- Location
- Spots remaining out of max (e.g., "2/4")
- "Réserver" (Book) button on each slot

### Filters

All filters apply across both views and are persistent during the session.

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Niveau | Dropdown (read from user profile) | All niveaux | User's current niveau (auto-set, but overridable for admin) |
| Format | Dropdown | "Tous les formats", "Soirée", "Journalier", "Journée et soirée", "Voyage à Vie à bord", "à définir" | "Tous les formats" |
| Type | Toggle buttons | "Tous", "Slot", "Formule" | "Tous" |

The **niveau filter is the most important**. It is auto-set from the logged-in user's Stripe Customer metadata. Normal users should not be able to change it (it's derived from their profile). Admin users may override it for testing.

### Booking Flow

1. User clicks "Réserver" on a slot.
2. A **confirmation panel** appears showing:
   - Formule name
   - Date and time
   - Location
   - Spots remaining
   - A note: "Vous serez redirigé vers Stripe Checkout pour finaliser le paiement."
3. User clicks "Réserver →" to confirm.
4. Frontend calls `POST /api/booking/checkout` with `{ slot_id, stripe_product_id }`.
5. Backend:
   - Validates the slot still has capacity.
   - Creates a Stripe Checkout Session tied to the Product/Price and Customer.
   - Returns the Checkout Session URL.
6. Frontend redirects the user to the Stripe Checkout URL.
7. After payment:
   - Stripe fires a `checkout.session.completed` webhook to the backend.
   - Backend confirms the booking, decrements `spots_remaining` on the schedule slot.
   - User is redirected to a success page in the app.
8. If payment fails or is abandoned:
   - The spot is not held — no capacity was decremented until webhook confirmation.
   - User returns to the app and can try again.

### Color Coding

Formats are color-coded consistently across the app:

| Format | Color Theme |
|--------|-------------|
| Soirée | Purple tones (e.g., `#a78bfa` text, `#4c1d95` border) |
| Journalier | Blue tones (e.g., `#38bdf8` text, `#0c4a6e` border) |
| Journée et soirée | Green tones (e.g., `#34d399` text, `#065f46` border) |
| Voyage à Vie à bord | Orange tones (e.g., `#fb923c` text, `#7c2d12` border) |
| à définir | Gray tones (e.g., `#a1a1aa` text, `#3f3f46` border) |

Type badges:
| Type | Color |
|------|-------|
| slot | Teal (`#67e8f9` on `#164e63`) |
| formule | Purple (`#c084fc` on `#4a1d6e`) |

### Spots / Capacity Display

- Show as `spotsRemaining/maxSpots` (e.g., "2/4").
- When `spotsRemaining <= 2`, display in red (`#f87171`) to signal urgency.
- When `spotsRemaining > 2`, display in green (`#34d399`).
- When `spotsRemaining === 0`, the slot should not appear (or appear grayed out with "Complet").

### "SI inscription" Products

Some formules have the note "SI inscription donc pas dans le calendrier" — these are registration-based, not calendar-based. They should **not** appear in the calendar/scheduler views. They may need a separate "Inscription" section or page, or be handled differently. For the scheduler component, exclude them.

Products to exclude from the calendar: Brevet de Navigation Côtière (Niveau 1 & 2), Carte d'embarcation de plaisance (PCOC), Certificat de secourisme et RCR, CROM(M) VHF avec endossement ASN, Yachtmaster.

---

## API Contracts (Frontend ↔ Backend)

All authenticated endpoints require `Authorization: Bearer {token}` header. Token is obtained from `POST /api/login` or `POST /api/register`.

---

### GET /api/user `[⚠️ MISSING — CRITICAL]`

Called automatically on every page load by the frontend to restore the logged-in user's session. Without this, `user` is always `null` after a page refresh even if the token is valid.

**Auth:** Required

**Response:**
```json
{
  "id": 42,
  "name": "Jean Tremblay",
  "email": "user@example.com",
  "role": "user",
  "actif": true,
  "niveau": "DEB",
  "stripe_customer_id": "cus_XYZ789",
  "email_verified_at": "2026-01-01T00:00:00Z",
  "created_at": "...",
  "updated_at": "..."
}
```

> `niveau` is read from the user's Stripe Customer metadata and must be included here.

---

### GET /api/schedule/slots `[❌ NOT YET BUILT]`

Fetch available slots for a given month, pre-filtered by the authenticated user's niveau.

**Auth:** Required

**Query params:**
```
month=6&year=2026
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "stripe_product_id": "prod_ABC123",
      "product_name": "Initiation à la voile",
      "type": "formule",
      "format": "Journalier",
      "niveaux": ["IN1", "IN2"],
      "date": "2026-06-15",
      "start_time": "09:00",
      "end_time": "16:00",
      "spots_remaining": 3,
      "max_spots": 4,
      "duree_heures": 14,
      "lieu": "Yacht Club de Beaconsfield"
    }
  ],
  "meta": {
    "month": 6,
    "year": 2026,
    "total_slots": 42,
    "user_niveau": "IN2"
  }
}
```

The backend should:
1. Read the user's niveau from their Stripe Customer metadata (or a cached version).
2. Fetch all Stripe Products whose `metadata.niveaux` includes the user's niveau.
3. Join with `schedule_slots` for the requested month where `status = 'open'` and `spots_remaining > 0`.
4. Return merged data.

> Format/type filtering is applied client-side — the backend returns all matching slots for the month.

---

### POST /api/booking/checkout `[❌ NOT YET BUILT]`

Initiate a booking and get a Stripe Checkout URL.

**Auth:** Required

**Request body:**
```json
{
  "slot_id": 1,
  "stripe_product_id": "prod_ABC123"
}
```

**Response 200:**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_live_...",
  "session_id": "cs_live_..."
}
```

**Response 409** (slot full):
```json
{
  "message": "Cette plage horaire est maintenant complète."
}
```

The backend should:
1. Verify the slot still has capacity (`spots_remaining > 0`). Return 409 if full.
2. Verify the user's niveau matches the product's niveaux.
3. Create a Stripe Checkout Session with:
   - `customer`: the user's `stripe_customer_id`
   - `line_items`: the product's Price
   - `success_url`: `https://yourdomain.com/reserver/succes?session_id={CHECKOUT_SESSION_ID}` — note: `{CHECKOUT_SESSION_ID}` is a Stripe template variable, Stripe replaces it automatically
   - `cancel_url`: `https://yourdomain.com/reserver`
   - `metadata`: `{ slot_id, user_id }`
4. Create a `bookings` row with `status = 'pending'`.
5. Return the Checkout Session URL and session ID.

---

### GET /api/booking/session/{session_id} `[❌ NOT YET BUILT]`

Called by the success page when the user returns from Stripe Checkout. The `session_id` comes from the `?session_id=` query param Stripe appends to the `success_url`.

**Auth:** Required. Must validate that the session belongs to the authenticated user.

**Response 200:**
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

> Note: the booking status may still be `pending` when the user hits this page — the webhook fires asynchronously. This endpoint should return the session data regardless of booking confirmation status.

---

### POST /api/webhooks/stripe `[❌ NOT YET BUILT — backend only]`

Not called by the frontend. Stripe calls this directly after payment.

Handles `checkout.session.completed`:
1. Look up the booking by `stripe_checkout_session_id`.
2. Update booking `status` to `confirmed`.
3. Decrement `spots_remaining` on the schedule slot.
4. If `spots_remaining === 0`, set slot `status` to `full`.

---

## Frontend State Management

### Key State

```typescript
interface SchedulerState {
  // Calendar navigation
  currentMonth: number;       // 0-11
  currentYear: number;
  weekBase: Date;              // Any date in the current week (used for week view navigation)

  // User context
  userNiveau: string;          // From user profile / Stripe Customer

  // Filters
  filterFormat: string;        // "all" | "Soirée" | "Journalier" | etc.
  filterType: string;          // "all" | "slot" | "formule"

  // View
  viewMode: "month" | "week" | "list";

  // Selection
  selectedDay: Date | null;    // Day clicked in calendar
  selectedSlot: Slot | null;   // Slot selected for booking

  // Data
  slots: Slot[];               // Fetched from API for current month
  loading: boolean;
  error: string | null;

  // Booking flow
  checkoutLoading: boolean;
  showConfirmation: boolean;
}

interface Slot {
  id: number;
  stripe_product_id: string;
  product_name: string;
  type: "slot" | "formule";
  format: string;
  niveaux: string[];
  date: string;               // ISO date
  start_time: string;         // HH:mm
  end_time: string;
  spots_remaining: number;
  max_spots: number;
  duree_heures: number | null;
  lieu: string;
}
```

### Data Fetching Strategy

- Fetch slots when the component mounts and when `currentMonth` or `currentYear` changes.
- Apply `filterFormat` and `filterType` client-side (the data set per month is small enough).
- The `niveau` filter is applied server-side (the API only returns slots matching the user's niveau).
- Cache the current month's data; prefetch adjacent months on idle if desired.

---

## Edge Cases to Handle

1. **No slots available for the user's niveau this month.** Show an empty state message: "Aucune formule disponible pour votre niveau ce mois-ci."
2. **Slot becomes full between page load and booking attempt.** The backend validates capacity before creating the Checkout Session. If full, return a 409 error. Frontend should show "Cette plage horaire est maintenant complète" and refresh the slot data.
3. **User abandons Stripe Checkout.** No capacity was decremented (that only happens on webhook confirmation). The pending booking can be cleaned up by a background job or on the next checkout attempt.
4. **Multi-day formules** (e.g., Croisière élémentaire = 4 different days). These may appear as multiple linked slots. The booking may need to reserve all linked slots at once. Coordinate with backend on whether these are single bookings spanning multiple slots or separate bookings.
5. **"Destination sur mesure" products.** These voyages don't have fixed locations. The lieu field will say "Destination sur mesure". The calendar slot may have additional notes.
6. **Products with no duration.** Some formules have no fixed `duree_heures`. Display "Durée variable" or omit the duration field.
7. **Products with no max personnes.** Some formules have no defined capacity. The backend should handle this (perhaps unlimited or a sensible default).

---

## Summary

### Frontend — all components built ✅

1. **SchedulerPage** (`src/Pages/Scheduler.tsx`) ✅ — running on mock data, two TODO comments mark where to swap in real API calls
2. **FilterBar** (`src/Components/Scheduler/FilterBar.tsx`) ✅
3. **MonthView** (`src/Components/Scheduler/MonthView.tsx`) ✅
4. **WeekView** (`src/Components/Scheduler/WeekView.tsx`) ✅
5. **ListView** (`src/Components/Scheduler/ListView.tsx`) ✅
6. **DayDetailPanel** (`src/Components/Scheduler/DayDetailPanel.tsx`) ✅
7. **BookingConfirmation** (`src/Components/Scheduler/BookingConfirmation.tsx`) ✅
8. **SuccessPage** (`src/Pages/BookingSuccess.tsx`) ✅ — running on mock data, one TODO comment marks where to swap in the real API call

### Backend — what's still needed

See the API Contracts section above. Priority order:
1. `GET /api/user` — unblocks the auth session restore bug
2. `GET /api/schedule/slots` — unblocks the scheduler
3. `POST /api/booking/checkout` — unblocks the booking flow
4. `POST /api/webhooks/stripe` — required for booking confirmation
5. `GET /api/booking/session/{session_id}` — unblocks the success page

All product data comes from the API (which sources it from Stripe). All schedule/availability data comes from the API (which sources it from MySQL). The frontend never talks to Stripe directly — everything goes through the Laravel backend.
