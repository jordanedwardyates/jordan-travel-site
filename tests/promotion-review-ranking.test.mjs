import test from "node:test";
import assert from "node:assert/strict";
import { rankPromotionCandidates } from "../src/lib/sales/promotion-review-ranking.mjs";

const now = new Date("2026-11-17T12:00:00Z");
const client = { id: "synthetic", lifecycle: "prospect", consent: "opt_in" };
const quote = { verified_client_id: "synthetic", departure_date: "2027-05-20", supplier: "Example Line", currency: "USD", occupancy_basis: "per_person_double", category: "balcony" };
const promotion = { official_source_url: "https://example.com/offer", valid_from: "2026-11-01", valid_through: "2026-11-30", inventory_verified_for_exact_sailing: true, departure_date: "2027-05-20", supplier: "Example Line", currency: "USD", occupancy_basis: "per_person_double", category: "balcony", taxes_fees_known: true };
const candidate = (c = {}, q = {}, p = {}) => ({ client: { ...client, ...c }, quote: { ...quote, ...q }, promotion: { ...promotion, ...p } });
const rank = (...items) => rankPromotionCandidates(items, { now });

test("baseline eligible candidate is advisor-only and scores 50", () => {
  const [r] = rank(candidate());
  assert.equal(r.priority_score, 50);
  assert.equal(r.eligibility.outreach_allowed, false);
  assert.equal(r.review_only, true);
});
test("preferences increase priority without inventing monetary savings", () => {
  const [r] = rank(candidate({}, { preferred_supplier: "Example Line", preferred_category: "balcony" }));
  assert.equal(r.priority_score, 80);
});
test("explicit near-term deadline increases priority", () => {
  const [r] = rank(candidate({}, {}, { valid_through: "2026-11-19T12:00:00Z" }));
  assert.equal(r.priority_score, 70);
});
test("date-only deadline never receives speculative urgency points", () => {
  assert.equal(rank(candidate({}, {}, { valid_through: "2026-11-19" }))[0].priority_score, 50);
});
test("opted-out clients are unranked", () => {
  const [r] = rank(candidate({ consent: "opt_out" }));
  assert.equal(r.priority_score, null);
  assert.equal(r.eligibility.decision, "NO_OUTREACH");
});
test("unverified inventory is unranked", () => {
  assert.equal(rank(candidate({}, {}, { inventory_verified_for_exact_sailing: false }))[0].priority_score, null);
});
test("ranking is descending and stable on ties", () => {
  const results = rank(candidate(), candidate({}, { preferred_supplier: "Example Line" }), candidate());
  assert.deepEqual(results.map(r => r.index), [1, 0, 2]);
});
test("booked client stays in service lane without outreach", () => {
  const [r] = rank(candidate({ lifecycle: "booked" }));
  assert.equal(r.eligibility.lane, "service_reprice");
  assert.equal(r.eligibility.outreach_allowed, false);
});
test("non-array input is rejected", () => {
  assert.throws(() => rankPromotionCandidates(null), TypeError);
});
