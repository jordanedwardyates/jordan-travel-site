import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import ArticleBody from "@/components/ArticleBody";
import Button from "@/components/Button";
import Rule from "@/components/Rule";
import TextLink from "@/components/TextLink";
import { getDestination } from "@/lib/destinations";
import { getFieldNote, getFieldNotes } from "@/lib/fieldNotes";
import { FIELD_NOTES_ENABLED } from "@/lib/flags";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  if (!FIELD_NOTES_ENABLED) return [];
  return getFieldNotes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getFieldNote(slug);
  if (!note) return { title: "Note not found" };
  const url = `/field-notes/${slug}`;
  return {
    title: note.title,
    description: note.dek,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${note.title} — Field Notes`,
      description: note.dek,
    },
  };
}

export default async function FieldNotePage({ params }: Props) {
  if (!FIELD_NOTES_ENABLED) notFound();
  const { slug } = await params;
  const note = getFieldNote(slug);
  if (!note) notFound();

  const related = note.relatedDestination
    ? getDestination(note.relatedDestination)
    : null;

  return (
    <article className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-[62ch]">
        <TextLink href="/field-notes" className="text-sm">
          &larr; All field notes
        </TextLink>

        <header className="mt-8">
          <p className="text-kicker uppercase text-compass-gold">
            {note.category}
          </p>
          <h1 className="mt-3 font-serif text-display tracking-tight">
            {note.title}
          </h1>
          <p className="mt-4 font-serif text-xl italic leading-relaxed text-aegean-ink">
            {note.dek}
          </p>
          <div className="mt-6 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-aegean-ink oldstyle-nums">
            <span>By Jordan Yates</span>
            <span aria-hidden="true" className="h-px w-6 bg-salt-air" />
            <span>{note.date}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{note.readingMinutes} min read</span>
          </div>
        </header>

        <Rule className="my-10" />

        <ArticleBody blocks={note.body} />

        {/* Sign-off */}
        <div className="mt-10 flex items-center justify-end gap-3">
          <Image
            src="/portrait-engraved.png"
            alt=""
            width={1739}
            height={1739}
            className="h-auto w-12 mix-blend-multiply"
          />
          <p className="font-script text-4xl text-aegean-ink">Jordan</p>
        </div>

        {related && (
          <aside className="mt-12 border border-salt-air bg-linen p-1">
            <div className="border border-salt-air/60 px-6 py-6">
              <p className="text-kicker uppercase text-compass-gold">
                In conversation with
              </p>
              <h2 className="mt-2 font-serif text-2xl tracking-tight text-deep-harbor">
                {related.name}
              </h2>
              <p className="mt-2 font-serif italic leading-relaxed text-aegean-ink">
                {related.dek}
              </p>
              <TextLink
                href={`/destinations/${related.slug}`}
                className="mt-3 inline-block text-sm"
              >
                Read the destination guide &rarr;
              </TextLink>
            </div>
          </aside>
        )}

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-salt-air pt-10 text-center">
          <p className="font-serif text-lg leading-relaxed text-aegean-ink">
            Planning a sailing where this matters? That&rsquo;s exactly the
            conversation I like.
          </p>
          <Button href="/#request-a-quote">Request a Quote</Button>
        </div>
      </div>
    </article>
  );
}
