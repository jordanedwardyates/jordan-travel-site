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
| 002 | _not yet sent_ | Regent Seven Seas for a Celebrity price | 1 | — | — | — | — | — |

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

**What we learned** — _pending_

---

### 002 · What a Celebrity Sky Suite Actually Costs

- **File (send this):** [`dispatch-price-of-a-sky-suite-v2.html`](dispatch-price-of-a-sky-suite-v2.html)
- **Preview:** [`previews/dispatch-price-of-a-sky-suite-v2.png`](previews/dispatch-price-of-a-sky-suite-v2.png)
- **Superseded draft:** [`dispatch-price-of-a-sky-suite.html`](dispatch-price-of-a-sky-suite.html) (v1 — kept for comparison)
- **Status:** draft — comparator fare is aggregator-sourced; pull a live Celebrity Sky Suite quote before send
- **Segment:** full Dispatch list
- **Angle:** a Celebrity Sky Suite shows the lower sticker, but it's cruise-only on a 3,000-guest ship — set the Dec 9 Grandeur beside it, suite for suite, and the value flips. **Air is NOT included on either line.**

**What v2 adds over v1**

1. **The Ledger** — the add-backs are now done *on the page*, not asserted in
   prose. Sky Suite $3,214 + excursions $720 + drinks $665 + gratuities $175 +
   Wi-Fi $175 = **$4,949 / 7 nights = $707 pp per night**, against Regent's
   $5,907 / 10 = **$591**. The Regent suite is the cheaper night. That is the
   whole letter in one number, and v1 never actually made the claim.
2. **The Two Rooms** — 415 vs 300 sq ft drawn as true-relative-area footprints
   (148px vs 107px deep), with hosted photo slots above each.
3. **The Ladder** — Contemporary → Premium → Premium Plus → Luxury, each rung
   with its hotel equivalent, Celebrity flagged on rung 3 and Regent on rung 4.
   This is the retention argument: the ledger moves the reader up a full rung
   *while lowering their cost per night*, and the copy names that pattern as
   what staying with Jordan looks like over years.
4. Second CTA — "Which rung should I be on next?" — a reply path for everyone
   who isn't buying December.
5. Fixes: the `Hi {First Name}` fragment that was glued to the front of
   paragraph two; Celebrity relabelled Premium Plus (not Premium) so the table
   and the ladder agree; UTMs added to the two Oceania P.S. links; mobile
   stacking for the two-column room comparison.

**Open items before send (v2)**

- Drop `suite-regent-serenity.jpg` and `suite-celebrity-sky.jpg` (560×360) into
  `public/email-assets/` and deploy — until then both photo slots render as alt
  text. **Do not send with the slots empty.**
- Replace ~$3,214 Sky Suite comparator with a live quote, then re-run the
  ledger arithmetic — the $707 figure moves with it.
- Sanity-check the four add-back estimates against current Celebrity pricing.
- Merge tag is `{{first_name}}` — swap for the ESP's real tag.
- Replace `{{unsubscribe_url}}` with the ESP merge tag.

**Sailing featured**

| Ship | Voyage | Departs | Code | Lead fare | Savings shown |
|---|---|---|---|---|---|
| Seven Seas Grandeur | W. Caribbean | 2026-12-09 | GRA261209 | $5,907 pp (all-incl. except air) | $1,642 pp off $7,549 |

**The comparison (in the email)**

| | Grandeur · Serenity Suite | Reflection · Sky Suite |
|---|---|---|
| Sailing | 10 nt · Dec 9, 2026 | 7 nt · Dec 21, 2026 |
| Suite size | ~415 sq ft | ~300 sq ft |
| Fare pp | $5,907 (all-incl. ex-air) | from $3,214 (cruise only) |
| Per night pp | ~$591 | ~$459 |
| Guests | ~746 | ~3,046 |
| Crew ratio | 1:1.4 | 1:2.4 |

**Open items before send**
- Replace ~$3,214 Sky Suite comparator with a live quote from the booking system
- Confirm Serenity Suite sq ft (415 carried from the quote sheet, not re-verified)
- Replace `{{unsubscribe_url}}` with the ESP merge tag

**Results** — _pending send_

**What we learned** — _pending_

