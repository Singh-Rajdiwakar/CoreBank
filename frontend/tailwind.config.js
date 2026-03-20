/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ["'Space Grotesk'", "'DM Sans'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'Consolas', 'monospace'],
      },
      colors: {
        ink: '#0b0d12',
        paper: '#f6f4ef',
        card: '#ffffff',
        muted: '#5f6b7a',
        primary: {
          DEFAULT: '#0a7a5e',
          600: '#08634c',
          700: '#064d3b',
          800: '#053829',
        },
        danger: '#b42318',
        warning: '#b45309',
        success: '#047857',
      },
      boxShadow: {
        card: '0 14px 40px -26px rgba(7, 18, 15, 0.35)',
        soft: '0 10px 25px -14px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
