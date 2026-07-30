import { readFile } from "node:fs/promises";
import { notFound } from "next/navigation";
import { resolveAssetPath } from "@/lib/data/instagram-bank";

/**
 * Serves rendered slide/frame images out of `content/instagram/`.
 *
 * They deliberately don't live in `public/` — the canonical copy is the dated
 * folder Jordan uploads from, and duplicating ~800 images into public/ just to
 * preview them would double the repo. `resolveAssetPath` whitelists the shape
 * of the path, so nothing outside the bank is reachable.
 *
 * Token-gated to match the rest of /internal; the gate is open in development.
 */

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const key = new URL(request.url).searchParams.get("key");
  const authorized =
    process.env.NODE_ENV === "development" || (!!token && key === token);
  if (!authorized) notFound();

  const { path: segments } = await params;
  const abs = resolveAssetPath(segments);
  if (!abs) notFound();

  try {
    const file = await readFile(abs);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "image/jpeg",
        // Immutable per render; the filename changes only when content does.
        "Cache-Control": "private, max-age=3600",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch {
    notFound();
  }
}
