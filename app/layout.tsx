import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.name} — Can your face keep a secret?`,
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "lie detector app",
    "poker face",
    "bluff game",
    "truth or dare",
    "party game app",
    "waitlist",
    "iOS",
    "Android",
    "social game",
  ],
  openGraph: {
    title: `${SITE.name} — Can your face keep a secret?`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Can your face keep a secret?`,
    description: SITE.description,
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
