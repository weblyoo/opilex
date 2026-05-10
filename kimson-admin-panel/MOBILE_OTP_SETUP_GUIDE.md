# 📱 Mobile OTP Setup Guide - Firebase Phone Authentication

**Date:** January 2025  
**Project:** Opilex App  
**Current Status:** Using Mock Authentication  
**Target:** Real Firebase Phone Authentication with OTP

---

## 📋 Overview

This guide will help you set up real Firebase Phone Authentication with OTP SMS verification in your Opilex App. Currently, the app uses mock authentication - this guide will replace it with production-ready Firebase Phone Auth.

---

## 🔍 Current Status

### What's Currently Working
- ✅ UI flow is complete (Login → OTP → Registration)
- ✅ Firebase project is configured (`opilex-2a79f`)
- ✅ Firestore is set up
- ✅ Mock authentication for development

### What Needs to Be Done
- ❌ Enable Phone Authentication in Firebase Console
- ❌ Configure Android/iOS platforms
- ❌ Replace mock auth with real Firebase auth
- ❌ Test with real phone numbers

---

## 🚀 Step-by-Step Setup

### Step 1: Enable Phone Authentication in Firebase Console

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/project/opilex-2a79f/authentication/providers
   ```

2. **Enable Phone Provider:**
   - Click on **"Phone"** in the Sign-in method providers list
   - Toggle **"Enable"** switch to ON
   - Click **"Save"**

3. **Configure Test Phone Numbers (Optional for Testing):**
   - Add test phone numbers in the "Phone numbers for testing" section
   - Format: `+91XXXXXXXXXX` (with country code)
   - Test OTPs will be shown in Firebase Console instead of SMS

---

### Step 2: Configure Android Platform

#### 2.1 Get SHA-1 and SHA-256 Fingerprints

**For Windows:**
```bash
# Navigate to your project directory
cd android

# Run gradlew to get SHA-1
.\gradlew signingReport

# Or use keytool directly
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**For Mac/Linux:**
```bash
cd android
./gradlew signingReport

# Or use keytool
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### 2.2 Add SHA Fingerprints to Firebase

1. Go to Firebase Console → Project Settings → Your Android App
2. Scroll to "SHA certificate fingerprints"
3. Click "Add fingerprint"
4. Add both SHA-1 and SHA-256 fingerprints
5. Click "Save"

#### 2.3 Download google-services.json

1. In Firebase Console → Project Settings
2. Download `google-services.json`
3. Place it in `android/app/` directory

---

### Step 3: Configure iOS Platform

#### 3.1 Configure Bundle ID

1. Go to Firebase Console → Project Settings → Your iOS App
2. Ensure Bundle ID matches your `app.json`:
   ```json
   "ios": {
     "bundleIdentifier": "com.opilex.wireauth"
   }
   ```

#### 3.2 Download GoogleService-Info.plist

1. In Firebase Console → Project Settings
2. Download `GoogleService-Info.plist`
3. Place it in `ios/` directory (if using bare React Native)

**Note:** For Expo managed workflow, this is handled automatically.

---

### Step 4: Install Required Dependencies

Since you're using Expo, you have two options:

#### Option A: Use Expo's Built-in Phone Auth (Recommended for Expo)

```bash
npm install expo-auth-session expo-crypto
```

#### Option B: Use Firebase JS SDK (Current Setup - Requires Web reCAPTCHA)

Your current setup uses Firebase JS SDK. For React Native, you'll need:

```bash
# Already installed, but verify:
npm install firebase
npm install @react-native-async-storage/async-storage
```

**For Web Support (if needed):**
```bash
npm install firebase
```

---

### Step 5: Update Code Implementation

#### 5.1 Update AuthContext.tsx

**File:** `src/contexts/AuthContext.tsx`

Replace the mock `sendOTP` function with real Firebase implementation:

```typescript
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';

