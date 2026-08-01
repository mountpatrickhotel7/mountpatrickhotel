-- Mount Patrick Hotel — core schema, RLS, triggers
-- Phase 1 tables. Phase 2 tables added in later migrations.

create extension if not exists "pgcrypto";
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('guest','receptionist','housekeeper','admin','owner');
create type room_type as enum ('Standard','Deluxe','Executive','Suite','Presidential Suite');
create type room_status as enum ('Available','Reserved','Occupied','Cleaning','Maintenance','Out of Service');
create type booking_status as enum ('Pending','Awaiting Payment','Reserved','Confirmed','Checked-In','Checked-Out','Cancelled','No Show');
create type payment_mode as enum ('pay_now','pay_at_hotel');
create type payment_method as enum ('paystack','cash','momo','card','bank');
create type payment_status as enum ('pending','success','failed');
create type id_type as enum ('Ghana Card','Passport','Driver''s License');
create type booking_source as enum ('online','walk_in');
create type notification_channel as enum ('sms','email');
create type notification_status as enum ('pending','sent','failed');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role user_role not null default 'guest',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  room_type room_type not null,
  capacity int not null default 2,
  description text,
  amenities text[] not null default '{}',
  price_per_night numeric(10,2) not null,
  status room_status not null default 'Available',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table room_images (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  storage_path text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table room_status_history (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  from_status room_status,
  to_status room_status not null,
  changed_by uuid references profiles(id),
  reason text,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  guest_id uuid references profiles(id) on delete set null,
  room_id uuid not null references rooms(id),
  check_in date not null,
  check_out date not null,
  guests_count int not null default 1,
  total_amount numeric(10,2) not null,
  currency text not null default 'GHS',
  payment_mode payment_mode not null default 'pay_now',
  status booking_status not null default 'Pending',
  source booking_source not null default 'online',
  hold_expires_at timestamptz,
  qr_payload text,
  guest_name text,
  guest_phone text,
  guest_email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_dates check (check_out > check_in)
);
create index idx_bookings_room on bookings(room_id);
create index idx_bookings_guest on bookings(guest_id);
create index idx_bookings_status on bookings(status);
create index idx_bookings_dates on bookings(check_in, check_out);

create table booking_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  method payment_method not null,
  amount numeric(10,2) not null,
  status payment_status not null default 'pending',
  provider_reference text unique,
  paid_at timestamptz,
  recorded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_payments_booking on booking_payments(booking_id);

create table guest_identifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  full_name text not null,
  phone text,
  id_type id_type not null,
  id_number text not null,
  id_image_path text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  channel notification_channel not null,
  type text not null,
  recipient text,
  payload jsonb,
  status notification_status not null default 'pending',
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table hotel_settings (
  id int primary key default 1,
  name text not null default 'Mount Patrick Hotel',
  email text,
  phone text,
  address text,
  check_in_time text not null default '14:00',
  check_out_time text not null default '12:00',
  reservation_hold_hours int not null default 24,
  no_show_fee numeric(10,2) not null default 0,
  currency text not null default 'GHS',
  tax_rate numeric(5,2) not null default 0,
  cancellation_policy text not null default 'flexible',
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  period_start date not null,
  period_end date not null,
  format text not null,
  storage_path text,
  generated_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER to avoid RLS recursion on profiles)
-- ---------------------------------------------------------------------------
create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('receptionist','housekeeper','admin','owner')
                   from profiles where id = auth.uid()), false);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin','owner')
                   from profiles where id = auth.uid()), false);
$$;

-- New auth user -> profile row
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.phone,
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent non-admins from changing their own role
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger trg_guard_profile_role
  before update on profiles
  for each row execute function public.guard_profile_role();

-- Generic updated_at bump
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;
create trigger trg_rooms_touch before update on rooms for each row execute function public.touch_updated_at();
create trigger trg_bookings_touch before update on bookings for each row execute function public.touch_updated_at();

-- Record room status transitions automatically
create or replace function public.log_room_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into room_status_history(room_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;
create trigger trg_log_room_status
  after update on rooms
  for each row execute function public.log_room_status();

-- ---------------------------------------------------------------------------
-- Availability: rooms with no blocking booking in [check_in, check_out)
-- ---------------------------------------------------------------------------
create or replace function public.search_available_rooms(
  p_check_in date,
  p_check_out date,
  p_guests int default 1,
  p_room_type room_type default null
)
returns setof rooms language sql stable security definer set search_path = public as $$
  select r.*
  from rooms r
  where r.is_active
    and r.capacity >= p_guests
    and r.status not in ('Maintenance','Out of Service')
    and (p_room_type is null or r.room_type = p_room_type)
    and not exists (
      select 1 from bookings b
      where b.room_id = r.id
        and b.status in ('Reserved','Confirmed','Checked-In')
        and b.check_in < p_check_out
        and b.check_out > p_check_in
    )
  order by r.price_per_night asc;
$$;

-- ---------------------------------------------------------------------------
-- Seed singleton settings
-- ---------------------------------------------------------------------------
insert into hotel_settings (id, name, email, phone, address)
values (1, 'Mount Patrick Hotel', 'reservations@mountpatrickhotel.com',
        '+233 32 000 0000', 'Atonsu Prabon, Kumasi, Ashanti Region, Ghana')
on conflict (id) do nothing;
