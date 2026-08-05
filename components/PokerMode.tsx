"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import PlayingCard from "./PlayingCard";
import PokerChip from "./PokerChip";
import SuitIcon from "./Suit";

const HAND = [
  {
    n: "1",
    title: "Ante up",
    body: "Both players agree, then answer a few easy warm-ups so the app learns your calm baseline.",
  },
  {
    n: "2",
    title: "Deal the question",
    body: "Draw a card from the deck. The prompt on it is the question you have to answer with a straight face.",
  },
  {
    n: "3",
    title: "Read the tells",
    body: "Blinks, breathing, micro-expressions. The needle climbs while your opponent tries to hold the line.",
  },
  {
    n: "4",
    title: "Showdown",
    body: "Flip the reading. Bluff called or ice cold? Loser deals the next hand.",
  },
];

/**
 * The poker slice of the site: one loud, felt-green section that owns the
 * high-stakes theme, so the rest of the page can stay party-bright.
 */
export default function PokerMode() {
  const reduce = useReducedMotion();

  return (
    <section
      id="poker"
      className="relative overflow-hidden bg-felt px-4 py-16 sm:px-6 sm:py-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-felt-weave" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-suits opacity-60" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="text-center">
          <span className="eyebrow bg-sun">MODE SPOTLIGHT</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="text-outline block">POKER MODE</span>
            <span className="mt-1 block text-sun text-outline">HEADS-UP, NO MERCY</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg font-bold text-cream/90">
            Same app, higher stakes. Two players sit across one phone, draw prompts
            from the deck, and try to lie straight to each other&apos;s face while
            the meter watches. No chips to count, no rules to learn — just
            whoever&apos;s got the better poker face.
          </p>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          {/* ── the table ── */}
          <Reveal>
            <div className="relative mx-auto max-w-sm">
              {/* chips at the table edge */}
              <div aria-hidden className="pointer-events-none absolute -left-1 -top-6 z-10 flex items-center sm:-left-6">
                <PokerChip
                  suit="heart"
                  color="#FF2D95"
                  className={`h-16 w-16 -rotate-6 ${reduce ? "" : "animate-chip-bob"}`}
                />
                <PokerChip
                  suit="spade"
                  color="#B6FF2E"
                  edge="#1A1030"
                  className="-ml-6 h-14 w-14 rotate-6"
                />
              </div>
              <div aria-hidden className="pointer-events-none absolute -right-1 bottom-2 z-10 sm:-right-5">
                <PokerChip
                  suit="diamond"
                  color="#FFD200"
                  edge="#1A1030"
                  className={`h-14 w-14 ${reduce ? "" : "animate-chip-bob"}`}
                />
              </div>

              <div className="card-pop bg-cream p-6 sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="chip bg-danger text-white">LIVE READ</span>
                  <span className="font-display text-xs font-extrabold uppercase tracking-widest text-ink/45">
                    Table 07 · Heads-up
                  </span>
                </div>

                {/* the dealt hand */}
                <div className="flex items-end justify-center gap-2 sm:gap-3">
                  <div className={reduce ? "" : "animate-floaty-slow"}>
                    <PlayingCard rank="A" suit="spade" static className="w-20 -rotate-[12deg] sm:w-24" />
                  </div>
                  <div className={reduce ? "-mb-2" : "animate-floaty -mb-2"}>
                    <PlayingCard rank="Q" suit="heart" static className="w-20 sm:w-24" />
                  </div>
                  <div className={reduce ? "" : "animate-floaty-slow"}>
                    <PlayingCard rank="K" suit="club" static className="w-20 rotate-[12deg] sm:w-24" />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border-[3px] border-ink bg-felt bg-felt-weave p-4 text-center">
                  <p className="font-display text-lg font-extrabold leading-tight text-cream">
                    “Have you ever folded a winning hand just to look cool?”
                  </p>
                  <p className="mt-2 font-display text-xs font-extrabold uppercase tracking-widest text-cream/60">
                    Sample prompt · Poker deck
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── how a hand plays ── */}
          <div className="space-y-3">
            {HAND.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.07}>
                <motion.article
                  whileHover={reduce ? undefined : { x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="card-pop flex items-start gap-4 bg-cream p-5"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-[3px] border-ink bg-sun font-display text-2xl font-extrabold shadow-pop-sm">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-extrabold leading-tight">
                      {step.title}
                    </h3>
                    <p className="mt-1 font-semibold text-ink/70">{step.body}</p>
                  </div>
                </motion.article>
              </Reveal>
            ))}

            <Reveal delay={0.3}>
              <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center">
                <a href="#join" className="btn-pop bg-lime text-ink">
                  GET A SEAT AT THE TABLE
                </a>
                <span className="flex items-center gap-2" aria-hidden="true">
                  <SuitIcon suit="spade" color="#FFF8EE" className="h-4 w-4" />
                  <SuitIcon suit="heart" color="#FF2D95" className="h-4 w-4" />
                  <SuitIcon suit="club" color="#FFF8EE" className="h-4 w-4" />
                  <SuitIcon suit="diamond" color="#FF2D95" className="h-4 w-4" />
                </span>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-2xl text-center font-semibold text-cream/70">
            Still a party game, still just for laughs — Poker Mode only changes the
            vibe, not the disclaimer.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
