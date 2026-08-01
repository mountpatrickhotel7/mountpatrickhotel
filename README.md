# Mount Patrick Hotel

A comprehensive hotel booking & management system for **Mount Patrick Hotel** — a booking.com-style
guest experience wrapped in a "quiet luxury" design, with full back-office operations.

Built with **Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase · Paystack ·
Arkesel**. Warm beige theme with a navy/champagne-gold accent palette and a light/dark toggle.

## Features (Phase 1)

**Public site** — home with concierge search, rooms with real-time availability, room detail,
about, gallery, contact (static map + nearby attractions), FAQ.

**Guest portal** — phone-OTP + Google sign-in, profile, booking history, cancellation, QR code &
PDF receipt per booking.

**Booking & payments** — date/guest/type search, **Pay Now (Paystack, GHS)** or **Pay at Hotel**,
idempotent webhook + callback confirmation, SMS (Arkesel) + email (mock/Resend) confirmations,
booking QR.

**Reception** — today's arrivals/departures/in-house, QR/reference check-in, walk-in registration
with ID capture, check-out, room transfer/upgrade (rate recalculation), no-show, payment recording.

**Admin** — room CRUD with image upload to Supabase Storage, room statuses + history, reservations
management, customers, hotel settings.

**Owner** — revenue/occupancy/booking analytics with charts, top rooms, forecast, and **daily /
weekly / monthly reports as PDF, Excel, and CSV**.

**Security** — Supabase Auth, role-based access (guest/receptionist/housekeeper/admin/owner),
Row-Level Security, audit logging, middleware route protection.

## Getting started

See **[docs/SETUP.md](docs/SETUP.md)** for full setup (Supabase, Paystack, Arkesel).

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Apply every file in `supabase/migrations/` in filename order (`0001` through `0007`). Run
`supabase/seed.sql` only when setting up a new empty database that needs the sample hotel data.

## Structure

```
src/
  app/
    (public)/        marketing site + rooms
    (auth)/          login (phone OTP + Google)
    account/         guest portal
    book/            checkout + confirmation
    reception/       front-desk operations
    admin/           room/customer/settings management
    owner/           analytics + reports
    api/             paystack, reports, receipts, sms hook, auth callback
  components/        ui (shadcn), domain components
  lib/
    supabase/        client/server/admin/middleware + types
    services/        paystack, sms, email, notify, audit, pdf, reports
    analytics.ts, queries.ts, auth.ts, ...
supabase/migrations/ schema, RLS, storage
docs/                requirements, design spec, setup
```

## Out of scope (Phase 2 backlog)

Housekeeping & maintenance modules, room calendar view, refunds, discounts/loyalty automation,
feedback/ratings, internal messaging, lost & found, multi-branch, corporate invoicing, automated
hold-expiry/reminder jobs, live Google Maps. Group booking and online partial deposit are excluded
per project scope. See `docs/superpowers/specs/2026-06-21-mount-patrick-hotel-design.md`.
