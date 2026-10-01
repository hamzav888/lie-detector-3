"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";

type Signal = { name: string; body: string; bg: string; icon: React.ReactNode };

/* These six are exactly what the app measures. Keep them honest. */
const SIGNALS: Signal[] = [
  { name: "Blink rate", body: "How often the eyes close, counted over a rolling window. Climbs under load.", bg: "bg-lime", icon: <IconBlink /> },
  { name: "Gaze", body: "How far the eyes drift from the lens. Looking anywhere but at you is a classic.", bg: "bg-sun", icon: <IconGaze /> },
  { name: "Brow", body: "Inner-brow raise and brow furrow — the little knot between the eyebrows.", bg: "bg-magenta", icon: <IconBrow /> },
  { name: "Mouth", body: "Lip press, pucker and jaw tension. The face swallowing a sentence.", bg: "bg-sky", icon: <IconMouth /> },
  { name: "Head", body: "Nods, shakes and the slow lean back from the camera.", bg: "bg-grape", icon: <IconHead /> },
  { name: "Body", body: "Shoulders, hands, the fidget the face mesh can’t see. Caught on the whole frame.", bg: "bg-white", icon: <IconBody /> },
];

export default function Signals() {
  return (
    <section id="signals" className="relative bg-cream px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10 text-center sm:mb-14">
          <span className="eyebrow bg-sky text-white">WHAT IT ACTUALLY READS</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl lg:text-6xl">
            Six tells. One very nosy needle.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg font-semibold text-ink/70">
            First it learns your calm face. Then every signal is measured as drift from{" "}
            <em className="not-italic underline decoration-magenta decoration-[3px] underline-offset-4">your</em>{" "}
            normal — not against some average stranger. One twitch on its own won&apos;t move
            it. Several agreeing will.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNALS.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06}>
              <SignalCard s={s} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-center font-semibold text-ink/55">
            Stress isn&apos;t the same thing as lying — calm liars and nervous honest people both
            exist. It gives you a sharper read than going in blind, not a verdict.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function SignalCard({ s }: { s: Signal }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -6, rotate: -1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={`card-pop flex h-full flex-col p-6 ${s.bg} ${s.bg === "bg-magenta" || s.bg === "bg-sky" || s.bg === "bg-grape" ? "text-white" : "text-ink"}`}
    >
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-ink bg-white">
        {s.icon}
      </span>
      <h3 className="font-display text-2xl font-extrabold leading-tight">{s.name}</h3>
      <p className={`mt-2 font-semibold ${s.bg === "bg-magenta" || s.bg === "bg-sky" || s.bg === "bg-grape" ? "text-white/85" : "text-ink/70"}`}>
        {s.body}
      </p>
    </motion.article>
  );
}

/* ── drawn icons, house style ── */
const S = { fill: "none", stroke: "#1A1030", strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function IconBlink() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M4 16c3-6 7-9 12-9s9 3 12 9c-3 6-7 9-12 9S7 22 4 16Z" {...S} />
      <circle cx="16" cy="16" r="4" fill="#1A1030" />
      <path d="M8 24l2-3M24 24l-2-3M16 27v-3" {...S} />
    </svg>
  );
}
function IconGaze() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M4 16c3-6 7-9 12-9s9 3 12 9c-3 6-7 9-12 9S7 22 4 16Z" {...S} />
      <circle cx="20" cy="14" r="4" fill="#FF2D95" stroke="#1A1030" strokeWidth="2" />
      <path d="M22 6l4-3M26 3v4h-4" {...S} />
    </svg>
  );
}
function IconBrow() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M5 13c3-3 7-3 10 0M17 13c3-3 7-3 10 0" {...S} />
      <circle cx="10" cy="21" r="2.4" fill="#1A1030" />
      <circle cx="22" cy="21" r="2.4" fill="#1A1030" />
    </svg>
  );
}
function IconMouth() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M6 17c3-3 6-4 10-4s7 1 10 4c-3 3-6 5-10 5s-7-2-10-5Z" {...S} />
      <path d="M8 17h16" {...S} />
    </svg>
  );
}
function IconHead() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <circle cx="16" cy="15" r="7" {...S} />
      <path d="M3 15h4M25 15h4M5 10l2 2M27 10l-2 2M5 20l2-2M27 20l-2-2" {...S} />
    </svg>
  );
}
function IconBody() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <circle cx="16" cy="8" r="4" {...S} />
      <path d="M5 27c1-7 5-10 11-10s10 3 11 10" {...S} />
      <path d="M3 18l3 3M29 18l-3 3" {...S} />
    </svg>
  );
}
