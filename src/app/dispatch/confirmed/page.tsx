import type { Metadata } from "next";

import Button from "@/components/Button";
import Rule from "@/components/Rule";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Subscription Confirmed",
  robots: { index: false, follow: false },
};

export default async function DispatchConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ invalid?: string }>;
}) {
  const { invalid } = await searchParams;
  const isInvalid = invalid === "1";

  return (
    <section className="weathered relative overflow-hidden px-6 py-20 sm:py-28">
      <div className="relative mx-auto flex max-w-[52ch] flex-col items-center text-center">
        <SectionHeading kicker="STAMPED · The Weekly Edit" />
        <Rule variant="double" className="mt-8 w-16" />

        {isInvalid ? (
          <>
            <h1 className="mt-8 font-serif text-title tracking-tight">
              That link didn&rsquo;t work.
            </h1>
            <p className="mt-6 font-serif text-lg leading-relaxed text-aegean-ink">
              It may have expired, or already been used. Try signing up
              again, or write to{" "}
              <a
                href="mailto:jordan.yates@luxurycruiseconnections.com"
                className="text-deep-harbor underline decoration-compass-gold/60 underline-offset-4"
              >
                jordan.yates@luxurycruiseconnections.com
              </a>{" "}
              and I&rsquo;ll add you myself.
            </p>
            <Button href="/#dispatch" className="mt-10">
              Try Again
            </Button>
          </>
        ) : (
          <>
            <h1 className="mt-8 font-serif text-title tracking-tight">
              You&rsquo;re on the list.
            </h1>
            <p className="mt-6 font-serif text-lg leading-relaxed text-aegean-ink">
              The next letter finds you Saturday &mdash; the best fares
              I&rsquo;ve negotiated on the world&rsquo;s finest cruise lines,
              written the way I&rsquo;d tell a friend.
            </p>
            <Button href="/" className="mt-10">
              Return Home
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
