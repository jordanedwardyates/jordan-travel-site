# Photo sourcing brief — one photograph per post

An upgrade path for the 70 carousels in `posts/`. **Every deck is already
complete and postable without a photograph.** Nothing here is a gap; it is the
next pass, taken one folder at a time, in whatever order the shots become
available.

## How to use this

1. Get the image. Crop to **4:5 (1080×1350)**, save as `photos/NN.jpg` inside
   the post folder, where `NN` is the slide position it takes (`photos/02.jpg`
   or `photos/06.jpg`).
2. Paste the JSON snippet into that post's `slides.json` **at that position**.
   The `photo` slide *replaces* the slide sitting there and absorbs its copy
   into `title` / `caption` — every snippet below is already written that way —
   so the deck stays at exactly 7 slides, per `AUTHORING.md`.
3. Re-render: `node content/instagram/_system/render.mjs 2026-08-01`
   (on this machine: `/opt/homebrew/bin/node`). Omit the filter to do everything.
4. Until the file exists, `render.mjs` draws a placeholder carrying the `brief`
   and `source` strings, so the deck still previews with its photo slot visible.
   You can paste the snippet today and shoot the picture later.

**Why slide 2 or slide 6, and nothing else.** Instagram re-serves a non-swiped
carousel starting from slide 2, so a photograph there works as a second cover
and does argumentative work — a place, a structure, a thing made visible.
Slide 6 is the payoff, the last beat before the CTA; a photograph there reads as
a breath. Where slide 6 currently holds a `quote` worth keeping in type, the
recommendation below is slide 2. Where the displaced slide 6 is a quote we can
carry, the snippet puts the short form in `title` and the sentence in `caption`.

**Treatments.** `duotone` (the default) is the house look: greyscale, multiplied
onto cream, tinted toward deep-harbor — ink on paper, so a photograph sits on
the same stock as every other slide. `warm` keeps colour under a paper wash;
use it only where the light *is* the subject. `none` for an antique plate that
is already on palette.

---

## RIGHTS — read before sourcing anything

- **Passenger UGC is never usable.** Not a repost, not a screenshot, not "with
  credit". It is owned by the individual who shot it, no cruise line can license
  it on their behalf, and an advisor's permissions do not reach it.
- **Cruise-line press centres are not a licence for our marketing.** Nearly all
  of them grant use for editorial/press coverage *of the line*, not for an
  advisor's own brand promotion. Line assets must therefore come through the
  **travel-advisor / trade portal or the BDM, with written confirmation on
  file**. Anything below flagged "confirm with BDM" is exactly that: a request
  to make, never a cleared asset. Press-centre and portal URLs live in
  `research-topics.md` §3 — no per-line written terms are confirmed there.
- **Genuinely licence-free** means Pexels, Unsplash, Coverr (royalty-free,
  commercial use, no attribution required) or public-domain archives — the
  Library of Congress **Detroit Publishing Company photochrom** collection and
  the **Rijksmuseum** online collection of maritime prints and engravings. Both
  archives suit this brand better than modern stock wherever an antique plate
  would do the job.
- **Shot discipline, everywhere:** no identifiable faces without a release; no
  legible personal data (passport numbers, names, prescription labels, booking
  references); no legible line branding, ship name or logo. And per
  `research-topics.md`: **never use stock imagery of a specific named ship to
  represent a voyage we sell.** Either a line-approved asset or generic
  sea-and-port material.
- Nothing in the visual vocabulary of the forbidden list: no palm trees,
  airplanes, suitcases, cocktails, beach chairs, loungers, tropical or
  influencer imagery, and **no cruise-ship exterior as the subject of a frame**.
  Details of a ship — brass, teak, a davit, a gangway, a corridor — are welcome;
  the brochure hero shot is not.

---

## Pricing candor

**`2026-08-01-never-pay-retail`** — *The published fare is the last price to pay*
- **Shot** — a ship-chandler's ledger open flat on a wooden desk, columns of pencilled figures with several struck through and rewritten above, hard raking window light down the gutter. Not in frame: screens, laptops, printed brochures, any legible company name.
- **Slide 2** — second cover; the struck-through figure *is* the argument that retail is an opening position.
- **Get it** — 1 Jordan: his own desk, an hour of morning light, a secondhand ledger. · 2 n/a. · 3 Unsplash — "old ledger book pencil handwriting"; or Rijksmuseum, 18th–19th-c. Dutch shipping account books and bills of lading (an engraved plate suits this better than a photograph).
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Start here",
  "title": "Retail is an opening position, not a price.",
  "caption": "The published fare exists so there is something to discount from. It is a starting number with a marketing calendar attached.",
  "treatment": "duotone", "focus": "center",
  "brief": "Ledger open flat, pencilled figures struck through and rewritten, raking window light. No screens, no branding.",
  "source": "Jordan's own desk first; else Unsplash 'old ledger book pencil handwriting' or a Rijksmuseum shipping account book" }
```

**`2026-08-02-what-the-fare-includes`** — *The cheap fare is rarely the cheap holiday*
- **Shot** — a marble café table in Piraeus at eight in the morning, two cups drained, a folded paper bill weighted under a saucer, low side light, harbour water soft and out of focus behind. Not in frame: cocktails, branded glassware, any vessel.
- **Slide 6** — the payoff breath; the disembarkation-morning bill is what the deck has been arguing toward.
- **Get it** — 1 Jordan: shoot it on the next Athens embarkation morning. · 2 n/a. · 3 Pexels — "greek cafe marble table morning coffee harbour".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Price the whole week, then choose the ship.",
  "caption": "Costed to the same finish line, the decision stops being about money and becomes which ship you'd rather spend seven mornings on.",
  "treatment": "duotone", "focus": "center 60%",
  "brief": "Piraeus marble cafe table at 8am, two drained cups, folded bill under a saucer, harbour soft behind.",
  "source": "Jordan's own, next Athens embarkation morning; else Pexels 'greek cafe marble table morning coffee harbour'" }
```

**`2026-08-03-when-to-book`** — *The last-minute luxury bargain mostly isn't*
- **Shot** — a vintage yacht-club key board: numbered brass hooks, nearly all of them empty, one key still hanging, dust and afternoon light across varnished mahogany. Not in frame: plastic keycards, hotel branding, people.
- **Slide 2** — second cover; scarcity stated as an object, which is the claim slide 2 has to carry alone.
- **Get it** — 1 Jordan: any yacht or sailing club he visits — ask at the desk. · 2 n/a. · 3 Unsplash — "brass numbered key hooks board wooden".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Why waiting fails here",
  "title": "Small ships run out of cabins before they run out of price.",
  "caption": "A line with a few hundred suites has no distressed inventory to dump. It has a waitlist. Scarcity is the pricing strategy.",
  "treatment": "duotone", "focus": "center",
  "brief": "Yacht-club key board, numbered brass hooks nearly all empty, one key left, afternoon light on mahogany.",
  "source": "Jordan's own (a club desk); else Unsplash 'brass numbered key hooks board wooden'" }
```

**`2026-08-04-deposit-and-final-payment`** — *The deposit is a price, not a formality*
- **Shot** — a pocket diary open at a two-week spread, four dates ringed in pencil, a fountain pen laid across the gutter, cold north light. Not in frame: phones, laptops, branded stationery, legible client detail.
- **Slide 6** — the payoff breath; four dates on paper is the answer the deck arrives at.
- **Get it** — 1 Jordan: his own diary, ten minutes. · 2 n/a. · 3 Unsplash — "open paper diary pencil fountain pen desk".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Choose the deposit that matches your life, not the headline.",
  "caption": "Fixed dates and settled health: take the lower fare. A parent unwell, a business mid-sale, a passport near expiry: pay for the exit and sleep.",
  "treatment": "duotone", "focus": "center",
  "brief": "Pocket diary open, four dates ringed in pencil, fountain pen across the gutter, cold north light.",
  "source": "Jordan's own diary; else Unsplash 'open paper diary pencil fountain pen desk'" }
```

**`2026-08-05-onboard-credit`** — *Onboard credit is not the same as money*
- **Shot** — three perforated paper chits fanned on a linen cloth, one already torn from its stub, flat overhead light, letterpress-printed rather than glossy. Not in frame: casino chips, cocktails, card machines, legible branding.
- **Slide 2** — second cover; credit shown as scrip is the whole point of the deck in one frame.
- **Get it** — 1 Jordan: old ferry or tram coupons from a market stall, shot on his own table. · 2 n/a. · 3 Rijksmuseum — 19th-c. printed tickets and coupon sheets (search the online collection for ticket/coupon prints); or Unsplash "old paper ticket stubs perforated".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "What it really is",
  "title": "Credit keeps your money on the ship. That is the point of it.",
  "caption": "A line would rather hand you spend than cut the fare, because credit comes back to it at retail. Useful, but not a lower price.",
  "treatment": "duotone", "focus": "center",
  "brief": "Three perforated paper chits fanned on linen, one torn from its stub, flat overhead light, no branding.",
  "source": "Jordan's own (market-stall coupons); else Rijksmuseum 19th-c. printed tickets, or Unsplash 'old paper ticket stubs perforated'" }
```

**`2026-08-06-free-perks-that-arent`** — *Nothing on a cruise brochure is free*
- **Shot** — a letterpress type case with the word FREE set in metal type in a composing stick, mirrored and upside down as type sits, hard raking light, ink-blackened lead against grey wood. Not in frame: neon, price stickers, glossy signage.
- **Slide 2** — second cover; the word taken apart into metal is the hook restated without a sentence.
- **Get it** — 1 Jordan: any working letterpress or print museum will set a word for a visitor. · 2 n/a. · 3 Unsplash — "letterpress metal type composing stick close up".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The mechanism",
  "title": "A perk is not a gift. It is a fare with the discount pointed somewhere.",
  "caption": "Lines would rather add than subtract: a perk sounds generous and a lower fare sounds like weak demand. Both come out of the same margin.",
  "treatment": "duotone", "focus": "center",
  "brief": "FREE set in metal type in a composing stick, mirrored as type sits, hard raking light on inked lead.",
  "source": "Jordan's own at a working letterpress; else Unsplash 'letterpress metal type composing stick close up'" }
```

