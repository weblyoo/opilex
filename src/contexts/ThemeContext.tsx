import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textInverse: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  cardBackground: string;
  buttonBackground: string;
  iconColor: string;
  separatorColor: string;
  scanButtonBorder: string;
  // Additional colors for dashboard
  shadowColor: string;
  overlayColor: string;
  overlayLight: string;
  overlayDark: string;
  sliderBackground: string;
  sliderBorder: string;
  buttonBoxBackground: string;
  drawerBackdrop: string;
  loadingBackground: string;
  awardCupBackground: string;
  awardCupShadow: string;
}

interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    round: number;
  };
}

const darkTheme: Theme = {
  colors: {
    primary: '#000000',
    secondary: '#FFFFFF',
    background: '#000000',
    surface: '#000000',
    text: '#FFFFFF',
    textInverse: '#000000',
    border: 'rgba(255, 255, 255, 0.3)',
    accent: '#FFFFFF',
    success: '#FFFFFF',
    warning: '#FFFFFF',
    error: '#FFFFFF',
    cardBackground: '#000000',
    buttonBackground: '#000000',
    iconColor: '#FFFFFF',
    separatorColor: 'rgba(255, 255, 255, 0.3)',
    scanButtonBorder: '#FFFFFF',
    shadowColor: '#000000',
    overlayColor: 'rgba(0, 0, 0, 0.3)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
    overlayDark: 'rgba(0, 0, 0, 0.4)',
    sliderBackground: '#FFFFFF',
    sliderBorder: '#000000',
    buttonBoxBackground: 'rgba(255, 255, 255, 0.08)',
    drawerBackdrop: 'rgba(0, 0, 0, 0.5)',
    loadingBackground: '#1a1a1a',
    awardCupBackground: '#FFF8E1',
    awardCupShadow: '#FFD700',
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
};

const lightTheme: Theme = {
  colors: {
    primary: '#FFFFFF',
    secondary: '#000000',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    textInverse: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.3)',
    accent: '#000000',
    success: '#000000',
    warning: '#000000',
    error: '#000000',
    cardBackground: '#FFFFFF',
    buttonBackground: '#FFFFFF',
    iconColor: '#000000',
    separatorColor: 'rgba(0, 0, 0, 0.3)',
    scanButtonBorder: '#000000',
    shadowColor: '#000000',
    overlayColor: 'rgba(0, 0, 0, 0.3)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
    overlayDark: 'rgba(0, 0, 0, 0.4)',
    sliderBackground: '#FFFFFF',
    sliderBorder: '#000000',
    buttonBoxBackground: 'rgba(0, 0, 0, 0.05)',
    drawerBackdrop: 'rgba(0, 0, 0, 0.5)',
    loadingBackground: '#FFFFFF',
    awardCupBackground: '#FFF8E1',
    awardCupShadow: '#FFD700',
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
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@kimson_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    }
  };

  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemeMode(newMode);
  };

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isDark = themeMode === 'dark';

  const value: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { darkTheme, lightTheme };
export type { Theme, ThemeColors };
