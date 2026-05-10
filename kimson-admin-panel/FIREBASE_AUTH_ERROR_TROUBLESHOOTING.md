# 🔥 Firebase Auth Error Troubleshooting Guide

**Common Firebase Phone Authentication Errors and Solutions**

---

## 🔍 Common Error Codes

### 1. `auth/operation-not-allowed`

**Error Message:** "Phone authentication is not enabled"

**Cause:** Phone Authentication provider is not enabled in Firebase Console

**Solution:**
1. Go to Firebase Console: https://console.firebase.google.com/project/opilex-3373e/authentication/providers
2. Click on **"Phone"** provider
3. Toggle **"Enable"** to ON
4. Click **"Save"**

---

### 2. `auth/invalid-phone-number`

**Error Message:** "Invalid phone number format"

**Cause:** Phone number format is incorrect

**Solution:**
- Ensure phone number includes country code
- Format: `+91XXXXXXXXXX` (12 digits after +91)
- Remove spaces, dashes, or special characters
- Example: `+919876543210` ✅ (not `9876543210` ❌)

---

### 3. `auth/missing-recaptcha-token` or `auth/captcha-check-failed`

**Error Message:** "reCAPTCHA verification failed"

**Cause:** reCAPTCHA not properly configured or failed

**Solutions:**

**For Web:**
- Ensure `recaptcha-container` div exists (handled by `setupRecaptcha()`)
- Check browser console for reCAPTCHA errors
- Try refreshing the page
- Check if reCAPTCHA is blocked by ad blockers

**For Mobile:**
- Firebase should handle reCAPTCHA automatically
- If error persists, may need React Native Firebase instead

---

### 4. `auth/quota-exceeded`

**Error Message:** "SMS quota exceeded"

**Cause:** Daily SMS limit reached (free tier) or billing issue

**Solutions:**
- Check Firebase Console → Usage and Billing
- Upgrade to Blaze plan for production
- Use test phone numbers for development (unlimited)
- Wait for quota reset (usually daily)

---

### 5. `auth/too-many-requests`

**Error Message:** "Too many requests"

**Cause:** Rate limiting - too many OTP requests

**Solutions:**
- Wait a few minutes before retrying
- Implement rate limiting in your app
- Use test phone numbers for development

---

### 6. `auth/invalid-verification-code`

**Error Message:** "Invalid OTP code"

**Cause:** Wrong OTP entered or expired

**Solutions:**
- Check OTP entered correctly (6 digits)
- Request new OTP if expired
- Ensure OTP matches the one sent

---

### 7. `auth/code-expired`

**Error Message:** "OTP code has expired"

**Cause:** OTP expired (usually 5-10 minutes)

**Solutions:**
- Request a new OTP
- Enter OTP within time limit
- Check phone for latest OTP

---

### 8. `auth/session-expired`

**Error Message:** "Session expired"

**Cause:** Verification session expired

**Solutions:**
- Request new OTP
- Complete verification within session time
- Don't leave app idle for too long

---

## 🛠️ Quick Diagnostic Steps

### Step 1: Check Firebase Console

1. **Verify Phone Auth is Enabled:**
   ```
   https://console.firebase.google.com/project/opilex-3373e/authentication/providers
   ```
   - Phone provider should be **Enabled**

2. **Check Authentication Logs:**
   ```
   https://console.firebase.google.com/project/opilex-3373e/authentication
   ```
   - Check "Users" tab for authentication attempts
   - Check for error messages

3. **Verify Project Settings:**
   ```
   https://console.firebase.google.com/project/opilex-3373e/settings/general
   ```
   - Ensure project is active
   - Check API keys are valid

### Step 2: Check App Logs

Look for error messages in console:
- `console.error('Error sending OTP:', error)`
- `console.error('Error verifying OTP:', error)`

### Step 3: Test with Test Phone Numbers

1. Add test phone number in Firebase Console:
   - Authentication → Sign-in method → Phone
   - Scroll to "Phone numbers for testing"
   - Add: `+91XXXXXXXXXX`
   - OTP will appear in console (not SMS)

2. Test the flow with test number

---

## 🔧 Enhanced Error Logging

I'll add better error logging to help identify the exact issue. Check the updated code for detailed error information.

---

## 📋 Checklist

- [ ] Phone Auth enabled in Firebase Console
- [ ] Phone number format correct (`+91XXXXXXXXXX`)
- [ ] reCAPTCHA container exists (web)
- [ ] No ad blockers interfering (web)
- [ ] Firebase project is active
- [ ] API keys are valid
- [ ] Test with test phone number
- [ ] Check browser/device console for errors

---

## 🆘 Still Having Issues?

1. **Check the exact error code** in console logs
2. **Check Firebase Console** → Authentication → Users
3. **Try test phone number** first
4. **Check network connectivity**
5. **Verify Firebase config** in `src/config/firebase.ts`

---

**Need Help?** Share the exact error message/code for specific troubleshooting.

