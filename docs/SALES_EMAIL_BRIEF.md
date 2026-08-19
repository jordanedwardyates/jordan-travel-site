# Sales Email Brief — Sonata Inaugural Aegean

_Drafted August 16, 2026. Planning document — no copy written yet, awaiting sailings._

## Strategic read

Three facts from the archive shape this send:

1. **Dispatch 001 features seven sailings.** Seven is a browse email. Every
   additional option shifts the reader from deciding to comparing, and
   comparing converts worse. A sales email carries one recommendation.
2. **The Sonata inaugural invitation went to 500+ on July 27 and was never
   followed up.** That is the warmest segment on the list and the loop is
   still open. Three weeks is the right re-approach interval.
3. **Mid-August is the pre-Wave dead zone.** Nobody is discounting, so a
   judgment-led (not promotion-led) letter owns the inbox uncontested.

## Recommendation

**Oceania Sonata — inaugural Mediterranean & Aegean season, spring–autumn 2027.
Three sailings.**

- **Line — Oceania.** The list is already conditioned to it (Sonata, Marina,
  Sirena, Insignia, Allura all appear in prior drafts). Introducing a second
  line in a conversion email dilutes authority and doubles the decision.
- **Region — Aegean/Adriatic-weighted Mediterranean.** The one region where
  brand identity and product are the same thing; it needs no argument.
- **Season — autumn 2027 primarily, one spring 2027 option.** Booking 12–14
  months out is a real luxury argument, not manufactured urgency: *the suite
  you want, not the suite that's left.*
- **Ship — Sonata as hero.** An inaugural season is the only genuinely
  non-repeatable scarcity story in cruise, and it lets the letter avoid
  discount language entirely.

**Fallback** if Sonata inventory or fares aren't loaded: Sirena or Insignia,
Greek Isles & Adriatic, Sept–Oct 2027. Same structure; swap "inaugural season"
for "670 guests, ports the big ships cannot enter."

### Sailings to source

| Slot | Role | Spec |
|---|---|---|
| A — hero | The one Jordan would book himself | Sonata, 10–12 nights, Athens or Istanbul on the itinerary, Sept/Oct 2027 |
| B — entry | Lower fare, shorter; removes the price objection | 7 nights, Rome or Barcelona turnaround, spring 2027 |
| C — stretch | Higher fare, longer; for the top decile | 14+ nights, or a Penthouse/Vista Suite lead, autumn 2027 |

Required per sailing: ship, voyage code, embark/disembark ports and dates,
official Oceania voyage URL, lead cabin category, **net fare, struck retail,
dollars saved, any OBC**. Retail before writing, not after (README rule 2).

## Email structure

Single column, cream paper, existing Dispatch shell. Target ~350 words of body.
Past 400 words the reply rate drops.

1. **Subject** — no prices, no "sale," no exclamation. In order of preference:
   - `The Sonata's first season in the Aegean`
   - `Where I'd send you in autumn 2027`
   - `Three sailings I've been holding onto`
2. **Preheader** — a real sentence, not a subject repeat:
   *A new ship, her first Mediterranean season, and the cabins that go first.*
3. **Masthead** — existing Dispatch letterhead, unchanged.
4. **The open — 2 sentences.** Lead with the observation, not the offer.
   Reporting, not pitching.
5. **Advisor's frame — 3–4 sentences.** Why now, and why Jordan. The honest
   argument: inaugural-season suite inventory is finite and front-loaded, and
   13 months out is the only moment the whole ship is available to choose from.
   State it plainly; no urgency theater.
6. **Three sailing cards** — A, B, C, hero first. Each: ship + voyage name,
   dates, a 12–15 word route line, lead fare with struck retail and savings
   beside it (quiet, factual, never in a headline), and the links.
7. **One line of personal endorsement under the hero card only.** The single
   highest-leverage sentence in the letter.
8. **Primary CTA, repeated twice** (after the hero card, and at the close).
   Not "Book Now" — "Ask Jordan to hold this" / "Tell me which one and I'll
   price it properly."
9. **Sign-off** — 2 sentences plus name, reply-inviting.
10. **Footer** — standard. Replace `{{unsubscribe_url}}` with the real ESP
    merge tag before send (an open item that also bit 001).

## Attribution fix to make before sending

