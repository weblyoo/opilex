# App Icon Troubleshooting Guide

## Current Icon Configuration

The app icon is configured in `app.json` with the following settings:

### Main Configuration
- **Icon**: `./assets/icon.png`
- **User Interface Style**: `automatic` (supports both light and dark themes)

### Platform-Specific Icons
- **iOS**: `./assets/icon.png`
- **Android**: `./assets/icon.png` + `./assets/adaptive-icon.png`
- **Web**: `./assets/favicon.png` + `./assets/icon.png`

## Troubleshooting Steps

### 1. Clear Expo Cache
```bash
npx expo start --clear
```

### 2. Restart Development Server
```bash
npx expo start
```

### 3. Check Icon File Requirements

**Main Icon (icon.png):**
- Size: 1024x1024 pixels
- Format: PNG
- No transparency (solid background)
- Square aspect ratio

**Android Adaptive Icon (adaptive-icon.png):**
- Size: 1024x1024 pixels
- Format: PNG
- Safe area: 66% of the icon (center 66% will be visible)
- Can have transparency

**Web Favicon (favicon.png):**
- Size: 32x32 or 16x16 pixels
- Format: PNG or ICO
- Can have transparency

### 4. Verify Icon Files Exist
Check that these files exist in the `assets/` directory:
- ✅ icon.png
- ✅ adaptive-icon.png
- ✅ favicon.png
- ✅ splash-icon.png

### 5. Test Icon Display

**In Expo Go:**
- The icon should appear in the Expo Go app list
- If not visible, try refreshing the app list

**In Development Build:**
- The icon will appear on the device home screen
- May take a few seconds to appear after installation

**In Production Build:**
- The icon will appear in app stores and on device
- Ensure all platform-specific icons are properly configured

### 6. Common Issues and Solutions

**Icon Not Showing in Expo Go:**
- Clear Expo cache: `npx expo start --clear`
- Restart Expo Go app
- Check if icon.png exists and is valid

**Icon Not Showing on Device:**
- Ensure icon.png is 1024x1024 pixels
- Check that the file is not corrupted
- Verify the path in app.json is correct

**Android Icon Issues:**
- Check adaptive-icon.png dimensions
- Ensure foreground image fits in safe area
- Verify background color is set correctly

**iOS Icon Issues:**
- Ensure icon.png meets Apple's requirements
- Check that the icon is square
- Verify no transparency in the main icon

### 7. Icon File Verification

To verify your icon files are correct:
1. Open the icon files in an image editor
2. Check dimensions (should be 1024x1024 for main icons)
3. Ensure the image is clear and not pixelated
4. Verify the file format is PNG

### 8. Force Icon Refresh

If the icon still doesn't appear:
1. Stop the Expo development server
2. Clear cache: `npx expo start --clear`
3. Restart the development server
4. Reinstall the app on your device (if using development build)

## Current Status

✅ Icon files exist in assets directory
✅ App.json configuration is correct
✅ Platform-specific icons are configured
✅ Asset bundle patterns include all assets

The icon should now display properly across all platforms!
