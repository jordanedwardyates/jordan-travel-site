-- The Aegean Passport — full schema
-- Apply in: Supabase Dashboard → SQL Editor → New query → paste this file → Run.
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS throughout.
--
-- Supabase is the sole source of truth for site data. Every entity table has
-- a stable UUID primary key and an updated_at column (maintained by trigger)
-- so records can later sync one-way into Google Sheets without duplication.
-- The join tables (voyage_tags, campaign_sailings) key on their pair, and the
-- append-only tables (quote_items, campaign_events, inquiries) carry only
-- created_at. See supabase/SYNC_NOTES.md for the future sync design.
--
-- Reading order (this file runs top-to-bottom on a fresh database):
--   1. travel_tags  → voyages → voyage_tags → accommodations → price_offers
--      — the normalized quote-intelligence model. A voyage is one sailing;
--        an accommodation is one cabin category on that sailing; a price
--        offer is one dated quote for that category.
--   2. quote_packages → quote_items — one letter or imported sheet row, and
--      the price offers it put in front of a client.
--   3. campaigns → campaign_sailings → campaign_events — the Dispatch, what
--      sailed in it, and what the ESP saw people do.
--   4. homepage_features — the editor's hand on what the site shows.
--   5. journeys, quote_requests, subscribers, inquiries, cruises — the
--      website-facing tables, two of them legacy (see their banners).
--
-- Nothing here is a booking engine. Prices are quotes, and every quote
-- carries the provenance (source_status, quoted_at, source_message_id) that
-- lets an advisor say where a number came from.

-- Maintains updated_at on any UPDATE.
create extension if not exists moddatetime with schema extensions;

-- gen_random_uuid() lives in pgcrypto on older Postgres; harmless to ensure.
create extension if not exists pgcrypto with schema extensions;

-- ==================================================================
-- PART ONE — the normalized quote intelligence model
-- ==================================================================

-- ------------------------------------------------------------------
-- travel_tags — the vocabulary: regions, rivers, countries, themes
-- Self-referential: a subregion hangs off its region via parent_id.
-- ------------------------------------------------------------------
create table if not exists public.travel_tags (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  tag_type text not null check (tag_type in (
    'region', 'subregion', 'river', 'crossing',
    'country', 'port', 'theme', 'voyage_type'
  )),
  parent_id uuid references public.travel_tags (id) on delete set null,
  is_active boolean not null default true,
  unique (tag_type, name)
);

create index if not exists travel_tags_parent_idx
  on public.travel_tags (parent_id);

-- ------------------------------------------------------------------
-- voyages — canonical sailings
-- source_status is provenance (do I trust this record?).
-- website_status is editorial (may it appear on the site?).
-- Both must be clean before anything shows publicly — see RLS below.
-- ------------------------------------------------------------------
create table if not exists public.voyages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_status text not null default 'needs_review'
    check (source_status in ('needs_review', 'trusted', 'rejected')),
  website_status text not null default 'not_approved'
    check (website_status in ('not_approved', 'approved', 'hidden')),
  cruise_line text not null check (char_length(cruise_line) between 1 and 120),
  ship text not null check (char_length(ship) between 1 and 120),
  voyage_code text,
  official_voyage_title text not null
    check (char_length(official_voyage_title) between 1 and 200),
  embarkation_date date,
  disembarkation_date date,
  nights integer check (nights is null or nights between 1 and 365),
  embark_port text,
  disembark_port text,
  primary_tag_id uuid references public.travel_tags (id) on delete set null,
  itinerary_summary text,
  jordans_take text,
  official_url text,
  deck_plan_url text,
  hero_image_url text,
  hero_image_alt text,
  internal_notes text,
  quoted_at timestamptz,
  -- One sailing per line + ship + dates + voyage code. NULLS NOT DISTINCT so
  -- two rows with a null voyage_code still collide instead of duplicating.
  unique nulls not distinct
    (cruise_line, ship, embarkation_date, disembarkation_date, voyage_code)
);

comment on table public.voyages is
  'Canonical cruise sailing table for the normalized quote intelligence model.';

create index if not exists voyages_lookup_idx
  on public.voyages (cruise_line, ship, embarkation_date);

