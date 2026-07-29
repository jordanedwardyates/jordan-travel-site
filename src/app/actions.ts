"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const GENERIC_ERROR =
  "Something went wrong on my end. Please email jordan.yates@luxurycruiseconnections.com or call 904-614-1219 — I'll take care of it.";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitQuoteRequest(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  // Honeypot: humans never see this field; bots fill it. Pretend success.
  if (field(formData, "website") !== "") {
    return { status: "success" };
  }

  const name = field(formData, "name");
  const email = field(formData, "email");
  const phone = field(formData, "phone");
  const journey = field(formData, "journey");
  const message = field(formData, "message");
  // Carried from the landing URL's ?utm_campaign=<slug>&utm_content=<voyage
  // code> — the same tags the Dispatch webhook already parses off clicked
  // links (see api/webhooks/resend). Capturing them here is what lets a
  // quote get attributed back to the letter that drove it.
  const utmCampaign = field(formData, "utmCampaign").slice(0, 100);
  const utmContent = field(formData, "utmContent").slice(0, 100);

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Please tell me your name.";
  else if (name.length > 160) fieldErrors.name = "That name looks too long.";
  if (!EMAIL_RE.test(email) || email.length > 200)
    fieldErrors.email = "Please enter a valid email address.";
  if (phone.length > 40)
    fieldErrors.phone = "That phone number looks too long.";
  if (!message)
    fieldErrors.message = "Please add a line about the trip you have in mind.";
  else if (message.length > 4000)
    fieldErrors.message = "Please keep your note under 4,000 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  // The select submits "uuid|label"; anything malformed becomes a general inquiry.
  let journeyId: string | null = null;
  let journeyLabel: string | null = null;
  if (journey) {
    const [id, ...rest] = journey.split("|");
    if (UUID_RE.test(id)) {
      journeyId = id;
      journeyLabel = rest.join("|").slice(0, 200) || null;
    }
  }

  // Resolve the utm tags to real rows before the insert. This needs the
  // admin client: a Dispatch sailing is often quoted and sent before it's
  // approved for public display, so the anon-facing RLS policies (which
  // require website_status = 'approved') would hide it here even though
  // attribution should still work. The insert itself stays on the public
  // client below — this is a read-only lookup, not a privilege change to
  // who can write a quote_requests row.
  let sourceCampaignId: string | null = null;
  let voyageId: string | null = null;
  if (utmCampaign || utmContent) {
    try {
      const admin = createAdminClient();
      const [campaignRes, voyageRes] = await Promise.all([
        utmCampaign
          ? admin.from("campaigns").select("id").eq("slug", utmCampaign).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        utmContent
          ? admin.from("voyages").select("id").eq("voyage_code", utmContent).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      sourceCampaignId = campaignRes.data?.id ?? null;
      voyageId = voyageRes.data?.id ?? null;
    } catch (err) {
      // Attribution is a bonus, not a blocker — a lookup failure should
      // never stop the inquiry itself from reaching Jordan.
      console.error("Quote request attribution lookup failed:", err);
    }
  }

  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("quote_requests").insert({
      name,
      email,
      phone: phone || null,
      journey_id: journeyId,
      journey_label: journeyLabel,
      message,
      source_campaign_id: sourceCampaignId,
      voyage_id: voyageId,
    });
    if (error) throw error;
    return { status: "success" };
  } catch (err) {
    console.error("Quote request insert failed:", err);
    return { status: "error", message: GENERIC_ERROR };
  }
}

export async function subscribeToDispatch(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (field(formData, "website") !== "") {
    return { status: "success" };
  }

  const email = field(formData, "email");
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
      fieldErrors: { email: "Please enter a valid email address." },
    };
  }

  const source = field(formData, "source") || "homepage";

  try {
    const supabase = createPublicClient();
    const { error } = await supabase
      .from("subscribers")
      .insert({ email, source });
    // 23505 = unique violation: already subscribed. Treat as success so the
    // response never reveals whether an address is on the list.
    if (error && error.code !== "23505") throw error;
    return { status: "success" };
  } catch (err) {
    console.error("Dispatch signup insert failed:", err);
    return { status: "error", message: GENERIC_ERROR };
  }
}
