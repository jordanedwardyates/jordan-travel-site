# Instagram Carousel Research — 2025/2026

Compiled 2026-07-30. For BON V: A Travel Company (Jordan Yates · Luxury Voyage Advisor).
Purpose: decision rules for carousel production. Numbers first; caveats noted where
a figure is vendor-blog-sourced rather than from a large public dataset.

**Evidence tiering used below**
- **[A]** Large public dataset or on-record Instagram statement (Socialinsider 15M-post
  study; Adam Mosseri).
- **[B]** Vendor/agency benchmark reporting — directionally useful, methodology not published.
- **[C]** Craft convention repeated across many practitioner sources; treat as heuristic.

---

## 0. Why carousels at all (the format case)

- **Carousel engagement rate 0.55%**, vs Reels **0.52%**, single image **0.37%** — i.e.
  carousels ≈ **1.49×** single-image ER. Dataset: **15M Instagram posts, 417,130 pages,
  Oct 2025 – Mar 2026** (Socialinsider). Carousels also lead on **saves and views across
  all brand-size tiers**. **[A]**
- Carousels get a **structural second chance**: Mosseri, on record — "If someone sees your
  carousel post but they don't swipe, we'll often give that carousel a second chance and
  automatically move to that second piece of media for the viewer." **[A]**
  → **Design implication: slide 2 must also work as a cover.** No format gets two hooks.
- Ranking signals to optimize for, per Mosseri 2025–26: **watch/dwell time, sends per reach
  (DM shares), likes per reach**; **saves** elevated to roughly second-highest weight in
  Feb 2026. Sends carry ~**3–5× the weight of a like**. Feed specifically rewards the
  **save-to-share ratio**. **[A/B]**
  → **Optimize for saves and sends. Likes are a rounding error.**
- Vendor benchmarks (weaker evidence, consistent direction): carousels **2.14×** engagement
  vs single image; **~12%** more interactions than Reels; **1.4×** more saves than single
  photos; a 10-slide carousel produces **25–40× the dwell time** of a single image. **[B]**

---

## 1. Slide count — the sweet spot

**Decision: build 7 slides as the house default. Never ship fewer than 5. Cap at 10.**

| Slide count | What the sources say | Tier |
|---|---|---|
| 1–4 | Under-uses the format; too little dwell time to beat a single image | [C] |
| **5–8** | **Highest save rate + highest completion rate.** Most-cited sweet spot | [B] |
| 5–7 | Reported **3.4× more saves** and **2.1× more shares** than static images | [B] |
| 7–10 | Enough depth for storytelling/educational without fatigue | [B/C] |
| 8–12 | Optimal *only* for genuinely dense educational/checklist content | [B] |
| >10 | Completion rate **drops measurably** — perceived effort to finish rises | [B] |
| >12 | **~40% drop-off in completion** unless highly serialized storytelling | [B] |
| 12–20 | Only defensible as a photo-dump / photo-essay, not an argument | [B] |
| Max | Platform hard limit **20** items (photos and/or videos) | [A] |

Other numeric anchor: **~80% completion on a 10-slide deck** is cited as the threshold that
meaningfully boosts Explore distribution. **[B]** Practical read: completion rate is the
lever, and slide count is how you control it. A 7-slide deck finished by everyone beats a
14-slide deck abandoned at slide 5 — on saves, on sends, and on reach.

