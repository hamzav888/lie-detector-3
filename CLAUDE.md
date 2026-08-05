# CLAUDE.md — Lie Detector App (waitlist landing)

Project context for anyone (human or AI) working on this repo.

## What this is
A **pre-launch, single-page waitlist landing site** for the **Lie Detector App**, a
playful mobile **entertainment** app launching soon on iOS & Android. Built by
**Matrixx Agency**. The site's only job: **build hype and capture email signups**.

> Wordmark reads `Lie Detector App`. Swap `SITE.name` for a real brand later — see README "Swap-in list".

## The product (for accurate copy)
A social party game. Using the phone camera it reads stress-y signals — eyes/blinks,
breathing, micro-expressions — learns your calm **baseline** from easy questions, then
shows a live truth/deception **percentage** on a dramatic meter for the real questions.
Two people, one phone, a tense needle, a big reveal. Readings land on a scale; only
obvious facts hit 100%. (No heartbeat/pulse/smartwatch claims — do not reintroduce them.)

**Poker Mode** is one mode among several (alongside Party Mode, the leaderboard, etc.):
two players heads-up across one phone, prompts drawn from a poker deck, whoever keeps the
straightest face wins. No chips to count, no poker knowledge required.

## Tone rules (important)
- It is **ENTERTAINMENT first**. Frame it as an *edge, not evidence*: a better read than
  going in blind, but **never** claim it truly/scientifically detects lies, and never
  imply it should be used to make real decisions about a person.
- Be funny, loud, shameless ("it only has to be right about half the time").
- Always keep a **subtle honest disclaimer** nearby.
- **Privacy-friendly**: on-device, consent-based — say so.
- No emoji used as characters/IP. All faces/characters/suits are **drawn in CSS/SVG**.

## Two voices on one page (important)
The page deliberately runs in **two themes**, and they should stay separated:
1. **Party / general (the default)** — bright POP palette, party-game copy ("ask the
   spicy questions", "screenshot the chaos"). This owns Hero, HowItWorks, the modes grid,
   the demo, IsItReal, SocialProof, FAQ, FinalCTA, Footer.
2. **Poker (one loud slice)** — the felt-green `#poker` section plus the poker card in the
   modes grid, the suit marquees that bracket it, and the Poker Mode FAQ entry. Poker
   hooks live here: "read the tells", "call the bluff", "ante up", "showdown".

Don't bleed poker language into the general sections (or vice versa) — the contrast is
the point. Poker is a *mode*, not the brand. No real casino/brand IP.

## Goal / conversion
Every section drives to **ONE action**: join the waitlist / early access.
Email capture is the hero element and reappears in the final CTA (`#join`).
Lean into the social hook: deal friends in, "best poker face," screenshot-and-share.

## Stack
- **Next.js 14 (App Router) + TypeScript**
- **Tailwind CSS** (tokens in `tailwind.config.ts`)
- **Framer Motion** (springs, confetti, stamp, reveals; respects reduced-motion)
- Deploy target: **Vercel**. Mobile-first, fully responsive.
- Waitlist form → `app/api/waitlist/route.ts` (provider switch w/ TODOs).

## Design tokens ("POP / PARTY")
Defined in `tailwind.config.ts` + `app/globals.css`.
- **Colors**: `magenta` #FF2D95 · `lime` #B6FF2E · `sun` #FFD200 · `sky` #2E7BFF ·
  `grape` #8A3FFC · `danger` #FF3B30 · `ink` #1A1030 · `cream` #FFF8EE ·
  `felt` #0E7A57 (the one "poker table" green — use it for felt surfaces only).
- **Type**: `font-display` = Baloo 2 (chunky rounded), `font-body` = Nunito.
- **Shape**: `rounded-blob` / `rounded-pill`, thick `border-[3px] border-ink`.
- **Shadows**: `shadow-pop*` (hard offset "sticker" shadows).
- **Helpers**: `.btn-pop`, `.card-pop`, `.chip`, `.eyebrow`, `.text-outline`, `.grain`,
  `.bg-dots`, `.bg-felt-weave` (cross-hatch felt), `.bg-suits` (tiled suit marks).
- **Motion**: bouncy springs; `animate-marquee/floaty/floaty-slow/chip-bob/wiggle`;
  `prefers-reduced-motion` honored globally.

## Sections (order in `app/page.tsx`)
Nav → Hero (+ meter) → Marquee (party words) → HowItWorks → WhyFun (modes grid, incl. the
Poker Mode card) → Marquee (poker words, suits) → **PokerMode** → Marquee (poker words,
suits) → InteractiveTeaser → IsItReal → SocialProof → FAQ → FinalCTA → Footer.

`<Marquee icon="suits">` swaps star separators for card suits — poker stretch only.

## Signature visual
`components/Meter.tsx` — the "Truth-o-meter": a semicircular gauge with a **springy
needle** and a **CSS/SVG face** that morphs from calm → sweating panic as the reading
climbs. Everything animates off one spring so needle + face + number stay in sync.

## Poker primitives (use only inside the poker slice)
- `components/PokerMode.tsx` — the `#poker` section itself: felt table, dealt hand, chips,
  and the four-step hand (Ante up → Deal → Read the tells → Showdown).
- `components/Suit.tsx` — the four suits as SVG paths (`SuitIcon`, `SuitPath`,
  `SUIT_COLOR`). Red suits are magenta, black suits are ink. Never use ♠♥♦♣ text glyphs.
- `components/PlayingCard.tsx` — SVG card in the sticker style (thick ink outline, hard
  shadow); flips in 3D when `showFace` toggles, `static` for decorative cards.
- `components/PokerChip.tsx` — SVG chip with dashed edge spots; takes a `suit` or `label`.
Reuse these instead of drawing new card/chip art.

## Conventions
- Keep it accessible: semantic HTML, labelled controls, visible focus rings, `aria-live`
  on form status, keyboard-navigable FAQ/accordions, reduced-motion fallbacks.
- No external images/logos. Build visuals with CSS/SVG.
- Copy is fun placeholder — tweak freely, keep the disclaimer honest.
