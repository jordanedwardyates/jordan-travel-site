import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPiece, type PieceType } from "@/lib/data/instagram-bank";
import CopyButton from "../../CopyButton";

/**
 * INTERNAL — one piece from the Instagram bank: the rendered slides or reel
 * frames, the paste-ready caption, and for reels the voice-over transcript and
 * footage brief. Token-gated outside development; noindexed.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal — Instagram piece",
  robots: { index: false, follow: false },
};

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between gap-4 border-b border-sea-glass/30 pb-2">
        <h2 className="text-[0.68rem] uppercase tracking-[0.25em] text-compass-gold">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Captions and transcripts are markdown-ish; preserve the line breaks that
 *  matter (paragraphing is load-bearing in an Instagram caption). */
function Prose({ text }: { text: string }) {
  return (
    <pre className="mt-4 whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed text-deep-harbor/85">
      {text.trim()}
    </pre>
  );
}

export default async function PiecePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; slug: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const authorized =
    process.env.NODE_ENV === "development" || (!!token && key === token);
  if (!authorized) notFound();

  const { type, slug } = await params;
  if (type !== "post" && type !== "reel") notFound();

  const piece = await getPiece(type as PieceType, slug);
  if (!piece) notFound();

  const keyParam = key ? `?key=${encodeURIComponent(key)}` : "";
  const { meta, images } = piece;
  const folder = type === "post" ? "posts" : "reels";
  const sub = type === "post" ? "slides" : "frames";
  const assetUrl = (file: string) =>
    `/internal/instagram/asset/${folder}/${slug}/${sub}/${file}${keyParam}`;

  return (
    <main className="min-h-screen bg-vintage-passport px-6 py-16 text-deep-harbor">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/internal/instagram${keyParam}`}
          className="text-[0.65rem] uppercase tracking-[0.2em] text-sun-faded hover:text-compass-gold"
        >
          ← All pieces
        </Link>

        <p className="mt-6 flex flex-wrap items-baseline gap-x-3 text-[0.65rem] uppercase tracking-[0.2em] text-sun-faded">
          <span className="font-mono text-compass-gold">{meta.date}</span>
          <span>{type === "post" ? "Carousel" : "Reel"}</span>
          <span>{meta.pillar}</span>
          <span>{meta.format}</span>
          {meta.runtime_seconds ? <span>{meta.runtime_seconds}s</span> : null}
          {meta.words ? <span>{meta.words} words</span> : null}
        </p>

        <h1 className="mt-2 text-3xl leading-tight">{meta.title}</h1>
        {meta.hook ? (
          <p className="mt-3 text-base leading-relaxed text-deep-harbor/70">{meta.hook}</p>
        ) : null}

        <p className="mt-4 font-mono text-[0.7rem] text-sun-faded">
          content/instagram/{folder}/{slug}/
        </p>

        {/* ---- the renders ---- */}
        <Section title={type === "post" ? `${images.length} slides` : `${images.length} frames`}>
          {images.length === 0 ? (
            <p className="mt-4 text-sm text-deep-harbor/60">
              Not rendered yet — run{" "}
              <code className="text-xs">
                node content/instagram/_system/render.mjs {meta.date}
              </code>
              .
            </p>
          ) : (
            <div
              className={`mt-5 grid gap-4 ${
                type === "post" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4"
              }`}
            >
              {images.map((file, i) => (
                <a key={file} href={assetUrl(file)} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- token-gated
                      route outside /public; the optimiser can't fetch it */}
                  <img
                    src={assetUrl(file)}
                    alt={`${type === "post" ? "Slide" : "Frame"} ${i + 1}`}
                    className="w-full border border-sea-glass/30 transition-opacity hover:opacity-80"
                    loading="lazy"
                  />
                  <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.15em] text-sun-faded">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </div>
          )}
        </Section>

        {/* ---- caption ---- */}
        {piece.caption ? (
          <Section
            title="Caption"
            action={<CopyButton text={piece.caption.trim()} label="Copy caption" />}
          >
            <Prose text={piece.caption} />
          </Section>
        ) : null}

        {/* ---- reel-only ---- */}
        {piece.transcript ? (
          <Section
            title="Voice-over transcript"
            action={<CopyButton text={piece.transcript.trim()} label="Copy script" />}
          >
            <Prose text={piece.transcript} />
          </Section>
        ) : null}

        {piece.hasSlate ? (
          <Section title="Timing slate">
            <p className="mt-4 text-sm leading-relaxed text-deep-harbor/70">
              A silent reference cut holding each frame for its scripted duration —
              useful to read against before you film anything. Not publishable; run{" "}
              <code className="text-xs">assemble.sh</code> in the folder for the
              1080×1920 master.
            </p>
            <p className="mt-2 font-mono text-[0.7rem] text-sun-faded">
              content/instagram/{folder}/{slug}/slate.webm
            </p>
          </Section>
        ) : null}

        {piece.footage ? (
          <Section title="Footage brief">
            <Prose text={piece.footage} />
          </Section>
        ) : null}

        {/* ---- slide copy as text ---- */}
        {piece.specs.length > 0 ? (
          <Section title="Copy, as text">
            <div className="mt-4 space-y-3">
              {piece.specs.map((s, i) => (
                <div
                  key={i}
                  className="border-l-2 border-sea-glass/40 pl-4 text-sm leading-relaxed text-deep-harbor/75"
                >
                  <span className="mr-2 font-mono text-[0.65rem] text-compass-gold">
                    {String(i + 1).padStart(2, "0")} {String(s.template)}
                  </span>
                  {[s.title, s.text, s.quote, s.subtitle, s.sub]
                    .filter((v): v is string => typeof v === "string")
                    .join(" — ")}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {meta.hashtags.length > 0 ? (
          <Section title="Hashtags">
            <p className="mt-4 text-sm text-deep-harbor/75">{meta.hashtags.join("  ")}</p>
          </Section>
        ) : null}
      </div>
    </main>
  );
}