const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  try {
    // Format phone number with country code
    const formattedPhone = phoneNumber.startsWith('+91') 
      ? phoneNumber 
      : `+91${phoneNumber}`;
    
    console.log('Sending OTP to:', formattedPhone);
    
    // For React Native (Expo), use reCAPTCHA verifier
    // Note: reCAPTCHA is required for web, but React Native handles it differently
    
    // Check if running on web
    if (Platform.OS === 'web') {
      // Web implementation with reCAPTCHA
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Response expired
        }
      }, auth);
      
      return await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    } else {
      // React Native implementation
      // Firebase automatically handles reCAPTCHA for mobile
      return await signInWithPhoneNumber(auth, formattedPhone);
    }
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please contact support.');
    }
    
    throw new Error(error.message || 'Failed to send OTP. Please try again.');
  }
};
```

**Important:** The `signInWithPhoneNumber` function signature may differ. Check Firebase documentation for your version.

#### 5.2 Update LoginScreen.tsx

**File:** `src/screens/LoginScreen.tsx`

Replace the mock implementation:

```typescript
const handleSendOTP = async () => {
  setErrors({});
  
  if (!phoneNumber.trim()) {
    setErrors({ phoneNumber: 'Phone number is required' });
    return;
  }

  if (!validatePhoneNumber(phoneNumber)) {
    setErrors({ phoneNumber: 'Please enter a valid 10-digit phone number' });
    return;
  }

  setIsLoading(true);
  
  try {
    // Call real Firebase auth
    const confirmation = await sendOTP(phoneNumber);
    
    setIsLoading(false);
    
    // Navigate to OTP screen with confirmation
    navigation.navigate('OTPVerification', { 
      phoneNumber,
      confirmation // Pass confirmation result
    });
  } catch (error: any) {
    setIsLoading(false);
    console.error('Error sending OTP:', error);
    
    // Show user-friendly error
    setErrors({ 
      phoneNumber: error.message || 'Failed to send OTP. Please try again.' 
    });
  }
};
```

#### 5.3 Update OTPVerificationScreen.tsx

**File:** `src/screens/OTPVerificationScreen.tsx`

Update the route params and verification:

```typescript
import { ConfirmationResult } from 'firebase/auth';

// Update route params type
type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

// Update RootStackParamList in types/index.ts to include confirmation:
// OTPVerification: { phoneNumber: string; confirmation: ConfirmationResult };

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber, confirmation } = route.params;
  const { verifyOTP } = useAuth();
  
  // ... existing code ...

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use real Firebase verification
      await verifyOTP(confirmation, otpCode);
      
      setIsLoading(false);
      
      // Navigate to registration after successful verification
      navigation.navigate('RegistrationType');
    } catch (error: any) {
      setIsLoading(false);
      console.error('OTP verification error:', error);
      
      // Show user-friendly error
      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid OTP. Please try again.'
      );
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(30);
    setIsLoading(true);
    
    try {
      // Resend OTP
      const newConfirmation = await sendOTP(phoneNumber);
      
      // Update route params (you may need to use navigation.setParams)
      // Or store confirmation in context/state
      
      Alert.alert('Success', 'OTP has been resent to your mobile number');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
    
    // Restart timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
};
```

#### 5.4 Update Types

**File:** `src/types/index.ts`

```typescript
import { ConfirmationResult } from 'firebase/auth';

export type RootStackParamList = {
  // ... existing routes ...
  OTPVerification: { 
    phoneNumber: string; 
    confirmation: ConfirmationResult; // Add this
  };
  // ... rest of routes ...
};
```

---

### Step 6: Handle reCAPTCHA for Web (If Supporting Web)

If you need web support, add a reCAPTCHA container:

**File:** `src/screens/LoginScreen.tsx` or `App.tsx`

```typescript
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// Add reCAPTCHA container for web
useEffect(() => {
  if (Platform.OS === 'web') {
    // Create reCAPTCHA container if it doesn't exist
    if (!document.getElementById('recaptcha-container')) {
      const container = document.createElement('div');
      container.id = 'recaptcha-container';
      container.style.display = 'none';
      document.body.appendChild(container);
    }
  }
}, []);
```

---

### Step 7: Update Firebase Config (If Needed)

**File:** `src/config/firebase.ts`

Ensure Firebase is properly initialized:

```typescript
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "opilex-2a79f.firebaseapp.com",
  projectId: "opilex-2a79f",
  storageBucket: "opilex-2a79f.firebasestorage.app",
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: "G-40Z3KKDR4Y"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

---

## 🧪 Testing

### Test with Real Phone Number

1. **Use Test Phone Numbers (Recommended for Development):**
   - Add test numbers in Firebase Console
   - OTP will be shown in console, not sent via SMS
   - Format: `+91XXXXXXXXXX`

2. **Test Flow:**
   - Enter phone number
   - Click "Login"
   - Check Firebase Console for OTP (if test number)
   - Or receive SMS (if real number)
   - Enter OTP
   - Verify authentication works

### Test Scenarios

- [ ] Valid phone number sends OTP
- [ ] Invalid phone number shows error
- [ ] OTP verification works
- [ ] Invalid OTP shows error
- [ ] Resend OTP works
- [ ] User is created in Firestore
- [ ] User profile is updated

