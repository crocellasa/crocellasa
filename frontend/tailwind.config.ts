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
          midnight: '#0F172A',   // Text and primary elements (very dark blue)
          sand: '#F7F3E1',       // Secondary background/surface
        },
        // Modern monochrome palette (retained for utility)
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
          border: 'rgba(197, 160, 89, 0.1)', // Brass-tinted border
          surface: 'rgba(253, 252, 240, 0.7)', // Ivory-tinted surface
          highlight: 'rgba(255, 255, 255, 0.8)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(15, 23, 42, 0.03)',
        'glass-hover': '0 10px 40px rgba(15, 23, 42, 0.08)',
        'brass': '0 4px 20px rgba(197, 160, 89, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-gradient': 'linear-gradient(to bottom right, #FDFCF0, #F7F3E1)',
        'brass-gradient': 'linear-gradient(135deg, #C5A059 0%, #D4B67C 100%)',
      }
    },
  },
  plugins: [],
}
export default config
