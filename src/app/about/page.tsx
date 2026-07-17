import type { Metadata } from "next";
import Image from "next/image";

import Button from "@/components/Button";
import PassportStamp from "@/components/PassportStamp";
import Rule from "@/components/Rule";
import SectionHeading from "@/components/SectionHeading";
import TextLink from "@/components/TextLink";

const DESCRIPTION =
  "Jordan Yates — a Virtuoso cruise advisor since 2011. Honest counsel on ships, seasons, and itineraries, and fares negotiated so his clients never pay retail.";

export const metadata: Metadata = {
  title: "About Jordan",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    url: "/about",
    title: "About Jordan — BON V: A Travel Company",
    description: DESCRIPTION,
  },
};

const FACTS = [
  { value: "2011", label: "Advising since" },
  { value: "Virtuoso", label: "Network member" },
  { value: "Complimentary", label: "Advisor services" },
];

const STEPS = [
  {
    n: "01",
    title: "Tell me where you're leaning",
    text: "A region, a season, an anniversary you're marking — or just the sense that it's time. Write or call. There's no form to survive.",
  },
  {
    n: "02",
    title: "I come back with a short list",
    text: "Not a hundred sailings — three or four worth your time, each with the dates, the negotiated fare, and my honest read on why it made the list.",
  },
  {
    n: "03",
    title: "We refine until one feels right",
    text: "Ship, cabin, itinerary, timing. I'll tell you which celebrated options to skip and where a smaller ship buys you more than any upgrade.",
  },
  {
    n: "04",
    title: "I handle everything until you're home",
    text: "Booking, documents, transfers, the small logistics that go wrong at the worst moment. You travel; I keep the details.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Portrait + opening */}
      <section className="weathered relative overflow-hidden px-6 py-14 sm:px-10 sm:py-20">
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 sm:grid-cols-[2fr_3fr] sm:gap-16">
          <div className="order-2 flex justify-center sm:order-1">
            <div className="relative">
              <PassportStamp
                text="· JORDAN YATES · LUXURY VOYAGE ADVISOR"
                className="absolute -right-4 -top-4 hidden h-20 w-20 -rotate-12 text-sun-faded opacity-30 sm:block"
              />
              <Image
                src="/portrait-engraved.png"
                alt="Engraved passport-style portrait of Jordan Yates"
                width={1739}
                height={1739}
                priority
                className="h-auto w-56 mix-blend-multiply sm:w-72"
              />
            </div>
          </div>
          <div className="order-1 text-center sm:order-2 sm:text-left">
            <SectionHeading kicker="About Jordan" align="left" className="hidden sm:block" />
            <h1 className="mt-4 font-serif text-display">
              An advisor, an explorer, a curator.
            </h1>
            <p className="mx-auto mt-6 max-w-[46ch] font-serif text-xl leading-relaxed text-aegean-ink sm:mx-0">
              I&rsquo;ve been matching travelers with the right ships since
              2011 &mdash; and my name is on every quote that leaves this desk.
            </p>
          </div>
        </div>
      </section>

      {/* The long note */}
      <section className="bg-linen px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[62ch]">
          <SectionHeading kicker="The Long Version" align="left" />
          <div className="mt-8 space-y-6 font-serif text-lg leading-relaxed">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:font-medium first-letter:leading-[0.8] first-letter:text-deep-harbor">
              What began as years of sailings, ship visits, and kept notes is
              now a Virtuoso practice, in partnership with Luxury Cruise
              Connections. The tools changed; the habit didn&rsquo;t. I still
              keep notes on nearly every ship afloat &mdash; which suites are
              worth the money and which are just bigger, which dining rooms
              deliver and which coast, where the smooth crossings are and where
              the coastline saves the week.
            </p>
            <p>
              Most of what I do isn&rsquo;t booking travel &mdash; it&rsquo;s
              editing it. Any search engine can surface a hundred sailings; the
              work is knowing which three deserve your attention, and why. That
              judgement only comes from having been aboard, or from having sent
              enough people that the pattern is clear.
            </p>
            <p>
              When we plan together, you&rsquo;ll get honest counsel on ships,
              seasons, and itineraries &mdash; including which celebrated ones
              to skip, and when a smaller ship or a shoulder-season date buys
              you more than any upgrade. And because every fare I quote is one
              I&rsquo;ve negotiated, my clients never pay retail. My advice is
              candid, my services are complimentary, and every recommendation
              is one I&rsquo;d be glad to defend over dinner.
            </p>
            <p>
              I work quietly and I work for you &mdash; not for a line, not for
              a quota. If the right answer is a different ship than the one you
              came in asking about, I&rsquo;ll say so. If the right answer is to
              wait a season, I&rsquo;ll say that too.
            </p>
          </div>
          <p className="mt-8 text-right font-script text-4xl text-aegean-ink">
            Jordan
          </p>
        </div>
      </section>

      {/* Facts strip */}
      <section className="px-6 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Rule variant="double" />
          <dl className="grid gap-8 py-10 text-center sm:grid-cols-3">
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt className="text-kicker uppercase text-aegean-ink">
                  {f.label}
                </dt>
                <dd className="mt-2 font-serif text-3xl tracking-tight text-deep-harbor">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
          <Rule variant="double" />
        </div>
      </section>

      {/* How we'll work together */}
      <section className="bg-linen px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            kicker="How We'll Work Together"
            title="Simple, and entirely at your pace"
          />
          <ol className="mt-12 grid gap-px overflow-hidden border border-salt-air bg-salt-air sm:grid-cols-2">
            {STEPS.map((s) => (
              <li key={s.n} className="bg-vintage-passport p-8">
                <p className="font-serif text-3xl text-compass-gold oldstyle-nums">
                  {s.n}
                </p>
                <h3 className="mt-3 font-serif text-xl tracking-tight text-deep-harbor">
                  {s.title}
                </h3>
                <p className="mt-2 font-serif leading-relaxed text-aegean-ink">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Close */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto flex max-w-[52ch] flex-col items-center text-center">
          <SectionHeading kicker="Begin the Conversation" title="Shall we plan something?" />
          <p className="mt-6 font-serif text-lg leading-relaxed text-aegean-ink">
            Tell me where you&rsquo;re thinking of going &mdash; or where
            you&rsquo;ve always meant to &mdash; and I&rsquo;ll reply
            personally.
          </p>
          <Button href="/#request-a-quote" className="mt-8">
            Request a Quote
          </Button>
          <p className="mt-6 font-serif text-base italic text-aegean-ink">
            Or read a little further in the{" "}
            <TextLink href="/field-notes">Field Notes</TextLink>.
          </p>
        </div>
      </section>
    </>
  );
}
