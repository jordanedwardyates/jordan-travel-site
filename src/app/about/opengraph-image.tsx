import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

export const alt = "About Jordan — BON V: A Travel Company";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    kicker: "About Jordan",
    title: "An advisor, an explorer, a curator.",
    subtitle: "Matching travelers with the right ships since 2011 — and my clients never pay retail.",
  });
}
