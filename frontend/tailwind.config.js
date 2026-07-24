/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gr8: {
          red: 'rgb(var(--gr8-red) / <alpha-value>)',
          gold: '#FFB900',
          dark: '#0d0d0d',
          card: '#1e1e1e',
        },
      },
    },
  },
  plugins: [],
}
