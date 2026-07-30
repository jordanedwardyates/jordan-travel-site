"use client";

import { useMemo, useState } from "react";

import type { CuratedVoyage } from "@/lib/data/curation";
import { buildDossier } from "@/lib/data/dossier";
import {
  SAILING_CUTOFF_DAYS,
  formatDateRange,
  isPastCutoff,
  sailingWindow,
} from "@/lib/data/voyage-format";

/**
 * Pick sailings → get a markdown dossier to paste into a drafting session.
 *
 * Client-side on purpose: the whole list is already on the page, so building
 * the text is instant and needs no server action (and therefore no token
 * re-check). Nothing here writes — it is a read-and-copy surface only.
 *
 * Selection order is preserved rather than sorted, because the first sailing
 * picked is usually the one the draft is actually about.
 */
export default function DossierPicker({ voyages }: { voyages: CuratedVoyage[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [includeInternalNotes, setIncludeInternalNotes] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  // Computed once per render rather than per row, so every sailing is judged
  // against the same moment.
  const now = useMemo(() => new Date(), []);

  const byDate = useMemo(
    () =>
      [...voyages].sort((a, b) =>
        (a.embarkationDate ?? "9999").localeCompare(b.embarkationDate ?? "9999")
      ),
    [voyages]
  );

  // Departed sailings and ones inside the booking window are dropped from the
  // list AND from what the filter searches — an unsellable sailing surfacing
  // on a port match is just noise. Kept behind a toggle, never deleted.
  const pastCount = useMemo(
    () => byDate.filter((v) => isPastCutoff(v.embarkationDate, now)).length,
    [byDate, now]
  );

  const inWindow = useMemo(
    () =>
      showPast
        ? byDate
        : byDate.filter((v) => !isPastCutoff(v.embarkationDate, now)),
    [byDate, showPast, now]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inWindow;
    return inWindow.filter((v) =>
      [
        v.cruiseLine,
        v.ship,
        v.officialVoyageTitle,
        v.voyageCode,
        v.embarkPort,
        v.disembarkPort,
        v.embarkationDate,
        v.itinerarySummary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [inWindow, query]);

  const chosen = useMemo(
    () =>
      selected
        .map((id) => voyages.find((v) => v.id === id))
        .filter((v): v is CuratedVoyage => Boolean(v)),
    [selected, voyages]
  );

  const markdown = useMemo(
    () => buildDossier(chosen, { includeInternalNotes }),
    [chosen, includeInternalNotes]
  );

  const toggle = (id: string) => {
    setCopied("idle");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  };

  return (
    <section className="mt-10 border border-salt-air bg-linen/40 px-6 py-6 sm:px-8">
      <p className="text-[0.6rem] uppercase tracking-[0.25em] text-compass-gold">
        Hand off to a draft
      </p>
      <h2 className="mt-1 font-serif text-2xl tracking-tight text-deep-harbor">
        Copy what you already know
      </h2>
      <p className="mt-1.5 max-w-2xl font-serif text-sm text-aegean-ink">
        Tick the sailings you want, then copy the markdown at the bottom into
        whatever you&rsquo;re drafting with. It carries the itinerary, your
        notes, every fare on file, the cruise line&rsquo;s routing page and any
        saved image. Nothing here changes what&rsquo;s public.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by ship, line, port, title…"
          className="min-w-0 flex-1 border border-salt-air bg-vintage-passport px-3 py-2 text-[0.8rem] text-deep-harbor placeholder:text-aegean-ink/40 focus:border-aegean-ink/50 focus:outline-none"
        />
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelected([]);
              setCopied("idle");
            }}
            className="border border-salt-air px-3 py-2 text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink/70 hover:border-aegean-ink/50"
          >
            Clear {selected.length}
          </button>
        )}
      </div>

      <ul className="mt-4 max-h-80 overflow-y-auto border border-salt-air bg-vintage-passport">
        {shown.length === 0 ? (
          <li className="px-4 py-6 text-center text-[0.8rem] italic text-aegean-ink/60">
            {query.trim()
              ? `Nothing matches “${query}”.`
              : "Every sailing on file has departed — tick the box below to see them."}
          </li>
        ) : (
          shown.map((v) => {
            const isOn = selected.includes(v.id);
            const fares = v.offers.length;
            // Not named `window` — that shadows the global inside this callback.
            const sailWindow = sailingWindow(v.embarkationDate, now);
            return (
              <li key={v.id} className="border-b border-salt-air/50 last:border-b-0">
                <label
                  className={`flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors hover:bg-linen/60 ${
                    isOn ? "bg-compass-gold/10" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => toggle(v.id)}
                    className="mt-1 accent-compass-gold"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.85rem] text-deep-harbor">
                      {v.officialVoyageTitle}
                    </span>
                    <span className="block text-[0.68rem] text-aegean-ink/70 oldstyle-nums">
                      {v.cruiseLine} · {v.ship} ·{" "}
                      {formatDateRange(v.embarkationDate, v.disembarkationDate) ||
                        "dates TBD"}
                      {v.nights ? ` · ${v.nights} nights` : ""} ·{" "}
                      {fares === 0 ? "no fares" : `${fares} fare${fares === 1 ? "" : "s"}`}
                    </span>
                  </span>
                  {(sailWindow === "sailed" || sailWindow === "closing") && (
                    <span className="mt-0.5 shrink-0 border border-compass-gold bg-compass-gold/10 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.15em] text-deep-harbor">
                      {sailWindow === "sailed" ? "departed" : "too late"}
                    </span>
                  )}
                  {v.sourceStatus !== "trusted" && (
                    <span className="mt-0.5 shrink-0 border border-salt-air px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.15em] text-sun-faded">
                      unverified
                    </span>
                  )}
                </label>
              </li>
            );
          })
        )}
      </ul>

      <div className="mt-3 flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-[0.7rem] text-aegean-ink/80">
          <input
            type="checkbox"
            checked={includeInternalNotes}
            onChange={(e) => {
              setIncludeInternalNotes(e.target.checked);
              setCopied("idle");
            }}
            className="accent-compass-gold"
          />
          Include my internal notes (marked in the text as never-quote context)
        </label>
        {pastCount > 0 && (
          <label className="flex items-center gap-2 text-[0.7rem] text-aegean-ink/80">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="accent-compass-gold"
            />
            Show {pastCount} sailing{pastCount === 1 ? "" : "s"} already gone —
            departed, or leaving within {SAILING_CUTOFF_DAYS} days
          </label>
        )}
      </div>

      {chosen.length === 0 ? (
        <p className="mt-5 border-t border-salt-air pt-4 text-[0.75rem] italic text-aegean-ink/60">
          Pick a sailing above and the markdown appears here.
        </p>
      ) : (
        <div className="mt-5 border-t border-salt-air pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-aegean-ink/70">
              {chosen.length} sailing{chosen.length === 1 ? "" : "s"} ·{" "}
              {markdown.length.toLocaleString("en-US")} characters
            </p>
            <div className="flex items-center gap-2">
              {copied === "ok" && (
                <span className="text-[0.65rem] uppercase tracking-[0.15em] text-compass-gold">
                  Copied ✓
                </span>
              )}
              {copied === "fail" && (
                <span className="text-[0.65rem] text-aegean-ink/70">
                  Couldn&rsquo;t copy — select the text below and press ⌘C
                </span>
              )}
              <button
                type="button"
                onClick={copy}
                className="border border-compass-gold bg-compass-gold/10 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-deep-harbor hover:bg-compass-gold/20"
              >
                Copy markdown
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={markdown}
            onFocus={(e) => e.currentTarget.select()}
            rows={16}
            spellCheck={false}
            className="mt-3 w-full border border-salt-air bg-vintage-passport px-3 py-2 font-mono text-[0.7rem] leading-relaxed text-deep-harbor focus:border-aegean-ink/50 focus:outline-none"
          />
        </div>
      )}
    </section>
  );
}
