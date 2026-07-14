import type { Journey } from "@/components/JourneyCard";
import { createPublicClient } from "@/lib/supabase/public";

const JOURNEY_COLUMNS =
  "id, slug, region, dates, route_title, voyage_title, cruise_line, ship, nights, embark, disembark, port_count, stateroom, room_size, their_price, your_price, price_note, jordans_take, availability_note";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(row: any): Journey {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    region: row.region,
    dates: row.dates,
    routeTitle: row.route_title,
    voyageTitle: row.voyage_title,
    cruiseLine: row.cruise_line,
    ship: row.ship,
    nights: row.nights,
    embark: row.embark,
    disembark: row.disembark,
    portCount: row.port_count,
    stateroom: row.stateroom,
    roomSize: row.room_size ?? undefined,
    theirPrice: row.their_price,
    yourPrice: row.your_price,
    priceNote: row.price_note ?? undefined,
    jordansTake: row.jordans_take,
    availabilityNote: row.availability_note ?? undefined,
  };
}

/** Published journeys, featured first, then by sort order. Fails soft to []. */
export async function getPublishedJourneys(limit = 24): Promise<Journey[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("journeys")
      .select(JOURNEY_COLUMNS)
      .eq("is_published", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch (err) {
    console.error("Failed to load journeys:", err);
    return [];
  }
}

/** One published journey by slug, or null (unknown slug, unpublished, or error). */
export async function getJourneyBySlug(slug: string): Promise<Journey | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("journeys")
      .select(JOURNEY_COLUMNS)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  } catch (err) {
    console.error(`Failed to load journey ${slug}:`, err);
    return null;
  }
}
