/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#7c3aed', 
          cyan: '#06b6d4',    
          glass: 'rgba(255, 255, 255, 0.05)',
        },
        dark: {
          bg: '#050505', // Even deeper black for contrast
          surface: '#0a0a0a', 
          border: 'rgba(255,255,255,0.08)',
        }
      },
      keyframes: {
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        }
      },
      animation: {
        'wave': 'wave 12s linear infinite',
        'blob': 'blob 10s infinite alternate',
      }
    },
  },
  plugins: [],
}