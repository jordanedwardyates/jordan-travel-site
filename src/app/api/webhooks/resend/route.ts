import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resend webhook → campaign_events. Turns delivery/open/click events into
 * rows the marketing desk reads.
 *
 * Attribution: every voyage link in a Dispatch letter carries
 * `utm_campaign=<campaign slug>` and `utm_content=<voyage code>`, so a click
 * resolves to both the campaign and the exact sailing without a redirect
 * service.
 *
 * Security: Resend signs with Svix headers. We verify the HMAC ourselves
 * (no extra dependency) and reject anything unsigned or stale.
 */

export const dynamic = "force-dynamic";

const TOLERANCE_SECONDS = 5 * 60;

const EVENT_MAP: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

/** Constant-time compare of a v1 signature against the computed HMAC. */
function signatureMatches(header: string, expected: string): boolean {
  const expectedBuf = Buffer.from(expected);
  // Header may carry several space-separated `v1,<sig>` pairs.
  return header.split(" ").some((part) => {
    const sig = part.startsWith("v1,") ? part.slice(3) : part;
    const buf = Buffer.from(sig);
    return buf.length === expectedBuf.length && timingSafeEqual(buf, expectedBuf);
  });
}

function verify(req: NextRequest, body: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false;

  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;

  // Reject replays of old payloads.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");

  return signatureMatches(signature, expected);
}

/** Pull campaign slug + voyage code out of a tagged click URL. */
function parseAttribution(link: string | null) {
  if (!link) return { campaignSlug: null, voyageCode: null };
  try {
    const url = new URL(link);
    return {
      campaignSlug: url.searchParams.get("utm_campaign"),
      voyageCode: url.searchParams.get("utm_content"),
    };
  } catch {
    return { campaignSlug: null, voyageCode: null };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  if (!verify(req, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    type?: string;
    created_at?: string;
    data?: Record<string, unknown>;
  };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const eventType = EVENT_MAP[payload.type ?? ""];
  if (!eventType) {
    // Not an event we track (e.g. delivery_delayed) — ack so Resend stops retrying.
    return NextResponse.json({ ignored: payload.type ?? null });
  }

  const data = (payload.data ?? {}) as {
    email_id?: string;
    to?: string[] | string;
    created_at?: string;
    click?: { link?: string; timestamp?: string };
    tags?: Record<string, string>;
  };

  const recipient = Array.isArray(data.to) ? data.to[0] : data.to;
  const link = data.click?.link ?? null;
  const { campaignSlug, voyageCode } = parseAttribution(link);

  const supabase = createAdminClient();

  // Resolve the campaign from the click URL, or fall back to a Resend tag.
  const slug = campaignSlug ?? data.tags?.campaign ?? null;
  let campaignId: string | null = null;
  if (slug) {
    const { data: c } = await supabase
      .from("campaigns")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    campaignId = c?.id ?? null;
  }

  let voyageId: string | null = null;
  if (voyageCode) {
    const { data: v } = await supabase
      .from("voyages")
      .select("id")
      .eq("voyage_code", voyageCode)
      .maybeSingle();
    voyageId = v?.id ?? null;
  }

  // provider_event_id is unique — a redelivered webhook updates rather than
  // duplicating, so counts stay honest.
  const { error } = await supabase.from("campaign_events").upsert(
    {
      campaign_id: campaignId,
      voyage_id: voyageId,
      recipient_email: recipient ?? null,
      event_type: eventType,
      link_url: link,
      occurred_at:
        data.click?.timestamp ?? data.created_at ?? payload.created_at ?? new Date().toISOString(),
      provider: "resend",
      provider_event_id: `${data.email_id ?? "unknown"}:${eventType}:${
        data.click?.timestamp ?? data.created_at ?? ""
      }`,
      raw: payload as unknown as Record<string, unknown>,
    },
    { onConflict: "provider_event_id" }
  );

  if (error) {
    console.error("Resend webhook insert failed:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, eventType, campaignId, voyageId });
}
