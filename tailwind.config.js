/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'flow-primary': '#FF7EB6',
        'flow-secondary': '#2CD3E1',
        'flow-tertiary': '#B4B4FF',
        'flow-accent': '#FFB86C',
        'pearl-light': '#F8F9FA',
        'pearl-dark': '#1A1B1E',
        'liquid-light': '#FFFFFF',
        'liquid-dark': '#2C2D31'
      },
      backgroundImage: {
        'flow-light': 'linear-gradient(120deg, #FFE2E0 0%, #E8E6FF 25%, #E0FFE9 50%, #FFE0E5 75%, #E0F8FF 100%)',
        'flow-dark': 'linear-gradient(120deg, #2A2139 0%, #32294D 25%, #1F3341 50%, #3D2438 75%, #2B3948 100%)',
        'pearl-light': 'radial-gradient(circle at top right, #FFE2E0 0%, #E8E6FF 25%, #E0FFE9 50%, #FFE0E5 75%, #E0F8FF 100%)',
        'pearl-dark': 'radial-gradient(circle at top right, #2A2139 0%, #32294D 25%, #1F3341 50%, #3D2438 75%, #2B3948 100%)',
        'liquid-motion': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
      },
      animation: {
        'flow': 'flow 15s ease infinite',
        'pearl': 'pearl 8s ease infinite',
        'liquid': 'liquid 20s ease infinite'
      },
      keyframes: {
        flow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        pearl: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        liquid: {
          '0%, 100%': { borderRadius: '100% 40% 30% 70%/60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' }
        }
      },
      backdropBlur: {
        'pearl': '20px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ]
} 