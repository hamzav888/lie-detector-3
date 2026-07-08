"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const COLORS = ["#FF2D95", "#B6FF2E", "#FFD200", "#2E7BFF", "#8A3FFC", "#FF3B30"];

type Piece = {
  id: number;
  x: number;
  y: number;
  rot: number;
  color: string;
  size: number;
  round: boolean;
};

/**
 * Confetti burst that fires whenever `fireKey` changes to a new truthy value.
 * Pure CSS/framer-motion particles — no external assets. Skipped when the
 * user prefers reduced motion.
 */
export default function Confetti({ fireKey }: { fireKey: number }) {
  const reduce = useReducedMotion();
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!fireKey || reduce) return;
    const batch: Piece[] = Array.from({ length: 44 }, (_, i) => ({
      id: fireKey * 1000 + i,
      x: (Math.random() - 0.5) * 320,
      y: -120 - Math.random() * 200,
      rot: Math.random() * 720 - 360,
      color: COLORS[i % COLORS.length],
      size: 8 + Math.random() * 10,
      round: Math.random() > 0.5,
    }));
    setPieces(batch);
    const timer = setTimeout(() => setPieces([]), 1600);
    return () => clearTimeout(timer);
  }, [fireKey, reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rot, scale: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 + Math.random() * 0.4, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.round ? "999px" : "3px",
              border: "2px solid #1A1030",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
