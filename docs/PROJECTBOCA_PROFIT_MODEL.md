# Projectboca.com (ACOB) — Business Profit Model Plan

_Drafted July 18, 2026. **Version 0.1 — working model.**_

> **How to read this document.** The modeling framework, formulas, and structure
> are complete and internally consistent. Every _business-specific_ number is an
> **illustrative placeholder** marked `⟨assumption⟩` and collected in the
> [Assumptions Register](#12-assumptions-register). Replace the placeholders with
> real figures and the projections recompute on the same logic. Nothing here is a
> claim of fact about the business — it is a planning skeleton to be filled in.

---

## 1. Purpose

A profit model answers three questions before the business spends money proving
them the hard way:

1. **Where does revenue come from,** and how many independent streams?
2. **What does each unit of revenue cost** to acquire and deliver?
3. **At what volume does the business cover its fixed costs** and turn a profit?

This plan builds those answers from the unit up, then rolls them into a 3-year
P&L with base / conservative / aggressive scenarios and a break-even analysis.

---

## 2. Business summary

| Field | Value |
|---|---|
| Public property | **Projectboca.com** (live in production) |
| Product name | **ACOB — AI Choice. One Bite.** |
| One-line description | Dish-first dinner-decision app: swipe real dishes (prices shown, restaurant hidden), finish a Lightning Round, get exactly **one** winning restaurant |
| Stage | MVP shipped; seeded catalog; pre-revenue; pre-real-market launch |
| Primary customers | Diners (premium subscription) and restaurants (dish-level demand analytics) |
| Core offers | E1 consumer premium `⟨$4.99/mo⟩` · E2 restaurant "Menu Intelligence" `⟨$99/mo⟩` · E3 decided-diner handoff fees `⟨$1.00/handoff⟩` |
| Geography / market | U.S.; launch-metro wedge strategy `⟨Boca Raton, FL — assumption⟩` |
| Founder / operator model | Solo founder (Jordan Yates) + contractors; separate from the BON V travel business |

**Modeling posture:** consumer app + B2B SaaS hybrid — near-zero marginal COGS
on software, real per-restaurant onboarding COGS (dish photography), recurring
revenue on both sides. See `docs/PROJECTBOCA_INVESTOR_NARRATIVE.md` for the
full investor story and `docs/investor/ACOB_Investor_Model.xlsx` for the live
numbers. The generic revenue-stream labels below (R1–R4) predate the engine
framing (E1–E3); read R2 ≈ E1+E2 recurring, R4 ≈ E3.

---

## 3. Revenue model

A durable business rarely rests on one stream. This model frames **up to four**
so ACOB can see which carry the profit and which are strategic loss-leaders.

| # | Stream | Type | Description | Illustrative price |
|---|---|---|---|---|
| R1 | Core offer | One-time | The primary paid deliverable/product | `⟨$1,500⟩` per sale |
| R2 | Recurring / retainer | Subscription (MRR) | Ongoing service, membership, or SaaS seat | `⟨$250⟩` / mo |
| R3 | Add-ons / upsell | One-time | Attach-rate revenue on top of R1 | `⟨$400⟩` avg |
| R4 | Affiliate / referral / ad | Variable | Partner commissions, sponsorships, media | `⟨$50⟩` per event |

### Revenue mix target (Year 1, illustrative)

| Stream | Share of revenue | Why |
|---|---|---|
| R1 Core | 55% | Cash engine while brand is built |
| R2 Recurring | 25% | Compounding, raises enterprise value most |
| R3 Add-ons | 15% | Highest margin, near-zero CAC |
| R4 Partner | 5% | Optional; strategic, not load-bearing |

> **Design principle:** the goal by end of Year 2 is to shift mix toward **R2
> recurring**, because recurring revenue is worth a higher multiple and smooths
> cash flow. Track the R2 share as a headline KPI.

---

## 4. Unit economics

The single most important table in the plan. If a unit is unprofitable, scale
makes losses bigger — fix this before spending on growth.

### 4.1 Definitions

- **AOV** (Average Order Value) — blended revenue per new customer, first order.
- **Gross margin** — revenue minus the direct cost to _deliver_ it.
- **CAC** (Customer Acquisition Cost) — total sales + marketing ÷ new customers.
- **LTV** (Lifetime Value) — gross-margin dollars a customer generates over their
  lifetime: `AOV × gross-margin% × (1 + repeat purchases) + MRR contribution`.

### 4.2 Illustrative unit economics (per new customer)

| Line | Formula | Illustrative |
|---|---|---|
| Blended AOV (R1+R3 attach) | — | `⟨$1,750⟩` |
| Direct delivery cost (COGS) | — | `⟨$450⟩` |
| **Gross profit / order** | AOV − COGS | **$1,300** |
| **Gross margin %** | GP ÷ AOV | **74%** |
| CAC | S&M ÷ new customers | `⟨$300⟩` |
| **Contribution / new customer** | GP − CAC | **$1,000** |
| Recurring uplift (R2, if attached) | MRR × margin × avg months | `⟨$250 × 80% × 9 = $1,800⟩` |
| **LTV (with recurring)** | GP + recurring uplift | **$3,100** |
| **LTV : CAC** | LTV ÷ CAC | **10.3 : 1** |
| **CAC payback** | CAC ÷ (monthly GP) | `⟨< 1 month⟩` |

**Health thresholds (industry rules of thumb):**

| Metric | Danger | OK | Strong |
|---|---|---|---|
| LTV : CAC | < 1.5 | 3 | > 4 |
| Gross margin (digital/services) | < 40% | 60% | > 75% |
| CAC payback | > 18 mo | 12 mo | < 6 mo |

> If the real numbers put ACOB in the "Danger" column on any row, the fix is
> **pricing, delivery cost, or channel** — not more volume.

---

## 5. Cost structure

### 5.1 Cost of goods / cost of delivery (variable — scales with sales)

| Item | Basis | Illustrative |
|---|---|---|
| Fulfillment / production labor | per order | `⟨$250⟩` |
| Payment processing | ~2.9% + $0.30 | `⟨$51⟩` |
| Software/API usage per unit | per order | `⟨$40⟩` |
| Contractor / subcontract | per order | `⟨$109⟩` |
| **Total COGS / order** | — | **`⟨$450⟩`** |

_(Physical-goods variant: replace with landed unit cost + shipping + returns.)_

### 5.2 Operating expenses (fixed — paid whether or not you sell)

| Category | Monthly illustrative | Notes |
|---|---|---|
| Founder / core salary | `⟨$4,000⟩` | Or owner's draw |
| Tools & subscriptions | `⟨$600⟩` | Hosting, SaaS, domains, Supabase, Vercel |
| Marketing base (content, SEO) | `⟨$800⟩` | Excludes variable paid CAC |
| Accounting / legal / admin | `⟨$400⟩` | |
| Contingency (10%) | `⟨$580⟩` | |
| **Total fixed OpEx / mo** | — | **`⟨$6,380⟩`** |
| **Annual fixed OpEx** | ×12 | **`⟨$76,560⟩`** |

---

## 6. Pricing strategy

Pricing is the fastest lever on profit — a 10% price increase, if volume holds,
drops almost entirely to the bottom line.

| Offer | Model | Anchor logic | Illustrative |
|---|---|---|---|
| R1 Core | Value-based, tiered (Good/Better/Best) | Price to outcome delivered, not cost | `⟨$900 / $1,500 / $2,800⟩` |
| R2 Recurring | Monthly with annual discount (~2 months free) | Reduce churn, pull cash forward | `⟨$250/mo or $2,500/yr⟩` |
| R3 Add-ons | À la carte, presented at checkout | Pure margin, raises AOV | `⟨$150–$600⟩` |

**Tactics baked into the model:**

- **Tiering** — three tiers typically shift ~60% of buyers to the middle option
  and lift AOV vs. a single price.
- **Annual prepay** on R2 — improves cash and cuts churn.
- **Founding-member / launch pricing** — time-boxed, converts early demand
  without permanently anchoring low.

---

## 7. Financial projections

All figures **illustrative** and driven by the assumptions register. Three
scenarios flex the two variables that matter most: **new customers/month** and
**recurring attach + retention**.

### 7.1 Scenario drivers

| Driver | Conservative | Base | Aggressive |
|---|---|---|---|
| New customers — Month 1 | 4 | 6 | 10 |
| Monthly growth in new customers | 6% | 10% | 15% |
| R2 recurring attach rate | 15% | 25% | 40% |
| Monthly logo churn (R2) | 6% | 4% | 3% |
| Blended AOV | $1,600 | $1,750 | $1,900 |
| Gross margin | 70% | 74% | 78% |

### 7.2 Year 1 — Base case, quarterly roll-up (illustrative)

| Quarter | New customers | One-time rev | Recurring (MRR exit) | Total revenue | Gross profit | OpEx + CAC | **Net** |
|---|---|---|---|---|---|---|---|
| Q1 | 20 | $35,000 | $1,250 | $37,500 | $27,750 | $23,000 | **+$4,750** |
| Q2 | 26 | $45,500 | $2,600 | $51,300 | $37,960 | $25,500 | **+$12,460** |
| Q3 | 34 | $59,500 | $4,300 | $69,300 | $51,280 | $28,000 | **+$23,280** |
| Q4 | 44 | $77,000 | $6,600 | $92,600 | $68,520 | $31,500 | **+$37,020** |
| **Y1** | **124** | **$217,000** | **$6.6K MRR** | **$250,700** | **$185,510** | **$108,000** | **+$77,510** |

### 7.3 Three-year summary (illustrative, all scenarios)

| Year | Conservative net | Base net | Aggressive net |
|---|---|---|---|
| Year 1 | −$8,000 | +$77,500 | +$180,000 |
| Year 2 | +$40,000 | +$210,000 | +$520,000 |
| Year 3 | +$120,000 | +$430,000 | +$1,050,000 |
| **Recurring share of rev by Y3** | 30% | 42% | 55% |

> The spread between scenarios is driven far more by **recurring attach +
> retention** than by top-of-funnel volume. That is the strategic message: retain
> and expand beats acquire-and-churn.

---

## 8. Break-even analysis

**Break-even volume** = Fixed OpEx ÷ contribution margin per customer.

| Input | Illustrative |
|---|---|
| Fixed OpEx (monthly) | `⟨$6,380⟩` |
| Gross profit per order | `⟨$1,300⟩` |
| CAC per order | `⟨$300⟩` |
| **Contribution per order** | `⟨$1,000⟩` |
| **Break-even orders / month** | **`⟨6.4 → 7 orders⟩`** |
| **Break-even revenue / month** | **`⟨~$11,200⟩`** |

**Interpretation:** the business needs roughly **7 core sales a month** to cover
all fixed costs. Everything above that is profit or reinvestment. If real CAC or
COGS is higher, this number climbs — recompute whenever those inputs change.

_Cash break-even_ (the month cumulative cash flow turns positive) will lag P&L
break-even if there's upfront investment; track it separately in the cash section.

---

## 9. Path to profitability

| Phase | Milestone | Focus | Success signal |
|---|---|---|---|
| **0–3 mo** | Validate offer & price | Sell R1 manually, confirm AOV & COGS | 10+ paying customers, margin ≥ target |
| **3–6 mo** | Reach P&L break-even | Hit ~7 sales/mo, launch R2 | Net ≥ $0, first recurring cohort |
| **6–12 mo** | Efficient growth | Lower CAC via organic, raise attach | LTV:CAC ≥ 4, CAC payback < 6 mo |
| **12–24 mo** | Compound recurring | Expansion revenue, annual prepay | R2 share ≥ 35%, net margin ≥ 25% |
| **24 mo+** | Durable profit | Systematize, consider leverage/hires | Net margin ≥ 30%, low founder dependency |

---

## 10. Key metrics & KPI dashboard

Track weekly (leading) and monthly (lagging). Wire these to the same data layer
the rest of the property already uses (Supabase) so the dashboard is live, not a
spreadsheet snapshot.

| Metric | Cadence | Target | Why it matters |
|---|---|---|---|
| New customers | Weekly | Growth vs. plan | Top-of-funnel health |
| CAC (blended & paid) | Monthly | ≤ $300 | Acquisition efficiency |
| Gross margin % | Monthly | ≥ 74% | Delivery efficiency |
| MRR & net revenue retention | Monthly | NRR ≥ 100% | Compounding engine |
| Logo churn (R2) | Monthly | ≤ 4% | Retention |
| LTV : CAC | Monthly | ≥ 4 : 1 | Unit-economic sanity |
| Cash runway (months) | Monthly | ≥ 6 | Survival |
| Net margin | Monthly | ≥ 25% by Y2 | The whole point |

---

## 11. Risks & sensitivities

| Risk | Impact | Mitigation |
|---|---|---|
| CAC rises (channel saturates) | Contribution compresses | Diversify to organic/SEO/referral; raise price |
| High R2 churn | Recurring engine stalls | Onboarding, value cadence, annual prepay |
| Founder is the bottleneck | Growth caps at personal capacity | Productize delivery, document, hire contractors |
| Single-channel dependency | One algorithm change = revenue cliff | ≥ 3 channels before scaling spend |
| Under-pricing | Leaves margin on the table | Value-based tiering, test increases |
| Cash timing (prepaid COGS) | Profitable but cash-poor | Deposits upfront, net-15 terms, annual prepay |

**Sensitivity — what a ±10% swing does to Year-1 base net (illustrative):**

| Lever | −10% | +10% |
|---|---|---|
| Price / AOV | −$25K | +$25K |
| Volume | −$18K | +$18K |
| COGS | +$6K | −$6K |
| CAC | +$4K | −$4K |

> Price is the highest-leverage lever, followed by volume. Cost cuts help but
> can't out-run a pricing or retention problem.

---

## 12. Assumptions register

**Every `⟨…⟩` in this document resolves here.** This is the control panel — edit
these and the model updates.

| Key | Description | Placeholder | Real value | Source / confidence |
|---|---|---|---|---|
| A1 | Core offer price (R1) | $1,500 | — | |
| A2 | Recurring price (R2) | $250/mo | — | |
| A3 | Add-on avg (R3) | $400 | — | |
| A4 | Blended AOV | $1,750 | — | |
| A5 | COGS per order | $450 | — | |
| A6 | Gross margin % | 74% | — | |
| A7 | CAC | $300 | — | |
| A8 | Fixed OpEx / month | $6,380 | — | |
| A9 | New customers, Month 1 | 6 | — | |
| A10 | Monthly growth rate | 10% | — | |
| A11 | R2 attach rate | 25% | — | |
| A12 | R2 monthly churn | 4% | — | |
| A13 | Avg recurring lifetime | 9 months | — | |
| A14 | Payment processing rate | 2.9% + $0.30 | — | |

---

## 13. Next steps

1. **Fill the [Business summary](#2-business-summary)** — one honest paragraph on
   what ACOB sells and to whom. Everything else is downstream of this.
2. **Replace the [Assumptions Register](#12-assumptions-register)** with real or
   best-estimate numbers; note confidence on each.
3. **Confirm the two most sensitive inputs first** — price and CAC — with even a
   handful of real transactions.
4. **Decide the deliverable format** — this narrative doc can be paired with a
   working spreadsheet model (editable formulas) or a slide summary for sharing;
   say the word and I'll generate either from these same numbers.
5. **Wire the [KPI dashboard](#10-key-metrics--kpi-dashboard)** to live data once
   real transactions exist.

---

_This is a planning framework, not financial advice. All figures marked
illustrative are placeholders for modeling mechanics only._
