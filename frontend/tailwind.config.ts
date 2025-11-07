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
        // Alcova brand colors
        alcova: {
          ivory: '#F5F1E8',
          gold: '#D4AF37',
          brass: '#B5A677',
          navy: '#1A2332',
          charcoal: '#2C2C2C',
        },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
