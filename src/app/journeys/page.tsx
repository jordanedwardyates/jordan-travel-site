import type { Metadata } from "next";

import JourneyCard from "@/components/JourneyCard";
import SectionHeading from "@/components/SectionHeading";
import TextLink from "@/components/TextLink";
import { getPublishedJourneys } from "@/lib/journeys";

export const revalidate = 300;

const JOURNEYS_DESCRIPTION =
  "Every sailing currently quoted — dates, negotiated fares, and Jordan's honest read on each.";

export const metadata: Metadata = {
  title: "Journeys",
  description: JOURNEYS_DESCRIPTION,
  alternates: { canonical: "/journeys" },
  openGraph: {
    type: "website",
    siteName: "BON V: A Travel Company",
    locale: "en_US",
    title: "Journeys — recently quoted sailings",
    description: JOURNEYS_DESCRIPTION,
    url: "/journeys",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journeys — recently quoted sailings",
    description: JOURNEYS_DESCRIPTION,
  },
};

export default async function JourneysPage() {
  const journeys = await getPublishedJourneys(50);

  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          kicker="Journeys"
          title="Every sailing currently quoted"
        />
        <p className="mx-auto mt-6 max-w-[52ch] text-center font-serif text-lg leading-relaxed text-aegean-ink">
          The full ledger &mdash; dates, negotiated fares, and my honest read
          on each.
        </p>

        {journeys.length > 0 ? (
          <>
            <div className="mt-10 space-y-8">
              {journeys.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
            </div>
            <p className="mt-6 text-center text-xs leading-relaxed text-aegean-ink">
              Pricing and availability are subject to change.
            </p>
          </>
        ) : (
          <div className="mx-auto mt-10 max-w-[44rem] border border-salt-air bg-linen p-1 text-center">
            <div className="border border-salt-air/60 px-6 py-10">
              <p className="font-serif text-xl leading-relaxed">
                A fresh set of quotes is being prepared.
              </p>
              <p className="mx-auto mt-3 max-w-[44ch] font-serif text-base leading-relaxed text-aegean-ink">
                Write to me in the meantime and I&rsquo;ll send you the
                sailings currently worth your attention.
              </p>
              <TextLink href="/quote" className="mt-5 inline-block text-sm">
                Request a quote &rarr;
              </TextLink>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
