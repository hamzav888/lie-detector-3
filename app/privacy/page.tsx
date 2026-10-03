import type { Metadata } from "next";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { SITE } from "@/lib/site";
import { APP_PATH, withBase } from "@/lib/paths";

export const metadata: Metadata = {
  title: `Privacy — ${SITE.name}`,
  description: `How ${SITE.name} handles your camera, your face and your email. Short version: the read never leaves your device.`,
  alternates: { canonical: withBase("/privacy/") },
};

const UPDATED = "1 October 2026";

export default function PrivacyPage() {
  return (
    <>
      <header className="px-4 pt-4 sm:px-6">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-3xl items-center justify-between rounded-pill border-[3px] border-ink bg-white px-4 py-2.5 shadow-pop-sm sm:px-5"
        >
          <Link href="/" aria-label={`${SITE.name} home`}>
            <Wordmark />
          </Link>
          <Link href="/#join" className="btn-pop bg-lime text-ink">
            NOTIFY ME
          </Link>
        </nav>
      </header>

      <main className="px-4 py-12 sm:px-6 sm:py-16">
        <article className="mx-auto max-w-3xl">
          <span className="eyebrow bg-grape text-white">THE PRIVACY PAGE</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl lg:text-6xl">
            Your face stays on your phone.
          </h1>
          <p className="mt-3 font-semibold text-ink/55">Last updated {UPDATED}</p>

          <div className="card-pop mt-8 bg-lime p-6 sm:p-7">
            <p className="font-display text-xl font-extrabold leading-tight sm:text-2xl">
              The short version
            </p>
            <p className="mt-2 font-semibold text-ink/80">
              The lie-detector read runs entirely on your device. No video frame, no face
              landmark and no score is ever uploaded — there is no account and no server
              behind it. The only thing we ever collect is the email you choose to leave so
              we can tell you when the app is on the App Store.
            </p>
          </div>

          <Section title="The live preview and the app">
            <p>
              Both need the front camera to measure facial signals. Frames are analysed in
              memory one at a time and discarded immediately. Nothing is recorded, saved or
              transmitted, and the camera is only active while the preview or app is open
              and on screen.
            </p>
            <p>
              The face model and all of its code are bundled with the preview and with the
              app. The first time you launch, your browser downloads that bundle once (about
              13 MB) and caches it; after that it makes no network requests while you play.
            </p>
            <p>
              Settings and any readings you choose to save are stored locally — in your
              browser&apos;s storage for the preview, in the app&apos;s private storage on your
              phone. We have no access to them. Delete them any time from Settings, by
              clearing site data, or by deleting the app.
            </p>
          </Section>

          <Section title="Launch notifications">
            <p>
              If you ask to be notified, we keep your email address so we can tell you when the
              app is on the App Store. That email goes to the form service we use to hold the
              list; it is not shared with anyone else and is not used for anything else.
              Every email we send includes a way to unsubscribe, and you can ask us to delete
              your address at any time.
            </p>
          </Section>

          <Section title="This website">
            <p>
              This site is static and is served from GitHub Pages. We do not run analytics,
              advertising or tracking scripts, and we set no cookies. GitHub may keep standard
              server logs (such as IP addresses) as part of hosting the site; their{" "}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                className="font-bold underline underline-offset-2"
              >
                privacy statement
              </a>{" "}
              covers that.
            </p>
          </Section>

          <Section title="What this is not">
            <p>
              {SITE.name} measures visible signs of stress — blink rate, gaze, brow and mouth
              tension, head and body movement — relative to a baseline it learns from you. It
              is an entertainment product. It is not a lie detector in any legal, medical or
              scientific sense, and nothing it shows is evidence about any person. Stress is
              not deception. Please don&apos;t use it to make decisions about anyone.
            </p>
          </Section>

          <Section title="Children">
            <p>
              The app and this site are not directed at children under 13 and collect no
              personal information from anyone beyond the notification email described above.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              If this page changes, the updated version will be published here and the date at
              the top will move.
            </p>
          </Section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/" className="btn-pop bg-white text-ink">
              ← BACK TO THE SITE
            </Link>
            <a href={APP_PATH} className="btn-pop bg-magenta text-white">
              OPEN THE PREVIEW
            </a>
          </div>
        </article>
      </main>

      <footer className="px-4 pb-10 text-center text-sm font-semibold text-ink/50 sm:px-6">
        © {new Date().getFullYear()} {SITE.name}. A pre-launch teaser by {SITE.builtBy}.
      </footer>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h2>
      <div className="mt-3 space-y-3 font-semibold text-ink/75">{children}</div>
    </section>
  );
}
