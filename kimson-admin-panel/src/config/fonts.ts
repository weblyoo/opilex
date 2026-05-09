import { Platform } from 'react-native';

export const fonts = {
  // Ubuntu as the primary font
  regular: Platform.select({
    ios: 'Ubuntu-Regular',
    android: 'Ubuntu-Regular',
    default: 'Ubuntu-Regular',
  }),
  bold: Platform.select({
    ios: 'Ubuntu-Bold',
    android: 'Ubuntu-Bold',
    default: 'Ubuntu-Bold',
  }),
  light: Platform.select({
    ios: 'Ubuntu-Light',
    android: 'Ubuntu-Light',
    default: 'Ubuntu-Light',
  }),
  medium: Platform.select({
    ios: 'Ubuntu-Medium',
    android: 'Ubuntu-Medium',
    default: 'Ubuntu-Medium',
  }),
  // Briller font for special branding
  briller: Platform.select({
    ios: 'Briller-Bold',
    android: 'Briller-Bold',
    default: 'Briller-Bold',
  }),
  // Fallback fonts
  fallback: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
};

// Font weights
export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  bold: '700',
  black: '900',
};

// Font sizes
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
  '7xl': 42,
  '8xl': 48,
  '9xl': 56,
};

// Text styles with Ubuntu
export const textStyles = {
  // Headers
  h1: {
    fontFamily: fonts.bold,
    fontSize: fontSizes['6xl'],
    fontWeight: fontWeights.black,
    letterSpacing: 1.2,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.black,
    letterSpacing: 1.0,
  },
  h3: {
    fontFamily: fonts.bold,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: 0.8,
  },
  h4: {
    fontFamily: fonts.bold,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: 0.6,
  },
  h5: {
    fontFamily: fonts.bold,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: 0.5,
  },
  h6: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.5,
  },
  
  // Body text
  body: {
    fontFamily: fonts.light,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.light,
  },
  bodyLarge: {
    fontFamily: fonts.light,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.light,
  },
  bodySmall: {
    fontFamily: fonts.light,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.light,
  },
  
  // Labels and buttons
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.3,
  },
  button: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.8,
  },
  buttonLarge: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    letterSpacing: 1.0,
  },
  
  // Captions and small text
  caption: {
    fontFamily: fonts.light,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.light,
  },
  
  // Special text
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes['7xl'],
    fontWeight: fontWeights.black,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: fonts.light,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.light,
    letterSpacing: 0.4,
  },
};