create index if not exists voyages_primary_tag_idx
  on public.voyages (primary_tag_id);

create index if not exists voyages_website_idx
  on public.voyages (website_status, source_status, embarkation_date);

-- ------------------------------------------------------------------
-- voyage_tags — many-to-many between voyages and the vocabulary
-- ------------------------------------------------------------------
create table if not exists public.voyage_tags (
  voyage_id uuid not null references public.voyages (id) on delete cascade,
  tag_id uuid not null references public.travel_tags (id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (voyage_id, tag_id)
);

create index if not exists voyage_tags_tag_idx
  on public.voyage_tags (tag_id, voyage_id);

-- ------------------------------------------------------------------
-- accommodations — one cabin category on one voyage
-- balcony_group is generated, not stored by hand: it answers "is this a
-- true step-out balcony?" so search never has to re-litigate the taxonomy.
-- ------------------------------------------------------------------
create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  voyage_id uuid not null references public.voyages (id) on delete cascade,
  category_name text not null
    check (char_length(category_name) between 1 and 160),
  category_code text,
  accommodation_type text not null default 'unknown'
    constraint accommodations_type_check check (accommodation_type in (
      'inside', 'oceanview', 'french_balcony', 'balcony', 'veranda',
      'concierge_veranda', 'suite', 'penthouse', 'yacht_suite',
      'expedition_suite', 'other', 'unknown'
    )),
  total_size_sq_ft numeric(8, 2)
    check (total_size_sq_ft is null or total_size_sq_ft > 0),
  size_display text,
  sleeps integer check (sleeps is null or sleeps between 1 and 20),
  deck_location text,
  image_url text,
  notes text,
  source_status text not null default 'needs_review'
    check (source_status in ('needs_review', 'trusted', 'rejected')),
  room_number text,
  balcony_group boolean generated always as (
    accommodation_type in ('balcony', 'veranda', 'concierge_veranda')
  ) stored,
  -- NULLS NOT DISTINCT: a category with no code still can't be entered twice.
  unique nulls not distinct (voyage_id, category_code, category_name)
);

comment on column public.accommodations.balcony_group is
  'True step-out balcony group (balcony, veranda, concierge_veranda). French balcony intentionally excluded by default.';

create index if not exists accommodations_voyage_idx
  on public.accommodations (voyage_id);

-- ------------------------------------------------------------------
-- price_offers — one dated quote for one cabin category
-- their_price is retail; my_price is the negotiated fare. my_price is
-- required to include taxes and fees (the CHECK enforces it), because a
-- comparison that isn't apples-to-apples is worse than no comparison.
-- comparison_status is generated so nobody can hand-label a bad number.
-- ------------------------------------------------------------------
create table if not exists public.price_offers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accommodation_id uuid not null
    references public.accommodations (id) on delete cascade,
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  price_basis text not null default 'unknown'
    check (price_basis in ('unknown', 'per_person', 'total_accommodation')),
  occupancy_basis text not null default 'double'
    check (occupancy_basis in ('single', 'double', 'triple', 'quad', 'other')),
  their_price numeric(12, 2) check (their_price is null or their_price >= 0),
  my_price numeric(12, 2) check (my_price is null or my_price >= 0),
  my_price_includes_taxes_fees boolean not null default true
    check (my_price_includes_taxes_fees = true),
  availability_status text not null default 'unknown'
    check (availability_status in (
      'available', 'guarantee', 'waitlist', 'sold_out', 'unknown'
    )),
  agency_bonus text,
  promotion_name text,
  quoted_at timestamptz not null default now(),
  offer_expires_at timestamptz,
  source text,
  source_message_id text,
  source_status text not null default 'needs_review'
    check (source_status in ('needs_review', 'trusted', 'rejected')),
  website_approved boolean not null default false,
  public_notes text,
  internal_notes text,
  comparison_status text generated always as (
    case
      when my_price is null then 'no_my_price'
      when their_price is null then 'no_retail_price'
      when my_price < their_price then 'discount'
      when my_price = their_price then 'same_as_retail'
      else 'invalid_higher_than_retail'
    end
  ) stored,
  -- An offer cannot expire before it was quoted.
  check (offer_expires_at is null or offer_expires_at > quoted_at)
);

