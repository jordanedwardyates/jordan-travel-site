import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Runs twice a day (see vercel.json). Emails any Dispatch signups from the
 * lookback window to Jordan, plus HUBSPOT_INGEST_EMAIL if configured, so
 * HubSpot's email-to-contact ingestion picks them up. The 13h lookback
 * (vs. the 12h cadence) gives a buffer against a delayed or skipped run —
 * duplicates in a digest email are harmless, a dropped signup isn't.
 */

export const dynamic = "force-dynamic";

const LOOKBACK_HOURS = 13;

// Subscriber-supplied strings land in the digest's HTML. Escape them: a
// direct POST to the server action can store an email/source containing
// markup (the server-side email regex permits < and >), and we don't want
// that rendering in Jordan's inbox or reaching HubSpot's ingestion.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isAuthorized(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(
    Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000
  ).toISOString();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("email, source, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Subscriber digest query failed:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const subscribers = data ?? [];
  if (subscribers.length === 0) {
    return NextResponse.json({ sent: false, count: 0 });
  }

  const to = ["jordan.yates@luxurycruiseconnections.com"];
  if (process.env.HUBSPOT_INGEST_EMAIL) {
    to.push(process.env.HUBSPOT_INGEST_EMAIL);
  }

  const rows = subscribers
    .map(
      (s) =>
        `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(s.email)}</td><td style="padding:4px 12px 4px 0">${escapeHtml(s.source)}</td><td style="padding:4px 0">${new Date(s.created_at).toLocaleString("en-US")}</td></tr>`
    )
    .join("");

  const html = `
    <p>${subscribers.length} new Dispatch signup${subscribers.length === 1 ? "" : "s"} in the last ${LOOKBACK_HOURS} hours:</p>
    <table style="border-collapse:collapse">
      <thead><tr><th align="left" style="padding:4px 12px 4px 0">Email</th><th align="left" style="padding:4px 12px 4px 0">Source</th><th align="left" style="padding:4px 0">Signed up</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.error("Subscriber digest: RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "RESEND_API_KEY is not set" },
      { status: 500 }
    );
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: sendError } = await resend.emails.send({
    from: process.env.DIGEST_FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject: `${subscribers.length} new Dispatch signup${subscribers.length === 1 ? "" : "s"}`,
    html,
  });

  if (sendError) {
    console.error("Subscriber digest send failed:", sendError);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }

  return NextResponse.json({ sent: true, count: subscribers.length, to });
}
