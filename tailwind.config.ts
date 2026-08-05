import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // POP / PARTY palette — bright, color-blocked
        ink: "#1A1030", // near-black text with a purple warmth
        cream: "#FFF8EE", // warm off-white
        magenta: {
          DEFAULT: "#FF2D95",
          soft: "#FF7AC0",
          deep: "#D6006E",
        },
        lime: {
          DEFAULT: "#B6FF2E",
          soft: "#D6FF7A",
          deep: "#7ED000",
        },
        sun: {
          DEFAULT: "#FFD200",
          soft: "#FFE566",
          deep: "#E6A700",
        },
        sky: {
          DEFAULT: "#2E7BFF",
          soft: "#7FB0FF",
          deep: "#0B4FD1",
        },
        grape: {
          DEFAULT: "#8A3FFC",
          soft: "#B98BFF",
          deep: "#5A17C9",
        },
        danger: {
          DEFAULT: "#FF3B30",
          deep: "#D01E14",
        },
        // Poker felt — the one "table" color in an otherwise candy palette
        felt: {
          DEFAULT: "#0E7A57",
          soft: "#17A473",
          deep: "#08533A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        blob: "2rem",
        pill: "999px",
      },
      boxShadow: {
        // chunky "sticker" drop shadows with thick offset
        pop: "0 6px 0 0 rgba(26,16,48,1)",
        "pop-lg": "0 10px 0 0 rgba(26,16,48,1)",
        "pop-sm": "0 4px 0 0 rgba(26,16,48,1)",
        soft: "0 12px 40px -12px rgba(26,16,48,0.35)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        // poker: chips + cards drifting on the table
        "floaty-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(2deg)" },
        },
        "chip-bob": {
          "0%, 100%": { transform: "translateY(0) rotate(-6deg)" },
          "50%": { transform: "translateY(-8px) rotate(4deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.6s ease-in-out infinite",
        floaty: "floaty 4s ease-in-out infinite",
        "floaty-slow": "floaty-slow 6s ease-in-out infinite",
        "chip-bob": "chip-bob 5s ease-in-out infinite",
        marquee: "marquee 22s linear infinite",
        "pulse-ring": "pulse-ring 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
