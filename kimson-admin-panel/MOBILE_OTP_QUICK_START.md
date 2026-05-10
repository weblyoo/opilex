# 🚀 Mobile OTP Setup - Quick Start Guide

**Quick reference for setting up Firebase Phone Authentication**

---

## ⚡ Quick Setup (5 Steps)

### Step 1: Enable Phone Auth in Firebase Console
1. Go to: https://console.firebase.google.com/project/opilex-3373e/authentication/providers
2. Click **"Phone"** → Toggle **"Enable"** → **"Save"**

### Step 2: Add SHA Fingerprints (Android)
```bash
cd android
./gradlew signingReport
# Copy SHA-1 and SHA-256
# Add to Firebase Console → Project Settings → Your Android App
```

### Step 3: Update Code
- ✅ Types updated (`src/types/index.ts`)
- ✅ reCAPTCHA utility created (`src/utils/recaptcha.ts`)
- ⏳ Update `AuthContext.tsx` (see implementation guide)
- ⏳ Update `LoginScreen.tsx` (see implementation guide)
- ⏳ Update `OTPVerificationScreen.tsx` (see implementation guide)

### Step 4: Add reCAPTCHA Setup
In `App.tsx`, add:
```typescript
import { setupRecaptcha } from './src/utils/recaptcha';

export default function App() {
  setupRecaptcha(); // Add this
  
  // ... rest of code
}
```

### Step 5: Test
1. Use test phone number from Firebase Console
2. OTP will appear in Firebase Console (not SMS)
3. Enter OTP and verify

---

## 📋 Implementation Checklist

### Firebase Console
- [ ] Phone authentication enabled
- [ ] SHA-1 fingerprint added (Android)
- [ ] SHA-256 fingerprint added (Android)
- [ ] Test phone numbers added (optional)
- [ ] `google-services.json` downloaded (if using bare RN)

### Code Changes
- [x] Types updated (`OTPVerification` route includes `confirmation`)
- [x] reCAPTCHA utility created
- [ ] `AuthContext.tsx` - Replace mock `sendOTP` with real Firebase
- [ ] `LoginScreen.tsx` - Use real `sendOTP` and pass `confirmation`
- [ ] `OTPVerificationScreen.tsx` - Use real `verifyOTP` and handle resend
- [ ] `App.tsx` - Add `setupRecaptcha()` call

### Testing
- [ ] Test with test phone number
- [ ] Verify OTP appears in Firebase Console
- [ ] Test OTP verification
- [ ] Test resend OTP
- [ ] Test error cases
- [ ] Test with real phone number (production)

---

## 🔑 Key Code Changes

### AuthContext.tsx - sendOTP Function

**Replace mock code with:**
```typescript
const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
  
  if (Platform.OS === 'web') {
    // Web: Use reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible'
    }, auth);
    return await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
  } else {
    // Mobile: Firebase handles reCAPTCHA automatically
    return await signInWithPhoneNumber(auth, formattedPhone);
  }
};
```

### LoginScreen.tsx - handleSendOTP

**Replace setTimeout with:**
```typescript
const confirmation = await sendOTP(phoneNumber);
navigation.navigate('OTPVerification', { phoneNumber, confirmation });
```

### OTPVerificationScreen.tsx - handleVerifyOTP

**Replace mockAuthService with:**
```typescript
await verifyOTP(confirmation, otpCode);
navigation.navigate('RegistrationType');
```

---

## 📚 Documentation Files

1. **MOBILE_OTP_SETUP_GUIDE.md** - Complete setup guide
2. **MOBILE_OTP_IMPLEMENTATION.md** - Detailed code changes
3. **MOBILE_OTP_QUICK_START.md** - This file (quick reference)

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP not received | Check Firebase Console → Authentication → Users |
| Invalid phone format | Ensure format: `+91XXXXXXXXXX` |
| reCAPTCHA errors | Only needed for web, mobile handles automatically |
| SHA mismatch | Re-download `google-services.json` after adding SHA |

---

## ✅ Ready to Implement?

1. ✅ Read `MOBILE_OTP_SETUP_GUIDE.md` for complete instructions
2. ✅ Follow `MOBILE_OTP_IMPLEMENTATION.md` for code changes
3. ✅ Use this quick start for reference

**Status:** Ready for implementation! 🚀

