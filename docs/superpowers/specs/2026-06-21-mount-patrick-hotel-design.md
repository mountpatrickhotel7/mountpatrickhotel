# Mount Patrick Hotel — System Design Spec

**Date:** 2026-06-21
**Status:** Approved (pending final user review of this document)

## 1. Overview

A comprehensive hotel booking and management system for **Mount Patrick Hotel**, inspired by
booking.com for the guest-facing booking flow and the "quiet luxury" stitch reference
(`docs/stitch_swiftstay_hotel_management_system`) for visual direction. The system covers the
public marketing site, guest booking portal, reception operations, room management, owner
analytics, and reporting.

The requirements in `docs/req1.md`, `docs/req2.md`, and `docs/req3.md` are consolidated here.
Where `req1.md` (MongoDB/Express) conflicts with the `req3.md` "Recommended Final Stack", **req3
and the user's explicit instructions win** (Supabase + Next.js). Group Booking (FR-23) and
online **partial deposit** (FR-21C) are **out of scope** per user decision.

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui, Lucide icons (no Material icons) |
| Database | Supabase Postgres with Row-Level Security |
| Auth | Supabase Auth — Phone OTP (Arkesel SMS hook) + Google OAuth |
| Storage | Supabase Storage (room images, ID images) |
| Online payments | Paystack (cards, MoMo, bank), currency **GHS** |
| SMS | Arkesel (OTP + transactional notifications) — live |
| Email | Interface-based; mocked/logged now, Resend-swappable later |
| Maps | Static map embed placeholder (no Google Maps key yet) |
| Reports | Server-side PDF + CSV + Excel export |
| Hosting | Vercel |

**Access note:** the Supabase MCP plugin is registered but currently needs auth; the CLI works via
`npx supabase` (v2.107.0) but is not logged in. Before implementation, resolve via
`npx supabase login` or a project ref + access token. Design work does not require live access.

## 3. Roles & Authorization

Roles: **guest, receptionist, housekeeper, admin, owner**. Stored on `profiles.role`.

- **Guest:** own profile, own bookings, public room data.
- **Receptionist:** walk-ins, check-in/out, room transfer, payments, ID capture, room status.
- **Housekeeper:** (Phase 2) assigned housekeeping tasks, room cleaning status.
- **Admin:** room CRUD, customer management, reservations, settings, most operations.
- **Owner:** everything admin can do + analytics dashboards + report generation.

Authorization enforced by **RLS policies** keyed to `auth.uid()` and role. Privileged operations
(role changes, service-level writes) run only in server-only code using the service role key.
Every sensitive mutation writes an `audit_logs` row.

## 4. Design System

"Quiet luxury" adapted to the user's beige + dark/light requirement. booking.com-style search and
booking ergonomics; stitch reference for tone (not its Material icons).

- **Light mode:** warm beige canvas (`#FAF6EE` background, `#F2EBDD` dim sections), soft cream/white
  cards, **Midnight Navy** (`#0F172A`) primary, **Champagne Gold** (`#B49157`) accent.
- **Dark mode:** deep espresso/charcoal (`#1A1714`/`#211C18`), gold accent, off-white text.
- **Theme toggle** persisted (localStorage + class strategy), respects system preference initially.
- **Type:** Playfair Display (headings), Inter (UI/body). 8px spacing grid.
- **Surfaces:** soft ambient shadows, 16px radius on cards, 8px on buttons/inputs. Subtle image
  zoom-on-hover for room cards. Glassmorphic sticky nav.
- **Status chips:** pill-shaped, low-opacity tinted backgrounds, high-contrast text.

## 5. Phase 1 — Core (end-to-end working app)

### 5.1 Public Website (Module 1)
Home (hero + concierge search bar), About, Room Listings, Room Detail, Gallery, Contact, FAQ,
static map + nearby attractions section. Responsive (mobile-first).

### 5.2 Guest Portal (Module 2)
- Auth: **Phone OTP** (primary, via Arkesel) + **Google OAuth**. Profile management. Session mgmt.
- Room search by **dates, guests, room type** with **real-time availability** (no overlapping
  confirmed/occupied booking for the date range).
- Create reservation → choose **Pay Now (Paystack)** or **Pay at Hotel**.
- Booking history + cancellation (policy-aware; full Phase-1 cancel, refund logic is Phase 2).

### 5.3 Payments (FR-21 A, B; FR-32)
- **Pay Now:** Paystack checkout → webhook verifies → booking `Confirmed`, payment recorded.
  Flow: `Pending → Paid → Confirmed`.
- **Pay at Hotel:** booking `Reserved`; paid at reception. Flow: `Reserved → Checked-In → Paid`.
- **Multi-payment at reception:** `booking_payments` ledger records split cash/MoMo/card toward the
  full amount. **No online partial deposit, no balance-due online flow.**
- Reservation hold/expiry (FR-24): unpaid Pay-at-Hotel reservations expire after a configurable
  window; room returns to inventory. (Expiry job is Phase 2; the field + manual expiry are Phase 1.)

### 5.4 QR Booking (Module 3)
QR generated after reservation, encoding booking reference + guest + room + dates. Reception scans
to verify reservation/payment and complete check-in.

### 5.5 Reception (Module 4)
Walk-in guest registration (name, phone, ID type/number, optional ID image upload, room assignment,
payment, receipt). QR/manual check-in and check-out (record additional charges, generate invoice,
mark room for cleaning → available). Room transfer/upgrade with rate recalculation + audit trail.

### 5.6 Room Management (Modules 5 & 6)
Room CRUD (number, type, capacity, description, amenities, price/night, images → Storage). Room
types: Standard, Deluxe, Executive, Suite, Presidential Suite. Statuses: Available, Reserved,
Occupied, Cleaning, Maintenance, Out of Service, with `room_status_history` tracking transitions.

