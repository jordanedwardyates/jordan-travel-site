type SectionHeadingProps = {
  kicker: string;
  title?: string;
  className?: string;
};

/**
 * Section head: short gold rule, ink small-caps kicker, optional serif title.
 * Gold stays decorative (the rule); text stays ink for contrast.
 */
export default function SectionHeading({
  kicker,
  title,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`text-center ${className}`}>
      <div
        aria-hidden="true"
        className="mx-auto w-8 border-t border-compass-gold"
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
