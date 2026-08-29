/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: {
          50: '#1e1e1e',
          100: '#141414',
          200: '#0f0f0f',
          300: '#0a0a0a',
        },
        border: {
          subtle: '#262626',
          muted: '#383838',
          active: '#4a4a4a',
          brand: 'rgba(0, 30, 255, 0.3)',
        },
        brand: {
          300: '#808eff',
          400: '#334bff',
          500: '#001EFF', // Midnight Electric Blue from reference
          600: '#001bd6',
          700: '#0016b0',
          950: '#000840',
        },
        accent: {
          DEFAULT: '#fafafa',
          muted: '#a1a1aa',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
