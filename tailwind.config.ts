import type { Config } from "tailwindcss";

const config: Config = {
  DarkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tcb: {
          red:       "#E01E2B",
          "red-dark":"#B01520",
          black:     "#0A0A0A",
          "gray-900":"#111111",
          "gray-800":"#1A1A1A",
          "gray-700":"#2A2A2A",
          "gray-600":"#3A3A3A",
          "gray-400":"#888888",
          "gray-200":"#CCCCCC",
          white:     "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "hero-pattern": "radial-gradient(ellipse at top, #1a0000 0%, #0A0A0A 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
