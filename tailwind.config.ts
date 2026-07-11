import type { Config } from "tailwindcss";

// Design direction: "Fieldnotes" — the app looks like an annotated study notebook,
// not a generic SaaS dashboard. Ink-navy for structure, warm paper for surfaces,
// an amber "highlighter" accent for the one thing that matters on each screen,
// and a quiet correction-pen teal for positive/completed states.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B2A4A",
          light: "#2C3E63",
          soft: "#54648C"
        },
        paper: {
          DEFAULT: "#FAF7F0",
          dim: "#F0EBDD"
        },
        amber: {
          DEFAULT: "#C98A2B",
          light: "#E0A94F",
          dark: "#9C6A1E"
        },
        pen: {
          teal: "#2E7D6B",
          rose: "#B8495B"
        }
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"]
      },
      borderRadius: {
        card: "0.75rem"
      }
    }
  },
  plugins: []
};

export default config;
