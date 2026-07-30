// Builds a self-contained feed mockup of the bank — profile grid plus a
// phone-frame carousel walkthrough — so the whole push can be judged as it
// would actually appear, rather than as 732 files in a folder.
//
//   node content/instagram/_system/build-mockup.mjs
//
// Output: content/instagram/_system/feed-mockup.html (open it in a browser)
// plus feed-mockup.jpg, a flat screenshot of the grid.
//
// Images are downscaled in-browser via canvas before being inlined, because
// inlining 70 full-size slides would make a ~10 MB page. Thumbnails at 360px
// are enough to judge a grid; the phone-frame decks get 540px.

import { chromium } from "playwright";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_HTML = path.join(ROOT, "_system", "feed-mockup.html");
const OUT_JPG = path.join(ROOT, "_system", "feed-mockup.jpg");

// Three decks shown slide by slide — one per voice, so the walkthrough covers
// a hard-numbers deck, a liability explainer and a quiet-luxury piece.
const FEATURED = [
  "2026-08-01-never-pay-retail",
  "2026-08-10-ship-excursion-or-independent",
  "2026-10-06-the-tyranny-of-the-upsell",
];

const T = {
  ink: "#1b3154",
  paper: "#f6f1e8",
  linen: "#efe8dd",
  gold: "#b78b42",
  faded: "#607d99",
  glass: "#8ea6b4",
};

