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

/** "2026-07-13T18:22:00Z" → "13 Jul 2026". Date-only strings pass through. */
export function formatDay(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}`;
}
