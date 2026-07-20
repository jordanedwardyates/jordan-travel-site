"use server";

import { createPublicClient } from "@/lib/supabase/public";
import type { Journey } from "@/components/JourneyCard";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapJourneyRow(row: any): Journey {
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

export async function ensureVisitorProfile(visitorId: string) {
  try {
    const supabase = createPublicClient();

    // Try to get existing profile
    const { data: existing } = await supabase
      .from("visitor_profiles")
      .select("id, visit_count")
      .eq("id", visitorId)
      .maybeSingle();

    if (existing) {
      // Update last_seen_at and increment visit_count
      const visitCount = (existing as { id: string; visit_count?: number }).visit_count || 1;
      await supabase
        .from("visitor_profiles")
        .update({
          last_seen_at: new Date().toISOString(),
          visit_count: visitCount + 1,
        })
        .eq("id", visitorId);
    } else {
      // Create new profile
      await supabase.from("visitor_profiles").insert({
        id: visitorId,
        created_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        visit_count: 1,
      });
    }
  } catch (err) {
    console.error("Failed to ensure visitor profile:", err);
  }
}

export async function logVisitorEvent(
  visitorId: string,
  eventType: "page_view" | "journey_view" | "region_interest" | "quote_start",
  journeyId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const supabase = createPublicClient();
    await supabase.from("visitor_events").insert({
      visitor_id: visitorId,
      event_type: eventType,
      journey_id: journeyId || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to log visitor event:", err);
  }
}

export async function getVisitorRecommendations(
  visitorId: string,
  limit = 3
): Promise<Journey[]> {
  try {
    const supabase = createPublicClient();

    // Get visitor's recent interests
    const { data: recentEvents } = await supabase
      .from("visitor_events")
      .select("event_type, journey_id, metadata")
      .eq("visitor_id", visitorId)
      .in("event_type", ["journey_view", "region_interest"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (!recentEvents || recentEvents.length === 0) {
      // Return recently quoted journeys if no history
      const { data: journeys } = await supabase
        .from("journeys")
        .select(
          "id, slug, region, dates, route_title, voyage_title, cruise_line, ship, nights, embark, disembark, port_count, stateroom, room_size, their_price, your_price, price_note, jordans_take, availability_note"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      return (journeys ?? []).map(mapJourneyRow);
    }

    // Extract regions and journey IDs from events
    const viewedJourneyIds = new Set<string>();
    const interestedRegions = new Set<string>();

    for (const event of recentEvents) {
      if (event.event_type === "journey_view" && event.journey_id) {
        viewedJourneyIds.add(event.journey_id);
      }
      if (event.event_type === "region_interest" && event.metadata?.region) {
        interestedRegions.add(event.metadata.region);
      }
    }

    // Get journeys matching interests, excluding already viewed
    const { data: recommendations } = await supabase
      .from("journeys")
      .select(
        "id, slug, region, dates, route_title, voyage_title, cruise_line, ship, nights, embark, disembark, port_count, stateroom, room_size, their_price, your_price, price_note, jordans_take, availability_note, featured"
      )
      .eq("is_published", true)
      .in("region", Array.from(interestedRegions))
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit * 2); // Get extra to filter

    if (!recommendations) return [];

    // Filter out already-viewed journeys and limit to requested count
    return (recommendations as any[])
      .map(mapJourneyRow)
      .filter((j) => !viewedJourneyIds.has(j.id))
      .slice(0, limit);
  } catch (err) {
    console.error("Failed to get visitor recommendations:", err);
    return [];
  }
}