async function listPieces(kind) {
  const dir = path.join(ROOT, kind);
  if (!existsSync(dir)) return [];
  const slugs = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => e.name)
    .sort();
  const out = [];
  for (const slug of slugs) {
    const sub = kind === "posts" ? "slides" : "frames";
    const imgDir = path.join(dir, slug, sub);
    if (!existsSync(imgDir)) continue;
    const files = (await readdir(imgDir))
      .filter((f) => /^\d+\.jpg$/.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (!files.length) continue;
    let meta = {};
    try {
      meta = JSON.parse(await readFile(path.join(dir, slug, "meta.json"), "utf8"));
    } catch {}
    let caption;
    try {
      caption = await readFile(path.join(dir, slug, "caption.md"), "utf8");
    } catch {}
    out.push({ kind, slug, meta, caption, imgDir, files });
  }
  return out;
}

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function main() {
  const [chrome] = readdirSync("/opt/pw-browsers")
    .filter((d) => d.startsWith("chromium-"))
    .map((d) => path.join("/opt/pw-browsers", d, "chrome-linux", "chrome"))
    .filter(existsSync);
  const browser = await chromium.launch(chrome ? { executablePath: chrome } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.setContent("<body></body>");

  /** Downscale in the browser — no image library needed on this box. */
  const shrink = async (absPath, width) => {
    const b64 = (await readFile(absPath)).toString("base64");
    return page.evaluate(
      ([data, w]) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement("canvas");
            c.width = w;
            c.height = Math.round((img.height / img.width) * w);
            const ctx = c.getContext("2d");
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, c.width, c.height);
            resolve(c.toDataURL("image/jpeg", 0.82));
          };
          img.src = `data:image/jpeg;base64,${data}`;
        }),
      [b64, width],
    );
  };

  const posts = await listPieces("posts");
  const reels = await listPieces("reels");
  process.stdout.write(`thumbnailing ${posts.length + reels.length} pieces…\n`);

  // Grid: covers only, newest last (Instagram shows newest first, so reverse).
  const gridItems = [];
  for (const p of [...posts, ...reels]) {
    gridItems.push({
      ...p,
      thumb: await shrink(path.join(p.imgDir, p.files[0]), 360),
    });
  }
  gridItems.sort((a, b) => (b.meta.date ?? "").localeCompare(a.meta.date ?? ""));

  const decks = [];
  for (const slug of FEATURED) {
    const p = posts.find((x) => x.slug === slug);
    if (!p) continue;
    const slides = [];
    for (const f of p.files) slides.push(await shrink(path.join(p.imgDir, f), 540));
    decks.push({ ...p, slides });
  }

  const grid = gridItems
    .map(
      (g) => `<figure class="cell">
      <img src="${g.thumb}" alt="${esc(g.meta.title ?? g.slug)}">
      ${g.kind === "reels" ? '<span class="badge">Reel</span>' : ""}
      <figcaption><span class="d">${esc(g.meta.date ?? "")}</span>${esc(g.meta.title ?? g.slug)}</figcaption>
    </figure>`,
    )
    .join("");

  const walkthrough = decks
    .map(
      (d) => `<section class="deck">
      <header>
        <p class="kick">${esc(d.meta.date)} · ${esc(d.meta.pillar)} · ${esc(d.meta.format)}</p>
        <h3>${esc(d.meta.title)}</h3>
      </header>
      <div class="rail">${d.slides.map((s, i) => `<div class="phone"><img src="${s}" alt="Slide ${i + 1}"><span class="n">${i + 1} / ${d.slides.length}</span></div>`).join("")}</div>
      <pre class="cap">${esc((d.caption ?? "").trim())}</pre>
    </section>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BON V — Instagram feed mockup</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${T.paper};color:${T.ink};
    font-family:'Bitstream Charter',Charter,Georgia,serif;line-height:1.5;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.04'/%3E%3C/svg%3E")}
  .wrap{max-width:1120px;margin:0 auto;padding:56px 24px 100px}
  .kick{font-family:'Liberation Sans',Helvetica,sans-serif;font-size:.68rem;
    letter-spacing:.25em;text-transform:uppercase;color:${T.gold};font-weight:600}
  h1{font-size:2.6rem;font-weight:400;margin-top:.4rem;letter-spacing:-.01em}
  h2{font-size:1.5rem;font-weight:400;margin-bottom:.3rem}
  h3{font-size:1.35rem;font-weight:400}
  .lede{max-width:62ch;margin-top:1rem;color:${T.ink};opacity:.72}
  .stat{display:flex;gap:2.4rem;margin-top:2rem;flex-wrap:wrap}
  .stat div span{display:block;font-family:'Liberation Sans',sans-serif;font-size:.62rem;
    letter-spacing:.2em;text-transform:uppercase;color:${T.faded}}
  .stat div b{font-size:1.7rem;font-weight:400}
  hr{border:0;border-top:1px solid ${T.glass}66;margin:3.4rem 0 2.2rem}

  /* profile grid — 3 across, the way Instagram lays it out */
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .cell{position:relative;background:${T.linen}}
  /* Instagram crops every grid tile to one ratio, so a 9:16 reel cover loses
     its top and bottom here too. Without this the mockup would flatter the
     reels — their hook text has to survive the crop. */
  .cell img{width:100%;display:block;border:1px solid ${T.glass}55;
    aspect-ratio:4/5;object-fit:cover;object-position:center}
  .badge{position:absolute;top:8px;right:8px;background:${T.ink}d9;color:${T.paper};
    font-family:'Liberation Sans',sans-serif;font-size:.55rem;letter-spacing:.18em;
    text-transform:uppercase;padding:3px 7px}
  figcaption{font-family:'Liberation Sans',sans-serif;font-size:.66rem;line-height:1.45;
    color:${T.faded};padding:7px 2px 0}
  figcaption .d{display:block;color:${T.gold};letter-spacing:.1em}
  @media(max-width:640px){.grid{gap:8px}figcaption{display:none}}

  /* walkthrough */
  .deck{margin-top:3rem;padding-top:2rem;border-top:1px solid ${T.glass}55}
  .rail{display:flex;gap:18px;overflow-x:auto;padding:1.4rem 0 1rem;scroll-snap-type:x mandatory}
  .phone{flex:0 0 auto;scroll-snap-align:start;position:relative}
  .phone img{width:270px;display:block;border:1px solid ${T.glass}66}
  .phone .n{font-family:'Liberation Sans',sans-serif;font-size:.6rem;letter-spacing:.16em;
    color:${T.faded};display:block;padding-top:6px}
  .cap{white-space:pre-wrap;font-family:'Bitstream Charter',Georgia,serif;font-size:.94rem;
    background:${T.linen};border-left:2px solid ${T.gold};padding:1.1rem 1.3rem;max-width:70ch}
  .note{margin-top:.8rem;font-size:.86rem;color:${T.faded};max-width:70ch}
</style></head><body><div class="wrap">
  <p class="kick">Mockup · not published</p>
  <h1>BON V — the evergreen bank</h1>
  <p class="lede">Every piece in publish order, newest first, as the profile grid would show it —
  then three decks slide by slide with their captions. Reels appear by their cover frame.</p>
  <div class="stat">
    <div><span>Carousels</span><b>${posts.length}</b></div>
    <div><span>Reels</span><b>${reels.length}</b></div>
    <div><span>Images</span><b>${posts.reduce((a, p) => a + p.files.length, 0) + reels.reduce((a, r) => a + r.files.length, 0)}</b></div>
    <div><span>Runs</span><b>${gridItems.at(-1)?.meta.date ?? "—"} → ${gridItems[0]?.meta.date ?? "—"}</b></div>
  </div>

  <hr>
  <h2>Profile grid</h2>
  <p class="note">This is the test that matters for a publishing house: nine covers on screen at
  once should read as one publication. Any slide that shouts breaks the set.</p>
  <div class="grid" style="margin-top:1.6rem">${grid}</div>

  <hr>
  <h2>Three decks, slide by slide</h2>
  <p class="note">Scroll each rail sideways. The caption underneath is what gets pasted.</p>
  ${walkthrough}
</div></body></html>`;

  await writeFile(OUT_HTML, html);

  // Flat screenshot of the first nine tiles — the unit a visitor actually sees
  // at once, and small enough to read. Shooting the whole grid produced a
  // 22,000px strip that was no use to anyone.
  await page.setViewportSize({ width: 1080, height: 1200 });
  await page.setContent(html, { waitUntil: "load" });
  const gridBox = await page.locator(".grid").first().boundingBox();
  const ninth = await page.locator(".grid .cell").nth(8).boundingBox();
  if (gridBox && ninth) {
    await page.screenshot({
      path: OUT_JPG,
      type: "jpeg",
      quality: 88,
      clip: {
        x: gridBox.x,
        y: gridBox.y,
        width: gridBox.width,
        height: ninth.y + ninth.height - gridBox.y,
      },
    });
  }

  await browser.close();
  console.log(`feed-mockup.html — ${posts.length} posts, ${reels.length} reels`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