**`2026-08-07-single-supplement`** — *The single supplement, explained honestly*
- **Shot** — a single berth made up in a small cabin: one pillow dented, the other side of the bed untouched, morning light through a porthole laid in an oval across white linen. Not in frame: suitcases, towel animals, turndown chocolates, any legible ship name.
- **Slide 6** — the payoff breath; a quiet room, after six slides of arithmetic.
- **Get it** — 1 Jordan: his own ship-inspection photographs — the most likely source by far. · 2 BDM or advisor portal: cabin interiors for a line he sells (confirm with BDM in writing). · 3 Free stock is weak here; Unsplash "porthole light on white bed linen" is the nearest search worth trying.
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Bring the sailing to the fare, not the fare to the sailing.",
  "caption": "Choose the region and the season, then let me find the weeks where solo terms are kindest. The itinerary rarely suffers for moving a fortnight.",
  "treatment": "duotone", "focus": "center 40%",
  "brief": "Single berth made up, one pillow dented, porthole light in an oval across white linen. No luggage, no branding.",
  "source": "Jordan's own ship-visit library; else BDM/advisor portal (confirm with BDM); Unsplash 'porthole light white bed linen' as a distant third" }
```

---

## Port day strategy

**`2026-08-08-the-clock-that-leaves`** — *The clock that leaves without you*
- **Shot** — a brass bulkhead clock on painted steel, hands reading 4:40, paint chipped and touched-in around the bezel, hard side light. Not in frame: phones, digital displays, wrist watches with legible logos.
- **Slide 2** — second cover; the load-bearing all-aboard fact stays early in the deck, carried in the photo's own title.
- **Get it** — 1 Jordan: on any ship visit, or a maritime museum. · 2 BDM/portal: bridge and interior details (confirm with BDM). · 3 Unsplash — "brass ship clock steel bulkhead".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The number people get wrong",
  "title": "All-aboard is 30 to 60 minutes *before* departure.",
  "caption": "Printed in the daily programme, posted at the gangway, and stated in ship's time. Sailing time is not your deadline — all-aboard is.",
  "treatment": "duotone", "focus": "center",
  "brief": "Brass bulkhead clock on painted steel, hands at 4:40, chipped paint round the bezel, hard side light.",
  "source": "Jordan's own (ship visit or maritime museum); else BDM/portal interior details (confirm with BDM); Unsplash 'brass ship clock steel bulkhead'" }
```

**`2026-08-09-the-last-tender`** — *The last tender is not the all-aboard*
- **Shot** — an empty tender pontoon at an anchorage: wet steel steps, slack ropes still dripping, low swell slapping the platform, no boat alongside, late-afternoon light. Not in frame: the ship, crowds, life jackets, identifiable faces.
- **Slide 2** — second cover; two deadlines is a structural claim and this makes the second one visible.
- **Get it** — 1 Jordan: on any tendered call, shot from the pontoon while waiting. · 2 BDM/portal: tender-operation imagery (confirm with BDM). · 3 Pexels — "empty floating pontoon steps sea swell".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The mechanics",
  "title": "A tender port has two deadlines and you only read one.",
  "caption": "All-aboard is when the gangway closes. The last tender is when the last boat leaves the shore — and a full boat takes twenty minutes to load and cross.",
  "treatment": "duotone", "focus": "center 55%",
  "brief": "Empty tender pontoon, wet steps, slack dripping ropes, low swell on the platform, no boat, no crowd.",
  "source": "Jordan's own on a tendered call; else BDM/portal tender imagery (confirm with BDM); Pexels 'empty floating pontoon steps sea swell'" }
```

**`2026-08-10-ship-excursion-or-independent`** — *Ship's excursion or independent guide*
- **Shot** — a single-lane inland road seen over a dry-stone wall: cypresses, heat shimmer on the tarmac, the road empty and climbing away from the coast, no vehicle in it. Not in frame: liveried coaches, airplanes, tour groups, road signs naming a resort.
- **Slide 6** — the payoff breath, with the quote carried into the caption; the hour of road *is* the margin the deck is about.
- **Get it** — 1 Jordan: from any inland excursion, shot out of the coach window is enough. · 2 n/a. · 3 Unsplash — "empty country road cypress trees heat haze".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The whole of it",
  "title": "Knowing which days have no margin is the job.",
  "caption": "The excursion choice follows from that, not the other way round. — Jordan Yates · Luxury Voyage Advisor",
  "treatment": "duotone", "focus": "center 65%",
  "brief": "Single-lane inland road over a dry-stone wall, cypresses, heat shimmer, empty of vehicles.",
  "source": "Jordan's own from an inland excursion; else Unsplash 'empty country road cypress trees heat haze'" }
```

**`2026-08-11-seven-hours-ashore`** — *How to actually spend seven hours ashore*
- **Shot** — the stone quay at Chania before the shops open: shutters down, chairs still stacked, long low shadows across wet flagstones where someone has hosed them, no ship visible anywhere in frame. Not in frame: vessels, coach parties, menu boards, identifiable faces.
- **Slide 2** — second cover; the quiet first hour is the deck's entire argument, and it stops a scroll on its own.
- **Get it** — 1 Jordan: any Cretan or Cyclades call, ashore at seven. · 2 n/a. · 3 Unsplash — "Chania old harbour early morning empty" / "greek stone quay dawn shutters closed".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Do the arithmetic first",
  "title": "Take an hour off each end before you plan anything.",
  "caption": "The first hour ashore is queue. The last is all-aboard, thirty to sixty minutes before departure. What remains is the day you actually have.",
  "treatment": "duotone", "focus": "center 60%",
  "brief": "Chania stone quay before the shops open: shutters down, long shadows, hosed flagstones, no ship in frame.",
  "source": "Jordan's own, ashore at seven; else Unsplash 'Chania old harbour early morning empty'" }
```

**`2026-08-12-walk-off-or-plan`** — *Which ports reward walking off*
- **Shot** — a working commercial berth on a flat grey morning: gantry cranes, stacked containers, an empty kerb with painted coach bays and nothing on them, no town anywhere in sight. Not in frame: cruise ships, liveried coaches, port logos.
- **Slide 2** — second cover; "Civitavecchia is not Rome" shown rather than asserted.
- **Get it** — 1 Jordan: shot from the terminal shuttle at any industrial berth. · 2 n/a. · 3 Pexels — "industrial port gantry cranes empty quay grey".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Read the berth, not the name",
  "title": "The port on your itinerary is not always the place on your itinerary.",
  "caption": "Civitavecchia is not Rome. Livorno is not Florence. Kusadasi is not Ephesus. Each is a scheduled coach ride before the day begins.",
  "treatment": "duotone", "focus": "center",
  "brief": "Working commercial berth, grey morning: cranes, containers, empty painted coach bays, no town in sight.",
  "source": "Jordan's own from a terminal shuttle; else Pexels 'industrial port gantry cranes empty quay grey'" }
```

**`2026-08-13-the-port-agent`** — *The only number that matters*
- **Shot** — a quayside office desk: a rubber date stamp stood on its pad beside a folded printed sheet, harsh window light, the paper's edges curled with damp. Shoot deliberately shallow so **no name, number or line marking is legible** — this must never read as a real record.
- **Slide 2** — second cover; it makes an abstract instruction physical, which is what slide 2 needs to do alone.
- **Get it** — 1 Jordan: his own stamp and a sheet of paper, on any desk. · 2 n/a. · 3 Unsplash — "rubber stamp ink pad old paper desk".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Four seconds, every morning",
  "title": "Photograph the port agent's details before you go ashore.",
  "caption": "Printed in the daily programme and posted at the gangway. It is the only number that matters if you are watching your ship make way.",
  "treatment": "duotone", "focus": "center",
  "brief": "Rubber date stamp on its pad beside a folded printed sheet, harsh window light, damp-curled edges. Nothing legible.",
  "source": "Jordan's own stamp and paper; else Unsplash 'rubber stamp ink pad old paper desk'" }
```

**`2026-08-14-the-queue-you-built`** — *The embarkation queue you helped build*
- **Shot** — an empty terminal hall at seven in the morning: retractable barrier tape set in a switchback, low sun through high windows striping the floor, not a single person in it. Not in frame: suitcases, passengers, airline or line signage.
- **Slide 2** — second cover; an empty queue is a better argument about arithmetic than a full one, and it needs no caption to land.
- **Get it** — 1 Jordan: any terminal before his own arrival window. · 2 n/a. · 3 Unsplash — "empty terminal hall retractable barriers morning light".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The unwelcome truth",
  "title": "Your arrival window is not a suggestion, it is the schedule.",
  "caption": "Terminals stagger arrivals because screening has a fixed throughput. Everyone turning up at eleven is precisely what produces the line at eleven.",
  "treatment": "duotone", "focus": "center 55%",
  "brief": "Empty terminal hall at 7am: barrier tape in a switchback, low sun through high windows, nobody in it.",
  "source": "Jordan's own before his arrival window; else Unsplash 'empty terminal hall retractable barriers morning light'" }
```

---

## Cabin truths

**`2026-08-15-the-deck-plan-is-the-booking`** — *The deck plan is the booking*
- **Shot** — a printed deck plan laid flat on a wardroom table, a pencil ring around one midship cabin and a cross through another, dividers resting across the sheet, raking window light. Frame or mask so **no line name or logo is legible**.
- **Slide 6** — the payoff breath; position chosen first, in pencil, is exactly what the payoff asks for.
- **Get it** — 1 Jordan: his own working deck plans, marked up as he actually marks them. · 2 n/a. · 3 Unsplash — "technical drawing pencil dividers desk" as a stand-in only.
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Choose the position first. The category second.",
  "caption": "Category is a price band; position is the experience. I settle the position, then take the cheapest category inside it — rarely the cabin anyone was shown.",
  "treatment": "duotone", "focus": "center",
  "brief": "Printed deck plan flat on a table, one midship cabin ringed in pencil, one crossed out, dividers across it. No logos legible.",
  "source": "Jordan's own marked-up deck plans; else Unsplash 'technical drawing pencil dividers desk'" }
