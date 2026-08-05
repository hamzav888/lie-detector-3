/**
 * Card suits drawn as SVG paths — no emoji, no font glyphs, no image deps.
 * Pop palette: red suits go magenta, black suits go ink.
 */
export type Suit = "spade" | "heart" | "diamond" | "club";

export const SUIT_COLOR: Record<Suit, string> = {
  spade: "#1A1030",
  club: "#1A1030",
  heart: "#FF2D95",
  diamond: "#FF2D95",
};

export function isRed(suit: Suit) {
  return suit === "heart" || suit === "diamond";
}

/** Raw path geometry on a 24×24 grid, reused by cards, chips and dividers. */
export function SuitPath({ suit }: { suit: Suit }) {
  switch (suit) {
    case "heart":
      return (
        <path d="M12 21.5C12 21.5 2.5 15.4 2.5 9.2A4.7 4.7 0 0 1 12 6.9a4.7 4.7 0 0 1 9.5 2.3c0 6.2-9.5 12.3-9.5 12.3Z" />
      );
    case "diamond":
      return <path d="M12 1.8 20.6 12 12 22.2 3.4 12Z" />;
    case "club":
      return (
        <path d="M12 2.4a4.3 4.3 0 0 0-3.2 7.2 4.3 4.3 0 1 0-1.5 8.2 4.3 4.3 0 0 0 3.5-1.9c-.2 2.6-1.4 4.4-2.9 5.6h8.2c-1.5-1.2-2.7-3-2.9-5.6a4.3 4.3 0 0 0 3.5 1.9 4.3 4.3 0 1 0-1.5-8.2A4.3 4.3 0 0 0 12 2.4Z" />
      );
    case "spade":
    default:
      return (
        <path d="M12 1.8S2.6 9.1 2.6 14a4.4 4.4 0 0 0 7.7 2.9c-.2 2.5-1.4 4.2-2.9 5.3h9.2c-1.5-1.1-2.7-2.8-2.9-5.3A4.4 4.4 0 0 0 21.4 14C21.4 9.1 12 1.8 12 1.8Z" />
      );
  }
}

/** A single suit mark. `color` defaults to the suit's pop color. */
export default function SuitIcon({
  suit,
  className = "h-5 w-5",
  color,
  outlined = false,
}: {
  suit: Suit;
  className?: string;
  color?: string;
  outlined?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={color ?? SUIT_COLOR[suit]}
      stroke={outlined ? "#1A1030" : "none"}
      strokeWidth={outlined ? 1.6 : 0}
      strokeLinejoin="round"
    >
      <SuitPath suit={suit} />
    </svg>
  );
}
