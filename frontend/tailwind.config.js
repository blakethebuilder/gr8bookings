/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gr8: {
          red: '#E53935',
          gold: '#FFB900',
          dark: '#0d0d0d',
          card: '#1e1e1e',
        },
      },
    },
  },
  plugins: [],
}
