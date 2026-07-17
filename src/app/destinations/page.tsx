import type { Metadata } from "next";
import Link from "next/link";

import PassportStamp from "@/components/PassportStamp";
import SectionHeading from "@/components/SectionHeading";
import { getDestinations } from "@/lib/destinations";

const DESCRIPTION =
  "Destination guides — an advisor's honest counsel on the regions worth sailing: when to go, the ports worth the time, and the ships that do them right.";

export const metadata: Metadata = {
  title: "Destinations",
  description: DESCRIPTION,
  alternates: { canonical: "/destinations" },
  openGraph: {
    type: "website",
    url: "/destinations",
    title: "Destinations — BON V: A Travel Company",
    description: DESCRIPTION,
  },
};

export default function DestinationsPage() {
  const destinations = getDestinations();

  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="relative">
          <PassportStamp
            text="· DESTINATIONS · JORDAN YATES ·"
            className="absolute -top-6 right-0 hidden h-20 w-20 rotate-12 text-sun-faded opacity-25 lg:block"
          />
          <SectionHeading
            kicker="Destinations"
            title="The regions worth the trouble"
          />
        </div>
        <p className="mx-auto mt-6 max-w-[54ch] text-center font-serif text-lg leading-relaxed text-aegean-ink">
          A curated few, with honest counsel on each &mdash; when to sail, the
          ports worth your time, and the ships that do the region right.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {destinations.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group block border border-salt-air bg-linen p-1 transition-colors hover:border-compass-gold/50"
            >
              <div className="flex h-full flex-col border border-salt-air/60 px-6 py-7">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-kicker uppercase text-compass-gold">
                    Guide
                  </p>
                  <p className="text-[0.6rem] uppercase tracking-[0.2em] text-sea-glass oldstyle-nums">
                    {d.coordinates}
                  </p>
                </div>
                <h3 className="mt-3 font-serif text-3xl tracking-tight text-deep-harbor transition-colors group-hover:text-aegean-ink">
                  {d.name}
                </h3>
                <p className="mt-2 font-serif text-lg italic leading-relaxed text-aegean-ink">
                  {d.dek}
                </p>
                <span className="mt-4 inline-block text-sm text-deep-harbor underline decoration-compass-gold/70 underline-offset-4 group-hover:decoration-compass-gold">
                  Read the guide &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
