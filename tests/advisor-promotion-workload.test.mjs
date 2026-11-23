import test from "node:test";
import assert from "node:assert/strict";
import { summarizeAdvisorPromotionWorkload, compareAdvisorWorkloadSnapshots } from "../src/lib/sales/advisor-promotion-workload.mjs";

const now = new Date("2026-11-21T17:00:00Z");
function candidate(lifecycle = "prospect", consent = "opt_in") {
  return {
    client: { id: "synthetic", lifecycle, consent },
    quote: { verified_client_id: "synthetic", departure_date: "2027-06-01", supplier: "Example Line", currency: "USD", occupancy_basis: "per_person_double", category: "balcony" },
    promotion: { official_source_url: "https://example.com/offer", valid_from: "2026-11-01", valid_through: "2026-11-30", inventory_verified_for_exact_sailing: true, departure_date: "2027-06-01", supplier: "Example Line", currency: "USD", occupancy_basis: "per_person_double", category: "balcony", taxes_fees_known: true }
  };
}
test("summarizes prospect, booked, and held work without client details", () => {
  const result = summarizeAdvisorPromotionWorkload([candidate(), candidate("booked"), candidate("prospect", "opt_out")], { now });
  assert.deepEqual(result, { prospect_review: 1, service_reprice: 1, verification_holds: 1, total: 3, outreach_authorized: false, live_supplier_pricing_verified: false });
  assert.equal(JSON.stringify(result).includes("synthetic"), false);
});
test("empty input returns zero counts and no outreach authorization", () => {
  assert.deepEqual(summarizeAdvisorPromotionWorkload([], { now }), { prospect_review: 0, service_reprice: 0, verification_holds: 0, total: 0, outreach_authorized: false, live_supplier_pricing_verified: false });
});
test("invalid input fails closed", () => {
  assert.throws(() => summarizeAdvisorPromotionWorkload(null, { now }), TypeError);
});

test("compares two daily workloads without exposing identities", () => {
  const previous = summarizeAdvisorPromotionWorkload([candidate(), candidate("booked")], { now });
  const current = summarizeAdvisorPromotionWorkload([candidate(), candidate("prospect", "opt_out"), candidate("prospect", "opt_out")], { now });
  assert.deepEqual(compareAdvisorWorkloadSnapshots(previous, current), {
    prospect_review_delta: 0, service_reprice_delta: -1, verification_holds_delta: 2,
    total_delta: 1, outreach_authorized: false, live_supplier_pricing_verified: false
  });
});
test("rejects inconsistent and unsafe workload snapshots", () => {
  const safe = summarizeAdvisorPromotionWorkload([], { now });
  assert.throws(() => compareAdvisorWorkloadSnapshots({ ...safe, total: 1 }, safe), TypeError);
  assert.throws(() => compareAdvisorWorkloadSnapshots(safe, { ...safe, outreach_authorized: true }), TypeError);
  assert.throws(() => compareAdvisorWorkloadSnapshots(safe, { ...safe, prospect_review: -1, total: -1 }), TypeError);
  assert.throws(() => compareAdvisorWorkloadSnapshots(null, safe), TypeError);
});
