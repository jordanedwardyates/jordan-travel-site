import Button from "@/components/Button";
import JourneyCard, { type Journey } from "@/components/JourneyCard";
import PassportStamp from "@/components/PassportStamp";
import Rule from "@/components/Rule";
import SectionHeading from "@/components/SectionHeading";
import TextLink from "@/components/TextLink";

/*
 * PLACEHOLDER DATA — sample sailings for layout and copy direction only.
 * Prices, staterooms, sizes, and notes are illustrative and must be
 * replaced with live quotes in Phase 4.
 */
const SAMPLE_JOURNEYS: Journey[] = [
  {
    region: "Mediterranean",
    dates: "3–10 Oct 2026",
    routeTitle: "Trieste to Athens",
    voyageTitle: "Mediterranean Jewels",
    cruiseLine: "Oceania Cruises",
    ship: "Oceania Allura",
    nights: 7,
    embark: "Trieste, Italy",
    disembark: "Athens, Greece",
    portCount: 4,
    stateroom: "Veranda Stateroom",
    roomSize: "approx. 27 m²",
    theirPrice: "$2,999",
    yourPrice: "$2,749",
    priceNote: "plus shipboard credit",
    jordansTake:
      "The Adriatic in October light — after the summer ferries thin out and the harbor towns get their evenings back.",
    availabilityNote:
      "Veranda categories on autumn sailings are often the first to fill.",
  },
  {
    region: "The Danube",
    dates: "6–13 Sep 2026",
    routeTitle: "Budapest to Vilshofen",
    voyageTitle: "Gems of the Danube",
    cruiseLine: "Scenic",
    ship: "Scenic Opal",
    nights: 7,
    embark: "Budapest, Hungary",
    disembark: "Vilshofen, Germany",
    portCount: 6,
    stateroom: "Royal Balcony Suite",
    roomSize: "approx. 21 m²",
    theirPrice: "$9,480",
    yourPrice: "$8,880",
    jordansTake:
      "River ships live or die by their moorings — it's the first thing I check on any Danube sailing.",
    availabilityNote: "Suites on river ships are always limited.",
  },
  {
    region: "Greece & Turkey",
    dates: "15–25 Aug 2026",
    routeTitle: "Istanbul to Athens",
    voyageTitle: "Iconic Greece & Turkey",
    cruiseLine: "Regent Seven Seas",
    ship: "Seven Seas Voyager",
    nights: 10,
    embark: "Istanbul, Turkey",
    disembark: "Athens, Greece",
    portCount: 5,
    stateroom: "Veranda Suite",
    roomSize: "approx. 33 m²",
    theirPrice: "$7,999",
    yourPrice: "$7,591",
    priceNote: "all-inclusive fare",
    jordansTake:
      "Ten nights lets this one breathe — an overnight in Istanbul rather than a drive-by is the whole point.",
  },
];

