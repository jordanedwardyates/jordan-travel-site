# Batch 1 — three shots, one afternoon

Three decks are wired for a photograph and are complete apart from one JPG each.
All three shots are things on your own desk, so there is no rights question and
nothing to request from anyone.

Shoot in daylight where noted, save as a **4:5 crop at 1080×1350**, drop the file
at the path given, then run:

```bash
node content/instagram/_system/render.mjs 2026-09-13   # etc.
node content/instagram/_system/build-calendar.mjs      # confirms the warning clears
```

The slide copy is already written and fitted. You are only supplying the picture.

---

## 1 · `posts/2026-09-13-passport-six-months/photos/02.jpg`

**Your own expired passport, open flat on a scrubbed kitchen table, one desk lamp.**
A worn cover, a corner of a stamped page catching the light.

- Shoot at a **shallow depth of field** so the expiry line and every piece of
  personal data is illegible. This matters — it is a document, and it must not
  read as anyone's real document.
- Never a client's passport. Not in frame: names, numbers, the photo page,
  airline documents.
- Ten minutes.

## 2 · `posts/2026-08-13-the-port-agent/photos/02.jpg`

**A rubber date stamp stood on its ink pad beside a folded printed sheet.**
Harsh window light, the paper's edges slightly curled.

- Shoot deliberately shallow so **no name, number or line marking is legible** —
  this must never read as a real record.
- Any desk. The point is to make an abstract instruction ("photograph the port
  agent's details") into a physical object.

## 3 · `posts/2026-09-28-the-number-you-call-at-2am/photos/06.jpg`

**Your desk at night: one lamp, everything else off.**
A notebook with a half-written pencilled list, a landline handset lifted off its
cradle and resting on the blotter, the window black behind.

- Not in frame: screens, legible notes, brand marks.
- This is the payoff slide of the trust pillar, so it wants to look like an
  unreasonable hour rather than a staged desk.

---

## What the treatment does

Each is set to `treatment: "duotone"`, which greyscales the image and multiplies
it onto the cream stock, tinted toward deep-harbor. A phone photograph in mixed
light will still land on the same paper as every other slide, so don't over-think
colour — light and composition are what matter. If a shot is already on-palette
and you'd rather keep it, change that field to `"warm"` or `"none"` in the
deck's `slides.json`.

`focus` accepts any CSS `background-position` if the crop needs steering — e.g.
`"center 40%"` to favour the top of the frame.
