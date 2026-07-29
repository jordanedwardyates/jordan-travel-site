"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Curation desk mutations. These run with the service-role client, so the
 * token check is the only thing standing between the open internet and
 * Jordan's publish switches — a server action is a public endpoint, and
 * the page's own ?key= gate does not protect it. Every action re-checks.
 */

/** How long a front-page slot runs before it wants another look. */
const REVIEW_DAYS = 30;

function assertAuthorized(formData: FormData) {
  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const key = String(formData.get("key") ?? "");
  const ok = process.env.NODE_ENV === "development" || (!!token && key === token);
  if (!ok) throw new Error("Not authorized");
}

/** Both the desk and the public homepage change when curation changes. */
function refresh() {
  revalidatePath("/internal/quotes");
  revalidatePath("/");
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Allow this sailing onto the site at all (or pull it back off). */
export async function setVoyageWebsiteStatus(formData: FormData) {
  assertAuthorized(formData);
  const voyageId = String(formData.get("voyageId"));
  const status = String(formData.get("status"));
  if (!["approved", "not_approved", "hidden"].includes(status)) {
    throw new Error(`Unexpected website_status: ${status}`);
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("voyages")
    .update({ website_status: status })
    .eq("id", voyageId);
  if (error) throw error;

  // Pulling a sailing off the site must also vacate its homepage slot,
  // or the front page keeps a card RLS will no longer serve.
  if (status !== "approved") {
    await supabase
      .from("homepage_features")
      .update({ active: false })
      .eq("voyage_id", voyageId);
  }
  refresh();
}

/** Mark the imported record as verified — the second RLS gate. */
export async function setVoyageTrusted(formData: FormData) {
  assertAuthorized(formData);
  const voyageId = String(formData.get("voyageId"));
  const trusted = String(formData.get("trusted")) === "true";

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("voyages")
    .update({ source_status: trusted ? "trusted" : "needs_review" })
    .eq("id", voyageId);
  if (error) throw error;
  refresh();
}

/** Approve (or retract) one fare for public display. */
export async function setOfferApproved(formData: FormData) {
  assertAuthorized(formData);
  const offerId = String(formData.get("offerId"));
  const approved = String(formData.get("approved")) === "true";

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("price_offers")
    .update({
      website_approved: approved,
      // An approved fare must also be trusted to pass the RLS policy.
      ...(approved ? { source_status: "trusted" } : {}),
    })
    .eq("id", offerId);
  if (error) throw error;

  if (!approved) {
    // Never leave a homepage slot pointing at a retracted fare.
    await supabase
      .from("homepage_features")
      .update({ featured_offer_id: null })
      .eq("featured_offer_id", offerId);
  }
  refresh();
}

/** The editorial line the public card cannot render without. */
export async function saveJordansTake(formData: FormData) {
  assertAuthorized(formData);
  const voyageId = String(formData.get("voyageId"));
  const take = String(formData.get("jordansTake") ?? "").trim();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("voyages")
    .update({ jordans_take: take || null })
    .eq("id", voyageId);
  if (error) throw error;
  refresh();
}

/**
 * Put a sailing on the front page. Upserts rather than inserts because
 * homepage_features.voyage_id is unique — re-featuring an old slot
 * reactivates it and restarts its review clock.
 */
export async function featureOnHomepage(formData: FormData) {
  assertAuthorized(formData);
  const voyageId = String(formData.get("voyageId"));
  const offerId = String(formData.get("offerId") ?? "") || null;
  const reason = String(formData.get("reason") ?? "").trim() || null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("homepage_features").upsert(
    {
      voyage_id: voyageId,
      featured_offer_id: offerId,
      active: true,
      feature_reason: reason,
      featured_at: new Date().toISOString(),
      review_on: daysFromNow(REVIEW_DAYS),
    },
    { onConflict: "voyage_id" }
  );
  if (error) throw error;
  refresh();
}

/** Take it off the front page. The row stays, so history is not lost. */
export async function unfeatureFromHomepage(formData: FormData) {
  assertAuthorized(formData);
  const voyageId = String(formData.get("voyageId"));

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("homepage_features")
    .update({ active: false })
    .eq("voyage_id", voyageId);
  if (error) throw error;
  refresh();
}

/** "Still good" — keep the slot and push the next review out. */
export async function snoozeReview(formData: FormData) {
  assertAuthorized(formData);
  const voyageId = String(formData.get("voyageId"));

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("homepage_features")
    .update({ review_on: daysFromNow(REVIEW_DAYS) })
    .eq("voyage_id", voyageId);
  if (error) throw error;
  refresh();
}

/** Reorder the front page. Lower numbers sit higher up. */
export async function setFeatureOrder(formData: FormData) {
  assertAuthorized(formData);
  const voyageId = String(formData.get("voyageId"));
  const order = Number(formData.get("displayOrder"));
  if (!Number.isFinite(order)) throw new Error("Bad display order");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("homepage_features")
    .update({ display_order: Math.round(order) })
    .eq("voyage_id", voyageId);
  if (error) throw error;
  refresh();
}
