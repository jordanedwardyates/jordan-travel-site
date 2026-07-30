/**
 * Reads the Instagram content bank in `content/instagram/`.
 *
 * The bank is authored as flat files (one dated folder per piece) rather than
 * rows in Supabase, because the deliverable is a folder Jordan can open and
 * upload from. This module is the read layer for the internal desk at
 * `/internal/instagram` — server-only, filesystem, no database involved.
 *
 * Slide *copy* lives in slides.json and is re-rendered to images by
 * `content/instagram/_system/render.mjs`; nothing here writes.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const BANK_DIR = path.join(process.cwd(), "content", "instagram");

export type PieceType = "post" | "reel";

export type Meta = {
  date: string;
  type: PieceType;
  pillar: string;
  title: string;
  hook: string;
  format: string;
  slides?: number;
  frames?: number;
  runtime_seconds?: number;
  words?: number;
  cta: string;
  hashtags: string[];
  status: string;
};

export type Piece = {
  type: PieceType;
  slug: string;
  meta: Meta;
  /** Rendered image filenames, sorted — slides for posts, frames for reels. */
  images: string[];
  hasSlate: boolean;
};

export type PieceDetail = Piece & {
  caption?: string;
  transcript?: string;
  footage?: string;
  /** Raw slide/frame specs, for showing the copy as text alongside the render. */
  specs: Record<string, unknown>[];
};

const dirFor = (type: PieceType) =>
  path.join(BANK_DIR, type === "post" ? "posts" : "reels");

const imageSubdir = (type: PieceType) => (type === "post" ? "slides" : "frames");

async function readIfPresent(p: string) {
  try {
    return await readFile(p, "utf8");
  } catch {
    return undefined;
  }
}

async function readJsonIfPresent<T>(p: string): Promise<T | undefined> {
  const raw = await readIfPresent(p);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

async function listImages(dir: string) {
  try {
    return (await readdir(dir))
      .filter((f) => /^\d+\.jpg$/.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

/**
 * A folder with no readable meta.json still gets a row — it's a draft in
 * progress, and silently hiding it would be worse than showing it as untitled.
 */
function fallbackMeta(slug: string, type: PieceType): Meta {
  return {
    date: slug.slice(0, 10),
    type,
    pillar: "—",
    title: slug.slice(11).replace(/-/g, " ") || slug,
    hook: "",
    format: "—",
    cta: "—",
    hashtags: [],
    status: "incomplete",
  };
}

async function loadPiece(type: PieceType, slug: string): Promise<Piece> {
  const dir = path.join(dirFor(type), slug);
  const meta = await readJsonIfPresent<Meta>(path.join(dir, "meta.json"));
  const images = await listImages(path.join(dir, imageSubdir(type)));
  const slate = type === "reel" ? await readIfPresent(path.join(dir, "slate.webm")) : undefined;
  return {
    type,
    slug,
    meta: { ...fallbackMeta(slug, type), ...(meta ?? {}), type },
    images,
    hasSlate: type === "reel" && slate !== undefined,
  };
}

async function listSlugs(type: PieceType) {
  try {
    return (await readdir(dirFor(type), { withFileTypes: true }))
      .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/** Every piece in the bank, in publish-date order. */
export async function listBank(): Promise<Piece[]> {
  const [posts, reels] = await Promise.all([listSlugs("post"), listSlugs("reel")]);
  const pieces = await Promise.all([
    ...posts.map((s) => loadPiece("post", s)),
    ...reels.map((s) => loadPiece("reel", s)),
  ]);
  return pieces.sort(
    (a, b) => a.meta.date.localeCompare(b.meta.date) || a.type.localeCompare(b.type),
  );
}

export async function getPiece(
  type: PieceType,
  slug: string,
): Promise<PieceDetail | null> {
  const slugs = await listSlugs(type);
  // Guard against traversal: only names actually present on disk are loadable.
  if (!slugs.includes(slug)) return null;

  const base = await loadPiece(type, slug);
  const dir = path.join(dirFor(type), slug);
  const specFile = type === "post" ? "slides.json" : "frames.json";

  return {
    ...base,
    caption: await readIfPresent(path.join(dir, "caption.md")),
    transcript: await readIfPresent(path.join(dir, "transcript.md")),
    footage: await readIfPresent(path.join(dir, "footage.md")),
    specs:
      (await readJsonIfPresent<Record<string, unknown>[]>(path.join(dir, specFile))) ?? [],
  };
}

/** Resolve a bank-relative image path to an absolute one, or null if unsafe. */
export function resolveAssetPath(segments: string[]): string | null {
  if (segments.some((s) => s === ".." || s.includes("\\") || s.includes("/"))) return null;
  const rel = segments.join("/");
  if (!/^(posts|reels)\/[^/]+\/(slides|frames)\/\d+\.jpg$/.test(rel)) return null;
  const abs = path.join(BANK_DIR, rel);
  // Belt and braces: the resolved path must still sit inside the bank.
  if (!abs.startsWith(BANK_DIR + path.sep)) return null;
  return abs;
}

export type BankSummary = {
  posts: number;
  reels: number;
  pillars: string[];
  statuses: string[];
  firstDate?: string;
  lastDate?: string;
  unrendered: number;
};

export function summarise(pieces: Piece[]): BankSummary {
  const posts = pieces.filter((p) => p.type === "post");
  const reels = pieces.filter((p) => p.type === "reel");
  return {
    posts: posts.length,
    reels: reels.length,
    pillars: [...new Set(pieces.map((p) => p.meta.pillar))].sort(),
    statuses: [...new Set(pieces.map((p) => p.meta.status))].sort(),
    firstDate: pieces[0]?.meta.date,
    lastDate: pieces[pieces.length - 1]?.meta.date,
    unrendered: pieces.filter((p) => p.images.length === 0).length,
  };
}
