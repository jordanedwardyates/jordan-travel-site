import Link from "next/link";

import Rule from "./Rule";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/destinations", label: "Destinations" },
  { href: "/journeys", label: "Journeys" },
  { href: "/field-notes", label: "Field Notes" },
  { href: "/#request-a-quote", label: "Request a Quote" },
];

/** Colophon footer — printer's imprint, not a booking-site basement. */
export default function SiteFooter() {
  return (
    <footer className="px-6 pb-14 pt-4 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Rule variant="double" />
        <nav
          aria-label="Footer"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
        >
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-aegean-ink transition-colors hover:text-deep-harbor"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="font-serif tracking-tight">
            <span className="text-xl text-deep-harbor">BON V:</span>{" "}
            <span className="text-base italic text-aegean-ink">
              A Travel Company
            </span>
          </p>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-aegean-ink">
            Jordan Yates &middot; Luxury Voyage Advisor
          </p>
          <p
            aria-hidden="true"
            className="mt-1 text-xs tracking-[0.2em] text-sea-glass oldstyle-nums"
          >
            37°26&prime; N &middot; 25°19&prime; E
          </p>
          <p className="mt-5 font-serif text-base leading-relaxed text-aegean-ink">
            <a
              href="mailto:jordan.yates@luxurycruiseconnections.com"
              className="underline decoration-compass-gold/70 underline-offset-4 hover:decoration-compass-gold"
            >
              jordan.yates@luxurycruiseconnections.com
            </a>
            <span aria-hidden="true"> &middot; </span>
            <a
              href="tel:+19046141219"
              className="underline decoration-compass-gold/70 underline-offset-4 hover:decoration-compass-gold oldstyle-nums"
            >
              904-614-1219
            </a>
          </p>
          <p className="mt-4 max-w-[60ch] font-serif text-sm italic leading-relaxed text-aegean-ink">
            In partnership with Luxury Cruise Connections &middot; Virtuoso
            member &middot; Est. 2011 &middot; Advisor services are
            complimentary
          </p>
          <p className="mt-6 text-kicker uppercase text-deep-harbor">
            We&rsquo;ve got places to be.
          </p>
        </div>
      </div>
    </footer>
  );
}
