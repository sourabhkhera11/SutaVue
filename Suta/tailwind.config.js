/** @type {import('tailwindcss').Config} */
export default {
  // 1. Tell Tailwind where your files are
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // 2. Add your custom prefix
  prefix: 'st-',
  plugins: [],
}