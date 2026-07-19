import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://www.bonvtravelcompany.com";
// Mirrors UUID_RE in src/app/actions.ts. Can't import it from there: a
// "use server" file may only export async functions.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Double opt-in confirmation link. Looks up the subscriber by
 * confirmation_token (service-role client — subscribers has no public
 * select/update policy) and, if pending, marks it confirmed. Idempotent:
 * a second click on an already-confirmed/unsubscribed/cleaned row is a
 * no-op that still redirects to the success page. Never leaks subscriber
 * existence or state in the response body — redirect only.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  const invalidRedirect = NextResponse.redirect(
    `${BASE}/dispatch/confirmed?invalid=1`
  );

  if (!UUID_RE.test(token)) {
    return invalidRedirect;
  }

  try {
    const supabase = createAdminClient();
    const { data: subscriber, error: fetchError } = await supabase
      .from("subscribers")
      .select("id, status")
      .eq("confirmation_token", token)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!subscriber) return invalidRedirect;

    if (subscriber.status === "pending") {
      const { error: updateError } = await supabase
        .from("subscribers")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", subscriber.id);
      if (updateError) throw updateError;
    }
    // Already confirmed/unsubscribed/cleaned: leave as-is (don't resurrect).

    return NextResponse.redirect(`${BASE}/dispatch/confirmed`);
  } catch (err) {
    console.error("Dispatch confirm failed:", err);
    return invalidRedirect;
  }
}