```

**`2026-08-16-the-ocean-view-that-isnt`** — *The ocean view that isn't*
- **Shot** — from inside a cabin: a lifeboat hull filling the window, davit cables cutting the daylight into strips, the curtain half drawn, no horizon anywhere. Not in frame: a legible ship name on the boat, people, brochure gloss.
- **Slide 2** — second cover; nothing else in the deck lands as fast as the picture of the thing being sold as a view.
- **Get it** — 1 Jordan: on a ship inspection — walk the obstructed grades and shoot from inside. · 2 BDM/portal: obstructed-category imagery, which lines rarely publish (confirm with BDM). · 3 Free stock is thin; Unsplash "lifeboat davit seen through window" is worth one search, no more.
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The trick, plainly",
  "title": "An ocean view is a promise about a window, not about a view.",
  "caption": "The category means glass in the hull. What is on the other side may be davits, a steel rail, or a tender in its cradle.",
  "treatment": "duotone", "focus": "center",
  "brief": "From inside a cabin: lifeboat hull filling the window, davit cables striping the daylight, curtain half drawn, no horizon.",
  "source": "Jordan's own ship inspection first; BDM/portal obstructed-grade imagery (confirm with BDM); Unsplash 'lifeboat davit through window' as a long shot" }
```

**`2026-08-17-forward-aft-or-midship`** — *Motion is not weather. It is geometry.*
- **Shot** — the wake from an aft rail at dusk: one long straight scar of foam running to the horizon, a worn brass rail in the near corner, water otherwise dark. Not in frame: deck furniture, loungers, other passengers, the ship's superstructure.
- **Slide 6** — the payoff breath; the deck has been all physics, and this is the reward for reading it.
- **Get it** — 1 Jordan: from any aft deck at dusk. · 2 n/a. · 3 Pexels — "ship wake at dusk from stern rail".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Decide the itinerary first. Let the water choose the position.",
  "caption": "Sheltered coastline and short hops, sit where you like. Open ocean or any hesitation about motion — midship and low, and spend the saving ashore.",
  "treatment": "duotone", "focus": "center 60%",
  "brief": "Wake from an aft rail at dusk: one straight scar of foam to the horizon, worn brass rail in the near corner.",
  "source": "Jordan's own from an aft deck; else Pexels 'ship wake at dusk from stern rail'" }
```

**`2026-08-18-when-a-balcony-is-wasted`** — *When a balcony is wasted*
- **Shot** — an empty veranda at seven in the evening: two chairs untouched, a folded wool blanket over one arm, the sea flat and grey beyond, and the deck cantilevered above throwing the whole balcony into shade. Not in frame: cocktails, sun loungers, people, tropical anything.
- **Slide 2** — second cover; "bought and never sat on" is a photograph, not a sentence.
- **Get it** — 1 Jordan: on any inspection, shoot an unsold veranda in shade rather than in sun. · 2 BDM/portal: veranda imagery (confirm with BDM) — note their versions are lit to sell, which is the opposite of what this slide needs. · 3 Unsplash — "empty balcony chairs grey sea overcast".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The real test",
  "title": "A veranda is time, not square footage.",
  "caption": "You are buying hours sitting outside your own cabin. On a port-intensive summer itinerary you are ashore for most of them, and asleep for the rest.",
  "treatment": "duotone", "focus": "center 50%",
  "brief": "Empty veranda at 7pm: two untouched chairs, folded wool blanket, flat grey sea, the deck above holding it in shade.",
  "source": "Jordan's own inspection shot (in shade, not sun); BDM/portal veranda imagery (confirm with BDM); Unsplash 'empty balcony chairs grey sea overcast'" }
```

**`2026-08-19-the-guarantee-cabin`** — *The guarantee cabin*
- **Shot** — an unmarked steel service door in a crew corridor: harsh overhead light, rubber trolley scuffs black across the paint, a hinge painted over many times. Not in frame: crew faces, legible signage, ship or line marks.
- **Slide 6** — the payoff breath; this is the thing the assignment fee buys you out of, so it lands hardest last.
- **Get it** — 1 Jordan: any working corridor on an inspection. · 2 n/a — lines do not supply this photograph. · 3 Unsplash — "steel service door corridor scuff marks industrial".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Pay the assignment fee. It is the cheapest thing on the invoice.",
  "caption": "Choosing rather than being assigned costs a modest amount per person, and it is the only line on the invoice that protects every night of the voyage.",
  "treatment": "duotone", "focus": "center",
  "brief": "Unmarked steel service door in a crew corridor, harsh overhead light, black trolley scuffs across the paint.",
  "source": "Jordan's own from an inspection; else Unsplash 'steel service door corridor scuff marks industrial'" }
```

**`2026-08-20-suites-buy-access`** — *Suites buy access, not square footage*
- **Shot** — a heavy panelled door standing open onto a small dining room laid for two, one lamp lit inside, the corridor side of the frame dark. The subject is the threshold, not the room. Not in frame: legible restaurant or line names, staff, brochure styling.
- **Slide 2** — second cover; "a door, not a room" is the hook, and this is it literally.
- **Get it** — 1 Jordan: on an inspection, shot from the corridor before service. · 2 BDM/portal: suite-restaurant imagery (confirm with BDM). · 3 Unsplash — "open panelled door lamplit dining room dark corridor".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The distinction",
  "title": "Some suite tiers add space. Some add standing.",
  "caption": "One gives you a sitting room you will use twice. The other changes how the ship treats you from the terminal to the morning you leave it.",
  "treatment": "duotone", "focus": "center",
  "brief": "Heavy panelled door open onto a small dining room laid for two, one lamp inside, corridor side dark. The threshold is the subject.",
  "source": "Jordan's own inspection shot; BDM/portal suite-restaurant imagery (confirm with BDM); Unsplash 'open panelled door lamplit dining room'" }
```

**`2026-08-21-before-you-accept-the-cabin`** — *Before you accept the cabin*
- **Shot** — a brass cabin number on a painted door, close and slightly off-axis: paint standing proud around old screw heads, side light raking the digits, and the hinge of a connecting door just visible on the adjacent panel. Not in frame: a legible ship name, a real client's cabin, people.
- **Slide 2** — second cover; five questions is a list, and this gives the list a physical door to be about.
- **Get it** — 1 Jordan: any corridor on an inspection. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "brass number on painted door close up".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Why the timing matters",
  "title": "Cabin choice is the one decision that gets worse every week you wait.",
  "caption": "Ships, fares and itineraries stay available for months. Position does not. The quiet midship cabins go to whoever asked for them by name.",
  "treatment": "duotone", "focus": "center",
  "brief": "Brass cabin number on a painted door, paint proud around old screws, raking side light, a connecting-door hinge just in frame.",
  "source": "Jordan's own from an inspection; BDM/portal (confirm with BDM); Unsplash 'brass number on painted door close up'" }
```

---

## Ship selection

**`2026-08-22-space-not-size`** — *Size is the wrong question; space is the right one*
- **Shot** — a small ship's breakfast room at half past seven: eight tables, three of them laid, none occupied, ripple-light off the water thrown up onto a white ceiling. Not in frame: buffet queues, people, signage, brochure gloss.
- **Slide 6** — the payoff breath; the payoff line is literally about how many people you want at breakfast.
- **Get it** — 1 Jordan: on an inspection or an early sea-day morning. · 2 BDM/portal: dining-room imagery, though theirs is usually populated (confirm with BDM). · 3 Unsplash — "empty breakfast room laid tables morning light sea".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Choose the ship for how many people you want at breakfast.",
  "caption": "Everything else — the itinerary, the suite, the fare — is easier to fix than a ship that is simply too full for you.",
  "treatment": "duotone", "focus": "center 45%",
  "brief": "Small-ship breakfast room at 7:30: eight tables, three laid, nobody there, ripple-light on a white ceiling.",
  "source": "Jordan's own inspection or sea-day morning; BDM/portal dining imagery (confirm with BDM); Unsplash 'empty breakfast room laid tables morning light'" }
```

**`2026-08-23-alongside-or-anchored`** — *The berth is the itinerary*
- **Shot** — an iron mooring ring set into a stone quay with a heavy wet hawser through it, the rope running taut out of frame, morning light on wet stone, no vessel visible. Not in frame: ships, crew, port branding.
- **Slide 2** — second cover; the berth as an object, which is the whole title of the deck.
- **Get it** — 1 Jordan: any alongside call, five seconds at the bollard. · 2 n/a. · 3 Unsplash — "mooring rope iron ring stone quay wet".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The exposure",
  "title": "A port you tender into is a port you can lose to weather.",
  "caption": "Moderate swell or wind is enough to suspend tender operations. The ship sits anchored in sight of the town and nobody goes ashore.",
  "treatment": "duotone", "focus": "center",
  "brief": "Iron mooring ring in a stone quay, heavy wet hawser through it running taut out of frame, morning light on wet stone.",
  "source": "Jordan's own at any alongside call; else Unsplash 'mooring rope iron ring stone quay wet'" }
```

**`2026-08-24-what-inclusive-covers`** — *All-inclusive, line by line*
- **Shot** — a silver salver on a sideboard holding nothing but a folded linen napkin and a carafe of water, morning light across polished wood, no bill, no tent card, no price list anywhere. Not in frame: cocktails, branded bottles, promotional cards, card machines.
- **Slide 6** — the payoff breath; the absence of the onboard sell is the thing being bought, and absence needs room.
- **Get it** — 1 Jordan: on an inspection, or set it up at home with his own linen. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "silver tray folded linen napkin water carafe sideboard".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Inclusive is a design decision, not a discount.",
  "caption": "The lines that include most are not being generous — they are removing the onboard sell, so nobody spends the week auditing a bill.",
  "treatment": "duotone", "focus": "center",
  "brief": "Silver salver on a sideboard: folded linen napkin, a carafe of water, nothing else. No bill, no tent card, no price list.",
  "source": "Jordan's own (inspection or set up at home); BDM/portal (confirm with BDM); Unsplash 'silver tray folded linen napkin water carafe'" }
```

