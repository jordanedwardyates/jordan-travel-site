// Slide templates for Instagram carousels and reel frames.
//
// Every slide is plain HTML with inlined CSS, screenshotted by render.mjs.
// Same approach as scripts/render-email-assets.mjs, just at social sizes.
//
// Brand tokens are copied verbatim from src/app/globals.css — including the
// paper-grain turbulence and the .weathered foxing — so a rendered slide sits
// on the same cream stock as the website. Do not invent colours here.

export const TOKENS = {
  aegeanInk: "#223e67",
  deepHarbor: "#1b3154",
  sunFaded: "#607d99",
  seaGlass: "#8ea6b4",
  saltAir: "#c9d6dc",
  vintagePassport: "#f6f1e8",
  linen: "#efe8dd",
  weatheredIvory: "#e6ddd0",
  compassGold: "#b78b42",
};

export const SIZES = {
  post: { w: 1080, h: 1350 }, // 4:5 — the tallest ratio the feed allows
  reel: { w: 1080, h: 1920 }, // 9:16
};

// Bitstream Charter is the closest thing on this machine to a letterpress
// book face — designed for coarse printing, warm, slightly narrow. Georgia
// and Charter share enough proportion that copy fitted here holds up if the
// stack ever falls back.
const SERIF = `'Bitstream Charter', 'Charter', Georgia, 'Liberation Serif', serif`;
const SANS = `'Liberation Sans', 'DejaVu Sans', Helvetica, Arial, sans-serif`;

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.04'/%3E%3C/svg%3E\")";

const FOXING =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='700'%3E%3Cfilter id='fox'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.68 0 0 0 0 0.52 0 0 0 0 0.28 0 0 0 0.5 -0.28'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23fox)'/%3E%3C/svg%3E\")";

// Faint engraved chart lines — the rhumb-line grid from ChartTexture, flattened
// to a static SVG. Sits at 5% so it reads as watermark, never as decoration.
function chartLines(w, h) {
  const lines = [];
  for (let i = -2; i < 14; i++) {
    lines.push(
      `<line x1="${i * 120}" y1="0" x2="${i * 120 + h * 0.6}" y2="${h}" stroke="${TOKENS.sunFaded}" stroke-width="1"/>`,
    );
    lines.push(
      `<line x1="${i * 120}" y1="${h}" x2="${i * 120 + h * 0.6}" y2="0" stroke="${TOKENS.sunFaded}" stroke-width="1"/>`,
    );
  }
  const rings = [0.18, 0.3, 0.42]
    .map(
      (r) =>
        `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${w * r}" fill="none" stroke="${TOKENS.sunFaded}" stroke-width="1"/>`,
    )
    .join("");
  return `<svg class="chart layer" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${lines.join("")}${rings}</svg>`;
}

/**
 * Safe zones, measured rather than guessed (see _system/research-*.md).
 *
 * Reels: Instagram's chrome eats the top ~200px (account row), the bottom
 * ~400px (caption, audio, progress bar) and the right ~150px (action rail).
 * Everything that must be read lives inside what's left.
 *
 * Posts: 1080x1350 renders full-bleed, but the profile grid crops to 3:4, so
 * type stays inside a centred 1012px column — 96px padding clears it.
 */
const PAD = {
  post: { top: 96, right: 96, bottom: 96, left: 96 },
  reel: { top: 200, right: 170, bottom: 400, left: 110 },
};

