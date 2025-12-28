import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Alcova Landolina Brand Identity
        brand: {
          ivory: '#FDFCF0',      // Base background
          brass: '#C5A059',      // Accents and details (gold-ish)
          'brass-dark': '#A6864A', // Deeper brass for text
          midnight: '#0F172A',   // Primary text
          'midnight-light': '#1E293B', // Secondary text
          sand: '#F7F3E1',       // Secondary background/surface
          'sand-dark': '#ECE6CA', // Tertiary background for depth
        },
        // Modern monochrome palette
        mono: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        glass: {
          border: 'rgba(197, 160, 89, 0.15)', // More defined brass-tinted border
          surface: 'rgba(253, 252, 240, 0.85)', // More opaque ivory surface for readability
          highlight: 'rgba(255, 255, 255, 0.95)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(15, 23, 42, 0.05)',
        'glass-hover': '0 12px 48px rgba(15, 23, 42, 0.12)',
        'brass': '0 4px 20px rgba(197, 160, 89, 0.2)',
        'elevated': '0 20px 40px -12px rgba(15, 23, 42, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-gradient': 'linear-gradient(to bottom right, #FDFCF0, #F7F3E1)',
        'brass-gradient': 'linear-gradient(135deg, #C5A059 0%, #D4B67C 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0F172A 0%, #172133 100%)',
      }
    },
  },
  plugins: [],
}
export default config
