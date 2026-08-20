# Dispatch Deliverability

_Written Aug 20, 2026, against the ~330-row list in the Dispatch contacts sheet
and the No. 002 letter (`emails/dispatch-aegean-and-the-atlantic.html`)._

## The question on the table

> Resend is wired to projectboca, not this brand. Would it make it that much
> more deliverable?

**Honestly: no, not by much — and I overstated it when I first said "don't send
from Gmail."** Correcting that.

The Gmail and Yahoo bulk-sender mandates that everyone cites — enforced DMARC,
RFC 8058 one-click unsubscribe — **bind at 5,000 messages per day to that
provider**. This list is 330 people total. Jordan is an order of magnitude under
the threshold, and `luxurycruiseconnections.com` is an established domain that
has been sending real human mail for years. That reputation is worth more than
a freshly verified ESP domain with no sending history at all.

So the ranking is:

| Option | Inbox placement | Verdict |
|---|---|---|
| Send from the existing authenticated domain | Good — established reputation | **Fine at this size.** Fix the compliance gaps below and send. |
| Verify `bonvtravelcompany.com` in Resend, send from there | Slightly worse *at first* — cold domain, no history | **Best long-term.** Worth doing, but warm it (see below). |
| Send from a projectboca address | Worst | **Don't.** See next section. |

### The one option that is actually bad

Sending as projectboca. Not because of authentication — that domain is verified
and would pass SPF/DKIM fine. Because **330 people who signed up to hear from
Jordan Yates would receive mail from a sender they have never heard of.**

That is the single largest driver of spam complaints there is, and complaints
are the metric that decides placement. Google's stated tolerance is 0.3%. On a
list of 330, **one complaint is 0.3%**. Two is double the threshold. An
unrecognised From line is how you get those two complaints.

If the choice is Gmail-from-a-known-domain versus Resend-from-projectboca, take
Gmail. It isn't close.

### So why use the ESP at all

Not for raw placement. For three things Gmail cannot give:

1. **A bounce and complaint feed.** Some of these addresses have been dead since
   2020. Gmail will not tell you which; it just quietly degrades your sender
   reputation. An ESP suppresses them automatically after the first hard bounce.
2. **A compliant unsubscribe.** CAN-SPAM requires a working opt-out honoured
   within 10 business days, on every commercial message, at any volume. That is
   a legal floor, not a threshold thing, and hand-managing it from Gmail across
   330 replies is how people end up in trouble.
3. **Attribution.** `campaigns` → `campaign_sailings` → `campaign_events` is
   already built and already wired to `/api/webhooks/resend`. Sending from
   Gmail means that whole pipeline stays dark, exactly as it did for the Sonata
   blast — which is why `emails-archive.ts` records its results as "unknown."

**Recommendation:** verify `bonvtravelcompany.com` in the existing Resend
account (Resend allows many domains per account — the projectboca wiring does
not block this), then warm it by sending No. 002 in three tranches rather than
one blast. Tranche one to the 30 most-engaged contacts, watch for 24 hours,
then the rest. A cold domain's first impression is set by its first few hundred
messages; make those land on people who want them.

## What actually moves the needle at 330 recipients

Ranked by effect, largest first. Volume is small enough that content and list
quality dominate everything technical.

1. **Prune before sending, not after.** The audit (`--audit`) reports every
   blocked and suspect row. Sending to addresses that bounce is the fastest way
   to damage a young sending domain.
2. **A real unsubscribe, prominently placed.** Counter-intuitively, an easy
   unsubscribe *improves* deliverability: someone who opts out costs nothing,
   someone who hits "report spam" because they couldn't find the opt-out costs
   0.3% of your allowance.
3. **Multipart.** HTML-only bodies are a mild spam signal everywhere. The
   script always sends `text` alongside `html`; drop a hand-written
   `emails/<slug>.txt` in and it will use that instead of the auto-conversion.
4. **Text-to-image ratio.** No. 002 is almost entirely live HTML text with two
   images (the stamp and the signature block). That is the right shape. Never
   ship a letter as one big image — that is the classic spam pattern.
5. **Send in tranches, watch between them.** Applies to any sending domain.
6. **Reply-to a monitored human inbox.** Replies to a sender are a strong
   positive engagement signal, and this letter's whole CTA is "reply to me,"
   which works in the brand's favour.

## Content notes specific to No. 002

The letter is money-heavy — struck-through fares, dollar savings, percentages.
That is inherent to the product and worth keeping, but it means the other
signals need to be clean:

- **No exclamation marks, no ALL CAPS, no "FREE."** Currently true throughout.
- **Subject is "The Aegean & the Atlantic"** — no price, no urgency word, no
  personalisation token. Correct. First-name-in-subject reads as bulk mail to
  most people now, and Jordan's list knows him by name already.
- **Preheader is a real sentence** that does not repeat the subject, followed
  by zero-width padding so the client does not pull body copy in after it.
- **No link shorteners, no redirect services.** Per-card CTAs are `mailto:`
  today; when they become tracked links they should be on the brand's own
  domain, never a shortener.

## Merge fields in the template

| Tag | Source | Fallback behaviour |
|---|---|---|
| `{{greeting}}` | computed | `Dear friend,` — used whenever the name is unusable **or** the address looks like it belongs to somebody else |
| `{{email}}` | column B | `this address` |
| `{{preheader}}` | campaign config | the literal default in the template |
| `{{postal_address}}` | `DISPATCH_POSTAL_ADDRESS` | renders a loud placeholder, so non-compliant mail cannot ship silently |
| `{{unsubscribe_url}}` | per recipient | set by the sender at send time |

Unresolved tags render empty rather than shipping a literal `{{brace}}`, which
is the most obvious "this is bulk mail" tell there is.

### Why the greeting is conservative

About fifteen rows have an address that plainly belongs to someone else —
Robert Feld at `jeffdashing@`, Judith Bennett at `normanbennett@`, Arnold Sladen
at `judy.granberry@`, Marion Toyoshima at `nanetteconnor@`. These are spouses
and shared household inboxes. "Dear Robert," landing in Jeff's inbox reads as a
scraped list, which is precisely the impression to avoid. The script checks
whether the address plausibly contains the contact's first or last name and
falls back to `Dear friend,` when it does not.

Same fallback for rows whose first name is an initial (`J.`, `T`, `C`), a
slashed pair (`Shelley/suzanne`), or missing entirely. Nobody is dropped from
the send for this — they just get the neutral salutation.

## Before the first send

- [ ] Set `DISPATCH_POSTAL_ADDRESS` — legally required, and the template will
      render a visible placeholder until it is set
- [ ] Point `{{unsubscribe_url}}` at a real endpoint; `/unsubscribe?e=` does not
      exist on the site yet
- [ ] Decide the sending domain and verify it (**not** projectboca)
- [ ] `--audit`, then act on what it reports
- [ ] `--fix-rows` to repair the three column-shifted addresses
- [ ] `--dry-run` and read the generated plain-text version end to end
- [ ] `--only <your own address>` as a seed test; check it in Gmail, Yahoo and
      Outlook before anyone else sees it
- [ ] Send tranche one, wait 24 hours, read the bounce and complaint numbers
