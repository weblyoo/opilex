# App Crash Diagnosis Guide

## Current Status
The app is crashing immediately on startup. Without logcat output, it's difficult to identify the exact cause.

## Critical Next Step: Get Logcat Output

**You MUST get logcat output to diagnose this crash properly.**

### Option 1: Use the PowerShell Script (Easiest)

1. Connect your Android device via USB
2. Enable USB Debugging in Developer Options
3. Run: `.\GET_LOGCAT.ps1`
4. Follow the prompts
5. Share the error output

### Option 2: Manual Logcat

```powershell
# Connect device, then run:
adb logcat -c
adb logcat > crash_log.txt

# Open the app, wait for crash, then stop logcat (Ctrl+C)
# Filter for errors:
Select-String -Path crash_log.txt -Pattern "FATAL|AndroidRuntime|Exception" -Context 5
```

### Option 3: Quick Error Check

```powershell
adb logcat -c
adb logcat | Select-String -Pattern "AndroidRuntime|FATAL|Error|Exception" -Context 5
```

Then open the app on your device.

## Common Crash Causes (Without Logs, Hard to Confirm)

1. **Firebase Native Module Not Linked**
   - Firebase SDK might be trying to access native code that isn't linked
   - Solution: May need to rebuild with proper native linking

2. **Missing Native Dependencies**
   - React Native modules might not be properly linked
   - Solution: Check if all native modules are installed

3. **JavaScript Bundle Error**
   - Syntax error or import error in JS code
   - Solution: Check Metro bundler output

4. **AsyncStorage Initialization**
   - AsyncStorage might fail to initialize on Android
   - Solution: Already handled with error catching

5. **Context Provider Error**
   - ThemeContext or AuthContext might be throwing during initialization
   - Solution: Already wrapped in ErrorBoundary

## What I've Already Fixed

✅ Firebase initialization non-blocking  
✅ Added null checks throughout AuthContext  
✅ Added ErrorBoundary component  
✅ Added React Native Gesture Handler import  
✅ Made context usage defensive  
✅ Added mockAuthService import  
✅ Improved error handling in App.tsx  

## Next Steps After Getting Logs

1. **Share the logcat output** - This will show the exact error
2. **I'll fix the specific issue** based on the error message
3. **Rebuild and test** - The fix should resolve the crash

## Without Logs, I Cannot Help Further

The crash could be:
- Native code crash (Java/Kotlin)
- JavaScript error during bundle loading
- Module initialization error
- Permission issue
- Resource loading error

**All of these require logcat output to diagnose properly.**

---

**Please run GET_LOGCAT.ps1 and share the output!**
