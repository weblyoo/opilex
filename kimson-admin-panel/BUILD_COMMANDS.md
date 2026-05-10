# Complete Command List for Building Opilex App APK

## Prerequisites Setup Commands

### 1. Install Required Tools
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI for building
npm install -g eas-cli

# Verify installations
expo --version
eas --version
```

### 2. Create Expo Account (if needed)
```bash
# Create account at expo.dev first, then login
eas login
```

## Project Setup Commands

### 3. Navigate to Project Directory
```bash
# Go to the project directory
cd OpilexApp

# Verify you're in the right place
dir
# Should show app.json, package.json, src folder, etc.
```

### 4. Install and Update Dependencies
```bash
# Install all dependencies
npm install

# Check for issues
npx expo-doctor

# Fix dependency versions (if needed)
npx expo install --check

# Install specific required packages
npx expo install @react-native-async-storage/async-storage expo react-native-reanimated react-native-worklets

# Verify everything is working
npx expo-doctor
# Should show "17/17 checks passed. No issues detected!"
```

## Build Commands

### 5. Initialize EAS Project (Interactive)
```bash
# Initialize EAS project - this will prompt for project creation
eas init
# Answer "Yes" when asked to create project
```

### 6. Build APK
```bash
# Build APK for testing (recommended)
eas build --platform android --profile preview

# Alternative: Build for production (creates AAB for Play Store)
eas build --platform android --profile production
```

### 7. Monitor Build Progress
```bash
# Check build status
eas build:list --platform android --limit 5

# Check specific build details
eas build:view <BUILD_ID>
```

## Quick Build Script (All-in-One)

### Complete Build Script
```bash
# Copy and paste this entire block:

# 1. Navigate to project
cd OpilexApp

# 2. Update dependencies
npm install
npx expo install @react-native-async-storage/async-storage expo react-native-reanimated react-native-worklets

# 3. Verify health
npx expo-doctor

# 4. Start build (this will prompt for EAS init if needed)
eas build --platform android --profile preview
```

## Alternative: Manual Step-by-Step

### If you want to do each step manually:

#### Step 1: Setup
```bash
npm install -g @expo/cli eas-cli
eas login
```

#### Step 2: Project Preparation
```bash
cd OpilexApp
npm install
```

#### Step 3: Fix Dependencies
```bash
npx expo install @react-native-async-storage/async-storage
npx expo install expo
npx expo install react-native-reanimated  
npx expo install react-native-worklets
```

#### Step 4: Health Check
```bash
npx expo-doctor
```

#### Step 5: Initialize EAS
```bash
eas init
# Type 'y' or 'yes' when prompted
```

#### Step 6: Build
```bash
eas build --platform android --profile preview
```

## Command Flags Explained

### Build Command Options:
```bash
# Basic build
eas build --platform android --profile preview

# Non-interactive (skip prompts)
eas build --platform android --profile preview --non-interactive

# Local build (requires Android SDK)
eas build --platform android --profile preview --local

# Clear cache before build
eas build --platform android --profile preview --clear-cache

# Wait for build completion
eas build --platform android --profile preview --wait
```

### Useful Monitoring Commands:
```bash
# List all builds
eas build:list

# List Android builds only
eas build:list --platform android

# Show latest 3 builds
eas build:list --limit 3

# View specific build
eas build:view <BUILD_ID>

# Cancel running build
eas build:cancel <BUILD_ID>
```

## Troubleshooting Commands

### If Build Fails:
```bash
# Check project health
npx expo-doctor

# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
npx expo r -c

# Check EAS configuration
eas config

# View detailed logs
eas build:view <BUILD_ID> --logs
```

### Common Fix Commands:
```bash
# Fix TypeScript issues
npx tsc --noEmit --skipLibCheck

# Update all dependencies
npx expo install --fix

# Fix barcode scanner issues (if build fails)
npm uninstall expo-barcode-scanner
npm install
npx expo-doctor

# Reset EAS project
rm -rf .expo
eas init

# Clear build cache and retry
eas build --platform android --profile preview --clear-cache
```

## Download and Install Commands

### After Build Completes:
```bash
# Check if build is ready
eas build:list --platform android --limit 1

# Download APK directly (if URL provided)
curl -L -o opilex-app.apk "YOUR_DOWNLOAD_URL"

# Or download via browser from expo.dev dashboard
```

### Install on Android Device:
```bash
# Transfer APK to device via ADB (if device connected)
adb install opilex-app.apk

# Or manually:
# 1. Enable "Unknown Sources" in Android settings
# 2. Transfer APK file to device
# 3. Tap APK file to install
```

## Complete One-Line Build Command

```bash
cd OpilexApp && npm install && npx expo install @react-native-async-storage/async-storage expo react-native-reanimated react-native-worklets && npx expo-doctor && eas build --platform android --profile preview
```

## Expected Output

### Successful Build Output:
```
✔ Build completed!
  Build details: https://expo.dev/accounts/weblyoapp/projects/opilex-app/builds/...
  APK: https://expo.dev/artifacts/...
```

### Build Status Check:
```bash
# This command shows build status:
eas build:list --platform android --limit 1

# Output will show:
# Platform: android
# Status: finished
# Build Profile: preview  
# Created: [timestamp]
# Download: [APK URL]
```

## File Locations

### Important Files:
- `app.json` - App configuration
- `eas.json` - Build profiles
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript settings

### Generated Files:
- `.expo/` - Expo configuration cache
- `opilex-app.apk` - Final APK file (downloaded)

## Next Steps After APK Creation

1. **Download APK** from provided URL
2. **Test on Android device** 
3. **Verify all features work**:
   - Phone authentication
   - QR code scanning  
   - Reward points system
   - Navigation
4. **Share APK** for testing or distribution

---

**Note**: The build process typically takes 10-20 minutes. You'll receive an email notification when complete with download links.
