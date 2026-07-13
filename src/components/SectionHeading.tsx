type SectionHeadingProps = {
  kicker: string;
  title?: string;
  align?: "center" | "left";
  className?: string;
};

/**
 * Section head: short gold rule, ink small-caps kicker, optional serif title.
 * Gold stays decorative (the rule); text stays ink for contrast.
 */
export default function SectionHeading({
  kicker,
  title,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center" : "text-left"} ${className}`}>
      <div
        aria-hidden="true"
        className={`w-8 border-t border-compass-gold ${centered ? "mx-auto" : ""}`}
      />
      <h2 className="mt-4 text-kicker font-medium uppercase text-deep-harbor">
        {kicker}
      </h2>
      {title && (
        <p className="mt-3 font-serif text-title tracking-tight">{title}</p>
      )}
    </div>
  );
}
