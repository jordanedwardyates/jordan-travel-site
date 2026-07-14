import Image from "next/image";
import Link from "next/link";

import TextLink from "./TextLink";

export type Journey = {
  id: string;
  slug?: string;
  region: string;
  dates: string;
  routeTitle: string;
  voyageTitle: string;
  cruiseLine: string;
  ship: string;
  nights: number;
  embark: string;
  disembark: string;
  portCount: number;
  stateroom: string;
  roomSize?: string;
  theirPrice: string;
  yourPrice: string;
  priceNote?: string;
  jordansTake: string;
  availabilityNote?: string;
};

function RouteStrip({ portCount }: { portCount: number }) {
  const stops = Array.from({ length: portCount }, (_, i) =>
    portCount === 1 ? 300 : 14 + (i * 572) / (portCount - 1)
  );
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 28"
      preserveAspectRatio="none"
      className="h-5 w-full text-sun-faded"
    >
      <path
        d={`M ${stops[0]} 14 L ${stops[stops.length - 1]} 14`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />
      {stops.map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={14}
          r={i === 0 || i === stops.length - 1 ? 5 : 3.5}
          fill={i === 0 || i === stops.length - 1 ? "none" : "currentColor"}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/** "$9,480" → 9480; null when the display string has no clean number. */
function parsePrice(display: string): number | null {
  const digits = display.replace(/[^0-9]/g, "");
  return digits.length > 0 ? parseInt(digits, 10) : null;
}

/** A quoted sailing set as a ledger entry / travel dossier, not a product tile. */
export default function JourneyCard({ journey }: { journey: Journey }) {
  const j = journey;
  // Lands on the quote form with this sailing preselected.
  const inquiryHref = `/?journey=${j.id}#request-a-quote`;

  const theirs = parsePrice(j.theirPrice);
  const yours = parsePrice(j.yourPrice);
  const savings =
    theirs !== null && yours !== null && theirs > yours ? theirs - yours : null;

  return (
    <article className="border border-salt-air bg-linen p-1">
      <div className="grid border border-salt-air/60 sm:grid-cols-[220px_1fr]">
        {/*
          Defined image area. Until approved destination photography exists,
          it holds a restrained engraved-chart placeholder: embark port,
          route line, disembark port.
        */}
        <div className="flex flex-col justify-center gap-1.5 border-b border-salt-air/60 bg-weathered-ivory/60 px-5 py-4 sm:border-b-0 sm:border-r sm:py-6">
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-deep-harbor">
            {j.embark}
          </p>
          <RouteStrip portCount={j.portCount} />
          <p className="text-right text-[0.6rem] uppercase tracking-[0.2em] text-deep-harbor">
            {j.disembark}
          </p>
          <p className="mt-3 text-center text-[0.6rem] uppercase tracking-[0.2em] text-aegean-ink oldstyle-nums">
            {j.portCount} ports of call
          </p>
        </div>

        <div className="px-6 py-5 sm:px-7">
          <p className="text-kicker uppercase text-deep-harbor">
            {j.region} <span aria-hidden="true">&middot;</span>{" "}
            <span className="oldstyle-nums">{j.dates}</span>
          </p>
          <h3 className="mt-1.5 font-serif text-2xl tracking-tight sm:text-3xl">
            {j.slug ? (
              <Link
                href={`/journeys/${j.slug}`}
                className="transition-colors hover:text-aegean-ink"
              >
                {j.routeTitle}
              </Link>
            ) : (
              j.routeTitle
            )}
          </h3>
          <p className="mt-1 text-sm text-aegean-ink">
            &ldquo;{j.voyageTitle}&rdquo; &middot; {j.ship}, {j.cruiseLine}
          </p>
          <p className="mt-1.5 text-sm text-aegean-ink oldstyle-nums">
            {j.nights} nights &middot; {j.stateroom}
            {j.roomSize && <> &middot; {j.roomSize}</>}
          </p>

          <dl className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-aegean-ink">
                Their price
              </dt>
              <dd className="mt-0.5 text-sm text-aegean-ink oldstyle-nums">
                {j.theirPrice} per person
              </dd>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-aegean-ink">
                Your price
              </dt>
              <dd className="mt-0.5 text-lg font-medium text-deep-harbor oldstyle-nums">
                {j.yourPrice} per person
              </dd>
              {(savings !== null || j.priceNote) && (
                <dd className="mt-2 flex flex-wrap items-center gap-2">
                  {savings !== null && (
                    <span className="border border-dashed border-compass-gold/80 bg-vintage-passport px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-deep-harbor oldstyle-nums">
                      You save ${savings.toLocaleString("en-US")}
                    </span>
                  )}
                  {j.priceNote && (
                    <span className="inline-flex items-center gap-1.5 border border-dashed border-compass-gold/80 bg-vintage-passport px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-deep-harbor">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5 text-compass-gold"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
                        />
                      </svg>
                      {j.priceNote}
                    </span>
                  )}
                </dd>
              )}
            </div>
          </dl>

          {savings !== null && (
            <p className="mt-3 font-serif text-sm italic leading-relaxed text-aegean-ink">
              Book direct and you&rsquo;d pay retail &mdash; and get none of
              this back.
            </p>
          )}

          <div className="mt-4 flex items-start gap-3 border-t border-salt-air pt-3">
            <Image
              src="/portrait-engraved.png"
              alt=""
              width={1739}
              height={1739}
              className="mt-1 h-auto w-11 shrink-0 mix-blend-multiply"
            />
            <p className="max-w-[60ch] font-serif italic leading-relaxed">
              <span className="mr-2 font-sans text-[0.6rem] not-italic uppercase tracking-[0.25em] text-deep-harbor">
                Jordan&rsquo;s Take
              </span>
              &ldquo;{j.jordansTake}&rdquo;
            </p>
          </div>

          <footer className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            {j.availabilityNote ? (
              <p className="text-xs text-aegean-ink">{j.availabilityNote}</p>
            ) : (
              <span />
            )}
            <TextLink href={inquiryHref} className="text-sm">
              Request this itinerary &rarr;
            </TextLink>
          </footer>
        </div>
      </div>
    </article>
  );
}
