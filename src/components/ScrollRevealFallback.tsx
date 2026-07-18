"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveal fallback for engines without CSS scroll-driven animations
 * (Firefox, at time of writing). Where `animation-timeline: view()` is
 * supported this renders nothing and does nothing — the CSS in
 * globals.css owns the motion. Otherwise it tags <html> with
 * `js-reveal` (so elements are only ever hidden once JS is live) and
 * plays each .ink-rise / .stamp-settle once via IntersectionObserver.
 */
export default function ScrollRevealFallback() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      typeof CSS !== "undefined" &&
      CSS.supports("animation-timeline: view()")
    ) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    document.documentElement.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      // Fire once ~12% above the fold's bottom edge, roughly where the
      // scrubbed CSS version finishes settling.
      { rootMargin: "0px 0px -12% 0px" }
    );

    document
      .querySelectorAll(".ink-rise, .stamp-settle")
      .forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
