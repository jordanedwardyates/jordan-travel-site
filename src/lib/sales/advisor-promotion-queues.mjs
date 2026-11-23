import { rankPromotionCandidates } from "./promotion-review-ranking.mjs";

/**
 * Read-only advisor work queues. No outreach authorization or price claims.
 * Preserve source candidate indexes so the caller can retrieve records securely.
 * Booked clients are never mixed into prospect sales outreach review.
 */
export function buildAdvisorPromotionQueues(candidates, options = {}) {
  const ranked = rankPromotionCandidates(candidates, options);
  const queues = { prospect_review: [], service_reprice: [], verification_holds: [] };
  for (const item of ranked) {
    if (item.eligibility.decision === "ADVISOR_REVIEW") {
      if (item.eligibility.lane === "service_reprice") queues.service_reprice.push(item);
      else queues.prospect_review.push(item);
    } else {
      queues.verification_holds.push(item);
    }
  }
  return queues;
}
