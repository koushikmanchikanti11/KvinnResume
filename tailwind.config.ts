import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kr: {
          bg: "#050607",
          deep: "#020303",
          surface: "#0b0d10",
          "surface-2": "#11141a",
          "surface-3": "#171b22",
          border: "#2a303a",
          "border-soft": "rgba(255,255,255,0.08)",
          "border-glow": "rgba(126, 231, 135, 0.35)",
          text: "#f4f7f5",
          muted: "#9aa3a0",
          dim: "#68716e",
          green: "#7ee787",
          amber: "#ffd166",
          blue: "#72ddf7",
          violet: "#b892ff",
          red: "#ff5c7a",
          orange: "#ff8f3d",
          "btn-light": "#e8efe8",
          "btn-dark": "#101312",
        },
        // Dashboard design-spec tokens (kvinn-dashboard-design-spec.md §1.2)
        kv: {
          canvas: "#040506",
          "surface-1": "#07080a",
          "surface-2": "#101010",
          "surface-3": "#111214",
          "surface-4": "#1b1c1e",
          "border-soft": "rgba(255,255,255,0.06)",
          "border-mid": "rgba(255,255,255,0.10)",
          "border-strong": "#333333",
          "text-primary": "#f3f3f3",
          "text-white": "#ffffff",
          "text-secondary": "#9c9c9d",
          "text-muted": "#6a6b6c",
          "text-disabled": "#454647",
          "accent-amber": "#e7c59a",
          "accent-green": "#00ac5c",
          "accent-red": "#ff6363",
          "accent-blue": "#56c2ff",
          "accent-violet": "#8d6bff",
          "cta-bg": "#e6e6e6",
          "cta-text": "#2f3031",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        ui: ["Inter", "system-ui", "sans-serif"],
        pixel: ["Pixelify Sans", "monospace"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
        jetbrains: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        pixel:
          "inset 1px 1px 0 rgba(255,255,255,.08), inset -1px -1px 0 rgba(0,0,0,.8), 0 0 0 1px rgba(0,0,0,.8)",
        key: "0 3px 0 rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.12)",
        "key-active":
          "0 1px 0 rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.08)",
        glow: "0 0 40px rgba(126,231,135,.08)",
        "glow-card":
          "0 0 0 1px rgba(0,0,0,0.9), 0 18px 60px rgba(0,0,0,0.45), 0 0 40px rgba(126,231,135,0.05)",
      },
      borderRadius: {
        xs: "4px",
        pixel: "0px",
      },
      spacing: {
        "kr-1": "4px",
        "kr-2": "8px",
        "kr-3": "12px",
        "kr-4": "16px",
        "kr-5": "24px",
        "kr-6": "32px",
        "kr-7": "48px",
        "kr-8": "64px",
        "kr-9": "96px",
      },
      maxWidth: {
        kr: "1200px",
      },
      transitionTimingFunction: {
        "ease-pixel": "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      transitionDuration: {
        fast: "160ms",
        normal: "240ms",
        slow: "420ms",
      },
      keyframes: {
        "blink-cursor": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "typewriter": {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "blink-cursor": "blink-cursor 1s step-end infinite",
        typewriter: "typewriter 2s steps(40) forwards",
        "count-up": "count-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
