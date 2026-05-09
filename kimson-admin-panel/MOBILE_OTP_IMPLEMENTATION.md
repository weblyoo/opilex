# 📱 Mobile OTP Implementation - Code Changes

This document contains the exact code changes needed to implement real Firebase Phone Authentication.

---

## 🔧 Code Changes Required

### 1. Update Types

**File:** `src/types/index.ts`

```typescript
import { ConfirmationResult } from 'firebase/auth';

export type RootStackParamList = {
  // ... existing routes ...
  OTPVerification: { 
    phoneNumber: string;
    confirmation: ConfirmationResult; // ADD THIS
  };
  // ... rest of routes ...
};
```

---

### 2. Update AuthContext

**File:** `src/contexts/AuthContext.tsx`

Replace the `sendOTP` function (lines 99-138):

```typescript
import { Platform } from 'react-native';

const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  try {
    // Format phone number with country code
    const formattedPhone = phoneNumber.startsWith('+91') 
      ? phoneNumber 
      : `+91${phoneNumber}`;
    
    console.log('Sending OTP to:', formattedPhone);
    
    // For React Native (mobile), Firebase handles reCAPTCHA automatically
    // For Web, we need reCAPTCHA verifier
    if (Platform.OS === 'web') {
      // Web implementation - requires reCAPTCHA
      // Make sure recaptcha-container div exists in your HTML
      let recaptchaVerifier = (window as any).recaptchaVerifier;
      
      if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
          }
        }, auth);
        
        (window as any).recaptchaVerifier = recaptchaVerifier;
      }
      
      return await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    } else {
      // React Native (mobile) - Firebase handles reCAPTCHA automatically
      // Note: This requires Firebase Phone Auth to be properly configured
      return await signInWithPhoneNumber(auth, formattedPhone);
    }
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to send OTP. Please try again.';
    
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format. Please check and try again.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'SMS quota exceeded. Please contact support.';
    } else if (error.code === 'auth/captcha-check-failed') {
      errorMessage = 'reCAPTCHA verification failed. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};
```

**Note:** The `signInWithPhoneNumber` function signature may vary. Check your Firebase version documentation.

---

### 3. Update LoginScreen

**File:** `src/screens/LoginScreen.tsx`

Replace the `handleSendOTP` function (lines 49-83):

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
    // Call real Firebase auth to send OTP
    const confirmation = await sendOTP(phoneNumber);
    
    setIsLoading(false);
    
    // Navigate to OTP screen with confirmation result
    navigation.navigate('OTPVerification', { 
      phoneNumber,
      confirmation // Pass confirmation for verification
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

---

### 4. Update OTPVerificationScreen

**File:** `src/screens/OTPVerificationScreen.tsx`

Update imports and component:

```typescript
import { ConfirmationResult } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

// Update route params type
type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber, confirmation } = route.params; // Get confirmation from route
  const { verifyOTP, sendOTP } = useAuth(); // Get sendOTP for resend
  
  // ... existing state ...

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
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP code has expired. Please request a new one.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Verification Failed', errorMessage);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(30);
    setIsLoading(true);
    
    try {
      // Resend OTP using real Firebase auth
      const newConfirmation = await sendOTP(phoneNumber);
      
      // Update confirmation (you may need to store in state or context)
      // For now, we'll use navigation.setParams
      navigation.setParams({ 
        phoneNumber,
        confirmation: newConfirmation 
      });
      
      // Clear OTP fields
      setOtp(['', '', '', '', '', '']);
      
      Alert.alert('Success', 'OTP has been resent to your mobile number');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
      setCanResend(true); // Allow retry
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

  // ... rest of component ...
};
```

---

### 5. Add reCAPTCHA Container for Web (If Needed)

**File:** `App.tsx` or create `src/utils/recaptcha.ts`

```typescript
import { Platform } from 'react-native';
import { useEffect } from 'react';

export const setupRecaptcha = () => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Create reCAPTCHA container if it doesn't exist
      if (typeof document !== 'undefined' && !document.getElementById('recaptcha-container')) {
        const container = document.createElement('div');
        container.id = 'recaptcha-container';
        container.style.display = 'none';
        document.body.appendChild(container);
        console.log('reCAPTCHA container created');
      }
    }
  }, []);
};
```

Then call it in `App.tsx`:

```typescript
import { setupRecaptcha } from './src/utils/recaptcha';

export default function App() {
  setupRecaptcha();
  
  // ... rest of App component ...
}
```

---

## ⚠️ Important Notes

### Firebase JS SDK Limitations

The Firebase JS SDK (`firebase/auth`) has limitations for React Native:

1. **Mobile:** May not work perfectly - consider React Native Firebase
2. **Web:** Requires reCAPTCHA setup
3. **Expo:** May need Expo's phone auth instead

### Alternative: Use React Native Firebase

If Firebase JS SDK doesn't work well, consider:

```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

Then use:
```typescript
import auth from '@react-native-firebase/auth';

// Send OTP
const confirmation = await auth().signInWithPhoneNumber(formattedPhone);

// Verify OTP
const userCredential = await confirmation.confirm(otp);
```

### Alternative: Use Expo Auth Session

For Expo managed workflow:

```bash
npm install expo-auth-session expo-crypto
```

---

## 🧪 Testing Checklist

After implementing:

- [ ] Enable Phone Auth in Firebase Console
- [ ] Add SHA fingerprints (Android)
- [ ] Test with test phone number
- [ ] Verify OTP received (check Firebase Console)
- [ ] Test OTP verification
- [ ] Test resend OTP
- [ ] Test error cases
- [ ] Test with real phone number (production)

---

## 🐛 Common Issues

### Issue: "signInWithPhoneNumber is not a function"

**Solution:** Check Firebase version. The function might be:
- `signInWithPhoneNumber(auth, phone, recaptcha)` for v9+
- `auth().signInWithPhoneNumber(phone)` for React Native Firebase

### Issue: reCAPTCHA errors on mobile

**Solution:** 
- For mobile, Firebase handles reCAPTCHA automatically
- Only web needs explicit reCAPTCHA setup
- Check Platform.OS before creating verifier

### Issue: OTP not received

**Solutions:**
1. Check Firebase Console → Authentication → Users
2. Verify phone number format (+91XXXXXXXXXX)
3. Check SMS quota
4. Use test phone numbers for development

---

**Ready to implement!** Follow the guide step by step.

