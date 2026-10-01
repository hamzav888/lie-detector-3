/** @type {import('next').NextConfig} */

// GitHub Pages serves project sites from a sub-path (https://user.github.io/repo/).
// The deploy workflow sets NEXT_PUBLIC_BASE_PATH from actions/configure-pages, so
// the same build works at the root of a custom domain and under a repo path.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  // Pages is static hosting — no server, no API routes, no image optimizer.
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // Directory-style URLs (/privacy/) so Pages serves index.html for each route.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
