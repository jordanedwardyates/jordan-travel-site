/**
 * Unit tests for the interest taxonomy.
 *
 * This is the normalization layer that decides what a visitor's browsing
 * actually means, so its buckets are worth pinning down: a wrong bucket here
 * is a wrong claim in a HubSpot note.
 *
 * Run with `npm test`. No test framework — Node's built-in runner, with
 * native TypeScript type stripping (Node 22.18+), which is why the import
 * below carries an explicit `.ts` extension.
 *
 * These assertions describe the implementation as it stands today, including
 * a few edge cases where current behaviour is arguably wrong. Those are
 * marked KNOWN QUIRK rather than silently "corrected" — the test file is a
 * record of behaviour, not a wish list.
 */

import { describe, it } from "node:test";
import assert from "node:assert";

import {
  classifyRegion,
  classifySeason,
  monthLabel,
  classifyPriceBand,
  summarizeInterest,
  describeInterest,
  type InterestProfile,
} from "./taxonomy.ts";

describe("classifyRegion", () => {
  it("files Mediterranean waters under Mediterranean", () => {
    assert.strictEqual(classifyRegion("The Adriatic"), "Mediterranean");
    assert.strictEqual(classifyRegion("Greece & Turkey"), "Mediterranean");
    assert.strictEqual(classifyRegion("Dubrovnik"), "Mediterranean");
    assert.strictEqual(classifyRegion("Croatia"), "Mediterranean");
  });

  it("files northern waters under Northern Europe & Fjords", () => {
    assert.strictEqual(
      classifyRegion("The Norwegian Fjords"),
      "Northern Europe & Fjords"
    );
    assert.strictEqual(classifyRegion("Baltic"), "Northern Europe & Fjords");
  });

  it("files inland waterways under European Rivers", () => {
    assert.strictEqual(classifyRegion("The Danube"), "European Rivers");
    assert.strictEqual(classifyRegion("Rhine"), "European Rivers");
  });

  it("falls back to Other / Worldwide when nothing matches", () => {
    assert.strictEqual(classifyRegion("Antarctica"), "Other / Worldwide");
    assert.strictEqual(classifyRegion(""), "Other / Worldwide");
    assert.strictEqual(classifyRegion(null), "Other / Worldwide");
    assert.strictEqual(classifyRegion(undefined), "Other / Worldwide");
  });

  it("matches regardless of case", () => {
    assert.strictEqual(classifyRegion("CROATIA"), "Mediterranean");
    assert.strictEqual(classifyRegion("NORWEGIAN FJORDS"), "Northern Europe & Fjords");
  });

  it("reads the extraContext argument, not just the region text", () => {
    // The region text alone is unclassifiable...
    assert.strictEqual(classifyRegion("Coastal Voyage"), "Other / Worldwide");
    // ...so a Mediterranean answer here can only have come from the ports.
    assert.strictEqual(
      classifyRegion("Coastal Voyage", "Kotor · Dubrovnik · Split"),
      "Mediterranean"
    );
  });

  it("lets the first matching bucket win, rivers before seas", () => {
    // Buckets are tested in declaration order (rivers, north, med) and the
    // first hit wins, so mixed text resolves to whichever bucket is checked
    // first rather than to the strongest signal.
    assert.strictEqual(
      classifyRegion("Rhine & Danube, calling at Venice"),
      "European Rivers"
    );
  });

  // KNOWN QUIRK: the European Rivers bucket includes the keyword "main "
  // (the German river Main, with a trailing space). Because rivers are
  // tested first, any text containing the ordinary English word "main"
  // followed by a space is filed as a river cruise — even when the rest of
  // the string is plainly Mediterranean.
  it("misfiles text containing the word 'main ' as European Rivers", () => {
    assert.strictEqual(classifyRegion("Spain, main ports"), "European Rivers");
  });
});

