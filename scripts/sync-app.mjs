/* Re-copies the app's web build into public/app so the live preview on the
   site matches the app. Run after any change to ../app/www.
     npm run sync:app                                                       */
import { cpSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../../app/www");
const dst = resolve(here, "../public/app");

if (!existsSync(src)) {
  console.error(`Nothing at ${src} — expected the app's www folder next to this site.`);
  process.exit(1);
}
rmSync(dst, { recursive: true, force: true });
cpSync(src, dst, { recursive: true, filter: (p) => !p.endsWith(".map") });
console.log(`synced ${src} → ${dst}`);
