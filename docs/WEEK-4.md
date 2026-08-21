# Week 4 Submission Package

## Sprint 1 summary

Week 4 delivered the first working build sprint for Mount Patrick Hotel: authentication, the primary hotel data model, and a complete booking workflow from the guest interface through the API/server layer into Supabase and back to the confirmation page.

The cross-team code review section is omitted because the repository exchange did not take place.

## Deliverable checklist

| Requirement | Current app evidence |
| --- | --- |
| User authentication | Supabase Auth supports phone OTP and Google sign-in through `src/app/(auth)/login/page.tsx`, `src/app/auth/callback/route.ts`, and the Supabase server/client helpers in `src/lib/supabase/`. Protected routes use `src/lib/auth.ts` and `src/proxy.ts`. |
| Registration and login | New Supabase users receive a `profiles` row through the `handle_new_user` trigger in `supabase/migrations/0001_init.sql`. The login page supports guest sign-in before booking. |
| JWT/session validation | Supabase validates sessions server-side through `supabase.auth.getUser()` in `src/lib/auth.ts`; middleware refreshes the authenticated session in `src/lib/supabase/middleware.ts`. |
| Protected routes | Admin, reception, owner, and account areas call role/session guards before rendering protected pages. Example: `src/app/admin/layout.tsx` requires `admin` or `owner`. |
| Primary data model | The core model is hotel room booking. Main tables include `rooms`, `bookings`, `booking_payments`, `profiles`, and `guest_identifications` in `supabase/migrations/0001_init.sql`. |
| CRUD for core entity | Admin room CRUD is implemented in `src/app/admin/rooms/actions.ts`; booking create/cancel/staff operations are implemented in `src/app/book/actions.ts`, `src/app/account/bookings/actions.ts`, and `src/app/reception/actions.ts`. |
| Complete user-facing workflow | Guest searches/selects a room, signs in, submits booking details, the server rechecks availability, creates a booking, records payment/hold state, sends notifications, and returns to `/book/confirmation/[reference]`. |
| Minimum 5 automated tests | `npm run test` currently passes 14 test files and 62 tests. |

## Live demo script

1. Open the public site and show the home/rooms pages.
2. Select a room and begin a booking.
3. Sign in as a guest.
4. Complete the booking form with dates, guest details, and either Pay at Hotel or Mobile Money Direct.
5. Show the booking confirmation page with the generated booking reference.
6. Open the account booking history and show the new booking listed.
7. Sign in as a receptionist/admin and open the reception dashboard.
8. Look up the booking by reference and demonstrate check-in or payment recording.
9. Open Admin Rooms and show room create/update/status management.
10. Run `npm run test` and screenshot the passing test output.

## Test report

Command used:

```bash
npm run test
```

Latest local result:

```text
Test Files  14 passed (14)
Tests       62 passed (62)
```

Use a screenshot of this command output as the Week 4 test report.

## Sprint 1 completed issues

| Issue | Status | Evidence |
| --- | --- | --- |
| Build public hotel browsing pages | Complete | `src/app/(public)/`, room cards, room detail pages, gallery, contact, FAQ |
| Add guest authentication | Complete | Supabase Auth login page, callback route, profile creation trigger |
| Protect account/staff/admin routes | Complete | `requireRole`, Supabase session middleware, dashboard layouts |
| Model rooms and bookings | Complete | Supabase migrations for rooms, bookings, payments, guest IDs, notifications, audit logs |
| Implement room CRUD | Complete | Admin room actions and room manager UI |
| Implement guest booking workflow | Complete | Booking form, server action, confirmation page, booking history |
| Add payment/hold handling | Complete | Paystack, Mobile Money Direct, Pay at Hotel, pending payment records |
| Add reception workflow | Complete | Lookup, check-in, check-out, no-show, hold release, walk-in booking |
| Add automated tests | Complete | Vitest suite with 62 passing tests |
| Document API and architecture | Complete | `docs/API_SCHEMA.md`, `docs/ERD.md`, `docs/ARCHITECTURE_DECISION_RECORD.md` |

## Sprint 2 backlog

| Backlog item | Priority |
| --- | --- |
| Add public REST route handlers for room availability and booking creation where server actions currently provide the behavior | High |
| Add end-to-end browser tests for the guest booking workflow | High |
| Add screenshots or exported evidence for the project board and test report | High |
| Improve staff booking search filters and daily operations views | Medium |
| Add automated hold-expiry reminders and release jobs | Medium |
| Add refund/cancellation payment handling | Medium |
| Add housekeeping and maintenance task modules | Medium |
| Add customer feedback/ratings after checkout | Low |

## Notes for submission

- Demo working software, not slides.
- The code review report is intentionally excluded because no cross-team review happened.
- The project board requirement can be satisfied by copying the Sprint 1 completed issues and Sprint 2 backlog above into GitHub Projects, Trello, Notion, or the class project-board format.
