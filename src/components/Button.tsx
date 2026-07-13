import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Primary ink-filled CTA. One per section, at most. */
export default function Button({ href, children, className = "" }: ButtonProps) {
  return (
    <a
      href={href}
      className={`inline-block whitespace-nowrap bg-aegean-ink px-10 py-4 text-sm uppercase tracking-[0.15em] text-vintage-passport transition-colors hover:bg-deep-harbor ${className}`}
    >
      {children}
    </a>
  );
}
