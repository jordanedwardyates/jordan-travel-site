import Link from "next/link";

import Rule from "./Rule";

// Real pages now; the Quote link stays a root-relative anchor so it resolves
// from anywhere, not just home.
const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/destinations", label: "Destinations" },
  { href: "/journeys", label: "Journeys" },
  { href: "/field-notes", label: "Field Notes" },
];

/** Masthead — publication nameplate with a double rule beneath. */
export default function SiteHeader() {
  return (
    <header className="px-6 pt-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-baseline sm:justify-between">
          <Link href="/" className="text-center sm:text-left">
            <span className="font-serif text-2xl tracking-tight text-deep-harbor">
              BON V:
            </span>{" "}
            <span className="font-serif text-lg italic text-aegean-ink">
              A Travel Company
            </span>
            <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.3em] text-aegean-ink">
              Jordan Yates &middot; Luxury Voyage Advisor
            </span>
          </Link>
          <nav
            aria-label="Main"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm sm:gap-x-7"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-aegean-ink transition-colors hover:text-deep-harbor"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/#request-a-quote"
              className="text-xs uppercase tracking-[0.15em] text-deep-harbor underline decoration-compass-gold/70 underline-offset-4 hover:decoration-compass-gold"
            >
              Request a Quote
            </Link>
          </nav>
        </div>
        <Rule variant="double" className="mt-6" />
      </div>
    </header>
  );
}
