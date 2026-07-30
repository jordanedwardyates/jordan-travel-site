// Batch renderer for the Instagram content bank.
//
//   node content/instagram/_system/render.mjs            # render everything
//   node content/instagram/_system/render.mjs 2026-08-04 # only matching folders
//
// Extends the pattern in scripts/render-email-assets.mjs: style HTML, screenshot
// it with Playwright, ship flat images. Posts render at 1080x1350, reel frames
// at 1080x1920.
//
// Each reel also gets a silent `slate.webm` — a timing reference Jordan can
// talk over immediately. It is deliberately NOT a publishable master: the only
// ffmpeg available in this container is Playwright's bundled build, compiled
// --disable-everything, so it has VP8/webm out and mjpeg in and nothing else —
// no H.264, no mp4 muxer, no audio. The publishable cut is built by the
// per-reel assemble.sh on a machine with a full ffmpeg.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readdir, readFile, writeFile, mkdir, chmod } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderSlide, SIZES } from "./templates.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FFMPEG = "/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux";
const SLATE_FPS = 2;

const filter = process.argv[2] ?? "";

async function listDirs(parent) {
  if (!existsSync(parent)) return [];
  const entries = await readdir(parent, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => e.name)
    .filter((n) => n.includes(filter))
    .sort();
}

async function readJson(p) {
  return JSON.parse(await readFile(p, "utf8"));
}

/**
 * Screenshot one slide spec.
 *
 * Output is JPEG, not PNG. Every slide carries the turbulence-based paper
 * grain and foxing, which is noise — PNG cannot compress it, so slides landed
 * at ~1.25 MB each and the full bank came to roughly a gigabyte. Instagram
 * re-encodes to JPEG on upload regardless, so the quality ceiling is JPEG
 * either way; q92 is visually indistinguishable here at about a tenth the size.
 */
async function shoot(page, slide, kind, outBase) {
  const { w, h } = SIZES[kind];
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(renderSlide(slide, kind), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${outBase}.jpg`, type: "jpeg", quality: 92 });
}

/**
 * Build the silent timing slate. Frames are fed as concatenated JPEGs on stdin
 * (image2pipe/mjpeg is the only demuxer+decoder this ffmpeg has), each repeated
 * `seconds * SLATE_FPS` times to hold on screen.
 */
async function buildSlate(jpegPaths, durations, outPath) {
  const buffers = [];
  for (let i = 0; i < jpegPaths.length; i++) {
    const buf = await readFile(jpegPaths[i]);
    const holds = Math.max(1, Math.round((durations[i] ?? 3) * SLATE_FPS));
    for (let k = 0; k < holds; k++) buffers.push(buf);
  }
  const payload = Buffer.concat(buffers);

  await new Promise((resolve, reject) => {
    const ff = spawn(FFMPEG, [
      "-y",
      "-f", "image2pipe",
      "-vcodec", "mjpeg",
      "-r", String(SLATE_FPS),
      // This build enables only the pipe: and file: protocols, so bare "-" for
      // stdin does not resolve — it has to be named explicitly.
      "-i", "pipe:0",
      "-c:v", "libvpx",
      "-b:v", "1600k",
      "-r", String(SLATE_FPS),
      outPath,
    ]);
    let err = "";
    ff.stderr.on("data", (d) => (err += d.toString()));
    ff.on("error", reject);
    ff.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}\n${err.slice(-1500)}`)),
    );
    ff.stdin.on("error", () => {});
    ff.stdin.end(payload);
  });
}

/**
 * The real mastercut script. Runs where a full ffmpeg exists (Jordan's Mac:
 * `brew install ffmpeg`). Any b-roll dropped into the reel's footage/ folder
 * as 01.mp4, 02.mp4 … replaces the corresponding storyboard frame; frames with
 * no matching clip stay as stills. Output is a 1080x1920 H.264 mp4 with silent
 * audio, ready to import into CapCut/Descript/Premiere for the voice-over.
 */
