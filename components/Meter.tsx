"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { clamp, lerp, lerpColor, verdictFor } from "@/lib/utils";

type MeterProps = {
  /** 0–100 reading */
  value: number;
  /** shake + glow when the reading is high */
  alarmed?: boolean;
  className?: string;
};

/**
 * The signature "Truth-o-meter": a chunky expressive face on top of a
 * semicircular gauge with a springy needle. Face + needle + number all
 * animate from one bouncy spring so they stay in sync.
 */
export default function Meter({ value, alarmed, className }: MeterProps) {
  const reduce = useReducedMotion();
  const safe = clamp(value);

  // One spring drives everything.
  const target = useMotionValue(safe);
  const spring = useSpring(target, {
    stiffness: reduce ? 300 : 90,
    damping: reduce ? 40 : 9,
    mass: 1,
  });

  useEffect(() => {
    target.set(safe);
  }, [safe, target]);

  // Needle rotation without re-rendering.
  const rotate = useTransform(spring, (v) => 1.8 * v - 90);

  // Face + number react to the live spring value.
  const [live, setLive] = useState(safe);
  useMotionValueEvent(spring, "change", (v) => setLive(v));

  const t = clamp(live) / 100; // 0..1 panic factor
  const shown = Math.round(clamp(live));
  const verdict = verdictFor(shown);

  // Face color: calm sunny yellow → flushed panic red
  const faceFill = lerpColor("#FFD84D", "#FF6B5C", Math.min(1, t * 1.15));
  const faceStroke = "#1A1030";

  // Eyes widen with panic; pupils rise (looking up, scared)
  const eyeRy = lerp(9, 15, t);
  const eyeRx = lerp(10, 13.5, t);
  const pupilR = lerp(5.5, 3.6, t);
  const pupilDy = lerp(2, -3.5, t); // pupils drift up when scared
  const browY = lerp(0, -4, t); // brows lift/tense
  const browTilt = lerp(-6, 16, t); // inner brow angle (worried)

  // Mouth crossfade: smile → nervous → panic "O"
  const smileOp = clamp(1 - t * 2.4, 0, 1);
  const flatOp = clamp(1 - Math.abs(t - 0.5) * 3.2, 0, 1);
  const panicOp = clamp((t - 0.55) * 2.6, 0, 1);

  // Sweat + blush ramp in as it climbs
  const sweatOp = clamp((t - 0.45) * 2.4, 0, 1);
  const blushOp = clamp((t - 0.5) * 2, 0, 1);

  const glow = alarmed || t > 0.82;

  return (
    <div
      className={className}
      role="img"
      aria-label={`Truth-o-meter reading ${shown} percent — ${verdict.word}`}
    >
      <motion.svg
        viewBox="0 0 320 330"
        className="w-full h-auto overflow-visible"
        animate={
          glow && !reduce
            ? { x: [0, -3, 3, -2, 2, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.35, repeat: glow && !reduce ? Infinity : 0 }}
      >
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7ED000" />
            <stop offset="30%" stopColor="#B6FF2E" />
            <stop offset="55%" stopColor="#FFD200" />
            <stop offset="78%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#FF3B30" />
          </linearGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FF3B30" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* danger glow behind everything */}
        {glow && (
          <circle cx="160" cy="150" r="150" fill="url(#glowGrad)" />
        )}

        {/* ─── FACE ─── */}
        <g>
          {/* head */}
          <circle
            cx="160"
            cy="92"
            r="74"
            fill={faceFill}
            stroke={faceStroke}
            strokeWidth="6"
          />
          {/* blush */}
          <ellipse
            cx="118"
            cy="104"
            rx="14"
            ry="9"
            fill="#FF3B7A"
            opacity={blushOp * 0.7}
          />
          <ellipse
            cx="202"
            cy="104"
            rx="14"
            ry="9"
            fill="#FF3B7A"
            opacity={blushOp * 0.7}
          />

          {/* eyebrows */}
          <g
            transform={`translate(0 ${browY})`}
            stroke={faceStroke}
            strokeWidth="5"
            strokeLinecap="round"
          >
            <line
              x1="118"
              y1={70}
              x2="146"
              y2={70}
              transform={`rotate(${browTilt} 132 70)`}
            />
            <line
              x1="174"
              y1={70}
              x2="202"
              y2={70}
              transform={`rotate(${-browTilt} 188 70)`}
            />
          </g>

          {/* eyes */}
          <g>
            <ellipse cx="132" cy="88" rx={eyeRx} ry={eyeRy} fill="#fff" stroke={faceStroke} strokeWidth="3" />
            <ellipse cx="188" cy="88" rx={eyeRx} ry={eyeRy} fill="#fff" stroke={faceStroke} strokeWidth="3" />
            <circle cx="132" cy={88 + pupilDy} r={pupilR} fill={faceStroke} />
            <circle cx="188" cy={88 + pupilDy} r={pupilR} fill={faceStroke} />
          </g>

          {/* mouth — three crossfading states */}
          <g stroke={faceStroke} strokeWidth="5" strokeLinecap="round" fill="none">
            {/* calm smile */}
            <path d="M132 120 Q160 140 188 120" opacity={smileOp} />
            {/* nervous squiggle */}
            <path d="M134 124 q9 -8 18 0 t18 0 t8 0" opacity={flatOp} />
          </g>
          {/* panic open mouth */}
          <g opacity={panicOp}>
            <ellipse cx="160" cy="126" rx="16" ry="20" fill="#7A1030" stroke={faceStroke} strokeWidth="5" />
            <ellipse cx="160" cy="138" rx="8" ry="10" fill="#FF5C7A" />
          </g>

          {/* sweat drops */}
          <motion.g
            opacity={sweatOp}
            animate={reduce ? {} : { y: [0, 5, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M96 78 q-7 12 0 18 q7 -6 0 -18 Z"
              fill="#4DA6FF"
              stroke={faceStroke}
              strokeWidth="2.5"
            />
            <path
              d="M226 84 q-7 12 0 18 q7 -6 0 -18 Z"
              fill="#4DA6FF"
              stroke={faceStroke}
              strokeWidth="2.5"
            />
          </motion.g>
        </g>

        {/* ─── GAUGE ─── */}
        {/* track */}
        <path
          d="M40 300 A120 120 0 0 1 280 300"
          fill="none"
          stroke="#1A1030"
          strokeWidth="26"
          strokeLinecap="round"
        />
        {/* colored arc */}
        <path
          d="M46 300 A114 114 0 0 1 274 300"
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* tick labels */}
        <text x="34" y="322" fontSize="15" fontWeight="800" fill="#1A1030" className="font-display">
          TRUTH
        </text>
        <text x="250" y="322" fontSize="15" fontWeight="800" fill="#FF3B30" className="font-display">
          LIE!!
        </text>

        {/* needle */}
        <motion.g style={{ rotate, originX: "160px", originY: "300px" }}>
          {/* pointer drawn pointing UP; rotate maps value → angle */}
          <path
            d="M160 192 L150 300 L170 300 Z"
            fill="#1A1030"
          />
          <circle cx="160" cy="300" r="16" fill="#1A1030" />
          <circle cx="160" cy="300" r="6" fill="#FFF8EE" />
        </motion.g>
      </motion.svg>

      {/* big animated readout */}
      <div className="mt-1 flex flex-col items-center">
        <div className="flex items-baseline gap-1 leading-none">
          <span
            className="font-display text-6xl font-extrabold tabular-nums sm:text-7xl"
            style={{ color: lerpColor("#7ED000", "#FF3B30", t) }}
          >
            {shown}
          </span>
          <span className="font-display text-3xl font-extrabold text-ink/70">%</span>
        </div>
        <motion.span
          key={verdict.word}
          initial={reduce ? false : { scale: 0.6, rotate: -6, opacity: 0 }}
          animate={{ scale: 1, rotate: -2, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 14 }}
          className={`mt-2 inline-block rounded-pill border-[3px] border-ink px-4 py-1 font-display text-xl font-extrabold shadow-pop-sm ${toneBg(
            verdict.tone,
          )}`}
        >
          {verdict.word}
        </motion.span>
      </div>
    </div>
  );
}

function toneBg(tone: string) {
  switch (tone) {
    case "lime":
      return "bg-lime text-ink";
    case "sun":
      return "bg-sun text-ink";
    case "magenta":
      return "bg-magenta text-white";
    case "danger":
      return "bg-danger text-white";
    default:
      return "bg-white text-ink";
  }
}
