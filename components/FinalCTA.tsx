"use client";

import { motion, useReducedMotion } from "framer-motion";
import WaitlistForm from "./WaitlistForm";
import Reveal from "./Reveal";

const PERKS = [
  "Skip the line — early access before launch",
  "Founding-member badge in the app",
  "Launch-day surprises for the waitlist crew",
];

export default function FinalCTA() {
  return (
    <section id="join" className="relative overflow-hidden bg-magenta px-4 py-16 sm:px-6 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
      {/* floating sticker faces */}
      <FloatingFace className="left-[6%] top-10 hidden sm:block" mood="calm" />
      <FloatingFace className="right-[6%] bottom-10 hidden sm:block" mood="panic" />

      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="eyebrow bg-lime">LAST CHANCE TO SKIP THE LINE</span>
          <h2 className="mt-5 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span className="text-outline block">GET IN BEFORE</span>
            <span className="block text-sun text-outline">YOUR FRIENDS DO</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg font-bold text-white/95">
            Be first to point the phone. One email = early access + launch-day
            perks. No spam, just the good news.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-8 flex max-w-lg flex-col items-center">
            <div className="card-pop w-full bg-white p-5 sm:p-6">
              <WaitlistForm variant="final" source="final-cta" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <ul className="mx-auto mt-7 flex max-w-xl flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2 text-left font-bold text-white/95">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-white bg-lime">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="#1A1030" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm sm:text-base">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function FloatingFace({
  className = "",
  mood,
}: {
  className?: string;
  mood: "calm" | "panic";
}) {
  const reduce = useReducedMotion();
  const fill = mood === "calm" ? "#FFD84D" : "#FF6B5C";
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute ${className}`}
      animate={reduce ? undefined : { y: [0, -14, 0], rotate: [-4, 4, -4] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 80 80" className="h-20 w-20 drop-hard">
        <circle cx="40" cy="40" r="34" fill={fill} stroke="#1A1030" strokeWidth="4" />
        {mood === "calm" ? (
          <>
            <circle cx="30" cy="36" r="4" fill="#1A1030" />
            <circle cx="50" cy="36" r="4" fill="#1A1030" />
            <path d="M30 52 Q40 60 50 52" fill="none" stroke="#1A1030" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="30" cy="36" r="6" fill="#fff" stroke="#1A1030" strokeWidth="2" />
            <circle cx="50" cy="36" r="6" fill="#fff" stroke="#1A1030" strokeWidth="2" />
            <circle cx="30" cy="35" r="2.4" fill="#1A1030" />
            <circle cx="50" cy="35" r="2.4" fill="#1A1030" />
            <ellipse cx="40" cy="55" rx="6" ry="8" fill="#7A1030" stroke="#1A1030" strokeWidth="3" />
            <path d="M64 34 q-5 8 0 13 q5 -5 0 -13Z" fill="#4DA6FF" stroke="#1A1030" strokeWidth="2" />
          </>
        )}
      </svg>
    </motion.div>
  );
}
