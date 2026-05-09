# Theme Configuration Guide

## Default Theme Mode

The app now defaults to **Light Mode** instead of Dark Mode.

## Configuration Changes Made

### 1. ThemeContext.tsx
**File**: `src/contexts/ThemeContext.tsx`

**Changed Default State:**
```typescript
const [themeMode, setThemeMode] = useState<ThemeMode>('light');
```

**Previous**: `'dark'`  
**Current**: `'light'`

This sets the initial theme mode to light when the app first loads (before any saved preference is loaded).

### 2. app.json
**File**: `app.json`

**Changed User Interface Style:**
```json
"userInterfaceStyle": "light"
```

**Previous**: `"automatic"` or `"dark"`  
**Current**: `"light"`

This ensures the system UI (status bar, navigation bar) defaults to light mode.

**Changed Splash Background:**
```json
"splash": {
  "backgroundColor": "#F5F5F5"
}
```

**Previous**: `"#000000"` (black)  
**Current**: `"#F5F5F5"` (light gray)

**Changed Android Adaptive Icon Background:**
```json
"adaptiveIcon": {
  "backgroundColor": "#F5F5F5"
}
```

**Previous**: `"#000000"` (black)  
**Current**: `"#F5F5F5"` (light gray)

## Theme Colors

### Light Theme Colors
```typescript
{
  primary: '#FFFFFF',        // White
  secondary: '#000000',      // Black
  background: '#F5F5F5',     // Light Gray
  surface: '#FFFFFF',        // White
  text: '#000000',           // Black
  textInverse: '#FFFFFF',    // White
  border: '#E0E0E0',         // Light Gray Border
  accent: '#666666',         // Gray
  success: '#4CAF50',        // Green
  warning: '#FF9800',        // Orange
  error: '#F44336',          // Red
  cardBackground: '#FFFFFF', // White
  buttonBackground: '#FFFFFF', // White
  iconColor: '#000000',      // Black
  separatorColor: '#CCCCCC', // Light Gray
  scanButtonBorder: '#000000', // Black
}
```

### Dark Theme Colors
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

## Theme Persistence

The app uses AsyncStorage to save the user's theme preference:

- **Storage Key**: `@kimson_theme_mode`
- **Saved Values**: `'light'` or `'dark'`
- **Behavior**: 
  - First launch: Light mode (default)
  - After user toggles: Saved preference is loaded
  - Persistent across app restarts

## User Can Still Switch Themes

Users can toggle between light and dark modes using the theme toggle button available in various screens throughout the app. Their preference will be saved and persist across app restarts.

## Testing Theme Changes

### 1. Clear App Data (Optional)
To test the default theme from scratch:
```bash
# For iOS Simulator
xcrun simctl uninstall booted com.kimson.wireauth

# For Android Emulator
adb uninstall com.kimson.wireauth
```

### 2. Restart Development Server
```bash
npx expo start --clear
```

### 3. Expected Behavior
- **First Launch**: App opens in light mode
- **Status Bar**: Light content (dark text on light background)
- **Splash Screen**: Light gray background (#F5F5F5)
- **All Screens**: Light theme by default

## Impact on Existing Users

**For New Users:**
- Will see light mode by default
- Clean and modern light interface

**For Existing Users:**
- Their saved theme preference will be respected
- If they previously selected dark mode, it will remain dark mode
- Only users who never changed the theme will see the new light default

## Reverting to Dark Mode Default

If you need to revert to dark mode as the default:

1. **ThemeContext.tsx**: Change back to `'dark'`
2. **app.json**: Change `userInterfaceStyle` to `"dark"`
3. **app.json**: Change splash background to `"#000000"`
4. **app.json**: Change adaptive icon background to `"#000000"`

## Summary

✅ Default theme changed from dark to light  
✅ Splash screen background updated to light gray  
✅ Android adaptive icon background updated  
✅ User interface style set to light  
✅ Theme persistence still works  
✅ Users can still toggle between themes  

The app now provides a bright, modern light mode experience by default!
