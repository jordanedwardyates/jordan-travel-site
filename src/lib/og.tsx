import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/**
 * Shared OpenGraph card renderer — a letterpress plate on cream paper:
 * inset frame, small-caps kicker, gold rule, serif title, italic
 * standfirst, and the nameplate along the foot. One look across every
 * shared link. Brand tokens are inlined here because Satori resolves no
 * CSS variables.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const PAPER = "#f6f1e8";
const INK = "#1b3154";
const AEGEAN = "#223e67";
const GOLD = "#b78b42";
const SALT = "#c9d6dc";
const SEA = "#8ea6b4";

// EB Garamond (OFL), subset to Latin and vendored in the repo — Satori can't
// read woff2, and a bundled TTF means no network dependency. These cards
// prerender at build, where the source tree is on disk; next.config's
// outputFileTracingIncludes keeps the files available for any on-demand render.
const FONT_DIR = join(process.cwd(), "src/lib/fonts");
const readFont = (file: string) => readFile(join(FONT_DIR, file));

let fontsPromise: Promise<{ roman: Buffer; italic: Buffer } | null> | null =
  null;
function loadSerif() {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      try {
        const [roman, italic] = await Promise.all([
          readFont("EBGaramond-Medium.ttf"),
          readFont("EBGaramond-Italic.ttf"),
        ]);
        return { roman, italic };
      } catch {
        return null;
      }
    })();
  }
  return fontsPromise;
}

const CompassStar = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill={GOLD}
      d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
    />
  </svg>
);

export async function ogCard({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  const serif = await loadSerif();
  const fontFamily = serif ? "Garamond" : "serif";
  const fonts = serif
    ? [
        {
          name: "Garamond",
          data: serif.roman,
          weight: 400 as const,
          style: "normal" as const,
        },
        {
          name: "Garamond",
          data: serif.italic,
          weight: 400 as const,
          style: "italic" as const,
        },
      ]
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: PAPER,
          padding: 40,
          fontFamily,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            border: `2px solid ${SALT}`,
            padding: "64px 72px",
            justifyContent: "space-between",
          }}
        >
          {/* Head */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 24,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: AEGEAN,
              }}
            >
              {kicker}
            </div>
            <div
              style={{ width: 64, height: 3, backgroundColor: GOLD, marginTop: 24 }}
            />
          </div>

          {/* Title + standfirst */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: title.length > 34 ? 74 : 92,
                lineHeight: 1.05,
                letterSpacing: -1,
                color: INK,
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  fontSize: 34,
                  fontStyle: "italic",
                  lineHeight: 1.3,
                  color: AEGEAN,
                  marginTop: 28,
                  maxWidth: 900,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          {/* Foot — nameplate */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${SALT}`,
              paddingTop: 28,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: 34, color: INK }}>BON V:</span>
              <span
                style={{
                  fontSize: 26,
                  fontStyle: "italic",
                  color: AEGEAN,
                  marginLeft: 12,
                }}
              >
                A Travel Company
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 17,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: SEA,
                  marginRight: 16,
                }}
              >
                Jordan Yates · Luxury Voyage Advisor
              </span>
              <CompassStar />
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
