/**
 * The Logbook — the site's editorial section. Long-form essays and field
 * guides in Jordan's advisor voice, written to earn search traffic on the
 * questions a considered traveller actually asks.
 *
 * Metadata lives here (one source of truth for the index, per-entry
 * <head>, JSON-LD, and the sitemap). The prose bodies live alongside the
 * [slug] route, keyed by the same slug.
 */

export type LogbookEntry = {
  slug: string;
  title: string;
  /** The standfirst / dek shown under the title and used as the meta description. */
  dek: string;
  /** Display date, e.g. "July 2026". */
  date: string;
  /** ISO date for structured data. */
  datePublished: string;
  region: string;
  readingMinutes: number;
  keywords: string[];
};

export const LOGBOOK_ENTRIES: LogbookEntry[] = [
  {
    slug: "never-pay-retail",
    title: "Never Pay Retail",
    dek: "A cruise fare is not a fixed price on a shelf. Here's why booking direct costs you the same or more — and how the right advisor gets you the better deal at no cost to you.",
    date: "July 2026",
    datePublished: "2026-07-26",
    region: "What I Do",
    readingMinutes: 5,
    keywords: [
      "how to get the best cruise deal",
      "do travel agents cost more to book a cruise",
      "cruise onboard credit travel agent",
      "never pay retail cruise",
      "why book a cruise through a travel agent",
    ],
  },
  {
    slug: "one-line-or-the-right-line",
    title: "One Line, or the Right Line?",
    dek: "Most people shop a single cruise brand. An unbiased advisor compares comparable ships across lines — and knows, this week, which one is actually worth your money.",
    date: "July 2026",
    datePublished: "2026-07-24",
    region: "What I Do",
    readingMinutes: 6,
    keywords: [
      "how to choose a cruise line",
      "unbiased cruise advice",
      "which luxury cruise line is best",
      "is a cruise travel agent worth it",
      "Silversea vs Seabourn",
    ],
  },
  {
    slug: "when-a-big-ship-is-the-right-call",
    title: "When a Big Ship Is the Right Call",
    dek: "A boutique advisor's honest case for Royal Caribbean and the other large lines — and why the megaship is sometimes exactly right for a multigenerational cruise.",
    date: "July 2026",
    datePublished: "2026-07-20",
    region: "Sailing with Family",
    readingMinutes: 6,
    keywords: [
      "best cruise line for multigenerational family",
      "Royal Caribbean multigenerational cruise",
      "big ship family cruise",
      "cruising with grandparents and grandchildren",
      "multigenerational cruise advice",
    ],
  },
  {
    slug: "when-to-sail-the-greek-islands",
    title: "When to Sail the Greek Islands",
    dek: "A season-by-season guide to the Aegean — the light, the crowds, the meltemi, and the quiet weeks most travellers overlook.",
    date: "July 2026",
    datePublished: "2026-07-20",
    region: "The Aegean",
    readingMinutes: 6,
    keywords: [
      "best time to cruise the Greek islands",
      "when to visit the Greek islands",
      "Aegean cruise season",
      "Greek islands shoulder season",
      "meltemi winds",
    ],
  },
];

export function getLogbookEntry(slug: string): LogbookEntry | undefined {
  return LOGBOOK_ENTRIES.find((e) => e.slug === slug);
}
