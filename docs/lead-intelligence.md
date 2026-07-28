# Lead intelligence — capture, normalize, own

Two goals, one system:

1. **Ownership.** The instant a visitor identifies themselves (quote request
   or STAMPED signup), get them into Jordan's *own* HubSpot — before the host
   agency's team can see the signup on luxurycruiseconnections.com and reach
   out first. The ownership window is measured in seconds, not the hours it
   takes to notice a Supabase row.
2. **Signal.** Know *what they were looking at* — but rolled up into buckets
   worth acting on. Not "she looked at a Croatian cruise," but
   **"Mediterranean · Autumn · $5k–$10k."**

## The normalization layer — `src/lib/taxonomy.ts`

The crux. Raw site data is specific and messy: a journey's `region` is free
text (`"The Adriatic"`, `"Greece & Turkey"`, `"The Danube"`), `dates` are a
human string (`"3–10 Oct 2026"`), price a label (`"$9,800"`). Pure functions
collapse that into three macro buckets:

| Raw | Normalized |
|---|---|
| The Adriatic / Greece & Turkey / Dubrovnik | **Mediterranean** |
| The Norwegian Fjords / Baltic | **Northern Europe & Fjords** |
| The Danube / Rhine | **European Rivers** |
| `"3–10 Oct 2026"` | season **Autumn** |
| `"$9,800"` | **$5k–$10k** |

`summarizeInterest()` frequency-ranks a visitor's views into one profile, so
three Adriatic views and one fjord view read as Mediterranean-leaning.
Unit-tested (29 assertions, `npm test`) — this is the piece that must be right.

## The event log — `supabase/migrations/0003_site_events.sql`

`site_events` records one row per journey/destination view, with the region /
season / price **already normalized at write time**. Anonymous per-browser
`visitor_id` (httpOnly cookie); `email` is null until the visitor submits a
form, at which point their whole prior session is stitched to their address.

Service-role only (RLS on, no public policies) — writes go through
`/api/track` and the form actions, never the browser directly.

## Flow

```
journey/destination page
   └─ <TrackView> beacon ──POST /api/track──► resolve region/dates/price
                                              by slug (server-side, unspoofable)
                                              └─ recordView() → site_events
                                                 (macro_region, season, price_band)

quote form / STAMPED signup (server action)
   ├─ identifyVisitor(visitorId, email)  → stitch anon history to email
   ├─ getVisitorInterest(visitorId)      → "Mediterranean · Autumn · $5k–$10k"
   ├─ notify email (adds a "Browsing" row for Jordan)
   └─ upsertContact() ──► HubSpot: contact, keyed on email
                                    (message field carries source + interest)
```

## Configuration

Both external hops are **inert until configured**, same pattern as Resend.

### HubSpot — no admin rights required

`upsertContact()` auto-selects its transport, in this order:

1. **Forms Submissions API** (`HUBSPOT_PORTAL_ID` + `HUBSPOT_FORM_GUID`) — no
   token, no auth header, works on any ordinary HubSpot seat. This is the
   path for a portal owned/administered by someone else (e.g. a host
   agency), where Super Admin to create a Private App isn't available.
   Get both IDs from a form's embed code: Marketing → Forms → create a form
   with email / first name / last name / phone / message → Share → Embed
   code. (If Forms isn't in your left nav at all, your seat likely doesn't
   have Marketing tool access — ask whoever administers the portal to
   create the form for you, or to grant that access.)
2. **CRM v3 Private App token** (`HUBSPOT_PRIVATE_APP_TOKEN`) — used only if
   the two vars above aren't set. Requires Super Admin to create
   (Settings → Integrations → Private Apps), scope
   `crm.objects.contacts` read+write. Upgrade path if that access is ever
   granted; not required today.

If neither is configured, `upsertContact` logs a warning and no-ops — pages
never break.

### Supabase

`site_events` needs migration `0003` applied and `SUPABASE_SERVICE_ROLE_KEY`
present (already used elsewhere). Until then, tracking fails soft — pages
never break.

## Privacy posture

- `visitor_id` is a first-party, httpOnly, anonymous id — no cross-site
  tracking, no PII until the person volunteers it via a form.
- `<TrackView>` honours `navigator.doNotTrack`.
- All event data lives in Jordan's own Supabase; HubSpot receives only the
  contact + a context note, on identification.

## Not built yet

- A dashboard view over `visitor_interest` (the rollup view exists; no UI).
- De-anonymizing return visits across devices (only same-browser stitching).
- HubSpot custom properties — interest currently rides in the built-in
  `message` field so nothing needs configuring in the portal first (and the
  Forms API path can't write custom properties anyway); promoting it to a
  real property is a later refinement, available once the Private App
  upgrade path is in use.
