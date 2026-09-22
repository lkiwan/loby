/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        glowpulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.97)' },
        },
      },
      animation: {
        pop: 'pop 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        float: 'float 3.5s ease-in-out infinite',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        glowpulse: 'glowpulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}