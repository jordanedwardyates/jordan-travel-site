/**
 * Interest taxonomy — the normalization layer.
 *
 * Raw site data is specific and messy: a journey's `region` is free text
 * ("The Adriatic", "Greece & Turkey", "The Danube"), its `dates` are a
 * human string ("3–10 Oct 2026"), its price a label ("$9,800"). None of
 * that is useful as a behavioural signal on its own — we don't want to tell
 * HubSpot "looked at a Croatian cruise," we want "interested in the
 * Mediterranean, in autumn, in the $5–10k band."
 *
 * These pure functions do that rollup. No I/O, no deps — safe to unit-test
 * and to run either server-side (in /api/track) or against stored rows.
 */

export type MacroRegion =
  | "Mediterranean"
  | "Northern Europe & Fjords"
  | "European Rivers"
  | "Other / Worldwide";

export type Season = "Winter" | "Spring" | "Summer" | "Autumn";

export type PriceBand = "Under $5k" | "$5k–$10k" | "$10k–$20k" | "$20k+";

// Keyword → macro region. Order matters only in that the first bucket with a
// hit wins; buckets are mutually exclusive in practice for this catalogue.
// Lowercased substring match against the raw region text (and, optionally,
// route/port text passed in).
const REGION_KEYWORDS: Array<[MacroRegion, string[]]> = [
  [
    "European Rivers",
    [
      "danube",
      "rhine",
      "rhône",
      "rhone",
      "douro",
      "seine",
      "moselle",
      "main ",
      "budapest",
      "vilshofen",
      "river",
      "rivers",
    ],
  ],
  [
    "Northern Europe & Fjords",
    [
      "fjord",
      "norway",
      "norwegian",
      "geiranger",
      "flåm",
      "flam",
      "bergen",
      "ålesund",
      "alesund",
      "iceland",
      "baltic",
      "scandinav",
      "stockholm",
      "copenhagen",
      "helsinki",
      "british isles",
      "scotland",
      "north cape",
      "lofoten",
    ],
  ],
  [
    "Mediterranean",
    [
      "mediterran",
      "adriatic",
      "aegean",
      "greek",
      "greece",
      "turkey",
      "turkish",
      "croatia",
      "croatian",
      "dalmatian",
      "dubrovnik",
      "kotor",
      "korčula",
      "korcula",
      "split",
      "montenegro",
      "italy",
      "italian",
      "amalfi",
      "sicily",
      "sardinia",
      "spain",
      "spanish",
      "barcelona",
      "riviera",
      "provence",
      "malta",
      "cyprus",
      "santorini",
      "mykonos",
      "naxos",
      "rhodes",
      "symi",
      "athens",
      "rome",
      "venice",
      "trieste",
      "náfplio",
      "nafplio",
      "istanbul",
    ],
  ],
];

/**
 * File a raw region string (optionally enriched with route/port text) under
 * a macro region. This is the "Croatian cruise → Mediterranean" rule.
 */
export function classifyRegion(
  regionText: string | null | undefined,
  extraContext = ""
): MacroRegion {
  const hay = `${regionText ?? ""} ${extraContext}`.toLowerCase();
  for (const [macro, keywords] of REGION_KEYWORDS) {
    if (keywords.some((k) => hay.includes(k))) return macro;
  }
  return "Other / Worldwide";
}

const MONTHS: Array<[Season, string[]]> = [
  ["Winter", ["dec", "jan", "feb"]],
  ["Spring", ["mar", "apr", "may"]],
  ["Summer", ["jun", "jul", "aug"]],
  ["Autumn", ["sep", "oct", "nov"]],
];

/** First month token found in a free-text date string, lowercased 3-letter. */
function firstMonthToken(datesText: string): string | null {
  const m = datesText.toLowerCase().match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/
  );
  return m ? m[1] : null;
}

/**
 * Season from a free-text date string ("3–10 Oct 2026" → "Autumn").
 * Northern-hemisphere seasons, which fit this entire catalogue. Returns null
 * when no month can be read.
 */
export function classifySeason(
  datesText: string | null | undefined
): Season | null {
  if (!datesText) return null;
  const token = firstMonthToken(datesText);
  if (!token) return null;
  for (const [season, months] of MONTHS) {
    if (months.includes(token)) return season;
  }
  return null;
}

/** Human month label from a date string ("3–10 Oct 2026" → "October"). */
const MONTH_LABELS: Record<string, string> = {
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  oct: "October",
  nov: "November",
  dec: "December",
};

export function monthLabel(
  datesText: string | null | undefined
): string | null {
  if (!datesText) return null;
  const token = firstMonthToken(datesText);
  return token ? MONTH_LABELS[token] : null;
}

/**
 * Price band from a price label. Reads the first run of digits, tolerating
 * "$", commas, "pp", "From", etc. "$9,800" → "$5k–$10k". Returns null when
 * no number can be read.
 */
export function classifyPriceBand(
  priceText: string | null | undefined
): PriceBand | null {
  if (!priceText) return null;
  const digits = priceText.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value < 5000) return "Under $5k";
  if (value < 10000) return "$5k–$10k";
  if (value < 20000) return "$10k–$20k";
  return "$20k+";
}

// ------------------------------------------------------------------
// Rollup — turn a list of viewed-journey signals into one interest profile.
// ------------------------------------------------------------------

export type InterestSignal = {
  region?: MacroRegion | null;
  season?: Season | null;
  priceBand?: PriceBand | null;
};

export type InterestProfile = {
  /** Most-viewed macro region, or null if nothing classifiable was seen. */
  topRegion: MacroRegion | null;
  topSeason: Season | null;
  topPriceBand: PriceBand | null;
  /** All regions seen, most-frequent first — for a fuller picture. */
  regions: MacroRegion[];
  seasons: Season[];
  priceBands: PriceBand[];
  /** Number of classifiable signals that fed this profile. */
  signalCount: number;
};

function rank<T extends string>(values: Array<T | null | undefined>): T[] {
  const counts = new Map<T, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([v]) => v);
}

/**
 * Collapse many per-view signals into a single "here's what they're after"
 * profile — the thing that goes to HubSpot as context. Frequency-ranked, so
 * three Adriatic views and one fjord view reads as Mediterranean-leaning.
 */
export function summarizeInterest(signals: InterestSignal[]): InterestProfile {
  const regions = rank(signals.map((s) => s.region));
  const seasons = rank(signals.map((s) => s.season));
  const priceBands = rank(signals.map((s) => s.priceBand));
  const signalCount = signals.filter(
    (s) => s.region || s.season || s.priceBand
  ).length;
  return {
    topRegion: regions[0] ?? null,
    topSeason: seasons[0] ?? null,
    topPriceBand: priceBands[0] ?? null,
    regions,
    seasons,
    priceBands,
    signalCount,
  };
}

/**
 * One-line human summary of a profile, e.g.
 * "Mediterranean · Autumn · $5k–$10k (from 4 sailings viewed)".
 * Used in the HubSpot note and internal notify email.
 */
export function describeInterest(profile: InterestProfile): string | null {
  const parts = [
    profile.topRegion,
    profile.topSeason,
    profile.topPriceBand,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  const tail =
    profile.signalCount > 0
      ? ` (from ${profile.signalCount} ${
          profile.signalCount === 1 ? "sailing" : "sailings"
        } viewed)`
      : "";
  return `${parts.join(" · ")}${tail}`;
}
