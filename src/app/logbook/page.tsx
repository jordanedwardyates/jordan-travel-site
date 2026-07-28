import type { Metadata } from "next";
import Link from "next/link";

import SectionHeading from "@/components/SectionHeading";
import { LOGBOOK_ENTRIES } from "@/lib/logbook";

export const metadata: Metadata = {
  title: "The Logbook",
  description:
    "Field notes and essays on the world's most considered voyages — written by Jordan Yates, luxury voyage advisor.",
  alternates: { canonical: "/logbook" },
};

export default function LogbookPage() {
  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <SectionHeading kicker="The Logbook" title="Field notes from the water" />
        <p className="mx-auto mt-6 max-w-[52ch] text-center font-serif text-lg leading-relaxed text-aegean-ink">
          Essays and guides on where to sail and when &mdash; the reading I&rsquo;d
          hand a client before we ever talk fares.
        </p>

        <div className="mt-12 divide-y divide-salt-air/60 border-y border-salt-air/60">
          {LOGBOOK_ENTRIES.map((entry) => (
            <article key={entry.slug} className="py-8">
              <Link href={`/logbook/${entry.slug}`} className="group block">
                <p className="text-kicker font-medium uppercase text-compass-gold">
                  {entry.region} &middot; {entry.date}
                </p>
                <h3 className="mt-3 font-serif text-2xl tracking-tight text-deep-harbor group-hover:underline group-hover:decoration-compass-gold/60 group-hover:underline-offset-4">
                  {entry.title}
                </h3>
                <p className="mt-3 max-w-[62ch] font-serif text-base leading-relaxed text-aegean-ink">
                  {entry.dek}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.15em] text-aegean-ink">
                  {entry.readingMinutes} min read
                </p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
