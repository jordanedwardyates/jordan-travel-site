import Image from "next/image";

import Button from "@/components/Button";
import EmailSignupForm from "@/components/EmailSignupForm";
import JourneyCard, { type Journey } from "@/components/JourneyCard";
import PassportStamp from "@/components/PassportStamp";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import Rule from "@/components/Rule";
import SectionHeading from "@/components/SectionHeading";
import TextLink from "@/components/TextLink";
import { createPublicClient } from "@/lib/supabase/public";

// Re-render at most every 5 minutes so published journeys stay fresh.
export const revalidate = 300;

async function getJourneys(): Promise<Journey[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("journeys")
      .select(
        "id, region, dates, route_title, voyage_title, cruise_line, ship, nights, embark, disembark, port_count, stateroom, room_size, their_price, your_price, price_note, jordans_take, availability_note"
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      region: row.region,
      dates: row.dates,
      routeTitle: row.route_title,
      voyageTitle: row.voyage_title,
      cruiseLine: row.cruise_line,
      ship: row.ship,
      nights: row.nights,
      embark: row.embark,
      disembark: row.disembark,
      portCount: row.port_count,
      stateroom: row.stateroom,
      roomSize: row.room_size ?? undefined,
      theirPrice: row.their_price,
      yourPrice: row.your_price,
      priceNote: row.price_note ?? undefined,
      jordansTake: row.jordans_take,
      availabilityNote: row.availability_note ?? undefined,
    }));
  } catch (err) {
    console.error("Failed to load journeys:", err);
    return [];
  }
}

export default async function Home() {
  const journeys = await getJourneys();
  const journeyOptions = journeys.map((j) => ({
    id: j.id,
    label: `${j.routeTitle} — ${j.dates}`,
  }));
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

          {/* A higher-res export can replace this file at the same path. */}
          <div className="flex justify-center">
            <Image
              src="/portrait-engraved.png"
              alt="Engraved passport-style portrait of Jordan Yates"
              width={316}
              height={245}
              priority
              className="h-auto w-56 mix-blend-multiply sm:w-72"
            />
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

          {journeys.length > 0 ? (
            <>
              <div className="mt-10 space-y-8">
                {journeys.map((journey) => (
                  <JourneyCard key={journey.id} journey={journey} />
                ))}
              </div>
              <p className="mt-6 text-center text-xs leading-relaxed text-aegean-ink">
                Recently quoted examples. Pricing and availability are subject
                to change.
              </p>
            </>
          ) : (
            <div className="mx-auto mt-10 max-w-[44rem] border border-salt-air bg-linen p-1 text-center">
              <div className="border border-salt-air/60 px-6 py-10">
                <p className="font-serif text-xl leading-relaxed">
                  A fresh set of quotes is being prepared.
                </p>
                <p className="mx-auto mt-3 max-w-[44ch] text-sm leading-relaxed text-aegean-ink">
                  Write to me in the meantime and I&rsquo;ll send you the
                  sailings currently worth your attention.
                </p>
                <TextLink href="#request-a-quote" className="mt-5 inline-block text-sm">
                  Request a quote &rarr;
                </TextLink>
              </div>
            </div>
          )}
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
              Places worth knowing about, seasons worth planning around. No
              noise, and you can leave anytime.
            </p>
            <EmailSignupForm />
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
          <QuoteRequestForm journeys={journeyOptions} />
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