### 5.7 Owner Dashboard (Module 12, core)
Revenue (daily/weekly/monthly/annual), bookings (total/pending/confirmed/cancelled/no-show),
occupancy (rate, available/reserved/occupied/cleaning), top-performing rooms. Charts via a
lightweight chart lib.

### 5.8 Reporting (Module 11)
Daily/weekly/monthly reports: date, room number, guest name, check-in/out, amount paid, status;
summary (total bookings, occupancy rate, revenue). Export **PDF, CSV, Excel**.

### 5.9 Security & Audit (Module 13)
Supabase Auth, RLS, secure cookies, rate limiting on auth endpoints, audit logging for login,
booking/room/check-in/check-out changes and report generation.

## 6. Phase 2 — Backlog (after Phase 1 review)

Housekeeping tasks (Module 8), maintenance requests (Module 9), room calendar view (Module 7),
no-show automation (FR-25), refund management (FR-27), room upgrade/downgrade nuance (FR-28), stay
extension (FR-29), early check-in / late check-out fees (FR-30), discounts/promos (FR-34), loyalty
& returning-guest tracking (FR-35), feedback/ratings (FR-41), revenue forecasting (FR-42), internal
messaging (FR-40), lost & found (FR-38), emergency room blocking (FR-37), multi-branch (FR-36),
corporate invoicing (FR-21D), reservation auto-expiry job + check-in/out reminder jobs, email via
Resend, live Google Maps, backup/DR runbook (FR-43), offline reception mode (FR-44).

## 7. Data Model (core tables)

Designed once to serve both phases; Phase-2-only tables are created as stubs when their feature lands.

- **profiles** — `id (auth.users fk)`, `full_name`, `phone`, `email`, `role`, `avatar_url`,
  loyalty fields (`total_visits`, `lifetime_spend`), timestamps.
- **rooms** — `id`, `room_number (unique)`, `room_type`, `capacity`, `description`, `amenities[]`,
  `price_per_night`, `status`, `is_active`, timestamps.
- **room_images** — `id`, `room_id`, `storage_path`, `is_primary`, `sort_order`.
- **room_status_history** — `id`, `room_id`, `from_status`, `to_status`, `changed_by`, `reason`,
  `created_at`.
- **bookings** — `id`, `reference (unique)`, `guest_id`, `room_id`, `check_in`, `check_out`,
  `guests_count`, `total_amount`, `currency (GHS)`, `payment_mode (pay_now|pay_at_hotel)`,
  `status (Pending|Awaiting Payment|Reserved|Confirmed|Checked-In|Checked-Out|Cancelled|No Show)`,
  `source (online|walk_in)`, `hold_expires_at`, `qr_payload`, timestamps.
- **booking_payments** — `id`, `booking_id`, `method (paystack|cash|momo|card|bank)`, `amount`,
  `status (pending|success|failed)`, `provider_reference`, `paid_at`, `recorded_by`.
- **guests** (walk-in / ID capture) — `id`, `booking_id`, `full_name`, `phone`, `id_type`,
  `id_number`, `id_image_path`, `created_by`.
- **notifications** — `id`, `user_id`, `channel (sms|email)`, `type`, `payload`, `status`,
  `sent_at`.
- **audit_logs** — `id`, `actor_id`, `action`, `entity`, `entity_id`, `metadata (jsonb)`,
  `created_at`.
- **hotel_settings** — singleton: hotel name/contact, check-in/out times, reservation hold window,
  cancellation policy config, no-show fee, currency, tax rate.
- **reports** — `id`, `type (daily|weekly|monthly)`, `period_start`, `period_end`, `format`,
  `storage_path`, `generated_by`, `created_at`.

**Phase-2 stub tables (created when feature lands):** `housekeeping_tasks`, `maintenance_requests`,
`discounts`, `feedback`, `refunds`, `branches`.

## 8. Key Flows

1. **Online booking (Pay Now):** search → select room → reservation `Pending` → Paystack checkout →
   webhook verify → `booking_payments.success` → booking `Confirmed` → SMS + (mock) email + QR.
2. **Online booking (Pay at Hotel):** search → select room → `Reserved` + `hold_expires_at` → SMS +
   QR → reception check-in → payment recorded → `Checked-In`.
3. **Walk-in:** reception registers guest + ID → assign available room → record payment → receipt →
   room `Occupied`.
4. **Check-out:** reception records extra charges → invoice → room → `Cleaning` → `Available`.
5. **Report generation:** owner selects period/format → server aggregates → file to Storage +
   download → `audit_logs` entry.

## 9. Testing Strategy

- Unit tests for pure logic: availability/overlap checks, pricing/total calculation, status
  transition rules, report aggregation, QR payload encode/decode.
- Integration tests for server actions / route handlers against a Supabase test schema
  (booking creation, Paystack webhook verification, payment ledger).
- RLS policy tests: each role can only read/write what it should.
- Component tests for the search bar, booking form, and theme toggle.

## 10. Error Handling

- Payment: idempotent Paystack webhook (dedupe on `provider_reference`); failed/abandoned checkout
  leaves booking `Awaiting Payment`, room not held beyond expiry.
- Availability race: booking insert guarded by a DB-level overlap check (exclusion constraint or
  transactional re-check) so two guests can't confirm the same room/date.
- External services (Arkesel/email): failures are logged to `notifications.status='failed'` and
  retried/surfaced, never block the core booking transaction.
- All user-facing errors are friendly; internal details go to logs/audit.

## 11. Out of Scope

Group Booking (FR-23), online partial deposit (FR-21C), and all Phase-2 items above until Phase 1
is reviewed and approved.
