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
        background: '#09090b',
        surface: {
          50: '#18181b',
          100: '#121215',
          200: '#0c0c0e',
          300: '#09090b',
        },
        border: {
          subtle: '#27272a',
          muted: '#3f3f46',
          active: '#71717a',
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
    },
  },
  plugins: [],
}
