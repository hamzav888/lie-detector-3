"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import PlayingCard from "./PlayingCard";
import PokerChip from "./PokerChip";
import SuitIcon from "./Suit";
import Zigzag from "./Zigzag";

const STEPS = [
  {
    n: "1",
    title: "Prop up the phone",
    body: "Sit it at the edge of the table where it can see the player you’re up against.",
  },
  {
    n: "2",
    title: "Play your game",
    body: "Nothing changes. Deal, bet, talk trash — it just watches from the rail.",
  },
  {
    n: "3",
    title: "Glance before you call",
    body: "They shove all in with a straight face. The meter has an opinion about that.",
  },
];

/**
 * The poker slice of the site: one loud, felt-green section. Poker Mode is
 * simply the app pointed at a real poker game — is the player across the table
 * bluffing? — not a separate question game.
 */
export default function PokerMode() {
  const reduce = useReducedMotion();

  return (
    <section
      id="poker"
      className="relative overflow-hidden bg-felt px-4 py-16 sm:px-6 sm:py-24"
    >
      <Zigzag fill="#1A1030" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-felt-weave" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-suits opacity-60" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="text-center">
          <span className="eyebrow bg-sun">ONE OF THE MODES</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="text-outline block">POKER MODE</span>
            <span className="mt-1 block text-sun text-outline">IS THAT A BLUFF?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg font-bold text-cream/90">
            For when you&apos;re playing actual poker. Point the phone at the player
            across the table and it reads them while they bet — so when someone
            pushes all in wearing their best nothing-face, you&apos;ve got a hunch
            instead of a coin flip.
          </p>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          {/* ── the read ── */}
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
              <div aria-hidden className="pointer-events-none absolute -right-1 bottom-4 z-10 sm:-right-5">
                <PokerChip
                  suit="diamond"
                  color="#FFD200"
                  edge="#1A1030"
                  className={`h-14 w-14 ${reduce ? "" : "animate-chip-bob"}`}
                />
              </div>

              <div className="card-pop bg-cream p-6 sm:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <span className="chip bg-danger text-white">LIVE READ</span>
                  <span className="font-display text-xs font-extrabold uppercase tracking-widest text-ink/45">
                    Seat 3 · All in
                  </span>
                </div>

                {/* their hand, still face down */}
                <div className="flex items-end justify-center gap-3">
                  <div className={reduce ? "" : "animate-floaty-slow"}>
                    <PlayingCard suit="spade" showFace={false} static className="w-24 -rotate-[10deg] sm:w-28" />
                  </div>
                  <div className={reduce ? "" : "animate-floaty"}>
                    <PlayingCard suit="heart" showFace={false} static className="w-24 rotate-[10deg] sm:w-28" />
                  </div>
                </div>

                {/* the verdict strip */}
                <div className="mt-6 rounded-2xl border-[3px] border-ink bg-white p-4">
                  <p className="font-display text-xs font-extrabold uppercase tracking-widest text-ink/45">
                    Reading them right now
                  </p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-display text-4xl font-extrabold leading-none text-danger">
                      87%
                    </span>
                    <span className="chip bg-danger text-white">BLUFFING</span>
                  </div>
                  <div className="relative mt-3 h-4 rounded-pill border-[3px] border-ink bg-gradient-to-r from-lime via-sun to-danger">
                    <span
                      className="absolute -top-1.5 h-6 w-1.5 rounded-pill border-[3px] border-ink bg-ink"
                      style={{ left: "84%" }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── how you use it ── */}
          <div className="space-y-3">
            {STEPS.map((step, i) => (
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
            Still a party game, still just for laughs — bring it to poker night, don&apos;t
            bring it to a casino floor.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
