# ACOB — AI Choice. One Bite.
## Investor Narrative & Framework (Projectboca.com)

_Drafted July 18, 2026. Companion to `docs/PROJECTBOCA_PROFIT_MODEL.md` and the
working investor model at `docs/investor/ACOB_Investor_Model.xlsx`._

_Product facts below reflect the shipped MVP (live at
[projectboca.com](https://projectboca.com)) and its locked product law. Market
statistics are sourced ([Sources](#sources)). Prices, conversion rates, and the
raise are **working assumptions** marked `⟨assumption⟩` — founder sets the
final numbers._

---

## 1. The one-liner

**Every night in America — 35 billion times a year — someone asks "where should
we eat?" The entire industry answers with a list. ACOB answers with a bite.**

You don't swipe restaurants. You swipe **dishes** — real food, real prices, no
names. Keep swiping and the app quietly runs a tournament behind the scenes.
At the end: **one winner.** Not a ranked list. Not two finalists. One
restaurant, revealed like a card turned face-up.

---

## 2. The problem (the keynote opening)

Three facts, rising:

1. **The decision is universal and heavily researched.** 94% of U.S. diners
   consult online reviews before choosing a restaurant; 46% won't go without
   reading them. This is the most-researched everyday purchase in America.
2. **The tools don't decide.** The average couple spends **17 minutes**
   deliberating per meal decision — one survey puts it at **2.5 hours a week,
   about five days a year**. 68% of Americans call "deciding what to eat"
   their single biggest mealtime challenge.
3. **The friction has a body count.** Couples argue about dinner **156 times a
   year** — the #1 couples' argument in one survey, ahead of money.

**The punchline:** U.S. restaurants will do **$1.55 trillion** in 2026 sales —
and the front door to all of it is a decision experience everyone hates.
Search solved *finding*. Reviews solved *vetting*. **Nobody solved
*choosing*.**

---

## 3. The insight (the wrong noun)

> Every incumbent asks you to evaluate **restaurants**. But nobody craves a
> restaurant. **People crave dishes.** The industry built every tool around
> the wrong noun.

| Incumbent | What you evaluate | Why it fails at 7pm |
|---|---|---|
| Google Maps | Star averages | 4.2★ pizza vs. 4.3★ tacos is not a decision |
| Yelp | Strangers' opinions | Their averages ≠ your appetite; 43% skip anything under ~3.5★, herding everyone to the same safe middle |
| TikTok / Instagram | Aspiration | Great for someday; useless for *tonight at 7* |
| Reservation & delivery apps | The transaction | Assume you already chose |

ACOB inverts all of it, Jobs-style — **the feature is what we removed**:

- We removed the **list**. You see one dish at a time.
- We removed the **brand bias**. Restaurant identity is hidden; a hole-in-the-wall's
  best plate beats a famous name's average one. (Curious? Long-press to peek —
  the exception that proves the rule.)
- We removed the **debate**. The session ends with exactly **one winner**.
  Appetite is revealed by swipes, not argued about.

And we kept the one thing list-apps hide: **the price, on every card.** No
sticker shock at the table.

---

## 4. The product (shipped, not slideware)

**Live in production at projectboca.com.** The MVP flow:

1. **Vibe setup** — ZIP, distance, price range in plain language, dine-in /
   takeout / delivery. Ten seconds.
2. **Discovery** — swipe real dishes with real prices. Right = appetite.
   Save = "later," not "today." Every swipe scores an invisible tournament
   (dishes earn points for themselves *and* their hidden restaurant).
3. **The Lightning Round** — after enough right-swipes the app makes an offer:
   *"We've got contenders."* A short, intensified head-to-head among your own
   liked dishes. This is the ritual — the palette shifts, stakes rise.
4. **The reveal** — one restaurant turns face-up. Directions, pickup, or
   delivery, one tap. Share happens *after* the choice (confirmation, not
   committee).

**The KPI is time-to-decision.** Target: door-to-dinner-decision in under a
minute, and it should feel like a game, not a chore. Screenshots of the reveal
are the marketing.

**Why AI, and why now:** the MVP runs on transparent weighted scoring — every
swipe is labeled training data (dish attributes × price × context × outcome).
That's the cold-start plan working *before* the model arrives: personalization
gets layered onto real swipe data, not guessed from reviews. Taste models that
needed Netflix-scale data in 2015 are achievable in the LLM era on thin
per-user data. Each user's compounding **taste graph** is the data moat.

---

## 5. Market (how big is a question?)

Framed both ways — moments and money. Live formulas in the workbook's
**Market Sizing** tab; base-case outputs:

**By moments (the story):**

| Step | Value | Basis |
|---|---|---|
| U.S. adults | ~262M | Census-order estimate `⟨verify⟩` |
| Dine-out / order-out decisions per adult per week | ~3 | survey-order estimate `⟨verify⟩` |
| **"Where should we eat?" moments per year** | **~35 billion** | 262M × 85% × 3 × 52 |
| Researched decisions (the addressable moment) | ~33 billion | × 94% who consult reviews |

**By money (the model):**

| Layer | Value | Basis |
|---|---|---|
| U.S. restaurant & foodservice sales, 2026 | $1.55T | National Restaurant Association |
| TAM — restaurant demand-generation spend | ~$46B | ~3% of sales on marketing `⟨assumption⟩` |
| SAM — digital local-discovery share | ~$19B | ~40% digital/local `⟨assumption⟩` |
| SOM — 3-year obtainable | ~$19M | 0.1% share `⟨assumption⟩` |

Plus the consumer layer: 79% of Americans say they struggle to decide what to
order — that's the audience for premium.

---

## 6. Business model — three engines, one flywheel

| Engine | Who pays | What for | Illustrative |
|---|---|---|---|
| **E1 — Consumer premium** | Diners | Unlimited sessions, taste history, dietary filters, occasion mode | `⟨$4.99/mo⟩` |
| **E2 — Menu Intelligence** | Restaurants | Dish-level demand data no one else has: which plates win swipes, which *almost* won Lightning, price-sensitivity by neighborhood | `⟨$99/mo⟩` |
| **E3 — Decided-diner handoff** | Delivery/reservation platforms | A diner who has already chosen — the highest-intent lead on the internet | `⟨$1.00/handoff⟩` |

**E2 is the sleeper.** Every incumbent sells restaurants *restaurant-level*
reputation data. ACOB is the only surface generating **dish-level preference
data with prices attached** — effectively menu R&D telemetry. Operators facing
2026's margin squeeze (the NRA's headline theme) will pay for "your short-rib
loses to their birria at $19 but wins at $16."

**The uncrossable line:** restaurants pay to be *measured*, never to *win*.
The tournament is never for sale. Sell one ranking and both moats — trust and
the taste graph — die the same day. (Anti-Groupon by design: full-price
demand, no discount spiral.)

**The flywheel:** more swipes → richer taste graphs + dish telemetry → better
picks → more trust → more swipes.

---

## 7. Go-to-market — the wedge `⟨assumption⟩`

Own one city block-by-block before touching a second. Working hypothesis from
the name: **Boca Raton, FL** — dense dining scene, high dine-out frequency,
word-of-mouth demographics, and snowbird seasonality that stress-tests demand
twice a year. Playbook: ~200 hand-onboarded restaurants (photograph the dishes
ourselves — card quality *is* product quality) → reveal-screenshot viral loop →
down the Gold Coast, then metro-by-metro.

Current state, stated plainly: MVP live with a seeded catalog; next milestone
is the first real-market catalog and live swipe data. The model's Year-1
numbers start from that ignition point.

---

## 8. The keynote arc (for the actual pitch)

1. **Cold open:** "Raise your hand if you argued about dinner this week."
   *(156 times a year — ahead of money.)*
2. **The villain:** a Yelp results page on screen. "Four thousand answers is
   zero answers."
3. **The turn:** "We realized everyone's evaluating the wrong noun. Nobody
   craves a restaurant. You crave *a bite*."
4. **The demo:** live, one phone, stopwatch on screen. Vibe → swipes →
   Lightning → reveal. Under a minute. Silence beats slides.
5. **The number:** 35 billion moments a year. $1.55 trillion behind the door.
6. **The model:** three engines; the tournament is never for sale.
7. **The ask:** one city, 18 months, the metrics that unlock the next city.
8. **Close:** "We didn't build a better list. **We got rid of the list.**"

---

## 9. Pre-wired answers to the hard questions

| Question | Framing | Where modeled |
|---|---|---|
| Why won't Google/Yelp do this? | They monetize *searching*; ending the session early is against their economics. And their data is restaurant-level — the dish-level corpus has to be built swipe by swipe, which is the startup's job, not the incumbent's | §3, §6 |
| Cold start? | Transparent scoring works with zero history (shipped); hand-built launch catalog solves supply; taste graph compounds from swipe #1 | §4 |
| Will consumers pay for picks? | E1 is deliberately the smallest engine — Scenarios tab shows the model standing on E2+E3 even at 0% consumer conversion | Workbook: Scenarios |
| Restaurant churn? | Partners buy dish-level analytics + full-price demand, not discounts | §6, Assumptions tab |
| Content cost? | Dish photography is real COGS at onboarding — modeled per-restaurant, not hand-waved | Assumptions tab |
| Unit economics? | LTV, CAC, payback, break-even month are live formulas | Unit Economics + KPI tabs |

---

## 10. The ask `⟨structure only — founder sets numbers⟩`

- **Raise:** `⟨$750K pre-seed⟩` for `⟨18 months⟩` runway
- **Use of funds:** ~40% product/eng · ~35% launch-city catalog & GTM (incl.
  dish photography) · ~25% ops
- **Milestones that unlock the seed:** `⟨25K MAU in launch metro · 300 paying
  Menu Intelligence restaurants · median time-to-decision < 60s · Lightning
  completion rate > 60% · LTV:CAC > 3⟩`

---

## Sources

- [National Restaurant Association — 2026 State of the Restaurant Industry ($1.55T forecast)](https://restaurant.org/research-and-media/research/research-reports/state-of-the-industry/)
- [NRA press release — cost increases & enduring demand, 2026](https://restaurant.org/research-and-media/media/press-releases/persistent-cost-increases-and-enduring-demand-will-shape-the-restaurant-industry-in-2026/)
- [Restaurant Dive — industry to surpass $1.5T](https://www.restaurantdive.com/news/national-restaurant-association-15-trillion-restaurant-food-service-sales/812133/)
- [The US Sun — couples argue about dinner more than anything (156×/yr; Seated survey: ~2.5 hrs/week deciding)](https://www.the-sun.com/news/1704203/couples-relationship-arguments-survey/)
- [KSAT / US Foods — 79% of Americans struggle deciding what to order](https://www.ksat.com/news/local/2024/05/06/79-of-americans-have-a-difficult-time-deciding-what-to-order-survey-finds/)
- [MealThinker — food decision fatigue (Panera/OnePoll: 17 min per decision; Factor/Wakefield: 68% biggest mealtime challenge)](https://mealthinker.com/blog/food-decision-fatigue)
- [SocialPilot — online review statistics (94% of diners consult reviews)](https://www.socialpilot.co/reviews/blogs/online-review-statistics)
- [ReviewTrackers — star ratings and diner behavior (43% skip < 3–3.5★)](https://www.reviewtrackers.com/blog/restaurant-star-rating/)
- [Toast — review sites and demand (0.5★ drop → 19% less likely full at peak)](https://pos.toasttab.com/blog/on-the-line/restaurant-reviews-and-ratings-data)
