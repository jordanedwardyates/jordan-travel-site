import { useId } from "react";

type PassportStampProps = {
  text?: string;
  className?: string;
};

/**
 * Faint circular cancellation mark. Decorative only — always aria-hidden,
 * always behind or beside text. Size, rotation, and opacity via className.
 */
export default function PassportStamp({
  text = "· JORDAN YATES · LUXURY VOYAGE ADVISOR",
  className = "",
}: PassportStampProps) {
  const arcId = useId();

  return (
    <svg aria-hidden="true" viewBox="0 0 120 120" className={className}>
      <circle
        cx="60"
        cy="60"
        r="57"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="60"
        cy="60"
        r="43"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path id={arcId} d="M 60 10 A 50 50 0 1 1 59.99 10" fill="none" />
      <text
        fill="currentColor"
        fontSize="9"
        fontFamily="var(--font-geist-sans)"
      >
        <textPath
          href={`#${arcId}`}
          startOffset="0"
          textLength="312"
          lengthAdjust="spacing"
        >
          {text}
        </textPath>
      </text>
    </svg>
  );
}
