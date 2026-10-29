import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAuthorizedAdvisor } from "@/lib/auth/advisor";
import { getPromotionFeedHealth } from "@/lib/data/promotion-feed";
import { listQuoteLinkCandidates } from "@/lib/data/quote-reconciliation";

import {
  listAdvisorReviewItems,
  type AdvisorReviewItem,
} from "@/lib/data/advisor-queue";

/**
 * Read-only, advisor-only review desk.
 * The gate is checked BEFORE the service-role database read.
 * Never expose this route via the public navigation or client-side fetches.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Internal — Sales Review Desk",
  robots: { index: false, follow: false },
};

const LANES = [
  {
    id: "reservation_hold_verification",
    title: "Reservation holds",
    note: "Check whether the option still exists before quoting availability.",
  },
  {
    id: "booking_service_verification",
    title: "Booking service",
    note: "Verify payment, documents and supplier arrangements before contacting clients.",
  },
  {
    id: "sales_followup_verification",
    title: "Sales follow-ups",
    note: "Confirm the previous proposal and current interest before suggesting an offer.",
  },
  {
    id: "quote_queue_review",
    title: "Historical quote reviews",
    note: "Reconcile the quote and booking status; recorded prices may be stale.",
  },
  {
    id: "dormant_internal_review",
    title: "Dormant clients",
    note: "Internal reconciliation only. Do not automatically reactivate.",
  },
  {
    id: "historical_trip_review",
    title: "Past travel",
    note: "Review the completed voyage; do not treat it as an upcoming departure.",
  },
] as const;

function displayDate(date: string | null): string {
  if (!date) return "Not recorded";
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? "Not recorded"
    : parsed.toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function sortByRecordedDate(a: AdvisorReviewItem, b: AdvisorReviewItem) {
  // Missing dates last. A past review date is NOT proof of an open task.
  const aDate = a.source_review_date ?? "9999-12-31";
  const bDate = b.source_review_date ?? "9999-12-31";
  return aDate.localeCompare(bDate) || a.work_item_key.localeCompare(b.work_item_key);
}

function ReviewCard({ item }: { item: AdvisorReviewItem }) {
  return (
    <li className="border-t border-salt-air/60 py-4 first:border-t-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg text-deep-harbor">
            {item.client_name?.trim() || "Unresolved client"}
          </h3>
          <p className="mt-1 text-xs text-aegean-ink/70">
            {item.source_system.replaceAll("_", " ")}
            {item.source_stage ? ` · ${item.source_stage}` : ""}
          </p>
        </div>
        <span className="border border-compass-gold/60 px-2 py-1 text-[0.6rem] uppercase tracking-[0.13em] text-deep-harbor">
          Verify before action
        </span>
      </div>

      <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-aegean-ink">
        {item.recommended_review?.trim() || "Review this record and confirm the appropriate next action."}
      </p>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-aegean-ink/70">
        <span>Recorded review: {displayDate(item.source_review_date)}</span>
        {item.sail_date && <span>Sailing: {displayDate(item.sail_date)}</span>}
        {item.needs_quote_reconciliation && (
          <span className="font-medium text-deep-harbor">Quote linkage needs review</span>
        )}
      </div>
    </li>
  );
}

export default async function AdvisorSalesPage() {
  // Defense in depth: the page verifies the Basic auth header again, before
  // the service-role query. Query-string tokens are intentionally unsupported.
  const authorization = (await headers()).get("authorization");
  if (!(await isAuthorizedAdvisor(authorization))) notFound();

  const [items, promotionFeed, quoteCandidates] = await Promise.all([
    listAdvisorReviewItems(),
    getPromotionFeedHealth(),
    listQuoteLinkCandidates(),
  ]);
  const unknownLanes = items.filter(
    (item) => !LANES.some((lane) => lane.id === item.review_lane)
  );
  const needsVerification = items.filter((item) => item.requires_human_verification).length;
  const quoteLinks = items.filter((item) => item.needs_quote_reconciliation).length;
  const autoOutreach = items.filter((item) => item.eligible_for_automated_outreach).length;
  const candidateClients = new Set(quoteCandidates.map((item) => item.pipelineId)).size;
  const emailCandidates = quoteCandidates.filter((item) => item.matchMethod === "exact_email").length;
  const flaggedCandidates = quoteCandidates.filter((item) =>
    item.differentRecordedNames || item.quoteMatchesMultiplePipelineRecords
  ).length;
  // Show only booked-service verification, not speculative sales follow-ups.
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);
  const upcomingService = items.filter((item) =>
    item.review_lane === "booking_service_verification" &&
    !!item.sail_date &&
    item.sail_date >= today &&
    item.sail_date <= horizon
  ).sort((a, b) =>
    (a.sail_date ?? "").localeCompare(b.sail_date ?? "") ||
    a.work_item_key.localeCompare(b.work_item_key)
  );

  return (
    <main className="px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-kicker uppercase text-compass-gold">Internal · Advisor review</p>
        <h1 className="mt-2 font-serif text-4xl text-deep-harbor">Daily Sales Desk</h1>
        <p className="mt-3 max-w-3xl font-serif text-base leading-relaxed text-aegean-ink">
          A single review queue for client service, sales follow-ups and historical quotes.
          Recorded follow-up dates are clues, not proof that a task remains unfinished.
          This page never sends messages or changes client records.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {[
            ["Work items", items.length],
            ["Human verification", needsVerification],
            ["Quote links to review", quoteLinks],
            ["Outreach eligible", autoOutreach],
          ].map(([label, count]) => (
            <div key={label} className="border border-salt-air bg-linen/50 px-5 py-4">
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-aegean-ink/70">{label}</p>
              <p className="mt-2 font-serif text-3xl text-deep-harbor">{count}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 border border-salt-air p-5" aria-labelledby="upcoming-service">
          <h2 id="upcoming-service" className="font-serif text-2xl text-deep-harbor">
            Upcoming booking-service reviews · next 45 days ({upcomingService.length})
          </h2>
          <p className="mt-2 text-sm text-aegean-ink/70">
            Departure dates determine urgency, not whether a task is still outstanding.
            Verify supplier and client records before following up.
          </p>
          {upcomingService.length ? (
            <ul className="mt-4">{upcomingService.map((item) => (
              <ReviewCard key={item.work_item_key} item={item} />
            ))}</ul>
          ) : (
            <p className="mt-4 text-sm italic text-aegean-ink/60">
              No upcoming booking-service departures recorded in this window.
            </p>
          )}
        </section>

        <section className="mt-8 border border-salt-air p-5" aria-labelledby="quote-reconciliation">
          <h2 id="quote-reconciliation" className="font-serif text-2xl text-deep-harbor">
            Quote reconciliation · suggested links ({quoteCandidates.length})
          </h2>
          <p className="mt-2 text-sm text-aegean-ink/70">
            {candidateClients} pipeline records have possible historical quote connections.
            {emailCandidates} exact-email candidate{emailCandidates === 1 ? "" : "s"};{" "}
            {quoteCandidates.length - emailCandidates} name-only candidate{quoteCandidates.length - emailCandidates === 1 ? "" : "s"}.
            These are possible connections, not confirmed client or voyage matches.
            {flaggedCandidates > 0 && ` ${flaggedCandidates} candidate(s) need extra identity or duplicate-record review.`}
            No records are linked or changed by this page.
          </p>
          {quoteCandidates.length ? (
            <ul className="mt-4">
              {quoteCandidates.map((candidate) => (
                <li
                  key={`${candidate.pipelineId}:${candidate.quotePackageId}`}
                  className="border-t border-salt-air/60 py-3 first:border-t-0"
                >
                  <p className="font-medium text-deep-harbor">{candidate.clientName}</p>
                  <p className="mt-1 text-sm text-aegean-ink">
                    Possible quote: {candidate.quoteTitle}
                  </p>
                  <p className="mt-1 text-xs text-aegean-ink/70">
                    {candidate.matchMethod === "exact_email"
                      ? "Exact email match · verify person and voyage"
                      : "Name-only match · verify identity before linking"}
                    {" · "}Quoted: {displayDate(candidate.quotedAt)}
                    {candidate.pipelineSailing
                      ? ` · Pipeline sailing: ${candidate.pipelineSailing}`
                      : ""}
                    {candidate.pipelineSailDate
                      ? ` · Pipeline departure: ${displayDate(candidate.pipelineSailDate)}`
                      : ""}
                  </p>
                  {(candidate.differentRecordedNames || candidate.quoteMatchesMultiplePipelineRecords) && (
                    <p className="mt-2 border-l-4 border-compass-gold pl-3 text-xs font-medium text-deep-harbor">
                      {candidate.differentRecordedNames && "Recorded names differ despite an email match. Verify identity or a shared inbox. "}
                      {candidate.quoteMatchesMultiplePipelineRecords && "This quote matches multiple pipeline records. Resolve possible duplicates before linking."}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm italic text-aegean-ink/60">
              No exact-email or strict name-only candidates found. Other unlinked records still need review.
            </p>
          )}
        </section>

        <section className="mt-8 border border-salt-air bg-linen/40 p-5" aria-labelledby="promotion-health">
          <h2 id="promotion-health" className="font-serif text-2xl text-deep-harbor">
            Promotion matching · feed health
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-aegean-ink sm:grid-cols-3">
            <p><strong>Archived offers:</strong> {promotionFeed.totalOffers}</p>
            <p><strong>Recorded in 30 days:</strong> {promotionFeed.recordedLast30Days}</p>
            <p><strong>Trusted records in 30 days:</strong> {promotionFeed.trustedRecordedLast30Days}</p>
          </div>
          <p className="mt-3 text-sm text-aegean-ink">
            Latest recorded quote: {displayDate(promotionFeed.latestQuotedAt)}.
          </p>
          <p className="mt-3 border-l-4 border-compass-gold pl-3 text-sm font-medium text-deep-harbor">
            {promotionFeed.trustedRecordedLast30Days === 0
              ? "Promotion matching paused: no recently recorded trusted offers."
              : "Manual supplier re-verification required: recently recorded offers are not live inventory."}
            {" "}Never send an automated promotion from this archive.
          </p>
        </section>

        {autoOutreach > 0 && (
          <p className="mt-4 border border-compass-gold px-4 py-3 text-sm text-deep-harbor">
            Some records are marked outreach-eligible in the database. This desk is still
            read-only; verify supplier pricing and client status before contacting anyone.
          </p>
        )}

        {LANES.map((lane) => {
          const laneItems = items.filter((item) => item.review_lane === lane.id).sort(sortByRecordedDate);
          return (
            <section key={lane.id} className="mt-10" aria-labelledby={lane.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-salt-air pb-3">
                <h2 id={lane.id} className="font-serif text-2xl text-deep-harbor">
                  {lane.title} <span className="text-aegean-ink/50">({laneItems.length})</span>
                </h2>
              </div>
              <p className="mt-2 text-sm text-aegean-ink/70">{lane.note}</p>
              {laneItems.length ? (
                <ul className="mt-4">{laneItems.map((item) => <ReviewCard key={item.work_item_key} item={item} />)}</ul>
              ) : (
                <p className="mt-4 text-sm italic text-aegean-ink/60">No records in this lane.</p>
              )}
            </section>
          );
        })}

        {unknownLanes.length > 0 && (
          <section className="mt-10 border border-compass-gold p-5">
            <h2 className="font-serif text-2xl text-deep-harbor">
              Unclassified reviews ({unknownLanes.length})
            </h2>
            <p className="mt-2 text-sm text-aegean-ink">
              New workflow classifications must not silently disappear from the desk.
            </p>
            <ul className="mt-4">{unknownLanes.sort(sortByRecordedDate).map((item) => (
              <ReviewCard key={item.work_item_key} item={item} />
            ))}</ul>
          </section>
        )}
      </div>
    </main>
  );
}
