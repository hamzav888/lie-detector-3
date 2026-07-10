/**
 * Central site configuration + copy tokens.
 * Tweak these to re-skin the page without hunting through components.
 * (Edit brand, socials, and the waitlist counter here.)
 */
export const SITE = {
  name: "Lie Detector App",
  tagline: "The lie detector party app",
  // ↑ Swap `name` for your real brand whenever you have one.
  url: "https://liedetectorapp.example.com",
  builtBy: "Matrixx Agency",
  description:
    "Lie Detector App is the outrageously fun lie-detector party game launching soon on iOS & Android. Point your phone, ask the spicy questions, watch the needle FREAK OUT. Join the waitlist for early access.",
  // Public-facing waitlist counter starting point (hype flavor only).
  waitlistBaseCount: Number(
    process.env.NEXT_PUBLIC_WAITLIST_BASE_COUNT ?? 18427,
  ),
  socials: [
    { label: "TikTok", href: "#", handle: "@liedetectorapp" },
    { label: "Instagram", href: "#", handle: "@liedetectorapp" },
    { label: "X", href: "#", handle: "@liedetectorapp" },
    { label: "YouTube", href: "#", handle: "@liedetectorapp" },
  ],
} as const;

export type Social = (typeof SITE.socials)[number];
