export const theme = {
  colors: {
    primary: '#E31E24',
    primaryLight: '#FF3B42',
    primaryDark: '#B8171C',
    secondary: '#FFFFFF',
    background: '#111111',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textInverse: '#111111',
    border: 'rgba(227, 30, 36, 0.25)',
    accent: '#E31E24',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#E31E24',
    iconColor: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fontSize: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    round: 50,
  },
  fonts: {
    regular: 'Ubuntu-Regular',
    bold: 'Ubuntu-Bold',
    light: 'Ubuntu-Light',
    medium: 'Ubuntu-Medium',
  },
};

export type Theme = typeof theme;