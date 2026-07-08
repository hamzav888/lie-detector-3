/**
 * Central site configuration + copy tokens.
 * Tweak these to re-skin the page without hunting through components.
 */
export const SITE = {
  name: "TRUTHERAAA",
  tagline: "The lie detector party app",
  // ↑ Placeholder wordmark. Swap `name` for your real brand.
  url: "https://truther.example.com",
  builtBy: "Matrixx Agency",
  description:
    "TRUTHERAAA is the outrageously fun lie-detector party game launching soon on iOS & Android. Point your phone, ask the spicy questions, watch the needle FREAK OUT. Join the waitlist for early access.",
  // Public-facing waitlist counter starting point (hype flavor only).
  waitlistBaseCount: Number(
    process.env.NEXT_PUBLIC_WAITLIST_BASE_COUNT ?? 18427,
  ),
  socials: [
    { label: "TikTok", href: "#", handle: "@trutheraaa" },
    { label: "Instagram", href: "#", handle: "@trutheraaa" },
    { label: "X", href: "#", handle: "@trutheraaa" },
    { label: "YouTube", href: "#", handle: "@trutheraaa" },
  ],
} as const;

export type Social = (typeof SITE.socials)[number];
