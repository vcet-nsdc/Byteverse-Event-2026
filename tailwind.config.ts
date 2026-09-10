import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { 
          DEFAULT: "#7F45DB", 
          dark: "#4A2293",
          light: "#A472F7",
          foreground: "#FFFFFF" 
        },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        "border-grey": "#8A8A8A",
        "text-grey": "#6E6E6E",
        "light-grey": "#EAEAEA",
        "bv-gold": "#7F45DB",
        "bv-deep": "#F8F9FD",
        "bv-tide": "#F0F2F8",
        "bv-ocean": "#FFFFFF",
        "bv-teal": "#4A2293",
        "bv-coral": "#EF4444",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["'Manrope'", "system-ui", "sans-serif"],
        dosis: ["'Dosis'", "sans-serif"],
        display: ["'Syne'", "'Dosis'", "sans-serif"],
        technor: ["'Technor'", "'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
