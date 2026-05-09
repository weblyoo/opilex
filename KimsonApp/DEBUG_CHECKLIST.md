# Debug Checklist - App Not Working

## ✅ Fixes Applied

1. **Enhanced Debug Logging**
   - Added console logs in SplashScreen to track rendering
   - Added logs in AppNavigator to track navigation
   - Added logs in App.tsx to track component loading

2. **Defensive Theme Handling**
   - SplashScreen now has complete theme fallback with all color properties
   - Extracts text color separately to ensure it's always available

3. **Component Loading Verification**
   - App.tsx now verifies all components loaded before rendering
   - Better error messages if components fail to load

4. **Navigation Container Logging**
   - Added onReady callback to track when navigation is ready
   - Added onStateChange to track route changes

## 🔍 How to Debug

### Step 1: Start the App
```bash
npm start
```

### Step 2: Watch Console Output
Look for these messages in order:

1. **App.tsx logs:**
   - ✅ "All app components loaded successfully"
   - ✅ "Rendering app with ErrorBoundary > ThemeProvider > AuthProvider > AppNavigator"

2. **AppNavigator logs:**
   - AppNavigator rendering with initialRouteName, hasUser, loading status
   - ✅ "NavigationContainer ready"

3. **SplashScreen logs:**
   - SplashScreen render with backgroundColor, textColor, hasUser
   - SplashScreen rendered with context status

### Step 3: Identify the Issue

#### If you see NO console logs:
- **Problem**: JavaScript bundle not loading
- **Check**: Metro bundler console for errors
- **Fix**: Clear cache: `npm start -- --reset-cache`

#### If you see logs but blank screen:
- **Problem**: Component rendering but not visible
- **Check**: 
  - Background color is #000000 (black on black screen)
  - Text color is #FFFFFF (white text should be visible)
- **Fix**: Check if fonts are loaded, check if animations are blocking

#### If you see error logs:
- **Problem**: Component import or initialization failed
- **Check**: Error message in console
- **Fix**: Check ErrorBoundary error screen, fix the specific error

#### If navigation logs show stuck:
- **Problem**: Navigation not working
- **Check**: What route is current? Does it change after 6 seconds?
- **Fix**: Check navigation.replace() calls, check route names match

## 🐛 Common Issues and Fixes

### Issue 1: Blank Black Screen
**Cause**: Background and text both black, or component not rendering

**Debug:**
- Check console for "SplashScreen render" log
- Check backgroundColor and textColor values
- Check if animations are running

**Fix:**
```typescript
// Temporarily change background to see if it renders
backgroundColor: '#FF0000' // Red background to test
```

### Issue 2: App Crashes Immediately
**Cause**: Native crash or JavaScript error before render

**Debug:**
- Check Metro console for JavaScript errors
- Check logcat for native crashes: `adb logcat | grep -i error`
- Check ErrorBoundary caught error

**Fix:**
- Share the exact error message
- Check if all dependencies installed: `npm install`

### Issue 3: Stuck on Loading Screen
**Cause**: `appIsReady` never becomes true

**Debug:**
- Check if font loading completes
- Check if language initialization completes
- Check if any promise hangs

**Fix:**
- Add timeout to initialization
- Check console for warnings about hanging promises

### Issue 4: Navigation Doesn't Work
**Cause**: Navigation.replace() not called or route name mismatch

**Debug:**
- Check "Navigation state changed" logs
- Check if timer in SplashScreen runs (6 seconds)
- Check if user state is correct

**Fix:**
- Verify route names match RootStackParamList
- Check navigation.replace() is called
- Check user state logic

## 📋 What to Share

To get help, share:

1. **Console Output:**
   ```
   [Copy all console logs from Metro bundler]
   ```

2. **Device Logs:**
   ```powershell
   adb logcat | Select-String -Pattern "Error|Exception|FATAL"
   ```

3. **What You See:**
   - Blank screen?
   - Loading spinner?
   - Error screen?
   - Splash screen animation?

4. **When It Happens:**
   - Immediately?
   - After X seconds?
   - When doing specific action?

## 🚀 Quick Test

To verify the app works, try this minimal test:

1. Comment out all animations in SplashScreen
2. Just show a simple View with Text
3. If that works, the issue is in animations
4. If that doesn't work, the issue is in setup

---

**Run the app and share the console output!**
