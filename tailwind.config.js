/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeInQuote 3s ease-in 1s forwards',
      },
      keyframes: {
        fadeInQuote: {
          '0%': { opacity: '0' },
          '100%': { opacity: '0.5' },
        },
      },
      translate: {
        '-1/2': '-50%',
      },
      colors: {
        arcticWhite: '#E9EAE7 ',
        pink: '#FF10F0'
      }
    },
  },
  plugins: [],
}


