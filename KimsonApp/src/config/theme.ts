export const theme = {
  colors: {
    primary: '#E30613',
    secondary: '#000000',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    textInverse: '#FFFFFF',
    border: '#E6E6E6',
    accent: '#E30613',
    success: '#148A3B',
    warning: '#B7791F',
    error: '#E30613',
    iconColor: '#E30613',
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
