/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.08)",
        glow: "0 4px 20px -2px rgba(99, 102, 241, 0.25)",
        "glow-emerald": "0 4px 20px -2px rgba(16, 185, 129, 0.25)",
      },
    },
  },
  plugins: [],
};