function assembleScript(slug, frames) {
  const lines = frames
    .map((f, i) => {
      const n = String(i + 1).padStart(2, "0");
      return `  [ "${n}" "${(f.seconds ?? 3).toFixed(2)}" ]`;
    })
    .join("\n");
  return `#!/usr/bin/env bash
# Mastercut for ${slug}
#
# Builds a silent 1080x1920 H.264 mp4 from the storyboard frames, substituting
# any b-roll you drop into ./footage/ (name clips 01.mp4, 02.mp4 … to match the
# frame they replace). Then open the mp4 in CapCut / Descript / Premiere and
# record your voice-over against it — the cut timings already match transcript.md.
#
#   brew install ffmpeg     # if you don't have it
#   ./assemble.sh
#
set -euo pipefail
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "ffmpeg not found — run: brew install ffmpeg"; exit 1; }

FRAMES=(
${lines}
)

WORK=".assemble"
rm -rf "$WORK"; mkdir -p "$WORK"
i=0
for entry in "\${FRAMES[@]}"; do
  read -r n secs <<< "$entry"
  i=$((i+1))
  clip="$WORK/seg_$n.mp4"
  if [ -f "footage/$n.mp4" ]; then
    # Real b-roll: cover-fit to 1080x1920, trim to the frame's duration.
    ffmpeg -y -loglevel error -i "footage/$n.mp4" -t "$secs" \\
      -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1" \\
      -an -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$clip"
  else
    # No footage yet: hold the storyboard frame as a still.
    ffmpeg -y -loglevel error -loop 1 -t "$secs" -i "frames/$n.jpg" \\
      -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xf6f1e8,fps=30,setsar=1" \\
      -an -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$clip"
  fi
  echo "file '$(basename "$clip")'" >> "$WORK/list.txt"
done

ffmpeg -y -loglevel error -f concat -safe 0 -i "$WORK/list.txt" -c copy "$WORK/video.mp4"
# Silent stereo track so editors that expect audio don't choke on import.
ffmpeg -y -loglevel error -i "$WORK/video.mp4" -f lavfi -i anullsrc=r=48000:cl=stereo \\
  -shortest -c:v copy -c:a aac -b:a 128k "${slug}-mastercut.mp4"
rm -rf "$WORK"
echo "✓ ${slug}-mastercut.mp4  — talk over this one."
`;
}

async function main() {
  // The container ships a Chromium build that may not match the one this
  // Playwright version expects, and PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD is set —
  // so use whatever chrome-linux/chrome is actually on disk when present.
  const [preinstalled] = existsSync("/opt/pw-browsers")
    ? readdirSync("/opt/pw-browsers")
        .filter((d) => d.startsWith("chromium-"))
        .map((d) => path.join("/opt/pw-browsers", d, "chrome-linux", "chrome"))
        .filter(existsSync)
    : [];
  const browser = await chromium.launch(
    preinstalled ? { executablePath: preinstalled } : {},
  );
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  let posts = 0;
  let postSlides = 0;
  let reels = 0;
  let reelFrames = 0;
  const problems = [];

  // ---- carousels -------------------------------------------------------
  for (const slug of await listDirs(path.join(ROOT, "posts"))) {
    const dir = path.join(ROOT, "posts", slug);
    const specPath = path.join(dir, "slides.json");
    if (!existsSync(specPath)) {
      problems.push(`posts/${slug}: no slides.json`);
      continue;
    }
    try {
      const slides = await readJson(specPath);
      const out = path.join(dir, "slides");
      await mkdir(out, { recursive: true });
      for (let i = 0; i < slides.length; i++) {
        const s = { index: `${i + 1} / ${slides.length}`, ...slides[i] };
        await shoot(page, s, "post", path.join(out, String(i + 1).padStart(2, "0")));
        postSlides++;
      }
      // Keep the generated HTML alongside for hand-tweaking a slide later.
      await writeFile(
        path.join(out, "_preview.html"),
        slides
          .map((s, i) => renderSlide({ index: `${i + 1} / ${slides.length}`, ...s }, "post"))
          .join("\n<hr>\n"),
      );
      posts++;
      process.stdout.write(`· post ${slug} (${slides.length})\n`);
    } catch (e) {
      problems.push(`posts/${slug}: ${e.message}`);
    }
  }

  // ---- reels -----------------------------------------------------------
  for (const slug of await listDirs(path.join(ROOT, "reels"))) {
    const dir = path.join(ROOT, "reels", slug);
    const specPath = path.join(dir, "frames.json");
    if (!existsSync(specPath)) {
      problems.push(`reels/${slug}: no frames.json`);
      continue;
    }
    try {
      const frames = await readJson(specPath);
      const out = path.join(dir, "frames");
      await mkdir(out, { recursive: true });
      const jpegs = [];
      for (let i = 0; i < frames.length; i++) {
        const base = path.join(out, String(i + 1).padStart(2, "0"));
        await shoot(page, frames[i], "reel", base);
        jpegs.push(`${base}.jpg`);
        reelFrames++;
      }
      // The frames double as the slate's source: mjpeg is the only decoder
      // this ffmpeg has, and JPEG is already the delivered format.
      await buildSlate(
        jpegs,
        frames.map((f) => f.seconds ?? 3),
        path.join(dir, "slate.webm"),
      );

      const sh = path.join(dir, "assemble.sh");
      await writeFile(sh, assembleScript(slug, frames));
      await chmod(sh, 0o755);
      await mkdir(path.join(dir, "footage"), { recursive: true });
      reels++;
      process.stdout.write(`· reel ${slug} (${frames.length})\n`);
    } catch (e) {
      problems.push(`reels/${slug}: ${e.message}`);
    }
  }

  await browser.close();

  console.log(
    `\n${posts} posts / ${postSlides} slides · ${reels} reels / ${reelFrames} frames`,
  );
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    for (const p of problems) console.log(`  ! ${p}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
