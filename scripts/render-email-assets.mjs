// One-off render script: builds hosted PNG assets for HTML emails
// (Gmail strips CSS transforms/SVG in <style>, so decorative elements
// like the angled stamp box have to ship as flat images instead).
// Run with: /opt/homebrew/bin/node scripts/render-email-assets.mjs
import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "email-assets");

// Oversized scratch canvas so the -5deg rotation never pushes a corner
// past the viewport; the actual crop is computed from the box's real
// post-rotation bounding rect, so the final PNG has no dead space.
const CANVAS_W = 400;
const CANVAS_H = 400;

const STAMP_HTML = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  html,body { margin:0; padding:0; background:transparent; }
  .wrap { width:${CANVAS_W}px; height:${CANVAS_H}px; display:flex; align-items:center; justify-content:center; }
  .box {
    transform:rotate(-5deg);
    border:2px solid rgba(183,139,66,0.75);
    padding:5px;
    font-family: Georgia, 'Times New Roman', serif;
  }
  .inner { border:1px solid rgba(183,139,66,0.45); padding:8px 12px; text-align:center; }
  .eyebrow { margin:0; font-size:9px; letter-spacing:3px; text-transform:uppercase; color:#b78b42; white-space:nowrap; }
  .edit { margin:1px 0 0 0; font-size:13px; letter-spacing:2px; text-transform:uppercase; color:#a97f39; white-space:nowrap; }
  .coords { margin:4px 0 0 0; font-size:8px; letter-spacing:1.5px; color:rgba(169,127,57,0.85); white-space:nowrap; }
</style></head>
<body>
  <div class="wrap">
    <div class="box">
      <div class="inner">
        <p class="eyebrow">The Weekly</p>
        <p class="edit">Edit</p>
        <p class="coords">37&deg;26&prime;N &middot; 25&deg;19&prime;E</p>
      </div>
    </div>
  </div>
</body></html>
`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: CANVAS_W, height: CANVAS_H },
    deviceScaleFactor: 3,
  });
  await page.setContent(STAMP_HTML);

  // getBoundingClientRect() on a rotated element returns its actual
  // axis-aligned bounding box post-transform — exact, no guessing.
  const rect = await page.evaluate(() => {
    const r = document.querySelector(".box").getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const pad = 3; // a few px so the border stroke doesn't anti-alias off-edge
  const clip = {
    x: Math.max(0, rect.x - pad),
    y: Math.max(0, rect.y - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };

  const buffer = await page.screenshot({ omitBackground: true, clip });
  await writeFile(path.join(OUT_DIR, "weekly-edit-stamp.png"), buffer);
  await browser.close();
  console.log(
    `Wrote public/email-assets/weekly-edit-stamp.png (CSS ${Math.round(clip.width)}x${Math.round(clip.height)} @3x)`
  );
}

main();
