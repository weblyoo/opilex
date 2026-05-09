# Briller Bold Font Setup Instructions

## Overview
The splash screen rolling "KIMSON" text is configured to use the **Briller Bold** font from Adobe Typekit.

---

## Steps to Add Briller Bold Font

### Step 1: Download the Font File

Since this is a React Native app (not web), you need the actual font files, not the web link.

**Option A: From Adobe Fonts**
1. Go to https://fonts.adobe.com/
2. Search for "Briller"
3. Download the font family
4. Extract the **Briller-Bold.ttf** or **Briller-Bold.otf** file

**Option B: Purchase/License**
If Briller is not available through Adobe Fonts with your account, you'll need to:
1. Purchase a license from the font foundry
2. Download the font files

---

### Step 2: Add Font File to Project

1. Create a fonts folder in assets:
   ```
   KimsonApp/assets/fonts/
   ```

2. Copy the font file:
   ```
   KimsonApp/assets/fonts/Briller-Bold.ttf
   ```
   OR
   ```
   KimsonApp/assets/fonts/Briller-Bold.otf
   ```

---

### Step 3: Update App.tsx

Open `KimsonApp/App.tsx` and find the font loading section (around line 25-33).

**Uncomment this line:**
```typescript
// 'Briller-Bold': require('./assets/fonts/Briller-Bold.ttf'),
```

**Should become:**
```typescript
'Briller-Bold': require('./assets/fonts/Briller-Bold.ttf'),
```

**Full updated section:**
```typescript
await Font.loadAsync({
  'Ubuntu-Light': Ubuntu_300Light,
  'Ubuntu-Regular': Ubuntu_400Regular,
  'Ubuntu-Medium': Ubuntu_500Medium,
  'Ubuntu-Bold': Ubuntu_700Bold,
  'Briller-Bold': require('./assets/fonts/Briller-Bold.ttf'),
});
```

---

### Step 4: Update Splash Screen

Open `KimsonApp/src/screens/SplashScreen.tsx` and find the `logoLetter` style (around line 249).

**Change:**
```typescript
fontFamily: 'Ubuntu-Bold', // Will be 'Briller-Bold' when you add the font file
```

**To:**
```typescript
fontFamily: 'Briller-Bold',
```

---

### Step 5: Test the Font

1. Clear cache and restart:
   ```bash
   cd KimsonApp
   npx expo start --clear
   ```

2. Run on device/simulator:
   ```bash
   npx expo run:android
   # OR
   npx expo run:ios
   ```

---

## Current Configuration

### Font Specifications
- **Font Family:** Briller Bold
- **Font Weight:** 700 (Bold)
- **Font Style:** Normal
- **Letter Spacing:** 2px
- **Font Size:** 58px
- **Text Shadow:** Enhanced for depth

### Fallback Font
Currently using **Ubuntu-Bold** as fallback until Briller font is added.

---

## File Structure

```
KimsonApp/
├── assets/
│   └── fonts/              ← Create this folder
│       └── Briller-Bold.ttf ← Add font file here
├── App.tsx                  ← Uncomment font loading line
└── src/
    └── screens/
        └── SplashScreen.tsx ← Change fontFamily to 'Briller-Bold'
```

---

## Alternative: Use Similar Font

If you can't get Briller Bold, here are similar bold display fonts:

### Option 1: Keep Ubuntu Bold (Current)
- Already installed
- Modern, bold appearance
- Free and open source

### Option 2: Montserrat Black
```bash
npm install @expo-google-fonts/montserrat
```

Then in App.tsx:
```typescript
import { Montserrat_900Black } from '@expo-google-fonts/montserrat';

'Montserrat-Black': Montserrat_900Black,
```

### Option 3: Raleway Black
```bash
npm install @expo-google-fonts/raleway
```

Then in App.tsx:
```typescript
import { Raleway_900Black } from '@expo-google-fonts/raleway';

'Raleway-Black': Raleway_900Black,
```

---

## Troubleshooting

### Font Not Loading
**Issue:** Font doesn't appear after adding file
**Solution:**
1. Clear cache: `npx expo start --clear`
2. Rebuild app: `npx expo run:android` or `npx expo run:ios`
3. Check file path is correct
4. Ensure font file name matches exactly

### Font File Not Found Error
**Issue:** Error: "Unable to resolve module"
**Solution:**
1. Verify font file exists in `assets/fonts/`
2. Check file extension (.ttf vs .otf)
3. Update require path in App.tsx to match exact filename

### Font Looks Different
**Issue:** Font doesn't look bold enough
**Solution:**
- Try using the actual Briller Bold variant
- Adjust `fontWeight` in splash screen styles
- Increase `fontSize` or `letterSpacing`

---

## Web Font Note

⚠️ **Important:** The web font link you provided:
```html
<link rel="stylesheet" href="https://use.typekit.net/ejj2plt.css">
```

**Does NOT work in React Native!**

React Native apps need:
- ✅ Actual font files (.ttf or .otf)
- ✅ Font loaded via expo-font
- ❌ NOT web font links
- ❌ NOT CSS stylesheets

---

## License Considerations

⚠️ **Important:** Ensure you have proper licensing for the Briller font:
- Adobe Fonts subscription includes desktop use
- Mobile app use may require different licensing
- Check the font's license agreement
- Purchase commercial license if needed

---

## Support

If you need help:
1. Check that font file is in correct location
2. Verify font name matches exactly
3. Clear cache and rebuild
4. Check Expo documentation: https://docs.expo.dev/develop/user-interface/fonts/

---

**Status:** ✅ Configured (waiting for font file)
**Current Font:** Ubuntu-Bold (fallback)
**Target Font:** Briller Bold
**Ready to Switch:** Yes (just add font file and uncomment code)

