# 🎯 Lie Detector App — Pre-Launch Waitlist Site

A bold, high-energy **pre-launch landing page** for the **Lie Detector App** — a
playful mobile **entertainment** game launching soon on iOS & Android. The site's
whole job is to **build hype and capture email waitlist signups**. Built by
**Matrixx Agency**.

> **It's a game, not a real lie detector.** Copy leans loud and funny while keeping
> an honest disclaimer. The read is on-device and consent-based.

Design direction: **POP / PARTY** — bright, color-blocked, chunky rounded type,
bouncy spring motion, confetti, a "CAUGHT!!" stamp slam, and a signature expressive
**Truth-o-meter** with a springy needle + a CSS-drawn face that panics as it climbs.

---

## 🧱 Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (design tokens in `tailwind.config.ts`)
- **Framer Motion** (springs, confetti, reveals — all respect `prefers-reduced-motion`)
- Deploy on **Vercel**. Mobile-first, fully responsive, zero external image/logo deps
  (every visual is CSS/SVG).

---

## 🚀 Run it locally

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

The waitlist form works out-of-the-box: with no provider configured it uses the
`console` provider and logs each signup to your terminal. Wire a real provider when
you're ready (below).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

---

## 📬 Waitlist form + email provider

- Form: `components/WaitlistForm.tsx` (client-side validation, loading / success /
  error states, honeypot, share button). Appears in the **Hero** and the **Final CTA**.
- API route: `app/api/waitlist/route.ts` — validates the email server-side and hands
  it to your chosen provider.

Pick a provider by setting `WAITLIST_PROVIDER` in `.env.local`. Copy the example first:

```bash
cp .env.local.example .env.local
```

Supported values and the keys each one needs (each has a clear `TODO` in the route):

| `WAITLIST_PROVIDER` | Env vars to set |
| --- | --- |
| `console` (default) | none — logs signups to the server console |
| `resend`     | `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` |
| `convertkit` | `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID` |
| `mailchimp`  | `MAILCHIMP_API_KEY`, `MAILCHIMP_DC`, `MAILCHIMP_AUDIENCE_ID` |
| `formspree`  | `FORMSPREE_FORM_ID` |

> The integration functions are already written — you just add keys. If a required
> key is missing, the API returns a friendly error and logs the reason.

---

## ▲ Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com/new), **Import** the repo. Framework auto-detects as
   **Next.js** — no config needed.
3. Add your environment variables (Project → **Settings → Environment Variables**):
   `WAITLIST_PROVIDER` and the keys for your provider, plus optional
   `NEXT_PUBLIC_WAITLIST_BASE_COUNT`.
4. **Deploy.** Add your custom domain under **Settings → Domains**.

Or from the CLI:

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

---

## 📁 Structure

```
app/
  layout.tsx            # fonts (Baloo 2 + Nunito), metadata, <html>/<body>
  page.tsx              # assembles all sections in order
  globals.css           # tokens, component classes, grain, reduced-motion
  api/waitlist/route.ts # POST endpoint + provider switch (TODOs)
components/
  Nav, Hero, Meter, WaitlistForm, HowItWorks, WhyFun,
  InteractiveTeaser, SocialProof, FAQ, FinalCTA, Footer,
  Confetti, Stamp, Marquee, Reveal, Wordmark
lib/
  site.ts               # brand name, socials, counter base, copy tokens
  utils.ts              # clamp/lerp/color + verdict helpers
```

---

## ✅ Accessibility & quality

- Semantic HTML, labelled form controls, `aria-live` status, keyboard-navigable
  accordions, "skip to signup" link, strong focus rings.
- Respects `prefers-reduced-motion` (looping/decorative animation is disabled).
- No copyrighted images, logos, or emoji-as-characters — all visuals are CSS/SVG.

---

## 🔧 Swap-in list (do these before launch)

1. **Wordmark / brand name** — edit `SITE.name` (and `tagline`, `url`, `socials`) in
   [`lib/site.ts`](lib/site.ts). To change the little logo mark, edit the SVG in
   [`components/Wordmark.tsx`](components/Wordmark.tsx). Currently `Lie Detector App`.
2. **Email provider key** — set `WAITLIST_PROVIDER` + the matching keys in `.env.local`
   (see [`.env.local.example`](.env.local.example)). Same vars go in Vercel.
3. **Domain** — set `SITE.url` in [`lib/site.ts`](lib/site.ts) (used for metadata/OG),
   then add the domain in Vercel → Settings → Domains.
4. *(optional)* **Waitlist counter** — set `NEXT_PUBLIC_WAITLIST_BASE_COUNT` in
   `.env.local` to change the hype number in the social-proof section.
5. *(optional)* **Social links** — real URLs in `SITE.socials` (`lib/site.ts`).

---

Built with 💥 by Matrixx Agency. It's entertainment — enjoy responsibly.
