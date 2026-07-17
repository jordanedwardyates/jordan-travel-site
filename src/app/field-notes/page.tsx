import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PassportStamp from "@/components/PassportStamp";
import SectionHeading from "@/components/SectionHeading";
import { getFieldNotes } from "@/lib/fieldNotes";
import { FIELD_NOTES_ENABLED } from "@/lib/flags";

const DESCRIPTION =
  "Field Notes — Jordan Yates' house journal. Short, opinionated essays on ships, seasons, and the places worth the trouble.";

export const metadata: Metadata = {
  title: "Field Notes",
  description: DESCRIPTION,
  alternates: { canonical: "/field-notes" },
  openGraph: {
    type: "website",
    url: "/field-notes",
    title: "Field Notes — BON V: A Travel Company",
    description: DESCRIPTION,
  },
};

export default function FieldNotesPage() {
  if (!FIELD_NOTES_ENABLED) notFound();
  const notes = getFieldNotes();

  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="relative">
          <PassportStamp
            text="· FIELD NOTES · JORDAN YATES ·"
            className="absolute -top-6 right-0 hidden h-20 w-20 rotate-12 text-sun-faded opacity-25 lg:block"
          />
          <SectionHeading
            kicker="Field Notes"
            title="Dispatches from the world's finest waters"
          />
        </div>
        <p className="mx-auto mt-6 max-w-[52ch] text-center font-serif text-lg leading-relaxed text-aegean-ink">
          The house journal &mdash; what I&rsquo;ve learned from sailings,
          ship visits, and kept notes. Opinionated, and meant to be.
        </p>

        <ul className="mt-12 divide-y divide-salt-air border-y border-salt-air">
          {notes.map((note) => (
            <li key={note.slug}>
              <Link
                href={`/field-notes/${note.slug}`}
                className="group block py-8 transition-colors hover:bg-linen"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-kicker uppercase text-compass-gold">
                    {note.category}
                  </p>
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-aegean-ink oldstyle-nums">
                    {note.date} &middot; {note.readingMinutes} min
                  </p>
                </div>
                <h3 className="mt-2 font-serif text-2xl tracking-tight text-deep-harbor transition-colors group-hover:text-aegean-ink sm:text-3xl">
                  {note.title}
                </h3>
                <p className="mt-2 font-serif text-lg italic leading-relaxed text-aegean-ink">
                  {note.dek}
                </p>
                <span className="mt-3 inline-block text-sm text-deep-harbor underline decoration-compass-gold/70 underline-offset-4 group-hover:decoration-compass-gold">
                  Read the note &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
