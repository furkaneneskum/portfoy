/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        luxury: {
          gold: "#C9A227",
          "gold-light": "#E8D48B",
          navy: "#0B1220",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 40px rgba(201, 162, 39, 0.15)",
      },
    },
  },
  plugins: [],
};
