import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A0F1E",
          800: "#0D1426",
          700: "#111827",
          600: "#1A2332",
          500: "#243045",
        },
        green: {
          DEFAULT: "#00FF87",
          dark: "#00CC6A",
          muted: "#00FF8720",
        },
        gold: {
          DEFAULT: "#F5A623",
          dark: "#E09210",
          muted: "#F5A62320",
        },
        background: "#0A0F1E",
        foreground: "#F9FAFB",
        card: "#0D1426",
        border: "rgba(255,255,255,0.1)",
        muted: "#6B7280",
        "muted-foreground": "#9CA3AF",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Barlow Condensed", "sans-serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["6rem", { lineHeight: "1", letterSpacing: "0.02em" }],
        "display-lg": ["4.5rem", { lineHeight: "1", letterSpacing: "0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.1", letterSpacing: "0.02em" }],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.4)",
        glow: "0 0 20px rgba(0, 255, 135, 0.3)",
        "glow-gold": "0 0 20px rgba(245, 166, 35, 0.3)",
        card: "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0A0F1E 0%, #0D1426 50%, #111827 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "green-gradient": "linear-gradient(135deg, #00FF87 0%, #00CC6A 100%)",
        "gold-gradient": "linear-gradient(135deg, #F5A623 0%, #E09210 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        ticker: "ticker 30s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "count-up": "countUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 255, 135, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 255, 135, 0.6)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [animate],
};
export default config;
