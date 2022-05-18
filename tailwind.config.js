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
      },
      height: {
        '6/100': '6%',
        '9/10': '90%',
        '92/100': '92%',
        '94/100': '94%',
        '95/100': '95%',
        '99/100': '99%',
      },
      width: {
        '128': '55rem',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio'),],
}