/**
 * Hand-maintained activity log — "the other stuff we worked on," for the
 * marketing desk's Recent work section. Append one entry per major
 * initiative (roughly one per feature commit/merge), not every small
 * tweak — this is the piece most likely to silently go stale.
 */

export type ActivityEntry = {
  date: string;
  title: string;
  detail: string;
  tag: "seo" | "marketing" | "product" | "content" | "infra";
};

export const ACTIVITY_LOG: ActivityEntry[] = [
  {
    date: "2026-07-27",
    title: "Added SEO foundation",
    detail:
      "Sitemap, robots.txt, structured data, and a new Logbook section to build organic search presence.",
    tag: "seo",
  },
  {
    date: "2026-07-27",
    title: "Sent the Sonata inaugural invitation",
    detail:
      "One-off personal invitation email to Robert Glass with a hosted signature asset.",
    tag: "marketing",
  },
  {
    date: "2026-07-24",
    title: "Built the marketing desk",
    detail: "Campaign tracking and per-sailing click attribution — this dashboard.",
    tag: "marketing",
  },
  {
    date: "2026-07-24",
    title: "Archived the Crossings & Mediterranean letter",
    detail:
      "First Dispatch campaign entry, seven sailings, awaiting two retail fares before send.",
    tag: "marketing",
  },
  {
    date: "2026-07-19",
    title: "Added the Dispatch signup popup and subscriber digest",
    detail:
      "Paper-settle entrance popup, internal subscribers view, and a daily digest cron.",
    tag: "marketing",
  },
  {
    date: "2026-07-14",
    title: "Built the quote-intelligence data layer",
    detail: "Normalized quote_packages and quote_requests data with an internal preview.",
    tag: "product",
  },
];
