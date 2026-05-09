# 🔐 Sandbox KYC Integration Plan - Kimson App

**Date:** January 2025  
**API Provider:** Sandbox Financial Technologies  
**API Documentation:** https://developer.sandbox.co.in/  
**KYC Method:** Aadhaar Offline e-KYC API

---

## 📋 Overview

This document outlines the complete implementation plan for integrating Sandbox KYC API into the Kimson App. The integration will replace the current mock KYC service with real Aadhaar verification using Sandbox's Aadhaar Offline e-KYC API.

### Current Status
- ✅ UI is ready (KYCScreen.tsx)
- ✅ Aadhaar input and OTP flow implemented
- ❌ Using mock service (`mockAuthService.completeKYC`)
- ❌ No real API integration

### Target Status
- ✅ Real Sandbox API integration
- ✅ Aadhaar OTP generation via Sandbox
- ✅ Aadhaar verification via Sandbox
- ✅ KYC data stored in Firestore
- ✅ Error handling and user feedback

---

## 🔑 API Credentials

**⚠️ SECURITY NOTE:** These credentials should be moved to environment variables in production.

```
API Key: key_live_bdc866212c0e40c78fcf4f41acd45bb1
API Secret: secret_live_943291b891064242852c18425341a379
```

**Base URL:** `https://api.sandbox.co.in/` (or check latest docs)

---

## 📚 Sandbox API Flow

### 1. Authentication Flow
```
1. Get Access Token
   POST /authenticate
   Headers: API-Key, API-Secret
   Response: { access_token, expires_in }

2. Use Access Token for API Calls
   Headers: Authorization: Bearer {access_token}
```

### 2. Aadhaar Offline e-KYC Flow
```
Step 1: Generate OTP
   POST /kyc/aadhaar/offline/otp
   Body: { aadhaar_number }
   Response: { request_id, message }

Step 2: Verify OTP
   POST /kyc/aadhaar/offline/verify
   Body: { request_id, otp }
   Response: { 
     verified: true,
     aadhaar_data: {
       name,
       dob,
       gender,
       address,
       photo,
       ...
     }
   }
```

**Note:** Actual endpoint paths may vary. Check latest Sandbox API documentation.

---

## 🏗️ Implementation Architecture

### File Structure
```
src/
├── config/
│   ├── sandbox.ts          # NEW: Sandbox API configuration
│   └── firebase.ts         # Existing
├── services/
│   ├── sandboxKYC.ts       # NEW: Sandbox KYC service
│   ├── mockAuth.ts         # Existing (keep for fallback)
│   └── firestore.ts        # Existing
├── screens/
│   └── KYCScreen.tsx       # UPDATE: Use real Sandbox API
└── types/
    └── index.ts            # UPDATE: Add KYC types
```

---

## 📝 Step-by-Step Implementation Plan

### Phase 1: Setup & Configuration

#### Step 1.1: Create Environment Configuration
**File:** `src/config/sandbox.ts`

```typescript
// Sandbox API Configuration
export const SANDBOX_CONFIG = {
  API_KEY: 'key_live_bdc866212c0e40c78fcf4f41acd45bb1',
  API_SECRET: 'secret_live_943291b891064242852c18425341a379',
  BASE_URL: 'https://api.sandbox.co.in', // Verify in docs
  AUTH_ENDPOINT: '/authenticate',
  AADHAAR_OTP_ENDPOINT: '/kyc/aadhaar/offline/otp',
  AADHAAR_VERIFY_ENDPOINT: '/kyc/aadhaar/offline/verify',
};

// Token cache (store in AsyncStorage for production)
let cachedToken: { token: string; expiresAt: number } | null = null;
```

#### Step 1.2: Install Required Dependencies
```bash
npm install axios  # For HTTP requests
# or use fetch API (built-in)
```

---

### Phase 2: Sandbox Service Implementation

#### Step 2.1: Create Sandbox Authentication Service
**File:** `src/services/sandboxAuth.ts`

