-- The Aegean Passport — Phase 4 schema
-- Apply in: Supabase Dashboard → SQL Editor → New query → paste this file → Run.
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS throughout.
--
-- Supabase is the sole source of truth for site data. Every table has a
-- stable UUID primary key and an updated_at column (maintained by trigger)
-- so records can later sync one-way into Google Sheets without duplication.
-- See supabase/SYNC_NOTES.md for the future sync design.

-- Maintains updated_at on any UPDATE.
create extension if not exists moddatetime with schema extensions;

-- ------------------------------------------------------------------
-- journeys — curated sailings shown in "Recently Quoted"
-- ------------------------------------------------------------------
create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  region text not null check (char_length(region) between 1 and 80),
  dates text not null check (char_length(dates) between 1 and 80),
  route_title text not null check (char_length(route_title) between 1 and 120),
  voyage_title text not null check (char_length(voyage_title) between 1 and 160),
  cruise_line text not null check (char_length(cruise_line) between 1 and 120),
  ship text not null check (char_length(ship) between 1 and 120),
  nights integer not null check (nights between 1 and 365),
  embark text not null check (char_length(embark) between 1 and 120),
  disembark text not null check (char_length(disembark) between 1 and 120),
  port_count integer not null check (port_count between 2 and 60),
  stateroom text not null check (char_length(stateroom) between 1 and 120),
  room_size text check (char_length(room_size) <= 60),
  their_price text not null check (char_length(their_price) <= 40),
  your_price text not null check (char_length(your_price) <= 40),
  price_note text check (char_length(price_note) <= 120),
  jordans_take text not null check (char_length(jordans_take) between 1 and 600),
  availability_note text check (char_length(availability_note) <= 200),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  slug text unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  featured boolean not null default false
);

create index if not exists journeys_published_sort_idx
  on public.journeys (is_published, sort_order, created_at desc);

-- ------------------------------------------------------------------
-- quote_requests — inbound quote inquiries from the site
-- ------------------------------------------------------------------
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 160),
  email text not null
    check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text check (char_length(phone) <= 40),
  journey_id uuid references public.journeys (id) on delete set null,
  journey_label text check (char_length(journey_label) <= 200),
  message text not null check (char_length(message) between 1 and 4000),
  status text not null default 'new'
    check (status in ('new', 'replied', 'closed'))
);

create index if not exists quote_requests_created_idx
  on public.quote_requests (created_at desc);

-- Phase H (applied as migration quote_requests_voyage_fk): a request may
-- reference a normalized voyage instead of a legacy journey. Guarded so this
-- file stays runnable on a database without the normalized tables.
do $$
begin
  if to_regclass('public.voyages') is not null then
    alter table public.quote_requests
      add column if not exists voyage_id uuid
        references public.voyages (id) on delete set null;
    create index if not exists quote_requests_voyage_idx
      on public.quote_requests (voyage_id);
  end if;
end $$;

-- ------------------------------------------------------------------
-- subscribers — The Dispatch signups
-- ------------------------------------------------------------------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null
    check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  source text not null default 'homepage' check (char_length(source) <= 40)
);

-- Case-insensitive uniqueness: Jane@x.com and jane@x.com are one subscriber.
create unique index if not exists subscribers_email_unique_idx
  on public.subscribers (lower(email));

-- ------------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------------
drop trigger if exists set_journeys_updated_at on public.journeys;
create trigger set_journeys_updated_at
  before update on public.journeys
  for each row execute procedure extensions.moddatetime (updated_at);

drop trigger if exists set_quote_requests_updated_at on public.quote_requests;
create trigger set_quote_requests_updated_at
  before update on public.quote_requests
  for each row execute procedure extensions.moddatetime (updated_at);

drop trigger if exists set_subscribers_updated_at on public.subscribers;
create trigger set_subscribers_updated_at
  before update on public.subscribers
  for each row execute procedure extensions.moddatetime (updated_at);

-- ------------------------------------------------------------------
-- Row Level Security
-- Visitors may: read published journeys, insert quote requests,
-- insert subscriber signups. They may NOT read quote_requests or
-- subscribers (no select policies exist — reads are dashboard-only).
-- ------------------------------------------------------------------
alter table public.journeys enable row level security;
alter table public.quote_requests enable row level security;
alter table public.subscribers enable row level security;

drop policy if exists "public read published journeys" on public.journeys;
create policy "public read published journeys"
  on public.journeys for select
  to anon, authenticated
  using (is_published);

drop policy if exists "public insert quote requests" on public.quote_requests;
create policy "public insert quote requests"
  on public.quote_requests for insert
  to anon, authenticated
  with check (status = 'new');

drop policy if exists "public insert subscribers" on public.subscribers;
create policy "public insert subscribers"
  on public.subscribers for insert
  to anon, authenticated
  with check (true);
