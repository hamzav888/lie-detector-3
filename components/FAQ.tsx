"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";

const FAQS = [
  {
    q: "Wait… is this a REAL lie detector?",
    a: "It’s built for entertainment first — but it’s not just random. It reads real stress-y signals (blinks, breathing, micro-expressions) to give you a much better read than going in blind. Think of it as an edge, not evidence: way more telling than a plain guess, but never something to make real decisions about anyone. And honestly? It only has to be right about half the time to ruin friendships.",
  },
  {
    q: "Is my data private?",
    a: "Yes, that’s the whole point. The read happens on-device with your consent — your camera feed is processed on your phone, not shipped off to some server. We’re here for the group-chat chaos, not your secrets. Full details will live in our privacy policy at launch.",
  },
  {
    q: "When does it come out?",
    a: "Soon™ — we’re polishing the needle physics as we speak. Drop your email and you’ll be first through the door on both iOS and Android (before your nosiest friend).",
  },
  {
    q: "Is it free?",
    a: "There’ll be a free way to play and cause problems, plus some extra-spicy stuff for the truly committed. Waitlist crew gets early access and launch perks first.",
  },
  {
    q: "How do I actually play?",
    a: "Two people, one phone. It learns your calm ‘baseline’ from easy warm-up questions, then you ask the spicy ones and watch the meter swing. Screenshot the reveal, post it, run it back.",
  },
  {
    q: "What’s Poker Mode?",
    a: "It’s the head-to-head mode: two players sit across one phone, draw prompts from the poker deck, and try to lie with a straight face while the meter watches. You don’t need to know poker — there are no chips to count and no hands to memorise, it’s just the highest-stakes way to play. Scroll up to the Poker Mode section for the full rundown.",
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
