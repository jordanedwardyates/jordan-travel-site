-- Site events — first-party behavioural log for lead intelligence.
-- Apply in: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (IF NOT EXISTS throughout).
--
-- Purpose (see docs/lead-intelligence.md):
--  1. Ownership — capture interest the instant it happens so a contact can be
--     pushed to HubSpot before the host agency reaches out.
--  2. Signal — record WHAT a visitor looked at, already normalized into
--     macro buckets (region / season / price band) by src/lib/taxonomy.ts,
--     so we log "Mediterranean · Autumn · $5–10k", never "a Croatian cruise".
--
-- Writes happen server-side only (the /api/track route + form actions use the
-- service-role admin client). RLS is enabled with NO public policies: the
-- anon/public key can neither read nor write. Same dashboard-only posture as
-- quote_requests and the campaign tables.

create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),

  -- Opaque per-browser id from an httpOnly cookie set by /api/track. Anonymous
  -- until the same browser submits a form, at which point email is stitched on.
  visitor_id uuid not null,

  -- Filled in the moment the visitor identifies (quote request or dispatch
  -- signup). A backfill updates the visitor's prior anonymous rows too, so the
  -- whole session's history attaches to the person.
  email text,

  event_type text not null default 'view'
    check (event_type in ('view', 'identify')),

  -- What was looked at.
  entity_type text check (entity_type in ('journey', 'destination', 'page')),
  entity_slug text check (char_length(entity_slug) <= 200),
  path text check (char_length(path) <= 300),

  -- Normalized interest buckets, computed at write time from taxonomy.ts.
  -- Nullable: not every page classifies (e.g. the homepage).
  macro_region text check (char_length(macro_region) <= 60),
  season text check (season in ('Winter', 'Spring', 'Summer', 'Autumn')),
  price_band text check (char_length(price_band) <= 20),

  meta jsonb
);

create index if not exists site_events_visitor_idx
  on public.site_events (visitor_id, occurred_at desc);
create index if not exists site_events_email_idx
  on public.site_events (email) where email is not null;
create index if not exists site_events_region_idx
  on public.site_events (macro_region) where macro_region is not null;

alter table public.site_events enable row level security;
-- No policies on purpose: service-role only.

-- ------------------------------------------------------------------
-- Per-visitor interest rollup — the "what are they after" view.
-- Frequency of each bucket per visitor; the dashboard/app picks the top one.
-- ------------------------------------------------------------------
create or replace view public.visitor_interest as
select
  visitor_id,
  max(email) as email,
  count(*) filter (where event_type = 'view') as views,
  max(occurred_at) as last_seen,
  mode() within group (order by macro_region)
    filter (where macro_region is not null) as top_region,
  mode() within group (order by season)
    filter (where season is not null) as top_season,
  mode() within group (order by price_band)
    filter (where price_band is not null) as top_price_band
from public.site_events
group by visitor_id;
