type RuleProps = {
  variant?: "single" | "double";
  className?: string;
};

/**
 * Thin letterpress rules — the connective tissue between sections.
 * `double` is the masthead/colophon rule.
 */
export default function Rule({ variant = "single", className = "" }: RuleProps) {
  if (variant === "double") {
    return (
      <div
        aria-hidden="true"
        className={`h-[5px] border-y border-salt-air ${className}`}
      />
    );
  }
  return (
    <hr className={`border-0 border-t border-salt-air ${className}`} />
  );
}
