import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  listCampaignStats,
  listSailingStats,
  countSubscribers,
  type CampaignStats,
  type SailingStats,
} from "@/lib/data/campaigns";

/**
 * INTERNAL marketing desk — every Dispatch letter, what it earned, and
 * which sailings pulled the clicks. Token-gated outside development;
 * noindexed. Reads the campaign_stats / campaign_sailing_stats views via
 * the service-role client.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal — Marketing Desk",
  robots: { index: false, follow: false },
};

const money = (n: number | null) =>
  n === null ? "—" : `$${n.toLocaleString("en-US")}`;

const pct = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

const STATUS_STYLE: Record<string, string> = {
  draft: "border-sun-faded/50 text-sun-faded",
  scheduled: "border-compass-gold/60 text-compass-gold",
  sent: "border-aegean-ink/50 text-aegean-ink",
  archived: "border-salt-air text-sun-faded",
};

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-salt-air bg-linen/60 px-5 py-4">
      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-aegean-ink/70">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl text-deep-harbor oldstyle-nums">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[0.7rem] text-aegean-ink/60">{hint}</p>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-[0.6rem] uppercase tracking-[0.18em] text-aegean-ink/70">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl text-deep-harbor oldstyle-nums">
        {value}
      </p>
      {sub && <p className="text-[0.7rem] text-aegean-ink/60">{sub}</p>}
    </div>
  );
}

function SailingRow({ s, max }: { s: SailingStats; max: number }) {
  const width = max > 0 ? Math.round((s.clicks / max) * 100) : 0;
  return (
    <tr className="border-b border-salt-air/50 align-top">
      <td className="py-3 pr-3">
        <p className="font-serif text-[0.95rem] text-deep-harbor">
          {s.embarkPort && s.disembarkPort
            ? `${s.embarkPort} → ${s.disembarkPort}`
            : s.voyageTitle}
        </p>
        <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.12em] text-aegean-ink/70">
          {s.ship}
          {s.embarkationDate ? ` · ${s.embarkationDate}` : ""}
          {s.utmContent ? ` · ${s.utmContent}` : ""}
        </p>
      </td>
      <td className="py-3 pr-3 text-right oldstyle-nums">
        <span className="text-deep-harbor">{money(s.leadFare)}</span>
        {s.leadSavings ? (
          <span className="block text-[0.7rem] text-compass-gold">
            save {money(s.leadSavings)}
          </span>
        ) : (
          <span className="block text-[0.7rem] italic text-aegean-ink/50">
            savings pending
          </span>
        )}
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="h-[6px] flex-1 border border-salt-air/70"
          >
            <div
              className="h-full bg-compass-gold/70"
              style={{ width: `${width}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-sm text-deep-harbor oldstyle-nums">
            {s.clicks}
          </span>
        </div>
        <p className="mt-1 text-[0.65rem] text-aegean-ink/60 oldstyle-nums">
          {s.uniqueClickers} unique
        </p>
      </td>
      <td className="py-3 text-right oldstyle-nums">
        <span
          className={
            s.quoteRequests > 0
              ? "font-medium text-deep-harbor"
              : "text-aegean-ink/40"
          }
        >
          {s.quoteRequests}
        </span>
      </td>
    </tr>
  );
}

function CampaignBlock({
  c,
  sailings,
}: {
  c: CampaignStats;
  sailings: SailingStats[];
}) {
  const maxClicks = Math.max(0, ...sailings.map((s) => s.clicks));
  const hasEvents = c.delivered + c.opened + c.clicked > 0;
  const ranked = [...sailings].sort((a, b) =>
    hasEvents ? b.clicks - a.clicks : a.position - b.position
  );

  return (
    <article className="mt-10 border border-salt-air bg-vintage-passport">
      <header className="border-b border-salt-air px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-compass-gold oldstyle-nums">
              No. {String(c.campaignNumber).padStart(3, "0")}
            </p>
            <h2 className="mt-1 font-serif text-2xl tracking-tight text-deep-harbor">
              {c.title}
            </h2>
            {c.subject && (
              <p className="mt-1 font-serif text-sm italic text-aegean-ink">
                &ldquo;{c.subject}&rdquo;
              </p>
            )}
          </div>
          <span
            className={`border px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] ${
              STATUS_STYLE[c.status] ?? STATUS_STYLE.draft
            }`}
          >
            {c.status}
          </span>
        </div>
        <p className="mt-3 text-[0.7rem] uppercase tracking-[0.12em] text-aegean-ink/70 oldstyle-nums">
          {c.sentAt
            ? `Sent ${new Date(c.sentAt).toLocaleDateString("en-US", {
                dateStyle: "medium",
              })}`
            : "Not yet sent"}
          {c.segment ? ` · ${c.segment}` : ""}
          {c.audienceSize ? ` · ${c.audienceSize} recipients` : ""}
          {` · ${sailings.length} sailings`}
        </p>
      </header>

      {hasEvents ? (
        <div className="grid grid-cols-2 gap-6 border-b border-salt-air px-6 py-6 sm:grid-cols-4 sm:px-8">
          <Metric
            label="Delivered"
            value={String(c.delivered)}
            sub={c.bounced ? `${c.bounced} bounced` : undefined}
          />
          <Metric
            label="Opened"
            value={String(c.opened)}
            sub={`${pct(c.opened, c.delivered)} · inflated`}
          />
          <Metric
            label="Clicked"
            value={String(c.clicked)}
            sub={`${pct(c.clicked, c.delivered)} · ${c.totalClicks} total`}
          />
          <Metric
            label="Quote requests"
            value={String(c.quoteRequests)}
            sub="the number that matters"
          />
        </div>
      ) : (
        <div className="border-b border-salt-air bg-linen/40 px-6 py-4 sm:px-8">
          <p className="font-serif text-sm text-aegean-ink">
            No engagement data yet &mdash; results appear here once this letter
            is sent and the ESP webhook starts reporting.
          </p>
        </div>
      )}

      <div className="px-6 py-6 sm:px-8">
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-compass-gold">
          {hasEvents ? "Sailing leaderboard" : "Sailings featured"}
        </p>
        <table className="mt-3 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-salt-air text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink/70">
              <th className="py-2 pr-3 font-normal">Voyage</th>
              <th className="py-2 pr-3 text-right font-normal">Lead fare</th>
              <th className="py-2 pr-3 font-normal">Clicks</th>
              <th className="py-2 text-right font-normal">Quotes</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((s) => (
              <SailingRow key={s.voyageId} s={s} max={maxClicks} />
            ))}
          </tbody>
        </table>
      </div>

      {c.status === "draft" && (
        <p className="border-t border-salt-air px-6 py-4 text-[0.75rem] text-aegean-ink/70 sm:px-8">
          Draft &mdash; archived at{" "}
          <code className="text-aegean-ink">
            emails/dispatch-crossings-mediterranean.html
          </code>
        </p>
      )}
    </article>
  );
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const authorized =
    process.env.NODE_ENV === "development" || (!!token && key === token);
  if (!authorized) notFound();

  const [campaigns, sailings, subscribers] = await Promise.all([
    listCampaignStats(),
    listSailingStats(),
    countSubscribers(),
  ]);

  const sent = campaigns.filter((c) => c.status === "sent");
  const totalQuotes = campaigns.reduce((n, c) => n + c.quoteRequests, 0);
  const totalClicks = campaigns.reduce((n, c) => n + c.totalClicks, 0);

  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-kicker uppercase text-compass-gold">
          Internal &middot; Marketing Desk
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-deep-harbor">
          Dispatch performance
        </h1>
        <p className="mt-2 max-w-2xl font-serif text-aegean-ink">
          Every letter sent, what it earned, and which sailings pulled the
          clicks &mdash; so featuring decisions and fare negotiations run on
          evidence, not instinct.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile
            label="Subscribers"
            value={subscribers.toLocaleString("en-US")}
            hint="Dispatch list"
          />
          <StatTile
            label="Letters sent"
            value={String(sent.length)}
            hint={`${campaigns.length} total incl. drafts`}
          />
          <StatTile
            label="Total clicks"
            value={totalClicks.toLocaleString("en-US")}
            hint="across all letters"
          />
          <StatTile
            label="Quote requests"
            value={String(totalQuotes)}
            hint="attributed to a letter"
          />
        </div>

        {campaigns.length === 0 ? (
          <p className="mt-10 border border-salt-air bg-linen/50 px-6 py-8 text-center font-serif text-aegean-ink">
            No campaigns logged yet.
          </p>
        ) : (
          campaigns.map((c) => (
            <CampaignBlock
              key={c.campaignId}
              c={c}
              sailings={sailings.filter((s) => s.campaignId === c.campaignId)}
            />
          ))
        )}

        <p className="mt-10 border-t border-salt-air pt-4 text-[0.75rem] leading-relaxed text-aegean-ink/70">
          <strong className="text-aegean-ink">On reading these numbers:</strong>{" "}
          open rates are inflated by Apple Mail Privacy Protection and similar
          proxies &mdash; treat them as a floor, never as a target. Clicks and
          quote requests are the honest signals. With a list this size, patterns
          only become trustworthy across five to ten letters.
        </p>
      </div>
    </section>
  );
}