**`2026-08-25-three-ship-styles`** — *Expedition, classic, or yacht-style*
- **Shot** — three signal flags on a halyard against a white mast and hard blue sky, cotton faded and frayed at the edges, shot from below so the three read as three answers. Not in frame: funnels, logos, a ship's profile.
- **Slide 2** — second cover; three of something, immediately, which is what a three-styles deck needs at position two.
- **Get it** — 1 Jordan: any yacht club or marina, or a ship's flag deck. · 2 n/a. · 3 Unsplash — "signal flags halyard mast blue sky"; or Library of Congress Detroit Publishing photochroms of yacht regattas for an antique plate instead.
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Why it matters",
  "title": "Style is the one mistake a good itinerary cannot rescue.",
  "caption": "You can change a suite, a date, even a route. You cannot change what a ship was designed to do with your evenings.",
  "treatment": "duotone", "focus": "center 40%",
  "brief": "Three faded signal flags on a halyard against a white mast, shot from below, hard sky, frayed cotton edges.",
  "source": "Jordan's own at a club or marina; else Unsplash 'signal flags halyard mast blue sky', or a Library of Congress photochrom of a regatta" }
```

**`2026-08-26-dining-capacity`** — *Dining capacity is the real constraint*
- **Shot** — a restaurant host's lectern at three in the afternoon: a leather reservations book open, a pencil across the page, the empty room behind it out of focus. Shoot so **no names or cabin numbers are legible**.
- **Slide 2** — second cover; the rationing mechanism, photographed, which is the claim slide 2 must carry.
- **Get it** — 1 Jordan: on an inspection, before service. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "restaurant reservation book lectern pencil".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The arithmetic",
  "title": "Cabins are easy to add. Restaurant seats are not.",
  "caption": "That gap is why a celebrated ship can feel crowded at eight in the evening and completely empty at three in the afternoon.",
  "treatment": "duotone", "focus": "center",
  "brief": "Host's lectern at 3pm: leather reservations book open, pencil across the page, empty room soft behind. Nothing legible.",
  "source": "Jordan's own inspection before service; BDM/portal (confirm with BDM); Unsplash 'restaurant reservation book lectern pencil'" }
```

**`2026-08-27-refit-or-new`** — *New is not the same as good*
- **Shot** — a repaired teak deck seam close up: fresh black caulking laid between planks that have silvered with age, one new plank paler than its neighbours, flat overhead light. Not in frame: loungers, pool furniture, people, branding.
- **Slide 2** — second cover; "what the refit actually touched" made visible in one frame.
- **Get it** — 1 Jordan: any promenade deck, camera pointed down. · 2 n/a. · 3 Unsplash — "teak deck caulking seams close up weathered".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Start here",
  "title": "A ship refitted well beats a new one designed badly.",
  "caption": "Hull age tells you almost nothing on its own. What the last refit actually touched tells you a great deal.",
  "treatment": "duotone", "focus": "center",
  "brief": "Repaired teak deck seam: fresh black caulking between age-silvered planks, one paler new plank, flat overhead light.",
  "source": "Jordan's own on any promenade deck; else Unsplash 'teak deck caulking seams close up weathered'" }
```

**`2026-08-28-destination-or-transport`** — *Is the ship the destination, or the transport?*
- **Shot** — an enclosed promenade on a grey sea day: rain-flecked windows, a flat horizon beyond, one door propped open to the weather, nobody in frame. Not in frame: loungers, activity, signage, tropical light.
- **Slide 6** — the payoff breath; "fewer ports on the right ship" is a feeling about a sea day, and this is that feeling.
- **Get it** — 1 Jordan: any sea day in poor weather — the least photographed hour on a ship. · 2 BDM/portal (confirm with BDM), though their versions will be sunlit. · 3 Unsplash — "enclosed ship promenade rain windows grey sea".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "I'd rather sell you fewer ports on the right ship.",
  "caption": "The route is what people book. The ship is what they remember. When those two disagree, the ship wins — every single time.",
  "treatment": "duotone", "focus": "center 50%",
  "brief": "Enclosed promenade on a grey sea day: rain-flecked windows, flat horizon, one door propped open, nobody there.",
  "source": "Jordan's own on a wet sea day; BDM/portal (confirm with BDM); Unsplash 'enclosed ship promenade rain windows grey sea'" }
```

---

## Itinerary craft

**`2026-08-29-read-the-arrival-times`** — *Read the arrival times, not the port names*
- **Shot** — a harbourmaster's arrivals board in the shade: hand-chalked or slotted columns of times, the lettering weathered, shot at a slight angle so **no vessel name is legible** — the columns of hours are the subject.
- **Slide 2** — second cover; two columns of times, which is exactly what the deck says nobody reads.
- **Get it** — 1 Jordan: any small port office or ferry quay. · 2 n/a. · 3 Unsplash — "chalkboard timetable harbour weathered numbers"; or Library of Congress Detroit Publishing photochroms of steamer-line notice boards for an antique version.
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Start here",
  "title": "Nobody reads the two columns that matter.",
  "caption": "Every itinerary prints an arrival and a departure beside each port. Those numbers are the whole design of the week, and they are in ship's time.",
  "treatment": "duotone", "focus": "center",
  "brief": "Harbourmaster's arrivals board in shade: weathered columns of chalked times, no vessel name legible.",
  "source": "Jordan's own at a port office or ferry quay; else Unsplash 'chalkboard timetable harbour weathered numbers'" }
```

**`2026-08-30-a-call-is-not-a-visit`** — *A port call and a visit are different things*
- **Shot** — the quayside café strip that exists only for the ship: a row of near-identical laminated menu boards in four languages along a harbour front, hard midday light, every table empty. Not in frame: cocktails, faces, the ship, brand marks.
- **Slide 2** — second cover; this is "a call" in one picture, and the deck spends five slides on the difference.
- **Get it** — 1 Jordan: any tendered or short call, shot walking past. · 2 n/a. · 3 Pexels — "harbour front restaurant menu boards empty tables midday".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Start here",
  "title": "You can call at eleven ports and visit none of them.",
  "caption": "A call is a berth and a window of hours. A visit is time enough for the town to stop performing for the ship and go back to its own afternoon.",
  "treatment": "duotone", "focus": "center 55%",
  "brief": "Row of near-identical multilingual menu boards along a harbour front, hard midday light, every table empty.",
  "source": "Jordan's own on a short call; else Pexels 'harbour front restaurant menu boards empty tables'" }
```

**`2026-08-31-overnight-in-port`** — *Overnight in port*
- **Shot** — the same harbour at ten at night, after the fleet has gone: lamplight on wet stone, one bar's chairs still out, the water black and completely still, no vessel lit in the background. Not in frame: ships, crowds, neon, faces.
- **Slide 6** — the payoff breath; the deck's entire promise is an evening, and it should be felt rather than argued.
- **Get it** — 1 Jordan: only obtainable on an actual overnight — the strongest reason to shoot one. · 2 n/a. · 3 Unsplash — "mediterranean harbour night wet cobbles lamplight empty".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "One port, two voyages.",
  "caption": "A day call is six shared hours and a photograph of a door. An overnight is twenty hours that are yours, dinner in the old town, and a second morning.",
  "treatment": "warm", "focus": "center 60%",
  "brief": "Harbour at 10pm after the fleet has gone: lamplight on wet stone, one bar's chairs still out, water black and still.",
  "source": "Jordan's own on an actual overnight; else Unsplash 'mediterranean harbour night wet cobbles lamplight empty'" }
```

**`2026-09-01-sea-day-rhythm`** — *Sea days are not filler, they are the design*
- **Shot** — a book left face-down on a wicker chair beside a rain-flecked window, a cup gone cold on the sill, the sea flat and featureless beyond. Not in frame: loungers, pools, cocktails, people.
- **Slide 6** — the payoff breath, with the closing quote carried into the caption; a sea day argued in type for five slides should end as an image.
- **Get it** — 1 Jordan: any sea day, any weather. · 2 n/a. · 3 Unsplash — "open book face down wicker chair window sea".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "The most valuable day on the ship.",
  "caption": "A sea day placed properly is the most valuable day on the ship. Placed badly, it's the one people apologise for. — Jordan Yates · Luxury Voyage Advisor",
  "treatment": "duotone", "focus": "center",
  "brief": "Book face-down on a wicker chair by a rain-flecked window, a cup gone cold on the sill, flat grey sea beyond.",
  "source": "Jordan's own on any sea day; else Unsplash 'open book face down wicker chair window sea'" }
```

**`2026-09-02-embarkation-city-is-a-stay`** — *Your embarkation city is a stay, not a transfer*
- **Shot** — a shuttered hotel window at first light in Athens or Lisbon: louvred shutters half open, a brass key on the marble sill, the city roofline going from blue to grey beyond. Not in frame: suitcases, airport anything, hotel branding, people.
- **Slide 2** — second cover; the city as a room you woke up in, rather than a transfer.
- **Get it** — 1 Jordan: every pre-cruise night he already spends. · 2 n/a. · 3 Unsplash — "hotel shutters dawn city rooftops marble sill".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Start here",
  "title": "Most people see Athens, Venice or Lisbon through a taxi window.",
  "caption": "The itinerary calls it day one and a transfer. It is a city with a season, a table worth booking, and a morning you do not get back.",
  "treatment": "warm", "focus": "center 45%",
  "brief": "Shuttered hotel window at first light: louvres half open, brass key on the marble sill, city roofline beyond.",
  "source": "Jordan's own on any pre-cruise night; else Unsplash 'hotel shutters dawn city rooftops marble sill'" }
```

**`2026-09-03-when-fewer-ports-is-the-luxury`** — *When fewer ports is the luxury*
- **Shot** — a long lunch still on the table under a plane tree in an inland village: bread, a water carafe, plates not yet cleared, dappled afternoon shade, chairs pushed back and nobody hurrying. Not in frame: identifiable faces, cocktails, coaches, harbour.
- **Slide 6** — the payoff breath; fewer ports buys an unhurried hour, and that is what the last slide before the CTA should hold.
- **Get it** — 1 Jordan: any inland lunch on any call. · 2 n/a. · 3 Pexels — "long table lunch plane tree village shade bread".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Any search engine can surface a hundred sailings.",
  "caption": "The work is knowing which three deserve your attention. Two long days in one place beat four short ones, every time.",
  "treatment": "warm", "focus": "center 55%",
  "brief": "Inland village lunch under a plane tree: bread, water carafe, plates uncleared, dappled shade, chairs pushed back, no faces.",
  "source": "Jordan's own from an inland lunch; else Pexels 'long table lunch plane tree village shade'" }
```

