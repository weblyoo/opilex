# Language Setup Guide for Kimson App

## Overview

The Kimson app supports **4 languages**:
- **English** (en) - Default
- **Hindi** (हिंदी) (hi)
- **Marathi** (मराठी) (mr)
- **Gujarati** (ગુજરાતી) (gu)

## Current Implementation Status

### ✅ What's Already Set Up

1. **i18n System** (`src/utils/i18n.ts`)
   - Translation dictionary with common UI strings
   - Language switching functions
   - Translation function `t(key)` for getting translated strings

2. **Language Selection Screen** (`src/screens/LanguageSelectionScreen.tsx`)
   - UI for selecting language
   - Shows all 4 languages with native names

3. **Storage System** (`src/utils/storage.ts`)
   - Functions to save/load language preference
   - Uses AsyncStorage for persistence

4. **Navigation Integration**
   - LanguageSelection screen is in the navigation flow
   - App navigates to LanguageSelection after Splash screen

### ⚠️ What Needs to Be Fixed

1. **Language Not Being Saved**
   - The `handleNext` function in LanguageSelectionScreen doesn't save the selected language
   - Need to call `setLanguage` from storage utils

2. **Language Not Being Initialized**
   - `initializeLanguage()` is not called in App.tsx
   - Need to initialize language on app startup

3. **Translations Not Being Used**
   - Most screens are using hardcoded English text
   - Need to replace hardcoded strings with `t()` function calls

## Setup Instructions

### Step 1: Fix Language Selection Screen

The language selection screen needs to save the selected language when "Next" is pressed.

**File:** `src/screens/LanguageSelectionScreen.tsx`

**Fix needed:**
```typescript
const handleNext = async () => {
  // Save the selected language
  const { setLanguage: saveLanguage } = await import('../utils/storage');
  const { setLanguage: setI18nLanguage } = await import('../utils/i18n');
  
  await saveLanguage(selectedLanguage);
  setI18nLanguage(selectedLanguage);
  
  navigation.navigate('Welcome');
};
```

### Step 2: Initialize Language on App Startup

**File:** `App.tsx`

**Add language initialization:**
```typescript
import { initializeLanguage } from './src/utils/i18n';

// In the prepare() function:
await initializeLanguage();
```

### Step 3: Use Translations in Screens

Replace hardcoded strings with translation keys.

**Example - Before:**
```typescript
<Text>Welcome</Text>
```

**Example - After:**
```typescript
import { t } from '../utils/i18n';

<Text>{t('welcome')}</Text>
```

### Step 4: Add More Translation Keys

Add missing translations to `src/utils/i18n.ts` for all UI strings used in your app.

## How to Add a New Language

### Step 1: Update Type Definitions

**File:** `src/utils/i18n.ts`

```typescript
export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu' | 'ta'; // Add new code
```

### Step 2: Add Language to Translations

```typescript
export const translations: Translations = {
  welcome: {
    en: 'Welcome',
    hi: 'स्वागत है',
    mr: 'स्वागत आहे',
    gu: 'સ્વાગત છે',
    ta: 'வரவேற்பு', // Add new translation
  },
  // ... add for all keys
};
```

### Step 3: Update Language Selection Screen

**File:** `src/screens/LanguageSelectionScreen.tsx`

```typescript
const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }, // Add new language
];
```

### Step 4: Update Storage Types

**File:** `src/utils/storage.ts`

```typescript
export const setLanguage = async (language: 'en' | 'hi' | 'mr' | 'gu' | 'ta'): Promise<void> => {
  await setItem(STORAGE_KEYS.LANGUAGE, language);
};

export const getLanguage = async (): Promise<'en' | 'hi' | 'mr' | 'gu' | 'ta'> => {
  const language = await getItem(STORAGE_KEYS.LANGUAGE);
  return (language as 'en' | 'hi' | 'mr' | 'gu' | 'ta') || 'en';
};
```

## Testing Language Setup

1. **Test Language Selection:**
   - Open app → Select language → Press Next
   - Close and reopen app
   - Verify selected language persists

2. **Test Language Switching:**
   - Go to Profile/Settings (if available)
   - Change language
   - Verify UI updates immediately

3. **Test All Languages:**
   - Test each language (en, hi, mr, gu)
   - Verify text displays correctly
   - Check for missing translations (console warnings)

## Common Issues & Solutions

### Issue: Language not persisting after app restart
**Solution:** Ensure `setLanguage` is called in LanguageSelectionScreen and `initializeLanguage` is called in App.tsx

### Issue: Translations not updating when language changes
**Solution:** Use a context or state management to trigger re-renders when language changes

### Issue: Missing translations showing as keys
**Solution:** Add missing keys to translations object in i18n.ts

### Issue: Text not displaying correctly in Hindi/Marathi/Gujarati
**Solution:** Ensure fonts support these languages (Ubuntu font should work)

## Best Practices

1. **Always use translation keys** - Never hardcode user-facing strings
2. **Add fallback to English** - If translation missing, show English
3. **Test all languages** - Verify UI works in all supported languages
4. **Keep translations organized** - Group by feature/screen
5. **Use descriptive keys** - e.g., `dashboard.scanWire` instead of `scan1`

## Files to Update for Full i18n Support

To make the entire app multilingual, update these screens to use `t()`:

- [ ] WelcomeScreen
- [ ] LoginScreen
- [ ] OTPVerificationScreen
- [ ] RegistrationTypeScreen
- [ ] RegistrationDetailsScreen
- [ ] RegistrationScreen
- [ ] KYCScreen
- [ ] GSTVerificationScreen
- [ ] DashboardScreen
- [ ] WireAuthenticationScreen
- [ ] RewardsScreen
- [ ] ProfileScreen
- [ ] All other screens

## Next Steps

1. Fix LanguageSelectionScreen to save language
2. Initialize language in App.tsx
3. Gradually replace hardcoded strings with translations
4. Add language switcher in Profile/Settings screen
5. Test thoroughly in all languages