export default function Home() {
  return (
    <>
      {/* Opening spread */}
      <section className="px-6 py-12 sm:px-10 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 sm:grid-cols-[3fr_2fr] sm:gap-16">
          <div className="text-center sm:text-left">
            {/* pt reserves the stamp's band so it can never touch the headline */}
            <div className="relative sm:pt-20">
              <PassportStamp className="absolute top-0 right-0 hidden h-20 w-20 -rotate-12 text-sun-faded opacity-30 sm:block" />
              <h1 className="font-serif text-display">
                A more thoughtful way to travel
              </h1>
            </div>
            <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-aegean-ink sm:mx-0">
              I&rsquo;m Jordan Yates. I help clients find exceptional cruise
              experiences &mdash; not just good deals, but the right journeys.
            </p>
            <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:items-baseline sm:gap-8">
              <Button href="#request-a-quote">Request a Quote</Button>
              <TextLink href="#journeys" className="text-sm whitespace-nowrap">
                See recently quoted journeys
              </TextLink>
            </div>
            <p className="mt-5 text-sm text-aegean-ink">
              Prefer to talk? Call or text{" "}
              <a
                href="tel:+19046141219"
                className="underline decoration-compass-gold/70 underline-offset-4 hover:decoration-compass-gold oldstyle-nums"
              >
                904-614-1219
              </a>
              .
            </p>
          </div>

          {/* Placeholder — replaced by the engraved portrait when an approved asset exists */}
          <div className="flex justify-center">
            <div
              aria-hidden="true"
              className="flex h-40 w-40 items-center justify-center rounded-full border border-sea-glass bg-linen p-3 sm:h-60 sm:w-60"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full border border-sea-glass">
                <span className="font-serif text-4xl text-sun-faded sm:text-5xl">
                  JY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Advisor's Note */}
      <section id="about" className="bg-linen px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[62ch]">
          <SectionHeading kicker="The Advisor&rsquo;s Note" align="left" />
          <div className="mt-8 space-y-6 font-serif text-lg leading-relaxed">
            <p>
              Most of what I do isn&rsquo;t booking travel &mdash; it&rsquo;s
              editing it. Any search engine can surface a hundred sailings;
              the work is knowing which three deserve your attention, and why.
            </p>
            <p>
              When we plan together, you&rsquo;ll get honest counsel on ships,
              seasons, and itineraries &mdash; including which celebrated ones
              to skip, and when a smaller ship or a shoulder-season date buys
              you more than any upgrade. My advice is candid, my services are
              complimentary, and every recommendation is one I&rsquo;d be glad
              to defend over dinner.
            </p>
          </div>
          {/* Placeholder — replaced by Jordan's script-signature asset when approved */}
          <p className="mt-8 text-right font-serif text-xl italic text-aegean-ink">
            &mdash; Jordan
          </p>
        </div>
      </section>

      {/* Recently Quoted — the centerpiece */}
      <section id="journeys" className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <PassportStamp
              text="· RECENTLY QUOTED · THE AEGEAN PASSPORT"
              className="absolute -top-6 right-0 hidden h-20 w-20 rotate-12 text-sun-faded opacity-25 lg:block"
            />
            <SectionHeading
              kicker="Recently Quoted"
              title="A few sailings worth your attention"
            />
          </div>
          <p className="mx-auto mt-6 max-w-[52ch] text-center leading-relaxed text-aegean-ink">
            Itineraries I&rsquo;ve recently prepared for clients &mdash; the
            dates, the fares, and my honest read on each.
          </p>

          <div className="mt-10 space-y-8">
            {SAMPLE_JOURNEYS.map((journey) => (
              <JourneyCard key={journey.voyageTitle} journey={journey} />
            ))}
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-aegean-ink">
            Recently quoted examples. Pricing and availability are subject to
            change.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-linen px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[62ch]">
          <SectionHeading kicker="How It Works" align="left" />
          <ol className="mt-8">
            {[
              {
                step: "01",
                title: "Correspond",
                copy: "Write or call with where you're leaning — or the trip you've been circling for years. I'll ask the questions that matter.",
              },
              {
                step: "02",
                title: "Curate",
                copy: "I return with a short list of sailings worth your time: dates, fares, and my honest read on each — including what I'd skip.",
              },
              {
                step: "03",
                title: "Confirm",
                copy: "When one feels right, I take care of the rest — the booking, the details, the follow-through — until you're home again.",
              },
            ].map(({ step, title, copy }, i) => (
              <li key={step}>
                {i > 0 && <Rule className="my-7" />}
                <div className="flex items-baseline gap-5">
                  <span
                    aria-hidden="true"
                    className="font-serif text-2xl text-sun-faded oldstyle-nums"
                  >
                    {step}
                  </span>
                  <div>
                    <h3 className="text-kicker font-medium uppercase text-deep-harbor">
                      {title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-aegean-ink">
                      {copy}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Margin notes — the advisor's line and a client's, side by side */}
      <section className="px-6 py-14 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:gap-0">
          <div className="sm:pr-12">
            <SectionHeading kicker="Jordan&rsquo;s Take" align="left" />
            <blockquote className="mt-6 font-serif text-xl italic leading-relaxed">
              &ldquo;The difference between a good trip and a memorable one
              usually comes down to time &mdash; time in port, time at dinner,
              time to actually enjoy where you are.&rdquo;
            </blockquote>
          </div>
          <div className="border-t border-salt-air pt-10 sm:border-l sm:border-t-0 sm:pl-12 sm:pt-0">
            <SectionHeading kicker="From Clients" align="left" />
            <figure className="mt-6">
              <blockquote className="font-serif text-xl italic leading-relaxed">
                &ldquo;Jordan&rsquo;s knowledge, candor, and attention to
                detail made all the difference. He truly cares.&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-kicker uppercase text-sun-faded">
                &mdash; Nancy &amp; Werner
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* The Dispatch — bound-in subscription card; form arrives in Phase 4 */}
      <section id="dispatch" className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[40rem] border border-salt-air bg-linen p-1">
          <div className="border border-salt-air/60 px-6 py-10 text-center sm:px-10">
            <SectionHeading kicker="The Dispatch" title="One letter a month" />
            <p className="mt-5 leading-relaxed text-aegean-ink">
              Places worth knowing about, seasons worth planning around.
              Subscriptions open shortly.
            </p>
          </div>
        </div>
      </section>

      {/* Begin the Conversation — quote form arrives in Phase 4 */}
      <section id="request-a-quote" className="bg-linen px-6 py-16 sm:py-24">
        <div className="mx-auto flex max-w-[52ch] flex-col items-center text-center">
          <SectionHeading
            kicker="Request a Quote"
            title="Begin the conversation"
          />
          <p className="mt-6 leading-relaxed text-aegean-ink">
            Write to me with where you&rsquo;re thinking of going &mdash; or
            where you&rsquo;ve always meant to &mdash; and I&rsquo;ll reply
            personally.
          </p>
          <Button
            href="mailto:jordan.yates@luxurycruiseconnections.com"
            className="mt-8"
          >
            Write to Jordan
          </Button>
          <p className="mt-4 text-sm text-aegean-ink">
            Advisor services are complimentary.
          </p>
          <p className="mt-2 text-sm text-aegean-ink">
            Prefer to talk? Call or text{" "}
            <a
              href="tel:+19046141219"
              className="underline decoration-compass-gold/70 underline-offset-4 hover:decoration-compass-gold oldstyle-nums"
            >
              904-614-1219
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
