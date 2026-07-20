import { createAdminClient } from "@/lib/supabase/admin";

export async function runMigrations() {
  const admin = createAdminClient();
  const migrationSQL = `
    -- Visitor profiles: anonymous cookie-based tracking
    create table if not exists public.visitor_profiles (
      id uuid primary key,
      created_at timestamptz not null default now(),
      last_seen_at timestamptz not null default now(),
      visit_count int not null default 1
    );

    alter table if exists public.visitor_profiles enable row level security;

    drop policy if exists "anon_insert_visitor" on public.visitor_profiles;
    drop policy if exists "anon_update_own_visitor" on public.visitor_profiles;
    drop policy if exists "anon_select_own_visitor" on public.visitor_profiles;

    create policy "anon_insert_visitor" on public.visitor_profiles
      for insert to anon with check (true);

    create policy "anon_update_own_visitor" on public.visitor_profiles
      for update to anon using (true) with check (true);

    create policy "anon_select_own_visitor" on public.visitor_profiles
      for select to anon using (true);

    -- Visitor events: page views, journey clicks, interest signals
    create table if not exists public.visitor_events (
      id uuid primary key default gen_random_uuid(),
      visitor_id uuid not null references public.visitor_profiles(id) on delete cascade,
      created_at timestamptz not null default now(),
      event_type text not null check (event_type in ('page_view', 'journey_view', 'region_interest', 'quote_start')),
      journey_id uuid references public.journeys(id) on delete set null,
      metadata jsonb not null default '{}'::jsonb
    );

    alter table if exists public.visitor_events enable row level security;

    drop policy if exists "anon_insert_event" on public.visitor_events;
    drop policy if exists "anon_select_own_events" on public.visitor_events;

    create policy "anon_insert_event" on public.visitor_events
      for insert to anon with check (true);

    create policy "anon_select_own_events" on public.visitor_events
      for select to anon using (true);

    create index if not exists idx_visitor_events_visitor_id on public.visitor_events(visitor_id);
    create index if not exists idx_visitor_events_type_journey on public.visitor_events(event_type, journey_id) where journey_id is not null;
    create index if not exists idx_visitor_events_created on public.visitor_events(created_at desc);
  `;

  try {
    const { error } = await admin.rpc("exec", { sql: migrationSQL });
    if (error) throw error;
    console.log("Visitor tracking migration applied successfully");
  } catch (err) {
    console.error("Migration error:", err);
    throw err;
  }
}
