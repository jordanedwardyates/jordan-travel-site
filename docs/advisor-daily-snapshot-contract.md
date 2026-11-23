# Advisor daily workload snapshots — implementation contract

Status: design contract only; no production persistence or outreach enabled.

## Objective
Preserve daily aggregate queue counts so the advisor can distinguish new prospect reviews, existing-booking repricing reviews, and verification holds. Never interpret a declining count as a completed sale.

## Snapshot shape (version 1)
- `snapshot_date`: ISO calendar date in America/New_York (unique per day).
- `schema_version`: integer 1.
- `prospect_review_count`: nonnegative integer.
- `service_repricing_count`: nonnegative integer.
- `verification_hold_count`: nonnegative integer.
- `total_count`: exact sum of the three counts.
- `outreach_authorized`: always false.
- `live_supplier_pricing_verified`: always false.
- `generated_at`: UTC timestamp.
- `source_revision`: code revision identifier, not a client identifier.

## Security and storage
- Generate counts server-side from the already authorized read-only queue; do not expose service-role credentials to the browser.
- Store only aggregate counts; prohibit names, emails, booking IDs, quote IDs, free-text notes, fare details, or serialized queue entries.
- Use an idempotent upsert keyed on (`snapshot_date`, `schema_version`) after the day's queue calculation; do not write on each dashboard page view.
- Restrict database read/write to an appropriate server-side role; no anonymous access. Do not implement while the repository privacy/history blocker is unresolved.
- Retain 90 days initially, subject to business requirements; log failures without sensitive payloads.

## UI semantics
- Display today's counts, prior available snapshot date, and signed deltas.
- If yesterday is missing, label comparison as 'since last available snapshot', not 'since yesterday'.
- Show 'no baseline yet' for the first snapshot; never fabricate zero baseline.
- Display data freshness (`generated_at`) and warn when today's snapshot is missing.
- Label all cards 'advisor review only'; do not provide an automated send action.
- Distinguish quote-review counts from booked-client repricing; neither is proof of live availability or savings.

## Acceptance checks
1. Zero counts produce a valid snapshot.
2. Negative, fractional, NaN, or inconsistent totals are rejected.
3. Re-running the daily job does not create duplicate rows.
4. Missing prior snapshot returns no fabricated delta.
5. A 2-day gap uses 'since last available snapshot'.
6. Malformed or unsafe flags are rejected before persistence.
7. Serialized records contain no client-identifying fields.
8. Database errors do not trigger client outreach or overwrite a valid prior snapshot.
9. Date boundaries use America/New_York, including DST transitions.
10. Integration tests use synthetic queue fixtures and an isolated database.

## Release gate
Keep PR #8 draft. Before deploying: resolve issue #10 (public repository and historical exposure), verify CI and full app checks, confirm server-only secrets and authenticated access. This document does not certify those checks as complete.
