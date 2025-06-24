/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "light-gray": "#F8F8F8",
        "soft-blue-gray": "#E8F1F3",
        "primary-blue": "#0379AF",
        "dark-navy": "#00151F",
      },
      fontFamily: {
        inter: ["Inter"],
      },
    },
  },
  plugins: [],
};
