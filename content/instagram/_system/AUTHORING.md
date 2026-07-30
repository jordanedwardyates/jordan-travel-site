# Authoring brief — read this before writing any post or reel

This is the contract every content folder follows. It encodes the findings in
`research-carousels.md`, `research-reels.md`, `research-hashtags.md` and
`research-topics.md`. Follow it exactly; `render.mjs` depends on the shapes.

## The account

Jordan Yates, luxury cruise advisor. Public identity **"BON V: A Travel Company"**
/ **"Jordan Yates · Luxury Voyage Advisor"**. Audience: affluent, 45–70, has
money and taste, resents being sold to, often already cruises and thinks they
know how.

**The name "The Aegean Passport" must never appear anywhere in output.** It is an
internal working name only.

## Voice

Advisor, explorer, curator — never salesman. Match the site copy:

> "Most of what I do isn't booking travel — it's editing it. Any search engine
> can surface a hundred sailings; the work is knowing which three deserve your
> attention, and why."

Rules:
- First person. Em-dashes. Calm, warm, well-read. Luxury implied, never announced.
- No exclamation points. No emoji in slide copy. No "amazing/stunning/must-see".
- No hype, no countdown-timer urgency, no "DM me NOW".
- British-leaning where natural ("travellers", "whilst" only if it reads well).
- Be *specific*. "The 7am tender at Santorini" beats "early tenders".
- Candid is on-brand: naming what's overrated, overpriced or badly designed is
  exactly the voice. Critique the fare, the ship, the decision — never a person.

**Forbidden imagery/vocabulary** (Brand Bible): palm trees, airplanes, suitcases,
cocktails, beach chairs, tropical or influencer aesthetics, "bucket list",
glossy/plastic/startup-minimalism. Evoke instead: Greek islands, old passports,
maritime charts, vintage yacht clubs, letterpress, antique engravings.

## Accuracy

Everything factual must be true. `research-topics.md` has verified specifics —
use them. The load-bearing facts:

- All-aboard is **30–60 min before departure**, stated in **ship's time**, which
  can differ from local time. At tender ports the **last tender is earlier and is
  a separate time**.
- The decisive rule: on the **cruise line's own excursion**, a late return is the
  line's problem (it waits, or pays to reunite you at the next port). On an
  **independent tour**, it is not required to wait and you fund your own recovery.
  Documented contrast: Norwegian Dawn at São Tomé, 27 Mar 2024 (8 guests, private
  tour, left behind) vs. Disney at Dublin (33 guests, ship's excursion, line
  arranged onward travel).
- If left behind: the **local port agent** holds the thread; their details are
  printed in the daily programme. Passport, wallet, phone never leave you.

Do not invent prices, cabin numbers, dates, statistics, or client quotes. If you
want a number and don't have one, write around it.

## Folder layout

```
posts/<YYYY-MM-DD>-<slug>/   meta.json  caption.md  slides.json
reels/<YYYY-MM-DD>-<slug>/   meta.json  transcript.md  frames.json  footage.md
```

`render.mjs` generates `slides/*.jpg`, `frames/*.jpg`, `slate.webm`,
`assemble.sh` and `footage/`. Never hand-write those.

## Carousels

**Exactly 7 slides.** 5–8 is the save/completion sweet spot; past 10 completion
falls off. Rendered 1080×1350.

Structure that works:
1. **cover** — the hook. 5–8 words at the largest size on the slide. Open a gap
   only a swipe closes.
2. **A second hook.** Instagram re-serves non-swiped carousels *starting from
   slide 2*, so slide 2 must stand alone as a cover would. Never "hi, I'm Jordan".
3–5. The substance. One idea per slide.
6. **The payoff** — deliver the promise here, on the penultimate slide.
7. **cta** — last, so it doesn't read as a toll gate.

One CTA only, chosen from: save / send to the person you'd travel with / DM a
keyword / answer a question. Offer an *object* (a shoulder-season calendar, a
draft itinerary, a two-line verdict on a sailing) — never "book a call". Sends
are weighted far above likes, and forwarding to a travel companion is native
behaviour for this audience, so "send this to whoever you'd share a cabin with"
is the highest-value ask.

