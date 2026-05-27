import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      colors: {
        brand: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f4dba5',
          300: '#ecc46a',
          400: '#e5a83a',
          500: '#d48f1e',
          600: '#b87316',
          700: '#8f5512',
          800: '#6b3f10',
          900: '#4a2c0d',
        },
      },
    },
  },
  plugins: [],
}

export default config