**BON V house rule:** 7 slides = hook + 5 body + CTA. Photo-essay exception ("Twelve
harbours in the Cyclades") may run to 12, and only when each frame stands alone.

---

## 2. Slide 1 — the hook

**Budget: 1.3–3 seconds.** Sources converge on ~1.3s to arrest the scroll and 2–3s before
the algorithm has effectively priced the post. **[B/C]**

**Cover-slide formula** (three components, all required): **[B]**
1. **Bold hook headline** — **5–8 words**, and the **largest text on the slide**.
2. **Visual pattern interrupt** — high contrast, or a single arresting image.
3. **Curiosity trigger** — a partial reveal, a surprising number, or a question that
   *cannot* be resolved without swiping.

**Hard constraints:** keep slide-1 text **under 10 words**; the hook must be the dominant
visual element. Named failure modes: (a) **burying the hook** under logo + subtitle so the
hook sits small at the bottom — post is lost; (b) **category-not-hook** vagueness
("Tips for better carousels" is a category, not a hook). **[B]**

**Six hook psychologies** (pick one per post, never two): curiosity, loss aversion,
credibility, narrative compulsion, contrarian reflex, value exchange. **[B]**

### Copy formulas, written in BON V voice (advisor, not salesman)

Each is ≤8 words and opens an information gap. Avoid exclamation, avoid "AMAZING",
avoid "you NEED to" — that's the influencer register the brand rejects.

| Formula | Pattern | BON V example |
|---|---|---|
| Contrarian | *The [common belief] is wrong* | "Book the smaller ship. Here's why." |
| Specific number | *[N] [things] that [outcome]* | "Six harbours the big ships can't enter." |
| Loss aversion | *The [mistake] costing you [thing]* | "The booking window most travellers miss." |
| Credibility | *After [N] [voyages/years], [claim]* | "After 200 itineraries: what I book myself." |
| Narrative | *In-media-res fragment* | "The captain rerouted us at midnight." |
| Value exchange | *[Asset] for [specific person]* | "A Greek islands itinerary, twelve days." |
| Quiet insider | *What [insiders] know about [X]* | "What advisors know about shoulder season." |
| Named-place gap | *Why [place] is [unexpected claim]* | "Why Hydra has no cars, and no cruise pier." |

**Also write slide 2 as a viable cover** (see §0) — usually the hook restated as a promise
or the first concrete payoff, not "hi, I'm Jordan."

---

## 3. Slide-to-slide retention

- **One idea per slide.** Multiple ideas on a slide is the most-cited retention killer. **[C]**
- **Progress numbering ("3 / 7")** raises completion by removing "how long is this?"
  anxiety, the main cause of mid-deck abandonment. **[B]** *Use it — it also reads as
  printed page numbering, which suits the letterpress identity.*
- **Swipe cue:** make it **explicit on slide 1 only**. Sources disagree on whether to cue
  slides 1–9 or slide 1 alone; the stronger claim is that **cueing every slide hurts
  completion** (it reads as pestering). **[B]**
  → **BON V: an arrow-or-caret cue on slide 1; on slides 2+ use a partial image bleed off
  the right edge instead** — the frame continuing past the margin does the same job
  without a UI arrow, and it looks like a fold-out plate in a book.
- **Open loops / cliffhangers:** end a slide mid-thought so the next slide closes it.
  Concrete devices: a claim stated then justified next slide; "…but there's a catch";
  a named thing withheld ("the fourth is the one nobody books"). **[B/C]**
- **Visual continuity:** consistent grid, type scale, and margin across slides so swiping
  feels like turning pages, not clicking tabs. Discontinuity reads as "post is over." **[C]**
- **Penultimate slide should pay off, not tease.** The value must land *before* the CTA
  slide, or the CTA reads as a toll gate.

---

## 4. Last slide — CTA

Ending with a clear CTA slide is reported to lift engagement **20–30%** vs no CTA slide.
**[B]** DM shares from carousels weighted **3–5×** likes. **[A/B]** Comment-to-DM
automation is reported to convert at **12–18%**, materially better than bio-link
click-through. **[B]**

**Four archetypes that convert** (pick ONE; stacking three reads as desperate): **[B]**
1. **Save** — "Save this for the next time you're planning a launch." Highest yield on
   educational decks. → *"Keep this for when you're planning next spring."*
2. **Send** — "Send this to the person who handles ___." Directly buys the
   highest-weighted signal. → *"Send this to whoever you'd sail with."*
3. **DM keyword** — "DM 'CHECKLIST' and I'll send the template." → *"Write ITINERARY and
   I'll send the twelve-day draft."*
4. **Comment prompt** — a specific question, because comments are what trigger the DM
   automation. → *"Which island would you not skip?"*

**Non-salesy construction rules**
- The CTA must feel like a **continuation of the carousel**, not a sales line bolted on.
- Offer an **object, not a call**: a draft itinerary, a shoulder-season calendar, a packing
  list. Advisors hand you a document; salesmen ask for a meeting.
- **Never** "Link in bio!! 🔥", "DM me to BOOK", countdowns, or fake scarcity.
- One quiet identity line is fine on the CTA slide (Jordan Yates · Luxury Voyage Advisor);
  it substitutes for a hard pitch.
- **Do not use "The Aegean Passport"** anywhere on-slide, in captions, alt text, or file
  names — internal working name only.

---

## 5. Caption structure

| Element | Rule | Tier |
|---|---|---|
| Hard limit | **2,200 characters** | [A] |
| Truncation | **~125 characters** before "… more" on mobile feed | [A] |
| Highest-ER length | **138–150 characters** — fully readable pre-cutoff | [B] |
| Carousel/educational | **300–500 characters** also performs well | [B] |
| Hashtags | Limit 30; practitioner consensus **3–5 relevant**, in-caption | [A/B] |

**Structure to use (BON V):**
1. **Line 1 ≤ 125 characters** — a *different* angle on the hook, not a repeat of slide 1.
   This line carries nearly all the weight because most people never tap "more."
2. **Blank line.** Then 2–4 short paragraphs, **1–2 sentences each**, hard-returned.
   Never a wall of text.
3. **Body:** the context the slides couldn't hold — the specific ship, the season, the
   reason. Concrete nouns and numbers; this is where the advisor voice lives.
4. **CTA in the last line**, mirroring the CTA slide's single ask. Placing it last means it
   reads as a P.S. rather than a pitch. (If the ask is comment-keyword-driven, it must
   appear in the caption — the automation triggers on comments, and the on-slide CTA alone
   won't get typed.)
5. **Hashtags on their own trailing line**, after the CTA, 3–5 max.
6. **Caption SEO:** put the real place/ship/season words in plain language — captions are
   indexed for in-app search, so "Cyclades", "shoulder season", "small-ship" earn reach.

**Target: ~350 characters** for a standard editorial carousel, with the first 125 doing the
work. Go to 138–150 total when the post is a single image-led idea.

---

## 6. Aspect ratio and dimensions

**Decision: produce at 4:5 — 1080 × 1350 px. Keep everything critical inside a centered
1012 × 1350 safe zone.**

- **Feed** displays your uploaded ratio as-is, anywhere from **1.91:1** landscape through
  **4:5** portrait. **[A]**
- **Profile grid** thumbnails are cropped to **3:4** regardless of upload ratio. **[A]**
  This is the trade-off that decides the question.
- **4:5 (1080×1350)** is the recommended default: fills the most feed screen space —
  roughly **25% more vertical space than 1:1** — which directly buys dwell time, and still
  translates acceptably to the 3:4 grid crop. **[A/B]**
- **3:4 (1080×1440)** matches the grid crop exactly, so thumbnails never clip. Choose it
  **only if grid aesthetics outrank feed presence**. **[B]**
- **1:1 (1080×1080)** — no current reason to prefer it. Strictly less screen space than 4:5.
- **Safe zone: centered ~1012 × 1350 px** for logos, type, faces — that inner area survives
  the 3:4 grid crop. **[B]**
- All slides in a carousel must share one ratio, or Instagram crops the rest to match slide 1.
- Export at 1080 px wide minimum; JPEG quality high. Because the identity is paper-and-
  letterpress, watch compression on flat cream fields (`--vintage-passport`) — banding shows.
  Prefer a light grain/paper texture, which both suits the brand and masks banding.

**BON V note:** the grid matters for a boutique publishing-house identity, but the grid is a
second-order surface — reach happens in feed. Ship **4:5**, and compose so the top and
bottom ~90 px of each slide carry no essential type, keeping the 3:4 thumbnail clean.

---

## 7. The rules, condensed

1. Build **7 slides** (5–8 band). Cap 10. >12 only for serialized photo-essays.
2. **4:5, 1080×1350**, uniform across all slides, safe zone 1012×1350.
3. Slide 1: **5–8 word** hook, largest element, one of six psychologies, opens a gap.
4. **Write slide 2 as a second cover** — Instagram re-serves it when nobody swipes.
5. One idea per slide; **"3 / 7"** page numbering; cue swipe explicitly on slide 1 only,
   then use image bleed.
6. Pay off the promise on the **penultimate** slide; CTA slide is the last.
7. **One** CTA, from {save, send, DM keyword, comment question}. Offer an object.
8. Caption: hook in **first 125 chars**, ~350 total, hard line breaks, CTA last, 3–5 tags.
9. Optimize for **saves and sends** (sends ≈ 3–5× a like); ignore likes.
10. Never publish "The Aegean Passport"; no cruise-ship/palm-tree/influencer register.

---

## Caveats

- The only large-sample figures here are Socialinsider's (15M posts, 417k pages,
  Oct 2025–Mar 2026) and Mosseri's on-record statements. Slide-count optima, the "3.4×
  saves", the "40% completion drop past 12 slides", and the "12–18% comment-to-DM
  conversion" all come from vendor blogs without published methodology. Directionally
  consistent across many independent sources, but treat as priors to test, not facts.
- Luxury-travel/editorial accounts are not the population these benchmarks were drawn from.
  Log slide count, completion rate, saves, and sends per post for the first ~20 carousels
  and re-derive the house default from BON V's own numbers.

---

## Sources

- https://www.socialinsider.io/social-media-benchmarks/instagram
- https://www.socialinsider.io/social-media-benchmarks/instagram-engagement-report
- https://www.socialinsider.io/blog/instagram-carousel/
- https://www.dataslayer.ai/blog/instagram-algorithm-2025-complete-guide-for-marketers
- https://www.socialync.io/blog/adam-mosseri-shares-instagram-algorithm-2026
- https://buffer.com/resources/instagram-algorithms/
- https://buffer.com/resources/instagram-image-size/
- https://www.clixie.ai/blog/instagram-algorithm
- https://www.governmentsocialmedia.com/blog/cracking-the-instagram-algorithm-single-photo-vs-carousel-posts
- https://growthcurve.co/secrets-of-the-instagram-algorithm-2025-edition
- https://carouselli.com/blog/instagram-carousel-best-practices
- https://carouselli.com/blog/instagram-carousel-max-photos
- https://www.adpicto.com/en/blog/instagram-carousel-best-practices-2026
- https://www.trymypost.com/blog/instagram-carousel-algorithm-strategy-2026
- https://www.trymypost.com/blog/instagram-carousel-algorithm-2026-guide
- https://www.truefuturemedia.com/articles/instagram-carousel-strategy-2026
- https://www.truefuturemedia.com/articles/instagram-reach-2026-algorithm-reels-carousels-caption-seo
- https://postnitro.ai/blog/post/carousel-swipe-through-rate-optimization
- https://contentdrips.com/blog/2026/06/carousel-hook-examples/
- https://www.imagine.art/blogs/best-carousel-hooks
- https://instacarousel.com/blog/carousel-hooks-that-stop-the-scroll/
- https://www.krumzi.com/blog/15-instagram-carousel-ideas-that-actually-drive-engagement-in-2026
- https://creatorflow.so/blog/instagram-carousel-posts-guide/
- https://creatorflow.so/blog/instagram-post-size-guide/
- https://www.oktopost.com/blog/instagram-grid-size-guide/
- https://socialbee.com/blog/instagram-aspect-ratio-and-image-size/
- https://blog.hootsuite.com/social-media-image-sizes-guide/
- https://blog.hootsuite.com/ideal-social-media-post-length/
- https://lettercounter.org/blog/instagram-character-limit-guide/
- https://www.cloudcampaign.com/smm-tips/how-long-should-a-caption-be
- https://storrito.com/resources/how-instagram-carousels-beat-reels-for-engagement-in-2026-and-when-to-use-each/
- https://www.thesecondbrain.io/blog/carousel-vs-reels-2026-which-gets-you-followers
