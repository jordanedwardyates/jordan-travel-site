---
name: cruise-confirmation
description: Produce a client cruise booking confirmation email from the house template. Use this whenever Jordan asks for a cruise confirmation, a booking confirmation, a "confirmation for <client>", says a client has booked or put down a deposit and needs their paperwork, or wants the confirmation template itself adjusted. Also use it when reviewing or editing any emails/confirmation-*.html file, even if the word "confirmation" isn't in the request.
---

# Cruise Booking Confirmation

The house way to confirm a booking in writing. One template is the source of
truth; every confirmation is a filled copy of it. Never draft a confirmation
from scratch. A client's confirmation and their Dispatch letters must read as
one publishing house, and the template already encodes the brand system.

## The one-page version

1. Copy `emails/cruise-confirmation-template.html` to
   `emails/confirmation-<lastname>-<ship>-<monyyyy>.html`
   (e.g. `emails/confirmation-liebig-marina-mar2027.html`).
2. Fill every `{{TOKEN}}`, following the fill rules in the template's header
   comment, then delete that comment.
3. Run the checker:
   `bash .claude/skills/cruise-confirmation/scripts/check.sh emails/confirmation-<file>.html`
4. Render it and look at it (see Verification below) before handing it over.
5. Deliver the HTML file to Jordan. **Never send it to the client yourself**,
   even if email-sending tools are connected. A confirmation goes to a real
   client about real money; Jordan presses send.

The target look is `emails/previews/cruise-confirmation-template-sample.png`.
If your filled version doesn't resemble it, something went wrong.

## Punctuation: no em dashes

House voice does not use em dashes. Not in the template, not in filled values,
not in the personal note. This is a firm preference, and it is the single
easiest way for a draft to read as machine-written rather than as Jordan.

The repo-wide statement of this rule lives in `CLAUDE.md` under "Punctuation in
outgoing writing"; it governs all client-facing copy, not just confirmations.

Removing them well means recasting the sentence, not swapping the dash for a
comma and moving on. **Never lose information to lose a dash.** A correct
recast keeps every fact and usually runs a word or two longer, so if a
sentence got shorter, check what fell out. A dash usually hides one of four
things, and each has a better form:

| The dash was doing | Use instead |
|---|---|
| Joining two complete clauses | A semicolon, or a period and two sentences |
| Introducing a list or explanation | A colon |
| Setting off a parenthetical | Paired commas, parentheses, or its own sentence |
| Separating short label phrases | The middot (`&middot;`), the house separator |

