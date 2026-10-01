"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import { APP_PATH, withBase } from "@/lib/paths";

const FACTS = [
  { k: "Fully playable", v: "every screen works — this is the app" },
  { k: "On-device", v: "the camera feed never leaves your browser" },
  { k: "No sign-up", v: "nothing to install, nothing to create" },
];

/**
 * The real app, live on the page. It mounts the moment the section scrolls
 * into view — no cover, no tap — so what you see is what you can play.
 * Readers who never scroll this far don't download the ~13 MB runtime.
 */
export default function LivePreview() {
  const reduce = useReducedMotion();
  const phoneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(phoneRef, { once: true, margin: "200px 0px" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  return (
    <section id="preview" className="relative overflow-hidden bg-ink px-4 py-16 text-white sm:px-6 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots opacity-[0.12]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full bg-grape/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-magenta/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        {/* ── copy ── */}
        <div className="text-center lg:text-left">
          <Reveal>
            <span className="eyebrow bg-lime text-ink">THIS IS THE ACTUAL APP</span>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-outline block text-white">NOT A VIDEO.</span>
              <span className="mt-1 block text-sun text-outline">NOT A MOCK-UP.</span>
              <span className="mt-1 block text-lime text-outline">GO ON, PLAY IT.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg font-bold text-white/85 lg:mx-0">
              The real build, running right here in your browser. Allow the camera, give it
              twenty calm seconds to learn your face, then ask yourself something you&apos;d
              rather not answer. Then watch six signals tell on you.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="mx-auto mt-7 flex max-w-lg flex-col gap-2 text-left lg:mx-0">
              {FACTS.map((f) => (
                <li key={f.k} className="flex items-center gap-3">
                  <span className="chip shrink-0 bg-sun text-ink">{f.k}</span>
                  <span className="font-semibold text-white/80">{f.v}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <a href={withBase("/play/")} className="btn-pop bg-magenta text-xl text-white">
                PLAY IT FULL SCREEN
              </a>
              <a href={APP_PATH} target="_blank" rel="noopener" className="btn-pop bg-white text-ink">
                OPEN IN A NEW TAB ↗
              </a>
            </div>
            <p className="mx-auto mt-4 max-w-md text-sm font-semibold text-white/60 lg:mx-0">
              Needs a camera and decent light. The first launch downloads the face model once
              (about 13 MB), then it runs offline.
            </p>
          </Reveal>
        </div>

        {/* ── the phone, with the app inside ── */}
        <Reveal delay={0.1} className="flex justify-center">
          <motion.div
            ref={phoneRef}
            className="relative w-[min(400px,92vw)]"
            animate={reduce || mounted ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="chip absolute -left-4 top-12 z-20 -rotate-[8deg] bg-lime text-ink">LIVE</span>
            <span className="chip absolute -right-4 bottom-28 z-20 rotate-[7deg] bg-magenta text-white">CAMERA ON</span>

            <div
              className="relative aspect-[9/19] overflow-hidden rounded-[2.8rem] border-[6px] border-ink bg-black"
              style={{ boxShadow: "0 14px 0 0 #1A1030, 0 30px 60px -20px rgba(0,0,0,.7)" }}
            >
              <span aria-hidden className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-pill bg-ink" />

              {mounted ? (
                <iframe
                  src={APP_PATH}
                  title="Lie Detector App — live, playable preview"
                  allow="camera"
                  className="absolute inset-0 h-full w-full border-0 bg-black"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#06070b] text-center">
                  <Dots />
                  <span className="text-sm font-semibold text-white/50">Loading the app…</span>
                </div>
              )}
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

function Dots() {
  return (
    <span className="flex gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-lime animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