comment on column public.price_offers.price_basis is
  'Use unknown for imported legacy records until per-person versus total-accommodation basis is verified.';

create index if not exists price_offers_accommodation_idx
  on public.price_offers (accommodation_id, quoted_at desc);

create index if not exists price_offers_search_idx
  on public.price_offers (
    currency, price_basis, my_price, their_price, availability_status
  );

-- ==================================================================
-- PART TWO — what was actually sent to a client
-- ==================================================================

-- ------------------------------------------------------------------
-- quote_packages — one sent quote, or one imported source row
-- The source_* columns keep the paper trail back to the spreadsheet or
-- email the numbers were lifted from; raw_source_data holds the original
-- row verbatim so nothing is lost in normalization.
-- ------------------------------------------------------------------
create table if not exists public.quote_packages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 200),
  client_name text,
  client_email text,
  source_message_id text,
  quoted_at timestamptz not null default now(),
  status text not null default 'draft'
    check (status in (
      'draft', 'sent', 'accepted', 'declined', 'expired', 'archived'
    )),
  extraction_status text not null default 'needs_review'
    check (extraction_status in ('needs_review', 'approved', 'rejected')),
  notes text,
  source_system text,
  source_spreadsheet_id text,
  source_sheet_name text,
  source_row_number integer,
  raw_source_data jsonb not null default '{}'::jsonb,
  import_status text not null default 'needs_review'
    check (import_status in (
      'needs_review', 'partially_normalized', 'normalized', 'rejected'
    ))
);

comment on table public.quote_packages is
  'One sent quote, campaign entry, prospect quote context, or imported source row. May contain zero or many normalized quote_items.';

create index if not exists quote_packages_client_idx
  on public.quote_packages (client_email, quoted_at desc);

-- One import per spreadsheet cell coordinate; re-running an import updates
-- rather than duplicates. Partial, so hand-entered packages are unaffected.
create unique index if not exists quote_packages_sheet_source_unique
  on public.quote_packages (
    source_spreadsheet_id, source_sheet_name, source_row_number
  )
  where source_spreadsheet_id is not null
    and source_sheet_name is not null
    and source_row_number is not null;

-- ------------------------------------------------------------------
-- quote_items — which price offers went into which package
-- ON DELETE RESTRICT on the offer: you may not delete a price that a
-- client has already been shown.
-- ------------------------------------------------------------------
create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  quote_package_id uuid not null
    references public.quote_packages (id) on delete cascade,
  price_offer_id uuid not null
    references public.price_offers (id) on delete restrict,
  display_order integer not null default 0,
  recommendation_label text,
  client_facing_notes text,
  selected boolean not null default false,
  unique (quote_package_id, price_offer_id)
);

create index if not exists quote_items_price_offer_idx
  on public.quote_items (price_offer_id);

-- ==================================================================
-- PART THREE — the Dispatch and its measurement
-- ==================================================================

-- ------------------------------------------------------------------
-- campaigns — one Dispatch / STAMPED letter
-- ------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  campaign_number integer not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  subject text check (char_length(subject) <= 250),
  preheader text,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sent', 'archived')),
  sent_at timestamptz,
  segment text,
  audience_size integer check (audience_size is null or audience_size >= 0),
  html_path text,
  preview_path text,
  notes text
);

comment on table public.campaigns is
  'One Dispatch / STAMPED letter. The archived HTML lives at html_path in the repo (emails/).';

-- ------------------------------------------------------------------
-- campaign_sailings — which sailings appeared in which letter
-- ON DELETE RESTRICT on the voyage: a sent letter's contents are history
-- and must not be silently rewritten.
-- ------------------------------------------------------------------
create table if not exists public.campaign_sailings (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  voyage_id uuid not null references public.voyages (id) on delete restrict,
  "position" integer not null default 0,
  section text,
  utm_content text,
  lead_fare numeric check (lead_fare is null or lead_fare >= 0),
  lead_savings numeric check (lead_savings is null or lead_savings >= 0),
  created_at timestamptz not null default now(),
  primary key (campaign_id, voyage_id)
);

