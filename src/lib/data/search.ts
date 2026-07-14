import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Typed wrapper over the search_voyage_offers Postgres function — the
 * deterministic Phase F search contract. Filters live in SQL; this layer
 * only translates names and types.
 */

export type VoyageSearchFilters = {
  tags?: string[];
  cruiseLines?: string[];
  ships?: string[];
  embarkationDateFrom?: string;
  embarkationDateTo?: string;
  balconyMode?: "true_step_out" | "any_style";
  accommodationClasses?: string[];
  maxMyPrice?: number;
  priceBasis?: "per_person" | "total_accommodation";
  availability?: Array<"available" | "guarantee">;
  futureOnly?: boolean;
  onePerVoyage?: boolean;
  limit?: number;
};

export type VoyageOfferResult = {
  voyageId: string;
  cruiseLine: string;
  ship: string;
  voyageTitle: string;
  embarkationDate: string | null;
  disembarkationDate: string | null;
  embarkPort: string | null;
  disembarkPort: string | null;
  tags: string[];
  accommodationId: string;
  categoryName: string;
  categoryCode: string | null;
  accommodationClass: string;
  totalSizeSqFt: number | null;
  theirPrice: number | null;
  myPrice: number | null;
  priceBasis: string;
  availabilityStatus: string;
  agencyBonus: string | null;
  quotedAt: string;
  offerExpiresAt: string | null;
};

export async function searchVoyageOffers(
  filters: VoyageSearchFilters = {}
): Promise<VoyageOfferResult[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("search_voyage_offers", {
    p_tags: filters.tags ?? null,
    p_cruise_lines: filters.cruiseLines ?? null,
    p_ships: filters.ships ?? null,
    p_embark_from: filters.embarkationDateFrom ?? null,
    p_embark_to: filters.embarkationDateTo ?? null,
    p_balcony_mode: filters.balconyMode ?? null,
    p_accommodation_classes: filters.accommodationClasses ?? null,
    p_max_my_price: filters.maxMyPrice ?? null,
    p_price_basis: filters.priceBasis ?? "per_person",
    p_availability: filters.availability ?? ["available", "guarantee"],
    p_future_only: filters.futureOnly ?? true,
    p_one_per_voyage: filters.onePerVoyage ?? false,
    p_limit: filters.limit ?? 10,
  });
  if (error) throw error;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((r: any) => ({
    voyageId: r.voyage_id,
    cruiseLine: r.cruise_line,
    ship: r.ship,
    voyageTitle: r.voyage_title,
    embarkationDate: r.embarkation_date,
    disembarkationDate: r.disembarkation_date,
    embarkPort: r.embark_port,
    disembarkPort: r.disembark_port,
    tags: r.tags ?? [],
    accommodationId: r.accommodation_id,
    categoryName: r.category_name,
    categoryCode: r.category_code,
    accommodationClass: r.accommodation_class,
    totalSizeSqFt: r.total_size_sq_ft !== null ? Number(r.total_size_sq_ft) : null,
    theirPrice: r.their_price !== null ? Number(r.their_price) : null,
    myPrice: r.my_price !== null ? Number(r.my_price) : null,
    priceBasis: r.price_basis,
    availabilityStatus: r.availability_status,
    agencyBonus: r.agency_bonus,
    quotedAt: r.quoted_at,
    offerExpiresAt: r.offer_expires_at,
  }));
}
