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
        background: "#0B0F19",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(99, 102, 241, 0.35)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.35)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
