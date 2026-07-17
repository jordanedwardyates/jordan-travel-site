import type { Block } from "@/lib/content";

/**
 * Renders an editorial block array as a printed article: a drop-cap on the
 * opening paragraph, small-caps subheads, and gold-ruled pull quotes.
 * `dropCap` can be turned off where a piece opens on something else.
 */
export default function ArticleBody({
  blocks,
  dropCap = true,
}: {
  blocks: Block[];
  dropCap?: boolean;
}) {
  let firstPara = true;

  return (
    <div className="space-y-6 font-serif text-lg leading-relaxed">
      {blocks.map((block, i) => {
        if (block.type === "subhead") {
          return (
            <h2
              key={i}
              className="pt-2 text-kicker font-medium uppercase text-deep-harbor"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "pull") {
          return (
            <blockquote
              key={i}
              className="my-8 border-l-2 border-compass-gold pl-6 font-serif text-2xl italic leading-snug text-aegean-ink"
            >
              {block.text}
            </blockquote>
          );
        }

        const isDropCap = dropCap && firstPara;
        firstPara = false;
        return (
          <p
            key={i}
            className={
              isDropCap
                ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:font-medium first-letter:leading-[0.8] first-letter:text-deep-harbor"
                : undefined
            }
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
