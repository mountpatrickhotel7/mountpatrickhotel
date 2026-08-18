-- Restrict broad operational access to receptionists, admins, and owners.
-- Housekeepers remain a valid profile role but no longer satisfy RLS policies
-- for bookings, payments, guest identification, notifications, audits, reports,
-- room status changes, or staff-wide profile access.

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role in ('receptionist', 'admin', 'owner')
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;
