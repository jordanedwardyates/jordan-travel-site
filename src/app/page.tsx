export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="w-full max-w-[700px] text-center">
        <h1 className="font-serif text-5xl leading-tight tracking-tight sm:text-6xl">
          A more thoughtful way to travel
        </h1>

        <p className="mx-auto mt-8 max-w-[52ch] text-lg leading-relaxed text-aegean-ink">
          I help clients find exceptional cruise experiences — not just good
          deals, but the right journeys.
        </p>

        <section className="mx-auto mt-16 max-w-[54ch] border-t border-sea-glass pt-10">
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
          className="mt-16 inline-block border border-deep-harbor px-8 py-3.5 text-sm tracking-[0.15em] uppercase transition-colors hover:bg-deep-harbor hover:text-vintage-passport"
        >
          Explore Current Journeys
        </a>
      </div>
    </main>
  );
}
