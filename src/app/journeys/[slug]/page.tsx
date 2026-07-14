import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Button from "@/components/Button";
import JourneyCard from "@/components/JourneyCard";
import SectionHeading from "@/components/SectionHeading";
import TextLink from "@/components/TextLink";
import { getJourneyBySlug, getPublishedJourneys } from "@/lib/journeys";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const journeys = await getPublishedJourneys(50);
  return journeys
    .filter((j) => j.slug)
    .map((j) => ({ slug: j.slug as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const journey = await getJourneyBySlug(slug);
  if (!journey) return { title: "Journey not found" };
  return {
    title: `${journey.routeTitle} — BON V: A Travel Company`,
    description: `${journey.voyageTitle} · ${journey.ship}, ${journey.cruiseLine} · ${journey.nights} nights · ${journey.dates}. ${journey.jordansTake}`,
  };
}

export default async function JourneyPage({ params }: Props) {
  const { slug } = await params;
  const journey = await getJourneyBySlug(slug);
  if (!journey) notFound();

  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <TextLink href="/journeys" className="text-sm">
          &larr; All journeys
        </TextLink>
        <SectionHeading
          kicker={`${journey.region} · ${journey.dates}`}
          title={journey.routeTitle}
          align="left"
          className="mt-8"
        />
        <div className="mt-8">
          <JourneyCard journey={journey} />
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <Button href={`/?journey=${journey.id}#request-a-quote`}>
            Request this itinerary
          </Button>
          <p className="font-serif text-base italic text-aegean-ink">
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
      </div>
    </section>
  );
}
