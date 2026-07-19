import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleBody from "@/components/ArticleBody";
import Button from "@/components/Button";
import Rule from "@/components/Rule";
import SectionHeading from "@/components/SectionHeading";
import TextLink from "@/components/TextLink";
import TrackView from "@/components/TrackView";
import { getDestination, getDestinations } from "@/lib/destinations";
import { getFieldNote } from "@/lib/fieldNotes";
import { FIELD_NOTES_ENABLED } from "@/lib/flags";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getDestinations().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return { title: "Destination not found" };
  const url = `/destinations/${slug}`;
  return {
    title: dest.name,
    description: dest.dek,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${dest.name} — Destination Guide`,
      description: dest.dek,
    },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();

  const related =
    FIELD_NOTES_ENABLED && dest.relatedNote
      ? getFieldNote(dest.relatedNote)
      : null;

  return (
    <article className="px-6 py-14 sm:py-20">
      <TrackView entityType="destination" slug={dest.slug} />
      <div className="mx-auto max-w-[68ch]">
        <TextLink href="/destinations" className="text-sm">
          &larr; All destinations
        </TextLink>

        <header className="mt-8">
          <p className="text-kicker uppercase text-sea-glass oldstyle-nums">
            {dest.coordinates}
          </p>
          <h1 className="mt-3 font-serif text-display tracking-tight">
            {dest.name}
          </h1>
          <p className="mt-4 font-serif text-xl italic leading-relaxed text-aegean-ink">
            {dest.dek}
          </p>
        </header>

        <Rule className="my-10" />

        <ArticleBody blocks={dest.intro} />

        {/* When to sail */}
        <div className="mt-12 border border-salt-air bg-linen p-1">
          <div className="border border-salt-air/60 px-6 py-6">
            <SectionHeading kicker="When to Sail" align="left" />
            <p className="mt-4 font-serif text-lg leading-relaxed">
              {dest.whenToSail}
            </p>
          </div>
        </div>

        {/* Ports worth the time */}
        <section className="mt-12">
          <SectionHeading kicker="Ports Worth the Time" align="left" />
          <ul className="mt-6 divide-y divide-salt-air border-y border-salt-air">
            {dest.ports.map((p) => (
              <li key={p.name} className="py-5 sm:flex sm:gap-6">
                <p className="font-serif text-xl tracking-tight text-deep-harbor sm:w-44 sm:shrink-0">
                  {p.name}
                </p>
                <p className="mt-1 font-serif leading-relaxed text-aegean-ink sm:mt-0">
                  {p.note}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Ships that do it right */}
        <section className="mt-12">
          <SectionHeading kicker="Ships That Do It Right" align="left" />
          <div className="mt-6 grid gap-px overflow-hidden border border-salt-air bg-salt-air sm:grid-cols-2">
            {dest.ships.map((s) => (
              <div key={s.name} className="bg-vintage-passport p-6">
                <h3 className="font-serif text-lg tracking-tight text-deep-harbor">
                  {s.name}
                </h3>
                <p className="mt-2 font-serif leading-relaxed text-aegean-ink">
                  {s.note}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-serif text-sm italic leading-relaxed text-aegean-ink">
            Every fare I quote is one I&rsquo;ve negotiated &mdash; so my
            clients never pay retail on any of them.
          </p>
        </section>

        {related && (
          <aside className="mt-12 border border-salt-air bg-linen p-1">
            <div className="border border-salt-air/60 px-6 py-6">
              <p className="text-kicker uppercase text-compass-gold">
                From the Field Notes
              </p>
              <h2 className="mt-2 font-serif text-2xl tracking-tight text-deep-harbor">
                {related.title}
              </h2>
              <p className="mt-2 font-serif italic leading-relaxed text-aegean-ink">
                {related.dek}
              </p>
              <TextLink
                href={`/field-notes/${related.slug}`}
                className="mt-3 inline-block text-sm"
              >
                Read the note &rarr;
              </TextLink>
            </div>
          </aside>
        )}

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-salt-air pt-10 text-center">
          <p className="font-serif text-lg leading-relaxed text-aegean-ink">
            Thinking about {dest.name}? Tell me what draws you, and I&rsquo;ll
            send back a short list worth your time.
          </p>
          <Button href="/#request-a-quote">Request a Quote</Button>
        </div>
      </div>
    </article>
  );
}
