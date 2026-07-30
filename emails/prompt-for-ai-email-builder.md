# Prompt: Build a BON V cruise email (paste this into Claude)

You are helping **Jordan Yates**, a luxury cruise travel advisor, write a **personal
HTML email** to a client. Match the house style below exactly. Output a single
self-contained HTML file (all CSS inline in a `<style>` block, email-safe tables).

---

## The brand (non-negotiable)

- Public name: **"BON V: A Travel Company"** / **"Jordan Yates · Luxury Voyage Advisor."**
  Never use the phrase "Aegean Passport" anywhere in the output.
- Feel: a boutique European publishing house — Aman, Belmond, Monocle, Kinfolk,
  vintage National Geographic. **Printed and slightly worn, never glossy or "startup."**
- Voice: advisor, explorer, curator — **never a salesman.** Warm, calm, well-read.
  Luxury implied, never announced.
- **No** palm trees, airplanes, cruise ships, suitcases, cocktails, beach chairs, or
  tropical/influencer imagery. Iconography leans passport stamps, compass, coordinates.
- Gold is a **faded** gold, never metallic.

### Color tokens (use only these)
| Name | Hex |
|---|---|
| Deep Harbor (headings/ink) | `#1B3154` |
| Aegean Ink (body text) | `#223E67` |
| Sun-Faded Passport (muted) | `#607D99` |
| Salt Air (thin rules) | `#C9D6DC` |
| Vintage Passport (card paper) | `#F6F1E8` |
| Page paper | `#F1EBDF` |
| Card border | `#D9CDB8` |
| Compass Gold (accents) | `#B78B42` (darker text gold `#A97F39`) |

### Type
- Serif everything: **EB Garamond** (Google Fonts), fallback Georgia/Times.
- Signature name in script: **Mrs Saint Delafield**, fallback Snell Roundhand.
- Small labels/eyebrows: uppercase, letter-spacing 2–4px, in Compass Gold.

---

## The email structure (in order)

1. **Masthead** — "STAMPED" eyebrow · "BON V: *A Travel Company*" · "Jordan Yates ·
   Luxury Voyage Advisor," with a small **rotated gold passport stamp** in the top
   right. For a personal note the stamp reads e.g. "BY HAND / FOR [Name]" plus a set
   of coordinates meaningful to them.
2. **Dateline** — a gold eyebrow (e.g. "A NOTE, NOT A NEWSLETTER") + a large serif
   headline.
3. **The letter** — warm, personal opening in *italic*, then 1–2 plain paragraphs.
4. **Callout boxes** — a thin-bordered box for a key note; a gold left-rule block for
   "JORDAN'S TAKE" (his opinionated recommendation, in italic).
5. **Sections** — each opens with a gold top-rule, a Roman-numeral gold eyebrow
   ("I · MOBILE, ALABAMA"), and an italic muted subtitle.
6. **Fare cards** — one bordered card per sailing (see recipe below). Mark the
   recommended one with a gold border + background tint and "· My pick" in the header.
7. **CTA** — one restrained sentence + a single deep-harbor button.
8. **Sign-off** — closing line, the script "Jordan," then the title line.
9. **Signature image** (see asset) and a minimal centered colophon
   ("BON V: *A Travel Company*" · "In partnership with Luxury Cruise Connections").
   A **personal** email has **no unsubscribe line**.

### Signature block asset (use as-is, don't recreate/recolor/crop)
`https://images.squarespace-cdn.com/content/v1/5cfd848d3b35680001da3f7d/9c23922a-987b-4532-830c-6e5415363a97/Background+removed+Signature_Block_Photo_July_13_with_LCC_website-removebg.png?format=2500w`

Its background is transparent — always place it inside a wrapper with an
explicit `bgcolor="#f6f1e8"` (see Gmail section below). Never leave it sitting
directly on a CSS-only background with no `bgcolor`.

---

## Gmail dark-mode safety (required — do not skip)

Gmail runs its own heuristic color-inversion pass and does **not** honor
`<meta name="color-scheme">` / `supported-color-schemes` the way Apple Mail and
Outlook do. Left undefended, this exact cream/ink "paper" palette gets flipped
into a muddy dark-olive inversion, and the transparent signature PNG gets
inverted into a washed-out negative image. This has actually happened in a
sent email — treat every rule below as required, not optional polish.

Every email you generate must include **all** of the following:

1. **Both meta tags** in `<head>`:
   ```html
   <meta name="color-scheme" content="light">
   <meta name="supported-color-schemes" content="light">
   ```
2. **`bgcolor` HTML attributes** on every outer paper/card table and `<td>`,
   matching the inline `background-color` exactly (e.g. `bgcolor="#f1ebdf"`
   alongside `style="background-color:#f1ebdf;"`). Gmail's inversion is less
   likely to flip a background where the legacy attribute and the CSS agree.
3. **A dark-mode override block** in `<style>`, plus Gmail's own `[data-ogsc]`
   hook (the attribute Gmail stamps on elements after it inverts them):
   ```css
   img { filter:none !important; -webkit-filter:none !important; }
   @media (prefers-color-scheme: dark) {
     body, .paper { background-color:#f1ebdf !important; }
     .weathered { background-color:#f6f1e8 !important; }
   }
   [data-ogsc] .paper, [data-ogsc][class="paper"] { background-color:#f1ebdf !important; }
   [data-ogsc] .weathered, [data-ogsc][class="weathered"] { background-color:#f6f1e8 !important; }
   ```
