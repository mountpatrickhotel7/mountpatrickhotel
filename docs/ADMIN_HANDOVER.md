# Administrator Ownership and Migration Checklist

This project copy contains the complete application source, tests, static images, database migrations,
and documentation. It intentionally contains no credentials, installed dependencies, build output,
Git history, or Vercel project metadata.

## 1. Establish project ownership

- Create a GitHub repository under an account or organization controlled by Mount Patrick Hotel.
- Initialize Git in this folder, make the first commit, and push it to that repository.
- Create a new Vercel project under a hotel-controlled team and import the new GitHub repository.
- Add at least one second trusted administrator to GitHub, Vercel, and Supabase for recovery.
- Enable multi-factor authentication and store recovery codes in the hotel's password manager.

## 2. Decide how the database will be transferred

### Keep the existing Supabase project (recommended when it contains real data)

Obtain Owner or Administrator access to the Supabase organization/project, not only SQL/database
access. Verify that the hotel controls billing, project members, Auth settings, Storage, API keys,
logs, backups, and integrations. Do not re-run the seed file or old migrations against production.

### Move to a new Supabase project

Create the new project under a hotel-controlled organization. Apply all files in
`supabase/migrations/` in order from `0001` through `0007`. Use `supabase/seed.sql` only if sample
room/settings data is wanted. Migrating existing production users requires special handling because
Supabase Auth identities and password/OTP provider state are not equivalent to copying public tables.
Export/import the database, Storage objects, and Auth users with a tested maintenance-window plan.

Before either route, take and verify a restorable backup.

## 3. Required environment variables

Add these to `.env.local` for development and to Vercel for Production, Preview, and Development as
appropriate. Never commit their real values.

| Variable | Where to obtain it | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API settings | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project API settings | Public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project API settings | Yes, server only |
| `NEXT_PUBLIC_SITE_URL` | Local URL or final production domain | No |
| `PAYSTACK_SECRET_KEY` | Hotel-controlled Paystack account | Yes |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Hotel-controlled Paystack account | No |
| `ARKESEL_API_KEY` | Hotel-controlled Arkesel account | Yes |
| `ARKESEL_SENDER_ID` | Approved Arkesel sender ID | No |
| `RESEND_API_KEY` | Hotel-controlled Resend account | Yes |
| `EMAIL_FROM` | Verified sender/domain in Resend | No |
| `QR_SECRET` | Newly generated random value | Yes |
| `CRON_SECRET` | A different newly generated random value | Yes |
| `SEND_SMS_HOOK_SECRET` | Supabase Auth Send SMS Hook configuration | Yes |

Rotate `SUPABASE_SERVICE_ROLE_KEY` and all third-party secrets if the previous developer could have
copied them. Use different values for `QR_SECRET` and `CRON_SECRET`.

## 4. Supabase configuration to verify

- Authentication URL configuration includes the production site URL and
  `<site-url>/auth/callback` as an allowed redirect.
- Phone authentication is enabled if OTP login is required.
- Google OAuth is owned by the hotel and its callback URL points to
  `<supabase-url>/auth/v1/callback`.
- The Send SMS Hook points to `<site-url>/api/auth/sms-hook` and its signing secret matches Vercel.
- Storage has `room-images`, `avatars`, `guest-ids`, and `reports` buckets with the expected policies.
- Row-Level Security is enabled and policies from the migrations exist.
- The no-overlapping-bookings database constraint exists.
- Backups, billing alerts, logs, and project members are controlled by the hotel.

## 5. Create your administrator account

Sign in to the deployed app once so a profile is created. Then, in the Supabase SQL editor, run the
following with your real email address:

```sql
update public.profiles
set role = 'owner'
where email = 'your-email@example.com';
```

Confirm exactly one intended row changed. The `owner` role has owner reporting access and satisfies
the admin/reception access checks. Create separate named accounts for staff; do not share one login.
Available roles are `guest`, `receptionist`, `housekeeper`, `admin`, and `owner`.

## 6. External services and callbacks

- Paystack webhook: `<site-url>/api/payments/paystack/webhook`.
- Supabase Send SMS Hook: `<site-url>/api/auth/sms-hook`.
- Supabase Auth redirect: `<site-url>/auth/callback`.
- Vercel Cron: `/api/cron/keep-alive`, configured by `vercel.json`.
- Verify the Resend sending domain and Arkesel sender ID belong to the hotel.
- Replace test Paystack keys with live keys only after a successful end-to-end test.

## 7. Verification before launch

Run `npm install`, `npm run lint`, `npm test`, and `npm run build`. In a preview deployment, verify:

- public pages and room images;
- guest signup/login, Google login, and phone OTP;
- room availability and prevention of overlapping bookings;
- Pay at Hotel, direct MoMo, and Paystack test payment flows;
- confirmation email/SMS and QR/receipt generation;
- receptionist check-in/check-out and payment recording;
- admin room/settings management and Storage uploads;
- owner dashboards and PDF/Excel/CSV reports;
- role restrictions using a normal guest account;
- Paystack webhook, SMS hook, Auth callback, and scheduled cron logs.

Only point the production domain to the new Vercel project after this checklist passes. Keep the old
deployment available until the new deployment and database backup have been verified.
