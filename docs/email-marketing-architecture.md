# Email Marketing System — Architecture

**Product:** STAMPED: The Weekly Edit — the weekly negotiated-fares letter.
**Date:** 2026-07-18
**Status:** Design + mockups. Data model drafted; send pipeline scaffolded, not
yet wired (needs an ESP key + domain auth — see §7).

---

## 1. Goals

1. **Own the list and the data.** Subscribers, sends, and engagement events all
   live in our Supabase — not locked inside a third-party tool. This is what
   lets us *test what's working*.
2. **Test what's working.** Every issue can run an A/B split (subject line
   and/or layout). We measure open rate, click rate, and unsubscribe rate per
   variant and keep a running record.
3. **Protect the brand and the inbox.** Double opt-in, clean deliverability
   (SPF/DKIM/DMARC), one-click unsubscribe, and a letter that reads like the
   site — printed, warm, advisor-not-salesman.

Non-goals (for now): drip automations, segmentation beyond source, a visual
drag-and-drop builder. Templates are code, reviewed like the rest of the site.

---

## 2. The pieces

```
  Site signup form ──► subscribeToDispatch (server action)
        │                      │  insert status='pending'
        │                      ▼
        │              Supabase: subscribers
        │                      │  send confirm email (double opt-in)
        │                      ▼
        │              /api/email/confirm?token=…  ──► status='confirmed'
        │
  Author an issue ──► campaigns + campaign_variants (draft)
        │
  Send run (cron/manual) ──► pick recipients, assign variants,
        │                     render + send via ESP, write `sends`
        │
  ESP webhook ──► /api/email/webhook ──► email_events
        │                                 (delivered/open/click/bounce/complaint)
        ▼
  Dashboard (/internal) ──► per-variant open %, click %, unsub %  ──► winner
```

- **Capture** — the existing `EmailSignupForm` + `subscribeToDispatch` action.
  One change: new signups become `pending` and get a confirmation email.
- **Store** — Supabase is the source of truth (matches the rest of the site).
- **Author** — an issue is a `campaign` with one or two `campaign_variants`.
  Variant bodies are HTML built from the templates in `emails/stamped/`.
- **Send** — a server route/cron selects confirmed subscribers, assigns each a
  variant, renders the HTML with per-recipient merge fields + tracking, hands
  it to the ESP, and records a `sends` row.
- **Measure** — the ESP posts engagement events to a webhook; we store them in
  `email_events` and roll them up per variant.

---

## 3. Data model

See `supabase/migrations/0002_email_marketing.sql` for the exact DDL. Summary:

| Table | Purpose | Key columns |
|---|---|---|
| `subscribers` *(extended)* | the list | `status` (pending/confirmed/unsubscribed/cleaned), `confirmation_token`, `confirmed_at`, `unsubscribe_token`, `unsubscribed_at`, `source` |
| `campaigns` | one weekly issue | `status` (draft/scheduled/sending/sent), `scheduled_for`, `sample_pct`, `winner_metric`, `winner_variant_id`, `sent_at` |
| `campaign_variants` | an A/B arm | `label` ('A'/'B'), `subject`, `preview_text`, `html_body`, `weight` |
| `sends` | one row per recipient per issue | `campaign_id`, `variant_id`, `subscriber_id`, `status`, `provider_message_id`, unique(campaign_id, subscriber_id) |
| `email_events` | engagement log | `send_id`, `type` (delivered/open/click/bounce/complaint/unsubscribe), `url`, `occurred_at`, `meta` |

**RLS:** all new tables are service-role only — no `anon` policies, so the
public key can't read them (same posture as `quote_requests`). The site keeps
its single existing public capability: insert a `pending` subscriber.

---

## 4. Subscriber lifecycle (double opt-in)

`pending` → (clicks confirm) → `confirmed` → (clicks unsubscribe) →
`unsubscribed`. Hard bounces/complaints move a subscriber to `cleaned`.

