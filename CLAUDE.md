# CLAUDE.md — Lie Detector App (waitlist landing)

Project context for anyone (human or AI) working on this repo.

## What this is
A **pre-launch, single-page waitlist landing site** for the **Lie Detector App**, a
playful mobile **entertainment** app launching soon on iOS & Android. Built by
**Matrixx Agency**. The site's only job: **build hype and capture email signups**.

> Wordmark is a placeholder (`TRUTHERAAA`). Swap it — see README "Swap-in list".

## The product (for accurate copy)
A social party game. Using the phone camera it reads stress-y signals — eyes/blinks,
breathing, micro-expressions — learns your calm **baseline** from easy questions, then
shows a live truth/deception **percentage** on a dramatic meter for the real questions.
Two people, one phone, a tense needle, a big reveal. Readings land on a scale; only
obvious facts hit 100%. (No heartbeat/pulse/smartwatch claims — do not reintroduce them.)

## Tone rules (important)
- It is **ENTERTAINMENT first**. Frame it as an *edge, not evidence*: a better read than
  going in blind, but **never** claim it truly/scientifically detects lies, and never
  imply it should be used to make real decisions about a person.
- Be funny, loud, shameless ("it only has to be right about half the time").
- Always keep a **subtle honest disclaimer** nearby.
- **Privacy-friendly**: on-device, consent-based — say so.
- No emoji used as characters/IP. All faces/characters are **drawn in CSS/SVG**.

## Goal / conversion
Every section drives to **ONE action**: join the waitlist / early access.
Email capture is the hero element and reappears in the final CTA (`#join`).
Lean into the social hook: challenge friends, "best liar," screenshot-and-share.

## Stack
- **Next.js 14 (App Router) + TypeScript**
- **Tailwind CSS** (tokens in `tailwind.config.ts`)
- **Framer Motion** (springs, confetti, stamp, reveals; respects reduced-motion)
- Deploy target: **Vercel**. Mobile-first, fully responsive.
- Waitlist form → `app/api/waitlist/route.ts` (provider switch w/ TODOs).

## Design tokens ("POP / PARTY")
Defined in `tailwind.config.ts` + `app/globals.css`.
- **Colors**: `magenta` #FF2D95 · `lime` #B6FF2E · `sun` #FFD200 · `sky` #2E7BFF ·
  `grape` #8A3FFC · `danger` #FF3B30 · `ink` #1A1030 · `cream` #FFF8EE.
- **Type**: `font-display` = Baloo 2 (chunky rounded), `font-body` = Nunito.
- **Shape**: `rounded-blob` / `rounded-pill`, thick `border-[3px] border-ink`.
- **Shadows**: `shadow-pop*` (hard offset "sticker" shadows).
- **Helpers**: `.btn-pop`, `.card-pop`, `.chip`, `.eyebrow`, `.text-outline`, `.grain`, `.bg-dots`.
- **Motion**: bouncy springs; `animate-marquee/floaty/wiggle`; `prefers-reduced-motion` honored globally.

## Sections (order in `app/page.tsx`)
Nav → Hero (+ meter) → Marquee → HowItWorks → WhyFun → InteractiveTeaser →
Marquee → SocialProof → FAQ → FinalCTA → Footer.

## Signature visual
`components/Meter.tsx` — the "Truth-o-meter": a semicircular gauge with a **springy
needle** and a **CSS/SVG face** that morphs from calm → sweating panic as the reading
climbs. Everything animates off one spring so needle + face + number stay in sync.

## Conventions
- Keep it accessible: semantic HTML, labelled controls, visible focus rings, `aria-live`
  on form status, keyboard-navigable FAQ/accordions, reduced-motion fallbacks.
- No external images/logos. Build visuals with CSS/SVG.
- Copy is fun placeholder — tweak freely, keep the disclaimer honest.