```typescript
import { SANDBOX_CONFIG } from '../config/sandbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_STORAGE_KEY = '@sandbox_access_token';
const TOKEN_EXPIRY_KEY = '@sandbox_token_expiry';

interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

/**
 * Get Sandbox API access token
 * Token is cached and reused until expiry
 */
export async function getSandboxAccessToken(): Promise<string> {
  try {
    // Check cached token
    const cachedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    const expiryTime = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (cachedToken && expiryTime) {
      const expiry = parseInt(expiryTime, 10);
      const now = Date.now();
      
      // If token is still valid (with 5 min buffer), return cached token
      if (now < expiry - 5 * 60 * 1000) {
        return cachedToken;
      }
    }

    // Get new token
    const response = await fetch(`${SANDBOX_CONFIG.BASE_URL}${SANDBOX_CONFIG.AUTH_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': SANDBOX_CONFIG.API_KEY,
        'API-Secret': SANDBOX_CONFIG.API_SECRET,
      },
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data: AuthResponse = await response.json();
    const accessToken = data.access_token;
    const expiresIn = data.expires_in || 86400; // Default 24 hours
    
    // Cache token
    const expiryTimeMs = Date.now() + (expiresIn * 1000);
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimeMs.toString());

    return accessToken;
  } catch (error) {
    console.error('Error getting Sandbox access token:', error);
    throw error;
  }
}

/**
 * Clear cached token (for logout or errors)
 */
export async function clearSandboxToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
}
```

#### Step 2.2: Create Sandbox KYC Service
**File:** `src/services/sandboxKYC.ts`

```typescript
import { getSandboxAccessToken } from './sandboxAuth';
import { SANDBOX_CONFIG } from '../config/sandbox';

export interface AadhaarOTPRequest {
  aadhaar_number: string;
  consent?: boolean;
}

export interface AadhaarOTPResponse {
  request_id: string;
  message: string;
  success: boolean;
}

export interface AadhaarVerifyRequest {
  request_id: string;
  otp: string;
}

export interface AadhaarData {
  name: string;
  dob: string; // Date of birth
  gender: string;
  address: {
    care_of?: string;
    district?: string;
    house?: string;
    landmark?: string;
    locality?: string;
    pincode?: string;
    post_office?: string;
    state?: string;
    street?: string;
    sub_district?: string;
    vtc?: string;
  };
  photo?: string; // Base64 encoded photo
  mobile_number?: string;
  email?: string;
}

export interface AadhaarVerifyResponse {
  verified: boolean;
  aadhaar_data?: AadhaarData;
  message?: string;
  error?: string;
}

/**
 * Generate OTP for Aadhaar verification
 */
export async function generateAadhaarOTP(
  aadhaarNumber: string
): Promise<AadhaarOTPResponse> {
  try {
    const accessToken = await getSandboxAccessToken();
    
    const response = await fetch(
      `${SANDBOX_CONFIG.BASE_URL}${SANDBOX_CONFIG.AADHAAR_OTP_ENDPOINT}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          aadhaar_number: aadhaarNumber,
          consent: true, // User consent for KYC
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `OTP generation failed: ${response.statusText}`
      );
    }

    const data: AadhaarOTPResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error generating Aadhaar OTP:', error);
    throw new Error(error.message || 'Failed to generate OTP');
  }
}

/**
 * Verify OTP and get Aadhaar data
 */
export async function verifyAadhaarOTP(
  requestId: string,
  otp: string
): Promise<AadhaarVerifyResponse> {
  try {
    const accessToken = await getSandboxAccessToken();
    
    const response = await fetch(
      `${SANDBOX_CONFIG.BASE_URL}${SANDBOX_CONFIG.AADHAAR_VERIFY_ENDPOINT}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          request_id: requestId,
          otp: otp,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `OTP verification failed: ${response.statusText}`
      );
    }

    const data: AadhaarVerifyResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error verifying Aadhaar OTP:', error);
    throw new Error(error.message || 'Failed to verify OTP');
  }
}
```

---

### Phase 3: Update KYC Screen

#### Step 3.1: Update KYCScreen.tsx
**File:** `src/screens/KYCScreen.tsx`

**Key Changes:**
1. Import Sandbox KYC service
2. Replace mock OTP generation with `generateAadhaarOTP`
3. Replace mock verification with `verifyAadhaarOTP`
4. Store `request_id` from OTP response
5. Save Aadhaar data to Firestore
6. Update user profile with KYC status

**Updated Code Sections:**

```typescript
// Add imports
import { generateAadhaarOTP, verifyAadhaarOTP } from '../services/sandboxKYC';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Add state for request_id
const [requestId, setRequestId] = useState<string>('');

