import type { CuratedOffer, CuratedVoyage } from "@/lib/data/curation";
import { formatDateRange, formatDay } from "@/lib/data/voyage-format";

/**
 * Voyage dossier — everything already known about a sailing, as markdown,
 * for pasting into a drafting session elsewhere.
 *
 * This is a read-only export path and deliberately has nothing to do with the
 * three publish gates. Those gates answer "may a stranger see this on the
 * website"; a dossier is Jordan handing his own notes to his own drafting
 * agent, so an unapproved fare still belongs in it. `source_status` is the
 * only status that matters here — it answers "is this number real?" — and an
 * unverified figure is labelled loudly rather than dropped, because silently
 * omitting a fare would read as "no fare exists".
 *
 * Pure and browser-safe on purpose: the picker builds the text client-side
 * with no round trip. Import only from voyage-format, never from curation's
 * runtime (it carries the service-role client).
 */

const fmtMoney = (n: number | null, currency = "USD"): string | null => {
  if (n === null || n === undefined) return null;
  const v = Number(n).toLocaleString("en-US");
  return currency === "USD" ? `$${v}` : `${v} ${currency}`;
};

/** "per_person" → "per person"; the DB's enum reads badly raw. */
const humanize = (s: string | null) =>
  (s ?? "").replace(/_/g, " ").trim();

const BASIS_LABEL: Record<string, string> = {
  per_person: "per person",
  total_accommodation: "total for the accommodation",
  unknown: "basis not recorded",
};

function offerBlock(o: CuratedOffer, now: Date): string {
  const lines: string[] = [];

  const label = [
    o.categoryName,
    o.categoryCode ? `(${o.categoryCode})` : null,
    o.sizeDisplay ? `· ${o.sizeDisplay}` : null,
  ]
    .filter(Boolean)
    .join(" ");
  lines.push(`**${label}**`);

  // The price line. A missing negotiated fare is stated outright — an agent
  // reading this must not infer one from the retail number.
  const retail = fmtMoney(o.theirPrice, o.currency);
  const yours = fmtMoney(o.myPrice, o.currency);
  if (yours && retail && o.theirPrice! > o.myPrice!) {
    const saved = o.theirPrice! - o.myPrice!;
    const pct = Math.round((saved / o.theirPrice!) * 100);
    lines.push(
      `- Retail ${retail} → **your fare ${yours}** (saves ${fmtMoney(saved, o.currency)}, ${pct}%)`
    );
  } else if (yours && retail) {
    lines.push(`- Retail ${retail} · your fare ${yours} (no discount recorded)`);
  } else if (yours) {
    lines.push(`- Your fare ${yours} — no retail price on file to compare against`);
  } else if (retail) {
    lines.push(`- Retail ${retail} — **no negotiated fare recorded yet**`);
  } else {
    lines.push(`- No pricing recorded for this category`);
  }

  const basis = BASIS_LABEL[o.priceBasis] ?? humanize(o.priceBasis);
  lines.push(
    `- ${basis}, ${humanize(o.occupancyBasis)} occupancy · ${o.currency}` +
      (o.myPrice !== null ? " · includes taxes & fees" : "")
  );

  lines.push(`- Availability: ${humanize(o.availabilityStatus)}`);
  if (o.agencyBonus) lines.push(`- Agency bonus: ${o.agencyBonus}`);
  if (o.promotionName) lines.push(`- Promotion: ${o.promotionName}`);

  const cabin = [
    o.deckLocation ? `deck/location ${o.deckLocation}` : null,
    o.roomNumber ? `room ${o.roomNumber}` : null,
    o.sleeps ? `sleeps ${o.sleeps}` : null,
  ].filter(Boolean);
  if (cabin.length) lines.push(`- Cabin: ${cabin.join(" · ")}`);

  if (o.accommodationNotes) lines.push(`- Cabin notes: ${o.accommodationNotes}`);
  if (o.publicNotes) lines.push(`- Fare notes (client-safe): ${o.publicNotes}`);

  if (o.quotedAt) lines.push(`- Quoted: ${formatDay(o.quotedAt)}`);

  if (o.offerExpiresAt) {
    const expired = new Date(o.offerExpiresAt) < now;
    lines.push(
      expired
        ? `- ⚠️ EXPIRED ${formatDay(o.offerExpiresAt)} — re-price before using`
        : `- Offer held until ${formatDay(o.offerExpiresAt)}`
    );
  }

  if (o.sourceStatus !== "trusted") {
    lines.push(
      `- ⚠️ This fare is marked "${humanize(o.sourceStatus)}" — unverified, confirm before quoting`
    );
  }

  return lines.join("\n");
}