---

## ⚠️ Important Notes

### For Expo Managed Workflow

If you're using Expo managed workflow (not ejected):

1. **Expo handles Firebase automatically** - no need for `google-services.json` manually
2. **Use Expo's phone authentication** or Firebase JS SDK
3. **reCAPTCHA is handled automatically** on mobile

### For Bare React Native

If you've ejected from Expo:

1. **Install React Native Firebase:**
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/auth
   ```

2. **Follow React Native Firebase setup guide:**
   - Add `google-services.json` to `android/app/`
   - Add `GoogleService-Info.plist` to `ios/`
   - Link native modules

### Rate Limiting

Firebase has rate limits for phone authentication:
- **Free tier:** Limited SMS per day
- **Blaze plan:** Pay-as-you-go for SMS
- **Test numbers:** Unlimited (shown in console)

### Cost Considerations

- **SMS costs:** ~$0.01-0.05 per SMS (varies by country)
- **Test numbers:** Free (unlimited)
- **Production:** Monitor usage in Firebase Console

---

## 🐛 Troubleshooting

### Issue: "reCAPTCHA not found"

**Solution:**
- Ensure reCAPTCHA container exists for web
- For mobile, Firebase handles it automatically
- Check Firebase Console → Authentication → Settings

### Issue: "Invalid phone number format"

**Solution:**
- Ensure phone number includes country code (`+91`)
- Format: `+91XXXXXXXXXX` (12 digits after +91)
- Validate format before sending

### Issue: "SMS not received"

**Solutions:**
1. Check Firebase Console → Authentication → Users
2. Verify phone number format
3. Check SMS quota in Firebase Console
4. Use test phone numbers for development
5. Check spam folder

### Issue: "Too many requests"

**Solution:**
- Firebase has rate limits
- Wait a few minutes and try again
- Use test phone numbers for development

### Issue: "SHA fingerprint mismatch" (Android)

**Solution:**
1. Get correct SHA-1/SHA-256 fingerprints
2. Add to Firebase Console
3. Download new `google-services.json`
4. Rebuild app

---

## 📊 Monitoring

### Firebase Console

Monitor authentication:
- **Authentication → Users:** See all authenticated users
- **Authentication → Sign-in method:** Check phone provider status
- **Usage:** Monitor SMS usage and costs

### App Logs

Check console logs for:
- OTP sending success/failure
- Verification success/failure
- Error messages

---

## ✅ Checklist

### Firebase Console Setup
- [ ] Phone authentication enabled
- [ ] SHA fingerprints added (Android)
- [ ] Bundle ID configured (iOS)
- [ ] Test phone numbers added (optional)
- [ ] `google-services.json` downloaded (Android)
- [ ] `GoogleService-Info.plist` downloaded (iOS)

### Code Updates
- [ ] `AuthContext.tsx` updated with real `sendOTP`
- [ ] `LoginScreen.tsx` updated to use real auth
- [ ] `OTPVerificationScreen.tsx` updated to use real verification
- [ ] Types updated to include `ConfirmationResult`
- [ ] reCAPTCHA container added (if web support needed)

### Testing
- [ ] Test with test phone number
- [ ] Test with real phone number
- [ ] Verify OTP received
- [ ] Verify OTP verification works
- [ ] Test error cases
- [ ] Test resend OTP

---

## 🚀 Production Deployment

### Before Going Live

1. **Remove test phone numbers** (or keep for admin testing)
2. **Monitor SMS costs** - set up billing alerts
3. **Set up error tracking** (Sentry, etc.)
4. **Test thoroughly** with real users
5. **Review rate limits** and implement backoff

### Security

1. **Enable App Check** in Firebase Console
2. **Set up rate limiting** in your backend
3. **Monitor for abuse** (too many OTP requests)
4. **Implement CAPTCHA** for suspicious activity

---

## 📚 Additional Resources

- **Firebase Phone Auth Docs:** https://firebase.google.com/docs/auth/web/phone-auth
- **Expo Auth Session:** https://docs.expo.dev/guides/authentication/#phone-authentication
- **React Native Firebase:** https://rnfirebase.io/auth/phone-auth
- **Firebase Console:** https://console.firebase.google.com/project/opilex-2a79f

---

## 🆘 Support

If you encounter issues:

1. Check Firebase Console for errors
2. Review app logs
3. Verify Firebase configuration
4. Test with test phone numbers first
5. Check Firebase documentation

---

**Last Updated:** January 2025  
**Status:** Ready for Implementation

