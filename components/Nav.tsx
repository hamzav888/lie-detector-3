"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Wordmark from "./Wordmark";

/** Chunky sticky nav: wordmark + a loud JOIN NOW pill that scrolls to the form. */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-pill border-[3px] border-ink bg-white/95 px-4 py-2.5 backdrop-blur transition-shadow sm:px-5 ${
          scrolled ? "shadow-pop" : "shadow-pop-sm"
        }`}
      >
        <a
          href="#top"
          className="rounded-lg focus-visible:outline-ink"
          aria-label="Back to top"
        >
          <Wordmark />
        </a>

        <div className="flex items-center gap-2">
          <a
            href="#how"
            className="hidden rounded-pill px-4 py-2 font-display text-base font-extrabold text-ink/80 transition-colors hover:text-ink sm:inline-block"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="hidden rounded-pill px-4 py-2 font-display text-base font-extrabold text-ink/80 transition-colors hover:text-ink sm:inline-block"
          >
            FAQ
          </a>
          <motion.a
            href="#join"
            whileTap={{ scale: 0.94 }}
            className="btn-pop bg-lime text-ink"
          >
            JOIN NOW
          </motion.a>
        </div>
      </nav>
    </header>
  );
}