**`2026-09-04-repositioning-and-back-to-back`** — *Repositioning and back-to-back*
- **Shot** — a folded paper chart of the North Atlantic on a chartroom table, a pencil line of daily noon positions running across it, dividers open on the sheet, a low table lamp. Not in frame: GPS screens, branded plotting sheets, people.
- **Slide 2** — second cover; a crossing drawn by hand is the quiet end of the brochure, stated as an object.
- **Get it** — 1 Jordan: his own paper chart and dividers on his desk. · 2 n/a. · 3 Rijksmuseum — maritime charts and engraved sea charts in the online collection (an antique plate suits this deck better than a photograph); or Unsplash "paper nautical chart dividers pencil lamp".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Start here",
  "title": "The best weeks at sea are the ones with no marketing budget.",
  "caption": "A ship has to move between seasons whether anyone books it or not. When it does, it sails long and slow, with a run of sea days nobody knows how to sell.",
  "treatment": "none", "focus": "center",
  "brief": "Paper North Atlantic chart on a chartroom table, pencil line of noon positions, dividers open, low lamp.",
  "source": "Jordan's own chart and dividers; else Rijksmuseum engraved sea charts, or Unsplash 'paper nautical chart dividers pencil'" }
```

---

## Seasonality

**`2026-09-05-the-second-best-month`** — *The best month is usually the second-best month*
- **Shot** — an Aegean hillside in the first week of October: dry-stone terrace walls, thyme and brown grass, the sea a flat plate below, low golden light from the side, not a person in it. Not in frame: parasols, beach anything, ships, hotels.
- **Slide 6** — the payoff breath; the payoff is a feeling about a month, and colour is doing the work here.
- **Get it** — 1 Jordan: any shoulder-season call, ten minutes uphill from the quay. · 2 n/a. · 3 Unsplash — "cyclades hillside dry stone wall autumn light sea".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "The second-best month still belongs to the islanders.",
  "caption": "All the warmth of summer, little of its congestion, at a lower fare. Not a compromise — the better trip, and usually available.",
  "treatment": "warm", "focus": "center 55%",
  "brief": "Aegean hillside in early October: dry-stone terraces, brown grass, flat sea below, low golden side light, nobody in frame.",
  "source": "Jordan's own on a shoulder-season call; else Unsplash 'cyclades hillside dry stone wall autumn light sea'" }
```

**`2026-09-06-the-meltemi-and-the-tender`** — *The wind that cancels your port day*
- **Shot** — whitecaps in a channel from a high rail: spray torn off the crests, a halyard cracking taut in the corner of frame, an island close enough to see its houses and no way to reach it. Not in frame: the ship's superstructure, passengers, tender boats under way.
- **Slide 2** — second cover; the wind is the antagonist of the deck and it should appear at position two.
- **Get it** — 1 Jordan: any windy Aegean afternoon from an upper deck. · 2 n/a. · 3 Pexels — "whitecaps aegean wind channel island spray".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Read this alone",
  "title": "A ship anchored in sight of an island is still a missed port.",
  "caption": "If the tenders cannot run, the day is gone. Nobody sells you that risk when you book the sailing in August.",
  "treatment": "duotone", "focus": "center 55%",
  "brief": "Whitecaps in a channel from a high rail, spray off the crests, a taut halyard in frame, an island close and unreachable.",
  "source": "Jordan's own on a windy Aegean afternoon; else Pexels 'whitecaps aegean wind channel island spray'" }
```

**`2026-09-07-the-school-calendar-fare`** — *You are paying for the school term*
- **Shot** — a village school's iron gate, closed and chained, blue paint flaking, a bell bracket above it, a hard September shadow of the railings across the yard. Not in frame: children, any identifiable school name, uniforms.
- **Slide 2** — second cover; the deck's claim is that a calendar sets the fare, and this is that calendar as an object.
- **Get it** — 1 Jordan: any village he walks through — shoot the gate, not the school. · 2 n/a. · 3 Unsplash — "closed iron school gate flaking blue paint shadow".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Read this alone",
  "title": "Same ship. Same cabin. Same route. Two prices.",
  "caption": "One week apart. Nothing about the Mediterranean changed between them — only who was free to travel that week.",
  "treatment": "duotone", "focus": "center",
  "brief": "Village school's chained iron gate, flaking blue paint, bell bracket above, hard September railing shadows. No children.",
  "source": "Jordan's own; else Unsplash 'closed iron school gate flaking blue paint shadow'" }
```

**`2026-09-08-how-many-ships-in-port`** — *How many other ships*
- **Shot** — from the hill path above a Cyclades harbour at half past seven: the quay, the switchback road and the whole anchorage in frame, and **nothing at anchor in it**. Long shadows, no people on the path. Not in frame: any ship, coach, or cable car queue.
- **Slide 6** — the payoff breath; an empty anchorage is what "crowding is a scheduling fact" looks like when it goes your way.
- **Get it** — 1 Jordan: shoulder-season morning, first ashore, walk up. · 2 n/a. · 3 Unsplash — "santorini caldera path empty morning" / "greek island harbour from above empty anchorage".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Crowding is a scheduling fact, not a season-long verdict.",
  "caption": "Which means it can be planned around. The work is reading the port schedule and the deployment before the fare is paid.",
  "treatment": "warm", "focus": "center 50%",
  "brief": "From the hill path above a Cyclades harbour at 7:30: quay, switchback road, empty anchorage, long shadows, nobody about.",
  "source": "Jordan's own, shoulder season, first ashore; else Unsplash 'greek island harbour from above empty anchorage'" }
```

**`2026-09-09-when-a-region-is-shut`** — *Some regions are simply shut*
- **Shot** — a shuttered island taverna in November: chairs stacked and chained under a tarpaulin, a hand-painted sign facing an empty quay, flat grey light, water slapping the steps. Not in frame: people, ships, summer colour.
- **Slide 2** — second cover; "shut" is a photograph, and it is the least sellable and most honest image in the bank.
- **Get it** — 1 Jordan: any late-season or winter call. · 2 n/a. · 3 Pexels — "closed taverna stacked chairs winter greek quay".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Read this alone",
  "title": "A sailing being available is not evidence that it is a good idea.",
  "caption": "Lines publish what they can operate. Whether a given week is the right week for you is a separate question, and it is mine to answer.",
  "treatment": "duotone", "focus": "center 55%",
  "brief": "Shuttered island taverna in November: chairs stacked and chained under tarpaulin, hand-painted sign, empty quay, flat grey light.",
  "source": "Jordan's own on a late-season call; else Pexels 'closed taverna stacked chairs winter greek quay'" }
```

**`2026-09-10-the-light-not-the-weather`** — *In the north you are booking light*
- **Shot** — a fjord wall at midnight in June: sun still on the upper rock, the water below like pewter, a thread of meltwater falling, no vessel and no deck furniture in frame.
- **Slide 6** — the payoff breath; "name the hours you want" is answered by light, not by type.
- **Get it** — 1 Jordan: only from a midsummer northern sailing — worth shooting deliberately if he has one. · 2 BDM/portal: Norwegian-coast scenics are the best-documented asset libraries (confirm with BDM). · 3 Unsplash — "norwegian fjord midnight sun rock wall pewter water".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Name the hours you want, and the month names itself.",
  "caption": "Not which ship, not which fjord — how much light you want to be awake in, and what you'll trade for it.",
  "treatment": "warm", "focus": "center 40%",
  "brief": "Fjord wall at midnight in June: sun still on the upper rock, pewter water below, a thread of meltwater. No vessel.",
  "source": "Jordan's own from a midsummer northern sailing; BDM/portal scenics (confirm with BDM); Unsplash 'norwegian fjord midnight sun rock wall'" }
```

**`2026-09-11-the-winter-mediterranean`** — *The winter Mediterranean*
- **Shot** — rain on the flagstones of an empty arcaded courtyard in Valletta or Rome: wet stone reflecting the columns, one distant figure under an umbrella too far off to identify, low January light. Not in frame: summer crowds, café awnings full, ships.
- **Slide 2** — second cover; winter as a library rather than a beach, shown at the position that has to work alone.
- **Get it** — 1 Jordan: any winter city visit. · 2 n/a. · 3 Unsplash — "wet flagstones arcade courtyard rain winter valletta".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Read this alone",
  "title": "In winter the Mediterranean stops being a beach and becomes a library.",
  "caption": "The sea is not the point any more. The shore is — and the shore in January has its own inhabitants back.",
  "treatment": "duotone", "focus": "center 50%",
  "brief": "Rain on the flagstones of an empty arcaded courtyard, wet stone reflecting the columns, one distant unidentifiable figure.",
  "source": "Jordan's own on a winter city visit; else Unsplash 'wet flagstones arcade courtyard rain winter'" }
```

---

## Mistakes to avoid

**`2026-09-12-fly-in-the-day-before`** — *Fly in the day before*
- **Shot** — a hotel breakfast room at seven on embarkation morning: one table laid, a pot of coffee already on it, the harbour visible through the window with the sky still dark blue. **No airplanes, no airport, no luggage anywhere in frame.**
- **Slide 6** — the payoff breath; "book the hotel night" is best paid off by the calm it buys.
- **Get it** — 1 Jordan: every day-before hotel he already books. · 2 n/a. · 3 Unsplash — "empty hotel breakfast room dawn window harbour".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The whole of the advice",
  "title": "Book the hotel night. It is the cheapest insurance in the itinerary.",
  "caption": "And if you are crossing an ocean to meet a ship, treat two nights as the standard rather than the indulgence.",
  "treatment": "warm", "focus": "center 45%",
  "brief": "Hotel breakfast room at 7am on embarkation morning: one table laid, coffee poured, dark blue sky over the harbour. No luggage.",
  "source": "Jordan's own from a day-before hotel; else Unsplash 'empty hotel breakfast room dawn window harbour'" }
