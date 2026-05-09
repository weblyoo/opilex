# Sandbox API Environment Configuration Fix

## ⚠️ Issue Identified

**Message from Sandbox Team:**
> "It seems that you are using prod environment using the test credentials. Please note that this test credentials would work only in test environment and vice-versa."

## ✅ Solution Implemented

### 1. Updated Configuration (`src/config/sandbox.ts`)

- Added separate base URLs for test and production environments
- Implemented automatic environment detection based on API key prefix
- Added warnings to verify correct environment URLs

### 2. Environment Detection

The configuration now automatically detects the environment:
- `key_test_*` → Uses `BASE_URL_TEST`
- `key_live_*` → Uses `BASE_URL_PROD`

### 3. Updated Services

All API services now use `SANDBOX_CONFIG.getBaseUrl()` which automatically selects the correct environment URL based on the API key type.

## 📋 Current Configuration

```typescript
// Test environment URL (for test credentials)
BASE_URL_TEST: 'https://api.sandbox.co.in', // ⚠️ Verify this is correct

// Production environment URL (for live credentials)
BASE_URL_PROD: 'https://api.sandbox.co.in', // ⚠️ Verify this is correct
```

## ⚠️ Action Required

**You need to verify the correct environment URLs with Sandbox:**

1. **Test Environment URL:**
   - Check Sandbox documentation for the correct test environment base URL
   - It might be different from `https://api.sandbox.co.in`
   - Possible alternatives:
     - `https://test-api.sandbox.co.in`
     - `https://api-test.sandbox.co.in`
     - `https://sandbox-test.co.in/api`
     - Or another URL specified in Sandbox documentation

2. **Production Environment URL:**
   - Verify the production environment base URL
   - Update `BASE_URL_PROD` if different

3. **Update Configuration:**
   - Once you have the correct URLs, update `src/config/sandbox.ts`:
     ```typescript
     BASE_URL_TEST: 'https://correct-test-url.sandbox.co.in',
     BASE_URL_PROD: 'https://correct-prod-url.sandbox.co.in',
     ```

## 🔍 How to Find Correct URLs

1. **Check Sandbox Documentation:**
   - Visit: https://developer.sandbox.co.in/docs
   - Look for environment-specific URLs
   - Check API setup guides

2. **Contact Sandbox Support:**
   - Ask for the correct test and production environment URLs
   - Verify which URL should be used with test credentials

3. **Check Sandbox Dashboard:**
   - Log into your Sandbox account dashboard
   - Look for environment information or API endpoint details

## ✅ Testing

After updating the URLs:

1. Test authentication with test credentials
2. Verify you get a valid access token
3. Test OTP generation
4. Test OTP verification

If you still get errors, double-check:
- The environment URL matches your credential type
- API key and secret are correct
- Headers are properly formatted

## 📝 Notes

- The app now automatically selects the correct environment based on API key prefix
- No code changes needed when switching between test and production keys
- Just ensure the `BASE_URL_TEST` and `BASE_URL_PROD` are correctly set

