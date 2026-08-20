import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { normalizeEmail, verifyEmail } from "@/lib/unsubscribe-token";

/**
 * One-click unsubscribe (RFC 8058).
 *
 * Gmail and Yahoo POST here directly when the reader hits their built-in
 * "Unsubscribe" control — no page load, no confirmation, no human. The
 * matching `List-Unsubscribe` / `List-Unsubscribe-Post` headers are set per
 * message by scripts/dispatch-send.mjs.
 *
 * POST-only on purpose. A GET that suppressed an address would be a live
 * trap: corporate mail scanners and link-preview bots fetch every URL in an
 * inbound message, and would silently unsubscribe people who never clicked
 * anything. The human-facing path is the /unsubscribe page, which renders a
 * button that posts here.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get("e") ?? "");
  const token = url.searchParams.get("t") ?? "";
  const campaign = url.searchParams.get("c");

  if (!email || !verifyEmail(email, token)) {
    // Deliberately vague: this endpoint should not confirm whether an
    // address exists, and a provider retrying a stale link gains nothing.
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("email_suppressions").insert({
      email,
      reason: "unsubscribe",
      campaign_slug: campaign?.slice(0, 120) ?? null,
    });
    // 23505 = unique violation: already suppressed, which is the desired
    // end state. Providers retry these, so it must stay idempotent.
    if (error && error.code !== "23505") throw error;
  } catch (err) {
    console.error("Unsubscribe insert failed:", err);
    // Report the failure honestly. A 200 here would tell Gmail the opt-out
    // succeeded when it did not, and the next send would prove otherwise.
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Anything other than POST, including the scanner prefetches this endpoint
// exists to defend against.
export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/unsubscribe${url.search}`, url.origin), 303);
}