### `slides.json`

An array of 7 slide specs. `template` is required. Available templates and their
fields (see `templates.mjs`):

| template | fields |
|---|---|
| `cover` | `kicker`, `title`, `subtitle?`, `stamp?: {top,bottom}` |
| `statement` | `kicker?`, `text`, `sub?` |
| `list` | `kicker?`, `title?`, `items: [{n?, head, body?}]` |
| `compare` | `kicker?`, `title?`, `left:{label,items[]}`, `right:{label,items[]}` |
| `plot` | `kicker?`, `title?`, `points: [{label, value}]` |
| `quote` | `quote`, `cite?` |
| `cta` | `kicker?`, `title`, `body?`, `handle?` |
| `photo` | `src`, `brief`, `source?`, `kicker?`, `title?`, `caption?`, `treatment?`, `focus?` |

Inline markup in any text field: `*italic*`, `**bold**`. Straight quotes and
lone hyphens are auto-promoted to curly quotes and em-dashes — just type normally.

**Fit limits** — copy is not auto-shrunk, so respect these or text will overflow:
- `cover.title` ≤ 58 characters. `cover.subtitle` ≤ 105.
- `statement.text` ≤ 90 characters. `statement.sub` ≤ 180.
- `list`: 3–5 items. `head` ≤ 42 chars, `body` ≤ 120. Use 3–4 items when bodies
  are long. **If the title says a number, ship that many items.**
- `compare`: 4–5 items per side, ≤ 34 chars each. Labels ≤ 14 chars.
- `plot`: 4–6 points. `label` ≤ 22 chars, `value` ≤ 90.
- `quote.quote` ≤ 130 characters.
- `cta.title` ≤ 60, `cta.body` ≤ 170.
- `photo.title` ≤ 78, `photo.caption` ≤ 155 (measured against a real render: a
  69-char title sets on two lines, a 146-char caption on three, both clear of
  the footer).

### Photographs

A deck of seven typographic slides is complete and postable. A photograph is an
*upgrade*, and `_system/PHOTO-BRIEF.md` says which shot suits each post.

Drop the image in the post folder as `photos/02.jpg`, add a `photo` slide at
that position (8 slides is allowed for exactly this reason), and re-render.
`treatment: "duotone"` — the default — greyscales the image and multiplies it
onto the cream stock, tinted toward deep-harbor, so a photograph from any source
lands on the same paper as every other slide. `"warm"` keeps its colour under a
paper wash; `"none"` leaves an on-palette image alone. `focus` takes any
`background-position` value when the crop needs steering.

Until the file exists the slide renders a legible "Photograph wanted" card
carrying its own brief, and `build-calendar.mjs` flags it — so a placeholder
can't be published by accident.

### `caption.md`

```markdown
<first line: the hook, under 125 characters — this is all most people see>

<2–4 short paragraphs, blank line between each. ~350 characters total.
Plain sentences. Include real place and season words — captions are
searchable now and that matters more than hashtags.>

<final line: the single CTA>

#tag #tag #tag #tag
```

**Hashtags: exactly 4.** Instagram enforces a ~5-tag cap and Mosseri has said
hashtags are not a reach mechanism — they index, they don't distribute. Mix:
1–2 mid-niche (100k–1M) + 1–2 tight-niche (<100k) + `#bonvtravel` always. Skip
broad >1M tags unless genuinely descriptive. Pull from the bank in
`research-hashtags.md`; do not invent spammy tags.

## Reels

Rendered 1080×1920. Jordan records the voice-over himself, so the transcript is
the deliverable — write it to be *read aloud by a real person who is also an
advisor*. Contractions, breath, a dry aside. Not ad copy.

**Reels are the looser lane.** Mishaps, things that went wrong, blunt critique
and reaction are all in scope here — Jordan's own words, human first, advisor
second. Still never cruel, never punching down at a passenger, and every
complaint resolves into the better alternative.

**Length by format** (trim, never pad):
- listicle, max 3 items — 22–40s
- story / post-mortem — 50–75s
- reaction / critique — 30–50s
- compilation — 12–25s, and make it loop (end frame matches the opening frame)

