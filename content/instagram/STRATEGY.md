# Where this stands, and the open decision

Written at the end of the build session. Read this before touching the bank.

## What exists

- **70 carousels**, 7 slides each, and **30 reels** with transcripts, storyboard
  frames, timing slates and per-reel `assemble.sh`. 732 images, all 1080px
  native JPEG. `build-calendar.mjs` reports clean.
- **Tooling** that makes the bank cheap to change: copy lives in JSON, so
  restyling every image is one command (`render.mjs`), and the linter enforces
  the per-template fit limits so overflowing copy can't ship.
- **A desk** at `/internal/instagram?key=…` to browse, preview and copy from.
- **`PHOTO-BRIEF.md`** — one photograph per post, with sources and paste-ready
  snippets. No photography is included; see the rights note in `README.md`.
- **`_system/feed-mockup.html`** — the whole bank as the profile grid would show
  it, plus three decks slide by slide.

## The open decision

The bank was built as a ten-week publishing schedule. On review that is the
wrong frame for an account **with no followers yet**, for three reasons:

1. **Cold reach on Instagram is Reels.** Carousels mostly reach people who
   already follow you or who land on the profile. Their strength — saves and
   sends — is a retention signal, earned from an audience you already have.
2. **Cream paper and quiet serif is a zero-motion, low-contrast thumbnail.** The
   aesthetic that makes the profile cohere is the aesthetic a stranger scrolls
   past. Cohesion is a profile virtue; it does no work in isolation.
3. **A stranger has no brand equity to trade on.** A kicker like "QUIET LUXURY"
   means something on the eleventh post and nothing on the first.

So the 70 carousels are best understood as **profile depth and conversion
material** — what convinces someone who has already arrived — and the 30 reels
as **the acquisition engine**. Both are needed; not in equal measure right now.

### The proposal not yet acted on

Restructure into a 30-day acquisition plan:

- Reels-led, roughly 70–80% reels while follower count is near zero.
- Hold back the strongest ~8 carousels as profile depth, so a visitor who lands
  on the grid finds substance immediately.
- Order the reels as a **hook test**, using Instagram's Trial Reels (publish to
  non-followers only) to test against cold traffic without cluttering the grid.
- Rebalance CTAs toward DMs. This business closes in conversation, not link
  clicks — "send me a sailing you're weighing up" is the strongest ask in the
  bank and should appear on far more pieces than it does. "Link in bio" is close
  to dead weight with no followers.
- Seed from warm ground first: The Dispatch list and existing clients. Twenty
  followers who genuinely engage teach the algorithm who to show you to.

### The tension to decide consciously

The Brand Bible forbids ships, and cruise-intent audiences engage with ships and
destinations — Instagram reads visual signals, not just captions. That constraint
works against cold discovery for cruise content. The intended resolution is
photography at slide 2 (what `PHOTO-BRIEF.md` sets up): a duotoned Aegean quay is
still on-brand in a way a cream text slide isn't legible to a stranger.

### The honest caveat

100 pieces were produced before any of them met a real audience. That is a
library, not a validated plan — the assumptions in `research-*.md` are sound but
they are priors, not measurements. Post 10–15, log completion, saves and sends,
and re-derive the house defaults from actual numbers. `research-carousels.md`
says this explicitly in its last point.

## Next session starts here

Decide: execute the calendar as written, or restructure to the 30-day
acquisition plan above. Nothing in the bank has to be rewritten either way —
the sequencing and the CTA mix are what change.
