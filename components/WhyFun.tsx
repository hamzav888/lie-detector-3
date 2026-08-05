"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import SuitIcon from "./Suit";

type Feature = {
  title: string;
  body: string;
  bg: string;
  text: string;
  span: string;
  icon: React.ReactNode;
  badge?: string;
  /** optional jump link to a section that expands on this mode */
  href?: string;
  linkLabel?: string;
};

const FEATURES: Feature[] = [
  {
    title: "Party Mode",
    body: "Pass the phone around the circle. Everyone answers, everyone gets exposed.",
    bg: "bg-magenta",
    text: "text-white",
    span: "",
    icon: <IconParty />,
  },
  {
    title: "Poker Mode",
    body: "You’re already playing poker — this just tells you whether the player across the table is lying about that hand.",
    bg: "bg-felt",
    text: "text-white",
    span: "sm:col-span-2",
    icon: <IconSuits />,
    href: "#poker",
    linkLabel: "Take a look",
  },
  {
    title: "Bragging Rights",
    body: "Somebody in your crew lies better than the rest. Now you’ll know who.",
    bg: "bg-sun",
    text: "text-ink",
    span: "",
    icon: <IconCrown />,
  },
  {
    title: "Two Players, One Phone",
    body: "No setup, no accounts, no explaining the rules. Just point it and go.",
    bg: "bg-sky",
    text: "text-white",
    span: "",
    icon: <IconSwords />,
  },
  {
    title: "Made to be Screenshotted",
    body: "Big meter, big number, big group chat energy.",
    bg: "bg-lime",
    text: "text-ink",
    span: "",
    icon: <IconShareBig />,
  },
  {
    title: "Your Face. Your Phone. Your Data.",
    body: "The read happens on-device, with your consent. We’re here for the laughs, not your secrets.",
    bg: "bg-grape",
    text: "text-white",
    span: "sm:col-span-2",
    icon: <IconShield />,
  },
  {
    title: "Never Runs Dry",
    body: "There’s always another question, and it’s always the one nobody wanted asked.",
    bg: "bg-white",
    text: "text-ink",
    span: "",
    icon: <IconCards />,
  },
];

export default function WhyFun() {
  return (
    <section id="why" className="relative bg-magenta/10 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10 text-center sm:mb-14">
          <span className="eyebrow bg-magenta text-white">PICK YOUR MODE</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl lg:text-6xl">
            Built to blow up your group chat
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-ink/70">
            A few ways to play, one guaranteed outcome: somebody gets caught.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className={f.span}>
              <FeatureCard f={f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f }: { f: Feature }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -6, rotate: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={`card-pop flex h-full flex-col p-6 ${f.bg} ${f.text}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-ink bg-white/90">
          {f.icon}
        </span>
        {f.badge && (
          <span className="chip bg-ink text-white">{f.badge}</span>
        )}
      </div>
      <h3 className="font-display text-2xl font-extrabold leading-tight">
        {f.title}
      </h3>
      <p className={`mt-2 font-semibold ${f.text === "text-white" ? "text-white/85" : "text-ink/70"}`}>
        {f.body}
      </p>
      {f.href && (
        <a
          href={f.href}
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-pill border-[3px] border-ink bg-sun px-4 py-1.5 font-display text-sm font-extrabold text-ink shadow-pop-sm transition-transform hover:-translate-y-[2px]"
        >
          {f.linkLabel ?? "Learn more"} →
        </a>
      )}
    </motion.article>
  );
}

/* ── drawn icons ── */
function IconSuits() {
  return (
    <span className="grid grid-cols-2 gap-0.5">
      <SuitIcon suit="spade" className="h-3.5 w-3.5" />
      <SuitIcon suit="heart" className="h-3.5 w-3.5" />
      <SuitIcon suit="club" className="h-3.5 w-3.5" />
      <SuitIcon suit="diamond" className="h-3.5 w-3.5" />
    </span>
  );
}
function IconParty() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M6 26 L14 12 L20 24 Z" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="22" cy="8" r="2" fill="#FF2D95" />
      <circle cx="27" cy="14" r="2" fill="#2E7BFF" />
      <circle cx="24" cy="20" r="1.6" fill="#B6FF2E" />
    </svg>
  );
}
function IconCrown() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M5 22 L5 12 L11 17 L16 9 L21 17 L27 12 L27 22 Z" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="16" cy="7" r="1.8" fill="#FFD200" stroke="#1A1030" strokeWidth="1.5" />
    </svg>
  );
}
function IconSwords() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M6 6 L20 20 M6 6 L6 10 L10 10" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 6 L12 20 M26 6 L26 10 L22 10" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconShareBig() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <rect x="7" y="4" width="18" height="24" rx="3" fill="none" stroke="#1A1030" strokeWidth="2.6" />
      <path d="M16 20 L16 10 M12 14 L16 10 L20 14" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M16 4 L26 8 V16 C26 22 21 26 16 28 C11 26 6 22 6 16 V8 Z" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M11 16 l3 3 6 -7" fill="none" stroke="#1A1030" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCards() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <rect x="12" y="6" width="13" height="18" rx="3" transform="rotate(10 18 15)" fill="none" stroke="#1A1030" strokeWidth="2.4" />
      <rect x="6" y="9" width="13" height="18" rx="3" transform="rotate(-8 12 18)" fill="#fff" stroke="#1A1030" strokeWidth="2.6" />
      <path d="M12 18 l1.5 -3 1.5 3 -1.5 3 Z" fill="#FF2D95" />
    </svg>
  );
}
