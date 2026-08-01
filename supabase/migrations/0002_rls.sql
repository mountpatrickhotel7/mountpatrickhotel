-- Mount Patrick Hotel — Row Level Security policies

alter table profiles enable row level security;
alter table rooms enable row level security;
alter table room_images enable row level security;
alter table room_status_history enable row level security;
alter table bookings enable row level security;
alter table booking_payments enable row level security;
alter table guest_identifications enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table hotel_settings enable row level security;
alter table reports enable row level security;

-- profiles -------------------------------------------------------------------
create policy "profiles_select_own_or_staff" on profiles
  for select using (id = auth.uid() or public.is_staff());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid() or public.is_admin());
create policy "profiles_insert_self" on profiles
  for insert with check (id = auth.uid());

-- rooms ----------------------------------------------------------------------
create policy "rooms_select_public" on rooms
  for select using (is_active or public.is_staff());
create policy "rooms_admin_insert" on rooms
  for insert with check (public.is_admin());
create policy "rooms_admin_update" on rooms
  for update using (public.is_admin());
create policy "rooms_admin_delete" on rooms
  for delete using (public.is_admin());
-- receptionists may change room status (e.g. during check-in/out)
create policy "rooms_staff_update_status" on rooms
  for update using (public.is_staff());

-- room_images ----------------------------------------------------------------
create policy "room_images_select_public" on room_images
  for select using (true);
create policy "room_images_admin_write" on room_images
  for all using (public.is_admin()) with check (public.is_admin());

-- room_status_history --------------------------------------------------------
create policy "rsh_staff_select" on room_status_history
  for select using (public.is_staff());
create policy "rsh_staff_insert" on room_status_history
  for insert with check (public.is_staff());

-- bookings -------------------------------------------------------------------
create policy "bookings_select_own_or_staff" on bookings
  for select using (guest_id = auth.uid() or public.is_staff());
create policy "bookings_insert_guest_or_staff" on bookings
  for insert with check (guest_id = auth.uid() or public.is_staff());
create policy "bookings_update_own_or_staff" on bookings
  for update using (guest_id = auth.uid() or public.is_staff());

-- booking_payments -----------------------------------------------------------
create policy "payments_select_own_or_staff" on booking_payments
  for select using (
    public.is_staff()
    or exists (select 1 from bookings b where b.id = booking_id and b.guest_id = auth.uid())
  );
create policy "payments_staff_write" on booking_payments
  for all using (public.is_staff()) with check (public.is_staff());

-- guest_identifications ------------------------------------------------------
create policy "guest_ids_staff_all" on guest_identifications
  for all using (public.is_staff()) with check (public.is_staff());

-- notifications --------------------------------------------------------------
create policy "notifications_select_own_or_staff" on notifications
  for select using (user_id = auth.uid() or public.is_staff());

-- audit_logs -----------------------------------------------------------------
create policy "audit_admin_select" on audit_logs
  for select using (public.is_admin());
create policy "audit_staff_insert" on audit_logs
  for insert with check (public.is_staff());

-- hotel_settings -------------------------------------------------------------
create policy "settings_select_public" on hotel_settings
  for select using (true);
create policy "settings_admin_update" on hotel_settings
  for update using (public.is_admin());

-- reports --------------------------------------------------------------------
create policy "reports_admin_all" on reports
  for all using (public.is_admin()) with check (public.is_admin());
