/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'fading-red': 'linear-gradient(to top, #7f1d1d, #b71c1c)',
        'dark-red-gradient': 'linear-gradient(to right, #3e0a0a, #a21b1b)',
      },
    },
  },
  plugins: [],
}

