# ✅ Fixed: Cached Token Issue When Switching API Keys

## 🔍 Problem

After switching from Live API key to Test API key, the app was still using a cached access token from the old Live key, causing "Insufficient privilege" errors.

**Root Cause:** Access tokens were cached with the same storage key regardless of which API key was used.

---

## ✅ Solution Applied

### 1. **API Key-Specific Token Caching**

Updated `src/services/sandboxAuth.ts` to include API key identifier in cache keys:

**Before:**
```typescript
STORAGE_KEYS.ACCESS_TOKEN = '@sandbox_access_token'
// Same key for all API keys
```

**After:**
```typescript
const apiKeyIdentifier = SANDBOX_CONFIG.API_KEY.substring(0, 20);
const tokenCacheKey = `${STORAGE_KEYS.ACCESS_TOKEN}_${apiKeyIdentifier}`;
// Different cache key for each API key
```

### 2. **Clear All Tokens on KYC Start**

Updated `src/screens/KYCScreen.tsx` to clear all cached tokens when starting KYC:

```typescript
// Clear cached token when starting KYC
await clearAllSandboxTokens();
```

### 3. **New Function: `clearAllSandboxTokens()`**

Added function to clear all Sandbox tokens (useful when switching keys):

```typescript
export async function clearAllSandboxTokens(): Promise<void> {
  // Clears all token cache keys
}
```

---

## 🔧 Changes Made

### `src/services/sandboxAuth.ts`:
1. ✅ Token cache keys now include API key identifier
2. ✅ Different API keys use different cache keys
3. ✅ Added `clearAllSandboxTokens()` function
4. ✅ Updated `getSandboxAccessToken()` to use key-specific cache
5. ✅ Updated `clearSandboxToken()` to clear key-specific cache
6. ✅ Updated `hasValidToken()` to check key-specific cache

### `src/screens/KYCScreen.tsx`:
1. ✅ Clears all cached tokens before generating OTP
2. ✅ Ensures fresh token with current API key

---

## 🎯 How It Works Now

1. **When API Key Changes:**
   - Old token cached with old key identifier
   - New token will be cached with new key identifier
   - No conflict between different keys

2. **When Starting KYC:**
   - All old tokens are cleared
   - Fresh token requested with current API key
   - Ensures correct permissions

3. **Token Caching:**
   - Each API key has its own cache
   - Tokens don't interfere with each other
   - Switching keys automatically uses correct cache

---

## ✅ Next Steps

1. **Reload the app** to clear old cached tokens
2. **Try KYC again** - should work with Test API key
3. **Test the flow:**
   - Enter Aadhaar number
   - Send OTP (should work now!)
   - Verify OTP

---

## 🔄 Switching Between Test and Live Keys

When switching API keys:

1. **Update `src/config/sandbox.ts`** with new key
2. **Reload app** (tokens will be cleared automatically)
3. **Test KYC** - new token will be requested with new key

---

**The cached token issue is now fixed! Try KYC again - it should work with the Test API key.** ✅