/** One sailing, as a markdown section. */
export function dossierFor(
  v: CuratedVoyage,
  opts: { includeInternalNotes?: boolean; now?: Date } = {}
): string {
  const { includeInternalNotes = true, now = new Date() } = opts;
  const out: string[] = [];

  out.push(`## ${v.officialVoyageTitle}`);
  out.push("");

  const facts: string[] = [];
  facts.push(`- **Cruise line:** ${v.cruiseLine}`);
  facts.push(`- **Ship:** ${v.ship}`);
  if (v.voyageCode) facts.push(`- **Voyage code:** ${v.voyageCode}`);

  const dates = formatDateRange(v.embarkationDate, v.disembarkationDate);
  facts.push(
    `- **Sails:** ${dates || "dates not recorded"}${v.nights ? ` · ${v.nights} nights` : ""}`
  );
  if (v.embarkPort || v.disembarkPort) {
    facts.push(`- **Route:** ${v.embarkPort ?? "?"} → ${v.disembarkPort ?? "?"}`);
  }
  if (v.regionName) facts.push(`- **Region:** ${v.regionName}`);
  facts.push(
    v.sourceStatus === "trusted"
      ? `- **Data status:** verified`
      : `- **Data status:** ⚠️ ${humanize(v.sourceStatus).toUpperCase()} — this sailing's details are unverified`
  );
  if (v.officialUrl) facts.push(`- **Cruise line page (itinerary & map):** ${v.officialUrl}`);
  if (v.deckPlanUrl) facts.push(`- **Deck plan:** ${v.deckPlanUrl}`);
  if (v.heroImageUrl) {
    facts.push(
      `- **Image on file:** ${v.heroImageUrl}${v.heroImageAlt ? ` — "${v.heroImageAlt}"` : ""}`
    );
  }
  out.push(facts.join("\n"));

  if (v.itinerarySummary) {
    out.push("");
    out.push(`**Itinerary:** ${v.itinerarySummary}`);
  }

  if (v.jordansTake?.trim()) {
    out.push("");
    out.push("**Jordan's take:**");
    out.push(`> ${v.jordansTake.trim().replace(/\n+/g, "\n> ")}`);
  }

  if (includeInternalNotes && v.internalNotes?.trim()) {
    out.push("");
    out.push("**Internal notes — context only, never quote to a client:**");
    out.push(`> ${v.internalNotes.trim().replace(/\n+/g, "\n> ")}`);
  }

  out.push("");
  if (v.offers.length === 0) {
    out.push("### Fares");
    out.push("No fares recorded for this sailing.");
  } else {
    out.push("### Fares");
    out.push("");
    out.push(v.offers.map((o) => offerBlock(o, now)).join("\n\n"));
  }

  if (includeInternalNotes) {
    const notes = v.offers
      .filter((o) => o.internalNotes?.trim())
      .map((o) => `- ${o.categoryName}: ${o.internalNotes!.trim()}`);
    if (notes.length) {
      out.push("");
      out.push("**Fare-level internal notes — context only:**");
      out.push(notes.join("\n"));
    }
  }

  return out.join("\n");
}

/**
 * The full pasteable document. The preamble is aimed at whatever agent
 * receives this: it says plainly that these are recorded figures rather than
 * live ones, which is the single most important thing for it not to get wrong.
 */
export function buildDossier(
  voyages: CuratedVoyage[],
  opts: { includeInternalNotes?: boolean; now?: Date } = {}
): string {
  const { now = new Date() } = opts;
  if (voyages.length === 0) return "";

  const header = [
    `# Voyage dossier — ${voyages.length} sailing${voyages.length === 1 ? "" : "s"}`,
    "",
    `Reference material from Jordan's internal quote log, exported ${formatDay(
      now.toISOString()
    )}.`,
    "",
    "Read this as recorded fact, not live inventory. Every fare is what was",
    "quoted on the date shown and may have moved since. Use only the figures,",
    "dates and links present here — do not fill gaps with estimates, and do not",
    "pass anything flagged unverified or expired to a client without Jordan",
    "confirming it first.",
  ].join("\n");

  return [header, ...voyages.map((v) => dossierFor(v, { ...opts, now }))].join(
    "\n\n---\n\n"
  );
}
