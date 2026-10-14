/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#071326',
          gold: '#d4a338',
          surface: '#101e33',
        },
      },
    },
  },
  plugins: [],
};
