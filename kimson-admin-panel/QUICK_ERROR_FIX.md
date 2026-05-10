# 🚨 Quick Firebase Auth Error Fix

**Common errors and immediate solutions**

---

## 🔍 Step 1: Identify the Error

Check your console/logs for the error code. Look for:
```
❌ Firebase Auth Error [sendOTP]: { code: 'auth/...', message: '...' }
```

---

## ⚡ Quick Fixes by Error Code

### `auth/operation-not-allowed` ⚠️ MOST COMMON

**Fix:** Enable Phone Authentication in Firebase Console

1. Go to: https://console.firebase.google.com/project/opilex-2a79f/authentication/providers
2. Click **"Phone"**
3. Toggle **"Enable"** ON
4. Click **"Save"**
5. Try again

---

### `auth/invalid-phone-number`

**Fix:** Check phone number format

- ✅ Correct: `9876543210` (10 digits, starts with 6-9)
- ✅ Correct: `+919876543210` (with country code)
- ❌ Wrong: `09876543210` (starts with 0)
- ❌ Wrong: `987654321` (9 digits)

---

### `auth/missing-recaptcha-token` or `auth/captcha-check-failed`

**Fix:** reCAPTCHA issue

**For Web:**
- Refresh the page
- Check browser console for reCAPTCHA errors
- Disable ad blockers temporarily
- Ensure `recaptcha-container` div exists

**For Mobile:**
- This shouldn't happen - Firebase handles it automatically
- If it does, may need React Native Firebase instead

---

### `auth/quota-exceeded`

**Fix:** SMS quota exceeded

- Use **test phone numbers** for development (unlimited)
- Add test numbers in Firebase Console
- Upgrade to Blaze plan for production
- Wait for daily quota reset

---

### `auth/too-many-requests`

**Fix:** Rate limiting

- Wait 5-10 minutes
- Use test phone numbers
- Implement rate limiting in your app

---

## 🛠️ Diagnostic Tool

The app now includes a diagnostic tool that runs automatically in development mode.

**To run manually:**
```typescript
import { printDiagnostics } from './src/utils/firebaseAuthDiagnostics';

// Run diagnostics
await printDiagnostics('9876543210');
```

This will check:
- ✅ Firebase Auth initialization
- ✅ reCAPTCHA container (web)
- ✅ Phone number format

---

## 📋 Most Likely Issue

**90% of Firebase Auth errors are due to:**

1. **Phone Auth not enabled** → `auth/operation-not-allowed`
   - **Fix:** Enable in Firebase Console (see above)

2. **Invalid phone format** → `auth/invalid-phone-number`
   - **Fix:** Use 10-digit number starting with 6-9

3. **reCAPTCHA issues (web)** → `auth/captcha-check-failed`
   - **Fix:** Refresh page, check console

---

## 🆘 Still Stuck?

1. **Check console logs** for exact error code
2. **Run diagnostics:** Check `FIREBASE_AUTH_ERROR_TROUBLESHOOTING.md`
3. **Test with test phone number** from Firebase Console
4. **Check Firebase Console** → Authentication → Users

---

## ✅ Verification Checklist

- [ ] Phone Auth enabled in Firebase Console
- [ ] Phone number format correct
- [ ] No console errors
- [ ] Test with test phone number
- [ ] Check Firebase Console for authentication attempts

---

**Share the exact error code for specific help!**

