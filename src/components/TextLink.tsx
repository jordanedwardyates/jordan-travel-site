import type { ReactNode } from "react";

type TextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Secondary CTA — ink text on a gold hairline underline. */
export default function TextLink({
  href,
  children,
  className = "",
}: TextLinkProps) {
  return (
    <a
      href={href}
      className={`text-deep-harbor underline decoration-compass-gold/70 underline-offset-4 transition-colors hover:text-aegean-ink hover:decoration-compass-gold ${className}`}
    >
      {children}
    </a>
  );
}