```

**`2026-09-13-passport-six-months`** — *Valid is not the same as accepted*
- **Shot** — a passport open flat under a desk lamp on a scrubbed kitchen table, worn cover, a corner of a stamped page catching the light; focus set so **the expiry line and every piece of personal data is illegible**. Use his own, never a client's. Not in frame: names, numbers, photographs, airline documents.
- **Slide 2** — second cover; an old passport is the most on-brand object the account owns, and it belongs where it will be seen most.
- **Get it** — 1 Jordan: his own expired passports, shot at home in ten minutes. · 2 n/a. · 3 Unsplash — "open passport stamps desk lamp table" (check no readable data in the file).
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The rule people miss",
  "title": "Many countries require six months' validity beyond your travel dates.",
  "caption": "Requirements differ by country and by nationality. Check every country on the itinerary and confirm with the line or your advisor before you pack.",
  "treatment": "duotone", "focus": "center",
  "brief": "Passport open flat under a desk lamp on a scrubbed table, stamped page catching the light, all personal data illegible.",
  "source": "Jordan's own expired passports; else Unsplash 'open passport stamps desk lamp table' (verify no readable data)" }
```

**`2026-09-14-insurance-gaps`** — *The clauses nobody reads*
- **Shot** — a printed policy booklet held open against a cold north window, a thumb pinning the page, the small print deliberately soft so **no insurer name or wording is legible**, the room behind it dark.
- **Slide 2** — second cover; the deck is about a document, and the document should appear early.
- **Get it** — 1 Jordan: any booklet he already has, personal marks removed. · 2 n/a. · 3 Unsplash — "hands holding small print booklet window light".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The window",
  "title": "Cover for a pre-existing condition often depends on when you bought.",
  "caption": "Many insurers tie it to a period after your deposit date, and the length varies. Read the certificate, and ask before you buy rather than after.",
  "treatment": "duotone", "focus": "center",
  "brief": "Policy booklet held open at a cold north window, thumb on the page, small print deliberately soft, dark room behind. No names legible.",
  "source": "Jordan's own booklet (marks removed); else Unsplash 'hands holding small print booklet window light'" }
```

**`2026-09-15-what-never-leaves-your-hand`** — *What never leaves your hand*
- **Shot** — flat overhead on a hotel writing desk: a passport, two folded banknotes, a phone face-down, a boxed course of tablets still in its packaging, a coiled charger. **No suitcase, no luggage tag, no airline anything**, and no legible names, numbers or prescription labels.
- **Slide 2** — second cover; a list of five objects is better shown than read, and this is the slide that has to stand alone.
- **Get it** — 1 Jordan: his own desk, twenty minutes, labels turned away. · 2 n/a. · 3 Unsplash — "flat lay passport cash phone charger desk" (verify no readable detail).
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The embarkation-day rule",
  "title": "Passport, wallet, phone and medication stay with you. Always.",
  "caption": "Your case is taken at the kerb and delivered later in the day. Anything you need before dinner belongs in the bag on your shoulder.",
  "treatment": "duotone", "focus": "center",
  "brief": "Overhead on a writing desk: passport, folded notes, phone face-down, boxed tablets, coiled charger. No luggage, nothing legible.",
  "source": "Jordan's own desk; else Unsplash 'flat lay passport cash phone charger desk' (verify no readable detail)" }
```

**`2026-09-16-the-queue-you-built`** — *The queue you built yourself*
- **Shot** — a wooden tray on a screening table under harsh overhead light holding one coiled surge-protected power strip and a travel kettle, and nothing else. Labels turned away so no brand is legible. Not in frame: passengers, suitcases, security staff, terminal signage.
- **Slide 2** — second cover; the confiscation tray is a funnier and sharper second cover than any sentence about throughput.
- **Get it** — 1 Jordan: staged at home in five minutes — genuinely the easiest shot in this brief. · 2 n/a. · 3 Unsplash — "power strip travel kettle tray flat overhead light".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Screening",
  "title": "Power strips, irons and travel kettles are commonly confiscated.",
  "caption": "Prohibited-item lists vary by line and by ship. Surge-protected strips and anything with a heating element are the usual seizures — read yours first.",
  "treatment": "duotone", "focus": "center",
  "brief": "Wooden tray under harsh light holding a coiled surge-protected power strip and a travel kettle, nothing else, no brands legible.",
  "source": "Jordan's own, staged at home; else Unsplash 'power strip travel kettle tray overhead light'" }
```

**`2026-09-17-booked-on-the-day`** — *What cannot be booked on the day*
- **Shot** — a small brass or card RESERVED marker on one laid table by a window at dusk — the only marked table in an otherwise empty room, lamps just lit. Not in frame: legible restaurant or line names, staff, other diners.
- **Slide 6** — the payoff breath, with the closing quote carried into the caption; the reserved table is what the whole deck is asking you to arrange.
- **Get it** — 1 Jordan: on an inspection before service, or a shoreside restaurant that will let him. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "reserved sign on laid table empty restaurant dusk".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Book the reservations you would regret losing.",
  "caption": "Leave the rest loose — that is what sea days are for. — Jordan Yates · Luxury Voyage Advisor",
  "treatment": "duotone", "focus": "center",
  "brief": "One RESERVED marker on a laid table by a window at dusk, the only marked table in an empty room, lamps just lit.",
  "source": "Jordan's own inspection before service; BDM/portal (confirm with BDM); Unsplash 'reserved sign laid table empty restaurant dusk'" }
```

**`2026-09-18-the-last-morning`** — *The last morning*
- **Shot** — the kerb outside a cruise terminal at seven in the morning: an empty taxi rank, painted bays, wet asphalt, one traffic cone, the city beyond still shut. Not in frame: suitcases, passengers, ships, terminal branding.
- **Slide 2** — second cover; the last morning is a logistics problem and this is the picture of it.
- **Get it** — 1 Jordan: any disembarkation, shot while waiting. · 2 n/a. · 3 Unsplash — "empty taxi rank wet asphalt early morning painted bays".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Disembarkation",
  "title": "The last morning is slower than the schedule suggests.",
  "caption": "Clearance, the luggage hall and customs all sit between the gangway and the kerb. A late-morning flight turns a scramble into a slow coffee.",
  "treatment": "duotone", "focus": "center 55%",
  "brief": "Kerb outside a cruise terminal at 7am: empty taxi rank, painted bays, wet asphalt, one cone, city still shut.",
  "source": "Jordan's own at any disembarkation; else Unsplash 'empty taxi rank wet asphalt early morning'" }
```

---

## River vs ocean

**`2026-09-19-dock-or-anchor`** — *Docked in the centre, or anchored offshore*
- **Shot** — a mooring cleat set into a stone city embankment with tram rails and a cathedral spire in the same frame, early light, the river out of focus below. The point is that the berth and the town are one place. Not in frame: a vessel, a gangway crowd, coach parks.
- **Slide 2** — second cover; "it ties up in it" is a geometry you can photograph.
- **Get it** — 1 Jordan: Vienna, Budapest or Bratislava, ten minutes on foot from the mooring. · 2 BDM/portal: river-line city-mooring imagery (confirm with BDM). · 3 Unsplash — "danube embankment mooring cleat tram rails cathedral".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "What docking buys",
  "title": "A river ship ties up where the town actually is.",
  "caption": "Step off after breakfast, come back for an hour, go out again after dinner. No tender ticket, no coach from an industrial berth.",
  "treatment": "duotone", "focus": "center",
  "brief": "Mooring cleat in a stone city embankment with tram rails and a cathedral spire in frame, early light, river soft below.",
  "source": "Jordan's own in Vienna or Budapest; BDM/portal river imagery (confirm with BDM); Unsplash 'danube embankment mooring cleat tram rails'" }
```

**`2026-09-20-the-low-water-clause`** — *The low-water clause nobody reads*
- **Shot** — an exposed riverbed at low water: pale dry stones, a bridge pier showing its old engraved level marks well above the waterline, the channel narrowed to brown water. If a hunger stone is reachable, that is the shot. Not in frame: vessels, sunbathers, litter.
- **Slide 2** — second cover; the contract is abstract, the water level is not.
- **Get it** — 1 Jordan: any dry-spell Rhine or Danube visit. · 2 n/a. · 3 Unsplash — "low water river exposed stones bridge pier water marks"; or Rijksmuseum, engraved Rhine river views showing gauge marks.
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "What it means in practice",
  "title": "Low water can mean coaches, or swapping to a sister ship.",
  "caption": "When a stretch becomes too shallow to transit, lines reroute: guests move by road, or two vessels trade guests so each keeps its own reach of river.",
  "treatment": "duotone", "focus": "center 60%",
  "brief": "Exposed riverbed at low water: pale dry stones, bridge pier with old engraved level marks above the waterline, narrowed brown channel.",
  "source": "Jordan's own on a dry-spell river visit; else Unsplash 'low water river exposed stones bridge pier marks'" }
```

**`2026-09-21-the-locks-decide-the-cabin`** — *The locks decide your cabin size*
- **Shot** — inside a lock chamber from deck level: dripping green-black concrete walls rising on both sides, a strip of sky between them, water sluicing down the stone, the wall close enough to touch from the rail. Not in frame: the ship's name, passengers, brochure styling.
- **Slide 2** — second cover; the constraint is physical and it is *right there*.
- **Get it** — 1 Jordan: any river sailing, any lock — thirty seconds. · 2 BDM/portal (confirm with BDM). · 3 Pexels — "inside canal lock chamber wet concrete walls from deck".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The constraint",
  "title": "Nothing on a river ship is wider than the lock it must pass.",
  "caption": "Length, width and height are set by locks and low bridges, not by the naval architect. The long, low silhouette is engineering, not styling.",
  "treatment": "duotone", "focus": "center",
  "brief": "Inside a lock chamber from deck level: dripping green-black walls both sides, a strip of sky, water sluicing down the stone.",
  "source": "Jordan's own on any river sailing; BDM/portal (confirm with BDM); Pexels 'inside canal lock chamber wet concrete walls'" }
```

