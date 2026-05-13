/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fdfaf5',
          100: '#faf3e7',
          200: '#f3e7d0',
        },
        peach: {
          100: '#fbe4d4',
          300: '#f5b894',
          500: '#e89b6e',
          600: '#d68257',
        },
        rose: {
          100: '#f5dcd9',
          300: '#e8b3ae',
          500: '#d18b85',
        },
        sage: {
          100: '#dde6d6',
          300: '#aabe9d',
          500: '#7e9b6e',
        },
      },
      boxShadow: {
        soft: '0 2px 12px rgba(120, 90, 60, 0.06), 0 1px 3px rgba(120, 90, 60, 0.04)',
        card: '0 4px 20px rgba(120, 90, 60, 0.08)',
      },
    },
  },
  plugins: [],
}
