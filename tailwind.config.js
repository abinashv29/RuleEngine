/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        butterflyFlight: {
          '0%': {
            transform: 'translate(0, 0) rotate(0deg) scale(0.8)',
            opacity: '0'
          },
          '20%': {
            opacity: '1'
          },
          '80%': {
            opacity: '1'
          },
          '100%': {
            transform: 'translate(var(--tx), var(--ty)) rotate(var(--rotate)) scale(0.8)',
            opacity: '10'
          }
        },
        wingFlap: {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(0.8)' }
        }
      },
      animation: {
        'butterfly': 'butterflyFlight var(--duration) ease-in-out forwards',
        'wing-flap': 'wingFlap 0.3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}