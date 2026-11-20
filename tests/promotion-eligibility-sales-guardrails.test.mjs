import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePromotionEligibility } from "../src/lib/sales/promotion-eligibility.mjs";

// Synthetic evidence only. A match is a review candidate, never permission to contact.
const now = new Date("2026-11-16T17:00:00Z");
const client = { id: "synthetic-client", lifecycle: "prospect", consent: "opt_in", cooldown_active: false };
const quote = { verified_client_id: "synthetic-client", departure_date: "2027-05-20", supplier: "Example Cruise Line", currency: "USD", occupancy_basis: "per_person_double", category: "veranda" };
const promotion = { official_source_url: "https://example.com/offer", valid_from: "2026-11-01", valid_through: "2026-11-30", inventory_verified_for_exact_sailing: true, departure_date: "2027-05-20", supplier: "Example Cruise Line", currency: "USD", occupancy_basis: "per_person_double", category: "veranda", taxes_fees_known: true };
const evaluate = (c = {}, q = {}, p = {}) => evaluatePromotionEligibility({
  client: { ...client, ...c }, quote: { ...quote, ...q }, promotion: { ...promotion, ...p }, now
});

test("unknown contact consent suppresses outreach even with valid evidence", () => {
  const result = evaluate({ consent: null });
  assert.equal(result.decision, "NO_OUTREACH");
  assert.equal(result.outreach_allowed, false);
});
test("contact opt-out overrides a fully comparable offer", () => {
  const result = evaluate({ consent: "opt_out" });
  assert.equal(result.decision, "NO_OUTREACH");
  assert.equal(result.score, null);
});
test("Canadian-dollar quote cannot be compared to US-dollar offer", () => {
  assert.equal(evaluate({}, { currency: "CAD" }).decision, "HOLD_COMPARABILITY");
});
test("veranda quote cannot silently match an oceanview offer", () => {
  assert.equal(evaluate({}, {}, { category: "oceanview" }).decision, "HOLD_COMPARABILITY");
});
test("total-cabin pricing cannot silently match per-person double occupancy", () => {
  assert.equal(evaluate({}, {}, { occupancy_basis: "per_cabin" }).decision, "HOLD_COMPARABILITY");
});
test("unknown taxes and fees prevent a comparable-fare recommendation", () => {
  assert.equal(evaluate({}, {}, { taxes_fees_known: null }).decision, "HOLD_COMPARABILITY");
});
test("booked guest with valid promotion remains in service review, not prospect outreach", () => {
  const result = evaluate({ lifecycle: "booked" });
  assert.equal(result.decision, "ADVISOR_REVIEW");
  assert.equal(result.lane, "service_reprice");
  assert.equal(result.outreach_allowed, false);
});
