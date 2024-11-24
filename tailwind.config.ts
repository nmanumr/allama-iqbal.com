import type { Config } from "tailwindcss";
import containerQueries from '@tailwindcss/container-queries';
import tailwindForms from '@tailwindcss/forms';

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nastaliq: ['"Mehr_Nastaliq_Web"'],
      }
    },
  },
  plugins: [
    containerQueries,
    tailwindForms,
  ],
} satisfies Config;
