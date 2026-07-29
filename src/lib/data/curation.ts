import type { Journey } from "@/components/JourneyCard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Curation layer — the bridge between "every quote we captured" and "the
 * few we chose to publish".
 *
 * Capture is deliberately indiscriminate: every quote Jordan sends lands in
 * quote_packages / voyages / price_offers. Publishing is deliberately
 * manual, and gated three ways in the database itself:
 *
 *   voyages.website_status      — is this sailing allowed on the site at all
 *   price_offers.website_approved — is this particular fare safe to show
 *   homepage_features.active    — is it on the front page right now
 *
 * Those gates live in RLS policies, so the anon client physically cannot
 * read an unapproved sailing or fare. The internal desk reads through the
 * service-role client to see everything; the public site reads through the
 * anon client and gets only what was approved. Never swap those.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const MONTH = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-10-03" + "2026-10-10" → "3–10 Oct 2026"; cross-month keeps both. */
export function formatDateRange(
  start: string | null,
  end: string | null
): string {
  if (!start) return "";
  const s = new Date(`${start}T00:00:00`);
  if (!end) return `${s.getDate()} ${MONTH[s.getMonth()]} ${s.getFullYear()}`;
  const e = new Date(`${end}T00:00:00`);
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()}–${e.getDate()} ${MONTH[s.getMonth()]} ${s.getFullYear()}`;
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  const left = `${s.getDate()} ${MONTH[s.getMonth()]}${sameYear ? "" : ` ${s.getFullYear()}`}`;
  return `${left}–${e.getDate()} ${MONTH[e.getMonth()]} ${e.getFullYear()}`;
}

/** 2749 → "$2,749". Nulls render as an em dash upstream, never "$0". */
const money = (n: number | null) =>
  n === null || n === undefined ? null : `$${Number(n).toLocaleString("en-US")}`;

/** "Trieste, Italy" → "Trieste" — route titles read better without the country. */
const shortPort = (p: string | null) => (p ?? "").split(",")[0].trim();

/**
 * "Rome (Civitavecchia), Naples, Messina." → 10. Best-effort only: the
 * summary is free text, so an unparseable one yields null and the card
 * simply omits its route strip rather than inventing a number.
 */
export function derivePortCount(summary: string | null): number | null {
  if (!summary) return null;
  const stops = summary
    .replace(/\.\s*$/, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return stops.length >= 2 && stops.length <= 60 ? stops.length : null;
}

/** Strip the trailing "(Rome to Barcelona)" — routeTitle already says it. */
const cleanTitle = (t: string) => t.replace(/\s*\([^)]*\bto\b[^)]*\)\s*$/i, "").trim();

export type CuratedOffer = {
  id: string;
  categoryName: string;
  categoryCode: string | null;
  sizeDisplay: string | null;
  accommodationType: string;
  theirPrice: number | null;
  myPrice: number | null;
  availabilityStatus: string;
  comparisonStatus: string | null;
  agencyBonus: string | null;
  promotionName: string | null;
  websiteApproved: boolean;
  sourceStatus: string;
  offerExpiresAt: string | null;
};

export type CuratedVoyage = {
  id: string;
  cruiseLine: string;
  ship: string;
  voyageCode: string | null;
  officialVoyageTitle: string;
  embarkationDate: string | null;
  disembarkationDate: string | null;
  nights: number | null;
  embarkPort: string | null;
  disembarkPort: string | null;
  itinerarySummary: string | null;
  jordansTake: string | null;
  regionName: string | null;
  sourceStatus: string;
  websiteStatus: string;
  quotedAt: string | null;
  offers: CuratedOffer[];
  /** Set when this voyage currently holds a homepage slot. */
  feature: {
    id: string;
    active: boolean;
    displayOrder: number;
    featuredOfferId: string | null;
    featureReason: string | null;
    featuredAt: string | null;
    reviewOn: string | null;
    hardExpiresAt: string | null;
  } | null;
};

/**
 * Everything blocking this voyage from rendering as a front-page card.
 * Empty array means it is ready to feature. The card needs editorial
 * copy the importer cannot supply, so this is a real gate, not a warning.
 */
export function blockersFor(v: CuratedVoyage): string[] {
  const out: string[] = [];
  if (v.sourceStatus !== "trusted") out.push("data not marked trusted");
  if (v.websiteStatus !== "approved") out.push("not approved for the site");
  if (!v.jordansTake?.trim()) out.push("no Jordan’s Take written");
  // Region tag is not required — the public card falls back to the cruise
  // line for that label (see getFeaturedJourneys), and there's no UI to set
  // a tag here, so it must never gate featuring.
  if (!v.embarkationDate) out.push("no sailing dates");
  const publishable = v.offers.filter(
    (o) =>
      o.websiteApproved &&
      o.sourceStatus === "trusted" &&
      o.myPrice !== null &&
      ["available", "guarantee"].includes(o.availabilityStatus)
  );
  if (publishable.length === 0) out.push("no approved fare to show");
  return out;
}

const VOYAGE_SELECT = `
  id, cruise_line, ship, voyage_code, official_voyage_title,
  embarkation_date, disembarkation_date, nights, embark_port, disembark_port,
  itinerary_summary, jordans_take, source_status, website_status, quoted_at,
  travel_tags:primary_tag_id ( name ),
  accommodations (
    id, category_name, category_code, size_display, accommodation_type,
    source_status,
    price_offers (
      id, their_price, my_price, availability_status, comparison_status,
      agency_bonus, promotion_name, website_approved, source_status,
      offer_expires_at
    )
  ),
  homepage_features (
    id, active, display_order, featured_offer_id, feature_reason,
    featured_at, review_on, hard_expires_at
  )
