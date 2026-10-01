/* Serves the static export in ./out exactly as GitHub Pages would, including
   the sub-path, so you can check basePath handling before pushing.
     npm run build && npm run preview                                       */
import { createServer } from "node:http";
import { createReadStream, statSync, existsSync } from "node:fs";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "out");
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json",
  ".wasm": "application/wasm", ".task": "application/octet-stream", ".png": "image/png",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain",
  ".woff2": "font/woff2", ".woff": "font/woff",
};

if (!existsSync(OUT)) { console.error("No ./out folder — run `npm run build` first."); process.exit(1); }

createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (BASE && !p.startsWith(BASE + "/") && p !== BASE) { res.writeHead(404).end(`not under ${BASE}/`); return; }
  if (BASE) p = p.slice(BASE.length) || "/";
  let file = join(OUT, normalize(p).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(OUT)) { res.writeHead(403).end(); return; }
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
  } catch {
    if (existsSync(file + ".html")) file = file + ".html";
    else { file = join(OUT, "404.html"); if (!existsSync(file)) { res.writeHead(404).end("not found"); return; } }
  }
  res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream", "Permissions-Policy": "camera=(self)" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`site → http://localhost:${PORT}${BASE}/`));