Two traps. A semicolon needs a **complete independent clause on both sides**,
so it is wrong for the appositive lists this voice is full of ("the warm-water
line, Bermuda and the Canaries and Madeira, so you trade..."); there, commas
or a colon are correct. And never reach for a plain hyphen as a sentence-level
dash: a hyphen joins words (`well-read`, `small-ship`), and using it as
punctuation reads as a typo on a letterpress-feel page.

Examples of the recast, all from this template's own history:

- Before: `Nancy — it's Jordan.` After: `Nancy, it's Jordan.`
- Before: `Keep this note — it and the cruise line's own documents are everything you need.`
  After: `Keep this note. It and the cruise line's own documents are everything you need.`
- Before: `Due 5 November — charged automatically to the Visa on file.`
  After: `Due 5 November, charged automatically to the Visa on file.`
- Before: `The dates that actually matter — final payment, and what to have ready — are near the end.`
  After: `Two things will actually need your attention: the final payment date, and what to have ready before you sail.`

Note the last one. The paired-dash parenthetical is the case where a mechanical
swap fails worst, because the sentence was built around the interruption. Rebuild
the sentence instead.

Watch for both the HTML entity (`&mdash;`) and the literal character. `check.sh`
fails on either, so a slip cannot reach a client.

## Where the numbers come from

Every figure (fares, deposit, balance, dates, room number, confirmation
numbers) comes from Jordan or from the internal quote log: the curation desk
at `/internal/quotes`, or a voyage dossier export. **Never estimate, never
fill a gap with a plausible number.** A confirmation is the client's permanent
record. A guessed fare becomes a dispute, and a guessed final-payment date
becomes a missed one. If a number is missing, stop and ask for it. A stalled
draft is better than a wrong one.

Arithmetic must close: cruise fare + taxes & fees (+ gratuities if a dollar
amount) = total fare, and deposit + balance due = total fare. Check it by hand;
the checker script cannot, because gratuities may be "Included".

## Fill rules

The template's header comment carries the mechanical rules; they matter enough
to repeat:

- Use HTML entities in filled copy (`&rsquo;` `&middot;` `&amp;`). Every house
  email does, and mixed literal/entity text is how encoding bugs slip into
  clients' inboxes.
- The CTA `mailto:` subject is a URL, so percent-encode filled values there
  (spaces become `%20`).
- `{{GRATUITIES}}` is free text: either `$430` (include the `$`) or `Included`.
- Itinerary: duplicate the day-row pattern once per day. Sea days are
  italicized "At sea". Include times where known, departure and arrival at
  minimum.
- Rows that don't apply get deleted, not filled with "N/A". A printed letter
  has no empty fields. The visa line, for instance, stays only when there's
  something to say, and "nothing to arrange" is something to say.
- Optional extras (loyalty number, dining reservations, transfers, air) may be
  added as rows in "Confirmation, at a Glance" or bullets in "Before You
  Sail", following the existing row markup exactly.
- Dates in prose style ("5 March 2027"), matching the Dispatch.

## Voice and posture

A confirmation is a receipt written by an advisor, not a pitch. Reassuring,
calm, specific; zero selling. The "A Note From Jordan" block is the one
personal moment, one or two sentences about *their* room, *their* route. Write
it fresh for each client from what Jordan has said about the booking. Never
reuse another client's note.

Transactional means:

- **No unsubscribe merge tag.** Confirmations are transactional mail; only the
  Dispatch carries `{{unsubscribe_url}}`.
- **No UTM parameters on any link.** Campaign attribution feeds the marketing
  leaderboard, so a confirmation click polluting that data is a bug. Links go
  bare to the official cruise-line voyage page.
- The stamp in the masthead stays **typographic** (the bordered, rotated text
  block). Never an image of a ship, anchor, or palm tree.

## Brand guardrails

These are publish gates, not preferences:

- The phrase "The Aegean Passport" must never appear. It is the Brand Bible's
  internal working name, not a brand. Public identity is
  **BON V: A Travel Company** / **Jordan Yates · Luxury Voyage Advisor**.
- Email HTML can't read CSS variables from `globals.css`, so the site's tokens
  are baked in as hex. Use only these, and keep them in sync with
  `src/app/globals.css` if the tokens ever change:
  - `#1b3154` deep harbor (headings, strong figures, CTA button)
  - `#223e67` aegean ink (body text)
  - `#607d99` sun-faded (labels, muted notes)
  - `#b78b42` compass gold (section labels, rules, stamp), flat, never a
    gradient or metallic effect
  - `#a97f39` darker gold (fine gold text)
  - `#f6f1e8` / `#f1ebdf` paper surfaces, `#c9d6dc` hairlines, `#d9cdb8` frame
- EB Garamond via the existing `@import`, with Georgia fallback. Gmail strips
  the import and falls back; that's expected and fine.
- 640px table layout, `role="presentation"`, inline styles, exactly as the
  template has it. No dark-mode styles; paper doesn't invert.
- The approved signature block image (Squarespace URL) and the script
  signature (`/internal/jordan-signature.png`) stay as-is. Both are live
  production assets.

## Verification before handing over

1. `bash .claude/skills/cruise-confirmation/scripts/check.sh <file>` catches
   leftover tokens, em dashes, banned strings, unbalanced tags, and
   UTM/unsubscribe leaks.
2. Verify the arithmetic (see above) and compare every figure against the
   source Jordan gave. Read them back in your summary so he can eyeball them.
3. Render and look: fill the file, then screenshot via Playwright
   (`executablePath: '/opt/pw-browsers/chromium'` in remote sessions) at
   ~720px wide, and compare against
   `emails/previews/cruise-confirmation-template-sample.png`. The two remote
   signature images 404 offline; that's the sandbox, not a bug.
4. Confirm the header instructional comment is gone.

## Changing the template itself

Improvements to structure, copy, or style go into
`emails/cruise-confirmation-template.html`, never forked quietly inside one
client's confirmation, or the next confirmation regresses. After a template
change, re-render `emails/previews/cruise-confirmation-template-sample.png`
with sample data and update this skill if a rule changed.
