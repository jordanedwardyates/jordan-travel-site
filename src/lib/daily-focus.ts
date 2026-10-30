/**
 * Deterministic, read-only daily review priorities.
 * Never infer that a booking is confirmed or a task remains outstanding.
 * The review queue is a list of signals, not permission to contact clients.
 */
export type DailyFocusSource = {
  work_item_key: string;
  review_lane: string;
  sail_date: string | null;
};

export type DailyFocus<T extends DailyFocusSource> = {
  holdsToVerify: T[];
  departuresWithin14Days: T[];
  departures15To45Days: T[];
  serviceWithoutDepartureDate: T[];
};

function dateOrdinal(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const timestamp = Date.parse(iso + "T00:00:00Z");
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== iso) {
    return null;
  }
  return Math.floor(timestamp / 86400000);
}

/** The advisor works in Eastern Time; UTC date can be tomorrow during the evening. */
export function easternDateISO(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function buildDailyFocus<T extends DailyFocusSource>(
  items: readonly T[],
  todayISO: string
): DailyFocus<T> {
  const today = dateOrdinal(todayISO);
  if (today === null) throw new Error("Daily focus requires a valid ISO calendar date");

  const focus: DailyFocus<T> = {
    holdsToVerify: [],
    departuresWithin14Days: [],
    departures15To45Days: [],
    serviceWithoutDepartureDate: [],
  };

  for (const item of items) {
    if (item.review_lane === "reservation_hold_verification") {
      focus.holdsToVerify.push(item);
      continue;
    }
    if (item.review_lane !== "booking_service_verification") continue;

    const sailDay = item.sail_date ? dateOrdinal(item.sail_date.slice(0, 10)) : null;
    if (sailDay === null) {
      focus.serviceWithoutDepartureDate.push(item);
      continue;
    }
    const daysUntilSailing = sailDay - today;
    // Past departures are not future service priorities.
    if (daysUntilSailing < 0 || daysUntilSailing > 45) continue;
    if (daysUntilSailing <= 14) {
      focus.departuresWithin14Days.push(item);
    } else {
      focus.departures15To45Days.push(item);
    }
  }

  const bySailing = (a: T, b: T) =>
    (a.sail_date ?? "").localeCompare(b.sail_date ?? "") ||
    a.work_item_key.localeCompare(b.work_item_key);
  focus.departuresWithin14Days.sort(bySailing);
  focus.departures15To45Days.sort(bySailing);
  focus.holdsToVerify.sort((a, b) => a.work_item_key.localeCompare(b.work_item_key));
  focus.serviceWithoutDepartureDate.sort((a, b) => a.work_item_key.localeCompare(b.work_item_key));
  return focus;
}
