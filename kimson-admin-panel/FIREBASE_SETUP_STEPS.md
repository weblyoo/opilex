# 🔥 Firebase Setup Steps - Fix Package Name Mismatch

## ❌ Current Problem:
- Your Firebase app has package name: `com.opilexindia`
- Your actual app uses package name: `com.opilex.wireauth`
- **They don't match! Firebase won't work until they match.**

## ✅ Solution: Add New Android App in Firebase

### Step 1: Add New Android App to Firebase

1. **Go to Firebase Console:**
   - Open: https://console.firebase.google.com/project/opilex-3373e/settings/general

2. **Click "Add app" → Select Android:**
   - Look for the "Add app" button (usually at the top or in "Your apps" section)
   - Click it and select the Android icon (🟢 green Android robot)

3. **Enter App Details:**
   - **Android package name:** `com.opilex.wireauth` ⚠️ (MUST match exactly)
   - **App nickname (optional):** Opilex Wire Auth
   - **Debug signing certificate SHA-1 (optional):** Leave empty for now
   - Click **"Register app"**

4. **Skip Download:**
   - Firebase will offer to download `google-services.json`
   - For now, click **"Skip this step"** or **"Continue to console"**
   - (You can download it later if needed)

### Step 2: Add SHA Fingerprints

1. **Find Your New App:**
   - You should now see two Android apps:
     - `com.opilexindia` (old one - can ignore or delete later)
     - `com.opilex.wireauth` (new one - this is the one to use!)

2. **Click on `com.opilex.wireauth` app**

3. **Scroll to "SHA certificate fingerprints" section**

4. **Add SHA-1 Fingerprint:**
   - Click **"Add fingerprint"** button
   - Paste this:
     ```
     5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
     ```
   - Click **"Save"**

5. **Add SHA-256 Fingerprint:**
   - Click **"Add fingerprint"** button again
   - Paste this:
     ```
     FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
     ```
   - Click **"Save"**

6. **Verify:**
   - You should now see both fingerprints listed:
     - ✅ SHA-1: `5E:8F:16:06:2E:A3:...`
     - ✅ SHA-256: `FA:C6:17:45:DC:09:...`

### Step 3: Enable Phone Authentication (If Not Already Enabled)

1. **Go to Authentication:**
   - https://console.firebase.google.com/project/opilex-3373e/authentication/providers

2. **Click "Phone" provider**

3. **Enable it:**
   - Toggle it ON if not already enabled
   - For testing, you can enable "Phone numbers for testing" to add test numbers

4. **Click "Save"**

### Step 4: Wait and Rebuild

1. **Wait 5-10 minutes** for Firebase to process changes

2. **Rebuild your APK:**
   ```bash
   npx expo run:android
   ```

3. **Reinstall APK on your device**

4. **Test OTP sending** - it should work now! 🎉

---

## 📋 Summary Checklist

- [ ] Created new Android app in Firebase with package name: `com.opilex.wireauth`
- [ ] Added SHA-1 fingerprint to the new app
- [ ] Added SHA-256 fingerprint to the new app
- [ ] Verified Phone Authentication is enabled
- [ ] Waited 5-10 minutes
- [ ] Rebuilt APK
- [ ] Reinstalled APK
- [ ] Tested OTP sending

---

## 🔗 Quick Links

**Firebase Project Settings:**
- https://console.firebase.google.com/project/opilex-3373e/settings/general

**Firebase Authentication:**
- https://console.firebase.google.com/project/opilex-3373e/authentication/providers

---

## ⚠️ Important Notes

1. **Package names MUST match exactly:**
   - Firebase: `com.opilex.wireauth` ✅
   - Your App: `com.opilex.wireauth` ✅
   - They match! ✅

2. **You can keep or delete the old app:**
   - The old `com.opilexindia` app won't interfere
   - You can delete it later if you want, or just leave it

3. **Both fingerprints are required:**
   - SHA-1 ✅
   - SHA-256 ✅

4. **Changes take time:**
   - Firebase needs 5-10 minutes to propagate changes
   - Rebuild your APK after adding fingerprints

---

**After completing these steps, phone authentication should work!** 🚀

