# SafeAreaView Deprecation Fix

## Issue
React Native's `SafeAreaView` is deprecated. Need to use `react-native-safe-area-context` instead.

## Current Warning
```
SafeAreaView has been deprecated and will be removed in a future release.
Please use 'react-native-safe-area-context' instead.
```

## Files to Fix

### LanguageSelectionScreen.tsx

**Current (Line 6):**
```tsx
import { SafeAreaView } from 'react-native';
```

**Fix:**
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
```

**Wrapper Required:**
Also need to wrap the app in `SafeAreaProvider` in App.tsx or AppNavigator.tsx.

---

## Implementation Steps

### Step 1: Update LanguageSelectionScreen.tsx
```tsx
// Change import
import { SafeAreaView } from 'react-native-safe-area-context';
```

### Step 2: Wrap App in SafeAreaProvider

**In App.tsx (after line 197):**
```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

return (
  <SafeAreaProvider>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </SafeAreaProvider>
);
```

---

## Auto-Fix Script

Run this to fix automatically:
```powershell
# Search for all SafeAreaView imports
Get-ChildItem -Path src -Recurse -Include *.tsx | 
  Select-String -Pattern "SafeAreaView.*from 'react-native'" |
  ForEach-Object { $_.Path } | 
  Sort-Object -Unique
```

---

## Benefits of Fixing
1. ✅ Removes warning from console
2. ✅ Future-proof code
3. ✅ Better handling of notches/safe areas
4. ✅ More consistent across platforms

## Breaking Changes
None - `react-native-safe-area-context` is a drop-in replacement.

## Already Installed
✅ `react-native-safe-area-context@^5.6.1` is already in dependencies
