# 🚀 Sandbox KYC Integration - Quick Start Guide

This guide will help you quickly test and verify the Sandbox KYC integration.

---

## ✅ Implementation Status

### Files Created
- ✅ `src/config/sandbox.ts` - Sandbox API configuration
- ✅ `src/services/sandboxAuth.ts` - Authentication service
- ✅ `src/services/sandboxKYC.ts` - KYC service
- ✅ `src/screens/KYCScreen.tsx` - Updated to use Sandbox API

### Files Updated
- ✅ `src/types/index.ts` - Added KYCVerification interface

---

## 🔧 Setup Steps

### Step 1: Verify API Endpoints

**⚠️ IMPORTANT:** The actual Sandbox API endpoints may differ from what's in the code.

1. Check the latest Sandbox API documentation:
   - https://developer.sandbox.co.in/reference/aadhaar-kyc
   - Verify the exact endpoint paths

2. Update `src/config/sandbox.ts` if endpoints differ:
   ```typescript
   AADHAAR_OTP_ENDPOINT: '/kyc/aadhaar/offline/otp', // Verify this
   AADHAAR_VERIFY_ENDPOINT: '/kyc/aadhaar/offline/verify', // Verify this
   ```

### Step 2: Test Authentication

The authentication should work automatically. The service will:
1. Get access token from Sandbox
2. Cache it in AsyncStorage
3. Reuse until expiry

**Test it:**
```typescript
import { getSandboxAccessToken } from './src/services/sandboxAuth';

// Test authentication
const token = await getSandboxAccessToken();
console.log('Access token:', token);
```

### Step 3: Test KYC Flow

1. **Open the app** and navigate to KYC screen
2. **Enter Aadhaar number** (12 digits)
3. **Click "Send OTP"**
   - Should call `generateAadhaarOTP()`
   - Should receive `request_id`
   - OTP should be sent to mobile linked with Aadhaar
4. **Enter OTP** (6 digits)
5. **Click "Verify & Complete"**
   - Should call `verifyAadhaarOTP()`
   - Should receive Aadhaar data
   - Should save to Firestore
   - Should update user profile

---

## 🧪 Testing Checklist

### Authentication
- [ ] Access token is generated successfully
- [ ] Token is cached in AsyncStorage
- [ ] Token is reused until expiry
- [ ] New token is fetched when expired

### OTP Generation
- [ ] Valid Aadhaar number generates OTP
- [ ] Invalid Aadhaar number shows error
- [ ] Network errors are handled gracefully
- [ ] Request ID is stored correctly

### OTP Verification
- [ ] Valid OTP verifies successfully
- [ ] Invalid OTP shows error
- [ ] Expired OTP shows error
- [ ] Aadhaar data is received correctly

### Data Storage
- [ ] KYC data saved to Firestore (`kyc_verifications` collection)
- [ ] User profile updated (`users` collection)
- [ ] `kycVerified` flag set to `true`
- [ ] Reward points added (100 points)

---

## 🐛 Troubleshooting

### Issue: Authentication Failed

**Error:** `Authentication failed: 401 Unauthorized`

**Solutions:**
1. Check API credentials in `src/config/sandbox.ts`
2. Verify API Key and Secret are correct
3. Check if credentials are active in Sandbox Console
4. Verify base URL is correct

### Issue: OTP Not Received

**Error:** `OTP generation failed`

**Solutions:**
1. Verify Aadhaar number format (12 digits)
2. Check if mobile number is linked to Aadhaar
3. Verify Sandbox API status
4. Check Sandbox wallet balance
5. Review API endpoint paths

### Issue: Verification Failed

**Error:** `Invalid or expired OTP`

**Solutions:**
1. Verify OTP format (6 digits)
2. Check if OTP expired (usually 5-10 minutes)
3. Request new OTP if expired
4. Verify `request_id` is correct

### Issue: Data Not Saved

**Error:** Firestore write fails

**Solutions:**
1. Check Firestore security rules
2. Verify user is authenticated
3. Check network connectivity
4. Review Firestore console for errors

---

## 📊 Monitoring

### Check API Usage

1. **Sandbox Console:**
   - Login to https://accounts.sandbox.co.in/
   - Check API usage dashboard
   - Monitor wallet balance

2. **App Logs:**
   - Check console logs for API calls
   - Monitor error messages
   - Track success/failure rates

### Check Firestore Data

1. **Firebase Console:**
   - Navigate to Firestore Database
   - Check `kyc_verifications` collection
   - Verify data structure

2. **User Collection:**
   - Check `users` collection
   - Verify `kycVerified` flag
   - Check `kycVerificationId` reference

---

## 🔒 Security Notes

### Current Implementation
- ⚠️ API credentials are hardcoded in `src/config/sandbox.ts`
- ⚠️ Should be moved to environment variables

### Recommended Changes

1. **Use Environment Variables:**
   ```typescript
   import Constants from 'expo-constants';
   
   export const SANDBOX_CONFIG = {
     API_KEY: Constants.expoConfig?.extra?.sandboxApiKey,
     API_SECRET: Constants.expoConfig?.extra?.sandboxApiSecret,
     // ...
   };
   ```

2. **Create `.env` file:**
   ```
   SANDBOX_API_KEY=key_live_bdc866212c0e40c78fcf4f41acd45bb1
   SANDBOX_API_SECRET=secret_live_943291b891064242852c18425341a379
   ```

3. **Update `app.json`:**
   ```json
   {
     "expo": {
       "extra": {
         "sandboxApiKey": process.env.SANDBOX_API_KEY,
         "sandboxApiSecret": process.env.SANDBOX_API_SECRET
       }
     }
   }
   ```

---

## 📝 Next Steps

1. **Test with Real Aadhaar Numbers**
   - Use test Aadhaar numbers if available
   - Verify end-to-end flow

2. **Update Firestore Rules**
   - Ensure `kyc_verifications` collection has proper rules
   - Users can only read/write their own KYC data

3. **Add Error Handling**
   - Implement retry logic
   - Add user-friendly error messages
   - Handle network failures gracefully

4. **Monitor Costs**
   - Track API usage
   - Monitor Sandbox wallet balance
   - Set up alerts for low balance

---

## 📚 Resources

- **Sandbox API Docs:** https://developer.sandbox.co.in/
- **Aadhaar KYC API:** https://developer.sandbox.co.in/reference/aadhaar-kyc
- **Quickstart Guide:** https://developer.sandbox.co.in/guides/get-started/quickstart
- **Error Handling:** https://developer.sandbox.co.in/guides/get-started/errors

---

## ✅ Verification

After implementation, verify:

1. ✅ Authentication works
2. ✅ OTP generation works
3. ✅ OTP verification works
4. ✅ Data is saved to Firestore
5. ✅ User profile is updated
6. ✅ Error handling works
7. ✅ UI updates correctly

---

**Last Updated:** January 2025  
**Status:** Ready for Testing

