import PassportStamp from "./PassportStamp";

type WeatheredBackgroundProps = {
  variant: "chart" | "rose" | "post";
  className?: string;
};

/* Tick positions along the second parallel of the graticule, computed
   from its quadratic so the graduations sit on the line. */
const GRADUATIONS: Array<[number, number]> = [
  [104, 233],
  [228, 228],
  [352, 224],
  [476, 223],
  [600, 223],
  [724, 225],
  [848, 229],
  [972, 235],
  [1096, 242],
];

/** Gently curved parallels and meridians with graduations, rhumb lines
 *  radiating from an off-chart point, and a few position crosses. */
function Graticule({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1">
        <path d="M -20 95 Q 600 60 1220 108" />
        <path d="M -20 240 Q 600 200 1220 252" />
        <path d="M -20 385 Q 600 342 1220 400" />
        <path d="M -20 530 Q 600 484 1220 548" />
      </g>
      <g stroke="currentColor" strokeWidth="1">
        <path d="M 250 -20 Q 272 340 246 720" />
        <path d="M 600 -20 Q 608 340 596 720" />
        <path d="M 950 -20 Q 930 340 954 720" />
      </g>
      <g stroke="currentColor" strokeWidth="1">
        {GRADUATIONS.map(([x, y]) => (
          <path key={x} d={`M ${x} ${y - 4} v 8`} />
        ))}
      </g>
      {/* Rhumb lines from a vanishing point beyond the top-right corner */}
      <g stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" strokeDasharray="2 6">
        <path d="M 1420 -160 L -60 320" />
        <path d="M 1420 -160 L -60 620" />
        <path d="M 1420 -160 L 420 740" />
        <path d="M 1420 -160 L 900 740" />
      </g>
      <g stroke="currentColor" strokeWidth="1.2">
        <path d="M 258 70 h 14 M 265 63 v 14" />
        <path d="M 893 240 h 14 M 900 233 v 14" />
        <path d="M 292 372 h 14 M 299 365 v 14" />
        <path d="M 1060 130 h 14 M 1067 123 v 14" />
      </g>
    </svg>
  );
}

/** Engraved sixteen-wind compass rose — half-shaded points, graduated
 *  ring, serif cardinal letters. Always used large and faint. */
function CompassRose({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="-180 -180 360 360" fill="none" className={className}>
      <circle r="150" stroke="currentColor" strokeWidth="1" />
      <circle r="122" stroke="currentColor" strokeWidth="0.75" />
      {Array.from({ length: 24 }, (_, i) => (
        <path
          key={i}
          d="M 0 -150 V -143"
          stroke="currentColor"
          strokeWidth="1"
          transform={`rotate(${i * 15})`}
        />
      ))}
      {/* Ordinal points */}
      {[45, 135, 225, 315].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path
            d="M 0 -86 L 10 0 L 0 12 L -10 0 Z"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path d="M 0 -86 L 10 0 L 0 0 Z" fill="currentColor" />
        </g>
      ))}
      {/* Cardinal points, half-shaded in the engraved manner */}
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path
            d="M 0 -138 L 12 0 L 0 16 L -12 0 Z"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path d="M 0 -138 L 12 0 L 0 0 Z" fill="currentColor" />
        </g>
      ))}
      <circle r="7" stroke="currentColor" strokeWidth="1" />
      <circle r="2.5" fill="currentColor" />
      <g
        fill="currentColor"
        fontSize="16"
        fontFamily="var(--font-serif)"
        textAnchor="middle"
      >
        <text y="-158">N</text>
        <text x="165" y="6">E</text>
        <text y="172">S</text>
        <text x="-165" y="6">W</text>
      </g>
    </svg>
  );
}

/** Post-office cancellation: double ring with a compass star, wavy
 *  killer bars trailing right. */
function Postmark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 340 150" fill="none" className={className}>
      <circle cx="72" cy="75" r="56" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="72" cy="75" r="44" stroke="currentColor" strokeWidth="1" />
      <path
        d="M 72 49 l 5.5 20.5 L 98 75 l -20.5 5.5 L 72 101 l -5.5 -20.5 L 46 75 l 20.5 -5.5 Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      {[45, 65, 85, 105].map((y) => (
        <path
          key={y}
          d={`M 150 ${y} q 24 -9 48 0 t 48 0 t 48 0 t 40 0`}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/**
 * Full-bleed weathered artwork baked into a section's paper, not laid on
 * top of it. Sits at -z-10 — beneath the aging overlay of `.weathered` /
 * `.weathered-linen` — so the drawing weathers with the sheet.
 *
 * Host section needs `weathered` (or `weathered-linen`) plus
 * `clip-section`; layers oversize their bounds and drift on scroll where
 * the browser supports it.
 *
 *  - `chart`   Nautical chart-paper: graticule, rhumb lines, compass rose.
 *  - `rose`    Ledger paper: faint graticule and a large corner rose.
 *  - `post`    Mail-room blotter: cancellation marks and a ghost stamp.
 */
export default function WeatheredBackground({
  variant,
  className = "",
}: WeatheredBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
    >
      {variant === "chart" && (
        <>
          <div className="drift-up absolute inset-x-0 -inset-y-14">
            <Graticule className="h-full w-full text-salt-air/70" />
          </div>
          <div className="drift-down absolute -bottom-24 -right-16 sm:-right-8">
            <CompassRose className="h-[24rem] w-[24rem] text-sea-glass/30" />
          </div>
        </>
      )}
      {variant === "rose" && (
        <>
          <div className="drift-up absolute inset-x-0 -inset-y-14">
            <Graticule className="h-full w-full text-salt-air/40" />
          </div>
          <div className="drift-down absolute -right-24 top-16 sm:-right-12">
            <CompassRose className="h-[22rem] w-[22rem] text-sea-glass/25" />
          </div>
        </>
      )}
      {variant === "post" && (
        <>
          <div className="drift-down absolute right-2 top-8 sm:right-10">
            <Postmark className="h-24 w-auto text-sun-faded/35 sm:h-32" />
          </div>
          <div className="drift-up absolute -bottom-20 -left-16 sm:-left-6">
            <PassportStamp className="h-72 w-72 -rotate-12 text-salt-air/50" />
          </div>
        </>
      )}
    </div>
  );
}
