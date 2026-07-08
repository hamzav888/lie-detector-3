"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";

type Step = {
  n: string;
  title: string;
  body: string;
  bg: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  {
    n: "1",
    title: "Chill out",
    body: "Answer a couple of easy warm-ups so the app learns your calm ‘baseline’. Deep breath. You got this.",
    bg: "bg-lime",
    icon: <IconBaseline />,
  },
  {
    n: "2",
    title: "Ask the spicy stuff",
    body: "Point the camera. It reads your blinks, breathing & micro-expressions — all on your phone, with consent.",
    bg: "bg-sun",
    icon: <IconCamera />,
  },
  {
    n: "3",
    title: "Watch it FREAK OUT",
    body: "The needle swings as your friend squirms. Truth… or total cap? The whole room leans in.",
    bg: "bg-magenta",
    icon: <IconMeter />,
  },
  {
    n: "4",
    title: "Screenshot the carnage",
    body: "Big reveal. Ridiculous reading. Screenshot it, post it, run it back. Loser buys snacks.",
    bg: "bg-sky",
    icon: <IconShare />,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative bg-cream px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10 text-center sm:mb-14">
          <span className="eyebrow bg-lime">HOW IT WORKS</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl lg:text-6xl">
            Four taps to total chaos
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-ink/70">
            Two people. One phone. A needle that has zero chill.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <StepCard step={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step }: { step: Step }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -6, rotate: -1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="card-pop flex h-full flex-col p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-ink ${step.bg} font-display text-3xl font-extrabold shadow-pop-sm`}
        >
          {step.n}
        </span>
        <span className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-ink bg-white">
          {step.icon}
        </span>
      </div>
      <h3 className="font-display text-2xl font-extrabold leading-tight">
        {step.title}
      </h3>
      <p className="mt-2 font-semibold text-ink/70">{step.body}</p>
    </motion.article>
  );
}

/* ── tiny drawn icons (no external assets) ── */
function IconBaseline() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M3 20 h6 l3 -8 4 14 3 -10 3 6 h7" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <rect x="4" y="9" width="24" height="16" rx="4" fill="none" stroke="#1A1030" strokeWidth="2.6" />
      <circle cx="16" cy="17" r="5" fill="none" stroke="#1A1030" strokeWidth="2.6" />
      <path d="M11 9 l2 -3 h6 l2 3" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}
function IconMeter() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M5 24 A11 11 0 0 1 27 24" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="16" y1="24" x2="22" y2="13" stroke="#FF2D95" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="16" cy="24" r="2.6" fill="#1A1030" />
    </svg>
  );
}
function IconShare() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <circle cx="9" cy="16" r="3.4" fill="none" stroke="#1A1030" strokeWidth="2.6" />
      <circle cx="23" cy="8" r="3.4" fill="none" stroke="#1A1030" strokeWidth="2.6" />
      <circle cx="23" cy="24" r="3.4" fill="none" stroke="#1A1030" strokeWidth="2.6" />
      <path d="M12 14.5 L20 9.5 M12 17.5 L20 22.5" stroke="#1A1030" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
