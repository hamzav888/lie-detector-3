"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Meter from "./Meter";
import Confetti from "./Confetti";
import Stamp from "./Stamp";
import Reveal from "./Reveal";

const QUESTIONS = [
  "Have you ever liked your own post from a finsta?",
  "Do you REALLY love your friend’s new haircut?",
  "Did you actually read the group chat?",
  "Were you ‘5 minutes away’… 20 minutes ago?",
  "Have you ghosted a ‘we should hang soon’?",
  "Is your camera roll 90% selfies?",
  "Did you say ‘lol’ without laughing once?",
  "Have you re-gifted a present?",
  "Do you actually floss like you told the dentist?",
  "Have you googled yourself this week?",
];

// Bias toward the dramatic ends — nobody shares a boring 51%.
function dramaticRandom() {
  const r = Math.random();
  if (r < 0.4) return Math.floor(Math.random() * 26); // 0–25 clean
  if (r < 0.85) return 74 + Math.floor(Math.random() * 27); // 74–100 caught
  return 30 + Math.floor(Math.random() * 40); // mushy middle
}

export default function InteractiveTeaser() {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? 82 : 0);
  const [question, setQuestion] = useState(QUESTIONS[0]);
  const [asked, setAsked] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [stamp, setStamp] = useState<null | { label: string; tone: "danger" | "lime" }>(null);
  const [busy, setBusy] = useState(false);

  function ask() {
    if (busy) return;
    setBusy(true);
    setStamp(null);
    setAsked(true);

    // fresh question (not the same one twice)
    setQuestion((q) => {
      let next = q;
      while (next === q) next = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      return next;
    });

    const target = dramaticRandom();
    setValue(target);

    const settle = reduce ? 150 : 950;
    window.setTimeout(() => {
      if (target >= 74) {
        setStamp({ label: "CAUGHT!!", tone: "danger" });
        setConfettiKey((k) => k + 1);
      } else if (target <= 25) {
        setStamp({ label: "SQUEAKY CLEAN", tone: "lime" });
        setConfettiKey((k) => k + 1);
      } else {
        setConfettiKey((k) => k + 1);
      }
      window.setTimeout(() => setStamp(null), 1500);
      setBusy(false);
    }, settle);
  }

  return (
    <section id="try" className="relative overflow-hidden bg-grape px-4 py-16 sm:px-6 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="eyebrow bg-sun">TRY THE DEMO</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
            Tap it. I dare you.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg font-semibold text-white/85">
            A tiny taste of the drama (with totally random numbers — the real
            app actually reads the room).
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-8 max-w-md">
            <Confetti fireKey={confettiKey} />
            <Stamp show={!!stamp} label={stamp?.label} tone={stamp?.tone} />

            <div className="card-pop bg-white p-5 sm:p-7">
              <div className="min-h-[3.5rem]">
                <motion.p
                  key={question}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-lg font-extrabold leading-tight text-ink sm:text-xl"
                >
                  {asked ? question : "Press the button and answer out loud…"}
                </motion.p>
              </div>

              <div className="mt-2">
                <Meter value={value} alarmed={value >= 82} />
              </div>

              <motion.button
                type="button"
                onClick={ask}
                whileTap={{ scale: 0.95 }}
                disabled={busy}
                className="btn-pop mt-4 w-full bg-magenta text-xl text-white disabled:opacity-80"
              >
                {busy ? "READING YOU…" : asked ? "ASK ME ANOTHER" : "ASK ME ANYTHING"}
              </motion.button>
              <p className="mt-3 text-xs font-bold text-ink/45">
                just a demo · totally random numbers · the real app actually reads you
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <a href="#join" className="btn-pop mt-8 bg-lime text-ink">
            OK I NEED THE REAL THING →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
