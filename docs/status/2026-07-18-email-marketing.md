# Email Marketing System — What Was Just Completed

**Date:** 2026-07-18
**Branch:** `claude/bonv-travel-website-ccayo6`
**Commit:** `ce5a8fa` — "Architect email marketing system + STAMPED mockups"
**PR:** [#4](https://github.com/jordanedwardyates/jordan-travel-site/pull/4)

---

## The ask

Architect a new email marketing system for **STAMPED: The Weekly Edit** (the
negotiated-fares letter already referenced on the homepage), so we can start
A/B testing what actually works, and build a few brand-accurate mockups.

## What was delivered

### 1. System architecture
`docs/email-marketing-architecture.md` — the full design:

- **Pipeline:** signup → double opt-in (`pending` → `confirmed`) → issue
  authored as a campaign with 1–2 variants → send run assigns/renders/sends →
  ESP webhook logs engagement → dashboard rolls it up per variant.
- **Why double opt-in:** biggest single lever on deliverability — keeps
  spam-traps and typos off the list, protects the sender's reputation.
- **A/B testing:** straight 50/50 split now; champion/challenger (send to a
  sample, auto-send the winner to the rest) once the list is bigger. We vary
  one thing at a time — subject/preview, layout, or CTA — and score by open
  rate, click rate, and unsubscribe rate (clicks/unsubs weighted over opens,
  since Apple Mail inflates opens).
- **Deliverability & compliance:** dedicated sending subdomain, SPF/DKIM/DMARC,
  one-click unsubscribe + `List-Unsubscribe` header, CAN-SPAM mailing address,
  suppression list, gradual volume warm-up.
- **ESP recommendation: Resend.** Fits the Next.js/Vercel/Supabase stack; all
  subscriber and engagement data still lives in *our* Supabase, so we're never
  locked into a vendor's data silo (that was the whole point of "own the
  data so we can test freely").
- **Phased build order** so we know exactly what's shippable now vs. blocked
  on an ESP account: data model → double opt-in → templates → send run →
  webhook + dashboard.

### 2. Data model
`supabase/migrations/0002_email_marketing.sql` — extends the existing
`subscribers` table (adds `status`, confirm/unsubscribe tokens) and adds:

| Table | Purpose |
|---|---|
| `campaigns` | one weekly issue |
| `campaign_variants` | an A/B arm (subject, preview text, HTML body, weight) |
| `sends` | one row per subscriber per issue (the assignment + delivery record) |
| `email_events` | the engagement log (delivered/open/click/bounce/complaint/unsubscribe) |
| `campaign_variant_stats` (view) | the "what's working" rollup — opens/clicks/unsubs per variant |

All new tables are **dashboard-only** (RLS enabled, no public policies) — same
security posture as `quote_requests`. Safe to re-run.

### 3. Three brand-accurate mockups
`emails/stamped/` — coded email-client-safe (table layout, inline styles,
600px, Georgia serif with fallbacks):

- **`confirm.html`** — the double opt-in confirmation email
- **`weekly-edit-variant-a-letter.html`** — **Arm A, "The Letter"**: one hero
  fare, editorial prose, single CTA, reads like a personal note from Jordan
- **`weekly-edit-variant-b-edit.html`** — **Arm B, "The Edit"**: three
  scannable fare cards, one CTA each

Both variants share the site's identity — cream paper, ink, the non-metallic
gold rule, the first-class postmark motif — and are the two arms we'd put
head-to-head first (layout is usually the highest-leverage thing to test after
subject line).

**Live proof sheet (rendered, not just source):**
https://claude.ai/code/artifact/6812d885-8f78-46be-bae2-c56a721d3dba

### 4. Honest caveats
- Fares/prices in the mockups are **placeholder sample content** — in
  production they become merge fields pulled from the journeys data.
- **No send pipeline is wired yet.** That requires an ESP account key and a
  verified sending subdomain — everything up to that point is buildable and
  reviewable now.

---

## Suggested next step

Pick the ESP (Resend recommended) and get the sending subdomain verified —
then the double opt-in flow (`subscribeToDispatch` → `pending` + a confirm
route) can be wired in.
