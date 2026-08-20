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
| 002 | _not yet sent_ | The Aegean & the Atlantic | 3 | — | — | — | — | — |

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

### 002 · The Aegean & the Atlantic

- **File:** [`dispatch-aegean-and-the-atlantic.html`](dispatch-aegean-and-the-atlantic.html)
- **Preview:** _not yet rendered_
- **Status:** draft — several fares and facts still need Jordan's confirmation, see open items
- **Segment:** proposed — the ~500 Sonata-invitation recipients first, as their own campaign row, then the full Dispatch list

**Sailings featured**

| Ship | Voyage | Departs | Code | Lead fare | Savings shown |
|---|---|---|---|---|---|
| Seabourn Quest | Istanbul → Athens, 7 nights ("My pick") | 2026-10-18 | 6673 | $4,874 Veranda | $2,624 / $4,899 |
| Seven Seas Splendor | Montréal → Miami, 16 nights | 2026-10-30 | SPL261030 | $12,144 Deluxe Veranda | $2,955 / $3,840 / $3,810 |
| Seven Seas Grandeur | Miami → Panama Canal → Miami, 10 nights | 2026-12-09 | GRA261209 | $7,856 Concierge (E) | $243 |

The 14-night Istanbul → Rome (6673A) is no longer its own card — it's a note
under 6673, since it's the same departure extended: **+$3,315 pp** in a
Veranda. The Dubrovnik → Athens sailing (6669) was dropped; its port list
couldn't be verified, and three cards is the right length.

**Where the numbers come from**

- **Seabourn:** `SBN_MI_USD_8.5.26.xlsx` (weekly rate tracker, Aug 5 2026).
  Net = "this week" cell; retail = net ÷ (1 − discount); savings = the difference.
- **Regent:** Jordan's quoted **totals**, converted per his formula —
  `total ÷ 2 × 1.15` = the per-person price shown. Verified:

  | Category | Quoted total | ÷2 | ×1.15 = shown | Retail given | Save |
  |---|---|---|---|---|---|
  | GRA F1 Serenity | $13,010 | $6,505 | $7,481 | $7,699 | $218 |
  | GRA E Concierge | $13,662 | $6,831 | $7,856 | $8,099 | $243 |
  | GRA D Concierge | $13,922 | $6,961 | $8,005 | $8,299 | $294 |
  | SPL G1 Deluxe Veranda | $21,120 | $10,560 | $12,144 | $15,099 | $2,955 |
  | SPL F2 Serenity | $21,320 | $10,660 | $12,259 | $16,099 | $3,840 |
  | SPL F1 Serenity | $21,960 | $10,980 | $12,627 | $16,299 | $3,672 |
  | SPL E Concierge | $24,748 | $12,374 | $14,230 | $17,399 | $3,169 |
  | SPL D Concierge | $24,328 | $12,164 | $13,989 | $17,799 | $3,810 |

  The SPL retails confirm the basis: halved, they would sit *below* the selling
  price, so both columns are per person. The card shows G1, F2 and D — the entry,
  the deepest saving, and the hotel-inclusive one.

**Open items before send**

Blocking:
- **`www.rssc.com` and every cruise mirror are blocked by this session's network
  egress policy.** Nothing on rssc.com, seabourn.com, cruisemapper, regentcruises,
  cruisekings or keeneluxurytravel could be fetched — direct `curl` and the fetch
  tool both get a 403 at the proxy. Everything below that isn't from Jordan's own
  files was assembled from web-search results instead, and needs his eyes.
- **~~No retail fares for SPL261030~~** — supplied Aug 20 and now in the card.
- **GRA261209 B Penthouse: $8,849 pp supplied, basis unconfirmed.** Every one of
  Jordan's own selling prices so far has arrived as a per-cabin total; every retail
  has arrived labelled "pp" or "per person". By that convention $8,849 pp reads as
  the *retail*, which would leave the selling price still missing. Card still says
  "reply for the fare" until this is settled.
- **Seabourn basis unconfirmed.** Jordan notes most of his prices are per cabin.
  The Regent numbers were, and were halved. The `SBN_MI_USD_8.5.26` figures are
  being shown as per person on the reasoning that $4,874 is a normal per-person
  Veranda fare for a 7-night Seabourn and would be roughly half market as a cabin
  rate — but that is inference, not confirmation, and it is the hero card.
- **Whether the Seabourn rates need the 15% markup too.** Regent went net → +15%.
  If the rate-sheet figures are Jordan's cost rather than the promo selling fare,
  the Seabourn card is currently priced with no margin in it.

Facts to confirm:
- **SPL261030 D Concierge ($24,328) prices *below* E Concierge ($24,748)** —
  inverted against GRA261209, where D is above E. The email quotes the cheaper D
  figure as "Concierge Suite." Worth a look; it may be a typo in the quote.
- **The map URL supplied is for the wrong voyage.** `cruise-map_gra261101` is the
  Nov 1 *Mediterranean* sailing; GRA261209 is Miami → Miami Caribbean & Panama
  Canal. Not used.
- **Panama Canal wording.** A 10-night Miami round-trip almost certainly makes a
  *partial* transit, not a full ocean-to-ocean crossing, so the copy says "into the
  Canal" and never claims a full transit. Confirm and tighten if it is full.
- **Departure date.** Jordan said the 7-day sails 10/19; the rate sheet and
  Seabourn both say **18 October** (Çanakkale is the 19th). Email uses the 18th.
- **6673 is not sold out** — Jordan confirmed; the aggregator flag was stale.
  Live availability could not be pulled here: `www.seabourn.com` answers 403 at the
  egress proxy for both the booking flow and the voyage page, so the Book Now path
  is unreachable from this session (and would need his login regardless).
- **Jordan's perks are not applied.** Nothing in the repo records what they are,
  so no credit, upgrade or amenity is claimed anywhere in the letter.
- **"Serenity Suite" square footage** couldn't be verified as a public Regent
  category, so no size is printed for it. Splendor's Concierge size likewise
  unverified; that row shows the hotel inclusion instead of a number.
- **Suite sizes used** (Grandeur, from Regent press/review coverage): Deluxe Veranda
  361 sq ft incl. 108 balcony · Concierge up to 464 · Penthouse up to 644 · Regent
  Suite 4,443. Splendor Deluxe Veranda up to 361.
- **SPL261030 port list is search-assembled** and the card says "ports of call
  include" rather than presenting it as complete. Some sources show an 18-night
  Oct 29 variant; the code and Jordan's quote both say 16 nights from Oct 30.
- Replace `{{unsubscribe_url}}` with the ESP merge tag (still open on 001 too).
- Still no `campaigns` row, so per-card CTAs are `mailto:` with the voyage code in
  the subject rather than tracked UTM links.

**Results** — _pending send_