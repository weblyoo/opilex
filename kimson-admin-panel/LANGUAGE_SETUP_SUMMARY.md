# Language Setup Summary - Opilex App

## ✅ What Was Fixed

### 1. Language Selection Screen Now Saves Language
**File:** `src/screens/LanguageSelectionScreen.tsx`

**Before:** Language selection was not being saved when user pressed "Next"

**After:** 
- Language is now saved to AsyncStorage when user selects and presses "Next"
- Saved language is loaded when screen mounts
- Language is set in i18n system immediately

**Changes:**
- Added `useEffect` to load saved language on mount
- Updated `handleNext` to save language to storage and update i18n

### 2. Language Initialization on App Startup
**File:** `App.tsx`

**Before:** Language preference was not being loaded on app startup

**After:**
- Language is initialized early in app startup (before fonts load)
- Saved language preference is restored automatically

**Changes:**
- Added `initializeLanguage()` call in `prepare()` function

## 📋 Current Language Support

The app supports **4 languages**:

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `hi` | Hindi | हिंदी |
| `mr` | Marathi | मराठी |
| `gu` | Gujarati | ગુજરાતી |

## 🔧 How It Works

### Language Flow

1. **App Startup** (`App.tsx`)
   - Calls `initializeLanguage()` which loads saved language from storage
   - Sets the current language in i18n system

2. **Language Selection Screen**
   - User selects a language
   - On "Next", language is saved to AsyncStorage
   - Language is set in i18n system
   - User navigates to Welcome screen

3. **Using Translations in Screens**
   - Import `t` function: `import { t } from '../utils/i18n';`
   - Use translation keys: `<Text>{t('welcome')}</Text>`

### Storage

- **Storage Key:** `selectedLanguage`
- **Storage Location:** AsyncStorage
- **Default:** `'en'` (English)

## 📝 Available Translation Keys

Current translations in `src/utils/i18n.ts`:

### Common
- `welcome` - Welcome message
- `next` - Next button
- `back` - Back button
- `save` - Save button
- `cancel` - Cancel button

### Authentication
- `login` - Login
- `phoneNumber` - Phone Number
- `enterOTP` - Enter OTP
- `verifyOTP` - Verify OTP

### Registration
- `registerAsElectrician` - Register as Electrician
- `registerAsDealer` - Register as Dealer

### KYC
- `kycVerification` - KYC Verification
- `aadharNumber` - Aadhar Number

### Dashboard
- `dashboard` - Dashboard
- `scanWire` - Scan Wire
- `myRewards` - My Rewards
- `wallet` - Wallet
- `profile` - Profile

### Wire Authentication
- `authenticateWire` - Authenticate Wire
- `scanQRCode` - Scan QR Code
- `enterManually` - Enter Manually

### Rewards
- `totalPoints` - Total Points
- `earnedPoints` - Earned Points

### Language Selection
- `selectLanguage` - Select Language
- `english` - English
- `hindi` - Hindi
- `marathi` - Marathi
- `gujarati` - Gujarati

## 🚀 How to Use Translations

### Step 1: Import the translation function

```typescript
import { t } from '../utils/i18n';
```

### Step 2: Use in your component

```typescript
// Before (hardcoded)
<Text>Welcome</Text>

// After (translated)
<Text>{t('welcome')}</Text>
```

### Step 3: Add missing translations

If you need a new translation key:

1. Add to `src/utils/i18n.ts`:
```typescript
export const translations: Translations = {
  // ... existing translations
  myNewKey: {
    en: 'English text',
    hi: 'हिंदी पाठ',
    mr: 'मराठी मजकूर',
    gu: 'ગુજરાતી ટેક્સ્ટ',
  },
};
```

2. Use in your component:
```typescript
<Text>{t('myNewKey')}</Text>
```

## 🔄 Changing Language Programmatically

To change language from code (e.g., in Settings screen):

```typescript
import { setLanguage as saveLanguage } from '../utils/storage';
import { setLanguage as setI18nLanguage } from '../utils/i18n';

const changeLanguage = async (newLanguage: 'en' | 'hi' | 'mr' | 'gu') => {
  await saveLanguage(newLanguage);
  setI18nLanguage(newLanguage);
  // Note: You may need to force a re-render or use a context for reactive updates
};
```

## 📱 Testing

### Test Language Selection
1. Open app
2. Select a language (e.g., Hindi)
3. Press "Next"
4. Close app completely
5. Reopen app
6. Verify language persists

### Test All Languages
1. Test each language: English, Hindi, Marathi, Gujarati
2. Verify text displays correctly
3. Check for missing translations (console warnings)

## ⚠️ Important Notes

### Current Limitations

1. **No Reactive Updates**
   - Changing language doesn't automatically update all screens
   - Screens need to be remounted or use a context for reactive updates
   - Consider creating a `LanguageContext` similar to `ThemeContext` for better reactivity

2. **Not All Screens Use Translations**
   - Most screens still have hardcoded English text
   - Gradually migrate screens to use `t()` function

3. **Missing Translations**
   - Some UI strings may not have translations yet
   - Add them to `i18n.ts` as needed

### Best Practices

1. **Always use translation keys** - Never hardcode user-facing strings
2. **Add fallback to English** - The `t()` function already does this
3. **Test all languages** - Verify UI works in all supported languages
4. **Use descriptive keys** - e.g., `dashboard.scanWire` instead of `scan1`
5. **Group translations** - Organize by feature/screen in comments

## 🔮 Future Improvements

### Recommended Enhancements

1. **Create LanguageContext**
   - Similar to ThemeContext
   - Provides reactive language updates
   - Components re-render when language changes

2. **Add Language Switcher in Profile**
   - Allow users to change language after initial selection
   - Update all screens immediately

3. **Add More Translation Keys**
   - Migrate all hardcoded strings to translations
   - Add translations for all screens

4. **Add More Languages**
   - Tamil, Telugu, Kannada, etc.
   - Follow the pattern in the guide

## 📚 Related Files

- `src/utils/i18n.ts` - Translation system
- `src/utils/storage.ts` - Language storage
- `src/screens/LanguageSelectionScreen.tsx` - Language selection UI
- `App.tsx` - Language initialization
- `LANGUAGE_SETUP_GUIDE.md` - Detailed setup guide

## ✅ Checklist

- [x] Language selection saves to storage
- [x] Language loads on app startup
- [x] Language selection screen loads saved language
- [ ] All screens use translations (in progress)
- [ ] Language switcher in Profile/Settings (future)
- [ ] LanguageContext for reactive updates (future)

