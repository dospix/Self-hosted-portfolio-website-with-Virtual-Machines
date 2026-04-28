/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "Montserrat": ["Montserrat", "ui-sans-serif"],
        "Open_Sans": ["Open_Sans", "ui-sans-serif"]
      }
    },
  },
  plugins: [],
}

