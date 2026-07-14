# Data Layer Audit — Phase A
_Audited July 14, 2026 against commit `f4f8d55`._

## Supabase clients

| File | Kind | Key | Used by |
|---|---|---|---|
| `src/lib/supabase/client.ts` | browser (`createBrowserClient`) | anon | **nothing currently** — kept for future client components |
| `src/lib/supabase/server.ts` | RSC/actions with cookies | anon | **nothing currently** — actions use the public client |
| `src/lib/supabase/public.ts` | cookie-free server (ISR-safe) | anon | `src/lib/journeys.ts`, `src/app/actions.ts` |
| `src/lib/supabase/admin.ts` | server-only service role (new, Phase C) | service_role | `src/lib/data/*`, internal preview |

## Table reads/writes in app code

| Table | Access | Where |
|---|---|---|
| `journeys` | read (published only) | `src/lib/journeys.ts` → homepage (`src/app/page.tsx`), `/journeys`, `/journeys/[slug]` |
| `quote_requests` | insert | `src/app/actions.ts` (`submitQuoteRequest`) |
| `subscribers` | insert | `src/app/actions.ts` (`subscribeToDispatch`) |
| `cruises` | **none** | no code references |
| `inquiries` | **none** | no code references |
| normalized tables | read via `src/lib/data/*` (internal preview only) | not used by any public page |

No hardcoded journey arrays or mock pricing remain (removed in Phase 4).

## Homepage/detail card data shape

The UI contract is the `Journey` type in `src/components/JourneyCard.tsx`:
`id, slug?, region, dates (display text), routeTitle, voyageTitle, cruiseLine,
ship, nights, embark, disembark, portCount, stateroom, roomSize?, theirPrice
(display text), yourPrice (display text), priceNote?, jordansTake,
availabilityNote?`. Cards derive "You save $X" by parsing the display prices.
A Phase G adapter must map a voyage + its **featured offer** into this shape.

## Form dependencies

- Quote form: needs `journeys.id` for preselection (`?journey=<uuid>`); writes
  `quote_requests(journey_id → journeys.id FK)`. **Phase H note:** this FK must
  be migrated (or dual-written) before `journeys` is retired.
- Dispatch signup: `subscribers` only. No journey coupling.

## Environment variables

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (server-only), `INTERNAL_PREVIEW_TOKEN`
(server-only, gates `/internal/data-preview` outside development).
All but the last are set in Vercel Production + Preview.
