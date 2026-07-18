# Transactional emails — quote request

Quick example pair showing what fires alongside `submitQuoteRequest()` in
`src/app/actions.ts`, which today only inserts into `quote_requests` and
shows a client-side success state — no email actually goes out yet.

Two files, one event:

| File | To | Purpose |
|---|---|---|
| `quote-request-received.html` | the client | On-brand confirmation — reassures them the note was read, sets the one-business-day expectation. |
| `quote-request-internal-notify.html` | Jordan | Plain working notice with the full submission, so it doesn't require checking Supabase. |

## Merge fields

Both pull straight from the existing form fields in `actions.ts`:
`{{name}}` `{{email}}` `{{phone}}` `{{journey_label}}` `{{message}}`

`{{phone}}` and `{{journey_label}}` are optional there — the client email
drops the journey line entirely when absent; the internal one renders
"Not provided" instead, since it's a working doc, not a polished read.

## Wiring (not built yet)

`submitQuoteRequest()` would send both after a successful insert — same
ESP as STAMPED (`../stamped/`), just triggered by form submission instead
of a weekly send run.
