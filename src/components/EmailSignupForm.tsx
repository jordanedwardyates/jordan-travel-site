"use client";

import { useActionState } from "react";
import { subscribeToDispatch, type FormState } from "@/app/actions";

const INITIAL: FormState = { status: "idle" };

export default function EmailSignupForm() {
  const [state, formAction, pending] = useActionState(
    subscribeToDispatch,
    INITIAL
  );

  if (state.status === "success") {
    return (
      <p role="status" className="mt-6 font-serif text-lg italic">
        You&rsquo;re on the list &mdash; the next letter will find you.
      </p>
    );
  }

  return (
    <form action={formAction} className="mx-auto mt-6 w-full max-w-[26rem]">
      {/* Honeypot — hidden from people, tempting to bots */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="dispatch-website">Website</label>
        <input
          id="dispatch-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <label
        htmlFor="dispatch-email"
        className="block text-[0.65rem] uppercase tracking-[0.2em] text-deep-harbor"
      >
        Email
      </label>
      <div className="mt-1.5 flex flex-col gap-3">
        <input
          id="dispatch-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={200}
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={
            state.fieldErrors?.email ? "dispatch-email-error" : undefined
          }
          className={`w-full border bg-vintage-passport px-4 py-3.5 text-base text-deep-harbor ${
            state.fieldErrors?.email ? "border-compass-gold" : "border-salt-air"
          }`}
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full whitespace-nowrap bg-aegean-ink px-8 py-3.5 text-sm uppercase tracking-[0.15em] text-vintage-passport transition-colors hover:bg-deep-harbor disabled:opacity-60"
        >
          {pending ? "Sending…" : "Subscribe"}
        </button>
      </div>
      <div aria-live="polite">
        {state.status === "error" && (
          <p
            id="dispatch-email-error"
            className="mt-2 text-xs font-medium text-deep-harbor"
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
