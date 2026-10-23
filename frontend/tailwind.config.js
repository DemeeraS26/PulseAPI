/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
  bg: "rgb(var(--color-bg) / <alpha-value>)",
  surface: "rgb(var(--color-surface) / <alpha-value>)",
  "surface-alt": "rgb(var(--color-surface-alt) / <alpha-value>)",
  "surface-hover": "rgb(var(--color-surface-hover) / <alpha-value>)",
  border: "rgb(var(--color-border) / <alpha-value>)",
  "border-light": "rgb(var(--color-border-light) / <alpha-value>)",
  "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
  "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
  "text-tertiary": "rgb(var(--color-text-tertiary) / <alpha-value>)",
  accent: "rgb(var(--color-accent) / <alpha-value>)",
  "accent-dim": "rgb(var(--color-accent-dim) / <alpha-value>)",
  cyan: "rgb(var(--color-cyan) / <alpha-value>)",
  success: "rgb(var(--color-success) / <alpha-value>)",
  warning: "rgb(var(--color-warning) / <alpha-value>)",
  error: "rgb(var(--color-error) / <alpha-value>)",
  info: "rgb(var(--color-info) / <alpha-value>)",
},
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245, 166, 35, 0.15), 0 0 24px rgba(245, 166, 35, 0.08)",
      },
    },
  },
  plugins: [],
};
