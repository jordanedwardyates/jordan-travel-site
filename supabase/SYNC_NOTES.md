# Future one-way sync: Supabase → Google Sheets

Status: **design note only — not built.** Supabase is the sole source of
truth for journeys, quote requests, subscribers, and future site data.
Google Sheets is a secondary reporting/reference layer. Nothing writes
back from Sheets to Supabase, ever.

## Why the schema is already sync-ready

Every table has a stable `id` (UUID primary key) and an `updated_at`
timestamp maintained by trigger. That pair is all an incremental sync
needs: `id` keys the row in the Sheet (no duplicates), `updated_at`
tells the sync which rows changed since the last run.

## Recommended shape (when the time comes)

1. **Source endpoint** — a secure server-side reader; either:
   - a Supabase **Edge Function** using the service-role key, or
   - a route handler in the Next.js app (server-only, secret-protected).
   It accepts `?since=<timestamp>` and returns rows where
   `updated_at > since`, ordered by `updated_at`. It must require a
   shared secret (header token); quote requests and subscribers are
   private and must never be readable without it.
2. **Consumer** — a **Google Apps Script** bound to the spreadsheet,
   running on a time-driven trigger (e.g. every 30–60 minutes). It:
   - reads the last sync watermark from a hidden metadata cell,
   - calls the endpoint with `since=<watermark>`,
   - upserts each row into the sheet keyed by the `id` column
     (update the matching row if the id exists, append if not),
   - writes the new watermark (max `updated_at` received).
3. **Tabs** — one per table (`journeys`, `quote_requests`,
   `subscribers`). Column 1 is always `id`.

## Guardrails

- One-way only. The Sheet is disposable; Supabase is not.
- The endpoint's secret and the service-role key live server-side only
  (never `NEXT_PUBLIC_`, never in Apps Script properties shared beyond
  the owner account).
- Deletions: rows deleted in Supabase simply stop updating in the
  Sheet. If tombstones matter later, add a `deleted_at` column rather
  than hard-deleting.