comment on table public.campaign_sailings is
  'Which sailings appeared in which letter. utm_content carries the Oceania voyage code used for click attribution.';

-- ------------------------------------------------------------------
-- campaign_events — raw engagement from the ESP webhook
-- ------------------------------------------------------------------
create table if not exists public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  campaign_id uuid references public.campaigns (id) on delete cascade,
  voyage_id uuid references public.voyages (id) on delete set null,
  recipient_email text,
  event_type text not null check (event_type in (
    'sent', 'delivered', 'opened', 'clicked',
    'bounced', 'complained', 'unsubscribed'
  )),
  link_url text,
  occurred_at timestamptz not null default now(),
  provider text default 'resend',
  provider_event_id text unique,
  raw jsonb not null default '{}'::jsonb
);

comment on table public.campaign_events is
  'Raw engagement events from the ESP webhook. provider_event_id is unique so redelivered webhooks are idempotent.';

create index if not exists campaign_events_campaign_idx
  on public.campaign_events (campaign_id, event_type);

create index if not exists campaign_events_occurred_idx
  on public.campaign_events (occurred_at desc);

create index if not exists campaign_events_voyage_idx
  on public.campaign_events (voyage_id)
  where voyage_id is not null;

-- ==================================================================
-- PART FOUR — the website-facing tables
-- ==================================================================

-- ------------------------------------------------------------------
-- homepage_features — the editor's hand: which voyages the site leads with
-- review_on is a soft nudge; hard_expires_at actually pulls the card.
-- ------------------------------------------------------------------
create table if not exists public.homepage_features (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  voyage_id uuid not null unique
    references public.voyages (id) on delete cascade,
  featured_offer_id uuid
    references public.price_offers (id) on delete set null,
  active boolean not null default true,
  display_order integer not null default 100,
  feature_reason text,
  featured_at timestamptz not null default now(),
  review_on date,
  hard_expires_at timestamptz
);

create index if not exists homepage_features_active_idx
  on public.homepage_features (active, display_order, featured_at desc);

create index if not exists homepage_features_offer_idx
  on public.homepage_features (featured_offer_id);

-- ------------------------------------------------------------------
-- journeys — LEGACY. Curated sailings shown in "Recently Quoted".
-- Superseded by voyages + accommodations + price_offers. Do not add new
-- quote intelligence here; retire only after the app switches over.
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

comment on table public.journeys is
  'LEGACY Phase 4/5 website compatibility table. Do not add new quote intelligence here; retire only after the app switches to voyages.';

create index if not exists journeys_published_sort_idx
  on public.journeys (is_published, sort_order, created_at desc);

-- ------------------------------------------------------------------
-- quote_requests — inbound quote inquiries from the site
-- journey_id is the legacy link; voyage_id is the current one. Both are
-- ON DELETE SET NULL so an inquiry outlives the sailing it asked about.
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
    check (status in ('new', 'replied', 'closed')),
  voyage_id uuid references public.voyages (id) on delete set null,
  source_campaign_id uuid references public.campaigns (id) on delete set null
);

create index if not exists quote_requests_created_idx
  on public.quote_requests (created_at desc);

create index if not exists quote_requests_journey_idx
  on public.quote_requests (journey_id);

create index if not exists quote_requests_voyage_idx
  on public.quote_requests (voyage_id);

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
-- email_suppressions — the do-not-email list
--
-- Deliberately NOT a flag on subscribers. Most of the Dispatch list came
-- from imported contact sheets and was never a `subscribers` row, so an
-- opt-out has to be recordable for any address at all, whether we have
-- ever seen it before or not. This table is the single authority: if an
-- address is here, nothing sends to it, ever.
--
-- Append-only in practice. A re-subscribe deletes the row rather than
-- flipping a flag, so the table always reads as "currently suppressed".
-- ------------------------------------------------------------------
create table if not exists public.email_suppressions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null
    check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  -- 'unsubscribe' (they asked), 'bounce' (hard bounce), 'complaint' (marked
  -- it spam), 'manual' (Jordan added them).
  reason text not null default 'unsubscribe' check (char_length(reason) <= 40),
  -- Which letter they were reading when they opted out, if known.
  campaign_slug text check (char_length(campaign_slug) <= 120)
);

