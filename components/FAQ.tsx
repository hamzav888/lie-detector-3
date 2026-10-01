"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";

const FAQS = [
  {
    q: "Wait… is this a REAL lie detector?",
    a: "It’s built for entertainment first — but it isn’t random. It measures six real signals (blink rate, gaze, brow, mouth, head and body movement) against a baseline it learns from you, and it only moves when several of them agree. Think of it as an edge, not evidence: a sharper read than going in blind, never something to make real decisions about anyone. Stress isn’t the same as lying, and it knows that.",
  },
  {
    q: "Can I try it right now?",
    a: "Yes — the real build is running on this page, in the phone further up, and full screen at /play. Allow the camera, give it twenty calm seconds for the baseline, then ask away. It needs decent light and a face in frame. The first launch downloads the face model once (about 13 MB); after that it runs offline.",
  },
  {
    q: "Is my data private?",
    a: "Yes, that’s the whole point. The read happens on-device with your consent — the camera feed is processed on your phone (or in your browser for the preview), never sent to a server. There’s no account. The only thing we ever ask for is the email you choose to leave on the waitlist. The privacy page has the full picture.",
  },
  {
    q: "When does it come out?",
    a: "Soon — the read is working (you can try it above) and we’re finishing the native iOS and Android apps. Drop your email and you’ll be first through the door, before your nosiest friend.",
  },
  {
    q: "Is it free?",
    a: "There’ll be a free way to play and cause problems. Waitlist crew gets early access and launch perks first — we’ll share the rest closer to launch.",
  },
  {
    q: "How do I actually play?",
    a: "Two people, one phone. Twenty calm seconds for the baseline, then ask the spicy question and let it read the whole answer. You get a number, a verdict and a list of exactly which tells moved. Screenshot the reveal, post it, run it back.",
  },
  {
    q: "What’s Poker Mode?",
    a: "The same read, brought to online poker night. Get your friends around a virtual table with cameras on, everyone opts in, and Poker Mode reads each player while they bet — so every all-in comes with a needle to argue about. It’s coming soon and isn’t in the preview yet. It’s for friendly games and laughs, not a strategy tool, and never for anywhere real money changes hands.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative bg-cream px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-10 text-center">
          <span className="eyebrow bg-sky text-white">THE REAL TALK</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl lg:text-6xl">
            Questions? We got answers
          </h2>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <FAQItem q={f.q} a={f.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  return (
    <div className="card-pop overflow-hidden bg-white">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="font-display text-lg font-extrabold sm:text-xl">{q}</span>
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-sun transition-transform duration-200 ${
              open ? "rotate-45" : ""
            }`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" stroke="#1A1030" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 font-semibold text-ink/75">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
