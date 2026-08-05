import type { CSSProperties } from "react";
import { SuitPath, type Suit } from "./Suit";

type PokerChipProps = {
  /** chip body color (any CSS color — use the pop palette) */
  color?: string;
  /** edge-spot / ring color */
  edge?: string;
  /** suit stamped in the middle */
  suit?: Suit;
  /** …or a short text label instead of a suit */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Casino chip, sticker edition: pure SVG, thick ink outline, hard shadow —
 * same visual language as `.card-pop` / `.chip`.
 */
export default function PokerChip({
  color = "#FF2D95",
  edge = "#FFF8EE",
  suit,
  label,
  className = "",
  style,
}: PokerChipProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`drop-hard ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* body */}
      <circle cx="50" cy="50" r="46" fill={color} stroke="#1A1030" strokeWidth="6" />

      {/* edge spots */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={edge}
        strokeWidth="12"
        strokeDasharray="17 24.2"
        strokeDashoffset="9"
      />

      {/* inner field */}
      <circle cx="50" cy="50" r="30" fill={color} stroke="#1A1030" strokeWidth="5" />

      {suit ? (
        <g transform="translate(29 29) scale(1.75)" fill={edge}>
          <SuitPath suit={suit} />
        </g>
      ) : (
        <text
          x="50"
          y="51"
          dominantBaseline="central"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="24"
          fontWeight="800"
          fill={edge}
        >
          {label ?? "LD"}
        </text>
      )}
    </svg>
  );
}
