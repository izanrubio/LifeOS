import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#1a1a1a',
        border: '#2a2a2a',
        accent: '#4a7c59',
        'accent-hover': '#5a8c69',
        text: '#e5e5e5',
        'text-muted': '#a0a0a0',
      },
    },
  },
  plugins: [],
}

export default config
