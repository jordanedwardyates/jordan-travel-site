import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  listCuratedVoyages,
  blockersFor,
  formatDateRange,
  type CuratedVoyage,
  type CuratedOffer,
} from "@/lib/data/curation";
import {
  setVoyageWebsiteStatus,
  setVoyageTrusted,
  setOfferApproved,
  saveJordansTake,
  featureOnHomepage,
  unfeatureFromHomepage,
  snoozeReview,
} from "./actions";

/**
 * INTERNAL curation desk — every quoted sailing lands here automatically.
 * Nothing reaches the homepage until it is explicitly approved and
 * featured from this page. Token-gated outside development; noindexed.
 *
 * The three publish gates this page controls (each enforced again by an
 * RLS policy, so this UI is a convenience, not the actual lock):
 *   voyages.website_status        — allowed on the site at all
 *   price_offers.website_approved — this fare is safe to quote publicly
 *   homepage_features.active      — currently on the front page
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal — Quote Curation",
  robots: { index: false, follow: false },
};

const money = (n: number | null) =>
  n === null ? "—" : `$${n.toLocaleString("en-US")}`;

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso;
  return new Date(date).toLocaleDateString("en-US", { dateStyle: "medium" });
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-salt-air bg-linen/60 px-5 py-4">
      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-aegean-ink/70">{label}</p>
      <p className="mt-2 font-serif text-3xl text-deep-harbor oldstyle-nums">{value}</p>
      {hint && <p className="mt-1 text-[0.7rem] text-aegean-ink/60">{hint}</p>}
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "gold" | "ink" | "muted" | "warn" }) {
  const style = {
    gold: "border-compass-gold/60 text-compass-gold",
    ink: "border-aegean-ink/50 text-aegean-ink",
    muted: "border-salt-air text-sun-faded",
    warn: "border-compass-gold bg-compass-gold/10 text-deep-harbor",
  }[tone];
  return (
    <span className={`border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] ${style}`}>
      {children}
    </span>
  );
}

function OfferRow({ o, tokenField }: { o: CuratedOffer; tokenField: React.ReactNode }) {
  const publishable =
    o.sourceStatus === "trusted" &&
    o.myPrice !== null &&
    ["available", "guarantee"].includes(o.availabilityStatus);
  return (
    <tr className="border-b border-salt-air/40 align-top">
      <td className="py-2.5 pr-3">
        <p className="text-[0.85rem] text-deep-harbor">{o.categoryName}</p>
        <p className="text-[0.65rem] text-aegean-ink/60">
          {o.categoryCode ?? o.accommodationType}
          {o.sizeDisplay ? ` · ${o.sizeDisplay}` : ""}
        </p>
      </td>
      <td className="py-2.5 pr-3 text-right oldstyle-nums text-[0.8rem]">
        <span className="text-aegean-ink/50 line-through">{money(o.theirPrice)}</span>
        <span className="ml-2 text-deep-harbor">{money(o.myPrice)}</span>
      </td>
      <td className="py-2.5 pr-3">
        <span className="text-[0.65rem] text-aegean-ink/60">{o.availabilityStatus}</span>
        {!publishable && (
          <p className="text-[0.6rem] italic text-compass-gold">not publishable</p>
        )}
      </td>
      <td className="py-2.5 text-right">
        <form action={setOfferApproved} className="inline">
          {tokenField}
          <input type="hidden" name="offerId" value={o.id} />
          <input type="hidden" name="approved" value={String(!o.websiteApproved)} />
          <button
            type="submit"
            disabled={!publishable && !o.websiteApproved}
            className={`border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.15em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              o.websiteApproved
                ? "border-compass-gold bg-compass-gold/10 text-deep-harbor hover:bg-compass-gold/20"
                : "border-salt-air text-aegean-ink/70 hover:border-aegean-ink/50"
            }`}
          >
            {o.websiteApproved ? "Approved ✓" : "Approve fare"}
          </button>
        </form>
      </td>
    </tr>
  );
}

function VoyageCard({ v, tokenField }: { v: CuratedVoyage; tokenField: React.ReactNode }) {
  const blockers = blockersFor(v);
  const readyToFeature = blockers.length === 0;
  const isFeatured = v.feature?.active ?? false;
  // Only approved fares can be the featured one — the public view reads
  // featured_offer_id through RLS, which hides any fare that isn't
  // website_approved, so an unapproved pick would render a blank card.
  const publishableOffers = v.offers.filter(
    (o) =>
      o.websiteApproved &&
      o.sourceStatus === "trusted" &&
      o.myPrice !== null &&
      ["available", "guarantee"].includes(o.availabilityStatus)
  );
  const dueForReview =
    isFeatured && v.feature?.reviewOn !== null && v.feature!.reviewOn! <= todayISO();

  return (
    <article
      id={`voyage-${v.id}`}
      className="mt-6 border border-salt-air bg-vintage-passport"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-salt-air px-6 py-5 sm:px-8">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.25em] text-compass-gold">
            {v.cruiseLine} · {v.ship}
            {v.voyageCode ? ` · ${v.voyageCode}` : ""}
          </p>
          <h3 className="mt-1 font-serif text-xl tracking-tight text-deep-harbor">
            {v.officialVoyageTitle}
          </h3>
          <p className="mt-1 text-[0.75rem] text-aegean-ink/70 oldstyle-nums">
            {v.embarkPort ?? "—"} → {v.disembarkPort ?? "—"} ·{" "}
            {formatDateRange(v.embarkationDate, v.disembarkationDate) || "dates TBD"}
            {v.nights ? ` · ${v.nights} nights` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge tone={v.sourceStatus === "trusted" ? "ink" : "muted"}>
            {v.sourceStatus === "trusted" ? "verified" : "needs review"}
          </Badge>
          <Badge tone={v.websiteStatus === "approved" ? "gold" : "muted"}>
            {v.websiteStatus.replace("_", " ")}
          </Badge>
          {isFeatured && <Badge tone={dueForReview ? "warn" : "gold"}>on homepage</Badge>}
        </div>
      </header>

      <div className="grid gap-6 px-6 py-6 sm:grid-cols-[1fr_auto] sm:px-8">
        <div>
          {/* Jordan's Take — required before this can go anywhere public */}
          <form action={saveJordansTake} className="border border-salt-air/70 bg-linen/40 p-4">
            {tokenField}
            <input type="hidden" name="voyageId" value={v.id} />
            <label className="text-[0.6rem] uppercase tracking-[0.2em] text-aegean-ink/70">
              Jordan&rsquo;s take {!v.jordansTake?.trim() && (
                <span className="text-compass-gold">— needed to publish</span>
              )}
            </label>
            <textarea
              name="jordansTake"
              defaultValue={v.jordansTake ?? ""}
              rows={2}
              placeholder="What you'd tell a friend about this sailing…"
              className="mt-1.5 w-full border border-salt-air bg-vintage-passport px-3 py-2 font-serif text-sm text-deep-harbor placeholder:text-aegean-ink/40 focus:border-aegean-ink/50 focus:outline-none"
            />
            <button
              type="submit"
              className="mt-2 border border-salt-air px-3 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink/80 hover:border-aegean-ink/50"
            >
              Save
            </button>
          </form>

          {/* Fares */}
          <table className="mt-4 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-salt-air text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink/70">
                <th className="py-1.5 pr-3 font-normal">Category</th>
                <th className="py-1.5 pr-3 text-right font-normal">Retail / yours</th>
                <th className="py-1.5 pr-3 font-normal">Status</th>
                <th className="py-1.5 text-right font-normal">Public</th>
              </tr>
            </thead>
            <tbody>
              {v.offers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 text-[0.75rem] italic text-aegean-ink/60">
                    No fares recorded for this sailing.
                  </td>
                </tr>
              ) : (
                v.offers.map((o) => <OfferRow key={o.id} o={o} tokenField={tokenField} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Publish controls */}
        <div className="flex w-full flex-col gap-3 sm:w-64">
          <form action={setVoyageTrusted}>
            {tokenField}
            <input type="hidden" name="voyageId" value={v.id} />
            <input
              type="hidden"
              name="trusted"
              value={String(v.sourceStatus !== "trusted")}
            />
            <button
              type="submit"
              className="w-full border border-salt-air px-3 py-1.5 text-left text-[0.65rem] uppercase tracking-[0.15em] text-aegean-ink/80 hover:border-aegean-ink/50"
            >
              {v.sourceStatus === "trusted" ? "Mark needs review" : "Mark verified"}
            </button>
          </form>

          <form action={setVoyageWebsiteStatus}>
            {tokenField}
            <input type="hidden" name="voyageId" value={v.id} />
            <input
              type="hidden"
              name="status"
              value={v.websiteStatus === "approved" ? "not_approved" : "approved"}
            />
            <button
              type="submit"
              className={`w-full border px-3 py-1.5 text-left text-[0.65rem] uppercase tracking-[0.15em] ${
                v.websiteStatus === "approved"
                  ? "border-salt-air text-aegean-ink/80 hover:border-aegean-ink/50"
                  : "border-compass-gold text-deep-harbor hover:bg-compass-gold/10"
              }`}
            >
              {v.websiteStatus === "approved"
                ? "Remove from site"
                : "Allow on site"}
            </button>
          </form>

          <div className="border-t border-salt-air pt-3">
            {isFeatured ? (
              <div className="flex flex-col gap-2">
                <p className="text-[0.65rem] text-aegean-ink/70">
                  Featured since {formatDate(v.feature!.featuredAt)}
                  <br />
                  Review by {formatDate(v.feature!.reviewOn)}
                </p>
                <form action={snoozeReview}>
                  {tokenField}
                  <input type="hidden" name="voyageId" value={v.id} />
                  <button
                    type="submit"
                    className="w-full border border-salt-air px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-aegean-ink/80 hover:border-aegean-ink/50"
                  >
                    Still good — snooze 30d
                  </button>
                </form>
                <form action={unfeatureFromHomepage}>
                  {tokenField}
                  <input type="hidden" name="voyageId" value={v.id} />
                  <button
                    type="submit"
                    className="w-full border border-salt-air px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-aegean-ink/60 hover:border-aegean-ink/50"
                  >
                    Take off homepage
                  </button>
                </form>
              </div>
            ) : readyToFeature ? (
              <form action={featureOnHomepage} className="flex flex-col gap-2">
                {tokenField}
                <input type="hidden" name="voyageId" value={v.id} />
                <label className="text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink/70">
                  Fare to show
                </label>
                <select
                  name="offerId"
                  defaultValue={publishableOffers[0]?.id ?? ""}
                  className="border border-salt-air bg-vintage-passport px-2 py-1.5 text-[0.8rem] text-deep-harbor"
                >
                  {publishableOffers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.categoryName} — {money(o.myPrice)}
                    </option>
                  ))}
                </select>
                <input
                  name="reason"
                  placeholder="Why now? (optional)"
                  className="border border-salt-air bg-vintage-passport px-2 py-1.5 text-[0.75rem] text-deep-harbor placeholder:text-aegean-ink/40"
                />
                <button
                  type="submit"
                  className="border border-compass-gold bg-compass-gold/10 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-deep-harbor hover:bg-compass-gold/20"
                >
                  Feature on homepage
                </button>
              </form>
            ) : (
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink/60">
                  Not ready to feature
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {blockers.map((b) => (
                    <li key={b} className="text-[0.7rem] text-aegean-ink/70">
                      · {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ReviewQueue({
  items,
  tokenField,
}: {
  items: CuratedVoyage[];
  tokenField: React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10 border border-compass-gold bg-compass-gold/5 px-6 py-6 sm:px-8">
      <p className="text-[0.6rem] uppercase tracking-[0.25em] text-compass-gold">
        Due for a look
      </p>
      <h2 className="mt-1 font-serif text-xl tracking-tight text-deep-harbor">
        These have been on the homepage 30+ days
      </h2>
      <p className="mt-1.5 max-w-2xl font-serif text-sm text-aegean-ink">
        Still a good fare? Snooze it. Stale? Take it down and feature something
        fresher below.
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((v) => (
          <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-compass-gold/30 pt-2 first:border-t-0 first:pt-0">
            <a href={`#voyage-${v.id}`} className="font-serif text-sm text-deep-harbor underline decoration-compass-gold/50 underline-offset-4">
              {v.officialVoyageTitle} — {v.ship}
            </a>
            <div className="flex gap-2">
              <form action={snoozeReview}>
                {tokenField}
                <input type="hidden" name="voyageId" value={v.id} />
                <button type="submit" className="border border-salt-air px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink/80 hover:border-aegean-ink/50">
                  Snooze 30d
                </button>
              </form>
              <form action={unfeatureFromHomepage}>
                {tokenField}
                <input type="hidden" name="voyageId" value={v.id} />
                <button type="submit" className="border border-salt-air px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink/60 hover:border-aegean-ink/50">
                  Take down
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function QuoteCurationPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const authorized =
    process.env.NODE_ENV === "development" || (!!token && key === token);
  if (!authorized) notFound();

  const voyages = await listCuratedVoyages();
  const featured = voyages.filter((v) => v.feature?.active);
  const readyNotFeatured = voyages.filter(
    (v) => !v.feature?.active && blockersFor(v).length === 0
  );
  const dueForReview = featured.filter(
    (v) => v.feature?.reviewOn !== null && v.feature!.reviewOn! <= todayISO()
  );

  // Every form on this page needs the gate token re-submitted, since the
  // page's own auth check only covers this GET request, not the actions.
  const tokenField = key ? <input type="hidden" name="key" value={key} /> : null;

  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-kicker uppercase text-compass-gold">
          Internal · Quote Curation
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-deep-harbor">
          What we&rsquo;ve quoted, and what&rsquo;s public
        </h1>
        <p className="mt-2 max-w-2xl font-serif text-aegean-ink">
          Every sailing you quote lands here automatically. Nothing reaches
          the site until you say so — approve the sailing, approve a fare,
          then feature it. Nothing else changes on its own.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Quoted sailings" value={String(voyages.length)} hint="captured" />
          <StatTile label="Ready to feature" value={String(readyNotFeatured.length)} hint="not yet public" />
          <StatTile label="Live on homepage" value={String(featured.length)} />
          <StatTile
            label="Due for review"
            value={String(dueForReview.length)}
            hint={dueForReview.length > 0 ? "30+ days featured" : undefined}
          />
        </div>

        <ReviewQueue items={dueForReview} tokenField={tokenField} />

        {voyages.length === 0 ? (
          <p className="mt-10 border border-salt-air bg-linen/50 px-6 py-8 text-center font-serif text-aegean-ink">
            No quoted sailings yet.
          </p>
        ) : (
          <section className="mt-10">
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-compass-gold">
              Every quoted sailing
            </p>
            <h2 className="mt-1 font-serif text-2xl tracking-tight text-deep-harbor">
              Newest first
            </h2>
            {voyages.map((v) => (
              <VoyageCard key={v.id} v={v} tokenField={tokenField} />
            ))}
          </section>
        )}

        <p className="mt-10 border-t border-salt-air pt-4 text-[0.75rem] leading-relaxed text-aegean-ink/70">
          <strong className="text-aegean-ink">How the gate works:</strong>{" "}
          three switches control what strangers can see — a sailing must be
          verified and allowed on the site, a fare must be individually
          approved, and a homepage slot must be active. Each is enforced
          again in the database itself (Row Level Security), so this page
          is a convenience for flipping those switches, not the thing
          actually protecting client fares from going public by accident.
        </p>
      </div>
    </section>
  );
}
