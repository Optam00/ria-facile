/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ria-blue': '#1a365d',
        'ria-light': '#ffffff',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-delayed': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '50%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'correct-answer': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' }
        },
        'wrong-answer': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-delayed': 'fade-in-delayed 1s ease-out',
        'correct-answer': 'correct-answer 0.5s ease-in-out',
        'wrong-answer': 'wrong-answer 0.5s ease-in-out'
      }
    },
  },
  plugins: [],
}

