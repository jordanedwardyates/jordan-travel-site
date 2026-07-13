import Rule from "./Rule";

/** Colophon footer — printer's imprint, not a booking-site basement. */
export default function SiteFooter() {
  return (
    <footer className="px-6 pb-14 pt-4 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Rule variant="double" />
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <p className="font-serif text-lg tracking-tight">Jordan Yates</p>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-sun-faded">
            The Aegean Passport
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
            Virtuoso member &middot; Affiliated with Luxury Cruise Connections
            &middot; Advisor services are complimentary
          </p>
        </div>
      </div>
    </footer>
  );
}
