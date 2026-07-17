import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Destinations — BON V: A Travel Company";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    kicker: "Destinations",
    title: "The regions worth the trouble",
    subtitle: "Honest counsel on each — when to sail, the ports worth your time, and the ships that do them right.",
  });
}
