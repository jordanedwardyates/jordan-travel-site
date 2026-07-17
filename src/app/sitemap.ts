import type { MetadataRoute } from "next";

import { getPublishedJourneys } from "@/lib/journeys";

const BASE = "https://www.bonvtravelcompany.com";

/**
 * Sitemap for search engines. The homepage and the journeys ledger are
 * fixed entries; every published journey with a slug is appended. The
 * internal data preview is intentionally excluded (see robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const journeys = await getPublishedJourneys(200);

  const journeyEntries: MetadataRoute.Sitemap = journeys
    .filter((j) => j.slug)
    .map((j) => ({
      url: `${BASE}/journeys/${j.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE}/journeys`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...journeyEntries,
  ];
}
