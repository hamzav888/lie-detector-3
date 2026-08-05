"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Meter from "./Meter";
import WaitlistForm from "./WaitlistForm";
import PokerChip from "./PokerChip";
import SuitIcon from "./Suit";

// A little scripted demo so the hero meter feels alive on load.
const DEMO_SEQUENCE = [12, 68, 34, 88, 22, 74, 47];

export default function Hero() {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? 73 : 12);

  useEffect(() => {
    if (reduce) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % DEMO_SEQUENCE.length;
      setValue(DEMO_SEQUENCE[i]);
    }, 2200);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-sky px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-10"
    >
      {/* playful background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-magenta/40 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-lime/40 blur-2xl"
      />
      {/* a chip drifting in the corner — the only poker note up here */}
      <div aria-hidden className="pointer-events-none absolute -left-8 bottom-8 hidden lg:block">
        <PokerChip
          suit="club"
          color="#FFD200"
          edge="#1A1030"
          className={`h-24 w-24 opacity-90 ${reduce ? "" : "animate-chip-bob"}`}
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 pt-6 md:grid-cols-2 md:gap-6 md:pt-12">
        {/* ── Copy + form ── */}
        <div className="text-center md:text-left">
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <motion.span
              initial={reduce ? false : { scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
              className="chip inline-flex bg-sun text-ink"
            >
              <span className="grid h-4 w-4 place-items-center rounded-full bg-danger" />
              LAUNCHING SOON · iOS &amp; ANDROID
            </motion.span>
            <motion.a
              href="#poker"
              initial={reduce ? false : { scale: 0, rotate: 8 }}
              animate={{ scale: 1, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.18 }}
              className="chip inline-flex bg-felt text-cream transition-transform hover:-translate-y-[2px]"
            >
              <SuitIcon suit="spade" color="#FFF8EE" className="h-3.5 w-3.5" />
              POKER MODE INSIDE
            </motion.a>
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span className="text-outline block text-white">CAN YOUR FACE</span>
            <span className="mt-1 block text-sun text-outline">KEEP A SECRET?</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-lg font-bold text-white/95 sm:text-xl md:mx-0">
            Point your phone. Ask the spicy questions. Watch the needle{" "}
            <span className="rounded-md bg-magenta px-1.5 text-white">freak out</span>{" "}
            as your bestie sweats. It&apos;s the lie-detector party game — coming soon.
          </p>

          <div className="mt-7 flex flex-col items-center md:items-start" id="join-hero">
            <WaitlistForm variant="hero" source="hero" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 md:justify-start">
            <Dots />
            <span className="text-sm font-bold text-white/85">
              <span className="tabular-nums">18,427</span> already skipping the
              line
            </span>
          </div>
        </div>

        {/* ── Meter ── */}
        <div className="relative mx-auto w-full max-w-md">
          <motion.div
            initial={reduce ? false : { y: 30, opacity: 0, rotate: 2 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.15 }}
            className="card-pop relative bg-white p-5 sm:p-7"
          >
            {/* corner stickers */}
            <span className="chip absolute -left-3 -top-3 rotate-[-8deg] bg-lime">
              LIVE
            </span>
            <span className="chip absolute -right-3 -top-3 rotate-[8deg] bg-magenta text-white">
              DRAMA ✦
            </span>

            <p className="mb-1 text-center font-display text-sm font-extrabold uppercase tracking-widest text-ink/50">
              The Truth-o-meter™
            </p>
            <Meter value={value} />
            <p className="mt-3 text-center text-xs font-bold text-ink/45">
              For entertainment only — it just has to be right about half the time.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Dots() {
  return (
    <div className="flex -space-x-2">
      {["bg-magenta", "bg-lime", "bg-sun", "bg-grape"].map((c, i) => (
        <span
          key={i}
          className={`h-7 w-7 rounded-full border-[3px] border-ink ${c}`}
        />
      ))}
    </div>
  );
}
