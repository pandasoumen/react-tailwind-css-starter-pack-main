/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0A66C2",         // LinkedIn Blue
        secondary: "#f5f8fc",       // Off White
        darkText: "#1a1a1a",
      },
    },
  },
  plugins: [],
};
