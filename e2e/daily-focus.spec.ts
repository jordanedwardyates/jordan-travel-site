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
