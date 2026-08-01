# Mount Patrick Hotel — Setup

## 1. Install
```bash
npm install
```

## 2. Supabase
1. Create a project at https://supabase.com.
2. Copy values into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (same page, keep secret — server only)
3. Apply the schema. Either via the SQL editor (paste every migration in filename order) or the CLI:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-ref>
   npx supabase db push          # runs supabase/migrations/*
   npx supabase db execute --file supabase/seed.sql   # sample rooms
   ```
   Migration order: `0001_init.sql` through `0007_momo_direct.sql`. Run `seed.sql` only for a new
   empty database; do not run it blindly against the existing production database.
4. **Auth providers** (Dashboard → Authentication → Providers):
   - Enable **Phone** sign-in. Set the SMS provider to a custom **Send SMS Hook** pointing at
     `${NEXT_PUBLIC_SITE_URL}/api/auth/sms-hook` (uses Arkesel), or use Supabase's built-in provider.
   - Enable **Google** OAuth (add client id/secret). Redirect URL: `${SUPABASE_URL}/auth/v1/callback`.
5. **Promote an owner** after first sign-in:
   ```sql
   update profiles set role = 'owner' where email = 'you@example.com';
   ```

## 3. Paystack
- Create keys at https://dashboard.paystack.com. Put the **secret** in `PAYSTACK_SECRET_KEY` and the
  **public** in `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
- Add a webhook: `${NEXT_PUBLIC_SITE_URL}/api/payments/paystack/webhook`.
- Currency is **GHS**.

## 4. Arkesel (SMS / OTP)
- Put `ARKESEL_API_KEY` and `ARKESEL_SENDER_ID` in `.env.local`.

## 5. Email
- Optional now: leave `RESEND_API_KEY` blank to log emails to the console (mock). Set it later to send
  real transactional email via Resend.

## 6. Run
```bash
npm run dev
```

## 7. Scheduled keep-alive
- Generate a separate random `CRON_SECRET` and add it to local and Vercel environments.
- `vercel.json` calls `/api/cron/keep-alive` daily. Vercel supplies the secret as a bearer token.
- Confirm the cron exists after the first production deployment.

## 8. Ownership transfer
See [ADMIN_HANDOVER.md](ADMIN_HANDOVER.md) before deploying. It lists every account, secret,
redirect URL, webhook, database check, and administrator role required for a clean handover.

## Roles
`guest` · `receptionist` · `housekeeper` · `admin` · `owner`. Protected areas: `/account` (guest),
`/reception`, `/admin`, `/owner`. Access is enforced by middleware + RLS.
