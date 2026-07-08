/** Small, dependency-free helpers shared across components. */

export const clamp = (n: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, n));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Linear-interpolate between two hex colors. t in [0,1]. */
export function lerpColor(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(lerp(pa[0], pb[0], t));
  const g = Math.round(lerp(pa[1], pb[1], t));
  const bl = Math.round(lerp(pa[2], pb[2], t));
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

export type Verdict = {
  word: string;
  /** tailwind text color token name */
  tone: "lime" | "sun" | "magenta" | "danger";
};

/** Loud, on-brand verdict for a given reading. Pure entertainment. */
export function verdictFor(v: number): Verdict {
  if (v < 18) return { word: "TOO HONEST", tone: "lime" };
  if (v < 38) return { word: "SMOOTH", tone: "lime" };
  if (v < 58) return { word: "HMMMM…", tone: "sun" };
  if (v < 74) return { word: "KINDA SUS", tone: "sun" };
  if (v < 90) return { word: "BUSTED", tone: "magenta" };
  return { word: "CAUGHT!!", tone: "danger" };
}

/** Big number with thousands separators. */
export const formatCount = (n: number) => n.toLocaleString("en-US");
