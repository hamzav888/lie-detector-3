/**
 * Base-path helpers. Next.js prefixes its own <Link> and asset URLs with
 * `basePath`, but plain <a href>, <iframe src> and anything in metadata do
 * not get that treatment — route those through here.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const withBase = (path: string) =>
  `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * The live preview build of the app, served as static files from /public/app.
 * The explicit index.html matters: `next dev` doesn't resolve directory
 * indexes under /public, while the static export and GitHub Pages do. This
 * form works in all three. `?skin=pop` dresses the app in the site's look.
 */
export const APP_PATH = withBase("/app/index.html?skin=pop");
