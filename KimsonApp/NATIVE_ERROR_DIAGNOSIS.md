# Native Error Diagnosis Guide

## Why Errors Don't Show in Console

The error `java.lang.String cannot be cast to java.lang.Boolean` is a **native Android error** happening in the Java/Kotlin code, not in JavaScript. This is why it doesn't appear in the JavaScript console.

## The Problem

When React Native's new architecture passes props from JavaScript to native Android components, it expects:
- Boolean props → actual boolean values
- String props → actual string values

If a string is passed where a boolean is expected, the native code throws:
```
java.lang.String cannot be cast to java.lang.Boolean
```

## How to Capture Native Errors

### Method 1: Use Logcat (Recommended)

1. **Connect your Android device** via USB
2. **Enable USB debugging** on your device
3. **Run the script**:
   ```powershell
   .\GET_NATIVE_ERRORS.ps1
   ```
4. **Reproduce the error** in the app
5. **Check the logcat output** for the full stack trace

### Method 2: Manual Logcat

```bash
# Clear logcat
adb logcat -c

# Filter for errors
adb logcat | grep -i "string cannot be cast"

# Or get all React Native errors
adb logcat | grep -i "ReactNative"
```

### Method 3: Android Studio Logcat

1. Open Android Studio
2. Connect device
3. Open Logcat tab
4. Filter by: `ReactNative` or `AndroidRuntime`
5. Look for the error with full stack trace

## What to Look For

The logcat output will show:
```
E AndroidRuntime: FATAL EXCEPTION: main
E AndroidRuntime: java.lang.ClassCastException: java.lang.String cannot be cast to java.lang.Boolean
E AndroidRuntime:     at com.facebook.react.uimanager.ViewManager.setProperty(ViewManager.java:642)
E AndroidRuntime:     at com.facebook.react.uimanager.UIManagerModule.updateProperties(UIManagerModule.java:35)
E AndroidRuntime:     at com.facebook.react.uimanager.UIManagerModule.createViewInstance(UIManagerModule.java:7)
...
```

This will tell us:
- **Which ViewManager** is causing the error
- **Which property** is receiving the wrong type
- **Which component** is being created

## Common Causes

1. **Boolean prop passed as string** from JavaScript
2. **Conditional expression** evaluating to string instead of boolean
3. **State variable** being a string when it should be boolean
4. **Props spreading** passing string values to boolean props

## Next Steps

1. **Run GET_NATIVE_ERRORS.ps1** to capture the error
2. **Reproduce the error** in the app
3. **Copy the complete logcat output**
4. **Share the stack trace** - it will show exactly which component and prop is causing the issue

---

**The native error won't show in JavaScript console because it's happening in Android native code, not JavaScript!**
