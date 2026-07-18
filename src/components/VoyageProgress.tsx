/**
 * Dashed gold route line fixed across the top of the viewport, revealed
 * left to right as the reader scrolls — the passage under way. Pure CSS
 * scroll timeline (see globals.css); renders nothing visible in engines
 * without support or when the reader prefers reduced motion.
 */
export default function VoyageProgress() {
  return <div aria-hidden="true" className="voyage-progress" />;
}
