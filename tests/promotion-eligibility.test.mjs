import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePromotionEligibility as evaluate } from "../src/lib/sales/promotion-eligibility.mjs";
const now = new Date("2026-11-08T12:00:00Z");
const client = { id:"synthetic-1", lifecycle:"prospect", consent:"opt_in" };
const quote = { verified_client_id:"synthetic-1", departure_date:"2027-05-20", supplier:"Example Line", currency:"USD", occupancy_basis:"per_person_double", category:"balcony" };
const promotion = { official_source_url:"https://example.com/offer", valid_from:"2026-11-01", valid_through:"2026-11-30", inventory_verified_for_exact_sailing:true, departure_date:"2027-05-20", supplier:"Example Line", currency:"USD", occupancy_basis:"per_person_double", category:"balcony", taxes_fees_known:true };
const run = (c={},q={},p={}) => evaluate({client:{...client,...c},quote:{...quote,...q},promotion:{...promotion,...p},now});
test("eligible evidence still never authorizes outreach",()=>{ const r=run(); assert.equal(r.decision,"ADVISOR_REVIEW"); assert.equal(r.outreach_allowed,false); });
test("booked passenger goes to repricing lane",()=>assert.equal(run({lifecycle:"booked"}).lane,"service_reprice"));
test("identity mismatch blocks",()=>assert.equal(run({}, {verified_client_id:"other"}).decision,"HOLD_IDENTITY"));
test("unknown lifecycle blocks",()=>assert.equal(run({lifecycle:"unknown"}).decision,"HOLD_LIFECYCLE"));
test("missing official source blocks",()=>assert.equal(run({}, {}, {official_source_url:null}).decision,"HOLD_SOURCE"));
test("expired promotion needs verification",()=>assert.equal(run({}, {}, {valid_through:"2026-11-07"}).decision,"VERIFY_SUPPLIER"));
test("unverified inventory needs verification",()=>assert.equal(run({}, {}, {inventory_verified_for_exact_sailing:false}).decision,"VERIFY_SUPPLIER"));
test("departed voyage rejected",()=>assert.equal(run({}, {departure_date:"2026-01-01"}, {departure_date:"2026-01-01"}).decision,"REJECT_VOYAGE"));
test("different departure rejected",()=>assert.equal(run({}, {}, {departure_date:"2027-05-21"}).decision,"REJECT_VOYAGE"));
test("fare basis mismatch held",()=>assert.equal(run({}, {}, {occupancy_basis:"total"}).decision,"HOLD_COMPARABILITY"));
test("unknown taxes held",()=>assert.equal(run({}, {}, {taxes_fees_known:false}).decision,"HOLD_COMPARABILITY"));
test("opt-out blocks",()=>assert.equal(run({consent:"opt_out"}).decision,"NO_OUTREACH"));
test("cooldown blocks",()=>assert.equal(run({cooldown_active:true}).decision,"NO_OUTREACH"));

test("date-only promotion remains valid through its final UTC day",()=>{
  const r=evaluate({client,quote,promotion:{...promotion,valid_through:"2026-11-08"},now:new Date("2026-11-08T23:30:00Z")});
  assert.equal(r.decision,"ADVISOR_REVIEW");
});
test("date-only promotion expires at start of following UTC day",()=>{
  const r=evaluate({client,quote,promotion:{...promotion,valid_through:"2026-11-08"},now:new Date("2026-11-09T00:00:00Z")});
  assert.equal(r.decision,"VERIFY_SUPPLIER");
});
test("explicit timestamp expiry is not extended to end of day",()=>{
  const r=evaluate({client,quote,promotion:{...promotion,valid_through:"2026-11-08T15:00:00Z"},now:new Date("2026-11-08T15:00:01Z")});
  assert.equal(r.decision,"VERIFY_SUPPLIER");
});

test("same-day departure remains eligible for advisor review",()=>{
  const today = new Date("2026-11-10T18:00:00Z");
  const r=evaluate({client,quote:{...quote,departure_date:"2026-11-10"},promotion:{...promotion,departure_date:"2026-11-10"},now:today});
  assert.equal(r.decision,"ADVISOR_REVIEW");
  assert.equal(r.outreach_allowed,false);
});
test("yesterday's departure is rejected",()=>{
  const r=evaluate({client,quote:{...quote,departure_date:"2026-11-09"},promotion:{...promotion,departure_date:"2026-11-09"},now:new Date("2026-11-10T00:01:00Z")});
  assert.equal(r.decision,"REJECT_VOYAGE");
});
test("invalid calendar departure date is rejected",()=>{
  const r=evaluate({client,quote:{...quote,departure_date:"2027-02-30"},promotion:{...promotion,departure_date:"2027-02-30"},now});
  assert.equal(r.decision,"REJECT_VOYAGE");
});

test("missing quote supplier blocks exact voyage matching",()=>assert.equal(run({}, {supplier:null}).decision,"REJECT_VOYAGE"));
test("missing promotion supplier blocks exact voyage matching",()=>assert.equal(run({}, {}, {supplier:null}).decision,"REJECT_VOYAGE"));
test("invalid promotion calendar date is held",()=>assert.equal(run({}, {}, {valid_through:"2026-11-31"}).decision,"HOLD_SOURCE"));
test("ambiguous timestamp without timezone is held",()=>assert.equal(run({}, {}, {valid_through:"2026-11-08T15:00:00"}).decision,"HOLD_SOURCE"));
test("timestamp with explicit offset is accepted",()=>{
  const r=evaluate({client,quote,promotion:{...promotion,valid_through:"2026-11-08T08:00:00-05:00"},now:new Date("2026-11-08T12:00:00Z")});
  assert.equal(r.decision,"ADVISOR_REVIEW");
});
