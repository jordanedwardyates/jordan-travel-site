import type { Journey } from "@/components/JourneyCard";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublishedJourneys } from "@/lib/journeys";

/**
 * Phase G — the public website read path over the normalized model.
 *
 * Reads homepage_features → voyages → accommodations → price_offers with the
 * cookie-free anon client, so pages stay statically renderable and Row Level
 * Security does the trust filtering (approved voyages, trusted rows, safe
 * offers only). While no features are active/approved, this returns the
 * legacy journeys instead, so the site never goes blank during the cutover.
 */

const FEATURE_SELECT = `
  voyage_id, featured_offer_id, display_order,
  voyages (
    id, cruise_line, ship, official_voyage_title,
    embarkation_date, disembarkation_date, nights, embark_port, disembark_port,
    jordans_take,
    primary_tag:travel_tags!primary_tag_id ( name ),
    accommodations (
      id, category_name, category_code, total_size_sq_ft, size_display,
      price_offers (
        id, their_price, my_price, price_basis, availability_status,
        agency_bonus, promotion_name, quoted_at, offer_expires_at,
        comparison_status
      )
    )
  )
`;

/** "Trieste, Italy" → "Trieste" */
function city(port: string | null): string {
  return (port ?? "").split(",")[0].trim();
}

/** 2026-10-03 + 2026-10-10 → "3–10 Oct 2026" (legacy journeys date style). */
function formatDates(embark: string | null, disembark: string | null): string {
  if (!embark) return "Dates on request";
  const from = new Date(`${embark}T00:00:00Z`);
  const to = disembark ? new Date(`${disembark}T00:00:00Z`) : null;
  const mon = (d: Date) => d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" });
  const yr = (d: Date) => d.getUTCFullYear();
  if (!to) return `${from.getUTCDate()} ${mon(from)} ${yr(from)}`;
  if (yr(from) === yr(to) && from.getUTCMonth() === to.getUTCMonth()) {
    return `${from.getUTCDate()}–${to.getUTCDate()} ${mon(to)} ${yr(to)}`;
  }
  if (yr(from) === yr(to)) {
    return `${from.getUTCDate()} ${mon(from)} – ${to.getUTCDate()} ${mon(to)} ${yr(to)}`;
  }
  return `${from.getUTCDate()} ${mon(from)} ${yr(from)} – ${to.getUTCDate()} ${mon(to)} ${yr(to)}`;
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

type OfferRow = {
  id: string;
  their_price: number | null;
  my_price: number | null;
  price_basis: string;
  availability_status: string;
  agency_bonus: string | null;
  promotion_name: string | null;
  quoted_at: string;
  offer_expires_at: string | null;
  comparison_status: string | null;
};

/**
 * The offer a card should show. RLS already limits rows to safe offers;
 * the belt-and-braces checks here mirror the schema contract so a policy
 * regression can never surface an unpriceable or higher-than-retail offer.
 */
function pickOffer(
  offers: Array<{ offer: OfferRow; accommodation: AccommodationRow }>,
  featuredOfferId: string | null
) {
  const usable = offers.filter(
    ({ offer }) =>
      offer.my_price !== null &&
      offer.price_basis === "per_person" &&
      offer.comparison_status !== "invalid_higher_than_retail"
  );
  if (usable.length === 0) return null;
  const featured = usable.find(({ offer }) => offer.id === featuredOfferId);
  if (featured) return featured;
  // Prefer offers with a retail comparison (the "never pay retail" story),
  // then the lowest My Price.
  return [...usable].sort((a, b) => {
    const aCmp = a.offer.their_price !== null ? 0 : 1;
    const bCmp = b.offer.their_price !== null ? 0 : 1;
    if (aCmp !== bCmp) return aCmp - bCmp;
    return (a.offer.my_price ?? 0) - (b.offer.my_price ?? 0);
  })[0];
}

type AccommodationRow = {
  id: string;
  category_name: string;
  category_code: string | null;
  total_size_sq_ft: number | null;
  size_display: string | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapFeature(row: any): Journey | null {
  const v = row.voyages;
  if (!v) return null;
  const offers = (v.accommodations ?? []).flatMap((a: any) =>
    (a.price_offers ?? []).map((offer: any) => ({ offer, accommodation: a }))
  );
  const picked = pickOffer(offers, row.featured_offer_id);
  if (!picked) return null;
  const { offer, accommodation } = picked;

  const roomSize =
    accommodation.total_size_sq_ft !== null
      ? `approx. ${Number(accommodation.total_size_sq_ft)} sq ft`
      : accommodation.size_display ?? undefined;

  return {
    id: v.id,
    region: v.primary_tag?.name ?? "Featured voyage",
    dates: formatDates(v.embarkation_date, v.disembarkation_date),
    routeTitle:
      city(v.embark_port) && city(v.disembark_port)
        ? `${city(v.embark_port)} to ${city(v.disembark_port)}`
        : v.official_voyage_title,
    voyageTitle: v.official_voyage_title,
    cruiseLine: v.cruise_line,
    ship: v.ship,
    nights: v.nights ?? 0,
    embark: v.embark_port ?? "",
    disembark: v.disembark_port ?? "",
    stateroom: accommodation.category_code
      ? `${accommodation.category_name} (${accommodation.category_code})`
      : accommodation.category_name,
    roomSize,
    theirPrice:
      offer.their_price !== null ? money(Number(offer.their_price)) : undefined,
    yourPrice: money(Number(offer.my_price)),
    priceNote: offer.agency_bonus ?? offer.promotion_name ?? undefined,
    jordansTake: v.jordans_take ?? undefined,
    availabilityNote:
      offer.availability_status === "guarantee"
        ? "Guarantee category — the line assigns your exact stateroom."
        : undefined,
  };
}

/**
 * Journeys for the homepage and /journeys index. Normalized model first;
 * legacy journeys while no 2.0 content is approved. Fails soft to [].
 */
export async function getFeaturedJourneys(limit = 6): Promise<Journey[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("homepage_features")
      .select(FEATURE_SELECT)
      .order("display_order", { ascending: true })
      .limit(limit);
    if (error) throw error;
    const journeys = (data ?? [])
      .map(mapFeature)
      .filter((j): j is Journey => j !== null);
    if (journeys.length > 0) return journeys;
  } catch (err) {
    console.error("Failed to load featured voyages (2.0):", err);
  }
  return getPublishedJourneys(limit);
}
