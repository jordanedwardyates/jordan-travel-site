import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Field Notes — BON V: A Travel Company";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    kicker: "Field Notes",
    title: "Dispatches from the world's finest waters",
    subtitle: "The house journal — what I've learned from sailings, ship visits, and kept notes.",
  });
}
