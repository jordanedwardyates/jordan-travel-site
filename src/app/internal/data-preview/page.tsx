import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listVoyagesWithOffers } from "@/lib/data/voyages";
import { searchVoyageOffers, type VoyageOfferResult } from "@/lib/data/search";

/**
 * INTERNAL data preview — proves the normalized model (one voyage, many
 * cabins, many prices) without touching the live homepage. Token-gated
 * outside development; noindexed; reads via the service-role client so
 * needs_review rows are visible.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal — Data Preview",
  robots: { index: false, follow: false },
};

const money = (n: number | null) =>
  n === null ? "—" : `$${n.toLocaleString("en-US")}`;

function ResultLine({ r }: { r: VoyageOfferResult }) {
  return (
    <li className="oldstyle-nums">
      {r.ship} &middot; {r.categoryCode ?? r.categoryName} (
      {r.accommodationClass}) &middot; My {money(r.myPrice)} {r.priceBasis}{" "}
      &middot; {r.availabilityStatus}
    </li>
  );
}

export default async function DataPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const authorized =
    process.env.NODE_ENV === "development" || (!!token && key === token);
  if (!authorized) notFound();

  const [voyages, t1, t2, t3, all] = await Promise.all([
    listVoyagesWithOffers(),
    searchVoyageOffers({
      tags: ["mediterranean"],
      balconyMode: "true_step_out",
      maxMyPrice: 6000,
      limit: 2,
    }),
    searchVoyageOffers({
      tags: ["mediterranean"],
      balconyMode: "true_step_out",
      maxMyPrice: 6000,
      onePerVoyage: true,
      limit: 2,
    }),
    searchVoyageOffers({
      tags: ["mediterranean"],
      balconyMode: "any_style",
      maxMyPrice: 6000,
      limit: 10,
    }),
    searchVoyageOffers({ limit: 100 }),
  ]);

  const checks = [
    {
      name: "Mediterranean · true step-out balcony · My Price < $6,000 · limit 2",
      expected: 2,
      results: t1,
      extra: t1.every((r) => r.myPrice !== null && r.myPrice < 6000),
    },
    {
      name: "Same query, one offer per voyage (two distinct cruises)",
      expected: 2,
      results: t2,
      extra: new Set(t2.map((r) => r.voyageId)).size === t2.length,
    },
    {
      name: "Any balcony style (French Veranda now qualifies)",
      expected: 4,
      results: t3,
      extra: t3.some((r) => r.accommodationClass === "french_balcony"),
    },
    {
      name: "All trusted offers (legacy $2,749 needs_review offer excluded)",
      expected: 5,
      results: all,
      extra: !all.some((r) => r.myPrice === 2749),
    },
  ];

  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <p className="text-kicker uppercase text-compass-gold">
          Internal &middot; not public
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">
          Normalized data preview
        </h1>
        <p className="mt-2 font-serif text-aegean-ink">
          voyages &rarr; accommodations &rarr; price offers. The live site
          does not read these tables yet.
        </p>

        <h2 className="mt-10 font-serif text-2xl">Voyages</h2>
        {voyages.map((v) => (
          <div key={v.id} className="mt-6 border border-salt-air bg-linen p-4">
            <p className="font-serif text-xl">
              {v.voyageTitle} &mdash; {v.ship}, {v.cruiseLine}
            </p>
            <p className="mt-1 text-sm text-aegean-ink oldstyle-nums">
              {v.embarkPort ?? "?"} &rarr; {v.disembarkPort ?? "?"} &middot;{" "}
              {v.embarkationDate ?? "no date"} &middot; source:{" "}
              {v.sourceStatus} &middot; website: {v.websiteStatus} &middot;
              tags: {v.tags.join(", ") || "none"}
            </p>
            <table className="mt-3 w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-salt-air text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink">
                  <th className="py-1 pr-3">Category</th>
                  <th className="py-1 pr-3">Class</th>
                  <th className="py-1 pr-3">Size</th>
                  <th className="py-1 pr-3">Their</th>
                  <th className="py-1 pr-3">My</th>
                  <th className="py-1 pr-3">Basis</th>
                  <th className="py-1 pr-3">Avail</th>
                  <th className="py-1 pr-3">Trust</th>
                  <th className="py-1">Comparison</th>
                </tr>
              </thead>
              <tbody className="oldstyle-nums">
                {v.accommodations.flatMap((a) =>
                  a.offers.map((o) => (
                    <tr key={o.id} className="border-b border-salt-air/50">
                      <td className="py-1 pr-3">
                        {a.categoryCode ? `${a.categoryCode} · ` : ""}
                        {a.categoryName}
                      </td>
                      <td className="py-1 pr-3">
                        {a.accommodationClass}
                        {a.balconyGroup ? " ✓balc" : ""}
                      </td>
                      <td className="py-1 pr-3">
                        {a.totalSizeSqFt ? `${a.totalSizeSqFt} sq ft` : "—"}
                      </td>
                      <td className="py-1 pr-3">{money(o.theirPrice)}</td>
                      <td className="py-1 pr-3 font-medium">
                        {money(o.myPrice)}
                      </td>
                      <td className="py-1 pr-3">{o.priceBasis}</td>
                      <td className="py-1 pr-3">{o.availabilityStatus}</td>
                      <td className="py-1 pr-3">{o.sourceStatus}</td>
                      <td className="py-1">{o.comparisonStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ))}

        <h2 className="mt-12 font-serif text-2xl">Search contract checks</h2>
        {checks.map((c) => {
          const pass = c.results.length === c.expected && c.extra;
          return (
            <div
              key={c.name}
              className="mt-4 border border-salt-air bg-linen p-4"
            >
              <p className="text-sm">
                <span
                  className={`mr-2 font-medium ${pass ? "text-deep-harbor" : "text-compass-gold"}`}
                >
                  {pass ? "PASS" : "FAIL"}
                </span>
                {c.name} &mdash; expected {c.expected}, got {c.results.length}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-aegean-ink">
                {c.results.map((r) => (
                  <ResultLine key={`${c.name}-${r.accommodationId}-${r.myPrice}`} r={r} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
