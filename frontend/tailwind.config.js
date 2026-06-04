/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#30363d'
        },
        accent: {
          500: '#10b981',
          600: '#059669'
        }
      }
    },
  },
  plugins: [],
}