4. **Opaque backing behind the signature image** — the `<td>` and wrapping
   `<div>` around it must carry `bgcolor="#f6f1e8"` and
   `background-color:#f6f1e8` inline, so the transparent PNG never floats
   directly on an inverted background.

The goal is defeating Gmail's inversion entirely, not designing a dark
variant — same "paper doesn't invert" principle as the site itself.

---

## Copy-paste CSS recipe (the "aged paper" look)

```html
<head>
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&family=Mrs+Saint+Delafield&display=swap');
  body { margin:0; padding:0; }
  .serif { font-family:'EB Garamond', Georgia, 'Times New Roman', serif; }
  .script { font-family:'Mrs Saint Delafield', 'Snell Roundhand', cursive; }
  img { filter:none !important; -webkit-filter:none !important; }
  .paper { background-color:#f1ebdf; }
  .weathered {
    background-color:#f6f1e8;
    background-image:
      radial-gradient(ellipse 60% 50% at 0% 0%, rgba(183,139,66,0.07), transparent 70%),
      radial-gradient(ellipse 50% 45% at 100% 6%, rgba(96,125,153,0.06), transparent 70%);
  }
  @media (prefers-color-scheme: dark) {
    body, .paper { background-color:#f1ebdf !important; }
    .weathered { background-color:#f6f1e8 !important; }
  }
  [data-ogsc] .paper, [data-ogsc][class="paper"] { background-color:#f1ebdf !important; }
  [data-ogsc] .weathered, [data-ogsc][class="weathered"] { background-color:#f6f1e8 !important; }
</style>
</head>
```
- Outer layout: a full-width `.paper` table, centered, holding one **640px** `.weathered`
  card with `border:1px solid #d9cdb8`. Section padding ~`52px` left/right.
- Put `bgcolor="#f1ebdf"` on the outer `.paper` table and its `<td>`, and
  `bgcolor="#f6f1e8"` on the inner `.weathered` table — every time, not just
  once at the top.

### Fare-card pattern (repeat per sailing)
- Wrapper: `<table>` with `border:1px solid #1b3154; background:rgba(255,255,255,0.35);`
  (recommended card: `border:1px solid #b78b42; background:rgba(183,139,66,0.05);`).
- Header row: left = "Ship · N nights" (ink, uppercase, spaced); right = dates (gold).
- `<h2>` = region ("The Bahamas"). Italic muted subtitle = the route/tagline.
- One warm paragraph (2–3 sentences).
- "PORTS OF CALL" gold label + a `·`-separated port list.
- A thin-ruled price table: room type (bold ink) on the left, price on the right.
  Show a strike-through original price where there's a discount; add "≈ $X / night pp".
- A **gold perk line**, e.g. "$50 onboard credit from Carnival · **$100 back from me**".
- Optional italic muted line for deposit/final-payment terms.

---

## What I already built (for context)

I wrote Jordan a personal email to a client named **Eddy** (they met at Big Cedar
Lodge). It laid out **six February 2027 sailings** from **Mobile** and **Galveston**,
balcony-first (that's what Eddy and his wife discussed), each with the perk that comes
back to Eddy. The tone: reconnecting warmly, "this is a starting point, we'll go back
and forth," and "no judgment on room choice — fun people have a good time anywhere."
Jordan's rule for these smaller sailings: **give the client at least $100 back, on top
of the cruise line's own offer.**

### The data (so you can rebuild or edit)
**MOBILE, AL — Carnival (new-to-Eddy Bahamas ports)**
- *Carnival Spirit · 8 nights* — Sat Feb 6 → Feb 14, 2027. Ports: Key West,
  Celebration Key, Princess Cays, Nassau. **Balcony (8C) $921 pp** (~$115/night).
  Perk: $50 onboard credit + $100 back from Jordan.
- *Carnival Spirit · 6 nights* — Sun Feb 14 → Feb 20, 2027. Ports: Celebration Key,
  Princess Cays. **Entry Balcony (8D) $778 pp** (~$130/night). $49 pp deposit, final
  Nov 16. Perk: $50 OBC + $100 back. *(Closest to the ~5 days Eddy wanted.)*

**GALVESTON, TX — newer ship + new ports**
- *Royal Caribbean Symphony of the Seas* — Feb 7 → Feb 14, 2027. Western Caribbean
  (Cozumel, Costa Maya, Roatán). **Balcony (4D) $1,003 pp** (normally $1,311) · Interior
  $754 (normally $877). Refundable $200 deposit, final Nov 25. Perk: $100 back.
  Also a Jan 31 → Feb 7 sailing at $1,189 pp balcony.
- ⭐ *Carnival Miracle · 10 nights (MY PICK)* — Feb 1 → Feb 11, 2027. Eastern Caribbean,
  all new ports: Celebration Key, Half Moon Cay, Grand Turk, Amber Cove. ~2,100 guests
  (intimate, ranked #5 in fleet). **Balcony (8C) $1,147 pp** (~$115/night, best value).
  Perk: $50 OBC + $100 back; $50 to move dates.
- *Carnival Dream · 7 nights* — Sat Feb 13 → Feb 20, 2027. Bahamas: Key West,
  Celebration Key, Nassau. **Balcony (7C) $1,102 pp** · Ocean View $907 · Interior $727.
  Perk: $50 OBC + $100 back.

---

## Your task

Ask me who the email is for and what sailings to include, then produce the finished
HTML email following everything above. If I just want edits to the Eddy email, use the
data above. Keep it warm and unhurried — a letter from a trusted advisor, not a flyer.
