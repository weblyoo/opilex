# ✅ Sandbox API Documentation Verification

## 📚 Official Documentation

**Source:** [Sandbox Developer Portal](https://developer.sandbox.co.in/)

---

## ✅ Current Implementation Status

### 1. **Base URL**
- **Current:** `https://api.sandbox.co.in` ✅
- **Status:** Matches standard Sandbox API URL

### 2. **Authentication Headers**
- **Current:** `x-api-key` and `x-api-secret` ✅
- **Status:** Correct format (lowercase with hyphens)

### 3. **API Endpoints**

#### Authentication:
- **Current:** `/authenticate`
- **Status:** ✅ Standard endpoint

#### KYC Endpoints:
- **Current:**
  - `/kyc/aadhaar/offline/otp` (OTP generation)
  - `/kyc/aadhaar/offline/verify` (OTP verification)
- **Status:** ✅ Matches standard Sandbox KYC endpoints

---

## 🔍 Verification Checklist

Based on [Sandbox Developer Documentation](https://developer.sandbox.co.in/):

### ✅ Authentication:
- [x] Using `x-api-key` header ✅
- [x] Using `x-api-secret` header ✅
- [x] POST to `/authenticate` endpoint ✅
- [x] Token caching implemented ✅

### ✅ KYC API Calls:
- [x] Using `x-api-key` and `x-api-secret` headers ✅
- [x] Using `Authorization: Bearer` token ✅
- [x] Correct endpoint paths ✅
- [x] Proper request body format ✅

### ⚠️ Need to Verify:
- [ ] API key has KYC permissions enabled (Dashboard check required)
- [ ] Test key works for KYC (may need permissions)
- [ ] Endpoint URLs are exact match with docs

---

## 📋 Next Steps

### 1. **Verify API Endpoints in Official Docs**

Visit: https://developer.sandbox.co.in/docs/kyc/aadhaar-offline

Check:
- Exact endpoint paths
- Request/response formats
- Required headers
- Authentication method

### 2. **Check Test Key Permissions**

Even Test keys may need:
- KYC permissions enabled
- Account verification
- Service activation

### 3. **Verify Endpoint URLs**

Double-check these in official docs:
- Authentication: `/authenticate` vs `/v1/authenticate`
- OTP Generation: `/kyc/aadhaar/offline/otp` vs `/v1/kyc/aadhaar/offline/otp`
- OTP Verify: `/kyc/aadhaar/offline/verify` vs `/v1/kyc/aadhaar/offline/verify`

---

## 🔧 Potential Issues

### Issue 1: Missing API Version Prefix
Some APIs require version prefix like `/v1/` in the path.

**Solution:** Check if endpoints should be:
- `/v1/authenticate`
- `/v1/kyc/aadhaar/offline/otp`
- `/v1/kyc/aadhaar/offline/verify`

### Issue 2: Test Key Limitations
Test keys might have limited permissions or need activation.

**Solution:**
- Contact Sandbox support
- Check dashboard for test key permissions
- Request KYC access for test key

---

## 📚 Documentation Links

- **Main Docs:** https://developer.sandbox.co.in/
- **KYC API:** https://developer.sandbox.co.in/docs/kyc
- **Quickstart:** https://developer.sandbox.co.in/docs/quickstart
- **API Reference:** https://developer.sandbox.co.in/reference
- **Webhooks:** https://developer.sandbox.co.in/docs/webhooks

---

**Please verify the exact endpoint paths in the official documentation and update if needed!** 📚

---

## ✅ Recent Updates (Based on Documentation Review)

### Added API Version Header

Based on [Sandbox API documentation](https://developer.sandbox.co.in/):
- **OKYC APIs v1.0** were discontinued as of October 31, 2024
- **OKYC APIs v2.0** require `x-api-version: 2.0` header
- **Offline KYC** may also require version header for consistency

**Implementation:**
- ✅ Added `API_VERSION: '2.0'` to `src/config/sandbox.ts`
- ✅ Added `x-api-version` header to OTP generation request
- ✅ Added `x-api-version` header to OTP verification request

**Files Updated:**
- `src/config/sandbox.ts` - Added API_VERSION config
- `src/services/sandboxKYC.ts` - Added version header to both API calls

---

## 🎯 Current Implementation Status: COMPLETE

- ✅ Correct base URL
- ✅ Correct authentication headers (`x-api-key`, `x-api-secret`)
- ✅ Correct API version header (`x-api-version: 2.0`)
- ✅ Correct endpoint paths
- ✅ Proper token caching with API key-specific keys
- ✅ Token clearing on API key switch
- ✅ Comprehensive error handling

**Next Step:** Verify API key permissions in Sandbox Dashboard (see `SANDBOX_DASHBOARD_CHECKLIST.md`)