describe("classifySeason", () => {
  it("reads the first month token in a free-text date range", () => {
    assert.strictEqual(classifySeason("3–10 Oct 2026"), "Autumn");
    assert.strictEqual(classifySeason("14–21 Jan 2027"), "Winter");
    assert.strictEqual(classifySeason("2–9 Apr 2026"), "Spring");
    assert.strictEqual(classifySeason("6–13 Jul 2026"), "Summer");
  });

  it("uses the first month when a range straddles two", () => {
    assert.strictEqual(classifySeason("1 Jun–5 Jul 2026"), "Summer");
    assert.strictEqual(classifySeason("28 Nov–4 Dec 2026"), "Autumn");
  });

  it("matches month prefixes, so both 'Sep' and 'Sept' read", () => {
    assert.strictEqual(classifySeason("Sept 2026"), "Autumn");
    assert.strictEqual(classifySeason("September 2026"), "Autumn");
  });

  it("returns null when no month can be read", () => {
    assert.strictEqual(classifySeason("Dates TBA"), null);
    assert.strictEqual(classifySeason(""), null);
    assert.strictEqual(classifySeason(null), null);
    assert.strictEqual(classifySeason(undefined), null);
  });

  // KNOWN QUIRK: month matching is prefix-based, anchored only at the left
  // word boundary, so any word beginning "may" reads as the month of May.
  it("treats a word beginning 'may' as the month of May", () => {
    assert.strictEqual(classifySeason("Maybe later"), "Spring");
  });
});

describe("monthLabel", () => {
  it("expands the first month token to a full month name", () => {
    assert.strictEqual(monthLabel("3–10 Oct 2026"), "October");
    assert.strictEqual(monthLabel("1 Jun–5 Jul 2026"), "June");
  });

  it("returns null when no month can be read", () => {
    assert.strictEqual(monthLabel("Dates TBA"), null);
    assert.strictEqual(monthLabel(null), null);
  });
});

describe("classifyPriceBand", () => {
  it("bands a typical price label", () => {
    assert.strictEqual(classifyPriceBand("$9,800"), "$5k–$10k");
    assert.strictEqual(classifyPriceBand("from $2,400 pp"), "Under $5k");
  });

  it("places each band boundary on the upper band", () => {
    assert.strictEqual(classifyPriceBand("$4,999"), "Under $5k");
    assert.strictEqual(classifyPriceBand("$5,000"), "$5k–$10k");
    assert.strictEqual(classifyPriceBand("$9,999"), "$5k–$10k");
    assert.strictEqual(classifyPriceBand("$10,000"), "$10k–$20k");
    assert.strictEqual(classifyPriceBand("$19,999"), "$10k–$20k");
    assert.strictEqual(classifyPriceBand("$20,000"), "$20k+");
    assert.strictEqual(classifyPriceBand("$85,000"), "$20k+");
  });

  it("returns null when no usable number can be read", () => {
    assert.strictEqual(classifyPriceBand("TBA"), null);
    assert.strictEqual(classifyPriceBand("On request"), null);
    assert.strictEqual(classifyPriceBand(""), null);
    assert.strictEqual(classifyPriceBand(null), null);
    assert.strictEqual(classifyPriceBand(undefined), null);
    assert.strictEqual(classifyPriceBand("$0"), null);
  });

  // KNOWN QUIRK: the docstring says the function "reads the first run of
  // digits", but the implementation strips every non-digit character and
  // concatenates whatever is left. Any second number in the label — the far
  // end of a price range, or a sailing year — is glued onto the first, and
  // the result lands in the top band.
  it("concatenates every digit in the label rather than the first run", () => {
    // "$12,500–$18,000" is read as 1_250_018_000.
    assert.strictEqual(classifyPriceBand("$12,500–$18,000"), "$20k+");
    // "$9,800 pp (2026)" is read as 98_002_026.
    assert.strictEqual(classifyPriceBand("$9,800 pp (2026)"), "$20k+");
  });
});

