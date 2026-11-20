import test from "node:test";
import assert from "node:assert/strict";
import { buildAdvisorPromotionQueues } from "../src/lib/sales/advisor-promotion-queues.mjs";

const now = new Date("2026-11-20T17:00:00Z");
const base = {
  client: { id: "synthetic", lifecycle: "prospect", consent: "opt_in" },
  quote: { verified_client_id: "synthetic", departure_date: "2027-06-01", supplier: "Example Line", currency: "USD", occupancy_basis: "per_person_double", category: "balcony" },
  promotion: { official_source_url: "https://example.com/offer", valid_from: "2026-11-01", valid_through: "2026-11-30", inventory_verified_for_exact_sailing: true, departure_date: "2027-06-01", supplier: "Example Line", currency: "USD", occupancy_basis: "per_person_double", category: "balcony", taxes_fees_known: true }
};
const make = (lifecycle = "prospect", consent = "opt_in") => ({
  client: { ...base.client, lifecycle, consent },
  quote: { ...base.quote },
  promotion: { ...base.promotion }
});

test("separates prospects and booked repricing without authorizing outreach", () => {
  const queues = buildAdvisorPromotionQueues([make("booked"), make("prospect")], { now });
  assert.deepEqual(queues.prospect_review.map(x => x.index), [1]);
  assert.deepEqual(queues.service_reprice.map(x => x.index), [0]);
  assert.equal(queues.verification_holds.length, 0);
  assert.ok([...queues.prospect_review, ...queues.service_reprice].every(x => x.review_only && !x.eligibility.outreach_allowed));
});
test("contact-restricted opportunities stay in holds, not sales or repricing", () => {
  const queues = buildAdvisorPromotionQueues([make("booked", "opt_out"), make("prospect", "unknown")], { now });
  assert.equal(queues.prospect_review.length, 0);
  assert.equal(queues.service_reprice.length, 0);
  assert.deepEqual(queues.verification_holds.map(x => x.eligibility.decision), ["NO_OUTREACH", "NO_OUTREACH"]);
});
test("unverified inventory remains a hold", () => {
  const item = make();
  item.promotion.inventory_verified_for_exact_sailing = false;
  const queues = buildAdvisorPromotionQueues([item], { now });
  assert.equal(queues.verification_holds[0].eligibility.decision, "VERIFY_SUPPLIER");
});
test("empty input produces empty queues", () => {
  assert.deepEqual(buildAdvisorPromotionQueues([], { now }), { prospect_review: [], service_reprice: [], verification_holds: [] });
});
test("invalid input fails closed", () => {
  assert.throws(() => buildAdvisorPromotionQueues(null, { now }), TypeError);
});
