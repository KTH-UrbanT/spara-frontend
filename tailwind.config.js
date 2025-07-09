/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  theme: {
    extend: {},
  },
  darkMode: "class", // Enable dark mode based on class
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    // Custom variant for [data-theme=night]
    plugin(function({ addVariant }) {
      addVariant('night', '&:where([data-theme=night], [data-theme=night] *)');
      addVariant('light', '&:where([data-theme=light], [data-theme=light] *)');
      addVariant('dark', '&:where([data-theme=dark], [data-theme=dark] *)');
      addVariant('winter', '&:where([data-theme=winter], [data-theme=winter] *)');
    }),
  ],
  daisyui: {
    themes: ["light", "dark", "winter", "night"],
  },
};