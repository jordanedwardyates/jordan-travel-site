# Advisor Sales Desk — release gate and daily operating procedure
Updated 2026-11-05. Internal implementation guidance; no client personal data.

## Release blockers (all must pass)
1. **Repository privacy:** Confirm the repository is private in GitHub settings. Audit all prior commits, forks, cached artifacts, build logs and PR attachments for client proposals and contact data. Visibility changes do not erase prior exposure; rotate any exposed credentials. Do not deploy while unresolved.
2. **Authentication:** Run `e2e/advisor-sales-auth.spec.ts` against an authenticated preview. Verify unauthenticated requests, invalid Basic credentials and query-string token attempts cannot access the page or its data. Confirm service-role keys never reach client bundles.
3. **Build and regression:** Run `npm ci`, `npm run build`, and the project's configured Playwright test command for `e2e/daily-focus.spec.ts`, `e2e/quote-match.spec.ts`, `e2e/quote-review.spec.ts`, and `e2e/quote-voyage-review.spec.ts`. Record actual command outputs and environment; a committed test is not a passing test.
4. **Data safety:** Verify browser/anonymous roles cannot SELECT internal advisor views. Confirm the advisor page uses server-only access and returns no client data without authentication.
5. **Release approval:** Keep PR #8 draft until the above checks are evidenced and reviewed. No automated client contact or production data mutation is authorized by this dashboard.

## Daily advisor operating sequence
1. **Reservation holds:** Verify hold expiry and supplier inventory before offering any accommodation.
2. **Booking service:** Confirm actual booking status and departure date in the supplier reservation. Review documents, final payment, special requests and dietary needs; a flagged record does not establish an incomplete task.
3. **Near-term proposed departures:** Treat these as sales leads, **not** confirmed bookings. Recheck cruise-line availability, exact sailing, category, fare, terms and final-payment requirements before preparing any follow-up.
4. **New intake:** Distinguish legitimate cruise inquiries from vendors/spam. Verify inquiry source and contact identity before drafting a reply.
5. **Quote reconciliation:** Match identity and voyage independently; record evidence and ambiguities. Do not link records on name alone or assume a historical quote remains available.
6. **Promotion matching:** Only surface a candidate after lifecycle eligibility, identity confidence, supplier offer freshness, voyage compatibility and deduplication checks. Include reasons and mismatches. Booked clients belong in a separate repricing-service lane.
7. **Outreach:** Human reviews every proposed message. No automatic send, no stale price claims and no assumption of consent.

## Evidence to record for each promotion candidate
- Client record key and verified lifecycle (prospect versus booked)
- Source quote IDs, dates, supplier, ship, sailing and accommodation
- Offer source URL, observed date/time, exact travel dates, currency and fare basis
- Supplier verification timestamp and inventory/category status
- Match reasons, mismatch flags, contact confidence and duplicate/cooldown status
- Advisor disposition: verify / draft / defer / reject, with timestamp

## Known open items
- GitHub issue #9 tracks separation of proposed sailings from confirmed booking-service tasks.
- GitHub issue #7 specifies canonical lifecycle and explainable affinity matching.
- PR #8 remains draft pending privacy, full test/build and authenticated preview checks.
- No historical quote price should be described as a live offer without a new supplier check.
