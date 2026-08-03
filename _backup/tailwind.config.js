/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#e8f5e9', // very light green
          DEFAULT: '#2e7d32', // professional corporate green
          dark: '#1b5e20', // dark green
        },
        secondary: {
          DEFAULT: '#ffffff',
          dark: '#f3f4f6', // gray-100
        },
        accent: {
          DEFAULT: '#f59e0b', // amber, for call to actions
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
