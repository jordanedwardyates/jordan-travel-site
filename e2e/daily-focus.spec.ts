import { expect, test } from "@playwright/test";
import { buildDailyFocus, easternDateISO } from "../src/lib/daily-focus";

const item = (key: string, lane: string, sail: string | null) => ({
  work_item_key: key, review_lane: lane, sail_date: sail,
});

test("Eastern office date does not roll over at 8:30 PM ET", () => {
  expect(easternDateISO(new Date("2026-10-31T00:30:00Z"))).toBe("2026-10-30");
});

test("booking-service departure windows are inclusive and ordered", () => {
  const focus = buildDailyFocus([
    item("b", "booking_service_verification", "2026-11-14"),
    item("a", "booking_service_verification", "2026-10-30"),
    item("c", "booking_service_verification", "2026-12-14"),
    item("d", "booking_service_verification", "2026-11-13"),
    item("e", "booking_service_verification", "2026-12-15"),
  ], "2026-10-30");
  expect(focus.departuresWithin14Days.map(x => x.work_item_key)).toEqual(["a", "d"]);
  expect(focus.departures15To45Days.map(x => x.work_item_key)).toEqual(["b", "c"]);
});

test("holds are verification tasks regardless of distant sailing dates", () => {
  const focus = buildDailyFocus([
    item("hold", "reservation_hold_verification", "2028-05-30"),
    item("sales", "sales_followup_verification", "2026-10-31"),
  ], "2026-10-30");
  expect(focus.holdsToVerify.map(x => x.work_item_key)).toEqual(["hold"]);
  expect(focus.departuresWithin14Days).toHaveLength(0);
});

test("missing and invalid service dates remain visible for data review", () => {
  const focus = buildDailyFocus([
    item("missing", "booking_service_verification", null),
    item("invalid", "booking_service_verification", "2026-02-30"),
    item("past", "booking_service_verification", "2026-10-29"),
  ], "2026-10-30");
  expect(focus.serviceWithoutDepartureDate.map(x => x.work_item_key)).toEqual(["invalid", "missing"]);
  expect(focus.departuresWithin14Days).toHaveLength(0);
});

test("invalid as-of date fails instead of producing misleading priorities", () => {
  expect(() => buildDailyFocus([], "2026-02-30")).toThrow();
});

test("recent intake reviews are visible but separate from booking-service priorities", () => {
  const focus = buildDailyFocus([
    { ...item("today", "quote_queue_review", null), source_stage: "review_intake", source_review_date: "2026-10-31" },
    { ...item("week", "quote_queue_review", null), source_stage: "review_intake", source_review_date: "2026-10-24" },
    { ...item("old", "quote_queue_review", null), source_stage: "review_intake", source_review_date: "2026-10-23" },
    { ...item("reactivate", "quote_queue_review", null), source_stage: "reactivate_quote", source_review_date: "2026-10-31" },
    { ...item("future", "quote_queue_review", null), source_stage: "review_intake", source_review_date: "2026-11-01" },
    { ...item("invalid", "quote_queue_review", null), source_stage: "review_intake", source_review_date: "2026-02-30" },
    { ...item("sales", "sales_followup_verification", "2026-11-01"), source_stage: "review_intake", source_review_date: "2026-10-31" },
  ], "2026-10-31");
  expect(focus.recentIntakeReviews.map(x => x.work_item_key)).toEqual(["today", "week"]);
  expect(focus.departuresWithin14Days).toHaveLength(0);
  expect(focus.serviceWithoutDepartureDate).toHaveLength(0);
});

test("intake review dates sort newest first and never authorize outreach", () => {
  const focus = buildDailyFocus([
    { ...item("b", "quote_queue_review", null), source_stage: "review_intake", source_review_date: "2026-10-30" },
    { ...item("a", "quote_queue_review", null), source_stage: "review_intake", source_review_date: "2026-10-30" },
    { ...item("c", "quote_queue_review", null), source_stage: "review_intake", source_review_date: "2026-10-31" },
  ], "2026-10-31");
  expect(focus.recentIntakeReviews.map(x => x.work_item_key)).toEqual(["c", "a", "b"]);
  expect(focus.holdsToVerify).toHaveLength(0);
});


test("Eastern review date remains correct across the November daylight-saving fallback", () => {
  // 01:30 occurs twice, first in EDT and then in EST.
  expect(easternDateISO(new Date("2026-11-01T05:30:00Z"))).toBe("2026-11-01");
  expect(easternDateISO(new Date("2026-11-01T06:30:00Z"))).toBe("2026-11-01");
  // 23:30 Eastern is already November 2 in UTC.
  expect(easternDateISO(new Date("2026-11-02T04:30:00Z"))).toBe("2026-11-01");
});

test("proposed sales departures remain separate from booking-service departures at boundaries", () => {
  const focus = buildDailyFocus([
    item("same-day-lead", "sales_followup_verification", "2026-11-04"),
    item("45-day-lead", "sales_followup_verification", "2026-12-19"),
    item("46-day-lead", "sales_followup_verification", "2026-12-20"),
    item("past-lead", "sales_followup_verification", "2026-11-03"),
    item("missing-lead", "sales_followup_verification", null),
    item("service", "booking_service_verification", "2026-11-04"),
  ], "2026-11-04");
  expect(focus.proposedDeparturesWithin45Days.map(x => x.work_item_key)).toEqual(["same-day-lead", "45-day-lead"]);
  expect(focus.departuresWithin14Days.map(x => x.work_item_key)).toEqual(["service"]);
  expect(focus.departures15To45Days).toHaveLength(0);
  expect(focus.serviceWithoutDepartureDate).toHaveLength(0);
});
