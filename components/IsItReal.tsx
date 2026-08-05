"use client";

import Reveal from "./Reveal";
import SuitIcon from "./Suit";

const COLUMNS = [
  {
    tag: "A REAL EDGE",
    bg: "bg-lime",
    body: "It reads actual stress and nervousness cues, live, measured against your own calm baseline. Way more telling than a plain guess — at a party or across a poker table.",
  },
  {
    tag: "NOT A POLYGRAPH",
    bg: "bg-sun",
    body: "Don’t take it to court, don’t bet the house, don’t end friendships over it. The only 100% is on stuff nobody could deny anyway.",
  },
];

export default function IsItReal() {
  return (
    <section id="real" className="relative bg-cream px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="eyebrow bg-grape text-white">THE HONEST PART</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl lg:text-6xl">
            So… is it actually real?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-semibold text-ink/70">
            Straight answer: it’s built for entertainment — a party game, not a courtroom.
            But it isn’t smoke and mirrors either. It reads genuine signs of stress and
            nerves, the same tells a sharp friend learns to spot. So you go in with a much
            better read than you’d get flying blind.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <figure className="card-pop mx-auto mt-10 max-w-2xl bg-white p-7 sm:p-9">
            <div className="mb-4 flex justify-center gap-2" aria-hidden="true">
              <SuitIcon suit="spade" className="h-5 w-5" />
              <SuitIcon suit="heart" className="h-5 w-5" />
              <SuitIcon suit="club" className="h-5 w-5" />
              <SuitIcon suit="diamond" className="h-5 w-5" />
            </div>
            <blockquote className="font-display text-2xl font-extrabold leading-tight text-ink sm:text-4xl">
              “It only has to be right about half the time.”
            </blockquote>
            <figcaption className="mt-4 font-semibold text-ink/60">
              You just have to be a little sharper than the person sitting across from you.
            </figcaption>
          </figure>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {COLUMNS.map((c, i) => (
            <Reveal key={c.tag} delay={0.15 + i * 0.08}>
              <div className={`card-pop h-full p-6 text-left ${c.bg}`}>
                <span className="chip bg-white">{c.tag}</span>
                <p className="mt-3 font-semibold text-ink/75">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl font-semibold text-ink/55">
            And it stays between you — everything runs on-device, and everyone playing taps
            to agree before a single question is asked.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
