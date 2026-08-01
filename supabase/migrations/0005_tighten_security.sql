-- Security hardening.
--
-- 1) Booking writes are staff-only. Guests create/cancel bookings through server
--    actions that run with the service role and validate every field — so a guest
--    can't insert a self-"Confirmed" booking, set an arbitrary amount, or flip
--    their own booking to Confirmed without paying. Guests keep SELECT on their
--    own bookings.

drop policy if exists "bookings_insert_guest_or_staff" on bookings;
drop policy if exists "bookings_update_own_or_staff" on bookings;

create policy "bookings_insert_staff" on bookings
  for insert with check (public.is_staff());
create policy "bookings_update_staff" on bookings
  for update using (public.is_staff());

-- 2) Freeze role + loyalty fields on profile self-updates. Only admins (via their
--    session) or the trusted server (service role) may change them — so a guest
--    can't inflate total_visits / lifetime_spend or escalate their role.
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' and not public.is_admin() then
    new.role := old.role;
    new.total_visits := old.total_visits;
    new.lifetime_spend := old.lifetime_spend;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- 3) Defense in depth: a self-inserted profile row can only be a guest.
drop policy if exists "profiles_insert_self" on profiles;
create policy "profiles_insert_self" on profiles
  for insert with check (id = auth.uid() and role = 'guest');
