import Image from "next/image";

import TextLink from "./TextLink";

export type Journey = {
  id: string;
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

/** A quoted sailing set as a ledger entry / travel dossier, not a product tile. */
export default function JourneyCard({ journey }: { journey: Journey }) {
  const j = journey;
  // Lands on the quote form with this sailing preselected.
  const inquiryHref = `/?journey=${j.id}#request-a-quote`;

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
            {j.routeTitle}
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
                {j.priceNote && (
                  <span className="text-sm font-normal text-aegean-ink">
                    {" "}
                    &middot; {j.priceNote}
                  </span>
                )}
              </dd>
            </div>
          </dl>

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
