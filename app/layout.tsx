import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { withBase } from "@/lib/paths";

// Chunky, rounded display face for oversized headlines
const display = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Friendly rounded body face
const body = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-body",
  display: "swap",
});

const TITLE = `${SITE.name} — Can your face keep a secret?`;

// Next prefixes `basePath` onto file-convention metadata routes itself, so the
// base must be the bare origin; every path below adds the sub-path explicitly.
const ORIGIN = new URL(SITE.url).origin;
// A .png copy of the generated OG image (see `postbuild`) — GitHub Pages serves
// the extensionless original as octet-stream, which some scrapers reject.
const OG_IMAGE = { url: withBase("/og.png"), width: 1200, height: 630, alt: TITLE };

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  title: TITLE,
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: withBase("/") },
  keywords: [
    "lie detector app",
    "lie detector game",
    "poker face",
    "bluff game",
    "party game app",
    "truth or dare",
    "waitlist",
    "iOS",
    "Android",
  ],
  openGraph: {
    title: TITLE,
    description: SITE.description,
    url: withBase("/"),
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE.description,
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FF2D95",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="grain">{children}</body>
    </html>
  );
}
