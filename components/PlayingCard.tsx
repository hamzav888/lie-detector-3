"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SuitPath, SUIT_COLOR, type Suit } from "./Suit";

type PlayingCardProps = {
  rank?: string;
  suit?: Suit;
  /** true = face up, false = show the sticker-y back */
  showFace?: boolean;
  className?: string;
  style?: CSSProperties;
  /** skip the 3D flip (purely decorative card) */
  static?: boolean;
};

/**
 * A playing card in the POP house style: thick ink outline, hard offset
 * shadow, candy suits. Drawn as SVG so every part scales with the card.
 * Flips in 3D when `showFace` toggles.
 */
export default function PlayingCard({
  rank = "A",
  suit = "spade",
  showFace = true,
  className = "",
  style,
  static: isStatic = false,
}: PlayingCardProps) {
  const reduce = useReducedMotion();
  const color = SUIT_COLOR[suit];
  const uid = `${rank}-${suit}`.replace(/[^a-z0-9-]/gi, "");

  return (
    <div
      className={`relative aspect-[5/7] select-none ${className}`}
      style={{ perspective: 1000, ...style }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ rotateY: showFace ? 0 : 180 }}
        transition={
          reduce || isStatic
            ? { duration: 0 }
            : { type: "spring", stiffness: 140, damping: 16 }
        }
      >
        {/* ── FACE ── */}
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
          <svg viewBox="0 0 100 140" className="h-full w-full drop-hard">
            <rect
              x="3"
              y="3"
              width="94"
              height="134"
              rx="12"
              fill="#FFFFFF"
              stroke="#1A1030"
              strokeWidth="6"
            />

            {/* corner index — top-left */}
            <text
              x="18"
              y="30"
              fontFamily="var(--font-display)"
              fontSize="24"
              fontWeight="800"
              fill={color}
              textAnchor="middle"
            >
              {rank}
            </text>
            <g transform="translate(11 34) scale(0.6)" fill={color}>
              <SuitPath suit={suit} />
            </g>

            {/* big center pip */}
            <g transform="translate(26 44) scale(2)" fill={color}>
              <SuitPath suit={suit} />
            </g>

            {/* corner index — bottom-right (rotated) */}
            <g transform="rotate(180 50 70)">
              <text
                x="18"
                y="30"
                fontFamily="var(--font-display)"
                fontSize="24"
                fontWeight="800"
                fill={color}
                textAnchor="middle"
              >
                {rank}
              </text>
              <g transform="translate(11 34) scale(0.6)" fill={color}>
                <SuitPath suit={suit} />
              </g>
            </g>
          </svg>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <svg viewBox="0 0 100 140" className="h-full w-full drop-hard">
            <defs>
              <pattern
                id={`weave-${uid}`}
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="12" height="12" fill="#8A3FFC" />
                <line x1="0" y1="0" x2="0" y2="12" stroke="#B6FF2E" strokeWidth="3" />
                <line x1="6" y1="0" x2="6" y2="12" stroke="#FF2D95" strokeWidth="3" />
              </pattern>
              <clipPath id={`clip-${uid}`}>
                <rect x="3" y="3" width="94" height="134" rx="12" />
              </clipPath>
            </defs>

            <g clipPath={`url(#clip-${uid})`}>
              <rect x="3" y="3" width="94" height="134" fill={`url(#weave-${uid})`} />
            </g>
            <rect
              x="3"
              y="3"
              width="94"
              height="134"
              rx="12"
              fill="none"
              stroke="#1A1030"
              strokeWidth="6"
            />
            <circle cx="50" cy="70" r="24" fill="#FFD200" stroke="#1A1030" strokeWidth="5" />
            <text
              x="50"
              y="71"
              dominantBaseline="central"
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize="20"
              fontWeight="800"
              fill="#1A1030"
            >
              LD
            </text>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
