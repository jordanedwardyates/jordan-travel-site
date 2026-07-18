import type { Metadata } from "next";

import Button from "@/components/Button";
import PassportStamp from "@/components/PassportStamp";
import TextLink from "@/components/TextLink";
import WeatheredBackground from "@/components/WeatheredBackground";

export const metadata: Metadata = {
  title: "Off the charts — BON V: A Travel Company",
  robots: { index: false, follow: false },
};

/** 404 set as a chart annotation — a position with nothing at it. */
export default function NotFound() {
  return (
    <section className="weathered clip-section px-6 py-20 sm:py-28">
      <WeatheredBackground variant="chart" />
      <div className="relative mx-auto flex max-w-[52ch] flex-col items-center text-center">
        <PassportStamp
          text="· UNCHARTED · BON V: A TRAVEL COMPANY ·"
          className="h-24 w-24 -rotate-12 text-sun-faded opacity-40"
        />
        <p className="mt-8 text-kicker uppercase text-deep-harbor">
          Position unknown
        </p>
        <h1 className="mt-4 font-serif text-display">
          This page is off the charts
        </h1>
        <p className="mt-6 font-serif text-lg leading-relaxed text-aegean-ink">
          The address you&rsquo;ve steered for isn&rsquo;t on ours &mdash; it
          may have moved with a new edition, or never been drawn at all.
          The route home is well marked.
        </p>
        <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:items-baseline sm:gap-8">
          <Button href="/">Return home</Button>
          <TextLink href="/journeys" className="text-sm whitespace-nowrap">
            See the journeys
          </TextLink>
        </div>
      </div>
    </section>
  );
}
