/**
 * Faint nautical-chart layer — gently curved graticule lines with a few
 * position crosses. Decorative only; keep at low opacity behind content.
 */
export default function ChartTexture({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1">
        <path d="M -20 110 Q 600 78 1220 122" />
        <path d="M -20 255 Q 600 218 1220 268" />
        <path d="M -20 400 Q 600 358 1220 415" />
        <path d="M 285 -20 Q 308 280 282 580" />
        <path d="M 915 -20 Q 895 280 918 580" />
      </g>
      <g stroke="currentColor" strokeWidth="1.2">
        <path d="M 296 82 h 14 M 303 75 v 14" />
        <path d="M 893 240 h 14 M 900 233 v 14" />
        <path d="M 292 372 h 14 M 299 365 v 14" />
        <path d="M 1060 130 h 14 M 1067 123 v 14" />
      </g>
    </svg>
  );
}
