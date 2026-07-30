// Regenerates content/instagram/CALENDAR.md from every meta.json on disk.
//
//   node content/instagram/_system/build-calendar.mjs
//
// The calendar is derived, never hand-edited — change a meta.json and re-run.
// Also doubles as a linter: it reports missing files, wrong slide counts,
// hashtag counts that drift from the house rule of 4, and reels whose frame
// durations don't add up to their stated runtime.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Copy is not auto-shrunk by the templates, so anything over these lengths
 * silently overflows the slide. The limits mirror AUTHORING.md — keep the two
 * in step. Checked here rather than trusted to whoever wrote the copy.
 */
const LIMITS = {
  cover: { title: 58, subtitle: 105 },
  photo: { title: 78, caption: 155 },
  statement: { text: 90, sub: 180 },
  quote: { quote: 130 },
  cta: { title: 60, body: 170 },
  frame: { text: 60, sub: 90 },
};

function checkFit(s, n) {
  const out = [];
  const at = `slide ${n} (${s.template})`;

  for (const [field, max] of Object.entries(LIMITS[s.template] ?? {})) {
    const v = s[field];
    if (typeof v !== "string") continue;
    // A frame that drops its type size can carry proportionally more text.
    const allowed =
      s.template === "frame" && field === "text" && s.size
        ? Math.round(max * (108 / s.size))
        : max;
    if (v.length > allowed) {
      out.push(`${at} ${field} ${v.length} chars, limit ${allowed}`);
    }
  }

  if (s.template === "list") {
    if (s.items.length < 3 || s.items.length > 5) {
      out.push(`${at} has ${s.items.length} items, want 3-5`);
    }
    s.items.forEach((it, i) => {
      if (it.head?.length > 42) out.push(`${at} item ${i + 1} head ${it.head.length} chars, limit 42`);
      if (it.body?.length > 120) out.push(`${at} item ${i + 1} body ${it.body.length} chars, limit 120`);
    });
  }

  if (s.template === "compare") {
    for (const side of ["left", "right"]) {
      const col = s[side];
      if (!col) continue;
      if (col.label?.length > 14) out.push(`${at} ${side} label ${col.label.length} chars, limit 14`);
      if (col.items.length < 4 || col.items.length > 5) {
        out.push(`${at} ${side} has ${col.items.length} items, want 4-5`);
      }
      col.items.forEach((v, i) => {
        if (v.length > 34) out.push(`${at} ${side} item ${i + 1} ${v.length} chars, limit 34`);
      });
    }
  }

  if (s.template === "plot") {
    if (s.points.length < 4 || s.points.length > 6) {
      out.push(`${at} has ${s.points.length} points, want 4-6`);
    }
    s.points.forEach((p, i) => {
      if (p.label?.length > 22) out.push(`${at} point ${i + 1} label ${p.label.length} chars, limit 22`);
      if (p.value?.length > 90) out.push(`${at} point ${i + 1} value ${p.value.length} chars, limit 90`);
    });
  }

  return out;
}

