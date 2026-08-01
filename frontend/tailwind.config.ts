import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        foreground: "var(--color-text)",
      },
      fontFamily: {
        sans: ["var(--font-family)"],
      },
      borderRadius: {
        theme: "var(--border-radius)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
