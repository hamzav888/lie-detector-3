# Lie Detector App — landing site + live preview

The pre-launch site for the **Lie Detector App**, a camera-based party game, with a
**live preview of the real app running in the browser**. Built by **Matrixx Agency**.

> **It's a game, not a real lie detector.** The copy is loud and funny and always keeps an
> honest disclaimer nearby. The read runs on-device and is consent-based.

Fully static. Deploys to **GitHub Pages** from this folder with a single push.

---

## What's in here

| | |
|---|---|
| `app/` | Next.js App Router pages: home, `/play` (the app full screen), `/privacy`, 404, favicon, `/og.png`, `robots.txt`, `sitemap.xml` |
| `components/` | The page sections. All visuals are CSS/SVG — no image files, no emoji |
| `lib/site.ts` | Brand name, URL, notify-me signup config, the counter, the three stat chips |
| `lib/paths.ts` | `basePath` helpers for links that Next doesn't prefix for you |
| `public/app/` | **The app itself** — the real web build, served as static files at `/app/` |
| `scripts/sync-app.mjs` | Re-copies the app from `../app/www` after you change it |
| `scripts/serve.mjs` | Serves the built site exactly like Pages does, sub-path included |
| `.github/workflows/deploy.yml` | Builds and publishes on every push to `main` |

---

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository (the folder's contents at the repo root).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Push to `main`. The workflow builds and publishes. The URL appears in the Actions run.

That's it. The workflow reads the repo's Pages configuration and sets the sub-path
automatically, so the same workflow is correct for:

- a project site — `https://<user>.github.io/<repo>/`
- a user site — `https://<user>.github.io/` (repo named `<user>.github.io`)
- a custom domain

### Connect the "notify me" signup (do this before launch)

The site's one call to action is: leave your email, get one message when the app is on
the App Store. The site is static, so the form posts straight from the browser. Pick one:

**Formspree** (simplest): create a form at [formspree.io](https://formspree.io), copy its
id, then in the repo go to **Settings → Secrets and variables → Actions → Variables**
and add `NEXT_PUBLIC_FORMSPREE_ID`.

**Any endpoint**: add `NEXT_PUBLIC_WAITLIST_ENDPOINT` instead — a URL that accepts a JSON
`POST` of `{ email, source }` and answers 2xx (Netlify Forms, a Cloudflare Worker, Zapier…).

Until one of these is set, the form tells people sign-ups aren't switched on yet instead
of pretending to work. (The variables keep their original `WAITLIST` names so existing
configuration keeps working.)

Optional: `NEXT_PUBLIC_WAITLIST_BASE_COUNT` to change the hype number.

---

## Run it locally

```bash
npm install
npm run dev
```

Opens on <http://localhost:3000>. The live preview inside the phone needs a camera and a
secure origin — `localhost` counts.

Check the production build the way Pages will serve it, sub-path and all:

```bash
NEXT_PUBLIC_BASE_PATH=/your-repo-name npm run build
NEXT_PUBLIC_BASE_PATH=/your-repo-name npm run preview
```

Other scripts: `npm run lint`, `npm run typecheck`.

---

## The live preview

`public/app/` is a straight copy of the app's web build (`../app/www`). It is plain
static files with no build step, so Next ships it untouched and it works at any
sub-path. It includes the bundled MediaPipe runtime and face model (~23 MB on disk;
~13 MB over the wire on first launch, cached forever after).

It appears in two places, and both are the real, fully playable app:

- **On the home page** (`#preview`), inside a phone frame. It mounts the moment the
  section scrolls into view, so there's nothing to tap first. Visitors who never
  scroll that far never download the runtime.
- **Full screen at `/play/`**, filling the viewport inside a slim site bar, with the
  app's desktop layout on wide screens.

Both embed it in an `<iframe allow="camera">`, so the camera permission prompt
comes from the app itself. Same-origin, so no extra headers are needed.

Both load it as `/app/index.html?skin=pop`. That flag dresses the app in this site's
look — the pop palette, Baloo 2 and Nunito, ink outlines, sticker shadows and the
Truth-o-meter face — so the preview reads as the same product as the page around it.
Without the flag the app shows its native dark skin.

After changing the app:

```bash
npm run sync:app
```

---

## Keeping the copy honest

Three things the page says that are load-bearing for review and for trust:

1. **It reads six signals** — blink rate, gaze, brow, mouth, head and body — against a
   baseline learned from you. That is exactly what the app measures. Don't add "heart
   rate", "breathing" or anything it doesn't do.
2. **It is entertainment**, an edge rather than evidence. Every section keeps the
   disclaimer close.
3. **Poker Mode is coming soon, and it isn't in the preview.** The site describes it as
   online poker night with your friends — everyone on camera, everyone opted in — and
   always says it's on the way. Never imply it can be tried today, and never pitch it for
   real-money tables.

The stat chips under the counter are true statements about how the game works, not
invented traffic figures. Keep them that way.

---

## Swap-in list

1. **Brand name** — `SITE.name` in [`lib/site.ts`](lib/site.ts). The wordmark, metadata,
   footer, privacy page and OG image all read from it. The logo mark is the SVG in
   [`components/Wordmark.tsx`](components/Wordmark.tsx) and [`app/icon.svg`](app/icon.svg).
2. **Notify-me signup** — see above.
3. **Social links** — real URLs in `SITE.socials`.
4. **Privacy contact** — the privacy page says to "ask us"; add an address once you have one.

---

## Accessibility and quality

- Semantic HTML, labelled controls, `aria-live` form status, keyboard-navigable FAQ,
  "skip to signup" link, strong focus rings.
- `prefers-reduced-motion` honoured globally — looping and decorative motion stops.
- No external images, logos or emoji-as-characters. Every visual is CSS/SVG.
- Static export: no server, no API routes, no cookies, no analytics.

Built with care by Matrixx Agency. It's entertainment — enjoy responsibly.