describe("summarizeInterest", () => {
  it("frequency-ranks a viewing history", () => {
    const profile = summarizeInterest([
      { region: "Mediterranean", season: "Autumn", priceBand: "$5k–$10k" },
      { region: "Mediterranean", season: "Autumn", priceBand: "$5k–$10k" },
      { region: "Mediterranean", season: "Spring", priceBand: "$10k–$20k" },
      { region: "Northern Europe & Fjords", season: "Summer", priceBand: "$5k–$10k" },
    ]);

    assert.strictEqual(profile.topRegion, "Mediterranean");
    assert.strictEqual(profile.topSeason, "Autumn");
    assert.strictEqual(profile.topPriceBand, "$5k–$10k");
    assert.deepStrictEqual(profile.regions, [
      "Mediterranean",
      "Northern Europe & Fjords",
    ]);
    assert.deepStrictEqual(profile.seasons, ["Autumn", "Spring", "Summer"]);
    assert.deepStrictEqual(profile.priceBands, ["$5k–$10k", "$10k–$20k"]);
    assert.strictEqual(profile.signalCount, 4);
  });

  it("breaks ties by first appearance", () => {
    const profile = summarizeInterest([
      { region: "European Rivers" },
      { region: "Mediterranean" },
    ]);
    assert.strictEqual(profile.topRegion, "European Rivers");
    assert.deepStrictEqual(profile.regions, ["European Rivers", "Mediterranean"]);
  });

  it("ranks each facet independently, skipping nulls", () => {
    const profile = summarizeInterest([
      { region: "Mediterranean", season: null, priceBand: null },
      { region: null, season: "Winter", priceBand: null },
      { region: null, season: "Winter", priceBand: "$20k+" },
    ]);
    assert.strictEqual(profile.topRegion, "Mediterranean");
    assert.strictEqual(profile.topSeason, "Winter");
    assert.strictEqual(profile.topPriceBand, "$20k+");
    assert.deepStrictEqual(profile.regions, ["Mediterranean"]);
    assert.strictEqual(profile.signalCount, 3);
  });

  it("counts only signals carrying at least one classifiable facet", () => {
    const profile = summarizeInterest([
      { region: "Mediterranean" },
      {},
      { region: null, season: null, priceBand: null },
    ]);
    assert.strictEqual(profile.signalCount, 1);
  });

  it("returns an empty profile for empty input without throwing", () => {
    assert.deepStrictEqual(summarizeInterest([]), {
      topRegion: null,
      topSeason: null,
      topPriceBand: null,
      regions: [],
      seasons: [],
      priceBands: [],
      signalCount: 0,
    });
  });
});

describe("describeInterest", () => {
  it("renders the full one-line summary", () => {
    const profile = summarizeInterest([
      { region: "Mediterranean", season: "Autumn", priceBand: "$5k–$10k" },
      { region: "Mediterranean", season: "Autumn", priceBand: "$5k–$10k" },
      { region: "Mediterranean", season: "Autumn", priceBand: "$5k–$10k" },
      { region: "Mediterranean", season: "Autumn", priceBand: "$5k–$10k" },
    ]);
    assert.strictEqual(
      describeInterest(profile),
      "Mediterranean · Autumn · $5k–$10k (from 4 sailings viewed)"
    );
  });

  it("singularises a one-sailing profile", () => {
    const profile = summarizeInterest([
      { region: "European Rivers", season: "Spring", priceBand: "Under $5k" },
    ]);
    assert.strictEqual(
      describeInterest(profile),
      "European Rivers · Spring · Under $5k (from 1 sailing viewed)"
    );
  });

  it("omits facets it does not have", () => {
    const profile = summarizeInterest([
      { region: "Northern Europe & Fjords" },
      { region: "Northern Europe & Fjords", priceBand: "$20k+" },
    ]);
    assert.strictEqual(
      describeInterest(profile),
      "Northern Europe & Fjords · $20k+ (from 2 sailings viewed)"
    );
  });

  it("returns null when there is nothing to describe", () => {
    assert.strictEqual(describeInterest(summarizeInterest([])), null);
  });

  it("drops the tail when a profile has facets but no counted signals", () => {
    const profile: InterestProfile = {
      topRegion: "Mediterranean",
      topSeason: null,
      topPriceBand: null,
      regions: ["Mediterranean"],
      seasons: [],
      priceBands: [],
      signalCount: 0,
    };
    assert.strictEqual(describeInterest(profile), "Mediterranean");
  });
});
