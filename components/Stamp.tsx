"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * A big rubber-stamp SLAM. Shows `label` when `show` is true, crashing in
 * from oversized + rotated to a satisfying settle.
 */
export default function Stamp({
  show,
  label = "CAUGHT!!",
  tone = "danger",
}: {
  show: boolean;
  label?: string;
  tone?: "danger" | "lime";
}) {
  const reduce = useReducedMotion();
  const bg = tone === "danger" ? "bg-danger" : "bg-lime";
  const text = tone === "danger" ? "text-white" : "text-ink";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <motion.div
            initial={
              reduce
                ? { scale: 1, rotate: -12, opacity: 1 }
                : { scale: 3.2, rotate: -32, opacity: 0 }
            }
            animate={{ scale: 1, rotate: -12, opacity: 1 }}
            transition={{ type: "spring", stiffness: 700, damping: 16, mass: 1.1 }}
            className={`select-none rounded-2xl border-[6px] border-ink ${bg} ${text} px-8 py-4 font-display text-5xl font-extrabold uppercase shadow-pop-lg sm:text-6xl`}
            style={{ letterSpacing: "0.02em" }}
          >
            {label}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