**`2026-09-22-the-same-hundred-guests`** — *The same faces for seven nights*
- **Shot** — one long dining room photographed end-on: every place laid, chairs squared, nobody in the room, a green bank sliding past the windows on both sides. Not in frame: guests, crew, legible line marks.
- **Slide 2** — second cover; a single room laid for everybody is the fixed guest count made visible.
- **Get it** — 1 Jordan: on an inspection or before dinner on a river sailing. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "long dining room laid tables empty windows river".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The social fact",
  "title": "There is nowhere to be anonymous on a river ship.",
  "caption": "One lounge, one dining room, one sundeck. By the second evening the crew know your name, and so do the other guests. Some travellers love that.",
  "treatment": "duotone", "focus": "center",
  "brief": "One long dining room end-on: every place laid, chairs squared, nobody there, a green bank sliding past both window walls.",
  "source": "Jordan's own before dinner on a river sailing; BDM/portal (confirm with BDM); Unsplash 'long dining room laid tables empty windows'" }
```

**`2026-09-23-no-sea-days`** — *No sea days, and no day off*
- **Shot** — a river ship's sundeck between locks at eight in the morning: wicker chairs folded and stacked, varnish still wet with dew, the wheelhouse lowered flat, an empty deck and a green bank going past. Not in frame: sun loungers in use, passengers, cocktails.
- **Slide 6** — the payoff breath; the deck's honest conclusion is a deck nobody is sitting on, because everyone is ashore.
- **Get it** — 1 Jordan: early morning on any river sailing. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "river ship sundeck folded chairs morning dew empty".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "No sea days is the best argument for a river, and against it.",
  "caption": "It is why you see so much in seven nights. It is also why some travellers come home needing a holiday. Know which of those you are.",
  "treatment": "duotone", "focus": "center 50%",
  "brief": "River sundeck at 8am between locks: wicker chairs folded, varnish wet with dew, wheelhouse lowered, green bank going past.",
  "source": "Jordan's own early morning on a river sailing; BDM/portal (confirm with BDM); Unsplash 'river ship sundeck folded chairs morning empty'" }
```

**`2026-09-24-included-or-chosen`** — *Included excursions are not free excursions*
- **Shot** — a granite wine-press trough in a whitewashed Douro quinta, dry and swept, worn smooth at the lip, the terraced hillside visible through the open door behind it. Not in frame: tasting glasses lined up for a group, tour badges, coaches.
- **Slide 6** — the payoff breath; the two or three days worth upgrading are days like this one.
- **Get it** — 1 Jordan: any Douro quinta visit. · 2 BDM/portal: river-line excursion imagery (confirm with BDM). · 3 Unsplash — "granite wine press stone trough quinta whitewashed douro".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Take the included tour on days you have no strong opinion.",
  "caption": "Then spend on the two or three where you do. That mix costs far less than moving up a fare grade, and gives you a better week than either extreme.",
  "treatment": "duotone", "focus": "center 55%",
  "brief": "Granite wine-press trough in a whitewashed Douro quinta, dry and swept, terraced hillside through the open door.",
  "source": "Jordan's own from a quinta visit; BDM/portal excursion imagery (confirm with BDM); Unsplash 'granite wine press stone trough quinta'" }
```

**`2026-09-25-who-should-not-sail-a-river`** — *Who should not take a river cruise*
- **Shot** — the single lounge at ten in the evening: a piano with the lid shut, one stool, ten empty chairs turned toward it, two low lamps, the bank dark outside. Not in frame: guests, entertainers, dance floors.
- **Slide 2** — second cover; one room and ten chairs is the honest picture of a format that suits some people and not others.
- **Get it** — 1 Jordan: last thing at night on a river sailing. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "small ship lounge closed piano empty chairs lamps night".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Start here",
  "title": "Both formats are right. Neither is right for everyone.",
  "caption": "I have talked people out of a river week and out of an ocean week in the same afternoon. The mistake is assuming *cruise* describes one holiday.",
  "treatment": "duotone", "focus": "center",
  "brief": "Single lounge at 10pm: piano lid shut, one stool, ten empty chairs turned toward it, two low lamps, dark bank outside.",
  "source": "Jordan's own late on a river sailing; BDM/portal (confirm with BDM); Unsplash 'small ship lounge closed piano empty chairs night'" }
```

---

## The Advisor's Edit

**`2026-09-26-the-line-pays-me`** — *The line pays me. You don't.*
- **Shot** — a chandler's brass balance scale on a dusty windowsill, both pans empty and level, hard side light through old glass. The cost is already in the fare; it is spent either way. Not in frame: money, logos, laptops.
- **Slide 2** — second cover; a commission conversation needs an image that is calm and impersonal, and a level scale is both.
- **Get it** — 1 Jordan: a chandlery, a junk shop, or his own shelf. · 2 n/a. · 3 Unsplash — "brass balance scale empty pans window dust".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Start here",
  "title": "Your fare is the same or better. My fee is not added to it.",
  "caption": "Lines build the cost of distribution into every fare they publish. It is spent whether an advisor is involved or not. If nobody is, the line keeps it.",
  "treatment": "duotone", "focus": "center",
  "brief": "Chandler's brass balance scale on a dusty windowsill, both pans empty and level, hard side light through old glass.",
  "source": "Jordan's own (chandlery or junk shop); else Unsplash 'brass balance scale empty pans window dust'" }
```

**`2026-09-27-i-found-it-cheaper-online`** — *"I found it cheaper online"*
- **Shot** — two near-identical printed tickets laid side by side on a dark table, overhead flat light: same size, same layout, one visibly thinner stock and cut slightly short. Shot so **no text is legible** — the difference is physical, not readable.
- **Slide 2** — second cover; "a different fare code, not a better price" as an object lesson.
- **Get it** — 1 Jordan: two old tickets and a table. · 2 n/a. · 3 Rijksmuseum — printed 19th-c. passage tickets and coupon sheets; or Unsplash "two old paper tickets side by side dark table".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The short answer",
  "title": "A cheaper number is usually a smaller booking.",
  "caption": "Same ship, same week, same cabin letter — and a different fare code underneath it, with different inclusions and different terms.",
  "treatment": "duotone", "focus": "center",
  "brief": "Two near-identical printed tickets side by side on a dark table, overhead light, one thinner and cut short. No text legible.",
  "source": "Jordan's own (two old tickets); else Rijksmuseum 19th-c. passage tickets, or Unsplash 'two old paper tickets side by side'" }
```

**`2026-09-28-the-number-you-call-at-2am`** — *The number you call at 2am*
- **Shot** — a desk at night: one lamp, a notebook with a pencilled list half written, a landline handset lifted off its cradle and resting on the blotter, the window black, the rest of the room unlit. Not in frame: screens, legible notes, brand marks.
- **Slide 6** — the payoff breath; "you are buying someone answering" is a lit desk at an unreasonable hour.
- **Get it** — 1 Jordan: his own desk, lamp on, everything else off. · 2 n/a. · 3 Unsplash — "desk lamp notebook telephone handset night dark room".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "You are not buying a booking. You are buying someone answering.",
  "caption": "The fare is identical either way. What differs is whether a person has your file already open when the plan comes apart at an inconvenient hour.",
  "treatment": "duotone", "focus": "center",
  "brief": "Desk at night: one lamp, a pencilled list half written, a landline handset off its cradle on the blotter, black window.",
  "source": "Jordan's own desk; else Unsplash 'desk lamp notebook telephone handset night dark room'" }
```

**`2026-09-29-a-name-not-a-booking-reference`** — *A name, not a booking reference*
- **Shot** — a letterpress-printed calling card resting on a linen envelope, deckled edge, the impression of the type visible in the paper under raking light. **No real name legible** — shoot at an angle, or set a blank card.
- **Slide 2** — second cover; a name as a physical object, printed rather than generated, is the whole argument of the deck.
- **Get it** — 1 Jordan: his own stationery, or a letterpress studio will print a blank. · 2 n/a. · 3 Unsplash — "letterpress calling card deckled edge raking light".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Rarely said aloud",
  "title": "Lines keep records on advisors, much as they do on ships.",
  "caption": "How much we sell, how well we brief a client, how rarely we ring in a panic. That standing decides whether a request is looked at or merely logged.",
  "treatment": "duotone", "focus": "center",
  "brief": "Letterpress calling card on a linen envelope, deckled edge, type impression visible under raking light. No name legible.",
  "source": "Jordan's own stationery; else Unsplash 'letterpress calling card deckled edge raking light'" }
```

**`2026-09-30-the-questions-i-ask-first`** — *Five questions before I name a ship*
- **Shot** — a chart table with a blank paper chart on it and no course drawn yet: dividers closed, a soft pencil, a brass parallel rule squared to the edge, morning light. The emptiness is the point — the brief comes before the route.
- **Slide 2** — second cover; a blank chart is the strongest possible second cover for a deck about asking before recommending.
- **Get it** — 1 Jordan: his own chart and instruments. · 2 n/a. · 3 Rijksmuseum — engraved blank sea charts and portolan plates; or Unsplash "blank nautical chart dividers parallel rule pencil".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "Where I start",
  "title": "The first thing I need isn't a destination. It's a temperament.",
  "caption": "Two travellers can want the same coastline and need entirely different ships. Naming the ship first is how people end up on the wrong one.",
  "treatment": "duotone", "focus": "center",
  "brief": "Chart table, blank chart, no course drawn: closed dividers, soft pencil, brass parallel rule squared to the edge, morning light.",
  "source": "Jordan's own chart and instruments; else Rijksmuseum engraved sea charts, or Unsplash 'blank nautical chart dividers parallel rule'" }
