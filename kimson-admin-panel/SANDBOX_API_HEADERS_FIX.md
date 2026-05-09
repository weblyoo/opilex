# ✅ Sandbox API Headers Fix

## 🔧 Issue Fixed

**Error:** `missing required request parameters: [x-api-secret, x-api-key]`

**Root Cause:** Sandbox API requires `x-api-key` and `x-api-secret` headers (lowercase 'x') on all API requests, not just authentication.

---

## ✅ Changes Made

### 1. **Fixed Authentication Headers** (`src/services/sandboxAuth.ts`)
- Changed `API-Key` → `x-api-key`
- Changed `API-Secret` → `x-api-secret`

### 2. **Added Headers to KYC Endpoints** (`src/services/sandboxKYC.ts`)

#### OTP Generation Endpoint:
- Added `x-api-key` header
- Added `x-api-secret` header
- Kept `Authorization: Bearer ${accessToken}` (if required by API)

#### OTP Verification Endpoint:
- Added `x-api-key` header
- Added `x-api-secret` header
- Kept `Authorization: Bearer ${accessToken}` (if required by API)

---

## 📋 Updated Request Headers

### Authentication Request:
```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': SANDBOX_CONFIG.API_KEY,
  'x-api-secret': SANDBOX_CONFIG.API_SECRET,
}
```

### KYC OTP Generation Request:
```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': SANDBOX_CONFIG.API_KEY,
  'x-api-secret': SANDBOX_CONFIG.API_SECRET,
  'Authorization': `Bearer ${accessToken}`,
}
```

### KYC OTP Verification Request:
```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': SANDBOX_CONFIG.API_KEY,
  'x-api-secret': SANDBOX_CONFIG.API_SECRET,
  'Authorization': `Bearer ${accessToken}`,
}
```

---

## 🎯 What Changed

**Before:**
- Authentication used `API-Key` and `API-Secret` (wrong header names)
- KYC endpoints only had `Authorization: Bearer` token (missing API credentials)

**After:**
- All requests use `x-api-key` and `x-api-secret` headers (correct format)
- KYC endpoints include both API credentials AND Bearer token

---

## ✅ Testing

The error `missing required request parameters: [x-api-secret, x-api-key]` should now be resolved.

Test the flow:
1. Enter Aadhaar number
2. Click "Send OTP"
3. Should successfully send OTP request to Sandbox API ✅

---

**All headers have been fixed! The Aadhaar KYC should work now.** 🎉

