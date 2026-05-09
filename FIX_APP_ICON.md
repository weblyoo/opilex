# Fix App Icon Display Issue

## Current Issue
The app icon is not displaying in Expo Go or on the device.

## Solution Steps

### Step 1: Stop Current Development Server
First, stop the currently running development server by pressing `Ctrl+C` in the terminal.

### Step 2: Clear Expo Cache
Run the following commands in the KimsonApp directory:

```bash
# Clear Expo cache
npx expo start --clear
```

### Step 3: Alternative - Full Cache Clear
If the above doesn't work, do a full cache clear:

```bash
# Stop the server first (Ctrl+C)

# Clear npm cache
npm cache clean --force

# Clear Expo cache
npx expo start -c
```

### Step 4: Reset Metro Bundler Cache
```bash
npx expo start --clear --reset-cache
```

### Step 5: For Android Emulator/Device
If testing on Android:

```bash
# Uninstall the app from the device/emulator
adb uninstall com.kimson.wireauth

# Then restart Expo
npx expo start --clear

# Press 'a' to open on Android
```

### Step 6: For iOS Simulator
If testing on iOS:

```bash
# Uninstall the app from simulator
xcrun simctl uninstall booted com.kimson.wireauth

# Then restart Expo
npx expo start --clear

# Press 'i' to open on iOS
```

### Step 7: For Expo Go App
If using Expo Go:

1. Close Expo Go app completely
2. Clear Expo Go cache:
   - Android: Go to Settings → Apps → Expo Go → Storage → Clear Cache
   - iOS: Uninstall and reinstall Expo Go
3. Restart the development server with cache clearing:
   ```bash
   npx expo start --clear
   ```
4. Scan QR code again in Expo Go

## Icon File Requirements

### Main Icon (icon.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Transparency**: No (solid background recommended)
- **Aspect Ratio**: 1:1 (square)
- **Path**: `./assets/icon.png`

### Android Adaptive Icon (adaptive-icon.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Safe Area**: 66% of icon (center)
- **Transparency**: Allowed
- **Path**: `./assets/adaptive-icon.png`

### Web Favicon (favicon.png)
- **Size**: 32x32 or 16x16 pixels
- **Format**: PNG or ICO
- **Path**: `./assets/favicon.png`

## Verify Icon Files

Check if your icon files exist:

```bash
# List icon files
ls -la assets/*.png | grep -E "(icon|favicon)"
```

You should see:
- `icon.png` (main app icon)
- `adaptive-icon.png` (Android adaptive icon)
- `favicon.png` (web favicon)
- `splash-icon.png` (splash screen icon)

## Current Configuration (app.json)

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "ios": {
      "icon": "./assets/icon.png"
    },
    "android": {
      "icon": "./assets/icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F5F5F5"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "icon": "./assets/icon.png"
    }
  }
}
```

## Testing Icon Display

### In Development (Expo Go)
1. The icon should appear in the Expo Go app list
2. May take a few seconds to load
3. If not visible, try force-quitting Expo Go and reopening

### In Development Build
1. Build a development version:
   ```bash
   eas build --profile development --platform android
   ```
2. Install the APK/IPA on your device
3. Icon should appear on home screen

### In Production Build
1. Build production version:
   ```bash
   eas build --profile production --platform android
   ```
2. Icon will appear on device after installation

## Common Issues and Solutions

### Issue 1: Icon Still Not Showing After Cache Clear
**Solution:**
- Verify icon file exists: `ls -la assets/icon.png`
- Check file size: should be 1024x1024
- Verify it's a valid PNG file
- Try using a different icon file temporarily

### Issue 2: Icon Shows in iOS but Not Android (or vice versa)
**Solution:**
- Check platform-specific configuration in app.json
- Verify adaptive-icon.png exists for Android
- Ensure backgroundColor is set for Android adaptive icon

### Issue 3: Icon Shows in Built App but Not in Expo Go
**Solution:**
- This is normal - Expo Go caches heavily
- Use development build instead
- Or completely reinstall Expo Go

### Issue 4: Old Icon Still Showing
**Solution:**
- Clear all caches (steps above)
- Uninstall app completely from device
- Restart development server
- Reinstall app

## Quick Fix Commands

Run these commands in sequence:

```bash
# 1. Stop server (Ctrl+C)

# 2. Clear all caches
npx expo start --clear

# 3. If that doesn't work, try this:
rm -rf node_modules/.cache
npm cache clean --force
npx expo start -c

# 4. For Android, uninstall first:
adb uninstall com.kimson.wireauth

# 5. Then start fresh:
npx expo start --clear
```

## Build Production APK with Icon

To build a production APK with the icon:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --profile production --platform android

# Build for iOS
eas build --profile production --platform ios
```

## Verification Checklist

- ✅ Icon files exist in assets directory
- ✅ Icon files are valid PNG format
- ✅ Icon.png is 1024x1024 pixels
- ✅ adaptive-icon.png is 1024x1024 pixels
- ✅ app.json has correct paths
- ✅ Development server restarted with --clear flag
- ✅ Metro bundler cache cleared
- ✅ Expo Go app cache cleared (if using)
- ✅ App reinstalled on device

## Expected Behavior

### In Expo Go:
- Icon appears in app list within Expo Go
- May show default Expo icon initially, then update

### In Standalone Build:
- Icon appears on device home screen
- Icon appears in app drawer/list
- Icon appears in task switcher

## Additional Notes

1. **Icon changes require cache clearing** - Always restart with `--clear` flag after changing icons
2. **Expo Go limitations** - Icons may not show properly in Expo Go; use development builds for accurate testing
3. **Production builds** - Icons always work in production builds (EAS Build or APK/IPA)
4. **Image format** - Use PNG format only, not JPG or other formats
5. **File size** - Keep under 1MB for faster loading

## Still Not Working?

If the icon still doesn't display after trying all steps:

1. **Check the icon file itself:**
   ```bash
   file assets/icon.png
   # Should output: PNG image data, 1024 x 1024, ...
   ```

2. **Verify file permissions:**
   ```bash
   chmod 644 assets/icon.png
   ```

3. **Try a test icon:**
   - Download a simple test icon (1024x1024)
   - Replace icon.png temporarily
   - Clear cache and restart
   - If test icon works, original icon may have issues

4. **Check Expo version:**
   ```bash
   npx expo --version
   ```
   - Should be SDK 54 or higher
   - Update if needed: `npx expo upgrade`

## Contact Support

If none of these solutions work:
- Check Expo forums: https://forums.expo.dev/
- Check GitHub issues: https://github.com/expo/expo/issues
- Provide details: Expo version, platform, icon file details

## Summary

The most common fix:
```bash
npx expo start --clear
```

Then reload the app in Expo Go or reinstall on device.