function shell({ kind, body, bg, extraCss = "" }) {
  const { w, h } = SIZES[kind];
  const pad = PAD[kind];
  const ground = bg || TOKENS.vintagePassport;
  const padCss = `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${w}px; height:${h}px; }
  body {
    background-color:${ground};
    background-image:${GRAIN};
    color:${TOKENS.deepHarbor};
    font-family:${SERIF};
    -webkit-font-smoothing:antialiased;
  }
  .stage {
    position:relative; width:${w}px; height:${h}px; overflow:hidden;
    padding:${padCss};
    display:flex; flex-direction:column;
  }
  /* foxing + sun-bleached corners, straight from globals.css .weathered */
  .stage::before {
    content:""; position:absolute; inset:0; pointer-events:none; z-index:0;
    background-image:
      radial-gradient(ellipse 60% 50% at 0% 0%, rgba(183,139,66,0.06), transparent 70%),
      radial-gradient(ellipse 50% 45% at 100% 10%, rgba(96,125,153,0.05), transparent 70%),
      radial-gradient(ellipse 55% 40% at 90% 100%, rgba(183,139,66,0.04), transparent 70%),
      ${FOXING};
  }
  .chart { position:absolute; inset:0; opacity:0.05; z-index:0; }
  /* Lift in-flow content above the ::before foxing layer.
     Anything absolutely positioned carries .layer and opts out: a bare
     ".stage > *" outranks ".chart"/".photo"/".stamp" (same specificity,
     declared later) and would drop them into normal flow — the chart as a
     full-height flex item shoving the layout down the page, the stamp landing
     on the footer, a photo backdrop collapsing to a strip. One shared class
     beats an ever-growing :not() chain. */
  .layer { position:absolute; }
  .stage > *:not(.layer) { position:relative; z-index:1; }

  .kicker {
    font-family:${SANS}; font-size:24px; letter-spacing:0.25em;
    text-transform:uppercase; color:${TOKENS.compassGold}; font-weight:600;
  }
  .rule { width:78px; height:2px; background:${TOKENS.compassGold}; opacity:0.55; }
  .rule-wide { width:100%; height:1px; background:${TOKENS.sunFaded}; opacity:0.3; }

  h1 { font-size:104px; line-height:1.04; letter-spacing:-0.015em; font-weight:400; }
  h2 { font-size:76px; line-height:1.1; letter-spacing:-0.01em; font-weight:400; }
  .lede { font-size:40px; line-height:1.42; color:${TOKENS.aegeanInk}; }
  .body { font-size:34px; line-height:1.5; color:${TOKENS.aegeanInk}; }
  .muted { color:${TOKENS.sunFaded}; }
  em { font-style:italic; }
  strong { font-weight:600; color:${TOKENS.deepHarbor}; }

  .spacer { flex:1; }
  .foot {
    display:flex; align-items:baseline; justify-content:space-between;
    font-family:${SANS}; font-size:21px; letter-spacing:0.18em;
    text-transform:uppercase; color:${TOKENS.sunFaded};
  }
  .index { font-variant-numeric:tabular-nums; }

  /* Passport stamp — rotated double rule, gold at 75%/45% like PassportStamp.tsx.
     Sits top-right: bottom-right collided with the subtitle and the footer. */
  .stamp {
    position:absolute; right:${pad.right}px; top:${pad.top}px;
    transform:rotate(-5deg); border:3px solid rgba(183,139,66,0.75); padding:7px; z-index:1;
  }
  .stamp-in { border:1.5px solid rgba(183,139,66,0.45); padding:14px 20px; text-align:center; }
  .stamp-a { font-family:${SANS}; font-size:17px; letter-spacing:0.3em; text-transform:uppercase; color:${TOKENS.compassGold}; white-space:nowrap; }
  .stamp-b { font-family:${SANS}; font-size:24px; letter-spacing:0.2em; text-transform:uppercase; color:#a97f39; white-space:nowrap; margin-top:3px; }
  ${extraCss}
</style></head><body><div class="stage">${chartLines(w, h)}${body}</div></body></html>`;
}

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Allow a tiny inline vocabulary in copy: *italic* and **bold**, and promote
// straight quotes to typographic ones — the site sets curly quotes everywhere
// (&rsquo;/&mdash;), and straight marks read as unfinished next to Charter.
const smarten = (s = "") =>
  s
    .replace(/(\w)'(\w)/g, "$1’$2") // year's, don't
    .replace(/(^|[\s(\[])"/g, "$1“") // opening double
    .replace(/"/g, "”") // closing double
    .replace(/(^|[\s(\[])'/g, "$1‘")
    .replace(/'/g, "’")
    .replace(/(\s)-(\s)/g, "$1—$2"); // lone hyphen → em dash

const rich = (s = "") =>
  smarten(esc(s))
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

// `left` doubles as a footer override, but on `compare` slides it is the
// left-hand column object — so only honour it when it is actually a string.
const foot = (s) =>
  `<div class="foot"><span>${esc(
    typeof s.left === "string" ? s.left : "BON V · A Travel Company",
  )}</span><span class="index">${esc(s.index ?? "")}</span></div>`;

// ---------------------------------------------------------------- templates

const templates = {
  /** Slide 1. One idea, set large. The whole job is stopping the scroll. */
  cover: (s, kind) =>
    shell({
      kind,
      body: `
      <div class="kicker">${esc(s.kicker ?? "The Logbook")}</div>
      <div class="rule" style="margin:28px 0 44px"></div>
      <h1>${rich(s.title)}</h1>
      ${s.subtitle ? `<p class="lede" style="margin-top:40px;max-width:88%">${rich(s.subtitle)}</p>` : ""}
      <div class="spacer"></div>
      ${s.stamp ? `<div class="stamp layer"><div class="stamp-in"><div class="stamp-a">${esc(s.stamp.top ?? "Advisor's Note")}</div><div class="stamp-b">${esc(s.stamp.bottom ?? "Bon V")}</div></div></div>` : ""}
      ${foot(s)}`,
    }),

  /** One sentence, room around it. Use for the turn in the argument. */
  statement: (s, kind) =>
    shell({
      kind,
      body: `
      ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
      <div class="spacer"></div>
      <h2>${rich(s.text)}</h2>
      ${s.sub ? `<p class="body muted" style="margin-top:36px;max-width:86%">${rich(s.sub)}</p>` : ""}
      <div class="spacer"></div>
      ${foot(s)}`,
    }),

  /** Numbered points. Keeps the swipe moving — each item is an open loop. */
  list: (s, kind) =>
    shell({
      kind,
      extraCss: `
      .item { display:flex; gap:30px; margin-bottom:${s.items.length > 4 ? 34 : 46}px; }
      .num { font-family:${SANS}; font-size:23px; letter-spacing:0.14em; color:${TOKENS.compassGold};
             padding-top:12px; min-width:52px; font-variant-numeric:tabular-nums; }
      .head { font-size:${s.items.length > 4 ? 40 : 46}px; line-height:1.24; }
      .sub { font-size:${s.items.length > 4 ? 28 : 31}px; line-height:1.45; color:${TOKENS.sunFaded}; margin-top:10px; }`,
      body: `
      ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
      ${s.title ? `<h2 style="font-size:60px;margin-top:24px">${rich(s.title)}</h2>` : ""}
      <div class="rule" style="margin:36px 0 52px"></div>
      <div>
        ${s.items
          .map(
            (it, i) => `<div class="item">
            <div class="num">${String(it.n ?? i + 1).padStart(2, "0")}</div>
            <div><div class="head">${rich(it.head)}</div>${it.body ? `<div class="sub">${rich(it.body)}</div>` : ""}</div>
          </div>`,
          )
          .join("")}
      </div>
      <div class="spacer"></div>
      ${foot(s)}`,
    }),

  /** Two columns. The workhorse for "what they sell vs what you get". */
  compare: (s, kind) =>
    shell({
      kind,
      extraCss: `
      .cols { display:flex; gap:52px; }
      .col { flex:1; }
      .col-label { font-family:${SANS}; font-size:22px; letter-spacing:0.2em; text-transform:uppercase;
                   padding-bottom:20px; margin-bottom:28px; border-bottom:2px solid; }
      .col-a .col-label { color:${TOKENS.sunFaded}; border-color:${TOKENS.saltAir}; }
      .col-b .col-label { color:${TOKENS.compassGold}; border-color:rgba(183,139,66,0.5); }
      .col li { list-style:none; font-size:31px; line-height:1.4; margin-bottom:26px; padding-left:46px; position:relative; }
      /* The indent has to clear the em dash itself (~31px at this size) or the
         glyph runs straight into the first word. */
      .col li::before { content:"—"; position:absolute; left:0; color:${TOKENS.seaGlass}; }
      .col-a li { color:${TOKENS.sunFaded}; }`,
      body: `
      ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
      ${s.title ? `<h2 style="font-size:58px;margin-top:24px">${rich(s.title)}</h2>` : ""}
      <div class="rule" style="margin:34px 0 50px"></div>
      <div class="cols">
        <div class="col col-a"><div class="col-label">${esc(s.left.label)}</div><ul>${s.left.items.map((i) => `<li>${rich(i)}</li>`).join("")}</ul></div>
        <div class="col col-b"><div class="col-label">${esc(s.right.label)}</div><ul>${s.right.items.map((i) => `<li>${rich(i)}</li>`).join("")}</ul></div>
      </div>
      <div class="spacer"></div>
      ${foot(s)}`,
    }),

  /** Plotted points on a chart — for seasons, routes, timings. */
  plot: (s, kind) =>
    shell({
      kind,
      extraCss: `
      .row { display:flex; align-items:baseline; gap:28px; padding:26px 0; border-bottom:1px solid rgba(96,125,153,0.22); }
      .row:last-child { border-bottom:none; }
      .coord { font-family:${SANS}; font-size:22px; letter-spacing:0.16em; text-transform:uppercase;
               color:${TOKENS.compassGold}; min-width:210px; }
      .val { font-size:34px; line-height:1.34; }`,
      body: `
      ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
      ${s.title ? `<h2 style="font-size:58px;margin-top:24px">${rich(s.title)}</h2>` : ""}
      <div class="rule" style="margin:34px 0 40px"></div>
      <div>${s.points.map((p) => `<div class="row"><div class="coord">${esc(p.label)}</div><div class="val">${rich(p.value)}</div></div>`).join("")}</div>
      <div class="spacer"></div>
      ${foot(s)}`,
    }),

  /** Pull quote — Jordan's voice, or a client's. */
  quote: (s, kind) =>
    shell({
      kind,
      bg: TOKENS.linen,
      extraCss: `
      .mark { font-size:200px; line-height:0.6; color:rgba(183,139,66,0.32); }
      .q { font-size:60px; line-height:1.3; font-style:italic; margin-top:30px; }
      .cite { font-family:${SANS}; font-size:23px; letter-spacing:0.2em; text-transform:uppercase;
              color:${TOKENS.sunFaded}; margin-top:46px; }`,
      body: `
      <div class="spacer"></div>
      <div class="mark">&ldquo;</div>
      <div class="q">${rich(s.quote)}</div>
      ${s.cite ? `<div class="cite">${esc(s.cite)}</div>` : ""}
      <div class="spacer"></div>
      ${foot(s)}`,
    }),

  /** Final slide. Ask for the save or the DM, once, without pitching. */
  cta: (s, kind) =>
    shell({
      kind,
      bg: TOKENS.weatheredIvory,
      extraCss: `
      .handle { font-family:${SANS}; font-size:30px; letter-spacing:0.2em; text-transform:uppercase;
                color:${TOKENS.compassGold}; margin-top:52px; }`,
      body: `
      <div class="kicker">${esc(s.kicker ?? "Jordan Yates · Luxury Voyage Advisor")}</div>
      <div class="spacer"></div>
      <h2 style="font-size:66px">${rich(s.title)}</h2>
      ${s.body ? `<p class="lede" style="margin-top:36px;max-width:90%">${rich(s.body)}</p>` : ""}
      <div class="handle">${esc(s.handle ?? "@bonvtravel · link in bio")}</div>
      <div class="spacer"></div>
      <div class="rule-wide" style="margin-bottom:30px"></div>
      ${foot(s)}`,
    }),

  /**
   * A photograph, treated so it belongs to the brand rather than sitting in it.
   *
   * Stock and cruise-line photography arrives in every colour temperature
   * going, which is what would make a carousel look assembled rather than
   * published. `treatment: "duotone"` (the default) runs it as a two-colour
   * press job: greyscale the image, multiply it onto cream stock, then tint the
   * greys toward deep-harbor with a `color` blend. The result is ink-on-paper,
   * so it sits on the same ground as every other slide — the Brand Bible is
   * explicit that paper doesn't invert, so these stay light.
   * `"warm"` keeps the original colour, knocked back under a paper wash;
   * `"none"` leaves an already on-palette image alone.
   *
   * `src` is resolved and inlined by render.mjs. A missing file renders a
   * placeholder carrying the shot brief, so a deck still previews with its
   * photo slots visible and legible.
   */
  photo: (s, kind) => {
    const treatment = s.treatment ?? "duotone";
    const hasImage = Boolean(s.dataUri);
    return shell({
      kind,
      extraCss: `
      .ph { inset:0; z-index:0; }
      .ph-img {
        background-image:url('${s.dataUri ?? ""}');
        background-size:cover; background-position:${s.focus ?? "center"};
        ${treatment === "duotone" ? "filter:grayscale(1) contrast(1.06) brightness(1.04); mix-blend-mode:multiply;" : ""}
        ${treatment === "warm" ? "filter:saturate(0.8) contrast(1.02);" : ""}
      }
      ${
        treatment === "duotone"
          ? `.ph-tint { background:${TOKENS.deepHarbor}; mix-blend-mode:color; opacity:0.5; }`
          : ""
      }
      /* Cream floor so the type has something to sit on over a busy frame. */
      .scrim { inset:auto 0 0 0; height:56%; z-index:0;
        background:linear-gradient(180deg, rgba(246,241,232,0), rgba(246,241,232,0.94) 62%, rgba(246,241,232,0.99)); }
      /* Hairline plate edge — the border of a printed illustration. */
      .plate { inset:${kind === "reel" ? "170px 140px 370px 80px" : "56px"};
        border:1px solid rgba(27,49,84,0.16); z-index:0; }
      .ph-title { font-size:${s.size ?? (kind === "reel" ? 88 : 64)}px; line-height:1.14;
        letter-spacing:-0.01em; margin-top:18px; }
      /* margin-bottom clears the footer — a three-line caption ran straight
         into the masthead without it. */
      .ph-caption { font-size:${kind === "reel" ? 34 : 30}px; line-height:1.42;
        color:${TOKENS.aegeanInk}; margin-top:20px; margin-bottom:30px; max-width:92%; }
      .ph-title + .foot, .ph-caption + .foot { margin-top:0; }
      .ph-title { margin-bottom:30px; }
      .ph-title + .ph-caption { margin-top:-12px; margin-bottom:30px; }
      .missing { inset:0; z-index:0; display:flex; align-items:center; justify-content:center;
        background:${TOKENS.linen}; padding:${kind === "reel" ? 140 : 90}px; }
      .missing-in { text-align:center; }
      .missing-a { font-family:${SANS}; font-size:22px; letter-spacing:0.24em;
        text-transform:uppercase; color:${TOKENS.compassGold}; }
      .missing-b { font-size:${kind === "reel" ? 46 : 40}px; line-height:1.3; margin-top:24px; }
      .missing-c { font-family:${SANS}; font-size:21px; line-height:1.55; margin-top:26px;
        color:${TOKENS.sunFaded}; }`,
      body: `
      ${
        hasImage
          ? `<div class="ph ph-img layer"></div>${treatment === "duotone" ? '<div class="ph ph-tint layer"></div>' : ""}${s.title || s.caption ? '<div class="scrim layer"></div>' : ""}<div class="plate layer"></div>`
          : `<div class="missing layer"><div class="missing-in">
               <div class="missing-a">Photograph wanted</div>
               <div class="missing-b">${rich(s.brief ?? s.title ?? "Drop an image here")}</div>
               <div class="missing-c">Save it as <strong>${esc(s.src ?? "photos/01.jpg")}</strong> in this folder and re-render.${s.source ? `<br>Where to look: ${esc(s.source)}` : ""}</div>
             </div></div>`
      }
      <div class="spacer"></div>
      ${hasImage && s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
      ${hasImage && s.title ? `<div class="ph-title">${rich(s.title)}</div>` : ""}
      ${hasImage && s.caption ? `<div class="ph-caption">${rich(s.caption)}</div>` : ""}
      ${hasImage ? foot({ ...s, left: typeof s.left === "string" ? s.left : undefined }) : ""}`,
    });
  },

  /**
   * Reel frame. Bigger type than a post — it has to read at arm's length in
   * half a second, over b-roll. `tone: "warn"` inverts to ink ground for the
   * mishap beats so the turn in the story is visible, not just audible.
   */
  frame: (s, kind = "reel") => {
    const warn = s.tone === "warn";
    return shell({
      kind,
      bg: warn ? TOKENS.deepHarbor : TOKENS.vintagePassport,
      extraCss: `
      .stage { text-align:${s.align ?? "left"}; }
      ${warn ? `body { color:${TOKENS.vintagePassport}; } .kicker { color:${TOKENS.compassGold}; } .chart { opacity:0.09; } .stage::before { opacity:0.4; }` : ""}
      .big { font-size:${s.size ?? 108}px; line-height:1.08; letter-spacing:-0.015em; }
      .sub { font-size:40px; line-height:1.4; margin-top:40px; color:${warn ? TOKENS.saltAir : TOKENS.aegeanInk}; }
      .tc { font-family:${SANS}; font-size:20px; letter-spacing:0.22em; text-transform:uppercase;
            color:${warn ? TOKENS.seaGlass : TOKENS.sunFaded}; }`,
      body: `
      ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
      <div class="spacer"></div>
      <div class="big">${rich(s.text)}</div>
      ${s.sub ? `<div class="sub">${rich(s.sub)}</div>` : ""}
      <div class="spacer"></div>
      <div class="foot"><span class="tc">${esc(s.timecode ?? "")}</span><span class="tc">${esc(s.label ?? "BON V")}</span></div>`,
    });
  },
};

export function renderSlide(slide, kind = "post") {
  const fn = templates[slide.template];
  if (!fn) {
    throw new Error(
      `Unknown template "${slide.template}". Available: ${Object.keys(templates).join(", ")}`,
    );
  }
  return fn(slide, kind);
}

export const TEMPLATE_NAMES = Object.keys(templates);