README rule 1 sends every sailing-card click to the official cruise-line page.
That is good for trust and bad for revenue: the click leaves for Oceania, the
quote form never sees the UTMs, `source_campaign_id` stays null, and the
email → click → quote → booking loop breaks at step two.

Per card, reorder into two links:

- **Primary button →** the site's quote page, tagged
  `utm_campaign=<slug>&utm_content=<voyage code>`. This is the tracked,
  attributed click that closes the loop.
- **Secondary text link →** "See the full itinerary at Oceania" — official
  page, same UTMs, keeps rule 1 satisfied.

Same two destinations, reordered. Costs nothing; it is the difference between
knowing which sailing sold and guessing.

## Send plan

- **Segment:** full Dispatch list, but send to the ~500 Sonata-invitation
  recipients first as a distinct campaign row. Prior intent means their numbers
  should stay unblended.
- **Timing:** Tuesday or Wednesday, 6:30–7:30am recipient local. Not Monday.
- **Follow-up:** one email, 6 days later, to clickers-who-did-not-quote only.
  Single sailing — whichever card led the leaderboard. Subject:
  `About the one you looked at`.

## Open items

- [ ] Jordan sources sailings A, B and C with retail fares
- [ ] Confirm Sonata 2027 Mediterranean inventory is bookable (else use fallback)
- [ ] Write copy and build HTML against the Dispatch shell
- [ ] Add the campaign row + `campaign_sailings` before send so clicks resolve
- [ ] Real unsubscribe merge tag

---

## Update — Aug 19, 2026: superseded by real inventory

The Oceania/Sonata plan above was written before any actual rate data was in
hand. Jordan supplied two real sources same-day: a Seabourn weekly rate
tracker (`SBN_MI_USD_8.5.26.xlsx`) and a Regent Seven Seas promo sheet
(Google Sheet, "Focus 2026"). The line, region, and specific sailings below
are what actually shipped as **No. 002 — "The Aegean & the Atlantic"**
(`emails/dispatch-aegean-and-the-atlantic.html`); see
`emails/README.md` for the full sailing table and open items.

**What changed and why:**
- **Line:** Seabourn, not Oceania — the only line with usable dollar figures
  in either source. It also fits the brand brief at least as well: true
  small-ship (≈450 guests), Adriatic/Aegean ports the large ships can't
  enter, no "inaugural ship" story needed since the real scarcity signal
  (entry suites closing, week-over-week price moves) was sitting in the data
  already, true and checkable rather than manufactured.
- **Structure held:** hero/entry/stretch survived, just re-cast as one hero
  sailing (Istanbul → Athens), its 14-night twin as the stretch (same
  departure, extended — a real product relationship, not a forced pairing),
  and a cheaper, sooner sailing as the entry point.
- **Regent dropped for this send:** the Focus 2026 sheet has voyage codes,
  nights, region, and approved discount %, but no dollar fares — nothing to
  build a compliant retail/savings row from. Flagged in the README with the
  two strongest Med candidates by code, rather than guessed into the email.
- **Attribution fix reverted to mailto, not UTM-tracked:** the attribution
  fix proposed above (route the primary CTA through a tracked site quote
  page) needs a curated `voyages` row and a `campaigns` DB row, neither of
  which exists yet for these sailings. Building that pipeline wasn't in
  scope for a 30-minute turnaround, so per-card CTAs are `mailto:` links
  with the voyage code in the subject line — crude, but real, and it ships
  today. Worth doing properly if this becomes a repeatable pattern.

**Revised same day, after Jordan's review.** He cut the duplicate (6673 and
6673A are the same departure — the 14-night is now a one-line upsell note
under the 7-night, +$3,315 pp), added two Regent Caribbean sailings from his
own quotes, and asked for itinerary stops and suite sizes throughout. Net
effect: the letter is now two sections, Seabourn in the Aegean and Regent
across the Atlantic, and it leads on Regent's all-inclusive arithmetic rather
than on discount depth — a stronger luxury argument than either line's
savings column on its own.

**Worth recording for next time:** this session's network egress policy blocks
`rssc.com`, `seabourn.com`, and every cruise aggregator, so voyage pages
cannot be fetched here at all — only web search works. Any letter that needs
verified ports, suite dimensions, or featured fares will need those pasted in,
or built somewhere with open egress.
