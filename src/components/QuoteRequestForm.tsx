"use client";

import { useActionState, useEffect, useState } from "react";
import { submitQuoteRequest, type FormState } from "@/app/actions";

export type JourneyOption = { id: string; label: string };

const INITIAL: FormState = { status: "idle" };

const inputClasses = (hasError: boolean) =>
  `mt-1.5 w-full border bg-vintage-passport px-4 py-3 text-base text-deep-harbor placeholder:text-sun-faded/70 ${
    hasError ? "border-compass-gold" : "border-salt-air"
  }`;

const labelClasses =
  "block text-left text-[0.65rem] uppercase tracking-[0.2em] text-deep-harbor";

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-left text-xs font-medium text-deep-harbor">
      {children}
    </p>
  );
}

export default function QuoteRequestForm({
  journeys,
}: {
  journeys: JourneyOption[];
}) {
  const [state, formAction, pending] = useActionState(
    submitQuoteRequest,
    INITIAL
  );
  // Read ?journey=<id> (and ?utm_campaign=/?utm_content= if the visitor
  // arrived from a Dispatch link) after hydration rather than via
  // useSearchParams — this keeps the form in the static HTML for no-JS
  // visitors, and it's the same tag pair the Dispatch webhook already
  // reads off clicked links, so a submitted quote can be traced back to
  // the letter that drove it.
  const [journeyValue, setJourneyValue] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmContent, setUtmContent] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("journey");
    const match = journeys.find((j) => j.id === id);
    if (match) setJourneyValue(`${match.id}|${match.label}`);
    setUtmCampaign(params.get("utm_campaign") ?? "");
    setUtmContent(params.get("utm_content") ?? "");
  }, [journeys]);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="mt-8 w-full max-w-[34rem] border border-salt-air bg-vintage-passport p-1"
      >
        <div className="border border-salt-air/60 px-6 py-8">
          <p className="font-serif text-xl">
            Thank you &mdash; your note is on its way.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-aegean-ink">
            I read every request myself and will reply personally, usually
            within a day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 w-full max-w-[34rem]">
      {/* Honeypot — hidden from people, tempting to bots */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="quote-website">Website</label>
        <input
          id="quote-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Dispatch attribution — silent unless the visitor arrived via a
          tagged link, in which case these carry the campaign/voyage
          through to the insert. */}
      <input type="hidden" name="utmCampaign" value={utmCampaign} />
      <input type="hidden" name="utmContent" value={utmContent} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-name" className={labelClasses}>
            Name
          </label>
          <input
            id="quote-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={160}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "quote-name-error" : undefined}
            className={inputClasses(Boolean(errors.name))}
          />
          <FieldError id="quote-name-error">{errors.name}</FieldError>
        </div>
        <div>
          <label htmlFor="quote-email" className={labelClasses}>
            Email
          </label>
          <input
            id="quote-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            maxLength={200}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "quote-email-error" : undefined}
            className={inputClasses(Boolean(errors.email))}
          />
          <FieldError id="quote-email-error">{errors.email}</FieldError>
        </div>
        <div>
          <label htmlFor="quote-phone" className={labelClasses}>
            Phone <span className="text-aegean-ink">(optional)</span>
          </label>
          <input
            id="quote-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={40}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "quote-phone-error" : undefined}
            className={inputClasses(Boolean(errors.phone))}
          />
          <FieldError id="quote-phone-error">{errors.phone}</FieldError>
        </div>
        <div>
          <label htmlFor="quote-journey" className={labelClasses}>
            Journey of interest <span className="text-aegean-ink">(optional)</span>
          </label>
          <select
            id="quote-journey"
            name="journey"
            value={journeyValue}
            onChange={(e) => setJourneyValue(e.target.value)}
            className={inputClasses(false)}
          >
            <option value="">A general inquiry</option>
            {journeys.map((j) => (
              <option key={j.id} value={`${j.id}|${j.label}`}>
                {j.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="quote-message" className={labelClasses}>
          Where are you thinking of going?
        </label>
        <textarea
          id="quote-message"
          name="message"
          required
          rows={5}
          maxLength={4000}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "quote-message-error" : undefined}
          className={inputClasses(Boolean(errors.message))}
        />
        <FieldError id="quote-message-error">{errors.message}</FieldError>
      </div>

      <p className="mt-4 text-left text-xs leading-relaxed text-aegean-ink">
        Your details are used only to reply to your inquiry &mdash; never
        shared, never added to a list without your say-so.
      </p>

      <div aria-live="polite">
        {state.status === "error" && !state.fieldErrors && (
          <p className="mt-4 text-left text-sm font-medium text-deep-harbor">
            {state.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="relative mt-6 inline-block whitespace-nowrap bg-aegean-ink px-10 py-4 text-sm uppercase tracking-[0.15em] text-vintage-passport transition-all duration-150 before:pointer-events-none before:absolute before:inset-[4px] before:border before:border-vintage-passport/40 before:transition-colors before:duration-150 hover:bg-deep-harbor hover:before:border-compass-gold/70 active:translate-y-px disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send to Jordan"}
      </button>
    </form>
  );
}
