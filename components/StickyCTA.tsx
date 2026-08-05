"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Small floating "join" bar for phones. Shows once you're past the hero and
 * gets out of the way when the real signup form is on screen.
 */
export default function StickyCTA() {
  const reduce = useReducedMotion();
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const join = document.getElementById("join");
    if (!join) return;
    const io = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { rootMargin: "-10% 0px -10% 0px" },
    );
    io.observe(join);
    return () => io.disconnect();
  }, []);

  const show = pastHero && !formVisible;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed inset-x-3 bottom-3 z-50 sm:hidden"
        >
          <a
            href="#join"
            className="flex items-center justify-between gap-3 rounded-pill border-[3px] border-ink bg-white px-4 py-2.5 shadow-pop"
          >
            <span className="text-left leading-tight">
              <span className="block font-display text-base font-extrabold text-ink">
                Skip the line
              </span>
              <span className="block text-xs font-bold text-ink/55">
                Early access on iOS &amp; Android
              </span>
            </span>
            <span className="rounded-pill border-[3px] border-ink bg-lime px-4 py-1.5 font-display text-sm font-extrabold text-ink">
              JOIN
            </span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
