"use client";

import SuitIcon, { type Suit } from "./Suit";

const SUIT_CYCLE: Suit[] = ["spade", "heart", "club", "diamond"];

/**
 * Infinite scrolling sticker banner. The track is duplicated so the CSS
 * translateX(-50%) loop is seamless. Pauses for reduced-motion users.
 * `icon="suits"` swaps the star separators for cycling card suits — used by
 * the poker stretch of the page.
 */
export default function Marquee({
  items,
  className = "",
  icon = "star",
}: {
  items: string[];
  className?: string;
  icon?: "star" | "suits";
}) {
  const track = [...items, ...items];
  return (
    <div
      className={`group relative flex overflow-hidden border-y-[3px] border-ink ${className}`}
      aria-hidden="true"
    >
      <div className="flex shrink-0 animate-marquee items-center gap-6 whitespace-nowrap py-3 motion-reduce:animate-none">
        {track.map((item, i) => (
          <span key={i} className="flex items-center gap-6">
            <span className="font-display text-xl font-extrabold uppercase tracking-wide">
              {item}
            </span>
            {icon === "suits" ? (
              <SuitIcon
                suit={SUIT_CYCLE[i % SUIT_CYCLE.length]}
                color="currentColor"
                className="h-5 w-5 shrink-0"
              />
            ) : (
              <Star />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        d="M12 2l2.6 6.3L21 9l-5 4.2L17.5 21 12 17.3 6.5 21 8 13.2 3 9l6.4-.7z"
        fill="currentColor"
        stroke="#1A1030"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
