import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { getJourneyBySlug, getPublishedJourneys } from "@/lib/journeys";

export const alt = "A quoted sailing — BON V: A Travel Company";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const journeys = await getPublishedJourneys(50);
  return journeys.filter((j) => j.slug).map((j) => ({ slug: j.slug as string }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const journey = await getJourneyBySlug(slug);
  return ogCard({
    kicker: journey ? `Recently Quoted · ${journey.region}` : "Journeys",
    title: journey?.routeTitle ?? "Journeys",
    subtitle: journey
      ? `${journey.ship}, ${journey.cruiseLine} · ${journey.nights} nights · ${journey.dates}`
      : undefined,
  });
}
