# 📱 Phone Authentication Setup for APK

## ✅ Code Implementation Complete

The phone authentication code is now ready to work on mobile APK. However, you need to complete Firebase configuration.

---

## 🔧 Required Setup Steps

### Step 1: Enable Phone Authentication in Firebase Console

1. Go to Firebase Console:
   ```
   https://console.firebase.google.com/project/opilex-2a79f/authentication/providers
   ```

2. Click on **"Phone"** in the Sign-in method providers list

3. Toggle **"Enable"** switch to **ON**

4. Click **"Save"**

---

### Step 2: Configure Android App in Firebase (REQUIRED for APK)

For phone authentication to work in your APK, you need to add your app's SHA fingerprints to Firebase.

#### Option A: Get SHA Fingerprints using PowerShell Script (Easiest)

**Windows:**
```powershell
.\get-sha-fingerprints.ps1
```

This will automatically run Gradle and show you the SHA fingerprints.

#### Option B: Get SHA Fingerprints using Gradle (Recommended)

```bash
cd android
./gradlew signingReport
# Or on Windows:
cd android
.\gradlew.bat signingReport
```

Look for `SHA1:` and `SHA256:` values in the output. They will be shown like:
```
Variant: debug
Config: debug
Store: C:\Users\...\debug.keystore
Alias: androiddebugkey
SHA1: A1:B2:C3:D4:...
SHA-256: AA:BB:CC:DD:...
```

#### Option C: Get SHA Fingerprints from Keystore

If you're using a release keystore:

```bash
cd android/app
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

#### Option D: Get SHA Fingerprints from Debug Keystore

For development/testing:

```bash
cd android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

---

### Step 3: Add SHA Fingerprints to Firebase

1. Go to Firebase Console:
   ```
   https://console.firebase.google.com/project/opilex-2a79f/settings/general/android:com.opilexapp
   ```

2. Scroll down to **"SHA certificate fingerprints"**

3. Click **"Add fingerprint"**

4. Add both **SHA-1** and **SHA-256** fingerprints

5. Click **"Save"**

---

### Step 4: Rebuild APK

After adding SHA fingerprints, you need to rebuild the APK:

```bash
# For development build
npx expo run:android

# Or build APK directly
cd android
./gradlew assembleRelease
```

---

## 🧪 Testing

1. **Enable Phone Auth** in Firebase Console (Step 1)
2. **Add SHA Fingerprints** (Step 2 & 3)
3. **Rebuild APK** (Step 4)
4. **Install APK** on your device
5. **Test Login** with your phone number

---

## ❌ Common Issues

### Issue: "INVALID_CAPTCHA" or "CAPTCHA required"

**Solution:**
- Make sure SHA fingerprints are added to Firebase Console
- Rebuild and reinstall the APK after adding fingerprints
- Ensure Phone auth is enabled in Firebase Console

### Issue: "Operation not allowed"

**Solution:**
- Go to Firebase Console → Authentication → Sign-in method
- Enable Phone authentication
- Click Save

### Issue: "Invalid phone number"

**Solution:**
- Use format: `9876543210` (10 digits, starts with 6-9)
- Or: `+919876543210` (with country code)
- Don't use: `09876543210` (starts with 0)

---

## 📝 Important Notes

1. **SHA Fingerprints are REQUIRED** for phone auth on Android
2. **Each APK build** (debug/release) needs its SHA fingerprints added
3. **After adding fingerprints**, you MUST rebuild and reinstall the APK
4. **Firebase needs time** to propagate the changes (wait 5-10 minutes)

---

## 🚀 Alternative: Use Cloud Functions

If phone auth still doesn't work after setup, you can use Firebase Cloud Functions:

1. Create a Cloud Function to handle phone auth
2. Update `sendOTP` to call the Cloud Function instead
3. This bypasses reCAPTCHA requirements

---

## ✅ Verification Checklist

- [ ] Phone authentication enabled in Firebase Console
- [ ] SHA-1 fingerprint added to Firebase
- [ ] SHA-256 fingerprint added to Firebase  
- [ ] APK rebuilt after adding fingerprints
- [ ] APK reinstalled on device
- [ ] Phone number format correct (10 digits, starts with 6-9)

---

**After completing these steps, phone authentication should work in your APK!** 🎉

