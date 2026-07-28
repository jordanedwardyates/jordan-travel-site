# STAMPED email mockups

Brand-accurate HTML mockups for **STAMPED: The Weekly Edit**. Built to the
same identity as the site (cream paper, ink, non-metallic gold rule, small-caps
kickers, the postmark motif) and coded email-client-safe: table layout, inline
styles, 600px width, Georgia serif with sans fallbacks, hidden preheader text.

| File | What it is | What it tests |
|---|---|---|
| `confirm.html` | Double opt-in confirmation | — (transactional; required by the system) |
| `weekly-edit-variant-a-letter.html` | Issue layout **A — "The Letter"** | Editorial prose, one hero fare, single CTA |
| `weekly-edit-variant-b-edit.html` | Issue layout **B — "The Edit"** | Scannable, three fare cards, per-fare CTA |

A and B are the two A/B arms for the weekly issue. Same masthead and footer;
the body layout is the variable under test. See
`../../docs/email-marketing-architecture.md` for how variants are assigned,
sent, and scored.

## Sample vs. merge fields

The fares, prices, dates, and issue number shown are **placeholder sample
content** so the mockups render as finished designs. In production each becomes
a merge field, listed in the comment block at the top of each file — e.g.
`{{first_name}}`, `{{issue_no}}`, `{{issue_date}}`, the per-fare loop
(`{{region}} {{ship}} {{dates}} {{their_price}} {{your_price}} {{take}} {{url}}`),
and the required `{{unsubscribe_url}}` / `{{manage_url}}` / `{{confirm_url}}`.

## Before sending for real

- Footer mailing address is filled in (CAN-SPAM requires a physical address) — done.
- Wire `{{unsubscribe_url}}` to one-click unsubscribe + the `List-Unsubscribe`
  header.
- Send from the dedicated subdomain with SPF/DKIM/DMARC configured.
- Test-render across clients (Gmail, Apple Mail, Outlook) before the first blast.
