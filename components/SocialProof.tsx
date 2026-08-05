"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { SITE } from "@/lib/site";
import { formatCount } from "@/lib/utils";
import Reveal from "./Reveal";
import PokerChip from "./PokerChip";
import Zigzag from "./Zigzag";

export default function SocialProof() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(reduce ? SITE.waitlistBaseCount : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, SITE.waitlistBaseCount, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setCount(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, reduce]);

  return (
    <section
      id="hype"
      className="relative overflow-hidden bg-ink px-4 py-16 text-white sm:px-6 sm:py-24"
    >
      <Zigzag fill="#FFF8EE" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots opacity-[0.12]" />
      <div ref={ref} className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <span className="eyebrow bg-lime text-ink">THE LINE IS LONG</span>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-6">
            <div aria-hidden className="mb-5 flex items-end justify-center gap-2 sm:gap-3">
              <PokerChip suit="spade" color="#B6FF2E" edge="#1A1030" className="h-12 w-12 -rotate-12 sm:h-14 sm:w-14" />
              <PokerChip suit="heart" color="#FF2D95" className="h-14 w-14 sm:h-16 sm:w-16" />
              <PokerChip suit="diamond" color="#FFD200" edge="#1A1030" className="h-12 w-12 rotate-12 sm:h-14 sm:w-14" />
            </div>
            <div className="font-display text-6xl font-extrabold leading-none tracking-tight text-lime sm:text-8xl">
              {formatCount(count)}
            </div>
            <p className="mt-3 text-xl font-extrabold sm:text-2xl">
              humans already in line to expose their friends
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <StatChip k="+2,140" v="joined this week" />
            <StatChip k="47" v="countries waiting" />
            <StatChip k="½" v="of them will lose" />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10">
            <p className="mb-3 font-display text-sm font-extrabold uppercase tracking-widest text-white/60">
              Launching soon on
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <StoreBadge platform="iOS" sub="App Store" icon={<PhoneIcon />} />
              <StoreBadge platform="Android" sub="Google Play" icon={<PlayIcon />} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <a href="#join" className="btn-pop mt-10 bg-magenta text-white">
            GRAB MY SPOT
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function StatChip({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border-[3px] border-white/25 bg-white/5 px-5 py-3">
      <div className="font-display text-2xl font-extrabold text-sun">{k}</div>
      <div className="text-sm font-bold text-white/70">{v}</div>
    </div>
  );
}

function StoreBadge({
  platform,
  sub,
  icon,
}: {
  platform: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border-[3px] border-white bg-white/10 px-5 py-3 text-left">
      <span className="text-white">{icon}</span>
      <span className="leading-tight">
        <span className="block text-xs font-bold uppercase tracking-wide text-white/60">
          Coming soon · {sub}
        </span>
        <span className="block font-display text-xl font-extrabold text-white">
          {platform}
        </span>
      </span>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <line x1="10" y1="18.5" x2="14" y2="18.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path d="M5 3 L19 12 L5 21 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}
