"use client";

import { useState } from "react";

/**
 * The confirm button. Posts to the same endpoint Gmail's one-click control
 * posts to, so there is exactly one code path that suppresses an address.
 */
export default function UnsubscribeForm({
  email,
  token,
  campaign,
}: {
  email: string;
  token: string;
  campaign: string | null;
}) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  async function submit() {
    setState("working");
    const qs = new URLSearchParams({ e: email, t: token });
    if (campaign) qs.set("c", campaign);
    try {
      const res = await fetch(`/api/unsubscribe?${qs}`, { method: "POST" });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-8 border border-compass-gold/40 bg-compass-gold/5 px-6 py-5">
        <p className="font-serif text-lg text-deep-harbor">You&rsquo;re unsubscribed.</p>
        <p className="mt-2 font-serif text-sm leading-relaxed text-aegean-ink">
          {email} won&rsquo;t receive The Dispatch again. Nothing else to do &mdash;
          you can close this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={submit}
        disabled={state === "working"}
        className="border border-deep-harbor bg-deep-harbor px-8 py-3 font-serif text-xs uppercase tracking-[0.2em] text-vintage-passport transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {state === "working" ? "One moment…" : "Yes, unsubscribe me"}
      </button>

      {state === "error" && (
        <p className="mt-4 font-serif text-sm leading-relaxed text-aegean-ink">
          That didn&rsquo;t go through. Reply to any Dispatch letter, or write to{" "}
          <a
            className="underline decoration-compass-gold/60 underline-offset-4"
            href={`mailto:jordan.yates@luxurycruiseconnections.com?subject=${encodeURIComponent("Unsubscribe")}`}
          >
            jordan.yates@luxurycruiseconnections.com
          </a>
          , and I&rsquo;ll take you off by hand.
        </p>
      )}
    </div>
  );
}
