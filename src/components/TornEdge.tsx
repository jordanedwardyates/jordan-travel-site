type TornEdgeProps = {
  side?: "top" | "bottom";
  className?: string;
};

/**
 * Deckle edge for a linen sheet — the irregular lip of handmade paper
 * where one stock meets the next, in place of a hard color seam.
 * Renders just outside the host section (which must be positioned, as
 * `.weathered-linen` sections are), tinted with the sheet's own color.
 */
export default function TornEdge({
  side = "top",
  className = "text-linen",
}: TornEdgeProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 14"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 h-3.5 w-full ${
        side === "top" ? "bottom-full" : "top-full -scale-y-100"
      } ${className}`}
    >
      <path
        fill="currentColor"
        d="M0 14 L0 9 L34 6 L71 10 L108 5 L146 9 L183 7 L221 11 L258 6 L296 9 L333 4 L371 8 L408 10 L446 6 L483 9 L521 5 L558 8 L596 11 L633 7 L671 9 L708 4 L746 8 L783 6 L821 10 L858 7 L896 9 L933 5 L971 8 L1008 10 L1046 6 L1083 9 L1121 5 L1158 8 L1196 10 L1233 6 L1271 9 L1308 4 L1346 8 L1383 6 L1421 9 L1440 7 L1440 14 Z"
      />
    </svg>
  );
}