Only `confirmed` subscribers ever receive an issue. Double opt-in costs a few
signups up front but is the single biggest lever on deliverability and list
quality — it keeps spam-traps and typo'd addresses off the list, which keeps us
out of spam folders for everyone else.

The confirm and unsubscribe links carry opaque per-subscriber UUID tokens
(already on the row), so no email address is ever exposed in a URL.

---

## 5. A/B testing — how "what's working" gets measured

Two modes, same machinery:

- **Straight split** (default for a small list): recipients are randomly
  assigned 50/50 to variant A or B. After the issue settles (~24–48h), the
  dashboard shows open %, click %, and unsub % per variant. Winner is recorded
  on the campaign for the running log.
- **Champion/challenger** (once the list is larger): send A and B to a
  `sample_pct` slice (e.g. 20%), wait a few hours, then send the higher-scoring
  variant to the remaining 80% automatically.

What we vary, one thing at a time so the result is legible:
- **Subject line + preview text** (biggest lever on open rate)
- **Layout** — "The Letter" (editorial prose, one hero fare) vs. "The Edit"
  (three structured fare cards). Both mockups are built.
- **CTA** — single "See the sailing" vs. per-fare buttons.

Metrics per variant: **open rate** (tracking pixel), **CTR** and
**click-to-open** (wrapped links), **unsubscribe rate**, **bounce/complaint
rate**. Opens are directional only (Apple Mail Privacy inflates them) — we
weight clicks and unsubs more heavily when picking a winner.

---

## 6. Deliverability & compliance (non-negotiable)

- **Dedicated sending subdomain** — send from `post.bonvtravelcompany.com` (or
  similar), not the root domain, so newsletter reputation is isolated from
  Jordan's personal/root mail.
- **Domain auth** — SPF, DKIM, and a DMARC record on the sending domain.
- **List-Unsubscribe header** + one-click unsubscribe (RFC 8058), plus a
  visible unsubscribe link in every footer.
- **CAN-SPAM** — accurate From/Subject, a physical mailing address in the
  footer, honor unsubscribes promptly (we do it instantly), suppression list.
- **Warm-up** — start with the most engaged/most recent signups; grow volume
  gradually so a cold domain doesn't trip spam filters.

---

## 7. ESP choice

Recommendation: **Resend**. It fits this stack cleanly (Next.js/Vercel/Supabase,
simple API, React Email support, delivery + open/click/bounce/complaint
webhooks, easy domain auth). We keep all subscriber/engagement data in Supabase;
Resend is just the delivery pipe, so we're never locked in.

Alternatives considered:
- **Postmark** — excellent deliverability; less newsletter-oriented tooling.
- **Loops / Beehiiv** — no-code, faster to launch, but the data lives in *their*
  tool, which undercuts goal #1 (owning the data to test freely). Good fallback
  if Jordan would rather not maintain code.

To go live we need: (a) an ESP account + API key (`RESEND_API_KEY`), (b) the
sending subdomain verified with DNS records, (c) a webhook secret. All are
server-only env vars; none touch the browser bundle.

---

## 8. What's in this changeset

- `supabase/migrations/0002_email_marketing.sql` — the data model above,
  safe-to-re-run, applied via the Supabase SQL editor (matches existing flow).
- `emails/stamped/` — three brand-accurate HTML mockups (see that folder's
  README): the confirm email, and the two STAMPED layouts (A "The Letter",
  B "The Edit").
- A preview gallery (Artifact) to view all three side by side with the A/B
  notes.

## 9. Build order (proposed)

1. **Data model** — apply the migration. *(this changeset)*
2. **Double opt-in** — update `subscribeToDispatch` to `pending`; add
   `/api/email/confirm` + a confirm-email send. Add unsubscribe route.
3. **Templates** — port the mockups to a render function with merge fields
   (`first_name`, `unsubscribe_url`, fares…).
4. **Send run** — a route/cron that assigns variants, renders, sends, records.
5. **Webhook + dashboard** — ingest events; add a panel under `/internal`.

Steps 2–5 each need the ESP key/domain from §7. Everything before that is
buildable and reviewable now.