create unique index if not exists email_suppressions_email_unique_idx
  on public.email_suppressions (lower(email));

-- ------------------------------------------------------------------
-- inquiries — long-form "plan a voyage" enquiries
-- No updated_at and no trigger: these are append-only correspondence.
-- ------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text,
  email text not null,
  phone text,
  destination_interest text,
  travel_dates text,
  number_of_travelers integer
    check (number_of_travelers is null or number_of_travelers > 0),
  message text,
  source_page text,
  status text not null default 'new'
);

create index if not exists inquiries_created_at_index
  on public.inquiries (created_at desc);

-- ------------------------------------------------------------------
-- cruises — LEGACY. The first website cruise-card table.
-- Preserve until the app data layer is migrated and verified.
-- ------------------------------------------------------------------
create table if not exists public.cruises (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  cruise_line text not null,
  ship text,
  embarkation_date date,
  disembarkation_date date,
  nights integer check (nights is null or nights > 0),
  departure_city text,
  arrival_city text,
  region text,
  summary text,
  jordans_take text,
  price_display text,
  agency_bonus text,
  hero_image_url text,
  official_url text,
  deck_plan_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 100
);

comment on table public.cruises is
  'LEGACY early website cruise-card table. Preserve until the app data layer is migrated and verified.';

create index if not exists cruises_published_sort_index
  on public.cruises (published, sort_order, embarkation_date);

-- ==================================================================
-- Views
-- ==================================================================

-- ------------------------------------------------------------------
-- website_featured_voyages — the homepage card, assembled.
-- security_invoker = true so the caller's RLS applies: anon sees only
-- what the voyages / price_offers policies already allow.
-- ------------------------------------------------------------------
create or replace view public.website_featured_voyages
  with (security_invoker = true) as
  select
    hf.id as feature_id,
    hf.display_order,
    hf.feature_reason,
    hf.featured_at,
    hf.review_on,
    hf.hard_expires_at,
    v.id as voyage_id,
    v.cruise_line,
    v.ship,
    v.voyage_code,
    v.official_voyage_title,
    v.embarkation_date,
    v.disembarkation_date,
    v.nights,
    v.embark_port,
    v.disembark_port,
    v.itinerary_summary,
    v.jordans_take,
    v.official_url,
    v.deck_plan_url,
    v.hero_image_url,
    v.hero_image_alt,
    a.id as accommodation_id,
    a.category_name,
    a.category_code,
    a.total_size_sq_ft,
    a.size_display,
    po.id as price_offer_id,
    po.currency,
    po.price_basis,
    po.occupancy_basis,
    po.their_price,
    po.my_price,
    po.comparison_status,
    po.agency_bonus,
    po.availability_status,
    po.offer_expires_at
  from public.homepage_features hf
  join public.voyages v on v.id = hf.voyage_id
  left join public.price_offers po on po.id = hf.featured_offer_id
  left join public.accommodations a on a.id = po.accommodation_id
  where hf.active
    and (hf.hard_expires_at is null or hf.hard_expires_at > now());

-- ------------------------------------------------------------------
-- campaign_stats — one row per Dispatch, with engagement rolled up.
-- Opens and clicks are counted by distinct recipient; total_clicks is raw.
-- NOTE: this view is NOT security_invoker in the live database, so it runs
-- with the owner's rights and bypasses RLS on campaigns / campaign_events.
-- Reads are dashboard-only today; add security_invoker before exposing it.
-- ------------------------------------------------------------------
create or replace view public.campaign_stats as
  select
    c.id as campaign_id,
    c.campaign_number,
    c.slug,
    c.title,
    c.subject,
    c.status,
    c.sent_at,
    c.segment,
    c.audience_size,
    count(distinct e.recipient_email)
      filter (where e.event_type = 'delivered') as delivered,
    count(distinct e.recipient_email)
      filter (where e.event_type = 'opened') as opened,
    count(distinct e.recipient_email)
      filter (where e.event_type = 'clicked') as clicked,
    count(*) filter (where e.event_type = 'clicked') as total_clicks,
    count(distinct e.recipient_email)
      filter (where e.event_type = 'bounced') as bounced,
    count(distinct e.recipient_email)
      filter (where e.event_type = 'unsubscribed') as unsubscribed,
    (select count(*) from public.quote_requests q
      where q.source_campaign_id = c.id) as quote_requests
  from public.campaigns c
  left join public.campaign_events e on e.campaign_id = c.id
  group by c.id;

