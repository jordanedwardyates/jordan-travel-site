/**
 * Pure voyage formatters — no Supabase, no server-only imports.
 *
 * These live apart from curation.ts on purpose: curation.ts imports the
 * service-role client at module scope, so anything a Client Component needs
 * has to sit outside it or the admin key's module graph follows the import
 * into the browser bundle. The dossier builder runs in the browser, so it
 * reads its formatters from here.
 *
 * curation.ts re-exports formatDateRange and derivePortCount so existing
 * server callers keep their import path.
 */

const MONTH = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-10-03" + "2026-10-10" → "3–10 Oct 2026"; cross-month keeps both. */
export function formatDateRange(
  start: string | null,
  end: string | null
): string {
  if (!start) return "";
  const s = new Date(`${start}T00:00:00`);
  if (!end) return `${s.getDate()} ${MONTH[s.getMonth()]} ${s.getFullYear()}`;
  const e = new Date(`${end}T00:00:00`);
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()}–${e.getDate()} ${MONTH[s.getMonth()]} ${s.getFullYear()}`;
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  const left = `${s.getDate()} ${MONTH[s.getMonth()]}${sameYear ? "" : ` ${s.getFullYear()}`}`;
  return `${left}–${e.getDate()} ${MONTH[e.getMonth()]} ${e.getFullYear()}`;
}

/** 2749 → "$2,749". Nulls render as an em dash upstream, never "$0". */
export const money = (n: number | null) =>
  n === null || n === undefined ? null : `$${Number(n).toLocaleString("en-US")}`;

/** "Trieste, Italy" → "Trieste" — route titles read better without the country. */
export const shortPort = (p: string | null) => (p ?? "").split(",")[0].trim();

/**
 * "Rome (Civitavecchia), Naples, Messina." → 10. Best-effort only: the
 * summary is free text, so an unparseable one yields null and the card
 * simply omits its route strip rather than inventing a number.
 */
export function derivePortCount(summary: string | null): number | null {
  if (!summary) return null;
  const stops = summary
    .replace(/\.\s*$/, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return stops.length >= 2 && stops.length <= 60 ? stops.length : null;
}

/** Strip the trailing "(Rome to Barcelona)" — routeTitle already says it. */
export const cleanTitle = (t: string) =>
  t.replace(/\s*\([^)]*\bto\b[^)]*\)\s*$/i, "").trim();

/**
 * How close to departure a sailing stops being worth quoting. Inventory and
 * final payment have closed by then, so a quote against it is dead paper.
 */
export const SAILING_CUTOFF_DAYS = 12;

export type SailingWindow =
  /** Already departed. */
  | "sailed"
  /** Departs inside the cutoff — too late to sell. */
  | "closing"
  /** Still sellable. */
  | "open"
  /** No embarkation date recorded. Unknown is NOT past: a sailing whose date
   *  was given as a range must stay visible rather than be quietly retired. */
  | "undated";

/**
 * Which side of the cutoff a sailing sits on, derived from its date every
 * time it is asked. Deliberately not stored: a column would need a cron to
 * stay true and could drift out of sync with the calendar, whereas this
 * cannot be wrong and needs no job.
 */
export function sailingWindow(
  embarkationDate: string | null,
  now: Date = new Date(),
  cutoffDays: number = SAILING_CUTOFF_DAYS
): SailingWindow {
  const days = daysUntilDeparture(embarkationDate, now);
  if (days === null) return "undated";
  if (days < 0) return "sailed";
  return days < cutoffDays ? "closing" : "open";
}

/** Whole days from today to departure. Negative once it has sailed. */
export function daysUntilDeparture(
  embarkationDate: string | null,
  now: Date = new Date()
): number | null {
  if (!embarkationDate) return null;
  const dep = new Date(`${embarkationDate}T00:00:00`);
  if (Number.isNaN(dep.getTime())) return null;
  // Both ends at local midnight, so the difference is clean whole days.
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((dep.getTime() - today.getTime()) / 86_400_000);
}

/** True for sailings past the point of being quotable. Undated never is. */
export const isPastCutoff = (
  embarkationDate: string | null,
  now: Date = new Date()
): boolean => {
  const w = sailingWindow(embarkationDate, now);
  return w === "sailed" || w === "closing";
};

/** "2026-07-13T18:22:00Z" → "13 Jul 2026". Date-only strings pass through. */
export function formatDay(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}`;
}
