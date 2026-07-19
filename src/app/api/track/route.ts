import { NextResponse } from "next/server";

import { getDestination } from "@/lib/destinations";
import { recordView } from "@/lib/siteEvents";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateVisitorId } from "@/lib/visitor";

/**
 * First-party view beacon. The browser sends only { entityType, slug, path } —
 * never any interest signal — and this handler looks the real region / dates /
 * price up server-side, so the normalized buckets can't be spoofed from the
 * client. Writes go through the admin client (site_events is service-role
 * only). Always 204s; tracking must never surface an error to the visitor.
 */

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type TrackBody = {
  entityType?: unknown;
  slug?: unknown;
  path?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const visitorId = await getOrCreateVisitorId();

    let body: TrackBody = {};
    try {
      body = (await request.json()) as TrackBody;
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const entityType =
      body.entityType === "journey" ||
      body.entityType === "destination" ||
      body.entityType === "page"
        ? body.entityType
        : null;
    const slug =
      typeof body.slug === "string" && SLUG_RE.test(body.slug)
        ? body.slug
        : null;
    const path =
      typeof body.path === "string" ? body.path.slice(0, 300) : null;

    if (!entityType) return new NextResponse(null, { status: 204 });

    // Resolve the raw signal fields server-side from the slug.
    let regionText: string | null = null;
    let routeContext: string | null = null;
    let datesText: string | null = null;
    let priceText: string | null = null;

    if (entityType === "journey" && slug) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("journeys")
        .select("region, route_title, dates, your_price")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (data) {
        regionText = data.region ?? null;
        routeContext = data.route_title ?? null;
        datesText = data.dates ?? null;
        priceText = data.your_price ?? null;
      }
    } else if (entityType === "destination" && slug) {
      const dest = getDestination(slug);
      if (dest) {
        regionText = dest.name;
        routeContext = dest.dek;
      }
    }

    await recordView({
      visitorId,
      entityType,
      entitySlug: slug,
      path,
      regionText,
      routeContext,
      datesText,
      priceText,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("track route failed:", err);
    return new NextResponse(null, { status: 204 });
  }
}
