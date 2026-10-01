import type { Metadata } from "next";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { SITE } from "@/lib/site";
import { APP_PATH, withBase } from "@/lib/paths";

export const metadata: Metadata = {
  title: `Play the preview — ${SITE.name}`,
  description: `The ${SITE.name} preview, full screen. Allow the camera, calibrate, ask away. Runs entirely in your browser.`,
  alternates: { canonical: withBase("/play/") },
};

/**
 * The whole app, filling the viewport, inside a slim site bar. The app is a
 * plain static build served from /public/app, so this is the real thing.
 */
export default function PlayPage() {
  return (
    <div className="flex h-dvh flex-col bg-ink">
      <header className="shrink-0 px-3 pt-3 sm:px-4">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-pill border-[3px] border-ink bg-white px-3 py-2 shadow-pop-sm sm:px-4"
        >
          <Link href="/" className="flex items-center gap-2 rounded-lg" aria-label="Back to the site">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="#1A1030" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2">
            <span className="chip hidden bg-lime sm:inline-flex">
              <span className="grid h-3 w-3 place-items-center rounded-full bg-danger" />
              LIVE PREVIEW
            </span>
            <a href={APP_PATH} target="_blank" rel="noopener" className="hidden rounded-pill px-3 py-2 font-display text-sm font-extrabold text-ink/70 hover:text-ink md:inline-block">
              New tab ↗
            </a>
            <Link href="/#join" className="btn-pop bg-magenta text-white">
              JOIN THE WAITLIST
            </Link>
          </div>
        </nav>
      </header>

      <main className="min-h-0 flex-1 p-3 sm:p-4">
        <div
          className="mx-auto h-full max-w-6xl overflow-hidden rounded-blob border-[3px] border-ink bg-black"
          style={{ boxShadow: "0 10px 0 0 #1A1030" }}
        >
          <iframe
            src={APP_PATH}
            title="Lie Detector App — live, playable preview"
            allow="camera"
            className="h-full w-full border-0 bg-black"
          />
        </div>
      </main>

      <p className="shrink-0 px-4 pb-3 text-center text-xs font-semibold text-white/50">
        For entertainment. Measures visible stress, not truth — runs on your device, nothing is uploaded.
      </p>
    </div>
  );
}
