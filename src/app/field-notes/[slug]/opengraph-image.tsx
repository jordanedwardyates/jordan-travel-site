import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { getFieldNote, getFieldNotes } from "@/lib/fieldNotes";

export const alt = "Field Notes — BON V: A Travel Company";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getFieldNotes().map((n) => ({ slug: n.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getFieldNote(slug);
  return ogCard({
    kicker: note ? `Field Notes · ${note.category}` : "Field Notes",
    title: note?.title ?? "Field Notes",
    subtitle: note?.dek,
  });
}
