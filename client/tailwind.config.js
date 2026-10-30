/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#010B13',
        cyan: {
          DEFAULT: '#00E5FF',
          dark: '#010B13'
        },
        accent: {
          DEFAULT: '#00E5FF',
          ink: '#010B13'
        },
        powder: '#EBF1F5',
        ink: '#0A111C',
        steel: '#111111',
        well: '#111111',
        surface: '#07151F',
        line: 'rgba(235, 241, 245, 0.15)',
      },
      fontFamily: {
        display: ['"Archivo"', 'sans-serif'],
        sans: ['"Manrope"', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.045em',
        tightest: '-0.06em',
      },
      lineHeight: {
        slab: '0.88',
      }
    },
  },
  plugins: [],
}
