import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import Logo from './Logo';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  isDarkMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  leftElement,
  rightElement,
  backgroundColor,
  textColor,
  isDarkMode,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (Constants.statusBarHeight || 0) : insets.top;
  
  // Use props if provided, otherwise use theme colors
  const headerBgColor = backgroundColor || theme.colors.background;
  const headerTextColor = textColor || theme.colors.text;
  
  // Use isDarkMode prop if provided, otherwise use theme's isDark
  // Ensure boolean type (not string)
  const isHeaderDark = isDarkMode !== undefined ? Boolean(isDarkMode) : Boolean(isDark);
  
  // If backgroundColor is explicitly provided, use solid color; otherwise use gradient
  const useSolidColor = backgroundColor !== undefined;
  
  // Create gradient colors for 3D effect (or solid color if backgroundColor provided)
  const gradientColors = useSolidColor && backgroundColor
    ? [backgroundColor, backgroundColor, backgroundColor] // Solid color
    : isHeaderDark 
    ? ['rgba(42, 42, 42, 0.95)', 'rgba(26, 26, 26, 0.98)', 'rgba(16, 16, 16, 1)']
    : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 248, 248, 0.98)', 'rgba(240, 240, 240, 1)'];
  
  return (
    <>
      <StatusBar 
        barStyle={isHeaderDark ? "light-content" : "dark-content"}
        backgroundColor={headerBgColor}
        translucent={true}
      />
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={gradientColors}
          style={[styles.headerWrapper, { 
            borderBottomColor: theme.colors.border 
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Inner shadow effect */}
          <View style={[styles.innerShadow, {
            shadowColor: isHeaderDark ? '#000' : '#666',
            backgroundColor: 'transparent'
          }]} />
          
          <View style={[styles.container, { paddingTop: topInset }]}>
            <View style={styles.leftSection}>
              {leftElement ? (
                leftElement
              ) : showBackButton ? (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={onBackPress}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name="arrow-left" 
                    size={24} 
                    color={headerTextColor} 
                    strokeWidth={2.5} 
                  />
                </TouchableOpacity>
              ) : null}
            </View>
            
            <View style={styles.centerSection}>
              {title === 'OPILEX' ? (
                <View style={styles.logoContainer}>
                  <Logo size={200} style={{ marginTop: '65%' }} forceDark={isHeaderDark} />
                </View>
              ) : (
                <Text style={[styles.title, { color: headerTextColor }]} numberOfLines={1}>
                  {title}
                </Text>
              )}
            </View>
            
            <View style={styles.rightSection}>
              {rightElement}
            </View>
          </View>
        </LinearGradient>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    // Container that will include status bar height
    position: 'relative',
  },
  headerWrapper: {
    borderBottomWidth: 1,
  },
  innerShadow: {
    display: 'none',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
    // Subtle inner glow effect
    position: 'relative',
    zIndex: 1,
  },
  leftSection: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    overflow: 'visible',
    width: '100%',
    height: 60,
  },
  rightSection: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    // Hover effect simulation
    transform: [{ scale: 1 }],
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
});

export default Header;




