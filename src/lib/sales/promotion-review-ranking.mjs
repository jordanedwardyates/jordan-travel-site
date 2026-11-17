import { evaluatePromotionEligibility } from "./promotion-eligibility.mjs";

/**
 * Rank verified, comparable promotion candidates for human review only.
 * All input is caller-supplied; no database access, outreach or pricing claims.
 * Scores are relative triage priorities, NOT savings estimates.
 */
export function rankPromotionCandidates(candidates, { now = new Date() } = {}) {
  if (!Array.isArray(candidates)) throw new TypeError("candidates must be an array");
  return candidates.map((candidate, index) => {
    const { client, quote, promotion } = candidate ?? {};
    const eligibility = evaluatePromotionEligibility({ client, quote, promotion, now });
    if (eligibility.decision !== "ADVISOR_REVIEW") {
      return { index, eligibility, priority_score: null, priority_factors: [], review_only: true };
    }
    const factors = [];
    let score = 0;
    // Exact sailing, supplier and accommodation have already been checked by eligibility.
    score += 50;
    factors.push("Exact sailing, supplier and accommodation verified: +50");
    if (quote?.preferred_supplier && quote.preferred_supplier === promotion.supplier) {
      score += 15;
      factors.push("Client's recorded supplier preference: +15");
    }
    if (quote?.preferred_category && quote.preferred_category === promotion.category) {
      score += 15;
      factors.push("Client's recorded accommodation preference: +15");
    }
    const deadline = promotion.valid_through;
    // Only timestamp deadlines with explicit timezone can be ranked by urgency.
    if (typeof deadline === "string" && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(deadline)) {
      const remaining = Date.parse(deadline) - new Date(now).getTime();
      if (Number.isFinite(remaining) && remaining >= 0 && remaining <= 72 * 3600000) {
        score += 20;
        factors.push("Verified deadline within 72 hours: +20");
      }
    }
    return { index, eligibility, priority_score: score, priority_factors: factors, review_only: true };
  }).sort((a, b) => (b.priority_score ?? -1) - (a.priority_score ?? -1) || a.index - b.index);
}
