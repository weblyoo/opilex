# ✅ Complete Registration & KYC Setup

## 🎯 Overview

This document outlines the complete registration and Aadhaar KYC integration setup for the Kimson App.

---

## 📋 Complete Flow

### 1. **User Login** → Phone OTP Verification
- User enters phone number
- Receives OTP via Firebase Phone Auth
- Verifies OTP
- User created in Firebase Auth & Firestore

### 2. **User Type Selection** → Registration Screen
- User selects account type: **Electrician** or **Dealer**
- User type saved to Firestore
- Navigate to Registration Details

### 3. **Registration Details** → Personal Information
- User fills in:
  - Full Name
  - Phone Number (pre-filled from login)
  - Email Address
  - Address
  - City
  - State
  - Pincode
  - Referral Code (optional)
- Data saved to Firestore
- Navigate to KYC Screen

### 4. **KYC Verification** → Aadhaar Sandbox API
- User enters 12-digit Aadhaar number
- OTP sent via Sandbox API
- User verifies OTP
- Aadhaar data retrieved from Sandbox API
- KYC data saved to Firestore
- User profile updated with KYC status
- 100 welcome bonus points awarded
- Navigate to Dashboard

---

## 🔧 Implementation Details

### Files Modified:

#### 1. **`src/types/index.ts`**
- Added registration fields to `User` interface:
  - `email?: string`
  - `address?: string`
  - `city?: string`
  - `state?: string`
  - `pincode?: string`
  - `referralCode?: string`
  - `registrationCompleted?: boolean`

#### 2. **`src/screens/RegistrationScreen.tsx`**
- Updated `handleNext()` to:
  - Save user type temporarily
  - Navigate to `RegistrationDetails` screen (instead of Dashboard)
  - Pass `userType` as route parameter

#### 3. **`src/screens/RegistrationDetailsScreen.tsx`**
- Added Firestore imports
- Pre-fills phone number from user data
- `handleContinue()` now:
  - Validates all registration fields
  - Saves complete registration data to Firestore
  - Updates local user profile via `updateUserProfile()`
  - Navigates to KYC screen

#### 4. **`src/contexts/AuthContext.tsx`**
- Updated `updateUserProfile()` to:
  - Save data to Firestore automatically
  - Handle Date objects properly
  - Merge with existing user data
  - Use `serverTimestamp()` for timestamps

#### 5. **`src/screens/KYCScreen.tsx`**
- Already complete with Sandbox API integration
- Navigates to Dashboard after KYC success

---

## 🔐 Sandbox KYC API Integration

### Configuration:
- **API Key:** `key_live_bdc866212c0e40c78fcf4f41acd45bb1`
- **API Secret:** `secret_live_943291b891064242852c18425341a379`
- **Base URL:** `https://api.sandbox.co.in`

### Flow:
1. **Generate OTP:**
   - Endpoint: `/kyc/aadhaar/offline/otp`
   - Input: 12-digit Aadhaar number
   - Output: `request_id`

2. **Verify OTP:**
   - Endpoint: `/kyc/aadhaar/offline/verify`
   - Input: `request_id` + 6-digit OTP
   - Output: Aadhaar data (name, DOB, gender, address, photo, etc.)

### Data Saved:
- KYC verification document in `kyc_verifications/{userId}`
- User profile updated with:
  - `kycVerified: true`
  - `name` (from Aadhaar)
  - `kycVerificationId`
  - `rewardPoints` (+100 welcome bonus)

---

## 📊 Firestore Collections

### 1. **`users` Collection**
```typescript
{
  id: string,
  phoneNumber: string,
  name: string,
  email: string,
  userType: 'electrician' | 'dealer',
  kycVerified: boolean,
  kycVerificationId?: string,
  address: string,
  city: string,
  state: string,
  pincode: string,
  referralCode?: string,
  registrationCompleted: boolean,
  language: 'en' | 'hi' | 'mr' | 'gu',
  rewardPoints: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. **`kyc_verifications` Collection**
```typescript
{
  userId: string,
  aadhaarNumber: string,
  verified: boolean,
  verifiedAt: Timestamp,
  aadhaarData: {
    name: string,
    dob: string,
    gender: string,
    address: { ... },
    photo?: string,
    mobile_number?: string,
    email?: string
  },
  provider: 'sandbox' | 'mock',
  createdAt: Timestamp
}
```

---

## ✅ Testing Checklist

- [x] User can login with phone OTP
- [x] User can select account type (Electrician/Dealer)
- [x] User can fill registration details
- [x] Registration data saved to Firestore
- [x] User can enter Aadhaar number
- [x] OTP sent via Sandbox API
- [x] User can verify OTP
- [x] Aadhaar data retrieved from Sandbox API
- [x] KYC data saved to Firestore
- [x] User profile updated with KYC status
- [x] Welcome bonus points awarded
- [x] Navigation to Dashboard after KYC

---

## 🚀 User Journey

```
Login Screen
    ↓ (Enter phone, send OTP)
OTP Verification Screen
    ↓ (Verify OTP)
Registration Screen
    ↓ (Select user type)
Registration Details Screen
    ↓ (Fill personal info)
KYC Screen
    ↓ (Enter Aadhaar, verify OTP)
Dashboard
    ✅ Complete!
```

---

## 🔧 Next Steps (Optional Enhancements)

1. **Pre-fill Address from Aadhaar:**
   - After KYC verification, pre-fill address fields from Aadhaar data
   - Allow user to edit if needed

2. **Referral Code Validation:**
   - Validate referral codes against database
   - Award referral points to both users

3. **Photo Upload:**
   - Save Aadhaar photo to Firebase Storage
   - Display in user profile

4. **Form Persistence:**
   - Save form data locally while filling
   - Restore if app closes

5. **Progress Indicator:**
   - Show registration progress steps
   - Indicate which step user is on

---

**All registration and KYC setup is now complete! 🎉**