```

**`2026-10-01-the-sailings-i-talk-people-out-of`** — *The sailings I talk people out of*
- **Shot** — a letterpress proof sheet marked up in blue pencil: three lines struck clean through, one left standing, the corrections in the margin, hard side light on the paper's tooth. **No legible sailing names or client detail.**
- **Slide 6** — the payoff breath; "no isn't a lost sale" is editing, and this is a picture of editing.
- **Get it** — 1 Jordan: mark up a proof himself; a print studio will run a blank galley. · 2 n/a. · 3 Unsplash — "proof sheet blue pencil corrections struck through paper".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "No isn't a lost sale. It's what makes the next yes worth anything.",
  "caption": "You cannot be candid about a ship on Monday and sell it on Friday to someone plainly unsuited to it. The practice rests on that line holding.",
  "treatment": "duotone", "focus": "center",
  "brief": "Letterpress proof marked in blue pencil: three lines struck through, one left standing, corrections in the margin, hard side light.",
  "source": "Jordan's own marked-up proof; else Unsplash 'proof sheet blue pencil corrections struck through'" }
```

**`2026-10-02-what-not-to-expect`** — *What not to expect from an advisor*
- **Shot** — a brass barometer on a panelled bulkhead, needle low, the glass reflecting a grey window; scratched bezel, dulled brass. The one thing no advisor can overrule. Not in frame: digital displays, logos, people.
- **Slide 2** — second cover; the deck's honesty about limits needs an instrument, not a claim.
- **Get it** — 1 Jordan: any ship, hotel or club with an old barometer. · 2 n/a. · 3 Unsplash — "brass barometer panelled wall low pressure grey light"; or Rijksmuseum, engraved barometer and instrument plates.
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "First, the obvious one",
  "title": "I am not a discount. I'm an edit.",
  "caption": "The fare is the fare — the same or better than direct, never marked up. If the whole question is the lowest number on a screen, you don't need me.",
  "treatment": "duotone", "focus": "center",
  "brief": "Brass barometer on a panelled bulkhead, needle low, grey window reflected in scratched glass, brass dulled.",
  "source": "Jordan's own (ship, hotel or club); else Unsplash 'brass barometer panelled wall grey light', or a Rijksmuseum instrument plate" }
```

---

## Quiet luxury

**`2026-10-03-space-is-the-expensive-part`** — *Space is the expensive part*
- **Shot** — a panelled room at four in the afternoon with more chairs than people and nobody in it: four worn leather armchairs, a window seat still free, one reading lamp lit, sea light coming flat through the glass. Not in frame: atriums, gilding, glass sculpture, crowds.
- **Slide 6** — the payoff breath; "buy the emptier ship" is a room with nobody in it, and it wants the whole slide.
- **Get it** — 1 Jordan: on an inspection, mid-afternoon, before the room fills. · 2 BDM/portal: public-room imagery (confirm with BDM) — note theirs is populated by design. · 3 Unsplash — "empty panelled lounge leather armchairs window seat afternoon".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Buy the emptier ship, not the shinier one.",
  "caption": "The Cyclades in October is the same sea from either deck. The difference is whether the deck has forty people on it or four hundred.",
  "treatment": "warm", "focus": "center",
  "brief": "Panelled room at 4pm, nobody in it: four worn leather armchairs, a free window seat, one lamp lit, flat sea light.",
  "source": "Jordan's own inspection mid-afternoon; BDM/portal public-room imagery (confirm with BDM); Unsplash 'empty panelled lounge leather armchairs window seat'" }
```

**`2026-10-04-a-table-at-eight`** — *A table at eight o'clock*
- **Shot** — a single table for two laid by a window at dusk: one unlit candle, two glasses, no reserved card, the room beyond it mostly empty and unlit. Not in frame: cover-charge cards, menus propped up, queues, staff.
- **Slide 2** — second cover; the question in the title becomes a photograph of the answer.
- **Get it** — 1 Jordan: on an inspection before service. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "table for two by window dusk empty restaurant candle".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The real test",
  "title": "Scarcity onboard is designed. It is not a fact of the sea.",
  "caption": "A booking window that opens at midnight ninety days out isn't hospitality under pressure. It is a room built too small on purpose, and then rationed.",
  "treatment": "duotone", "focus": "center",
  "brief": "Single table for two laid by a window at dusk: one unlit candle, two glasses, no reserved card, room beyond empty and unlit.",
  "source": "Jordan's own inspection before service; BDM/portal (confirm with BDM); Unsplash 'table for two by window dusk empty restaurant'" }
```

**`2026-10-05-service-that-anticipates`** — *Service that anticipates, not performs*
- **Shot** — a cup of coffee set down on a side table beside a book already open at the right page, a reading lamp moved to the correct side, nobody in frame at all. Morning light, no hands, no crew. Not in frame: towel animals, applauding line-ups, photographers.
- **Slide 2** — second cover; invisible service made visible is precisely the claim slide 2 must carry alone.
- **Get it** — 1 Jordan: on any morning aboard — set it down and step back. · 2 BDM/portal (confirm with BDM), though line imagery almost always includes a smiling crew member, which is the opposite of this brief. · 3 Unsplash — "coffee cup side table open book reading lamp morning".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The distinction",
  "title": "Anticipation costs crew. Performance only costs choreography.",
  "caption": "A line-up applauding you up the gangway is free. A barman who has your coffee right on the second morning is a staffing model, and it shows in the fare.",
  "treatment": "duotone", "focus": "center",
  "brief": "Coffee set down beside a book open at the right page, reading lamp moved to the correct side, nobody in frame.",
  "source": "Jordan's own, any morning aboard; BDM/portal (confirm with BDM, though theirs will include crew); Unsplash 'coffee cup side table open book reading lamp'" }
```

**`2026-10-06-the-tyranny-of-the-upsell`** — *The tyranny of the small transaction*
- **Shot** — a marble bar top at ten in the morning with **nothing being sold on it**: no tent cards, no price list, no card machine, no bottles turned label-out. One glass of water, a folded cloth, low reflected light. Not in frame: cocktails, promotional signage, spa or package leaflets.
- **Slide 2** — second cover; an absence is hard to photograph, which is exactly why it earns the position.
- **Get it** — 1 Jordan: on an inclusive-line inspection, before the bar opens. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "marble bar top morning glass of water folded cloth empty".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The real cost",
  "title": "No single upsell is expensive. Thirty of them are exhausting.",
  "caption": "The drinks package, the cover charge, the spa tier, the internet plan. Each reasonable alone, and collectively a negotiation with your own holiday.",
  "treatment": "duotone", "focus": "center",
  "brief": "Marble bar top at 10am with nothing being sold: no tent cards, no price list, no card machine. One glass of water, a folded cloth.",
  "source": "Jordan's own inspection before opening; BDM/portal (confirm with BDM); Unsplash 'marble bar top morning glass of water empty'" }
```

**`2026-10-07-what-a-butler-is-for`** — *What a butler is actually for*
- **Shot** — a brass service push beside a panelled door, the plate worn bright by thumbs and the surrounding lacquer dulled, close and raking. The standing behind the button, not the pouring. Not in frame: staff, champagne, canapés, brand marks.
- **Slide 2** — second cover; the deck argues he is a fixer, not a waiter, and a call button says that without a person in frame.
- **Get it** — 1 Jordan: any suite corridor on an inspection, or an old hotel. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "brass service call button panelled door worn close up".
```json
{ "template": "photo", "src": "photos/02.jpg",
  "kicker": "The common mistake",
  "title": "He is not a waiter with a better title. He is a fixer with standing.",
  "caption": "The value is not service delivered to you in the suite. It is friction removed elsewhere on the ship, before you ever knew it existed.",
  "treatment": "duotone", "focus": "center",
  "brief": "Brass service push beside a panelled door, plate worn bright by thumbs, lacquer dulled around it, close and raking light.",
  "source": "Jordan's own (suite corridor or an old hotel); BDM/portal (confirm with BDM); Unsplash 'brass service call button panelled door worn'" }
```

**`2026-10-08-design-that-has-aged-well`** — *Aged well, or was new once*
- **Shot** — a tight detail of surfaces that have recorded use: the arm of an oak-framed leather chair, brass tack heads polished by hands, a wool throw over the back, a bound book on the sill behind. Low side light, no gloss anywhere. Not in frame: lacquer, chrome, backlit acrylic, screens.
- **Slide 6** — the payoff breath; "good bones beat a recent refit" is a texture, and textures close a deck better than they open one.
- **Get it** — 1 Jordan: on an older ship, or any club room. · 2 BDM/portal (confirm with BDM). · 3 Unsplash — "worn leather chair arm brass tacks oak wool close up".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Good bones beat a recent refit almost every time.",
  "caption": "A twenty-year-old ship built in oak and brass will be pleasant for another twenty. The sea is the view; the room only has to be quiet and well made.",
  "treatment": "warm", "focus": "center",
  "brief": "Tight detail: oak-framed leather chair arm, brass tack heads polished by hands, wool throw, a bound book on the sill. No gloss.",
  "source": "Jordan's own (older ship or a club room); BDM/portal (confirm with BDM); Unsplash 'worn leather chair arm brass tacks oak wool'" }
```

**`2026-10-09-the-quiet-you-are-paying-for`** — *The quiet you are paying for*
- **Shot** — from corridor floor level: a printed daily programme slipped half under a cabin door, one lamp along the corridor lit, carpet and skirting in raking light, nothing and nobody else. Shoot so **no line name or ship name is legible** on the sheet.
- **Slide 6** — the payoff breath; the payoff asks you to read the daily programme, so end on the programme itself.
- **Get it** — 1 Jordan: any morning aboard, shot from the corridor before anyone is up. · 2 BDM/portal (confirm with BDM) — unlikely to exist as an asset. · 3 Unsplash — "paper slipped under hotel door corridor carpet lamp night".
```json
{ "template": "photo", "src": "photos/06.jpg",
  "kicker": "The payoff",
  "title": "Judge a ship by what it declines to do to you.",
  "caption": "Read the daily programme of a sailing before you book it, and count the revenue events. That page tells you more than the rest of the brochure.",
  "treatment": "duotone", "focus": "center 60%",
  "brief": "Corridor floor level: printed daily programme half under a cabin door, one lamp lit, carpet and skirting in raking light. Nothing legible.",
  "source": "Jordan's own, early morning in a corridor; BDM/portal (confirm with BDM); Unsplash 'paper slipped under hotel door corridor carpet lamp'" }
```

---

**70 entries · 10 pillars · one photograph each.** Shoot in whatever order the
opportunities arrive; the decks stay postable throughout.
