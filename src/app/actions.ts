"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { notifyQuoteRequest } from "@/lib/email/quoteRequestEmails";
import { notifyDispatchConfirmation } from "@/lib/email/dispatchEmails";
import { upsertContact } from "@/lib/hubspot/client";
import {
  getVisitorInterest,
  identifyVisitor,
} from "@/lib/siteEvents";
import { describeInterest } from "@/lib/taxonomy";
import { readVisitorId } from "@/lib/visitor";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const BASE = "https://www.bonvtravelcompany.com";

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
  let journeyId: string | null = null;
  let journeyLabel: string | null = null;
  if (journey) {
    const [id, ...rest] = journey.split("|");
    if (UUID_RE.test(id)) {
      journeyId = id;
      journeyLabel = rest.join("|").slice(0, 200) || null;
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
    });
    if (error) throw error;

    // Pull the visitor's normalized browsing interest (Mediterranean · Autumn
    // · $5k–$10k), so both Jordan's notify email and the HubSpot record carry
    // what they were actually looking at — not just what the form captured.
    const visitorId = await readVisitorId();
    const interestSummary = describeInterest(
      await getVisitorInterest(visitorId)
    );

    if (visitorId) {
      identifyVisitor(visitorId, email).catch((err) =>
        console.error("Visitor identify failed:", err)
      );
    }

    notifyQuoteRequest({
      name,
      email,
      phone,
      journeyLabel,
      message,
      interestSummary,
    }).catch((err) => console.error("Quote request email notify failed:", err));

    // Ownership: get the contact into Jordan's HubSpot immediately.
    upsertContact({
      email,
      name,
      phone: phone || null,
      source: "Website quote request",
      interestSummary,
      message,
    }).catch((err) => console.error("HubSpot sync failed:", err));

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
    const confirmationToken = crypto.randomUUID();
    const supabase = createPublicClient();
    const { error } = await supabase.from("subscribers").insert({
      email,
      source: "homepage",
      confirmation_token: confirmationToken,
    });
    // 23505 = unique violation: already subscribed. Treat as success so the
    // response never reveals whether an address is on the list, and don't
    // re-pester an existing pending/confirmed subscriber with another
    // confirmation email.
    if (error && error.code !== "23505") throw error;

    if (!error) {
      const confirmUrl = `${BASE}/api/dispatch/confirm?token=${confirmationToken}`;
      notifyDispatchConfirmation({ email, confirmUrl }).catch((err) =>
        console.error("Dispatch confirmation email notify failed:", err)
      );

      // Same ownership + interest capture as the quote form. Only on a fresh
      // signup — the 23505 path deliberately falls through untouched.
      const visitorId = await readVisitorId();
      const interestSummary = describeInterest(
        await getVisitorInterest(visitorId)
      );

      if (visitorId) {
        identifyVisitor(visitorId, email).catch((err) =>
          console.error("Visitor identify failed:", err)
        );
      }

      upsertContact({
        email,
        source: "STAMPED signup",
        interestSummary,
      }).catch((err) => console.error("HubSpot sync failed:", err));
    }

    return { status: "success" };
  } catch (err) {
    console.error("Dispatch signup insert failed:", err);
    return { status: "error", message: GENERIC_ERROR };
  }
}
