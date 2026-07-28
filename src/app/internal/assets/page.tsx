import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * INTERNAL image assets — every PNG hosted at /email-assets/*, for pasting
 * live URLs into HTML emails. Emails can't inline CSS transforms or SVG
 * reliably (Gmail strips them), so decorative graphics get rendered flat
 * and hosted here instead. Token-gated outside development; noindexed.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal — Image Assets",
  robots: { index: false, follow: false },
};

const BASE_URL = "https://www.bonvtravelcompany.com";
const ASSETS_DIR = path.join(process.cwd(), "public", "email-assets");

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const authorized =
    process.env.NODE_ENV === "development" || (!!token && key === token);
  if (!authorized) notFound();

  let files: string[] = [];
  try {
    files = (await readdir(ASSETS_DIR)).filter((f) =>
      /\.(png|jpg|jpeg|gif|webp)$/i.test(f)
    );
  } catch {
    files = [];
  }
  files.sort();

  return (
    <main className="min-h-screen bg-vintage-passport px-6 py-16 text-deep-harbor">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[3px] text-compass-gold">
          Internal
        </p>
        <h1 className="mt-2 text-3xl">Image Assets</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-deep-harbor/70">
          Flat PNGs for HTML emails — Gmail strips inline SVG and CSS
          transforms, so anything decorative (angled stamps, etc.) ships
          as an image hosted here instead. Copy the URL into an{" "}
          <code>&lt;img src=&quot;...&quot;&gt;</code> tag.
        </p>

        {files.length === 0 ? (
          <p className="mt-10 text-sm text-deep-harbor/60">
            No assets yet. Drop PNGs in <code>public/email-assets/</code>.
          </p>
        ) : (
          <ul className="mt-10 space-y-8">
            {files.map((file) => {
              const url = `${BASE_URL}/email-assets/${file}`;
              return (
                <li
                  key={file}
                  className="border border-salt-air/60 bg-white/40 p-5"
                >
                  <div className="flex flex-wrap items-start gap-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/email-assets/${file}`}
                      alt={file}
                      className="max-h-40 max-w-[220px] border border-salt-air/40 bg-[repeating-conic-gradient(#e9e2d3_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-2"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm">{file}</p>
                      <p className="mt-2 break-all rounded bg-deep-harbor/5 px-3 py-2 font-mono text-xs">
                        {url}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
