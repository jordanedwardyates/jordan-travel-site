# The Dispatch — Campaign Log

Every "STAMPED: The Weekly Edit" letter Jordan sends, archived here with the
exact HTML that went out, a rendered preview, and its results.

**Rules for every sailing card** (see also the Brand Bible + agent memory):
1. Link to the official cruise-line voyage page.
2. Always show the savings — struck retail + dollars saved, beside that room's
   price. If retail is missing, get it before sending.
3. Defend against Gmail's dark-mode color inversion — see the "Emails"
   section in `CLAUDE.md`/`AGENTS.md` for the required `bgcolor` attributes,
   `@media (prefers-color-scheme: dark)` block, and image-filter reset.
   Without these, the cream paper background and signature stamp invert into
   a muddy, washed-out mess in Gmail.

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
