# 🔥 Firebase Auth Error - Complete Solutions Guide

**Comprehensive guide to fix Firebase Phone Authentication errors**

---

## 🚨 Quick Diagnosis

### Check Your Error Code

Look in console for:
```
❌ Firebase Auth Error [sendOTP]: { code: 'auth/...' }
```

---

## 📋 Error Codes & Solutions

### 1. `auth/operation-not-allowed` ⚠️ MOST COMMON

**Meaning:** Phone Authentication provider is not enabled

**Solution:**
```
1. Go to: https://console.firebase.google.com/project/opilex-3373e/authentication/providers
2. Click "Phone"
3. Toggle "Enable" ON
4. Click "Save"
5. Try again
```

**Status Check:**
- Firebase Console → Authentication → Sign-in method
- Phone should show "Enabled" ✅

---

### 2. `auth/invalid-phone-number`

**Meaning:** Phone number format is incorrect

**Solution:**
- ✅ Use: `9876543210` (10 digits, starts with 6-9)
- ✅ Use: `+919876543210` (with country code)
- ❌ Don't use: `09876543210` (starts with 0)
- ❌ Don't use: `987654321` (9 digits)

**Validation:**
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9
- Country code (+91) is added automatically

---

### 3. `auth/missing-recaptcha-token` or `auth/captcha-check-failed`

**Meaning:** reCAPTCHA verification failed

**Solutions:**

**For Web:**
1. Refresh the page
2. Check browser console for reCAPTCHA errors
3. Disable ad blockers (uBlock, AdBlock, etc.)
4. Ensure `recaptcha-container` div exists (handled automatically)
5. Try in incognito mode

**For Mobile (React Native/Expo):**
- Firebase JS SDK may not work perfectly on mobile
- Consider using `@react-native-firebase/auth` (requires ejecting from Expo)
- Or use Expo's phone auth: `expo-auth-session`

**Workaround:**
- The code already tries to handle this with fallback reCAPTCHA
- If it still fails, you may need React Native Firebase

---

### 4. `auth/quota-exceeded`

**Meaning:** SMS quota exceeded (free tier limit)

**Solutions:**
1. **Use Test Phone Numbers** (Recommended for Development):
   - Firebase Console → Authentication → Sign-in method → Phone
   - Scroll to "Phone numbers for testing"
   - Add: `+91XXXXXXXXXX`
   - OTP appears in console (not SMS) - FREE & UNLIMITED

2. **Upgrade to Blaze Plan:**
   - Firebase Console → Usage and Billing
   - Upgrade to Blaze (pay-as-you-go)
   - ~$0.01-0.05 per SMS

3. **Wait for Quota Reset:**
   - Free tier resets daily
   - Check quota in Firebase Console

---

### 5. `auth/too-many-requests`

**Meaning:** Rate limiting - too many OTP requests

**Solutions:**
- Wait 5-10 minutes before retrying
- Use test phone numbers (no rate limit)
- Implement rate limiting in your app
- Add delay between requests

---

### 6. `auth/invalid-verification-code`

**Meaning:** Wrong OTP entered

**Solutions:**
- Check OTP entered correctly (6 digits)
- Ensure OTP matches the one sent
- Request new OTP if unsure
- Check for typos

---

### 7. `auth/code-expired`

**Meaning:** OTP expired (usually 5-10 minutes)

**Solutions:**
- Request a new OTP
- Enter OTP within time limit
- Check phone for latest OTP (if multiple sent)

---

### 8. `auth/session-expired`

**Meaning:** Verification session expired

**Solutions:**
- Request new OTP
- Complete verification within session time
- Don't leave app idle for too long

---

### 9. `auth/app-not-authorized`

**Meaning:** App not authorized in Firebase

**Solutions:**
1. Check Firebase Console → Project Settings
2. Verify app is registered
3. Check API keys are correct
4. Ensure `google-services.json` is in place (Android)
5. Rebuild app

---

### 10. `auth/invalid-app-credential`

**Meaning:** Invalid app credentials

**Solutions:**
1. Verify Firebase config in `src/config/firebase.ts`
2. Check API keys are correct
3. Ensure app is registered in Firebase Console
4. Download fresh `google-services.json` (Android)

---

## 🔍 React Native/Expo Specific Issues

### Issue: Firebase JS SDK Not Working on Mobile

**Problem:** Firebase JS SDK (`firebase/auth`) is primarily designed for web. On React Native/Expo, it may have limitations.

**Solutions:**

#### Option 1: Use React Native Firebase (Requires Ejecting)

```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

Then use:
```typescript
import auth from '@react-native-firebase/auth';

const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
```

**Note:** Requires ejecting from Expo managed workflow.

#### Option 2: Use Expo Auth Session (Expo Managed)

```bash
npm install expo-auth-session expo-crypto
```

Use Expo's built-in phone authentication.

#### Option 3: Keep Current Implementation (May Work)

The current implementation tries Firebase JS SDK first, with reCAPTCHA fallback. This may work in some Expo setups.

---

## 🛠️ Diagnostic Steps

### Step 1: Run Diagnostics

The app automatically runs diagnostics in development mode. Check console for:

```
🔍 Firebase Auth Diagnostics
==========================
1. ✅ Firebase Auth is initialized
2. ✅ reCAPTCHA container exists
3. ✅ Valid phone number format
==========================
```

### Step 2: Check Firebase Console

1. **Authentication → Users:**
   - See if authentication attempts are logged
   - Check for error messages

2. **Authentication → Sign-in method:**
   - Verify Phone is enabled
   - Check test phone numbers

3. **Project Settings:**
   - Verify project is active
   - Check API keys

### Step 3: Check App Logs

Look for detailed error logs:
```
❌ Firebase Auth Error [sendOTP]: {
  code: 'auth/error-code',
  message: '...',
  platform: 'ios' | 'android' | 'web',
  ...
}
```

---

## ✅ Quick Fix Checklist

- [ ] Phone Auth enabled in Firebase Console
- [ ] Phone number format correct (10 digits, starts with 6-9)
- [ ] Test with test phone number first
- [ ] Check console for exact error code
- [ ] Verify Firebase config is correct
- [ ] Check network connectivity
- [ ] Try refreshing/restarting app

---

## 🎯 Most Likely Solutions

**90% of errors are fixed by:**

1. **Enable Phone Auth** → `auth/operation-not-allowed`
2. **Fix phone format** → `auth/invalid-phone-number`
3. **Use test numbers** → Avoids quota/rate limit issues

---

## 📞 Need More Help?

Share these details:
1. **Exact error code** (from console)
2. **Error message** (full message)
3. **Platform** (iOS/Android/Web)
4. **When it occurs** (sending OTP or verifying OTP)
5. **Console logs** (full error object)

---

**The enhanced error handling will now show you exactly what's wrong!**

