import type { MetadataRoute } from "next";

import { getPublishedJourneys } from "@/lib/journeys";
import { LOGBOOK_ENTRIES } from "@/lib/logbook";

const BASE_URL = "https://www.bonvtravelcompany.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // Newest Logbook essay stamps the index's lastModified.
  const latestLogbook = LOGBOOK_ENTRIES.reduce(
    (latest, e) => (e.datePublished > latest ? e.datePublished : latest),
    LOGBOOK_ENTRIES[0]?.datePublished ?? "",
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/journeys`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/logbook`,
      lastModified: latestLogbook || now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const logbookRoutes: MetadataRoute.Sitemap = LOGBOOK_ENTRIES.map((e) => ({
    url: `${BASE_URL}/logbook/${e.slug}`,
    lastModified: e.datePublished,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const journeys = await getPublishedJourneys(50);
  const journeyRoutes: MetadataRoute.Sitemap = journeys
    .filter((j) => j.slug)
    .map((j) => ({
      url: `${BASE_URL}/journeys/${j.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...journeyRoutes, ...logbookRoutes];
}
