"use server";

import { createPublicClient } from "@/lib/supabase/public";

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
  let selectedId: string | null = null;
  let journeyLabel: string | null = null;
  if (journey) {
    const [id, ...rest] = journey.split("|");
    if (UUID_RE.test(id)) {
      selectedId = id;
      journeyLabel = rest.join("|").slice(0, 200) || null;
    }
  }

  try {
    const supabase = createPublicClient();

    // The id may point at a legacy journey or a 2.0 voyage. Resolve it before
    // inserting so an unknown id degrades to a labeled general inquiry
    // instead of a foreign-key violation. RLS scopes both lookups to rows
    // the public site can show.
    let journeyId: string | null = null;
    let voyageId: string | null = null;
    if (selectedId) {
      const [journeyHit, voyageHit] = await Promise.all([
        supabase.from("journeys").select("id").eq("id", selectedId).maybeSingle(),
        supabase.from("voyages").select("id").eq("id", selectedId).maybeSingle(),
      ]);
      journeyId = journeyHit.data?.id ?? null;
      voyageId = journeyId === null ? voyageHit.data?.id ?? null : null;
    }

    const { error } = await supabase.from("quote_requests").insert({
      name,
      email,
      phone: phone || null,
      journey_id: journeyId,
      voyage_id: voyageId,
      journey_label: journeyLabel,
      message,
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

  try {
    const supabase = createPublicClient();
    const { error } = await supabase
      .from("subscribers")
      .insert({ email, source: "homepage" });
    // 23505 = unique violation: already subscribed. Treat as success so the
    // response never reveals whether an address is on the list.
    if (error && error.code !== "23505") throw error;
    return { status: "success" };
  } catch (err) {
    console.error("Dispatch signup insert failed:", err);
    return { status: "error", message: GENERIC_ERROR };
  }
}
