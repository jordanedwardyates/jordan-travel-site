import type { Metadata } from "next";

import { normalizeEmail, verifyEmail } from "@/lib/unsubscribe-token";
import UnsubscribeForm from "./UnsubscribeForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe",
  // Never index an unsubscribe page: the URL carries a subscriber's address.
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; c?: string }>;
}) {
  const params = await searchParams;
  const email = normalizeEmail(params.e ?? "");
  const token = params.t ?? "";
  const campaign = params.c ?? null;
  const valid = Boolean(email) && verifyEmail(email, token);

  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-xl">
        <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-compass-gold">
          The Dispatch
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight text-deep-harbor">
          {valid ? "Leaving the list" : "This link has expired"}
        </h1>

        {valid ? (
          <>
            <p className="mt-6 font-serif text-lg leading-relaxed text-aegean-ink">
              One click and I&rsquo;ll stop writing to{" "}
              <span className="text-deep-harbor">{email}</span>. No hard feelings,
              and no follow-up asking why.
            </p>
            <UnsubscribeForm email={email} token={token} campaign={campaign} />
            <p className="mt-10 border-t border-aegean-ink/15 pt-6 font-serif text-sm leading-relaxed text-aegean-ink">
              Landed here by mistake? Close the page &mdash; nothing has changed
              yet, and nothing changes until you press the button.
            </p>
          </>
        ) : (
          <>
            <p className="mt-6 font-serif text-lg leading-relaxed text-aegean-ink">
              This unsubscribe link is incomplete or has been altered, so I
              can&rsquo;t confirm whose it is &mdash; and I won&rsquo;t remove an
              address I can&rsquo;t verify.
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-aegean-ink">
              Use the link at the foot of any Dispatch letter, or write to{" "}
              <a
                className="underline decoration-compass-gold/60 underline-offset-4"
                href="mailto:jordan.yates@luxurycruiseconnections.com?subject=Unsubscribe"
              >
                jordan.yates@luxurycruiseconnections.com
              </a>{" "}
              and I&rsquo;ll take you off by hand, same day.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
