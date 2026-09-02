import { ImageResponse } from "next/og";

import { getLogbookEntry } from "@/lib/logbook";

export const alt = "The Logbook — field notes from Jordan Yates.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens (mirrored from globals.css — next/og can't read CSS variables).
const PASSPORT = "#f6f1e8";
const INK = "#1b3154";
const GOLD = "#b78b42";
const AEGEAN = "#223e67";

export default async function Image({ params }: { params: { slug: string } }) {
  const entry = getLogbookEntry(params.slug);

  const kicker = entry
    ? `The Logbook · ${entry.region}`
    : "The Logbook";
  const title = entry?.title ?? "Field notes from the water";
  const detail = entry
    ? `${entry.date} · ${entry.readingMinutes} min read`
    : "Jordan Yates · Luxury Voyage Advisor";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PASSPORT,
          padding: "72px 80px",
          border: `2px solid ${GOLD}`,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              color: INK,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 30, color: AEGEAN }}>{detail}</div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            color: AEGEAN,
          }}
        >
          <span>BON V: A Travel Company</span>
          <span style={{ color: GOLD }}>
            Jordan Yates · Luxury Voyage Advisor
          </span>
        </div>
      </div>
    ),
    size,
  );
}
