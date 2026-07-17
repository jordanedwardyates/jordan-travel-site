import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { getDestination, getDestinations } from "@/lib/destinations";

export const alt = "Destination Guide — BON V: A Travel Company";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getDestinations().map((d) => ({ slug: d.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = getDestination(slug);
  return ogCard({
    kicker: dest ? `Destination Guide · ${dest.coordinates}` : "Destinations",
    title: dest?.name ?? "Destinations",
    subtitle: dest?.dek,
  });
}
