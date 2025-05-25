/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'gaegu': ['"Gaegu"', 'cursive', 'sans-serif'],
      },
      colors: {
        'emotion-red': '#FDA4AF',  // 연한 빨간색
        'emotion-gray': '#D1D5DB', // 회색
      },
      boxShadow: {
        'hand-drawn': '2px 2px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}