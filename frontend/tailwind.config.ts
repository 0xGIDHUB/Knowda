import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // extend: {
    //   colors: {
    //     background: "var(--background)",
    //     foreground: "var(--foreground)",
    //   },
    // },
    extend: {
    keyframes: {
      'radar-pulse': {
        '0%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.7)' },
        '70%': { boxShadow: '0 0 0 10px rgba(34,197,94,0)' },
        '100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0)' },
      },
    },
    animation: {
      'radar': 'radar-pulse 1.2s infinite',
    },
  },
  },
  plugins: [],
} satisfies Config;
