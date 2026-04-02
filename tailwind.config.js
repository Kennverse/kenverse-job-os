/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{ts,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        bg: {
          primary: "#0a0c10",
          secondary: "#10141c",
          card: "#141820",
          hover: "#1c2230",
        },
        border: {
          DEFAULT: "#1e2535",
          light: "#252d3d",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#60a5fa",
          glow: "rgba(59,130,246,0.15)",
        },
        fit: {
          high: "#22c55e",
          medium: "#f59e0b",
          low: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};
