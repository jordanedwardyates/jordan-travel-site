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

## Emails (Resend campaigns, `emails/*.html`)

Built as standalone HTML tables, not React components — see `emails/README.md`
for the campaign log and per-card rules.

**Gmail dark-mode safety (required on every email template):** Gmail runs its
own heuristic color-inversion pass and does **not** honor
`<meta name="color-scheme">` or `supported-color-schemes` the way Apple Mail
and Outlook do. Left undefended, our cream/ink "paper" palette gets flipped
into a muddy dark inversion and the transparent-background signature PNG gets
inverted into a washed negative image. Every template must:
1. Set `bgcolor` HTML attributes on the outer `.paper`/`.weathered`
   tables/cells to match their inline `background-color` — Gmail is less
   likely to flip a background where the legacy attribute and CSS agree.
2. Include a `@media (prefers-color-scheme: dark)` block in `<style>` that
   re-asserts the same light palette with `!important` (catches Gmail's
   iOS/Android apps, which do read the media query even though Gmail webmail
   doesn't).
3. Neutralize image filtering: `img { filter: none !important;
   -webkit-filter: none !important; }`.
4. Keep the signature/stamp image backed by an explicit opaque
   `background-color:#f6f1e8` on its wrapping cell (don't rely on the PNG's
   own transparency to read correctly against an inverted background).

This is the same "paper doesn't invert" principle as the site itself — the
goal is defeating Gmail's inversion, not designing a dark variant.

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
