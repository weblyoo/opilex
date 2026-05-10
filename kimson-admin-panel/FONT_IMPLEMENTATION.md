# Conquera Font Implementation Guide

This guide explains how to implement Conquera font throughout the entire Opilex app.

## 1. Font Files Setup

### Required Font Files
Place the following font files in the `assets/fonts/` directory:
- `Conquera.ttf` (or `.otf`)
- `Conquera.woff2` (for web support)

### Directory Structure
```
OpilexApp/
├── assets/
│   └── fonts/
│       ├── Conquera.ttf
│       └── Conquera.woff2
├── src/
│   ├── config/
│   │   ├── fonts.ts
│   │   └── theme.ts
│   └── styles/
│       └── globalStyles.ts
```

## 2. Configuration Files

### Theme Configuration (`src/config/theme.ts`)
```typescript
export const theme = {
  // ... other theme properties
  fonts: {
    regular: 'Conquera',
    bold: 'Conquera',
    light: 'Conquera',
    medium: 'Conquera',
  },
};
```

### Font Configuration (`src/config/fonts.ts`)
```typescript
import { Platform } from 'react-native';

export const fonts = {
  regular: Platform.select({
    ios: 'Conquera',
    android: 'Conquera',
    default: 'Conquera',
  }),
  // ... other font weights
};
```

## 3. Global Styles (`src/styles/globalStyles.ts`)

The global styles file provides pre-configured text styles using Conquera:

- `globalTextStyles.h1` - Large headers
- `globalTextStyles.h2` - Medium headers
- `globalTextStyles.body` - Body text
- `globalTextStyles.button` - Button text
- `globalTextStyles.caption` - Small text

## 4. Implementation in Components

### Basic Usage
```typescript
import { globalTextStyles } from '../styles/globalStyles';

// In your component
<Text style={[globalTextStyles.h1, { color: theme.colors.text }]}>
  Welcome!
</Text>
```

### Combining with Local Styles
```typescript
<Text style={[
  styles.localStyle,
  globalTextStyles.button,
  { color: theme.colors.accent }
]}>
  Button Text
</Text>
```

## 5. App-wide Implementation

### Step 1: Update All Text Components
Replace existing font styles with global text styles:

```typescript
// Before
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>Title</Text>

// After
<Text style={[globalTextStyles.h2, { color: theme.colors.text }]}>Title</Text>
```

### Step 2: Update StyleSheet Definitions
Remove font-specific properties from local stylesheets:

```typescript
// Before
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});

// After
const styles = StyleSheet.create({
  title: {
    // Only non-font properties
    textAlign: 'center',
    marginBottom: 16,
  },
});
```

### Step 3: Apply Global Styles
Use global text styles in your components:

```typescript
<Text style={[styles.title, globalTextStyles.h2, { color: theme.colors.text }]}>
  Title
</Text>
```

## 6. Platform-Specific Considerations

### iOS
- Font files should be added to the iOS bundle
- Update `Info.plist` if needed for custom fonts

### Android
- Font files should be in `assets/fonts/`
- No additional configuration needed

### Web
- Include `.woff2` files for better performance
- Add font-face declarations if needed

## 7. Testing

### Verify Font Loading
1. Check that Conquera Bold is applied to all text
2. Test on both iOS and Android
3. Verify font rendering in different screen sizes
4. Test light and dark themes

### Common Issues
- **Font not loading**: Check file paths and naming
- **Fallback fonts**: Ensure proper font family names
- **Platform differences**: Test on both platforms

## 8. Maintenance

### Adding New Text Styles
1. Add to `src/config/fonts.ts`
2. Update `src/styles/globalStyles.ts`
3. Use in components with `globalTextStyles.newStyle`

### Updating Font Files
1. Replace font files in `assets/fonts/`
2. Clear app cache
3. Rebuild the app

## 9. Performance Considerations

- Font files are bundled with the app
- Use appropriate font weights
- Consider font subsetting for smaller bundle size
- Test loading performance on slower devices

## 10. Complete Implementation Checklist

- [ ] Font files added to `assets/fonts/`
- [ ] Theme configuration updated
- [ ] Font configuration created
- [ ] Global styles implemented
- [ ] All screens updated to use global styles
- [ ] Local stylesheets cleaned up
- [ ] Testing completed on all platforms
- [ ] Performance verified

## Example Implementation

Here's a complete example of implementing Conquera Bold in a screen:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { globalTextStyles } from '../styles/globalStyles';

const ExampleScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[globalTextStyles.h1, { color: theme.colors.text }]}>
        Welcome to Opilex
      </Text>
      <Text style={[globalTextStyles.body, { color: theme.colors.accent }]}>
        This text uses Conquera Bold font
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExampleScreen;
```

This implementation ensures that Conquera Bold is used consistently throughout the entire app while maintaining clean, maintainable code.
