import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Journeys — BON V: A Travel Company";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    kicker: "Recently Quoted",
    title: "Every sailing currently quoted",
    subtitle: "Dates, negotiated fares, and my honest read on each.",
  });
}
