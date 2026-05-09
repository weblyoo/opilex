/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kimson Black & White Theme
        kimson: {
          primary: '#000000',
          secondary: '#FFFFFF',
          background: '#000000',
          surface: '#000000',
          text: '#FFFFFF',
          textInverse: '#000000',
          border: 'rgba(255, 255, 255, 0.3)',
          accent: '#FFFFFF',
        },
        // Override default grays to match Kimson theme
        gray: {
          50: '#1a1a1a',
          100: '#2a2a2a',
          200: '#3a3a3a',
          300: '#4a4a4a',
          400: '#5a5a5a',
          500: '#6a6a6a',
          600: '#7a7a7a',
          700: '#8a8a8a',
          800: '#9a9a9a',
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
