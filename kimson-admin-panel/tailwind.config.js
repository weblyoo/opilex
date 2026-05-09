/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Opilex Brand Theme
        opilex: {
          red: '#E31E24',
          'red-light': '#FF3B42',
          'red-dark': '#B8171C',
          dark: '#111111',
          surface: '#1A1A1A',
          background: '#0F0F0F',
          text: '#FFFFFF',
          textInverse: '#111111',
          border: 'rgba(227, 30, 36, 0.25)',
          accent: '#E31E24',
        },
        // Override default grays for dark theme
        gray: {
          50: '#1a1a1a',
          100: '#222222',
          200: '#2a2a2a',
          300: '#3a3a3a',
          400: '#4a4a4a',
          500: '#5a5a5a',
          600: '#6a6a6a',
          700: '#7a7a7a',
          800: '#8a8a8a',
          900: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Ubuntu', 'sans-serif'],
        ubuntu: ['Ubuntu', 'sans-serif'],
      },
      fontSize: {
        xs: ['10px', { lineHeight: '1.2' }],
        sm: ['12px', { lineHeight: '1.3' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['18px', { lineHeight: '1.6' }],
        xl: ['20px', { lineHeight: '1.6' }],
        '2xl': ['24px', { lineHeight: '1.6' }],
        '3xl': ['28px', { lineHeight: '1.5' }],
        '4xl': ['32px', { lineHeight: '1.4' }],
        '5xl': ['36px', { lineHeight: '1.3' }],
        '6xl': ['42px', { lineHeight: '1.2' }],
      },
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        bold: '700',
        black: '900',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '12px',
        round: '50px',
      },
    },
  },
  plugins: [],
}