-- ------------------------------------------------------------------
-- campaign_sailing_stats — per-sailing attribution inside one letter.
-- Answers the only question that matters: which sailing earned the reply?
-- NOTE: also NOT security_invoker live — same caveat as campaign_stats.
-- ------------------------------------------------------------------
create or replace view public.campaign_sailing_stats as
  select
    cs.campaign_id,
    cs.voyage_id,
    cs."position",
    cs.section,
    cs.utm_content,
    cs.lead_fare,
    cs.lead_savings,
    v.ship,
    v.official_voyage_title,
    v.embarkation_date,
    v.embark_port,
    v.disembark_port,
    v.official_url,
    count(e.id) filter (where e.event_type = 'clicked') as clicks,
    count(distinct e.recipient_email)
      filter (where e.event_type = 'clicked') as unique_clickers,
    (select count(*) from public.quote_requests q
      where q.source_campaign_id = cs.campaign_id
        and q.voyage_id = cs.voyage_id) as quote_requests
  from public.campaign_sailings cs
  join public.voyages v on v.id = cs.voyage_id
  left join public.campaign_events e
    on e.campaign_id = cs.campaign_id and e.voyage_id = cs.voyage_id
  group by
    cs.campaign_id, cs.voyage_id, cs."position", cs.section, cs.utm_content,
    cs.lead_fare, cs.lead_savings, v.ship, v.official_voyage_title,
    v.embarkation_date, v.embark_port, v.disembark_port, v.official_url;

-- ==================================================================
-- Functions
-- ==================================================================

-- ------------------------------------------------------------------
-- search_voyage_offers — the advisor's search across the whole model.
-- Called from the app via supabase.rpc("search_voyage_offers", …).
-- Only trusted records with a real my_price that includes taxes and fees
-- are eligible; an offer priced above retail is never returned.
-- p_one_per_voyage collapses to the single best cabin on each sailing.
-- ------------------------------------------------------------------
create or replace function public.search_voyage_offers(
  p_tags text[] default null,
  p_cruise_lines text[] default null,
  p_ships text[] default null,
  p_embark_from date default null,
  p_embark_to date default null,
  p_balcony_mode text default null,
  p_accommodation_classes text[] default null,
  p_max_my_price numeric default null,
  p_price_basis text default 'per_person',
  p_availability text[] default array['available', 'guarantee'],
  p_future_only boolean default true,
  p_one_per_voyage boolean default false,
  p_limit integer default 10
)
returns table (
  voyage_id uuid,
  cruise_line text,
  ship text,
  voyage_title text,
  embarkation_date date,
  disembarkation_date date,
  embark_port text,
  disembark_port text,
  tags text[],
  accommodation_id uuid,
  category_name text,
  category_code text,
  accommodation_class text,
  total_size_sq_ft numeric,
  their_price numeric,
  my_price numeric,
  price_basis text,
  availability_status text,
  agency_bonus text,
  quoted_at timestamptz,
  offer_expires_at timestamptz
)
language sql
stable
as $function$
  with candidates as (
    select
      v.id as voyage_id, v.cruise_line, v.ship, v.official_voyage_title as voyage_title,
      v.embarkation_date, v.disembarkation_date, v.embark_port, v.disembark_port,
      coalesce(array(select t.slug from voyage_tags vt join travel_tags t on t.id = vt.tag_id
                     where vt.voyage_id = v.id), '{}') as tags,
      a.id as accommodation_id, a.category_name, a.category_code,
      a.accommodation_type as accommodation_class, a.total_size_sq_ft,
      p.their_price, p.my_price, p.price_basis, p.availability_status, p.agency_bonus,
      p.quoted_at, p.offer_expires_at
    from price_offers p
    join accommodations a on a.id = p.accommodation_id
    join voyages v on v.id = a.voyage_id
    where v.source_status = 'trusted'
      and a.source_status = 'trusted'
      and p.source_status = 'trusted'
      and p.my_price is not null
      and p.my_price_includes_taxes_fees = true
      and p.comparison_status is distinct from 'invalid_higher_than_retail'
      and (p.offer_expires_at is null or p.offer_expires_at > now())
      and (p_price_basis is null or p.price_basis = p_price_basis)
      and (p_availability is null or p.availability_status = any(p_availability))
      and (p_max_my_price is null or p.my_price < p_max_my_price)
      and (p_cruise_lines is null or v.cruise_line = any(p_cruise_lines))
      and (p_ships is null or v.ship = any(p_ships))
      and (p_embark_from is null or v.embarkation_date >= p_embark_from)
      and (p_embark_to is null or v.embarkation_date <= p_embark_to)
      and (not p_future_only or v.embarkation_date >= current_date)
      and (p_accommodation_classes is null or a.accommodation_type = any(p_accommodation_classes))
      and (p_balcony_mode is null
           or (p_balcony_mode = 'true_step_out' and a.balcony_group)
           or (p_balcony_mode = 'any_style' and (a.balcony_group or a.accommodation_type = 'french_balcony')))
      and (p_tags is null or exists (
        select 1 from voyage_tags vt join travel_tags t on t.id = vt.tag_id
        where vt.voyage_id = v.id and t.slug = any(p_tags)))
  ),
  ranked as (
    select c.*, row_number() over (
      partition by case when p_one_per_voyage then c.voyage_id else c.accommodation_id end
      order by (c.availability_status = 'available') desc, c.quoted_at desc, c.my_price asc
    ) as rn
    from candidates c
  )
  select voyage_id, cruise_line, ship, voyage_title, embarkation_date, disembarkation_date,
         embark_port, disembark_port, tags, accommodation_id, category_name, category_code,
         accommodation_class, total_size_sq_ft, their_price, my_price, price_basis,
         availability_status, agency_bonus, quoted_at, offer_expires_at
  from ranked
  where (not p_one_per_voyage) or rn = 1
  order by (availability_status = 'available') desc, my_price asc
  limit coalesce(p_limit, 10)
