/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/index.tsx", "./app/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

