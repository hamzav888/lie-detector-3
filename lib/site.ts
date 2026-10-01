/**
 * Central site configuration and copy tokens.
 * Edit brand, links and the counter here — no component edits needed.
 */
export const SITE = {
  name: "Lie Detector App",
  tagline: "The lie-detector party game",
  // ↑ Placeholder brand. Swap `name` when the real one lands; the wordmark,
  //   metadata, footer and privacy page all read from here.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hamzav888.github.io/lie-detector-3").replace(/\/$/, ""),
  builtBy: "Matrixx Agency",
  description:
    "The lie-detector party game. Point your phone, ask the spicy questions and watch the needle freak out. Try the live preview in your browser, then join the waitlist for iOS and Android — with Poker Mode for online games with your friends on the way.",

  /** Public-facing waitlist counter starting point (hype flavour only). */
  waitlistBaseCount: Number(process.env.NEXT_PUBLIC_WAITLIST_BASE_COUNT ?? 18427),

  /**
   * The three small facts under the counter. These are true statements about
   * how the game works, not invented traffic numbers.
   */
  stats: [
    { k: "2", v: "players, one phone" },
    { k: "0", v: "accounts or sign-ups" },
    { k: "100%", v: "of the read stays on-device" },
  ],

  socials: [
    { label: "TikTok", href: "#", handle: "@liedetectorapp" },
    { label: "Instagram", href: "#", handle: "@liedetectorapp" },
    { label: "X", href: "#", handle: "@liedetectorapp" },
    { label: "YouTube", href: "#", handle: "@liedetectorapp" },
  ],

  /**
   * Waitlist delivery. The site is static, so the form posts straight from
   * the browser. Either a Formspree form id or any JSON-accepting endpoint.
   */
  waitlist: {
    formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "",
    endpoint: process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT ?? "",
  },
} as const;

export type Social = (typeof SITE.socials)[number];

/** Resolved URL the waitlist form posts to, or null if nothing is configured. */
export function waitlistEndpoint(): string | null {
  if (SITE.waitlist.endpoint) return SITE.waitlist.endpoint;
  if (SITE.waitlist.formspreeId) return `https://formspree.io/f/${SITE.waitlist.formspreeId}`;
  return null;
}
