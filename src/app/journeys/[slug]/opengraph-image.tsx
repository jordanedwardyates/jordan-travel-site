import { ImageResponse } from "next/og";

import { getJourneyBySlug } from "@/lib/journeys";

export const alt = "A BON V journey — expertly chosen, personally negotiated.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens (mirrored from globals.css — next/og can't read CSS variables).
const PASSPORT = "#f6f1e8";
const INK = "#1b3154";
const GOLD = "#b78b42";
const AEGEAN = "#223e67";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const journey = await getJourneyBySlug(params.slug);

  const kicker = journey
    ? `${journey.region} · ${journey.dates}`
    : "A more thoughtful way to travel";
  const title = journey?.routeTitle ?? "BON V: A Travel Company";
  const detail = journey
    ? `${journey.ship} · ${journey.cruiseLine} · ${journey.nights} nights`
    : "Luxury voyages, personally negotiated";

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
              fontSize: 76,
              lineHeight: 1.05,
              color: INK,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 32, color: AEGEAN }}>{detail}</div>
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
          <span style={{ color: GOLD }}>Jordan Yates · Luxury Voyage Advisor</span>
        </div>
      </div>
    ),
    size,
  );
}
