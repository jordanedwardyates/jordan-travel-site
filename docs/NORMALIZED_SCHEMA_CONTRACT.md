# Normalized Schema Contract — Phase B
_Verified against the live `JY Travel` Supabase project, July 14, 2026._

## Verdict

The normalized tables (`voyages`, `accommodations`, `price_offers`,
`travel_tags`, `voyage_tags`, `quote_packages`, `quote_items`,
`homepage_features`) satisfy the roadmap contract. Three gaps were found and
closed by migration `accommodation_classification_contract`:

1. `accommodations.accommodation_type` was free text → now NOT NULL,
   default `unknown`, CHECK-constrained to the roadmap's class list
   (`inside … expedition_suite, other, unknown`).
2. `accommodations.balcony_group` added as a **generated column**:
   true for `balcony, veranda, concierge_veranda`. French balconies are
   intentionally excluded; "any balcony style" queries opt them in.
3. `accommodations.room_number` added (nullable) for quote-specific cabins.

## Business constraints — where each is enforced

| Rule | Enforcement |
|---|---|
| My Price includes taxes & fees | DB CHECK: `my_price_includes_taxes_fees = true` (cannot be false) |
| My Price > Their Price never public | generated `comparison_status = 'invalid_higher_than_retail'`; excluded in `search_voyage_offers`; **query layer must also exclude at Phase G website reads** |
| Sold-out / expired not public | `search_voyage_offers` filters `availability` and `offer_expires_at`; public RLS policy on `price_offers` ("safe price offers") |
| Unknown price basis excluded from price searches | `search_voyage_offers` defaults `p_price_basis = 'per_person'`; `unknown` rows never match a basis filter |
| Price basis explicit | enum CHECK: `per_person / total_accommodation / unknown`, default `unknown` |
| Trust states | `source_status` enums on voyages/accommodations/offers; `website_status` / `website_approved` for publishing |
| Ranges never stored as one offer | convention (no DB guard possible); ranges stay in `quote_packages.raw_source_data` until split |

## Search contract

`public.search_voyage_offers(...)` (migration `search_voyage_offers_function`)
implements the Phase F filter contract verbatim; execute is **revoked from
anon/authenticated** — server-side (service role) only. Ranking is
provisional (available first, then recency, then price) and may be refined;
filters are final. `p_one_per_voyage` returns distinct cruises for
"give me two cruises" phrasing.

## Fixture data

Milestone fixtures were seeded **from the roadmap documents' own examples**
(Allura B4/A3/PH1 + French Veranda; Marina Miami→Rome B4 $4,026), marked
`ROADMAP FIXTURE` in `internal_notes`/`notes`. The legacy Allura offer
($2,749, `needs_review`, basis `unknown`) was preserved as price history and
is proven excluded from search. Remove fixtures by deleting rows whose notes
contain `ROADMAP FIXTURE`.

## RLS posture

Public (anon) can read only: approved voyages, approved accommodations,
"safe" price offers, active tags/features. `quote_packages`/`quote_items`
have no public policies. Internal tooling uses the service-role client
(`src/lib/supabase/admin.ts`), server-only.
