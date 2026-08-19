# The Dispatch — Campaign Log

Every "STAMPED: The Weekly Edit" letter Jordan sends, archived here with the
exact HTML that went out, a rendered preview, and its results.

**Rules for every sailing card** (see also the Brand Bible + agent memory):
1. Link to the official cruise-line voyage page.
2. Always show the savings — struck retail + dollars saved, beside that room's
   price. If retail is missing, get it before sending.

## Where to read the results

**→ [`/internal/campaigns`](https://www.bonvtravelcompany.com/internal/campaigns)**
— the marketing desk. Hidden page, token-gated (`?key=<INTERNAL_PREVIEW_TOKEN>`),
noindexed. Shows every letter, its engagement, and the **sailing leaderboard**:
which voyages actually pulled clicks.

### How attribution works

Every voyage link is tagged `utm_campaign=<campaign slug>` and
`utm_content=<voyage code>`. Resend posts click events to
`/api/webhooks/resend`, which resolves both from the URL and writes a row to
`campaign_events` — so a click lands against the exact sailing with no
redirect service in the middle.

Data model: `campaigns` → `campaign_sailings` (joins the real `voyages` table)
→ `campaign_events`. Inbound `quote_requests` carry `source_campaign_id`,
closing the loop **email → click → quote → booking**.

**Read opens as a floor, not a target** — Apple Mail Privacy Protection inflates
them. Clicks and quote requests are the honest signals.

---

## Campaigns

| # | Sent | Subject | Sailings | Audience | Opens | Clicks | Replies | Booked |
|---|------|---------|----------|----------|-------|--------|---------|--------|
| 001 | _not yet sent_ | The Crossings & the Mediterranean | 7 | — | — | — | — | — |
| 002 | _not yet sent_ | Before the Quest Turns West | 3 | — | — | — | — | — |

---

### 001 · The Crossings & the Mediterranean

- **File:** [`dispatch-crossings-mediterranean.html`](dispatch-crossings-mediterranean.html)
- **Preview:** [`previews/dispatch-seven-sailings.png`](previews/dispatch-seven-sailings.png)
- **Status:** draft — awaiting 2 retail fares before send
- **Segment:** full Dispatch list

**Sailings featured**

| Ship | Voyage | Departs | Code | Lead fare | Savings shown |
|---|---|---|---|---|---|
| Marina | Miami → Rome | 2027-03-25 | MNA270325 | $2,673 | $927–$1,611 |
| Allura | Miami → Barcelona | 2027-03-31 | ALU270331 | $5,043 | $492–$724 |
| Insignia | Miami → Lisbon | 2027-04-09 | INS270409 | $2,272 | $734–$2,068 + OBC |
| Sirena | Rome → Valletta | 2026-09-10 | SIR260910 | $2,550 | $899 (PH pending) |
| Allura | Trieste → Athens | 2026-10-03 | ALU261003 | $3,150 | pending retail |
| Insignia | Venice → Barcelona | 2026-10-23 | INS261023 | $2,180 | $160–$205 + $200 OBC |
| Allura | Rome → Barcelona | 2026-11-07 | ALU261107 | $3,947 | $245–$260 |

**Open items before send**
- Retail fare for Allura ALU261003 B2 ($3,150)
- Retail fare for Sirena SIR260910 Penthouse ($5,840)
- Replace `{{unsubscribe_url}}` with the ESP merge tag

**Results** — _pending send_

---

### 002 · Before the Quest Turns West

- **File:** [`dispatch-seabourn-before-she-turns-west.html`](dispatch-seabourn-before-she-turns-west.html)
- **Preview:** _not yet rendered_
- **Status:** draft — see open items below before send
- **Segment:** proposed — the ~500 Sonata-invitation recipients first, as their own campaign row, then the full Dispatch list
- **Source data:** `SBN_MI_USD_8.5.26.xlsx` (Seabourn weekly rate tracker, Aug 5 2026 snapshot). Net fare = "this week" cell; retail = net ÷ (1 − discount); savings = retail − net. All three sailings are Seabourn Quest, Adriatic/Aegean, October 2026 — chosen because they're the only Greek Isles/Adriatic/Turkey itineraries in the sheet still showing open inventory.

**Sailings featured**

| Ship | Voyage | Departs | Code | Lead fare (Veranda) | Savings shown |
|---|---|---|---|---|---|
| Seabourn Quest | Istanbul → Athens ("My pick") | 2026-10-18 | 6673 | $4,874 | $2,624 (Veranda) / $4,899 (Penthouse) |
| Seabourn Quest | Istanbul → Rome (14-night twin of 6673) | 2026-10-18 | 6673A | $8,189 | $4,409 (Veranda) / $8,399 (Penthouse) |
| Seabourn Quest | Dubrovnik → Athens | 2026-10-04 | 6669 | $3,964 | $2,134 (Veranda) / $5,424 (Penthouse) |

**Open items before send**
- **Confirm fares are per person, double occupancy.** The rate sheet doesn't label this explicitly; the copy assumes "pp" to match every other fare on the site, but it's an assumption, not a read fact — sanity-check against Seabourn's own booking tool before this goes out.
- **No live `campaigns` row yet.** Per-card links are `mailto:` (voyage code in the subject line) rather than tracked UTM links, since there's no curated `voyages`/`price_offers` entry for these sailings to point a quote-page link at. If live click/quote attribution matters for this send, that needs a `campaigns` + `campaign_sailings` row (and, if these should ever live on the public site, the full curation pipeline) before send — ask and I'll wire it up.
- **No port-by-port stop list.** The rate sheet only gives origin/destination, not intermediate calls, so cards say "full itinerary sent on request" rather than naming ports I can't verify. Fill in the real stop list per card if you want it in the email itself.
- **Suite square footage omitted** for the same reason — not in the source data, didn't want to guess it.
- Replace `{{unsubscribe_url}}` with the ESP merge tag (same open item as 001 — worth fixing once, for both).
- **Regent Seven Seas candidates not included.** The linked "Focus 2026" promo sheet has voyage codes, nights, region, and approved discount %, but no dollar fares — nothing to compute a net/retail/savings row from. Best Med candidates if you want to price them out separately: `VOY261103` (Seven Seas Voyager, 7 nights, Nov 3 2026, 50% off — deepest discount in the sheet) and `NAV261002` (Seven Seas Navigator, 14 nights, Oct 2 2026, 35% off). One code, `PRT270705`/`PRT270821`, uses a ship prefix I don't recognize in Regent's fleet — didn't want to guess which ship that is.

**Results** — _pending send_

**What we learned** — _pending_
