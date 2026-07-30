import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listBank, summarise, type Piece } from "@/lib/data/instagram-bank";

/**
 * INTERNAL — the Instagram desk. Browse the evergreen bank in publish order,
 * filter it, and open a piece to copy its caption or read its transcript.
 *
 * Reads `content/instagram/` off disk (see src/lib/data/instagram-bank.ts).
 * Token-gated outside development; noindexed.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal — Instagram",
  robots: { index: false, follow: false },
};

const TYPE_LABEL: Record<string, string> = { post: "Carousel", reel: "Reel" };

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`border px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] transition-colors ${
        active
          ? "border-compass-gold bg-compass-gold/10 text-compass-gold"
          : "border-sea-glass/40 text-deep-harbor/60 hover:border-compass-gold/60"
      }`}
    >
      {children}
    </Link>
  );
}

function Row({ piece, keyParam }: { piece: Piece; keyParam: string }) {
  const { meta, images, type, slug } = piece;
  const thumb = images[0]
    ? `/internal/instagram/asset/${type === "post" ? "posts" : "reels"}/${slug}/${
        type === "post" ? "slides" : "frames"
      }/${images[0]}${keyParam}`
    : null;

  return (
    <Link
      href={`/internal/instagram/${type}/${slug}${keyParam}`}
      className="group flex gap-5 border-b border-sea-glass/25 py-5 transition-colors hover:bg-linen/60"
    >
      <div className="w-16 shrink-0">
        {thumb ? (
          /* Served by a token-gated route outside /public, so next/image
             cannot fetch it. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="w-16 border border-sea-glass/30"
            loading="lazy"
          />
        ) : (
          <div className="flex h-20 w-16 items-center justify-center border border-dashed border-sea-glass/40 text-[0.55rem] uppercase tracking-[0.15em] text-sun-faded">
            No render
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[0.7rem] text-compass-gold">{meta.date}</span>
          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-sun-faded">
            {TYPE_LABEL[meta.type] ?? meta.type}
          </span>
          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-sea-glass">
            {meta.format}
            {meta.runtime_seconds ? ` · ${meta.runtime_seconds}s` : ""}
          </span>
        </div>

        <h2 className="mt-1.5 text-lg leading-snug text-deep-harbor group-hover:text-aegean-ink">
          {meta.title}
        </h2>
        {meta.hook ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-deep-harbor/60">
            {meta.hook}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.62rem] uppercase tracking-[0.15em] text-sun-faded">
          <span>{meta.pillar}</span>
          <span>
            {images.length || 0} {type === "post" ? "slides" : "frames"}
          </span>
          <span>CTA: {meta.cta}</span>
          {meta.status !== "draft" ? (
            <span className="text-compass-gold">{meta.status}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default async function InstagramDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; type?: string; pillar?: string }>;
}) {
  const { key, type, pillar } = await searchParams;
  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const authorized =
    process.env.NODE_ENV === "development" || (!!token && key === token);
  if (!authorized) notFound();

  const keyParam = key ? `?key=${encodeURIComponent(key)}` : "";
  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (key) p.set("key", key);
    for (const [k, v] of Object.entries({ type, pillar, ...extra })) {
      if (v) p.set(k, v);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const all = await listBank();
  const summary = summarise(all);
  const pieces = all.filter(
    (p) => (!type || p.type === type) && (!pillar || p.meta.pillar === pillar),
  );

  return (
    <main className="min-h-screen bg-vintage-passport px-6 py-16 text-deep-harbor">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[3px] text-compass-gold">Internal</p>
        <h1 className="mt-2 text-3xl">Instagram</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-deep-harbor/70">
          The evergreen bank — {summary.posts} carousels and {summary.reels} reels,
          in intended publish order
          {summary.firstDate ? ` from ${summary.firstDate} to ${summary.lastDate}` : ""}.
          Open a piece to copy its caption, preview its slides, or read the
          voice-over script. Dates are a running order, not a commitment.
        </p>

        {summary.unrendered > 0 ? (
          <p className="mt-4 border-l-2 border-compass-gold pl-3 text-sm text-deep-harbor/70">
            {summary.unrendered} piece
            {summary.unrendered === 1 ? "" : "s"} not yet rendered — run{" "}
            <code className="text-xs">
              node content/instagram/_system/render.mjs
            </code>
            .
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          <Chip href={qs({ type: undefined })} active={!type}>
            All {all.length}
          </Chip>
          <Chip href={qs({ type: "post" })} active={type === "post"}>
            Carousels {summary.posts}
          </Chip>
          <Chip href={qs({ type: "reel" })} active={type === "reel"}>
            Reels {summary.reels}
          </Chip>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Chip href={qs({ pillar: undefined })} active={!pillar}>
            Every pillar
          </Chip>
          {summary.pillars.map((p) => (
            <Chip key={p} href={qs({ pillar: p })} active={pillar === p}>
              {p}
            </Chip>
          ))}
        </div>

        <div className="mt-10">
          {pieces.length === 0 ? (
            <p className="text-sm text-deep-harbor/60">Nothing matches that filter.</p>
          ) : (
            pieces.map((p) => (
              <Row key={`${p.type}-${p.slug}`} piece={p} keyParam={keyParam} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
