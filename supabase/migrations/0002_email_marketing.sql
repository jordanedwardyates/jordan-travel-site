-- Email Marketing — STAMPED: The Weekly Edit
-- Apply in: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: IF NOT EXISTS / DROP POLICY IF EXISTS / ADD COLUMN IF NOT
-- EXISTS throughout. Builds on supabase/schema.sql (Phase 4).
--
-- Adds the subscriber lifecycle (double opt-in + unsubscribe) and the
-- campaign / variant / send / event tables that make A/B testing and
-- engagement measurement possible. See docs/email-marketing-architecture.md.

-- ------------------------------------------------------------------
-- subscribers — extend for double opt-in + unsubscribe
-- ------------------------------------------------------------------
alter table public.subscribers
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed', 'cleaned'));

alter table public.subscribers
  add column if not exists confirmation_token uuid not null default gen_random_uuid();

alter table public.subscribers
  add column if not exists confirmed_at timestamptz;

alter table public.subscribers
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

alter table public.subscribers
  add column if not exists unsubscribed_at timestamptz;

-- Token lookups must be fast and unambiguous.
create unique index if not exists subscribers_confirmation_token_idx
  on public.subscribers (confirmation_token);
create unique index if not exists subscribers_unsubscribe_token_idx
  on public.subscribers (unsubscribe_token);
create index if not exists subscribers_status_idx
  on public.subscribers (status);

-- ------------------------------------------------------------------
-- campaigns — one weekly issue
-- ------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 160),
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sending', 'sent', 'canceled')),
  scheduled_for timestamptz,
  -- Champion/challenger: send variants to this % first, then the winner to the
  -- rest. NULL/100 means a plain full split with no follow-up send.
  sample_pct integer check (sample_pct between 1 and 100),
  winner_metric text default 'click'
    check (winner_metric in ('open', 'click', 'click_to_open')),
  winner_variant_id uuid,
  sent_at timestamptz
);

create index if not exists campaigns_status_idx
  on public.campaigns (status, scheduled_for);

-- ------------------------------------------------------------------
-- campaign_variants — an A/B arm of an issue
-- ------------------------------------------------------------------
create table if not exists public.campaign_variants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  label text not null check (label in ('A', 'B', 'C', 'D')),
  subject text not null check (char_length(subject) between 1 and 200),
  preview_text text check (char_length(preview_text) <= 200),
  html_body text not null,
  -- Relative split weight; two arms at weight 1 = 50/50.
  weight integer not null default 1 check (weight between 1 and 100),
  unique (campaign_id, label)
);

alter table public.campaigns
  drop constraint if exists campaigns_winner_variant_fk;
alter table public.campaigns
  add constraint campaigns_winner_variant_fk
  foreign key (winner_variant_id)
  references public.campaign_variants (id) on delete set null;

-- ------------------------------------------------------------------
-- sends — one row per subscriber per issue (the assignment + delivery record)
-- ------------------------------------------------------------------
create table if not exists public.sends (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  variant_id uuid not null references public.campaign_variants (id) on delete cascade,
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'delivered', 'bounced', 'failed')),
  provider_message_id text,
  sent_at timestamptz,
  -- A subscriber gets one send per issue, regardless of variant.
  unique (campaign_id, subscriber_id)
);

create index if not exists sends_campaign_variant_idx
  on public.sends (campaign_id, variant_id);
create index if not exists sends_subscriber_idx
  on public.sends (subscriber_id);

-- ------------------------------------------------------------------
-- email_events — the engagement log (from the ESP webhook)
-- ------------------------------------------------------------------
create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  send_id uuid references public.sends (id) on delete cascade,
  subscriber_id uuid references public.subscribers (id) on delete set null,
  campaign_id uuid references public.campaigns (id) on delete cascade,
  variant_id uuid references public.campaign_variants (id) on delete set null,
  type text not null
    check (type in ('delivered', 'open', 'click', 'bounce', 'complaint', 'unsubscribe')),
  url text check (char_length(url) <= 2000),
  meta jsonb
);

create index if not exists email_events_campaign_type_idx
  on public.email_events (campaign_id, type);
create index if not exists email_events_send_idx
  on public.email_events (send_id);

-- ------------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------------
drop trigger if exists set_campaigns_updated_at on public.campaigns;
create trigger set_campaigns_updated_at
  before update on public.campaigns
  for each row execute procedure extensions.moddatetime (updated_at);

drop trigger if exists set_campaign_variants_updated_at on public.campaign_variants;
create trigger set_campaign_variants_updated_at
  before update on public.campaign_variants
  for each row execute procedure extensions.moddatetime (updated_at);

-- ------------------------------------------------------------------
-- Row Level Security
-- Campaign/send/event data is dashboard-only: enable RLS and add NO policies,
-- so the anon/public key can neither read nor write. The service-role key
-- (server-only admin client) bypasses RLS for the send pipeline + dashboard.
-- subscribers keeps its existing "public insert" policy from schema.sql; no
-- select/update policy is added here, so confirm/unsubscribe run server-side.
-- ------------------------------------------------------------------
alter table public.campaigns enable row level security;
alter table public.campaign_variants enable row level security;
alter table public.sends enable row level security;
alter table public.email_events enable row level security;

-- ------------------------------------------------------------------
-- Per-variant rollup — the "what's working" view (service-role reads only).
-- ------------------------------------------------------------------
create or replace view public.campaign_variant_stats as
select
  v.campaign_id,
  v.id as variant_id,
  v.label,
  v.subject,
  count(distinct s.id) as sent,
  count(distinct e.subscriber_id) filter (where e.type = 'open') as opens,
  count(distinct e.subscriber_id) filter (where e.type = 'click') as clicks,
  count(distinct e.subscriber_id) filter (where e.type = 'unsubscribe') as unsubs,
  count(distinct e.subscriber_id) filter (where e.type in ('bounce', 'complaint')) as problems
from public.campaign_variants v
left join public.sends s on s.variant_id = v.id
left join public.email_events e on e.variant_id = v.id
group by v.campaign_id, v.id, v.label, v.subject;
