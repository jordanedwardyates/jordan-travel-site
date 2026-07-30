"use client";

import { useState } from "react";

/**
 * Copy-to-clipboard for captions and transcripts — the single most repeated
 * action on this desk, so it shouldn't require selecting text by hand.
 */
export default function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`border border-compass-gold/50 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.2em] text-compass-gold transition-colors hover:bg-compass-gold/10 ${className}`}
    >
      {state === "done" ? "Copied" : state === "failed" ? "Select manually" : label}
    </button>
  );
}
