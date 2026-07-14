import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Normalized quote-intelligence reads (voyages → accommodations →
 * price_offers). Internal/server-side only for now; the live site still
 * reads the legacy journeys table until the Phase G switch.
 */

export type PriceOffer = {
  id: string;
  theirPrice: number | null;
  myPrice: number | null;
  currency: string;
  priceBasis: "per_person" | "total_accommodation" | "unknown";
  occupancyBasis: string;
  availabilityStatus: string;
  agencyBonus: string | null;
  promotionName: string | null;
  quotedAt: string;
  offerExpiresAt: string | null;
  sourceStatus: string;
  websiteApproved: boolean;
  comparisonStatus: string | null;
};

export type Accommodation = {
  id: string;
  categoryName: string;
  categoryCode: string | null;
  accommodationClass: string;
  balconyGroup: boolean;
  totalSizeSqFt: number | null;
  roomNumber: string | null;
  sourceStatus: string;
  offers: PriceOffer[];
};

export type VoyageWithOffers = {
  id: string;
  cruiseLine: string;
  ship: string;
  voyageTitle: string;
  voyageCode: string | null;
  embarkationDate: string | null;
  disembarkationDate: string | null;
  nights: number | null;
  embarkPort: string | null;
  disembarkPort: string | null;
  jordansTake: string | null;
  sourceStatus: string;
  websiteStatus: string;
  tags: string[];
  accommodations: Accommodation[];
};

const VOYAGE_SELECT = `
  id, cruise_line, ship, official_voyage_title, voyage_code,
  embarkation_date, disembarkation_date, nights, embark_port, disembark_port,
  jordans_take, source_status, website_status,
  voyage_tags ( travel_tags ( slug ) ),
  accommodations (
    id, category_name, category_code, accommodation_type, balcony_group,
    total_size_sq_ft, room_number, source_status,
    price_offers (
      id, their_price, my_price, currency, price_basis, occupancy_basis,
      availability_status, agency_bonus, promotion_name, quoted_at,
      offer_expires_at, source_status, website_approved, comparison_status
    )
  )
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapVoyage(row: any): VoyageWithOffers {
  return {
    id: row.id,
    cruiseLine: row.cruise_line,
    ship: row.ship,
    voyageTitle: row.official_voyage_title,
    voyageCode: row.voyage_code,
    embarkationDate: row.embarkation_date,
    disembarkationDate: row.disembarkation_date,
    nights: row.nights,
    embarkPort: row.embark_port,
    disembarkPort: row.disembark_port,
    jordansTake: row.jordans_take,
    sourceStatus: row.source_status,
    websiteStatus: row.website_status,
    tags: (row.voyage_tags ?? [])
      .map((vt: any) => vt.travel_tags?.slug)
      .filter(Boolean),
    accommodations: (row.accommodations ?? []).map((a: any) => ({
      id: a.id,
      categoryName: a.category_name,
      categoryCode: a.category_code,
      accommodationClass: a.accommodation_type,
      balconyGroup: a.balcony_group,
      totalSizeSqFt: a.total_size_sq_ft !== null ? Number(a.total_size_sq_ft) : null,
      roomNumber: a.room_number,
      sourceStatus: a.source_status,
      offers: (a.price_offers ?? [])
        .map((p: any) => ({
          id: p.id,
          theirPrice: p.their_price !== null ? Number(p.their_price) : null,
          myPrice: p.my_price !== null ? Number(p.my_price) : null,
          currency: p.currency,
          priceBasis: p.price_basis,
          occupancyBasis: p.occupancy_basis,
          availabilityStatus: p.availability_status,
          agencyBonus: p.agency_bonus,
          promotionName: p.promotion_name,
          quotedAt: p.quoted_at,
          offerExpiresAt: p.offer_expires_at,
          sourceStatus: p.source_status,
          websiteApproved: p.website_approved,
          comparisonStatus: p.comparison_status,
        }))
        .sort((x: PriceOffer, y: PriceOffer) => (y.quotedAt < x.quotedAt ? -1 : 1)),
    })),
  };
}

/** Every voyage with its full accommodation and offer tree (internal). */
export async function listVoyagesWithOffers(): Promise<VoyageWithOffers[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("voyages")
    .select(VOYAGE_SELECT)
    .order("embarkation_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapVoyage);
}

/** One voyage with its full offer tree, or null. */
export async function getVoyageWithOffers(
  id: string
): Promise<VoyageWithOffers | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("voyages")
    .select(VOYAGE_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapVoyage(data) : null;
}
