# Visitor Interest Capture & Recommendation System

## Overview

This system captures anonymous visitor interests and automatically recommends recent quotes that match their browsing behavior.

## What It Does

1. **Visitor Identification**: Creates an anonymous visitor ID via first-party cookie (no PII)
2. **Event Tracking**: Logs page views and journey clicks
3. **Interest Detection**: Analyzes region interest from browsing patterns
4. **Recommendations**: Shows personalized "Charted for You" section with matching journeys

## Database Setup

The system requires two new tables in Supabase:

### 1. `visitor_profiles`
Stores anonymous visitor records:
- `id` (uuid, primary key) — anonymous visitor ID
- `created_at` (timestamptz) — first visit
- `last_seen_at` (timestamptz) — most recent activity
- `visit_count` (int) — number of visits

### 2. `visitor_events`
Logs visitor interactions:
- `id` (uuid, primary key) — event record ID
- `visitor_id` (uuid, FK) — links to visitor_profiles
- `created_at` (timestamptz) — when the event occurred
- `event_type` (text) — 'page_view' | 'journey_view' | 'region_interest' | 'quote_start'
- `journey_id` (uuid, FK, nullable) — relevant journey if applicable
- `metadata` (jsonb) — flexible data (e.g., region, pathname)

## Applying the Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to Supabase dashboard → SQL Editor
2. Create a new query and paste the SQL from `supabase/migrations/20260720025138_create_visitor_tracking.sql`
3. Execute the query
4. Verify both tables were created

### Option 2: Via Supabase CLI (if available locally)

```bash
supabase migration up
```

## How It Works

### On the Frontend

1. **useVisitor Hook** (`src/hooks/useVisitor.ts`):
   - Generates or retrieves anonymous visitor ID from cookie
   - Initializes visitor profile on first visit
   - Logs page view events
   - Tracks journey clicks via data attributes

2. **JourneyCard Attributes**:
   - Added `data-journey-id` and `data-region` to track which journeys users view
   - Click tracking is automatic through the hook

3. **ChartedForYou Component** (`src/components/ChartedForYou.tsx`):
   - Displays personalized journey recommendations
   - Only shows if visitor has history (no spam on first visit)
   - Fetches top 2 recommendations based on interest match

### On the Backend

1. **Server Actions** (`src/app/visitor-actions.ts`):
   - `ensureVisitorProfile()` — Creates/updates visitor record
   - `logVisitorEvent()` — Logs interactions
   - `getVisitorRecommendations()` — Queries matching journeys

## Client-Side Cookie

```
visitor_id=<uuid>; Path=/; Max-Age=31536000; Secure; SameSite=Lax
```

- Expires after 1 year of inactivity
- Secure (HTTPS only)
- SameSite=Lax (prevents some CSRF)
- No PII contained

## Recommendation Algorithm

1. Fetches visitor's recent events (last 20 interactions)
2. Extracts:
   - Set of regions the visitor has shown interest in
   - Set of journeys already viewed
3. Queries published journeys matching those regions
4. Filters out already-viewed journeys
5. Prioritizes featured journeys by recency
6. Returns top N matches

## Privacy & Compliance

- ✅ No PII collected
- ✅ Anonymous cookie-based tracking
- ✅ Supabase RLS policies enforce anon access only
- ✅ Users can delete their data by clearing cookies
- ✅ Consider adding privacy policy disclosure

## Row-Level Security (RLS)

All tables use RLS with policies allowing only `anon` role to:
- Insert their own visitor records
- Update their own visitor records
- Select their own event records
- Insert event records

## Testing

### Manual Testing

1. Start dev server: `npm run dev`
2. Open browser DevTools → Application → Cookies
3. Verify `visitor_id` cookie is set
4. Navigate to a journey card
5. Check Supabase: should see visitor_profiles and visitor_events records
6. Reload homepage → "Charted for You" section should appear if recommendations match

### Checking Data in Supabase

```sql
-- View visitor profiles
SELECT id, created_at, visit_count FROM public.visitor_profiles;

-- View recent events
SELECT visitor_id, event_type, journey_id, created_at 
FROM public.visitor_events 
ORDER BY created_at DESC 
LIMIT 20;

-- View events for a specific visitor
SELECT * FROM public.visitor_events 
WHERE visitor_id = '<visitor-id>' 
ORDER BY created_at DESC;
```

## Troubleshooting

### "Charted for You" section not showing

1. **Check visitor profile exists**: Query `visitor_profiles` table
2. **Check events logged**: Query `visitor_events` for that visitor
3. **Check region matches**: Ensure events have region metadata
4. **Check published journeys**: Ensure journeys exist with matching regions and `is_published=true`

### Events not being logged

1. Check browser console for errors in `useVisitor` hook
2. Verify Supabase is accessible (check network tab)
3. Check RLS policies allow anon inserts to visitor_events

### Cookie not persisting

1. Ensure site is HTTPS (or localhost with development settings)
2. Check browser allows third-party cookies
3. Verify SameSite policy compatibility with your setup

## Future Enhancements

- Add event aggregation for faster queries (materialized view)
- Implement A/B testing: show different recommendation algorithms to segments
- Add "recently viewed" section using visitor events
- Build admin dashboard to monitor visitor interest trends
- Add email capture with "See more recommendations" CTA
