import Wordmark from "./Wordmark";
import { SITE } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Wordmark onDark />
            <p className="mt-3 font-semibold text-white/70">
              The lie-detector party game that turns your face into a game show —
              Party Mode, Poker Mode, and a very nosy needle. Coming soon to iOS
              &amp; Android.
            </p>
            <a href="#join" className="btn-pop mt-5 bg-lime text-ink">
              JOIN THE WAITLIST
            </a>
          </div>

          <nav aria-label="Social" className="flex flex-col gap-3">
            <span className="font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
              Follow the chaos
            </span>
            <ul className="flex flex-wrap gap-2">
              {SITE.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="chip bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Entertainment + privacy disclaimer */}
        <div className="mt-10 rounded-2xl border-[3px] border-white/20 bg-white/5 p-5">
          <p className="text-sm font-bold text-white/80">
            ⚠︎ For entertainment only.
          </p>
          <p className="mt-1 text-sm font-semibold text-white/60">
            {SITE.name} is a game made for fun. It reads stress-y signals for a
            playful read, but it is <span className="font-bold text-white/80">not</span> a
            scientific lie detector and should never be used to make real
            decisions about any person. Readings are dramatized for entertainment.
            The camera-based read runs on your device with your consent — see our
            privacy policy at launch for details.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm font-semibold text-white/50 sm:flex-row">
          <p>
            © {year} {SITE.name}. A pre-launch teaser by {SITE.builtBy}.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
