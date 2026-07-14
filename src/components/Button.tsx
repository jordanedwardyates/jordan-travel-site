import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/**
 * Primary CTA — letterpress plate: ink fill with an inset hairline that
 * turns gold on hover; presses into the paper on click.
 */
export default function Button({ href, children, className = "" }: ButtonProps) {
  return (
    <a
      href={href}
      className={`relative inline-block whitespace-nowrap bg-aegean-ink px-10 py-4 text-sm uppercase tracking-[0.15em] text-vintage-passport transition-all duration-150 before:pointer-events-none before:absolute before:inset-[4px] before:border before:border-vintage-passport/40 before:transition-colors before:duration-150 hover:bg-deep-harbor hover:before:border-compass-gold/70 active:translate-y-px ${className}`}
    >
      {children}
    </a>
  );
}