async function collect(kind) {
  const parent = path.join(ROOT, kind);
  if (!existsSync(parent)) return [];
  const dirs = (await readdir(parent, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => e.name);

  const rows = [];
  for (const slug of dirs) {
    const dir = path.join(parent, slug);
    const warn = [];
    let meta = {};
    try {
      meta = JSON.parse(await readFile(path.join(dir, "meta.json"), "utf8"));
    } catch {
      warn.push("meta.json missing or invalid");
    }

    const required =
      kind === "posts"
        ? ["caption.md", "slides.json"]
        : ["transcript.md", "frames.json", "footage.md"];
    for (const f of required) {
      if (!existsSync(path.join(dir, f))) warn.push(`no ${f}`);
    }

    // Rendered output present?
    const outDir = path.join(dir, kind === "posts" ? "slides" : "frames");
    let rendered = 0;
    if (existsSync(outDir)) {
      rendered = (await readdir(outDir)).filter((f) => f.endsWith(".jpg")).length;
    }

    if (kind === "posts") {
      try {
        const slides = JSON.parse(await readFile(path.join(dir, "slides.json"), "utf8"));
        // 7 is the house default; 8 is allowed because adding a photo slide to
        // an existing deck is the documented upgrade path and 5-8 is the range
        // the research supports.
        if (slides.length < 7 || slides.length > 8) {
          warn.push(`${slides.length} slides, want 7 (8 with a photo slide)`);
        }
        if (rendered && rendered !== slides.length) {
          warn.push(`${rendered} images vs ${slides.length} specs — re-render`);
        }
        slides.forEach((s, i) => {
          for (const problem of checkFit(s, i + 1)) warn.push(problem);
          if (s.template === "photo" && s.src && !existsSync(path.join(dir, s.src))) {
            warn.push(`slide ${i + 1} awaits its photograph (${s.src})`);
          }
        });

        // A list that promises a number must deliver it.
        for (const s of slides) {
          if (s.template !== "list" || !s.title) continue;
          const words = { three: 3, four: 4, five: 5, six: 6, seven: 7 };
          const m = s.title.toLowerCase().match(/\b(three|four|five|six|seven)\b/);
          if (m && words[m[1]] !== s.items.length) {
            warn.push(`list says "${m[1]}" but has ${s.items.length} items`);
          }
        }
      } catch {
        /* already reported */
      }
    } else {
      try {
        const frames = JSON.parse(await readFile(path.join(dir, "frames.json"), "utf8"));
        const sum = frames.reduce((a, f) => a + (f.seconds ?? 3), 0);
        if (meta.runtime_seconds && Math.abs(sum - meta.runtime_seconds) > 4) {
          warn.push(`frames sum to ${sum}s, meta says ${meta.runtime_seconds}s`);
        }
        frames.forEach((f, i) => {
          for (const problem of checkFit(f, i + 1)) warn.push(problem);
        });
        if (rendered && rendered !== frames.length) {
          warn.push(`${rendered} images vs ${frames.length} specs — re-render`);
        }
        if (!existsSync(path.join(dir, "slate.webm"))) warn.push("no slate.webm");
        if (meta.words && meta.runtime_seconds) {
          const wps = meta.words / meta.runtime_seconds;
          if (wps < 2.1 || wps > 3.1) {
            warn.push(`${wps.toFixed(1)} words/sec — target 2.6`);
          }
        }
      } catch {
        /* already reported */
      }
    }

    const tags = meta.hashtags ?? [];
    if (tags.length && tags.length !== 4) warn.push(`${tags.length} hashtags, house rule is 4`);

    rows.push({
      date: meta.date ?? slug.slice(0, 10),
      slug,
      kind: kind === "posts" ? "Post" : "Reel",
      pillar: meta.pillar ?? "—",
      title: meta.title ?? "—",
      hook: meta.hook ?? "—",
      format: meta.format ?? "—",
      units: kind === "posts" ? (meta.slides ?? "?") : (meta.frames ?? "?"),
      runtime: meta.runtime_seconds ? `${meta.runtime_seconds}s` : "",
      cta: meta.cta ?? "—",
      status: meta.status ?? "draft",
      warn,
    });
  }
  return rows;
}

const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");

const posts = await collect("posts");
const reels = await collect("reels");
const all = [...posts, ...reels].sort(
  (a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind),
);

const byPillar = {};
for (const r of all) (byPillar[r.pillar] ??= []).push(r);

const problems = all.filter((r) => r.warn.length);

let md = `# Instagram content calendar — evergreen bank

Generated by \`_system/build-calendar.mjs\`. **Do not hand-edit** — change the
relevant \`meta.json\` and re-run.

**${posts.length} carousels · ${reels.length} reels · ${all.length} pieces**, running
${all.length ? `${all[0].date} → ${all[all.length - 1].date}` : "—"}.

Every folder name carries its intended publish date. Nothing here is scheduled
automatically; this is a bank to work through, and the dates are a running order
rather than a commitment. Reels need Jordan's voice-over before they go out — see
each reel's \`transcript.md\`.

## Running order

| Date | Type | Piece | Pillar | Format | Slides/Frames | CTA | Status |
|---|---|---|---|---|---|---|---|
`;

for (const r of all) {
  md += `| ${r.date} | ${r.kind} | **${cell(clip(r.title, 52))}**<br><sub>${cell(clip(r.hook, 68))}</sub> | ${cell(r.pillar)} | ${cell(r.format)}${r.runtime ? ` · ${r.runtime}` : ""} | ${r.units} | ${cell(r.cta)} | ${r.status} |\n`;
}

md += `\n## By pillar\n\n`;
for (const [pillar, rows] of Object.entries(byPillar).sort()) {
  md += `### ${pillar} — ${rows.filter((r) => r.kind === "Post").length} posts, ${rows.filter((r) => r.kind === "Reel").length} reels\n\n`;
  for (const r of rows) md += `- \`${r.date}\` **${r.kind}** — ${cell(r.title)}\n`;
  md += `\n`;
}

md += `## Reels needing a voice-over\n\n`;
md += `| Date | Reel | Runtime | Words | Format |\n|---|---|---|---|---|\n`;
for (const r of reels.sort((a, b) => a.date.localeCompare(b.date))) {
  md += `| ${r.date} | \`reels/${r.slug}\` | ${r.runtime || "—"} | — | ${cell(r.format)} |\n`;
}

md += `\n## Checks\n\n`;
if (!problems.length) {
  md += `No problems found across ${all.length} pieces.\n`;
} else {
  md += `${problems.length} piece(s) need attention:\n\n`;
  for (const p of problems) {
    md += `- \`${p.kind === "Post" ? "posts" : "reels"}/${p.slug}\` — ${p.warn.join("; ")}\n`;
  }
}

await writeFile(path.join(ROOT, "CALENDAR.md"), md);

console.log(`CALENDAR.md — ${posts.length} posts, ${reels.length} reels`);
if (problems.length) {
  console.log(`\n${problems.length} with warnings:`);
  for (const p of problems) console.log(`  ! ${p.slug}: ${p.warn.join("; ")}`);
  process.exitCode = 1;
} else {
  console.log("all checks clean");
}
