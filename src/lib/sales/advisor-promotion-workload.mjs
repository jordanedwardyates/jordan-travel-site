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

const WORKLOAD_KEYS = ["prospect_review", "service_reprice", "verification_holds"];

/**
 * Compare two aggregated snapshots, never individual client records.
 * A delta is workload movement, not a count of new leads or permission to outreach.
 */
export function compareAdvisorWorkloadSnapshots(previous, current) {
  for (const snapshot of [previous, current]) {
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
      throw new TypeError("Expected aggregated workload snapshots");
    }
    for (const key of [...WORKLOAD_KEYS, "total"]) {
      if (!Number.isSafeInteger(snapshot[key]) || snapshot[key] < 0) {
        throw new TypeError("Invalid workload count");
      }
    }
    if (snapshot.total !== WORKLOAD_KEYS.reduce((sum, key) => sum + snapshot[key], 0)) {
      throw new TypeError("Inconsistent workload total");
    }
    if (snapshot.outreach_authorized !== false || snapshot.live_supplier_pricing_verified !== false) {
      throw new TypeError("Unsafe workload snapshot");
    }
  }
  return {
    prospect_review_delta: current.prospect_review - previous.prospect_review,
    service_reprice_delta: current.service_reprice - previous.service_reprice,
    verification_holds_delta: current.verification_holds - previous.verification_holds,
    total_delta: current.total - previous.total,
    outreach_authorized: false,
    live_supplier_pricing_verified: false
  };
}