// Update handleSendOTP function
const handleSendOTP = async () => {
  setErrors({});
  
  if (!aadharNumber.trim()) {
    setErrors({ aadhar: 'Aadhar number is required' });
    return;
  }

  if (!validateAadhar(aadharNumber)) {
    setErrors({ aadhar: 'Please enter a valid 12-digit Aadhar number' });
    return;
  }

  setIsLoading(true);
  
  try {
    // Call Sandbox API to generate OTP
    const otpResponse = await generateAadhaarOTP(aadharNumber);
    
    if (!otpResponse.success || !otpResponse.request_id) {
      throw new Error(otpResponse.message || 'Failed to generate OTP');
    }
    
    // Store request_id for verification
    setRequestId(otpResponse.request_id);
    setIsOtpSent(true);
    setShowSuccessModal(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  } catch (error: any) {
    console.error('OTP generation error:', error);
    setErrors({ aadhar: error.message || 'Failed to send OTP. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};

// Update handleVerifyKYC function
const handleVerifyKYC = async () => {
  setErrors({});
  
  if (!otp.trim()) {
    setErrors({ otp: 'OTP is required' });
    return;
  }

  if (otp.length !== 6) {
    setErrors({ otp: 'Please enter a valid 6-digit OTP' });
    return;
  }

  if (!user) {
    Alert.alert('Error', 'User not found. Please try logging in again.');
    return;
  }

  if (!requestId) {
    Alert.alert('Error', 'Session expired. Please request OTP again.');
    return;
  }

  setIsVerifying(true);
  
  try {
    // Call Sandbox API to verify OTP
    const verifyResponse = await verifyAadhaarOTP(requestId, otp);
    
    if (!verifyResponse.verified || !verifyResponse.aadhaar_data) {
      throw new Error(verifyResponse.message || 'KYC verification failed');
    }

    const aadhaarData = verifyResponse.aadhaar_data;
    
    // Save KYC data to Firestore
    const kycData = {
      userId: user.id,
      aadhaarNumber: aadharNumber,
      verified: true,
      verifiedAt: serverTimestamp(),
      aadhaarData: {
        name: aadhaarData.name,
        dob: aadhaarData.dob,
        gender: aadhaarData.gender,
        address: aadhaarData.address,
        photo: aadhaarData.photo, // Base64 photo if available
      },
      provider: 'sandbox',
    };

    // Save to Firestore
    await setDoc(
      doc(db, 'kyc_verifications', user.id),
      kycData
    );

    // Update user profile
    const updatedUser = {
      ...user,
      kycVerified: true,
      name: aadhaarData.name, // Update name from Aadhaar
      rewardPoints: (user.rewardPoints || 0) + 100, // Welcome bonus
    };

    await updateUserProfile(updatedUser);
    
    // Also update Firestore user document
    await setDoc(
      doc(db, 'users', user.id),
      {
        ...updatedUser,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    
    setIsVerifying(false);
    setShowKYCSuccessModal(true);
  } catch (error: any) {
    setIsVerifying(false);
    console.error('KYC verification error:', error);
    
    // Handle specific error cases
    if (error.message.includes('Invalid OTP') || error.message.includes('expired')) {
      setErrors({ otp: error.message });
    } else {
      Alert.alert('Error', error.message || 'KYC verification failed. Please try again.');
    }
  }
};
```

---

### Phase 4: Update Types

#### Step 4.1: Add KYC Types
**File:** `src/types/index.ts`

```typescript
// Add to existing types

export interface KYCVerification {
  id: string;
  userId: string;
  aadhaarNumber: string;
  verified: boolean;
  verifiedAt: Date;
  aadhaarData?: {
    name: string;
    dob: string;
    gender: string;
    address: {
      care_of?: string;
      district?: string;
      house?: string;
      landmark?: string;
      locality?: string;
      pincode?: string;
      post_office?: string;
      state?: string;
      street?: string;
      sub_district?: string;
      vtc?: string;
    };
    photo?: string;
    mobile_number?: string;
    email?: string;
  };
  provider: 'sandbox' | 'mock';
  createdAt: Date;
}

// Update User interface to include KYC reference
export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  userType: 'electrician' | 'dealer';
  kycVerified: boolean;
  kycVerificationId?: string; // Reference to KYC document
  language: 'en' | 'hi' | 'mr' | 'gu';
  rewardPoints: number;
  createdAt: Date;
}
```

---

### Phase 5: Firestore Security Rules

#### Step 5.1: Update Firestore Rules
**File:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // KYC Verifications - Users can only read/write their own
    match /kyc_verifications/{kycId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Existing rules...
  }
}
```

---

## 🧪 Testing Plan

### Test Cases

1. **OTP Generation**
   - ✅ Valid 12-digit Aadhaar number
   - ❌ Invalid Aadhaar format
   - ❌ Network error handling
   - ❌ API authentication failure

2. **OTP Verification**
   - ✅ Valid OTP
   - ❌ Invalid OTP
   - ❌ Expired OTP
   - ❌ Wrong request_id

3. **Data Storage**
   - ✅ KYC data saved to Firestore
   - ✅ User profile updated
   - ✅ Reward points added

4. **Error Handling**
   - ✅ User-friendly error messages
   - ✅ Retry mechanisms
   - ✅ Session expiry handling

---

## 🔒 Security Considerations

### 1. API Credentials
- ⚠️ **CRITICAL:** Move API keys to environment variables
- Use `expo-constants` for environment variables
- Never commit credentials to Git

### 2. Data Privacy
- Aadhaar data is sensitive - ensure encryption at rest
- Only store necessary Aadhaar fields
- Comply with Aadhaar Act regulations
- Implement data retention policies

### 3. API Security
- Use HTTPS only
- Implement rate limiting
- Monitor API usage
- Set up alerts for suspicious activity

### 4. Token Management
- Cache access tokens securely
- Implement token refresh logic
- Clear tokens on logout

---

## 📊 Monitoring & Analytics

### Metrics to Track
1. KYC success rate
2. OTP generation success rate
3. OTP verification success rate
4. Average time to complete KYC
5. API error rates
6. Sandbox API costs per verification

### Logging
```typescript
// Add logging for KYC events
console.log('KYC Event:', {
  userId: user.id,
  event: 'otp_generated' | 'otp_verified' | 'kyc_completed',
  timestamp: new Date(),
  success: boolean,
  error?: string,
});
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Move API credentials to environment variables
- [ ] Test with real Sandbox API (not mock)
- [ ] Verify Firestore rules
- [ ] Test error scenarios
- [ ] Review security measures
- [ ] Check API rate limits
- [ ] Set up monitoring

### Post-Deployment
- [ ] Monitor API usage
- [ ] Check error logs
- [ ] Verify KYC data storage
- [ ] Test user flow end-to-end
- [ ] Monitor Sandbox wallet balance

---

## 💰 Cost Considerations

### Sandbox API Pricing
- Check Sandbox pricing for Aadhaar KYC API
- Each OTP generation may incur cost
- Each verification may incur cost
- Monitor wallet balance regularly

### Cost Optimization
- Cache access tokens (already implemented)
- Implement retry logic with backoff
- Handle errors gracefully to avoid unnecessary API calls

---

## 📚 Additional Resources

- **Sandbox API Docs:** https://developer.sandbox.co.in/
- **Aadhaar KYC API:** https://developer.sandbox.co.in/reference/aadhaar-kyc
- **Authentication Guide:** https://developer.sandbox.co.in/guides/get-started/quickstart
- **Error Handling:** https://developer.sandbox.co.in/guides/get-started/errors

---

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check API credentials
   - Verify token expiry
   - Check network connectivity

2. **OTP Not Received**
   - Verify Aadhaar number format
   - Check Sandbox API status
   - Verify mobile number linked to Aadhaar

3. **Verification Failed**
   - Check OTP format (6 digits)
   - Verify request_id is valid
   - Check if OTP expired

4. **Data Not Saved**
   - Check Firestore rules
   - Verify user authentication
   - Check network connectivity

---

## 📝 Next Steps

1. **Immediate Actions:**
   - Create `src/config/sandbox.ts`
   - Create `src/services/sandboxAuth.ts`
   - Create `src/services/sandboxKYC.ts`
   - Update `src/screens/KYCScreen.tsx`

2. **Testing:**
   - Test with Sandbox test environment
   - Verify all error cases
   - Test with real Aadhaar numbers (if available)

3. **Security:**
   - Move credentials to environment variables
   - Review Firestore security rules
   - Implement data encryption

4. **Monitoring:**
   - Set up error tracking
   - Monitor API usage
   - Track KYC completion rates

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Ready for Implementation

