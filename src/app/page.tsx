import Button from "@/components/Button";
import PassportStamp from "@/components/PassportStamp";
import Rule from "@/components/Rule";
import SectionHeading from "@/components/SectionHeading";
import TextLink from "@/components/TextLink";

const HOW_IT_WORKS = [
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
];

export default function Home() {
  return (
    <>
      {/* Opening spread */}
      <section className="px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 sm:grid-cols-[3fr_2fr] sm:gap-16">
          <div className="text-center sm:text-left">
            <div className="relative">
              <PassportStamp className="absolute -top-14 right-0 hidden h-24 w-24 -rotate-12 text-sun-faded opacity-30 sm:block" />
              <h1 className="font-serif text-display">
                A more thoughtful way to travel
              </h1>
            </div>
            <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-aegean-ink sm:mx-0">
              I help clients find exceptional cruise experiences &mdash; not
              just good deals, but the right journeys.
            </p>
            <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:items-baseline sm:gap-8">
              <Button href="#request-a-quote">Request a Quote</Button>
              <TextLink href="#journeys" className="text-sm">
                See recently quoted journeys
              </TextLink>
            </div>
          </div>

          {/* Placeholder — replaced by the engraved portrait when an approved asset exists */}
          <div className="flex justify-center">
            <div
              aria-hidden="true"
              className="flex h-44 w-44 items-center justify-center rounded-full border border-sea-glass bg-linen p-3 sm:h-64 sm:w-64"
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
      <section id="about" className="bg-linen px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-[62ch]">
          <SectionHeading kicker="The Advisor&rsquo;s Note" />
          <div className="mt-10 space-y-6 font-serif text-lg leading-relaxed">
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
          <p className="mt-10 text-right font-serif text-xl italic text-aegean-ink">
            &mdash; Jordan
          </p>
        </div>
      </section>

      {/* Recently Quoted — journey cards arrive in Phase 3 */}
      <section id="journeys" className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            kicker="Recently Quoted"
            title="A few sailings worth your attention"
          />
          <p className="mx-auto mt-8 max-w-[52ch] text-center leading-relaxed text-aegean-ink">
            A short list of itineraries I&rsquo;ve recently prepared for
            clients &mdash; with dates, fares, and my honest read on each
            &mdash; will be published here.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-linen px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-[62ch]">
          <SectionHeading kicker="How It Works" />
          <ol className="mt-10">
            {HOW_IT_WORKS.map(({ step, title, copy }, i) => (
              <li key={step}>
                {i > 0 && <Rule className="my-8" />}
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

      {/* Jordan's Take — the advisor's field note */}
      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-[54ch]">
          <SectionHeading kicker="Jordan&rsquo;s Take" />
          <blockquote className="mt-8 text-center font-serif text-xl italic leading-relaxed">
            &ldquo;The difference between a good trip and a memorable one
            usually comes down to time &mdash; time in port, time at dinner,
            time to actually enjoy where you are.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* From clients */}
      <section className="bg-linen px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-[54ch]">
          <SectionHeading kicker="From Clients" />
          <figure className="mt-8 text-center">
            <blockquote className="font-serif text-xl italic leading-relaxed">
              &ldquo;Jordan&rsquo;s knowledge, candor, and attention to detail
              made all the difference. He truly cares.&rdquo;
            </blockquote>
            <figcaption className="mt-6 text-kicker uppercase text-sun-faded">
              &mdash; Nancy &amp; Werner
            </figcaption>
          </figure>
        </div>
      </section>

      {/* The Dispatch — signup form arrives in Phase 4 */}
      <section id="dispatch" className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-[52ch]">
          <SectionHeading kicker="The Dispatch" title="One letter a month" />
          <p className="mt-8 text-center leading-relaxed text-aegean-ink">
            Places worth knowing about, seasons worth planning around.
            Subscriptions open shortly.
          </p>
        </div>
      </section>

      {/* Begin the Conversation — quote form arrives in Phase 4 */}
      <section id="request-a-quote" className="bg-linen px-6 py-24 sm:py-28">
        <div className="mx-auto flex max-w-[52ch] flex-col items-center text-center">
          <SectionHeading
            kicker="Request a Quote"
            title="Begin the conversation"
          />
          <p className="mt-8 leading-relaxed text-aegean-ink">
            Write to me with where you&rsquo;re thinking of going &mdash; or
            where you&rsquo;ve always meant to &mdash; and I&rsquo;ll reply
            personally.
          </p>
          <Button
            href="mailto:jordan.yates@luxurycruiseconnections.com"
            className="mt-10"
          >
            Write to Jordan
          </Button>
          <p className="mt-6 text-sm text-aegean-ink">
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
