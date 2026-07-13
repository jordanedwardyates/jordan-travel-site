# The Aegean Passport — Jordan Yates Luxury Travel

Marketing/editorial website for Jordan Yates' luxury travel company. The full
identity system lives in the Brand Bible:
`~/Library/Mobile Documents/com~apple~CloudDocs/BRAND BIBLE/BRAND BIBLE.md`

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
- Supabase: clients in `src/lib/supabase/` (`client.ts` browser,
  `server.ts` RSC/actions). Env vars in `.env.local`
  (see `.env.local.example`).
- Deploys to Vercel.

## Commands

- `npm run dev` — dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint

Note: `node`/`npm` are not on the non-interactive shell PATH on this machine —
use `/opt/homebrew/bin/node` and `/opt/homebrew/bin/npm` (or export
`PATH="/opt/homebrew/bin:$PATH"` first).
