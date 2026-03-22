create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.guests (
  id text primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.guests add column if not exists first_name text;
alter table public.guests add column if not exists last_name text;

create unique index if not exists guests_event_name_unique_idx
on public.guests(event_id, first_name, last_name)
where first_name is not null and last_name is not null;

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id text not null references public.guests(id) on delete cascade,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists photos_event_id_idx on public.photos(event_id);
create index if not exists photos_guest_id_idx on public.photos(guest_id);
create index if not exists guests_event_id_idx on public.guests(event_id);

alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.photos enable row level security;

drop policy if exists "No direct access to events" on public.events;
drop policy if exists "No direct access to guests" on public.guests;
drop policy if exists "No direct access to photos" on public.photos;

create policy "No direct access to events"
on public.events
for all
using (false)
with check (false);

create policy "No direct access to guests"
on public.guests
for all
using (false)
with check (false);

create policy "No direct access to photos"
on public.photos
for all
using (false)
with check (false);

insert into public.events (slug, name)
values ('demo-wedding', 'Demo Wedding')
on conflict (slug) do nothing;
