/**
 * A torn "sticker" edge for the top of a section. `fill` should be the colour
 * of the section ABOVE, so the two blocks look interlocked.
 */
export default function Zigzag({
  fill = "#FFF8EE",
  className = "",
  teeth = 24,
}: {
  fill?: string;
  className?: string;
  teeth?: number;
}) {
  const W = 1200;
  const H = 34;
  const step = W / teeth;

  // flat top, zigzag bottom
  let d = `M0 0 H${W} V${H * 0.35}`;
  for (let i = teeth; i > 0; i--) {
    const x = (i - 0.5) * step;
    d += ` L${x} ${H} L${(i - 1) * step} ${H * 0.35}`;
  }
  d += " Z";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-4 w-full sm:h-6 ${className}`}
    >
      <path d={d} fill={fill} />
    </svg>
  );
}