**Script at 2.6 words per second.** 30s ≈ 78 words, 45s ≈ 117, 60s ≈ 156. Count
your words and state the count.

The hook is everything: the scroll decision happens in ~1.7s and the algorithm
reads 3-second retention. Frame 1 must carry a ≤6-word text claim *and* the
spoken hook must name the specific thing in the first 8–12 words. Prefer
pattern-interrupt or curiosity-gap over social proof. Negative framing wins
("three mistakes", "what to avoid") — then resolve it on screen.

Change on-screen text every 1.5–3s; land a pattern interrupt every 3–5s.

### `frames.json`

Array of `frame` specs, one per on-screen text beat:

```json
{ "template": "frame", "kicker": "optional small caps", "text": "the beat",
  "sub": "optional second line", "seconds": 4, "timecode": "0:07",
  "tone": "warn", "size": 108, "align": "left", "label": "BON V" }
```

- `seconds` drives both the `slate.webm` hold and the `assemble.sh` cut length.
  They must sum to the stated runtime.
- `tone: "warn"` flips the frame to a deep-harbor ground with cream text. Use it
  for the mishap/problem beats so the turn in the story is visible when muted.
  Roughly a third of frames at most.
- `text` ≤ 60 characters at default size; drop `size` to 92 or 80 for longer
  lines. `sub` ≤ 90.
- 6–12 frames for most reels.

### `transcript.md`

```markdown
# <title>

**Format:** post-mortem · **Runtime:** ~58s · **Words:** 151 (at 2.6 w/s)
**Hook (first 3s):** <the spoken hook, verbatim>

## Read-aloud script

> [0:00 — frame 01] Spoken line, written the way you'd say it.
>
> [0:04 — frame 02] Next line.

## Delivery notes
- <pace, where to pause, which beat to land dry>

## On-screen text
- 01 · 0:00 · "…"
```

Face vs b-roll: face for 0–3s, b-roll through the body, back to face for the
verdict. Pure talking head past 30s is the weakest configuration.

### `footage.md`

What to film or pull, shot by shot, mapped to frame numbers. Every clip request
must name a **source and a rights basis**.

**Rights rule — this is not negotiable.** Do not source passenger UGC (the
viral "left at the dock" clips are filmed and owned by individual passengers;
no cruise line can license them, and Jordan's advisor permissions do not cover
them). Use only:
1. Footage Jordan shoots himself — always the first suggestion.
2. Cruise-line assets obtained through the **trade/advisor portal or his BDM**.
   Press-center URLs are listed in `research-topics.md`, but most license assets
   for editorial coverage *of the line*, not an advisor's own brand promotion —
   so flag them as "confirm with BDM", never as cleared.
3. Genuinely licence-free stock: Pexels, Unsplash, Coverr. Give a specific
   search term. For antique maritime texture, Library of Congress and
   Rijksmuseum public-domain collections suit the brand better than stock.

For mishap reels this means **reconstruct, don't repost**: Jordan to camera, a
static empty-berth or gangway shot, and on-screen text carrying the story.

### `meta.json`

```json
{
  "date": "2026-08-14",
  "type": "post",
  "pillar": "pricing-candor",
  "title": "Human title",
  "hook": "The slide-1 hook",
  "format": "listicle",
  "slides": 7,
  "cta": "send",
  "hashtags": ["#a", "#b", "#c", "#bonvtravel"],
  "status": "draft"
}
```

For reels use `"type": "reel"`, and replace `slides` with
`"frames": 8, "runtime_seconds": 58, "words": 151`.

## Links

Where a caption points to the site, use
`bonv.travel/logbook/<slug>?utm_source=instagram&utm_medium=social&utm_campaign=evergreen-2026&utm_content=<folder-slug>`
— the quote form already reads `utm_campaign`/`utm_content` and resolves them to
a source campaign, so this closes the attribution loop. Existing Logbook slugs
worth linking: `when-to-sail-the-greek-islands`, `never-pay-retail`,
`river-vs-ocean-how-to-choose`. Don't invent other slugs; link the bio instead.
