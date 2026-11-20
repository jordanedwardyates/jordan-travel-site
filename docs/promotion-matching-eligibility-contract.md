# Promotion matching — deterministic eligibility and evidence contract
Updated 2026-11-07. Design specification only; no automated outreach or supplier availability claim.

## Objective
Rank verified, relevant cruise offers against the advisor's existing client intelligence without converting old quotes into current prices or confusing booked passengers with prospects.

## Required inputs
Client: stable internal ID, lifecycle (prospect/hold/booked/cancelled/unknown), contact consent state, preferred destinations, travel dates or flexibility, budget currency, accommodation preferences, verified email identity, last outreach timestamp.
Quote: package ID, client linkage confidence, supplier, ship, embark/disembark dates and ports, category, price and currency, quoted_at, status.
Promotion: supplier name, **official source URL**, captured_at UTC, valid_from/through, eligible sailings and categories, currency, fare basis (per-person double occupancy versus total), inventory verification time, restrictions, combinability, deposit/final-payment terms.

## Hard gates — reject or hold, never silently override
1. Missing verified client linkage => HOLD_IDENTITY. Name-only links cannot authorize contact.
2. Unknown or cancelled lifecycle => HOLD_LIFECYCLE. Booked clients => SERVICE_REPRICE lane, never acquisition outreach.
3. Offer has no official supplier source or validity window => HOLD_SOURCE.
4. Offer is outside validity window, or supplier fare/inventory has not been checked for the exact sailing/category during the current advisor review => VERIFY_SUPPLIER. Capturing a website promotion is not inventory confirmation.
5. Departed sailing, impossible travel dates, mismatched embarkation or supplier exclusion => REJECT_VOYAGE.
6. Unknown currency, occupancy basis, taxes/fees or category => HOLD_COMPARABILITY; do not compute a savings percentage.
7. Consent unknown, prior opt-out or outreach cooldown => NO_OUTREACH, even when match is otherwise strong.

## Ranking after gates (0–100, informational only)
- Date compatibility: 30 (exact date 30; within declared flexible window 20; unknown 0).
- Destination/itinerary fit: 25 (same route 25; overlapping ports/region 15; unknown 0).
- Supplier/ship preference: 15 (explicit preferred 15; historically quoted 7; unknown 0).
- Accommodation fit: 15 (exact category/type 15; acceptable upgrade 10; unknown 0).
- Price/budget fit: 15 (within verified budget 15; unknown 0). Never infer a budget from a single old quote.
Do not rank candidates that fail a hard gate. Score is not booking probability.

## Output object
```json
{
  "client_id": "internal-id",
  "quote_package_ids": [],
  "promotion_id": "supplier-offer-id",
  "lane": "prospect_review",
  "decision": "VERIFY_SUPPLIER",
  "score": null,
  "reasons": [],
  "warnings": ["Supplier inventory not verified"],
  "supplier_source_url": null,
  "source_captured_at_utc": null,
  "fare_verified_at_utc": null,
  "advisor_status": "needs_review",
  "outreach_allowed": false
}
```

## Acceptance tests before implementation release
- A booked client never enters prospect outreach; they enter service repricing.
- A past sailing never yields a current opportunity.
- Same-name/different-email records cannot be joined automatically.
- Multi-voyage quote packages are evaluated per voyage, not as one itinerary.
- Promotions with expired windows or unverified inventory cannot generate client-facing prices.
- Per-person and total-package fares cannot be compared without normalization.
- Two overlapping supplier promotions for the same voyage/client are deduplicated while retaining source evidence.
- An opt-out always blocks outreach.
- Each recommendation explains positive matches and disqualifying mismatches.
- Every test uses synthetic identities; no client data in public CI logs.

## Advisor workflow
Generate read-only candidate cards -> verify exact supplier sailing/category/terms -> record advisor disposition -> draft only after explicit approval -> send manually. Keep a timestamped audit trail of verification and decisions. Do not send automatically.
