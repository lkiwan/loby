/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: '#04040a',
          deep: '#06060f',
          panel: '#0b0b16',
        },
        blood: {
          DEFAULT: '#dc2626',
          bright: '#ef4444',
          dark: '#7f1d1d',
        },
        gold: {
          DEFAULT: '#eab308',
          dim: '#a16207',
        },
        heal: {
          DEFAULT: '#10b981',
        },
      },
      fontFamily: {
        grit: ['"Archivo Black"', 'Impact', 'sans-serif'],
        darija: ['"Cairo"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glowRed: '0 0 24px 4px rgba(220, 38, 38, 0.55)',
        glowGold: '0 0 24px 4px rgba(234, 179, 8, 0.4)',
        glowGreen: '0 0 24px 4px rgba(16, 185, 129, 0.45)',
        card: '0 8px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.9' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
      },
      animation: {
        flicker: 'flicker 3.2s ease-in-out infinite',
        pulseRing: 'pulseRing 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
}