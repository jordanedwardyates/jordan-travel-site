import Button from "@/components/Button";
import PassportStamp from "@/components/PassportStamp";
import SectionHeading from "@/components/SectionHeading";
import TextLink from "@/components/TextLink";

export default function Home() {
  return (
    <>
      {/* Opening spread */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
          {/* Placeholder — replaced by the engraved portrait when the asset arrives */}
          <div
            aria-hidden="true"
            className="flex h-20 w-20 items-center justify-center rounded-full border border-sea-glass bg-linen font-serif text-2xl text-sun-faded"
          >
            JY
          </div>

          <div className="relative mt-14 sm:mt-16">
            <PassportStamp className="absolute -top-12 -right-4 h-24 w-24 -rotate-12 text-sun-faded opacity-30 sm:-right-14" />
            <h1 className="font-serif text-display">
              A more thoughtful way to travel
            </h1>
          </div>

          <p className="mx-auto mt-8 max-w-[52ch] text-lg leading-relaxed text-aegean-ink">
            I help clients find exceptional cruise experiences &mdash; not just
            good deals, but the right journeys.
          </p>

          <Button href="#request-a-quote" className="mt-12">
            Request a Quote
          </Button>
          <TextLink href="#journeys" className="mt-6 text-sm">
            See recently quoted journeys
          </TextLink>
        </div>
      </section>

      {/* The Advisor's Note — interim copy, finalized in Phase 2 */}
      <section id="about" className="bg-linen px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-[62ch]">
          <SectionHeading kicker="The Advisor&rsquo;s Note" />
          <p className="mt-8 font-serif text-lg leading-relaxed">
            I&rsquo;ve spent years helping travelers find the right ship, the
            right itinerary, and the right season &mdash; not the loudest
            offer. A proper introduction belongs here, and it&rsquo;s being
            written with the care it deserves.
          </p>
          {/* Placeholder — replaced by Jordan's script signature asset */}
          <p className="mt-8 text-right font-serif text-xl italic text-aegean-ink">
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

      {/* How It Works — three steps arrive in Phase 2 */}
      <section className="bg-linen px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-[62ch]">
          <SectionHeading kicker="How It Works" />
          <p className="mt-8 text-center leading-relaxed text-aegean-ink">
            Correspond, curate, confirm &mdash; the shape of working together,
            explained here shortly.
          </p>
        </div>
      </section>

      {/* Client pull quote — existing "Jordan's Take" stands in until Phase 2 */}
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

      {/* The Dispatch — signup form arrives in Phase 4 */}
      <section id="dispatch" className="bg-linen px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-[52ch]">
          <SectionHeading kicker="The Dispatch" title="One letter a month" />
          <p className="mt-8 text-center leading-relaxed text-aegean-ink">
            Places worth knowing about, seasons worth planning around.
            Subscriptions open shortly.
          </p>
        </div>
      </section>

      {/* Begin the Conversation — quote form arrives in Phase 4 */}
      <section id="request-a-quote" className="px-6 py-24 sm:py-28">
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