---

### STAMPED · The Alaska Edition · Two Prices for Alaska

- **File:** [`stamped-alaska-visions-riviera.html`](stamped-alaska-visions-riviera.html)
- **Preview:** [`previews/stamped-alaska-visions-riviera.png`](previews/stamped-alaska-visions-riviera.png)
- **Status:** ready to send, 2026-09-15. Map assets `RVA270708-map.jpg` and `EXP270602-map.jpg` are in `public/email-assets/` but not deployed yet; push `main` before sending or both maps render as alt text.
- **Segment:** full STAMPED list, sheet "7/30 Full List" (`1Fn0Vx6AUSYiuWD14zSwqCp4Ew30Qi-F9T37WcBNcs3w`)
- **Subject (Gmail draft, exact):** `Alaska for less than a Celebrity suite, first class flights included`. Chosen because it is the one claim in the letter a reader can check in ten seconds (Regent G2 $8,504 vs Celebrity Suite $8,609), and the first 38 characters stand on their own on a phone. Alternates considered: "Their Alaska price beside mine, same ship, same week" · "Two prices for Alaska. Reply with one word."
- **Send script:** [`apps-script/send-alaska-edition.gs`](apps-script/send-alaska-edition.gs). Writes to its own `Alaska Edition` status column (auto-created), so the sheet is reusable per issue without clearing anything. Trigger every 30 min, 07:00–21:00, 1,500/day cap.
- **Angle:** the series had zero conversions over ~6,000 sends, so this one is a single sailing with a plain three-column ledger (Oceania's promotional fare / my price / you save), no brochure strike-through, and a one-word reply as the ask. Oceania's fare = the promotional fare on the cruise page the day of send.

**Sailing featured**

| Ship | Voyage | Departs | Code | Rooms shown | Oceania's fare → mine (pp) |
|---|---|---|---|---|---|
| Oceania Riviera | Seattle round trip, Visions of Alaska | 2027-07-08 (7 nt) | RVA270708 | G, B3, A2, PH3 | $2,280→$1,920 · $3,320→$2,675 · $3,520→$2,825 · $4,400→$3,750 |

**Pricing basis** (Jordan's sheet + the markup he specified): G $1,425+$495; B3 $2,075+$600; A2 $2,200+$625; PH3 $2,750+$1,000. F Inside is available at $1,475+$495 = $1,970 (vs $2,360) if an assigned cabin is preferred over the G guarantee.

**Alternate departures** — the same Seattle round trip sails weekly (Thursdays), 24 Jun → 5 Aug 2027. The letter lists all seven dates and says only "big discount on each," deliberately, because **each date is priced independently — there is no shared fare**. Verified on the Oceania site 2026-09-11 (promotional fare pp):

| Departs | Voyage | Offer | G Inside | B3 Veranda | A2 Concierge | PH3 Penthouse |
|---|---|---|---|---|---|---|
| 24 Jun | RVA270624 | 15% | $2,252 (waitlist) | $3,187 | $3,400 | $4,250 |
| 1 Jul | RVA270701 | 15% | $2,252 (waitlist) | $3,060 | $3,315 | $4,165 |
| **8 Jul** | **RVA270708** | **20%** | **$2,280** | **$3,320** | **$3,520** | **$4,400** |
| 15 Jul | RVA270715 | 20% | $2,160 (waitlist) | $2,640 | $2,840 | $4,120 |
| 22 Jul | RVA270722 | 20% | $2,240 (waitlist) | $3,080 | $3,680 | $4,200 |
| 29 Jul | RVA270729 | 15% | $2,465 | $3,315 | $3,612 | $4,335 |
| 5 Aug | RVA270805 | 15% | $2,252 | $3,187 | $3,400 | $4,165 |

Only 8/15/22 Jul carry the 20% offer; the other four are 15%. Fares still differ date-to-date even within the same offer, so the card's exact dollar figures (my price / you save) are valid **for the 8 July week only**. Quote any other date live before quoting a number to a client.

**Your World Included** (per Jordan, exact): All Specialty Dining · Shipboard Gratuities · Complimentary WiFi · plus choice of Complimentary Wine & Beer **or** $400 Shore Excursion Credit. (Earlier draft's "Laundry" line was dropped to match.)

**Card 2 · Seven Seas Explorer, Whittier → Vancouver, EXP270602 (2–9 Jun 2027)** — the "step it up" option. Jordan's screenshot fares matched EXP270602 exactly (his link text said 0602; the pasted href pointed at 0616, treated as a paste slip). "Their price" = Regent's Featured All-Inclusive Fare, which on these dates already includes **Free First Class Air** + Blacklane transfers. "My price" = their price less 3.9% per Jordan, rounded to the dollar. Regent rule applies: no struck-through published fare shown, just the three plain columns.

| Suite | Regent's fare | My price (−3.9%) | Saves pp |
|---|---|---|---|
| G2 Deluxe Veranda Suite, 308–361 sq ft | $8,849 | $8,504 | $345 |
| F2 Serenity Suite, 415–447 sq ft | $9,199 | $8,840 | $359 |
| E Concierge Suite, 447–464 sq ft, pre-cruise hotel | $9,599 | $9,225 | $374 |
| C Penthouse Suite, 561–644 sq ft, pre-cruise hotel | $10,199 | $9,801 | $398 |

Alternate Explorer dates listed in the letter, all with Free First Class Air, each priced on its own (verified 2026-09-11, all-inclusive fare pp for G2 / F2 / E / C): EXP270526 Vancouver→Whittier $8,799 / $9,099 / $9,799 / $10,199 · EXP270616 Whittier→Vancouver $8,549 / $8,899 / $9,749 / $11,099 · EXP270623 Vancouver→Whittier $8,899 / $9,349 / $9,749 / $10,049. Note Jordan's brief said "disembarkation in Whittier"; the featured 0602 *embarks* Whittier and disembarks Vancouver. 0526 and 0623 are the Whittier-disembark runs.

Map: `public/email-assets/EXP270602-map.jpg`, captured from rssc.com map view via the headless-Chrome recipe (Jordan pasted the same view in chat, but a pasted image never lands on disk).

**"What kind of deal is this?" section** — Celebrity Edge comparator, Seattle round trip, 25 Jun 2027, 7 nights (sailing confirmed on cruise.ca listing; fares are Jordan's figures, not re-pulled). Guest counts: Edge 2,918 (Celebrity, double occ.) · Riviera 1,250 · Explorer 746.

| | Celebrity figure | Source |
|---|---|---|
| Edge Stateroom w/ Infinite Veranda | **$2,368 pp** ($4,735 per room, taxes & fees in, "75% off 2nd guest" applied), 243 sq ft. Jordan's brief said "$5,000" — that is the room total for two, not pp; corrected before send. | celebritycruises.com live, 2026-09-14 |
| Add-backs (7 nt, pp, estimates) | Classic drinks $89.99+20% ≈ $756 · Premium WiFi ~$30/day ≈ $210 · 3 specialty dinners ~$55+18% ≈ $195 · gratuities $18/day = $126 → **≈ $1,290, all-in ≈ $3,655** | cruisekit / deeparrival, checked Jun 2026 |
| vs Riviera B3 through Jordan | $2,675, 291 sq ft → ≈ $980 pp less ("close to $1,000" in the letter) | this issue |
| Celebrity Suite (The Retreat) | **$8,609 pp** live (Jordan said $8,600), 501 sq ft on the itinerary page = 401 interior + 100 veranda (Edge-class fact sheet). Included: premium drinks, premium WiFi, gratuities, butler, Luminae. NOT: air, transfers, excursions | celebritycruises.com live / celebritycorporatekit PDF |
| vs Explorer through Jordan | G2 $8,504 (−$105, flights in) · F2 $8,840 (size match, +$231) | this issue |

Jordan's pasted link carried `sailDate=2027-06-04` (the search default); the 25 Jun sailing is the one whose Celebrity Suite matches his $8,600, so the letter uses 25 Jun and links to it. For reference, 4 Jun live: Edge Stateroom $2,353 pp, Celebrity Suite $8,091 pp.

Caveat carried in the letter's fine print: Celebrity's figures include taxes and fees; Oceania's and Regent's are the lines' published fares. Re-pull both Celebrity fares on send day, they move weekly.

**Results** — _pending send_
