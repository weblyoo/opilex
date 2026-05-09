# 📱 Getting SHA Fingerprints for EAS Builds

## ⚠️ Important: Two Different Keystores!

There are **TWO different scenarios** and each needs different SHA fingerprints:

### 1. **Local Development Builds** (`npx expo run:android`)
- Uses: `android/app/debug.keystore` (local file)
- SHA Fingerprints we already found:
  - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
  - SHA-256: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

### 2. **EAS Builds** (`npx eas-cli build`)
- Uses: EAS-managed keystore (different from local)
- **Different SHA fingerprints needed!**

---

## 🔍 Get EAS Keystore SHA Fingerprints

### Option 1: Using EAS Credentials Command (Recommended)

1. **Check if EAS CLI is installed:**
   ```bash
   npx eas-cli --version
   ```

2. **Login to EAS (if not already):**
   ```bash
   npx eas-cli login
   ```

3. **Get credentials for Android:**
   ```bash
   npx eas-cli credentials
   ```
   - Select: `Android`
   - Select: `Preview` (or `Production` if that's what you're building)
   - It will show you the keystore information including SHA fingerprints!

### Option 2: Build and Check (Alternative)

If the credentials command doesn't work, you can:

1. **Build the APK with EAS:**
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

2. **After build completes, get the SHA fingerprints from the build output:**
   - EAS sometimes displays them in the build logs
   - Or download the APK and extract signatures using `apksigner` or `jarsigner`

3. **Or use EAS credentials after first build:**
   - After your first EAS build, EAS will have created credentials
   - Run `npx eas-cli credentials` again to see them

---

## 📋 Step-by-Step: Get EAS Fingerprints

### Quick Method:

```bash
# 1. Login to EAS
npx eas-cli login

# 2. View credentials
npx eas-cli credentials

# Follow the prompts:
# - Select: Android
# - Select: Preview (or Production)
# - Look for "SHA-1" and "SHA-256" fingerprints
```

---

## ✅ What to Do Next

### For Local Development Testing:
- ✅ **Use the debug keystore fingerprints** (already have them)
- ✅ Add them to Firebase Console for `com.kimson.wireauth`
- ✅ Test with `npx expo run:android`

### For EAS Build Testing:
- ⚠️ **Need EAS keystore fingerprints** (different from debug!)
- ⚠️ Add EAS fingerprints to Firebase Console for `com.kimson.wireauth`
- ⚠️ Test with EAS-built APK

### Best Practice: Add BOTH Sets!
- Add debug keystore fingerprints (for local dev)
- Add EAS keystore fingerprints (for EAS builds)
- This way both will work!

---

## 🔗 EAS Documentation

For more details, see:
- https://docs.expo.dev/app-signing/managed-credentials/
- https://docs.expo.dev/build-reference/apk/

---

## 🚀 Quick Command Reference

```bash
# Login to EAS
npx eas-cli login

# View credentials (shows SHA fingerprints)
npx eas-cli credentials

# Build preview APK
npx eas-cli build --platform android --profile preview

# Build production AAB
npx eas-cli build --platform android --profile production
```

---

**Note:** The `eas-cli build` command will create the keystore and show fingerprints in the credentials, but the easiest way is to run `npx eas-cli credentials` directly!

