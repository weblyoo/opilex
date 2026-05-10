# 🔍 OTP Sending Diagnostic Checklist

## Firebase Project Status
- **Project ID:** opilex-3373e
- **Project Number:** 1002505057634
- **Status:** ACTIVE ✅

---

## ✅ What to Check

### 1. Check Console Logs When Sending OTP

When you try to send OTP, look for these logs in your terminal:

```
LOG  Sending OTP to: +919462973337
LOG  📤 Attempting to send OTP via REST API to: +919462973337
LOG  📥 REST API Response Status: 200 (or 400/401/403)
LOG  📥 REST API Response Data: {...}
```

**Common errors you might see:**

#### Error 1: `OPERATION_NOT_ALLOWED`
- **Meaning:** Phone authentication is not enabled in Firebase Console
- **Fix:** 
  1. Go to: https://console.firebase.google.com/project/opilex-3373e/authentication/providers
  2. Click "Phone"
  3. Toggle "Enable" ON
  4. Click "Save"

#### Error 2: `INVALID_CAPTCHA` or `MISSING_CAPTCHA_TOKEN`
- **Meaning:** Firebase requires reCAPTCHA/app verification
- **Fix:**
  1. Go to Firebase Console → Project Settings → Your Android App
  2. Add SHA-1 fingerprint (get it with: `cd android && ./gradlew signingReport`)
  3. Add SHA-256 fingerprint
  4. Rebuild APK and reinstall

#### Error 3: `INVALID_PHONE_NUMBER`
- **Meaning:** Phone number format is wrong
- **Fix:** Use format `+919462973337` (with country code)

---

### 2. Check if OTP is Actually Being Sent

**Signs OTP was sent successfully:**
- Console shows: `✅ OTP sent successfully. Verification ID: ...`
- Response status is `200`
- You see `sessionInfo` in the response

**If OTP is sent but not received:**
- Check SMS inbox (wait 30-60 seconds)
- Check if phone number is correct
- Check Firebase Console → Authentication → Users (you might see the attempt logged)
- Check Firebase Console for SMS quota/usage

---

### 3. Test OTP Sending Directly

Run the diagnostic script:
```bash
node check-otp-sending.js
```

This will show you the exact API response and any errors.

---

### 4. Firebase Console Checklist

Go to Firebase Console and verify:

1. **Authentication → Sign-in method:**
   - [ ] Phone provider is enabled
   - [ ] No errors or warnings shown

2. **Project Settings → Your App (Android):**
   - [ ] SHA-1 fingerprint added
   - [ ] SHA-256 fingerprint added
   - [ ] Package name matches: `com.opilex.wireauth`

3. **Authentication → Users:**
   - [ ] Check if authentication attempts are logged
   - [ ] Look for error messages

---

## 🐛 Common Issues & Solutions

### Issue: OTP not received but no error in console
**Possible causes:**
- Firebase free tier SMS quota exceeded
- Phone number blocked or invalid
- SMS delivery delay (can take up to 2 minutes)

**Solution:**
1. Check Firebase Console → Usage for SMS quota
2. Try a different phone number
3. Wait 2 minutes and check again

### Issue: "CAPTCHA required" error
**Solution:**
- For Android APK: Add SHA fingerprints to Firebase Console
- For development: Use test phone numbers (see Firebase Console → Authentication → Sign-in method → Phone → Test phone numbers)

### Issue: OTP sent but verification fails
**Possible causes:**
- Wrong verification ID stored
- OTP code expired (60 seconds)
- Wrong OTP code entered

**Solution:**
- Check console logs for verification ID
- Make sure OTP is entered within 60 seconds
- Verify the code matches exactly (6 digits)

---

## 📱 Next Steps

1. **Try sending OTP again** and check console logs
2. **Look for the specific error code** in the logs
3. **Check Firebase Console** for configuration issues
4. **Review the console output** - it should show detailed information

The code now has comprehensive logging that will tell you exactly what's happening!

