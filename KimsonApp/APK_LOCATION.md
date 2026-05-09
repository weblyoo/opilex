# APK Location Guide

## 📍 APK File Locations

After building, the APK will be located at:

### Debug APK (for testing)
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Release APK (for distribution)
```
android\app\build\outputs\apk\release\app-release.apk
```

## 🔨 How to Build

Since you just ran `./gradlew clean`, you need to build the APK:

### Option 1: Build Debug APK (faster, for testing)
```powershell
cd android
./gradlew assembleDebug
```

### Option 2: Build Release APK (optimized, for distribution)
```powershell
cd android
./gradlew assembleRelease
```

### Option 3: Use the Build Script
```powershell
# From project root
.\BUILD_AND_FIND_APK.ps1 -BuildType debug
# or
.\BUILD_AND_FIND_APK.ps1 -BuildType release
```

### Option 4: Use Short Path Script (avoids Windows path length issues)
```powershell
.\BUILD_APK_SHORT_PATH.ps1
```
This builds from `C:\kimson\KimsonApp` and copies the APK back to your project.

## 📱 After Building

Once built, you can:

1. **Install on connected device:**
   ```powershell
   adb install android\app\build\outputs\apk\debug\app-debug.apk
   ```

2. **Open in File Explorer:**
   ```powershell
   explorer android\app\build\outputs\apk\debug
   ```

3. **Copy to desktop:**
   ```powershell
   Copy-Item android\app\build\outputs\apk\debug\app-debug.apk $env:USERPROFILE\Desktop\
   ```

## ⚠️ Note

Since you ran `./gradlew clean`, the build directory was cleaned. You need to build the APK again before it will exist.
