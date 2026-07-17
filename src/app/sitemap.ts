import type { MetadataRoute } from "next";

import { getDestinations } from "@/lib/destinations";
import { getFieldNotes } from "@/lib/fieldNotes";
import { FIELD_NOTES_ENABLED } from "@/lib/flags";
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

  const destinationEntries: MetadataRoute.Sitemap = getDestinations().map(
    (d) => ({
      url: `${BASE}/destinations/${d.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const fieldNoteEntries: MetadataRoute.Sitemap = FIELD_NOTES_ENABLED
    ? getFieldNotes().map((n) => ({
        url: `${BASE}/field-notes/${n.slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      }))
    : [];

  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/about`, changeFrequency: "yearly", priority: 0.8 },
    {
      url: `${BASE}/destinations`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...destinationEntries,
    {
      url: `${BASE}/journeys`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...journeyEntries,
    ...(FIELD_NOTES_ENABLED
      ? [
          {
            url: `${BASE}/field-notes`,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          },
        ]
      : []),
    ...fieldNoteEntries,
  ];
}