$function$;

-- ==================================================================
-- updated_at triggers
-- Note which tables are deliberately absent: quote_items, campaign_sailings
-- and campaign_events have no updated_at at all (append-only), and
-- inquiries likewise. campaigns and cruises carry an updated_at column but
-- have no trigger live — they are touched by hand from the dashboard.
-- ==================================================================
drop trigger if exists set_travel_tags_updated_at on public.travel_tags;
create trigger set_travel_tags_updated_at
  before update on public.travel_tags
  for each row execute procedure extensions.moddatetime (updated_at);

drop trigger if exists set_voyages_updated_at on public.voyages;
create trigger set_voyages_updated_at
  before update on public.voyages
  for each row execute procedure extensions.moddatetime (updated_at);

drop trigger if exists set_accommodations_updated_at on public.accommodations;
create trigger set_accommodations_updated_at
  before update on public.accommodations
  for each row execute procedure extensions.moddatetime (updated_at);

drop trigger if exists set_price_offers_updated_at on public.price_offers;
create trigger set_price_offers_updated_at
  before update on public.price_offers
  for each row execute procedure extensions.moddatetime (updated_at);

drop trigger if exists set_quote_packages_updated_at on public.quote_packages;
create trigger set_quote_packages_updated_at
  before update on public.quote_packages
  for each row execute procedure extensions.moddatetime (updated_at);

drop trigger if exists set_homepage_features_updated_at on public.homepage_features;
create trigger set_homepage_features_updated_at
  before update on public.homepage_features
  for each row execute procedure extensions.moddatetime (updated_at);

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

