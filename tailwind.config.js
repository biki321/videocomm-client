// tailwind.config.js
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      aspectRatio: {
        '4/3': '4 / 3',
      },
      flex: {
        '3': '3 1 0%',
        '4': '4 1 0%',
        '10': '10 1 0%',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio'),],
}