import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Advisor-only data. This view is SELECT-granted to service_role, never to
 * anon/authenticated. Do not import this module into a Client Component.
 * The route must authenticate BEFORE calling this function.
 */
export type AdvisorReviewItem = {
  work_item_key: string;
  source_system: string;
  client_name: string | null;
  review_lane: string;
  source_stage: string | null;
  source_review_date: string | null;
  sail_date: string | null;
  recommended_review: string | null;
  needs_quote_reconciliation: boolean;
  requires_human_verification: boolean;
  eligible_for_automated_outreach: boolean;
};

const PAGE_SIZE = 500;
const MAX_ITEMS = 10000;

export async function listAdvisorReviewItems(): Promise<AdvisorReviewItem[]> {
  const supabase = createAdminClient();
  const items: AdvisorReviewItem[] = [];

  // Explicit column allowlist: don't fetch email addresses or unrelated notes.
  for (let offset = 0; offset < MAX_ITEMS; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("advisor_unified_internal_review_queue")
      .select(
        "work_item_key,source_system,client_name,review_lane,source_stage,source_review_date,sail_date,recommended_review,needs_quote_reconciliation,requires_human_verification,eligible_for_automated_outreach"
      )
      // Stable ordering is required for correct offset pagination.
      .order("work_item_key", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Advisor queue unavailable: ${error.message}`);
    const batch = (data ?? []) as AdvisorReviewItem[];
    items.push(...batch);
    if (batch.length < PAGE_SIZE) return items;
  }

  // Fail explicitly instead of silently hiding client obligations.
  throw new Error("Advisor queue exceeded the 10,000-item safety limit");
}