-- ==================================================================
-- Row Level Security
--
-- RLS is on for every table. The rule of the house: a visitor sees a price
-- only when the whole chain is clean — the voyage is trusted AND approved,
-- the accommodation is trusted, and the offer is trusted, website_approved,
-- still available, not expired, and not priced above retail.
--
-- Visitors may: read approved voyages / tags / accommodations / offers /
-- homepage features / published journeys / published cruises, insert quote
-- requests, and insert subscriber signups. They may NOT read quote_requests,
-- subscribers, inquiries, quote_packages, quote_items, campaigns,
-- campaign_sailings or campaign_events — those tables have RLS enabled and
-- no policies at all, so anon and authenticated are denied by default.
-- Reads there are dashboard- and service-role-only.
-- ==================================================================
alter table public.travel_tags enable row level security;
alter table public.voyages enable row level security;
alter table public.voyage_tags enable row level security;
alter table public.accommodations enable row level security;
alter table public.price_offers enable row level security;
alter table public.quote_packages enable row level security;
alter table public.quote_items enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_sailings enable row level security;
alter table public.campaign_events enable row level security;
alter table public.homepage_features enable row level security;
alter table public.journeys enable row level security;
alter table public.quote_requests enable row level security;
alter table public.subscribers enable row level security;
alter table public.email_suppressions enable row level security;
alter table public.inquiries enable row level security;
alter table public.cruises enable row level security;

-- Belt and braces on the two client-confidential tables: the Supabase
-- default grants are revoked outright, so anon/authenticated cannot reach
-- them even if a policy is added by accident later.
revoke all on public.quote_packages from anon, authenticated;
revoke all on public.quote_items from anon, authenticated;

drop policy if exists "public read active travel tags" on public.travel_tags;
create policy "public read active travel tags"
  on public.travel_tags for select
  to anon, authenticated
  using (is_active);

drop policy if exists "public read approved voyages" on public.voyages;
create policy "public read approved voyages"
  on public.voyages for select
  to anon, authenticated
  using (source_status = 'trusted' and website_status = 'approved');

drop policy if exists "public read approved voyage tags" on public.voyage_tags;
create policy "public read approved voyage tags"
  on public.voyage_tags for select
  to anon, authenticated
  using (exists (
    select 1 from public.voyages v
    where v.id = voyage_tags.voyage_id
      and v.source_status = 'trusted'
      and v.website_status = 'approved'
  ));

drop policy if exists "public read approved accommodations" on public.accommodations;
create policy "public read approved accommodations"
  on public.accommodations for select
  to anon, authenticated
  using (
    source_status = 'trusted'
    and exists (
      select 1 from public.voyages v
      where v.id = accommodations.voyage_id
        and v.source_status = 'trusted'
        and v.website_status = 'approved'
    )
  );

drop policy if exists "public read safe price offers" on public.price_offers;
create policy "public read safe price offers"
  on public.price_offers for select
  to anon, authenticated
  using (
    source_status = 'trusted'
    and website_approved
    and availability_status in ('available', 'guarantee')
    and comparison_status <> 'invalid_higher_than_retail'
    and (offer_expires_at is null or offer_expires_at > now())
    and exists (
      select 1
      from public.accommodations a
      join public.voyages v on v.id = a.voyage_id
      where a.id = price_offers.accommodation_id
        and a.source_status = 'trusted'
        and v.source_status = 'trusted'
        and v.website_status = 'approved'
    )
  );

drop policy if exists "public read active homepage features" on public.homepage_features;
create policy "public read active homepage features"
  on public.homepage_features for select
  to anon, authenticated
  using (
    active
    and (hard_expires_at is null or hard_expires_at > now())
    and exists (
      select 1 from public.voyages v
      where v.id = homepage_features.voyage_id
        and v.source_status = 'trusted'
        and v.website_status = 'approved'
    )
  );

drop policy if exists "public read published journeys" on public.journeys;
create policy "public read published journeys"
  on public.journeys for select
  to anon, authenticated
  using (is_published);

drop policy if exists "Public can view published cruises" on public.cruises;
create policy "Public can view published cruises"
  on public.cruises for select
  to anon
  using (published = true);

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

-- Unsubscribing must work for someone who is not logged in and never will
-- be, so anon may insert. It may NOT select: the table would otherwise be a
-- readable list of everyone who has ever opted out. Reads are service-role
-- only, which is how the sender checks the list before a send.
drop policy if exists "public insert suppressions" on public.email_suppressions;
create policy "public insert suppressions"
  on public.email_suppressions for insert
  to anon, authenticated
  with check (true);