`;

function mapVoyage(r: any): CuratedVoyage {
  const offers: CuratedOffer[] = (r.accommodations ?? []).flatMap((a: any) =>
    (a.price_offers ?? []).map((p: any) => ({
      id: p.id,
      categoryName: a.category_name,
      categoryCode: a.category_code,
      sizeDisplay: a.size_display,
      accommodationType: a.accommodation_type,
      theirPrice: p.their_price === null ? null : Number(p.their_price),
      myPrice: p.my_price === null ? null : Number(p.my_price),
      availabilityStatus: p.availability_status,
      comparisonStatus: p.comparison_status,
      agencyBonus: p.agency_bonus,
      promotionName: p.promotion_name,
      websiteApproved: p.website_approved,
      sourceStatus: p.source_status ?? a.source_status,
      offerExpiresAt: p.offer_expires_at,
    }))
  );
  // Cheapest real fare first — that is the one worth featuring.
  offers.sort((a, b) => (a.myPrice ?? Infinity) - (b.myPrice ?? Infinity));

  const f = (r.homepage_features ?? [])[0] ?? null;

  return {
    id: r.id,
    cruiseLine: r.cruise_line,
    ship: r.ship,
    voyageCode: r.voyage_code,
    officialVoyageTitle: r.official_voyage_title,
    embarkationDate: r.embarkation_date,
    disembarkationDate: r.disembarkation_date,
    nights: r.nights,
    embarkPort: r.embark_port,
    disembarkPort: r.disembark_port,
    itinerarySummary: r.itinerary_summary,
    jordansTake: r.jordans_take,
    regionName: r.travel_tags?.name ?? null,
    sourceStatus: r.source_status,
    websiteStatus: r.website_status,
    quotedAt: r.quoted_at,
    offers,
    feature: f
      ? {
          id: f.id,
          active: f.active,
          displayOrder: f.display_order,
          featuredOfferId: f.featured_offer_id,
          featureReason: f.feature_reason,
          featuredAt: f.featured_at,
          reviewOn: f.review_on,
          hardExpiresAt: f.hard_expires_at,
        }
      : null,
  };
}

/** Every quoted sailing with its fares and feature state. Internal only. */
export async function listCuratedVoyages(): Promise<CuratedVoyage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("voyages")
    .select(VOYAGE_SELECT)
    .order("quoted_at", { ascending: false, nullsFirst: false })
    .order("embarkation_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(mapVoyage);
}

/**
 * The curated front-page sailings, read through the ANON client against
 * `website_featured_voyages` — a security_invoker view built for exactly
 * this: it joins homepage_features (active, unexpired) to its voyage and
 * chosen price_offer. Because it's security_invoker, the caller's own RLS
 * still applies underneath — an unapproved voyage or unapproved fare
 * simply cannot appear here no matter what this function does, so this
 * is a formatting layer, not the actual gate. Fails soft to [] — the
 * homepage falls back to legacy journeys rather than breaking.
 */
export async function getFeaturedJourneys(limit = 6): Promise<Journey[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("website_featured_voyages")
      .select("*")
      .order("display_order", { ascending: true })
      .limit(limit);
    if (error) throw error;

    return (data ?? [])
      .map((r: any) => {
        // RLS hides an unapproved fare's price_offers row entirely — a
        // featured voyage with no publishable fare yet just has nulls
        // here, so it's dropped rather than shown as a card with no price.
        if (r.my_price === null || !r.jordans_take?.trim()) return null;

        const their = money(r.their_price === null ? null : Number(r.their_price));
        const yours = money(Number(r.my_price));
        if (!yours) return null;

        const route =
          r.embark_port && r.disembark_port
            ? `${shortPort(r.embark_port)} to ${shortPort(r.disembark_port)}`
            : cleanTitle(r.official_voyage_title);

        const journey: Journey = {
          id: r.voyage_id,
          region: r.cruise_line,
          dates: formatDateRange(r.embarkation_date, r.disembarkation_date),
          routeTitle: route,
          voyageTitle: cleanTitle(r.official_voyage_title),
          cruiseLine: r.cruise_line,
          ship: r.ship,
          nights: r.nights ?? 0,
          embark: shortPort(r.embark_port) || "—",
          disembark: shortPort(r.disembark_port) || "—",
          portCount: derivePortCount(r.itinerary_summary) ?? undefined,
          stateroom: r.category_name ?? "Stateroom",
          roomSize: r.size_display ?? undefined,
          theirPrice: their ?? yours,
          yourPrice: yours,
          priceNote: r.agency_bonus ? "agency bonus included" : undefined,
          jordansTake: r.jordans_take.trim(),
          availabilityNote:
            r.availability_status === "guarantee"
              ? "Offered as a guarantee — confirmed in this category or better."
              : undefined,
        };
        return journey;
      })
      .filter((j): j is Journey => j !== null);
  } catch (err) {
    console.error("Failed to load featured journeys:", err);
    return [];
  }
}
