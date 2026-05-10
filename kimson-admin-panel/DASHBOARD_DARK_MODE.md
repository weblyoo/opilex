# Dashboard Dark Mode Configuration

## Overview

The Dashboard screen is now configured to **always use dark mode** regardless of the app's global theme setting. All other screens will follow the default light mode or user's theme preference.

## Implementation Details

### Changes Made to DashboardScreen.tsx

**1. Import Dark Theme:**
```typescript
import { useTheme, darkTheme } from '../contexts/ThemeContext';
```

**2. Force Dark Theme:**
```typescript
const { toggleTheme, isDark } = useTheme();
// Force dark theme for dashboard only
const theme = darkTheme;
```

Instead of using the context's current theme, we directly assign `darkTheme` to the `theme` variable used throughout the component.

**3. Pass Dark Mode to Header:**
```typescript
<Header 
  title="OPILEX"
  showBackButton={false}
  leftElement={renderHamburgerMenu()}
  rightElement={renderHeaderRight()}
  backgroundColor={darkTheme.colors.background}
  textColor={darkTheme.colors.text}
  isDarkMode={true}
/>
```

This ensures the header uses dark gradient colors and styling.

### Changes Made to Header.tsx

**1. Add isDarkMode Prop:**
```typescript
interface HeaderProps {
  // ... existing props
  isDarkMode?: boolean;
}
```

**2. Use isDarkMode Prop:**
```typescript
// Use isDarkMode prop if provided, otherwise use theme's isDark
const isHeaderDark = isDarkMode !== undefined ? isDarkMode : isDark;

// Create gradient colors for 3D effect
const gradientColors = isHeaderDark 
  ? ['rgba(42, 42, 42, 0.95)', 'rgba(26, 26, 26, 0.98)', 'rgba(16, 16, 16, 1)']
  : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 248, 248, 0.98)', 'rgba(240, 240, 240, 1)'];
```

This allows the header to be forced into dark mode regardless of the global theme.

**3. Pass forceDark to Logo:**
```typescript
<Logo size={122} style={{ marginTop: '60%' }} forceDark={isHeaderDark} />
```

This ensures the light logo is used on the dark header.

**4. Update Status Bar and Shadow:**
```typescript
<StatusBar 
  barStyle={isHeaderDark ? "light-content" : "dark-content"}
  backgroundColor="transparent"
  translucent={true}
/>

<View style={[styles.innerShadow, {
  shadowColor: isHeaderDark ? '#000' : '#666',
  backgroundColor: 'transparent'
}]} />
```

### Changes Made to Logo.tsx

**1. Add forceDark Prop:**
```typescript
interface LogoProps {
  size?: number;
  style?: ImageStyle;
  forceDark?: boolean;
}
```

**2. Use forceDark Prop:**
```typescript
const Logo: React.FC<LogoProps> = ({ 
  size = 48, 
  style,
  forceDark = false
}) => {
  const { isDark } = useTheme();
  
  // Use forceDark prop if provided, otherwise use theme's isDark
  const useDarkBackground = forceDark || isDark;
  
  // Select the appropriate logo based on theme
  // If dark background, use light logo (and vice versa)
  const logoSource = useDarkBackground 
    ? require('../../assets/logo-light.png')
    : require('../../assets/logo-dark.png');
```

This allows the logo to display the light version on dark backgrounds.

### StatusBar Configuration in DashboardScreen

**Import StatusBar:**
```typescript
import {
  // ... other imports
  StatusBar,
} from 'react-native';
```

**4. Set Status Bar Style:**
```typescript
// In return statement
<StatusBar barStyle="light-content" backgroundColor={darkTheme.colors.background} />
```

**5. Add Focus Effect for Status Bar:**
```typescript
useFocusEffect(
  React.useCallback(() => {
    StatusBar.setBarStyle('light-content');
    return () => {
      // Reset to default when leaving dashboard
      StatusBar.setBarStyle('dark-content');
    };
  }, [])
);
```

This ensures:
- Status bar is light when dashboard is focused
- Status bar resets to dark when leaving dashboard

## Dark Theme Colors (Dashboard Only)

The dashboard now always uses these colors:

