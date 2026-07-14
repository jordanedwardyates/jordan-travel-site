import Link from "next/link";

import Rule from "./Rule";

const NAV_LINKS = [
  { href: "#about", label: "About Jordan" },
  { href: "#journeys", label: "Journeys" },
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
            className="flex items-center gap-6 text-sm sm:gap-8"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-aegean-ink transition-colors hover:text-deep-harbor"
              >
                {label}
              </a>
            ))}
            <a
              href="#request-a-quote"
              className="text-xs uppercase tracking-[0.15em] text-deep-harbor underline decoration-compass-gold/70 underline-offset-4 hover:decoration-compass-gold"
            >
              Request a Quote
            </a>
          </nav>
        </div>
        <Rule variant="double" className="mt-6" />
      </div>
    </header>
  );
}
