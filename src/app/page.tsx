export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 sm:py-20">
      <div className="flex w-full max-w-[700px] flex-1 flex-col items-center text-center">
        {/* Masthead */}
        <header className="flex flex-col items-center">
          {/* Placeholder avatar — to be replaced with the engraved portrait */}
          <div
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-sea-glass bg-linen font-serif text-xl text-sun-faded"
          >
            JY
          </div>
          <p className="mt-5 font-serif text-3xl tracking-tight">
            Jordan Yates
          </p>
          <p className="mt-2 text-[0.7rem] uppercase tracking-[0.3em] text-sun-faded">
            Luxury Cruise Advisor
          </p>
        </header>

        {/* Headline with faint passport stamp */}
        <div className="relative mt-20 sm:mt-24">
          <svg
            aria-hidden="true"
            viewBox="0 0 120 120"
            className="absolute -top-12 -right-4 h-24 w-24 -rotate-12 text-sun-faded opacity-30 sm:-right-14"
          >
            <circle
              cx="60"
              cy="60"
              r="57"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="60"
              cy="60"
              r="43"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              id="stamp-arc"
              d="M 60 10 A 50 50 0 1 1 59.99 10"
              fill="none"
            />
            <text
              fill="currentColor"
              fontSize="9"
              fontFamily="var(--font-geist-sans)"
            >
              <textPath
                href="#stamp-arc"
                startOffset="0"
                textLength="312"
                lengthAdjust="spacing"
              >
                · THE AEGEAN PASSPORT · MEDITERRANEAN
              </textPath>
            </text>
          </svg>
          <h1 className="font-serif text-5xl leading-tight tracking-tight sm:text-6xl">
            A more thoughtful way to travel
          </h1>
        </div>

        <p className="mx-auto mt-8 max-w-[52ch] text-lg leading-relaxed text-aegean-ink">
          I help clients find exceptional cruise experiences — not just good
          deals, but the right journeys.
        </p>

        {/* Jordan's Take */}
        <section className="mx-auto mt-16 max-w-[54ch] border-y border-sea-glass py-10">
          <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-compass-gold">
            Jordan&rsquo;s Take
          </h2>
          <p className="mt-5 font-serif text-xl italic leading-relaxed">
            &ldquo;The difference between a good trip and a memorable one
            usually comes down to time — time in port, time at dinner, time to
            actually enjoy where you are.&rdquo;
          </p>
        </section>

        <a
          href="#"
          className="mt-16 inline-block bg-aegean-ink px-12 py-4 text-sm tracking-[0.15em] uppercase text-vintage-passport transition-colors hover:bg-deep-harbor"
        >
          Explore Current Journeys
        </a>
      </div>
    </main>
  );
}
