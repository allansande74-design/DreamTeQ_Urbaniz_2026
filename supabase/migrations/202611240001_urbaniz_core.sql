-- Urbaniz requires Supabase Auth + PostgreSQL. Apply with Supabase CLI after reviewing for your environment.
create extension if not exists pgcrypto;

create table if not exists public.parking_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 120),
  address text not null check (length(address) between 2 and 240),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  hourly_rate numeric(8,2) not null check (hourly_rate >= 0),
  capacity integer not null check (capacity >= 0),
  type text not null check (type in ('Garage','Lot','Street')),
  features text[] not null default '{}',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.parking_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spot_id uuid not null references public.parking_spots(id),
  idempotency_key uuid not null,
  status text not null default 'held' check (status in ('held','cancelled','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes',
  unique (user_id, idempotency_key)
);
create index if not exists parking_reservations_active_spot_idx on public.parking_reservations(spot_id, expires_at) where status = 'held';

alter table public.parking_spots enable row level security;
alter table public.parking_reservations enable row level security;
revoke all on public.parking_spots from anon, authenticated;
revoke all on public.parking_reservations from anon, authenticated;
grant select on public.parking_spots to service_role;

create or replace view public.parking_spot_availability with (security_invoker = true) as
select s.id, s.name, s.address, s.latitude, s.longitude, s.hourly_rate,
  greatest(s.capacity - count(r.id)::integer, 0) as available,
  s.capacity, s.type, s.features, s.is_active, s.updated_at
from public.parking_spots s
left join public.parking_reservations r on r.spot_id = s.id and r.status = 'held' and r.expires_at > now()
group by s.id;
revoke all on public.parking_spot_availability from anon, authenticated;
grant select on public.parking_spot_availability to service_role;

create or replace function public.reserve_parking_spot(p_spot_id uuid, p_idempotency_key uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_reservation public.parking_reservations%rowtype;
  v_capacity integer;
  v_active integer;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '28000'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_idempotency_key::text, 0));
  select * into v_reservation from public.parking_reservations where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then return jsonb_build_object('code', v_reservation.id, 'expires_at', v_reservation.expires_at, 'status', v_reservation.status); end if;
  select capacity into v_capacity from public.parking_spots where id = p_spot_id and is_active = true for update;
  if not found then raise exception 'parking location unavailable' using errcode = 'P0002'; end if;
  select count(*) into v_active from public.parking_reservations where spot_id = p_spot_id and status = 'held' and expires_at > now();
  if v_active >= v_capacity then raise exception 'no parking spaces available' using errcode = 'P0001'; end if;
  insert into public.parking_reservations(user_id, spot_id, idempotency_key)
  values (v_user_id, p_spot_id, p_idempotency_key) returning * into v_reservation;
  return jsonb_build_object('code', v_reservation.id, 'expires_at', v_reservation.expires_at, 'status', v_reservation.status);
end;
$$;
revoke all on function public.reserve_parking_spot(uuid, uuid) from public, anon;
grant execute on function public.reserve_parking_spot(uuid, uuid) to authenticated;
