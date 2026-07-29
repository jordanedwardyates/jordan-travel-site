# Jordan Yates — Luxury Cruise Travel Site

Marketing/editorial website for Jordan Yates' cruise-focused travel agency.
The identity system lives in the Brand Bible:
`~/Library/Mobile Documents/com~apple~CloudDocs/BRAND BIBLE/BRAND BIBLE.md`

**Naming rule:** "The Aegean Passport" is the Brand Bible's internal working
name — inspiration only, NOT a brand. It must never appear in published
output: no page copy, titles, metadata, share images, or stamp text. The public
identity is "BON V: A Travel Company" / "Jordan Yates · Luxury Voyage Advisor". (Internal code
tokens like `--aegean-ink` and code comments are fine.)

## What this site is

A boutique European publishing house — luxury editorial. Think Aman, Belmond,
Monocle, Kinfolk, vintage National Geographic.

**Not** a booking engine, cruise agency, or Expedia. No palm trees, airplanes,
cruise ships, suitcases, cocktails, or beach-chair iconography. No tropical or
influencer aesthetics.

## Brand essentials

- Evokes: Greek islands, old passports, maritime charts, vintage yacht clubs,
  letterpress, passport stamps, antique engravings. Quiet confidence.
- Voice: advisor, explorer, curator — never salesman. Well-read, calm, warm.
  Luxury implied, never announced.
- Everything should feel printed and slightly worn — never glossy, plastic,
  or "startup minimalism."
- Gold (`--compass-gold`) must never look metallic.
- Color tokens are defined in `src/app/globals.css` (Tailwind v4 `@theme`).
  Use those tokens; do not invent new colors.
- Default surface is cream paper (`--vintage-passport`) with ink text
  (`--deep-harbor`). There is deliberately no dark mode — paper doesn't invert.

## Stack

- Next.js 15 (App Router, `src/` dir), TypeScript, Tailwind CSS v4, npm
- Supabase: four clients in `src/lib/supabase/` — pick deliberately:
  - `public.ts` — anon, cookie-free. **The only client for public reads.**
    RLS is what makes a read safe; this client is subject to it.
  - `admin.ts` — service role, **bypasses RLS**. Internal desks + server-side
    lookups only. Never import into a Client Component or a public read path.
  - `client.ts` (browser) / `server.ts` (RSC/actions) — cookie-based, legacy.
  - Env vars in `.env.local` (see `.env.local.example`).
- Deploys to Vercel (production = `main`; pushing `main` deploys).

## Quote capture → curate → publish

The core model, and the thing to keep straight: **capture every quote, publish
only a chosen few, curate by hand.** Nothing a client is quoted appears on the
public site until Jordan explicitly approves and features it.

**Data model** (live Supabase; `supabase/schema.sql` mirrors it — keep it in
sync when you change the DB). A quote decomposes into normalized rows:
`voyages` → `accommodations` → `price_offers` (the fares), grouped by
`quote_packages`/`quote_items`. `homepage_features` is the front-page selection.

**Three publish gates, each enforced by an RLS policy** (so the gate is the
database, not the UI — the anon client physically cannot read past them):
1. `voyages.website_status = 'approved'` — sailing allowed on the site at all
   (plus `source_status = 'trusted'`).
2. `price_offers.website_approved = true` — this specific fare is safe to show.
3. `homepage_features.active = true` — currently on the front page
   (auto-expires via `hard_expires_at`; `review_on` drives the reminder).

**Where it lives:**
- `src/lib/data/curation.ts` — the whole layer. `listCuratedVoyages()` (admin,
  internal) sees everything; `getFeaturedJourneys()` (anon, via the
  `website_featured_voyages` view) is the public read. `blockersFor()` is the
  single source of truth for "why can't this be featured yet."
- `/internal/quotes` (`src/app/internal/quotes/`) — the curation desk Jordan
  uses. Server actions in its `actions.ts` **re-check the token** (`?key=`), since
  a server action is a public endpoint the page's own gate doesn't cover.
- `src/app/page.tsx` — homepage renders curated features first, then falls back
  to legacy `journeys` so the section never runs dry.
- `/api/cron/curation-review` (weekly, `vercel.json`) — emails Jordan when a
  feature is due for review, expiring, or when nothing is featured.

**Attribution:** the quote form (`src/app/actions.ts` + `QuoteRequestForm.tsx`)
captures `utm_campaign`/`utm_content` off the landing URL and resolves them to
`source_campaign_id`/`voyage_id`, closing the email→click→quote loop the
Dispatch webhook (`/api/webhooks/resend`) starts.

**Internal pages** (`/internal/*`) are token-gated (`?key=<INTERNAL_PREVIEW_TOKEN>`)
and noindexed; the gate is bypassed in development.

**When curating against live data, remember it IS live** — approving/featuring
writes to production. Revert test writes, or leave real selections to Jordan.

## Commands

- `npm run dev` — dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint

Note: `node`/`npm` are not on the non-interactive shell PATH on this machine —
use `/opt/homebrew/bin/node` and `/opt/homebrew/bin/npm` (or export
`PATH="/opt/homebrew/bin:$PATH"` first).
