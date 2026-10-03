# CLAUDE.md — Lie Detector App (landing site + live preview)

Project context for anyone, human or AI, working on this folder.

## What this is
The **pre-launch landing site** for the **Lie Detector App**, a camera-based party game,
plus a **live preview of the real app** embedded on the page. Built by **Matrixx Agency**.
Two jobs: let people try it, and collect emails from people who want to be told when it's
on the App Store.

> Wordmark reads `Lie Detector App`. Swap `SITE.name` when the real brand lands.

## The product (for accurate copy)
A social party game. The phone camera measures **six signals** — blink rate, gaze, brow
tension, mouth/jaw tension, head motion, body motion — against a **baseline** it learns
from the person in twenty calm seconds. Each signal is a robust deviation from *their own*
normal; the index only moves when several agree. Readings land on a 0–100 scale with a
verdict and a list of which signals moved. **No heart rate, pulse, breathing or smartwatch
claims — the app doesn't do those. Don't reintroduce them.**

**Poker Mode** is **coming soon** and means one thing in the marketing: online poker night
with your friends. Everyone's on camera, everyone opts in, and the app reads each player
while they bet — it makes a friendly game more fun. **It is not in the live preview**, so
the copy must always say it's coming, never imply you can try it now. Friendly games and
laughs only — never a strategy tool, never for real-money tables.

**Keep feature copy honest and specific where it describes the preview, vague where it
describes the unshipped native apps.** Describe the feeling of playing, not a feature list.

## Tone rules
- **Entertainment first.** An *edge, not evidence*. Never claim it scientifically detects
  lies; never imply it should drive real decisions about a person.
- Loud, funny, a little shameless. Always a subtle honest disclaimer nearby.
- **Privacy-friendly**: on-device, consent-based. Say so.
- No emoji used as characters. All faces, suits and icons are **CSS/SVG**.

## Two voices on one page
1. **Party / general (default)** — bright POP palette. Hero, HowItWorks, LivePreview,
   Signals, WhyFun, InteractiveTeaser, IsItReal, SocialProof, FAQ, FinalCTA, Footer.
2. **Poker (one slice)** — the felt-green `#poker` section, its card in the modes grid, the
   suit marquees that bracket it, and the Poker Mode FAQ entry.

Don't bleed poker language into general sections or vice versa. Poker is a mode, not the
brand. No real casino or brand IP.

## Conversion
Every section drives to **one action**: get notified when it's on the App Store (`#join`),
with the live preview (`#preview`) as the proof point on the way. The hero form reappears in
the final CTA. **Don't promise early access, perks or badges** — the signup is a single
"it's on the App Store" email, nothing more.

## Stack and hosting
- **Next.js 14 (App Router) + TypeScript**, **Tailwind**, **Framer Motion**.
- **Static export** (`output: "export"`) deployed to **GitHub Pages** by
  `.github/workflows/deploy.yml`. There is **no server**: no API routes, no server
  actions, nothing dynamic at request time. Anything that needs a backend must be a
  client-side call to a third party.
- **`basePath`** comes from `NEXT_PUBLIC_BASE_PATH` (set by the workflow). Next prefixes
  `<Link>` and its own assets. Plain `<a href>`, `<iframe src>` and anything in
  metadata must go through `withBase()` / `APP_PATH` in `lib/paths.ts`.
- The notify-me form posts from the browser to Formspree or `NEXT_PUBLIC_WAITLIST_ENDPOINT`
  (see `lib/site.ts`). With neither configured it shows an honest "not yet" message.
- `trailingSlash: true` so `/privacy/` resolves to a real `index.html` on Pages.

## The embedded app
`public/app/` is a verbatim copy of `../app/www` — plain ES modules with no build step,
relative URLs throughout, so it works at any sub-path. `npm run sync:app` refreshes it.
Don't edit it here; edit the app and re-sync. It is embedded twice, both times as the
real, fully playable app in an `<iframe allow="camera">`:
- `components/LivePreview.tsx` — in a phone frame on the home page. It mounts when the
  section scrolls into view (no cover, no tap), so the ~13 MB runtime never loads for
  people who don't scroll to it.
- `app/play/page.tsx` — full screen inside a slim site bar at `/play/`.
Links to the app go through `APP_PATH` (`/app/index.html?skin=pop`). The explicit file
matters because `next dev` doesn't resolve directory indexes under `/public`; `?skin=pop`
puts the app in this site's look (its own skin, `css/skin-pop.css` in the app). The app
build no longer contains Poker Night — it's parked in the app project's `extras/poker/` (not part of this repo).

## Design tokens ("POP / PARTY")
In `tailwind.config.ts` and `app/globals.css`.
- **Colours**: `magenta` #FF2D95 · `lime` #B6FF2E · `sun` #FFD200 · `sky` #2E7BFF ·
  `grape` #8A3FFC · `danger` #FF3B30 · `ink` #1A1030 · `cream` #FFF8EE ·
  `felt` #0E7A57 (poker surfaces only).
- **Type**: `font-display` Baloo 2, `font-sans` Nunito (self-hosted via `next/font`).
- **Shape**: `rounded-blob` / `rounded-pill`, thick `border-[3px] border-ink`.
- **Shadows**: `shadow-pop*` hard offset "sticker" shadows.
- **Helpers**: `.btn-pop`, `.card-pop`, `.chip`, `.eyebrow`, `.text-outline`, `.grain`,
  `.bg-dots`, `.bg-felt-weave`, `.bg-suits`.
- **Motion**: springs; looping animation only where it's decorative and always off under
  `prefers-reduced-motion`.

## Sections (order in `app/page.tsx`)
Nav → Hero (+ meter) → Marquee (party) → HowItWorks → **LivePreview** → **Signals** →
WhyFun (modes grid) → Marquee (poker, suits) → PokerMode → Marquee (poker, suits) →
InteractiveTeaser (the no-camera toy) → IsItReal → SocialProof → FAQ → FinalCTA → Footer.

## Signature visuals
- `components/Meter.tsx` — the Truth-o-meter: springy needle + a CSS/SVG face that panics
  as the reading climbs.
- `components/LivePreview.tsx` — the phone frame with the real app running inside.
- `app/play/page.tsx` — the same app, full screen.
- Poker primitives (`Suit`, `PlayingCard`, `PokerChip`) — reuse these, don't redraw.

## Conventions
- Accessible: semantic HTML, labelled controls, visible focus rings, `aria-live` status,
  keyboard-navigable accordions, reduced-motion fallbacks.
- No external images or logos. Visuals are CSS/SVG.
- Numbers on the page are either configurable hype (the counter) or true facts (the stat
  chips). Never add fabricated traffic or country counts.
