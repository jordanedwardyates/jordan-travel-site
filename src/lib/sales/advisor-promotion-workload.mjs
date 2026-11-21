import { buildAdvisorPromotionQueues } from "./advisor-promotion-queues.mjs";

/**
 * Aggregate advisor workload without exposing client identity, quotes or fares.
 * Read-only and advisory: counts never imply permission to contact a client.
 */
export function summarizeAdvisorPromotionWorkload(candidates, options = {}) {
  const queues = buildAdvisorPromotionQueues(candidates, options);
  const counts = {
    prospect_review: queues.prospect_review.length,
    service_reprice: queues.service_reprice.length,
    verification_holds: queues.verification_holds.length
  };
  return {
    ...counts,
    total: counts.prospect_review + counts.service_reprice + counts.verification_holds,
    outreach_authorized: false,
    live_supplier_pricing_verified: false
  };
}
