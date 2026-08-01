-- Remove loyalty tracking (total_visits / lifetime_spend). The guard trigger goes
-- back to protecting only the role column (still allowing admins and the trusted
-- service role to change it).

create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') <> 'service_role'
     and not public.is_admin() then
    new.role := old.role;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

alter table profiles drop column if exists total_visits;
alter table profiles drop column if exists lifetime_spend;
