# 🔧 Sandbox API Setup Guide

## 📋 Your Current API Keys

Based on your Sandbox dashboard:

### ✅ Live Key (Active)
- **API Key:** `key_live_bdc866212c0e40c78fcf4f41acd45bb1`
- **Status:** Active
- **Generated:** 13th Nov, 2025
- **Usage:** Production environment, consumes quota and incurs wallet charges

### 🧪 Test Key
- **Usage:** Test API integration, does NOT consume quota or wallet
- **Best for:** Development and testing

---

## 🔍 Steps to Fix "Insufficient Privilege" Error

### Step 1: Check API Key Permissions

1. **Go to Sandbox Dashboard:**
   - Visit: https://dashboard.sandbox.co.in
   - Log in to your account

2. **Check API Key Permissions:**
   - Find your API key: `key_live_bdc866212c0e40c78fcf4f41acd45bb1`
   - Look for "Permissions" or "Scopes" section
   - Ensure **KYC/Aadhaar verification** permissions are **enabled**

3. **If Permissions Missing:**
   - Enable KYC permissions for the API key
   - Or generate a new API key with KYC permissions enabled
   - Save the new API key and secret

### Step 2: Check Subscription Status

1. **In Sandbox Dashboard:**
   - Go to "Subscription" or "Billing" section
   - Verify subscription is **active** (not expired)
   - Check if KYC/Aadhaar service is included in your plan

2. **If Subscription Expired:**
   - Renew your subscription
   - Or upgrade to a plan that includes KYC services

### Step 3: Check Account Credits/Wallet

1. **In Sandbox Dashboard:**
   - Go to "Wallet" or "Credits" section
   - Check available balance
   - Verify you have sufficient credits for KYC API calls

2. **If Credits Low:**
   - Add credits to your wallet
   - Check pricing for Aadhaar KYC API calls

### Step 4: Use Test Key for Development

**For testing/development, you should use the Test Key instead:**

1. **Get Test Key from Dashboard:**
   - Copy the Test API Key
   - Copy the Test API Secret

2. **Update Configuration:**
   - Update `src/config/sandbox.ts` with test credentials
   - Test your integration first
   - Switch to Live key only when ready for production

---

## 🔧 Quick Fix: Switch to Test Key

### Option 1: Use Test Key for Development

1. **Get Test Credentials from Dashboard:**
   - Copy Test API Key
   - Copy Test API Secret

2. **Update `src/config/sandbox.ts`:**
   ```typescript
   export const SANDBOX_CONFIG = {
     // Use Test Key for development (no charges)
     API_KEY: 'your_test_api_key_here',
     API_SECRET: 'your_test_api_secret_here',
     
     // ... rest of config
   };
   ```

3. **Test KYC with Test Key:**
   - Test keys don't consume quota
   - Perfect for development and testing
   - Switch to Live key only when ready

### Option 2: Enable Permissions on Live Key

1. **In Sandbox Dashboard:**
   - Find your Live API key
   - Click "Edit" or "Manage"
   - Enable "KYC" or "Aadhaar Verification" permissions
   - Save changes

2. **Verify:**
   - Check if subscription includes KYC service
   - Ensure account has credits

---

## 📝 What to Check in Dashboard

### ✅ Checklist:

- [ ] **API Key Permissions:**
  - KYC/Aadhaar verification enabled?
  
- [ ] **Subscription Status:**
  - Active subscription?
  - KYC service included?
  
- [ ] **Account Credits:**
  - Sufficient balance?
  - Wallet funded?
  
- [ ] **Account Status:**
  - Account active?
  - No restrictions?

---

## 🧪 Testing Recommendations

1. **Start with Test Key:**
   - Use test credentials for development
   - No charges or quota consumption
   - Test all functionality first

2. **Switch to Live Key:**
   - Only after testing is complete
   - When ready for production
   - Ensure permissions are enabled

3. **Monitor Usage:**
   - Check API call logs
   - Monitor credit consumption
   - Track any errors

---

## 🆘 If Issues Persist

1. **Contact Sandbox Support:**
   - Reach out through dashboard
   - Provide your API key details
   - Request KYC permissions to be enabled

2. **Check Documentation:**
   - Review Sandbox API docs
   - Verify endpoint URLs
   - Check for API changes

3. **Verify Account Type:**
   - Ensure your account type supports KYC
   - Check if any account limitations

---

**Next Steps: Check your Sandbox dashboard to enable KYC permissions or use Test Key for development!** ✅

