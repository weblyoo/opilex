# 📱 How to Add SHA Fingerprints to Firebase Console

## Step-by-Step Guide

### Step 1: Get Your SHA Fingerprints

#### Option A: Using the PowerShell Script (Easiest)

1. Open PowerShell in the project root directory
2. Run:
   ```powershell
   .\get-sha-fingerprints.ps1
   ```
3. Look for output like this:
   ```
   SHA1: A1:B2:C3:D4:E5:F6:...
   SHA-256: AA:BB:CC:DD:EE:FF:...
   ```
4. **Copy both fingerprints** - you'll need them in the next step

#### Option B: Using Gradle Command

1. Open terminal/command prompt
2. Navigate to android folder:
   ```bash
   cd android
   ```
3. Run:
   ```bash
   .\gradlew.bat signingReport
   ```
   (On Mac/Linux: `./gradlew signingReport`)

4. Look for the output section that shows:
   ```
   Variant: debug
   Config: debug
   Store: C:\Users\...\debug.keystore
   Alias: androiddebugkey
   SHA1: A1:B2:C3:D4:E5:F6:...
   SHA-256: AA:BB:CC:DD:EE:FF:...
   ```

5. **Copy both the SHA1 and SHA-256 values**

---

### Step 2: Add Fingerprints to Firebase Console

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/opilex-3373e/settings/general

2. **Find Your Android App:**
   - Scroll down to the "Your apps" section
   - Look for the Android app with package name: `com.opilex.wireauth`
   - If you don't see it, you may need to register it first (see Step 3 below)

3. **Click on the Android App:**
   - Click on the Android app card/row

4. **Scroll to "SHA certificate fingerprints":**
   - Look for the section titled "SHA certificate fingerprints"
   - You'll see two input fields or a button to "Add fingerprint"

5. **Add SHA-1 Fingerprint:**
   - Click "Add fingerprint" (or the + button)
   - Paste your SHA-1 fingerprint (format: `A1:B2:C3:D4:E5:F6:...`)
   - Click "Save" or "Add"

6. **Add SHA-256 Fingerprint:**
   - Click "Add fingerprint" again
   - Paste your SHA-256 fingerprint (format: `AA:BB:CC:DD:EE:FF:...`)
   - Click "Save" or "Add"

7. **Verify:**
   - You should now see both fingerprints listed
   - They should look like:
     - SHA-1: `A1:B2:C3:D4:...`
     - SHA-256: `AA:BB:CC:DD:...`

---

### Step 3: Register Android App (If Not Already Registered)

If you don't see your Android app in Firebase Console:

1. **Go to Project Settings:**
   - https://console.firebase.google.com/project/opilex-3373e/settings/general

2. **Click "Add app" → Select Android:**
   - Look for the "Add app" button
   - Click it and select the Android icon

3. **Enter App Details:**
   - **Android package name:** `com.opilex.wireauth`
   - **App nickname (optional):** Opilex App
   - **Debug signing certificate SHA-1 (optional):** Leave empty for now
   - Click "Register app"

4. **Download `google-services.json`:**
   - Firebase will generate a `google-services.json` file
   - You don't need to download it for this setup, but you can if needed
   - Click "Next" → "Continue to console"

5. **Now go back to Step 2** to add the SHA fingerprints

---

### Step 4: Verify Setup

After adding the fingerprints:

1. **Wait 2-5 minutes** for Firebase to process the changes

2. **Rebuild your APK:**
   ```bash
   npx expo run:android
   ```
   Or build APK:
   ```bash
   cd android
   .\gradlew.bat assembleRelease
   ```

3. **Reinstall the APK** on your device

4. **Test OTP sending** - it should now work!

---

## 🔗 Direct Links

**Firebase Project Settings:**
- https://console.firebase.google.com/project/opilex-3373e/settings/general

**Firebase Authentication Providers:**
- https://console.firebase.google.com/project/opilex-3373e/authentication/providers

**Firebase Android App Settings (if app is registered):**
- https://console.firebase.google.com/project/opilex-3373e/settings/general/android:com.opilex.wireauth

---

## ⚠️ Important Notes

1. **Each build type needs its own fingerprints:**
   - Debug build → Debug keystore fingerprints
   - Release build → Release keystore fingerprints

2. **If you use different keystores:**
   - You need to add fingerprints for each keystore

3. **Changes take effect after:**
   - Adding fingerprints to Firebase Console
   - Rebuilding the APK
   - Reinstalling on device

4. **For Expo Go:**
   - Expo Go uses Expo's own keystore
   - You need to add Expo's SHA fingerprints
   - Or use a development build instead

---

## 🐛 Troubleshooting

### Issue: Can't find SHA fingerprints in Gradle output
**Solution:**
- Make sure you're in the `android` directory
- Try: `.\gradlew.bat clean signingReport`

### Issue: Fingerprints not showing in Firebase Console
**Solution:**
- Make sure you're viewing the correct Android app
- Check that the package name matches: `com.opilex.wireauth`
- Try refreshing the page

### Issue: Still getting MISSING_CLIENT_IDENTIFIER error
**Solution:**
- Wait 5-10 minutes after adding fingerprints
- Rebuild the APK completely (clean build)
- Reinstall the APK on your device
- Make sure you added both SHA-1 AND SHA-256

---

## ✅ Checklist

- [ ] Got SHA-1 fingerprint from Gradle
- [ ] Got SHA-256 fingerprint from Gradle
- [ ] Opened Firebase Console project settings
- [ ] Found/registered Android app (`com.opilex.wireauth`)
- [ ] Added SHA-1 fingerprint to Firebase
- [ ] Added SHA-256 fingerprint to Firebase
- [ ] Waited 5 minutes for changes to propagate
- [ ] Rebuilt APK
- [ ] Reinstalled APK on device
- [ ] Tested OTP sending

---

**After completing these steps, phone authentication should work on your Android APK!** 🎉

