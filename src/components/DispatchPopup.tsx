"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { subscribeToDispatch, type FormState } from "@/app/actions";

const INITIAL: FormState = { status: "idle" };
const DISMISSED_KEY = "dispatch-popup-dismissed";
const SCROLL_TRIGGER_RATIO = 0.6;
const ARM_DELAY_MS = 4000;

export default function DispatchPopup() {
  const [state, formAction, pending] = useActionState(
    subscribeToDispatch,
    INITIAL
  );
  const [open, setOpen] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const armedRef = useRef(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const isDesktop = window.matchMedia("(pointer: fine)").matches;
    const armTimer = setTimeout(() => {
      armedRef.current = true;
    }, ARM_DELAY_MS);

    const show = () => {
      if (shownRef.current || !armedRef.current) return;
      shownRef.current = true;
      setOpen(true);
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    const onScroll = () => {
      const scrolled =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled >= SCROLL_TRIGGER_RATIO) show();
    };

    if (isDesktop) {
      document.addEventListener("mouseleave", onMouseLeave);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (open) emailInputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(close, 2600);
      return () => clearTimeout(timer);
    }
  }, [state.status]);

  function close() {
    setOpen(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispatch-popup-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep-harbor/50 px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative w-full max-w-[28rem] border border-salt-air bg-vintage-passport p-8 shadow-xl sm:p-10">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 text-lg leading-none text-aegean-ink transition-colors hover:text-deep-harbor"
        >
          &times;
        </button>

        {state.status === "success" ? (
          <p role="status" className="font-serif text-lg italic">
            You&rsquo;re on the list &mdash; the next letter will find you.
          </p>
        ) : (
          <>
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-compass-gold">
              Stamped: The Weekly Edit
            </p>
            <h2
              id="dispatch-popup-heading"
              className="mt-2 font-serif text-2xl tracking-tight text-deep-harbor"
            >
              Before you go &mdash; join the list
            </h2>
            <p className="mt-3 font-serif text-base leading-relaxed text-aegean-ink">
              Once a week, the best fares I&rsquo;ve negotiated on the
              world&rsquo;s finest cruise lines. One email, no filler.
            </p>

            <form action={formAction} className="mt-6">
              <input type="hidden" name="source" value="popup" />
              {/* Honeypot — hidden from people, tempting to bots */}
              <div
                aria-hidden="true"
                className="absolute -left-[9999px] h-px w-px overflow-hidden"
              >
                <label htmlFor="dispatch-popup-website">Website</label>
                <input
                  id="dispatch-popup-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <label
                htmlFor="dispatch-popup-email"
                className="block text-[0.65rem] uppercase tracking-[0.2em] text-deep-harbor"
              >
                Email
              </label>
              <div className="mt-1.5 flex flex-col gap-3">
                <input
                  ref={emailInputRef}
                  id="dispatch-popup-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  maxLength={200}
                  aria-invalid={state.fieldErrors?.email ? true : undefined}
                  aria-describedby={
                    state.fieldErrors?.email
                      ? "dispatch-popup-email-error"
                      : undefined
                  }
                  className={`w-full border bg-vintage-passport px-4 py-3.5 text-base text-deep-harbor ${
                    state.fieldErrors?.email
                      ? "border-compass-gold"
                      : "border-salt-air"
                  }`}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="relative w-full whitespace-nowrap bg-aegean-ink px-8 py-3.5 text-sm uppercase tracking-[0.15em] text-vintage-passport transition-all duration-150 before:pointer-events-none before:absolute before:inset-[4px] before:border before:border-vintage-passport/40 before:transition-colors before:duration-150 hover:bg-deep-harbor hover:before:border-compass-gold/70 active:translate-y-px disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Subscribe"}
                </button>
              </div>
              <div aria-live="polite">
                {state.status === "error" && (
                  <p
                    id="dispatch-popup-email-error"
                    className="mt-2 text-xs font-medium text-deep-harbor"
                  >
                    {state.message}
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
