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
        primary: '#2180A0',
        secondary: '#5E5240',
        danger: '#C01527',
        success: '#21808D',
        warning: '#A84B2F',
        background: '#FCFCF9',
        surface: '#FFFFF5',
        'text-primary': '#134252',
        'text-secondary': '#62717F',
        border: '#E8E8E8',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