```typescript
{
  primary: '#1a1a1a',        // Dark Gray
  secondary: '#FFFFFF',      // White
  background: '#1a1a1a',     // Dark Gray
  surface: '#2a2a2a',        // Lighter Dark Gray
  text: '#FFFFFF',           // White
  textInverse: '#000000',    // Black
  border: '#333333',         // Dark Border
  accent: '#CCCCCC',         // Light Gray
  success: '#4CAF50',        // Green
  warning: '#FF9800',        // Orange
  error: '#F44336',          // Red
  cardBackground: '#2a2a2a', // Lighter Dark Gray
  buttonBackground: '#2a2a2a', // Lighter Dark Gray
  iconColor: '#FFFFFF',      // White
  separatorColor: '#555555', // Gray
  scanButtonBorder: '#FFFFFF', // White
}
```

## User Experience

### Dashboard Screen
- ✅ Always displays in dark mode
- ✅ Dark background (#1a1a1a)
- ✅ White text and icons
- ✅ Light status bar content
- ✅ Consistent dark theme regardless of global setting

### All Other Screens
- ✅ Use default light mode
- ✅ Respect user's theme toggle preference
- ✅ Dark status bar content
- ✅ Light backgrounds

### Theme Toggle
- ✅ Users can still toggle theme for other screens
- ✅ Dashboard remains dark always
- ✅ Smooth transition when navigating
- ✅ Status bar updates appropriately

## Benefits of Dashboard Dark Mode

**1. Visual Hierarchy:**
- Dashboard stands out as the main hub
- Creates a distinct visual identity
- Professional and modern appearance

**2. User Experience:**
- Reduces eye strain for frequent dashboard use
- Better contrast for important information
- Emphasizes rewards and points display

**3. Consistency:**
- Dashboard maintains same look for all users
- Predictable interface regardless of preferences
- Easier to design marketing materials

**4. Branding:**
- Dark theme gives premium feel
- Matches modern app design trends
- Creates memorable user experience

## Navigation Flow

**Light Mode → Dashboard (Dark) → Light Mode**

Example flow:
1. **Login Screen**: Light mode
2. **Navigate to Dashboard**: Transitions to dark mode
3. **Status Bar**: Changes to light content
4. **Navigate to Profile**: Transitions back to light mode
5. **Status Bar**: Changes to dark content

## Technical Notes

### Why This Approach?

Instead of creating a separate context or prop drilling, we:
- Import `darkTheme` directly from ThemeContext
- Override the local `theme` variable
- Keep all existing theme-dependent code unchanged
- Minimal changes to existing codebase

### Status Bar Management

The status bar is managed in two ways:
1. **Declarative**: `<StatusBar />` component in JSX
2. **Imperative**: `StatusBar.setBarStyle()` in useFocusEffect

This dual approach ensures:
- Immediate update when component renders
- Proper cleanup when navigating away
- Smooth transitions between screens

### Future Considerations

If you need to make other screens always dark:
1. Import `darkTheme` in that screen
2. Override the local `theme` variable
3. Add StatusBar management
4. Update useFocusEffect for status bar

Example:
```typescript
import { useTheme, darkTheme } from '../contexts/ThemeContext';

const MyScreen = () => {
  const { toggleTheme, isDark } = useTheme();
  const theme = darkTheme; // Force dark mode
  
  // Add status bar management
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('light-content');
      return () => StatusBar.setBarStyle('dark-content');
    }, [])
  );
  
  return (
    <View>
      <StatusBar barStyle="light-content" backgroundColor={darkTheme.colors.background} />
      {/* Your content */}
    </View>
  );
};
```

## Testing

### Test Cases

**1. Dashboard Appearance:**
- ✅ Open dashboard → Should be dark
- ✅ Check status bar → Should show light content
- ✅ Verify colors → Should match dark theme

**2. Navigation:**
- ✅ Navigate from light screen to dashboard → Should transition smoothly
- ✅ Navigate from dashboard to light screen → Should transition smoothly
- ✅ Status bar should update appropriately

**3. Theme Toggle:**
- ✅ Toggle theme on other screens → Should work normally
- ✅ Dashboard should remain dark regardless
- ✅ Other screens should respect the toggle

**4. Persistence:**
- ✅ Close and reopen app
- ✅ Dashboard should still be dark
- ✅ Other screens should remember user preference

## Summary

✅ Dashboard screen always uses dark mode  
✅ All other screens use light mode by default  
✅ Users can still toggle theme for non-dashboard screens  
✅ Status bar updates appropriately  
✅ Smooth transitions between screens  
✅ Minimal code changes required  
✅ Professional and modern appearance  

The dashboard now provides a consistent, premium dark mode experience while maintaining flexibility for the rest of the app!
