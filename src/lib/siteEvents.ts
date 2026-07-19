import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  classifyPriceBand,
  classifyRegion,
  classifySeason,
  summarizeInterest,
  type InterestProfile,
  type MacroRegion,
  type Season,
  type PriceBand,
} from "@/lib/taxonomy";

/**
 * Server-only helpers over public.site_events. All writes/reads use the
 * service-role admin client — the table has no public RLS policies, so this
 * never runs in the browser (guarded by "server-only").
 */

export type TrackViewInput = {
  visitorId: string;
  entityType: "journey" | "destination" | "page";
  entitySlug?: string | null;
  path?: string | null;
  /** Raw, pre-normalization signal fields — classified here before storage. */
  regionText?: string | null;
  routeContext?: string | null;
  datesText?: string | null;
  priceText?: string | null;
};

/**
 * Record one page view, normalizing region/season/price into macro buckets
 * at write time (so the row already says "Mediterranean · Autumn · $5–10k",
 * never "the-adriatic"). Fails soft — tracking must never break a page.
 */
export async function recordView(input: TrackViewInput): Promise<void> {
  try {
    const macroRegion: MacroRegion | null = input.regionText
      ? classifyRegion(input.regionText, input.routeContext ?? "")
      : null;
    const season: Season | null = classifySeason(input.datesText);
    const priceBand: PriceBand | null = classifyPriceBand(input.priceText);

    const supabase = createAdminClient();
    const { error } = await supabase.from("site_events").insert({
      visitor_id: input.visitorId,
      event_type: "view",
      entity_type: input.entityType,
      entity_slug: input.entitySlug ?? null,
      path: input.path ?? null,
      macro_region: macroRegion,
      season,
      price_band: priceBand,
    });
    if (error) throw error;
  } catch (err) {
    console.error("site_events recordView failed:", err);
  }
}

/**
 * Stitch a visitor's anonymous history to their email the moment they
 * identify (submit a form), and log the identify event. Fails soft.
 */
export async function identifyVisitor(
  visitorId: string,
  email: string
): Promise<void> {
  try {
    const supabase = createAdminClient();
    // Backfill email onto all of this visitor's prior anonymous rows.
    await supabase
      .from("site_events")
      .update({ email })
      .eq("visitor_id", visitorId)
      .is("email", null);
    // Log the identify moment itself.
    await supabase.from("site_events").insert({
      visitor_id: visitorId,
      email,
      event_type: "identify",
    });
  } catch (err) {
    console.error("site_events identifyVisitor failed:", err);
  }
}

/**
 * Roll a visitor's view history up into a single interest profile — the
 * context that goes to HubSpot and the internal notify email. Returns an
 * empty profile (all nulls) on any error or when there's no history.
 */
export async function getVisitorInterest(
  visitorId: string | null | undefined
): Promise<InterestProfile> {
  const empty = summarizeInterest([]);
  if (!visitorId) return empty;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_events")
      .select("macro_region, season, price_band")
      .eq("visitor_id", visitorId)
      .eq("event_type", "view");
    if (error) throw error;
    return summarizeInterest(
      (data ?? []).map((r) => ({
        region: (r.macro_region as MacroRegion | null) ?? null,
        season: (r.season as Season | null) ?? null,
        priceBand: (r.price_band as PriceBand | null) ?? null,
      }))
    );
  } catch (err) {
    console.error("site_events getVisitorInterest failed:", err);
    return empty;
  }
}
